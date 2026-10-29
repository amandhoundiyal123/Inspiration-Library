import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import {
  initDatabase,
  findUserByEmail,
  findUserById,
  createUser,
  getReferences,
  getReferenceById,
  createReference,
  updateReference,
  toggleFavorite,
  softDeleteReference,
  restoreReference,
  permanentDeleteReference,
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getTags,
  deleteTag,
  upsertDesignAnalysis,
  updateDesignAnalysis,
  getDistinctStyles,
  getLibraryCounts,
  exportUserData,
  importUserData
} from './src/server/db';
import { scrapeUrlMetadata } from './src/server/urlScraper';
import { analyzeDesignReference, adaptPromptForTarget } from './src/server/aiAnalysis';
import { streamZipBackup } from './src/server/backup';

const app = express();
const PORT = Number(process.env.PORT || process.env.DEFAULT_APP_PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'designvault-private-secret-key-2026';

// Storage directories
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Initialize database
initDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, SVG, and GIF images are allowed.'));
    }
  }
});

// Authentication middleware
interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; displayName: string };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const defaultUser = findUserByEmail('adhoundiyal20@gmail.com');
  if (defaultUser) {
    req.user = { id: defaultUser.id, email: defaultUser.email, displayName: defaultUser.display_name };
    return next();
  }
  return res.status(500).json({ error: 'Personal archive library account could not be found' });
}

function paramStr(val: string | string[] | undefined): string {
  if (!val) return '';
  return Array.isArray(val) ? val[0] : val;
}

// ---------------------------------------------------------------------------
// Static Image Serving with security
// ---------------------------------------------------------------------------
app.get('/api/uploads/:filename', (req, res) => {
  const filename = path.basename(paramStr(req.params.filename));
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Image file not found' });
  }

  res.sendFile(filePath);
});

// ---------------------------------------------------------------------------
// Auth Routes
// ---------------------------------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name are required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    const hash = bcrypt.hashSync(password, 10);
    const user = createUser(cleanEmail, hash, displayName.trim());
    const token = jwt.sign(
      { id: user.id, email: user.email, displayName: user.displayName },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ token, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create account' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = findUserByEmail(cleanEmail);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const userData = { id: user.id, email: user.email, displayName: user.display_name };
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: userData });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = findUserById(req.user!.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

app.post('/api/auth/demo', (_req, res) => {
  const user = findUserByEmail('adhoundiyal20@gmail.com');
  if (!user) return res.status(404).json({ error: 'Personal profile not found' });
  const userData = { id: user.id, email: user.email, displayName: user.display_name };
  const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: userData });
});

// ---------------------------------------------------------------------------
// URL Metadata Scraping (SSRF Protected)
// ---------------------------------------------------------------------------
app.post('/api/scrape-url', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }
    const metadata = await scrapeUrlMetadata(url);
    res.json(metadata);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Could not retrieve URL metadata' });
  }
});

// ---------------------------------------------------------------------------
// References API
// ---------------------------------------------------------------------------
app.get('/api/references', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { search, collectionId, style, tag, typeFilter, onlyFavorites, sortBy, isTrash } = req.query;

    const references = getReferences({
      userId,
      search: typeof search === 'string' ? search : undefined,
      collectionId: typeof collectionId === 'string' ? collectionId : undefined,
      style: typeof style === 'string' ? style : undefined,
      tag: typeof tag === 'string' ? tag : undefined,
      typeFilter: (typeFilter as any) || 'all',
      onlyFavorites: onlyFavorites === 'true',
      sortBy: (sortBy as any) || 'recent',
      isTrash: isTrash === 'true'
    });

    res.json(references);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch references' });
  }
});

app.get('/api/references/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const ref = getReferenceById(paramStr(req.params.id), userId);
    if (!ref) return res.status(404).json({ error: 'Reference not found' });
    res.json(ref);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/references', authenticateToken, upload.single('image'), (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { title, sourceUrl, sourceDomain, personalNotes, isFavorite } = req.body;

    let collectionIds: string[] = [];
    if (req.body.collectionIds) {
      try {
        collectionIds = typeof req.body.collectionIds === 'string' 
          ? JSON.parse(req.body.collectionIds) 
          : req.body.collectionIds;
      } catch {
        collectionIds = [];
      }
    }

    let tags: string[] = [];
    if (req.body.tags) {
      try {
        tags = typeof req.body.tags === 'string' 
          ? JSON.parse(req.body.tags) 
          : req.body.tags;
      } catch {
        tags = [];
      }
    }

    let domain = sourceDomain;
    if (!domain && sourceUrl) {
      try {
        const u = new URL(sourceUrl.startsWith('http') ? sourceUrl : 'https://' + sourceUrl);
        domain = u.hostname;
      } catch {}
    }

    const created = createReference({
      userId,
      title,
      sourceUrl,
      sourceDomain: domain,
      imageStoragePath: req.file ? req.file.filename : undefined,
      originalFilename: req.file ? req.file.originalname : undefined,
      mimeType: req.file ? req.file.mimetype : undefined,
      fileSize: req.file ? req.file.size : undefined,
      personalNotes,
      isFavorite: isFavorite === 'true' || isFavorite === true,
      collectionIds,
      tags
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save reference' });
  }
});

app.put('/api/references/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { title, sourceUrl, sourceDomain, personalNotes, isFavorite, collectionIds, tags } = req.body;

    const updated = updateReference(paramStr(req.params.id), userId, {
      title,
      sourceUrl,
      sourceDomain,
      personalNotes,
      isFavorite,
      collectionIds,
      tags
    });

    if (!updated) return res.status(404).json({ error: 'Reference not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/references/:id/favorite', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const isFavorite = toggleFavorite(paramStr(req.params.id), userId);
    res.json({ isFavorite });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/references/:id/trash', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const success = softDeleteReference(paramStr(req.params.id), userId);
    if (!success) return res.status(404).json({ error: 'Reference not found' });
    res.json({ success: true, message: 'Moved to trash' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/references/:id/restore', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const success = restoreReference(paramStr(req.params.id), userId);
    if (!success) return res.status(404).json({ error: 'Reference not found' });
    res.json({ success: true, message: 'Restored from trash' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/references/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const success = permanentDeleteReference(paramStr(req.params.id), userId);
    if (!success) return res.status(404).json({ error: 'Reference not found' });
    res.json({ success: true, message: 'Reference permanently deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// AI Design Intelligence Routes
// ---------------------------------------------------------------------------
app.post('/api/references/:id/analyze', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const ref = getReferenceById(paramStr(req.params.id), userId);
    if (!ref) return res.status(404).json({ error: 'Reference not found' });

    // Run Gemini Vision analysis
    const analysisJson = await analyzeDesignReference({
      imageStoragePath: ref.imageStoragePath,
      sourceUrl: ref.sourceUrl,
      title: ref.title,
      personalNotes: ref.personalNotes
    });

    const analysis = upsertDesignAnalysis({
      referenceId: ref.id,
      userId,
      modelIdentifier: 'gemini-3.8-flash',
      analysisJson,
      creativeBrief: analysisJson.creativeBrief || '',
      reusablePrompt: analysisJson.reusablePrompt || ''
    });

    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI analysis failed' });
  }
});

app.put('/api/references/:id/analysis', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { creativeBrief, reusablePrompt, primaryStyle, summary } = req.body;
    const updated = updateDesignAnalysis(paramStr(req.params.id), userId, {
      creativeBrief,
      reusablePrompt,
      primaryStyle,
      summary
    });
    if (!updated) return res.status(404).json({ error: 'Analysis not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/references/:id/adapt-prompt', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { targetProject } = req.body;
    if (!targetProject || typeof targetProject !== 'string') {
      return res.status(400).json({ error: 'Target project description is required' });
    }

    const ref = getReferenceById(paramStr(req.params.id), userId);
    if (!ref || !ref.analysis) {
      return res.status(404).json({ error: 'Reference or design analysis not found' });
    }

    const adaptedPrompt = await adaptPromptForTarget(ref.analysis, targetProject.trim());
    res.json({ adaptedPrompt });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to adapt prompt' });
  }
});

// ---------------------------------------------------------------------------
// Collections & Tags API
// ---------------------------------------------------------------------------
app.get('/api/collections', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const collections = getCollections(userId);
    res.json(collections);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/collections', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Collection name is required' });
    const col = createCollection(userId, name, description);
    res.status(201).json(col);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/collections/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Collection name is required' });
    const col = updateCollection(paramStr(req.params.id), userId, name, description);
    if (!col) return res.status(404).json({ error: 'Collection not found' });
    res.json(col);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/collections/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const success = deleteCollection(paramStr(req.params.id), userId);
    if (!success) return res.status(404).json({ error: 'Collection not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tags', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const tags = getTags(userId);
    res.json(tags);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tags/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const success = deleteTag(paramStr(req.params.id), userId);
    if (!success) return res.status(404).json({ error: 'Tag not found' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Design Styles Overview & Counts
// ---------------------------------------------------------------------------
app.get('/api/styles', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const styles = getDistinctStyles(userId);
    res.json(styles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/counts', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const counts = getLibraryCounts(userId);
    res.json(counts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Backup & Export / Restore API
// ---------------------------------------------------------------------------
app.get('/api/backup/export-json', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const data = exportUserData(userId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="designvault-export-${new Date().toISOString().slice(0, 10)}.json"`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/backup/export-zip', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    await streamZipBackup(userId, res);
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post('/api/backup/restore', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const result = importUserData(userId, req.body);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Restoration failed' });
  }
});

// ---------------------------------------------------------------------------
// System Status & Health
// ---------------------------------------------------------------------------
app.get('/api/system/status', authenticateToken, (_req, res) => {
  let fileCount = 0;
  let totalBytes = 0;
  if (fs.existsSync(UPLOADS_DIR)) {
    const files = fs.readdirSync(UPLOADS_DIR);
    fileCount = files.length;
    for (const file of files) {
      try {
        const stats = fs.statSync(path.join(UPLOADS_DIR, file));
        totalBytes += stats.size;
      } catch {}
    }
  }

  res.json({
    status: 'ok',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    aiModel: 'gemini-3.8-flash',
    storage: {
      type: 'Local SQLite & Secure File Store',
      filesCount: fileCount,
      totalBytes,
      totalFormatted: (totalBytes / (1024 * 1024)).toFixed(2) + ' MB'
    }
  });
});

// ---------------------------------------------------------------------------
// Start Server with Vite Middleware in Dev or Static Serving in Prod
// ---------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DesignVault running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
