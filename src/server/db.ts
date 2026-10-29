import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { DesignReference, Collection, Tag, DesignAnalysis } from '../types';

// Ensure data and uploads directories exist
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'designvault.sqlite');
export const db = new Database(DB_PATH);

// Enable WAL mode and foreign keys for high performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS references_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      source_url TEXT,
      source_domain TEXT,
      image_storage_path TEXT,
      original_filename TEXT,
      mime_type TEXT,
      file_size INTEGER,
      personal_notes TEXT,
      is_favorite INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_references_user_del ON references_items(user_id, deleted_at);
    CREATE INDEX IF NOT EXISTS idx_references_fav ON references_items(user_id, is_favorite);
    CREATE INDEX IF NOT EXISTS idx_references_created ON references_items(user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);

    CREATE TABLE IF NOT EXISTS reference_collections (
      reference_id TEXT NOT NULL,
      collection_id TEXT NOT NULL,
      PRIMARY KEY (reference_id, collection_id),
      FOREIGN KEY(reference_id) REFERENCES references_items(id) ON DELETE CASCADE,
      FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, name),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id);

    CREATE TABLE IF NOT EXISTS reference_tags (
      reference_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      tag_origin TEXT DEFAULT 'user',
      PRIMARY KEY (reference_id, tag_id),
      FOREIGN KEY(reference_id) REFERENCES references_items(id) ON DELETE CASCADE,
      FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS design_analyses (
      id TEXT PRIMARY KEY,
      reference_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      model_identifier TEXT NOT NULL,
      analysis_json TEXT NOT NULL,
      creative_brief TEXT NOT NULL,
      reusable_prompt TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(reference_id) REFERENCES references_items(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_analyses_user ON design_analyses(user_id);
  `);

  // Ensure default personal demo account exists so app works seamlessly
  seedPersonalAccount();
}

function seedPersonalAccount() {
  const defaultEmail = 'adhoundiyal20@gmail.com';
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(defaultEmail) as { id: string } | undefined;
  
  if (!existing) {
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    const hash = bcrypt.hashSync('designvault123', 10);

    const insertUser = db.prepare('INSERT INTO users (id, email, password_hash, display_name, created_at) VALUES (?, ?, ?, ?, ?)');
    const insertProfile = db.prepare('INSERT INTO profiles (id, display_name, created_at) VALUES (?, ?, ?)');

    db.transaction(() => {
      insertUser.run(userId, defaultEmail, hash, 'Ashutosh', now);
      insertProfile.run(userId, 'Ashutosh', now);

      // Seed initial collections
      const c1Id = crypto.randomUUID();
      const c2Id = crypto.randomUUID();
      const c3Id = crypto.randomUUID();
      const insertCol = db.prepare('INSERT INTO collections (id, user_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
      insertCol.run(c1Id, userId, 'Editorial & Typography', 'High-contrast editorial layouts, Swiss grids, and bespoke serif typography.', now, now);
      insertCol.run(c2Id, userId, 'Dark Mode & Neo-Gothic', 'Atmospheric charcoal palettes, tactile surfaces, and subtle grain textures.', now, now);
      insertCol.run(c3Id, userId, 'Developer Portfolios', 'Creative developer workspaces and experimental interaction models.', now, now);

      // Seed high-standard reference with authentic Design DNA analysis
      const refId = crypto.randomUUID();
      const insertRef = db.prepare(`
        INSERT INTO references_items (id, user_id, title, source_url, source_domain, image_storage_path, original_filename, mime_type, file_size, personal_notes, is_favorite, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertRef.run(
        refId,
        userId,
        'Basement Studio Minimal Dark Monolith',
        'https://basement.studio',
        'basement.studio',
        'sample-dark-monolith.svg',
        'basement-studio-hero.svg',
        'image/svg+xml',
        4096,
        'Striking monochromatic charcoal palette, extreme typographic contrast, and restrained editorial layout. Great reference for developer tools.',
        1,
        now,
        now
      );

      // Create sample SVG image file if not exists
      const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
        <rect width="1200" height="800" fill="#111111"/>
        <rect x="40" y="40" width="1120" height="720" fill="#181818" rx="8" stroke="#282828" stroke-width="1.5"/>
        <text x="80" y="140" fill="#A19F9A" font-family="sans-serif" font-size="14" font-weight="600" letter-spacing="3">DESIGN SYSTEM REFERENCE / 01</text>
        <text x="80" y="240" fill="#F2F0EC" font-family="sans-serif" font-size="56" font-weight="700" letter-spacing="-1.5">RESTRAINED MONOLITH</text>
        <text x="80" y="300" fill="#A19F9A" font-family="sans-serif" font-size="20" font-weight="400">Tactile dark surfaces, strict editorial hierarchy, and purposeful white space.</text>
        <line x1="80" y1="360" x2="1120" y2="360" stroke="#303030" stroke-width="1"/>
        <rect x="80" y="420" width="180" height="220" fill="#202020" rx="4" stroke="#333333"/>
        <rect x="290" y="420" width="180" height="220" fill="#202020" rx="4" stroke="#333333"/>
        <rect x="500" y="420" width="180" height="220" fill="#202020" rx="4" stroke="#333333"/>
        <text x="100" y="460" fill="#F2F0EC" font-family="monospace" font-size="13">#111111</text>
        <text x="100" y="485" fill="#777777" font-family="sans-serif" font-size="12">Main Canvas</text>
        <text x="310" y="460" fill="#F2F0EC" font-family="monospace" font-size="13">#181818</text>
        <text x="310" y="485" fill="#777777" font-family="sans-serif" font-size="12">Surface Layer</text>
        <text x="520" y="460" fill="#F2F0EC" font-family="monospace" font-size="13">#F2F0EC</text>
        <text x="520" y="485" fill="#777777" font-family="sans-serif" font-size="12">Primary Ivory</text>
        <circle cx="1060" cy="120" r="8" fill="#303030"/>
        <circle cx="1090" cy="120" r="8" fill="#404040"/>
      </svg>`;
      const samplePath = path.join(UPLOADS_DIR, 'sample-dark-monolith.svg');
      if (!fs.existsSync(samplePath)) {
        fs.writeFileSync(samplePath, sampleSvg, 'utf8');
      }

      // Link to collections
      const linkCol = db.prepare('INSERT INTO reference_collections (reference_id, collection_id) VALUES (?, ?)');
      linkCol.run(refId, c1Id);
      linkCol.run(refId, c2Id);

      // Seed tags
      const insertTag = db.prepare('INSERT INTO tags (id, user_id, name, created_at) VALUES (?, ?, ?, ?)');
      const linkTag = db.prepare('INSERT INTO reference_tags (reference_id, tag_id, tag_origin) VALUES (?, ?, ?)');
      
      const tagList = ['Neo-Gothic', 'Editorial Grid', 'Dark Mode', 'Tactile UI', 'Swiss Typography'];
      for (const tName of tagList) {
        const tId = crypto.randomUUID();
        insertTag.run(tId, userId, tName, now);
        linkTag.run(refId, tId, 'ai');
      }

      // Seed Design DNA analysis
      const analysisObj = {
        summary: "A masterclass in restrained dark editorial web design, pairing deep charcoal backgrounds with ivory high-contrast typography, crisp architectural dividing lines, and tactile modular containers.",
        primaryStyle: "Neo-Gothic Editorial",
        secondaryStyles: ["Swiss Grid", "Brutalist Minimalism", "Tactile Dark Mode"],
        visualMood: "Disciplined, enigmatic, razor-sharp, and highly engineered.",
        associations: ["Independent design studios", "High-end developer infrastructure", "Architectural monographs"],
        keywords: ["Charcoal canvas", "Swiss typography", "Hairline dividers", "Tactile cards", "Micro-caps metadata", "High contrast"],
        typography: {
          classification: "Contemporary Grotesque & Monospaced Metadata",
          characteristics: "Tight tracking on large display headings, paired with widely tracked uppercase monospaced labels for technical cadence.",
          hierarchyNotes: "Extreme size delta between display headers (56px) and body metadata (12px), creating immediate visual tension without clutter."
        },
        colorPalette: [
          { hex: "#111111", name: "Deep Charcoal Canvas", role: "Main background" },
          { hex: "#181818", name: "Secondary Surface", role: "Card background" },
          { hex: "#202020", name: "Elevated Slab", role: "Interactive containers" },
          { hex: "#303030", name: "Architectural Border", role: "Hairline rules and borders" },
          { hex: "#F2F0EC", name: "Warm Ivory", role: "Primary display text" },
          { hex: "#A19F9A", name: "Subdued Ash", role: "Secondary text & metadata" }
        ],
        layout: {
          gridType: "Asymmetrical 12-column Swiss modular grid",
          density: "Generous macro-whitespace with high micro-density inside cards",
          whitespace: "Expansive lateral margins giving hero elements maximum gravitas",
          compositionNotes: "Strict horizontal dividing rules frame content blocks like architectural plans."
        },
        shapesAndTextures: ["Subtle 4px card radiuses", "Hairline 1px borders", "Ultra-fine matte surface texture", "No glowing gradients"],
        interactionObservations: "Visual focus relies on crisp border contrast transitions and minimal opacity shifts on hover rather than bouncy animations.",
        whyItWorks: "Eliminates all decorative SaaS cliches (no neon dropshadows, no floating 3D spheres). Confidence is expressed purely through typographic precision and disciplined contrast.",
        potentialUses: ["Developer portfolio", "API tooling docs", "Creative agency index", "Design engineering workspace"],
        implementationIdeas: [
          "Use Tailwind neutral dark shades (#111111, #181818, #303030) with custom CSS variables.",
          "Pair Geist or Inter Display for headlines with JetBrains Mono for metadata chips.",
          "Use 1px borders with border-[#303030] for structural framing."
        ],
        creativeBrief: "Direction: Neo-Gothic Editorial Dark Workspace.\nObjective: Build an interface that feels like precision physical instruments rather than marketing software.\nKey Rules: Use deep charcoal (#111111), warm ivory text (#F2F0EC), hairline 1px borders (#303030), zero saturated gradient slop, and strict typographic hierarchy with monospaced metadata counters.",
        reusablePrompt: "Build a web application with a Neo-Gothic Editorial design language. Palette: Background #111111, cards #181818 with 1px #303030 borders, text #F2F0EC, secondary text #A19F9A. Typography: High-contrast sans-serif display headings with tight tracking, paired with JetBrains Mono uppercase metadata (11px, letter-spacing 0.1em). Layout: Swiss grid with generous whitespace, crisp hairline borders, and zero decorative neon glows or pill badges.",
        confidenceOrUncertainty: "High confidence in visual style, typography, and palette based on visible static layout evidence."
      };

      const insertAnalysis = db.prepare(`
        INSERT INTO design_analyses (id, reference_id, user_id, model_identifier, analysis_json, creative_brief, reusable_prompt, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertAnalysis.run(
        crypto.randomUUID(),
        refId,
        userId,
        'gemini-3.8-flash',
        JSON.stringify(analysisObj),
        analysisObj.creativeBrief,
        analysisObj.reusablePrompt,
        now,
        now
      );
    })();
  }
}

// User & Profile queries
export function findUserByEmail(email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
}

export function findUserById(id: string) {
  return db.prepare('SELECT id, email, display_name as displayName, created_at as createdAt FROM users WHERE id = ?').get(id) as any;
}

export function createUser(email: string, passwordHash: string, displayName: string) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.transaction(() => {
    db.prepare('INSERT INTO users (id, email, password_hash, display_name, created_at) VALUES (?, ?, ?, ?, ?)').run(id, email, passwordHash, displayName, now);
    db.prepare('INSERT INTO profiles (id, display_name, created_at) VALUES (?, ?, ?)').run(id, displayName, now);
  })();
  return { id, email, displayName, createdAt: now };
}

// References queries
export interface QueryReferencesOptions {
  userId: string;
  search?: string;
  collectionId?: string;
  style?: string;
  tag?: string;
  typeFilter?: 'all' | 'image' | 'url' | 'both';
  onlyFavorites?: boolean;
  sortBy?: 'recent' | 'oldest' | 'updated' | 'title';
  isTrash?: boolean;
}

export function getReferences(options: QueryReferencesOptions): DesignReference[] {
  let query = `
    SELECT 
      r.id, r.user_id as userId, r.title, r.source_url as sourceUrl, r.source_domain as sourceDomain,
      r.image_storage_path as imageStoragePath, r.original_filename as originalFilename,
      r.mime_type as mimeType, r.file_size as fileSize, r.personal_notes as personalNotes,
      r.is_favorite as isFavorite, r.created_at as createdAt, r.updated_at as updatedAt, r.deleted_at as deletedAt
    FROM references_items r
    WHERE r.user_id = @userId
  `;

  if (options.isTrash) {
    query += ` AND r.deleted_at IS NOT NULL`;
  } else {
    query += ` AND r.deleted_at IS NULL`;
  }

  if (options.onlyFavorites) {
    query += ` AND r.is_favorite = 1`;
  }

  if (options.typeFilter === 'image') {
    query += ` AND r.image_storage_path IS NOT NULL AND (r.source_url IS NULL OR r.source_url = '')`;
  } else if (options.typeFilter === 'url') {
    query += ` AND (r.image_storage_path IS NULL OR r.image_storage_path = '') AND r.source_url IS NOT NULL`;
  } else if (options.typeFilter === 'both') {
    query += ` AND r.image_storage_path IS NOT NULL AND r.source_url IS NOT NULL AND r.source_url != ''`;
  }

  if (options.collectionId) {
    query += ` AND r.id IN (SELECT reference_id FROM reference_collections WHERE collection_id = @collectionId)`;
  }

  if (options.tag) {
    query += ` AND r.id IN (
      SELECT rt.reference_id FROM reference_tags rt 
      JOIN tags t ON t.id = rt.tag_id 
      WHERE LOWER(t.name) = LOWER(@tag)
    )`;
  }

  if (options.style) {
    query += ` AND r.id IN (
      SELECT da.reference_id FROM design_analyses da 
      WHERE LOWER(da.analysis_json) LIKE '%' || LOWER(@style) || '%'
    )`;
  }

  if (options.search && options.search.trim() !== '') {
    query += ` AND (
      LOWER(r.title) LIKE '%' || LOWER(@search) || '%'
      OR LOWER(COALESCE(r.personal_notes, '')) LIKE '%' || LOWER(@search) || '%'
      OR LOWER(COALESCE(r.source_url, '')) LIKE '%' || LOWER(@search) || '%'
      OR LOWER(COALESCE(r.source_domain, '')) LIKE '%' || LOWER(@search) || '%'
      OR r.id IN (
        SELECT rt.reference_id FROM reference_tags rt 
        JOIN tags t ON t.id = rt.tag_id 
        WHERE LOWER(t.name) LIKE '%' || LOWER(@search) || '%'
      )
      OR r.id IN (
        SELECT da.reference_id FROM design_analyses da
        WHERE LOWER(da.analysis_json) LIKE '%' || LOWER(@search) || '%'
        OR LOWER(da.creative_brief) LIKE '%' || LOWER(@search) || '%'
      )
    )`;
  }

  // Sorting
  switch (options.sortBy) {
    case 'oldest':
      query += ` ORDER BY r.created_at ASC`;
      break;
    case 'updated':
      query += ` ORDER BY r.updated_at DESC`;
      break;
    case 'title':
      query += ` ORDER BY LOWER(r.title) ASC`;
      break;
    case 'recent':
    default:
      query += ` ORDER BY r.created_at DESC`;
      break;
  }

  const rows = db.prepare(query).all(options) as any[];

  return rows.map(row => formatReferenceRow(row, options.userId));
}

export function getReferenceById(id: string, userId: string): DesignReference | null {
  const row = db.prepare(`
    SELECT 
      r.id, r.user_id as userId, r.title, r.source_url as sourceUrl, r.source_domain as sourceDomain,
      r.image_storage_path as imageStoragePath, r.original_filename as originalFilename,
      r.mime_type as mimeType, r.file_size as fileSize, r.personal_notes as personalNotes,
      r.is_favorite as isFavorite, r.created_at as createdAt, r.updated_at as updatedAt, r.deleted_at as deletedAt
    FROM references_items r
    WHERE r.id = ? AND r.user_id = ?
  `).get(id, userId) as any;

  if (!row) return null;
  return formatReferenceRow(row, userId);
}

function formatReferenceRow(row: any, userId: string): DesignReference {
  const refId = row.id;

  // Collections
  const collections = db.prepare(`
    SELECT c.id, c.user_id as userId, c.name, c.description, c.created_at as createdAt, c.updated_at as updatedAt
    FROM collections c
    JOIN reference_collections rc ON rc.collection_id = c.id
    WHERE rc.reference_id = ?
  `).all(refId) as Collection[];

  // Tags
  const tags = db.prepare(`
    SELECT t.id, t.name, rt.tag_origin as origin
    FROM tags t
    JOIN reference_tags rt ON rt.tag_id = t.id
    WHERE rt.reference_id = ?
  `).all(refId) as Array<{ id: string; name: string; origin: 'user' | 'ai' }>;

  // Analysis
  const analysisRow = db.prepare(`
    SELECT * FROM design_analyses WHERE reference_id = ?
  `).get(refId) as any;

  let analysis: DesignAnalysis | null = null;
  if (analysisRow) {
    try {
      const parsed = JSON.parse(analysisRow.analysis_json);
      analysis = {
        id: analysisRow.id,
        referenceId: analysisRow.reference_id,
        userId: analysisRow.user_id,
        modelIdentifier: analysisRow.model_identifier,
        summary: parsed.summary || '',
        primaryStyle: parsed.primaryStyle || parsed.primary_style || 'Editorial',
        secondaryStyles: parsed.secondaryStyles || parsed.secondary_styles || [],
        visualMood: parsed.visualMood || parsed.visual_mood || '',
        associations: parsed.associations || [],
        keywords: parsed.keywords || [],
        typography: parsed.typography || { classification: '', characteristics: '', hierarchyNotes: '' },
        colorPalette: parsed.colorPalette || parsed.color_palette || [],
        layout: parsed.layout || { gridType: '', density: '', whitespace: '', compositionNotes: '' },
        shapesAndTextures: parsed.shapesAndTextures || parsed.shapes_and_textures || [],
        interactionObservations: parsed.interactionObservations || parsed.interaction_observations || '',
        whyItWorks: parsed.whyItWorks || parsed.why_it_works || '',
        potentialUses: parsed.potentialUses || parsed.potential_uses || [],
        implementationIdeas: parsed.implementationIdeas || parsed.implementation_ideas || [],
        creativeBrief: analysisRow.creative_brief || parsed.creative_brief || '',
        reusablePrompt: analysisRow.reusable_prompt || parsed.reusable_prompt || '',
        confidenceOrUncertainty: parsed.confidenceOrUncertainty || parsed.confidence_or_uncertainty,
        createdAt: analysisRow.created_at,
        updatedAt: analysisRow.updated_at
      };
    } catch {
      // Handled gracefully
    }
  }

  const imageUrl = row.imageStoragePath ? `/api/uploads/${encodeURIComponent(row.imageStoragePath)}` : undefined;

  return {
    ...row,
    isFavorite: Boolean(row.isFavorite),
    imageUrl,
    collections,
    tags,
    analysis
  };
}

export function createReference(params: {
  userId: string;
  title?: string;
  sourceUrl?: string;
  sourceDomain?: string;
  imageStoragePath?: string;
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
  personalNotes?: string;
  isFavorite?: boolean;
  collectionIds?: string[];
  tags?: string[];
}): DesignReference {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const title = params.title?.trim() || (params.sourceDomain ? `Inspiration from ${params.sourceDomain}` : 'Untitled Reference');

  db.transaction(() => {
    db.prepare(`
      INSERT INTO references_items (
        id, user_id, title, source_url, source_domain, image_storage_path, original_filename,
        mime_type, file_size, personal_notes, is_favorite, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.userId,
      title,
      params.sourceUrl || null,
      params.sourceDomain || null,
      params.imageStoragePath || null,
      params.originalFilename || null,
      params.mimeType || null,
      params.fileSize || null,
      params.personalNotes || null,
      params.isFavorite ? 1 : 0,
      now,
      now
    );

    // Link collections
    if (params.collectionIds && params.collectionIds.length > 0) {
      const stmt = db.prepare('INSERT OR IGNORE INTO reference_collections (reference_id, collection_id) VALUES (?, ?)');
      for (const colId of params.collectionIds) {
        stmt.run(id, colId);
      }
    }

    // Link tags
    if (params.tags && params.tags.length > 0) {
      for (const tagName of params.tags) {
        const cleanTag = tagName.trim();
        if (!cleanTag) continue;
        let tag = db.prepare('SELECT id FROM tags WHERE user_id = ? AND LOWER(name) = LOWER(?)').get(params.userId, cleanTag) as { id: string } | undefined;
        let tagId = tag?.id;
        if (!tagId) {
          tagId = crypto.randomUUID();
          db.prepare('INSERT INTO tags (id, user_id, name, created_at) VALUES (?, ?, ?, ?)').run(tagId, params.userId, cleanTag, now);
        }
        db.prepare('INSERT OR IGNORE INTO reference_tags (reference_id, tag_id, tag_origin) VALUES (?, ?, ?)').run(id, tagId, 'user');
      }
    }
  })();

  return getReferenceById(id, params.userId)!;
}

export function updateReference(id: string, userId: string, params: {
  title?: string;
  sourceUrl?: string;
  sourceDomain?: string;
  personalNotes?: string;
  isFavorite?: boolean;
  collectionIds?: string[];
  tags?: string[];
}): DesignReference | null {
  const existing = getReferenceById(id, userId);
  if (!existing) return null;

  const now = new Date().toISOString();

  db.transaction(() => {
    const updates: string[] = ['updated_at = ?'];
    const args: any[] = [now];

    if (params.title !== undefined) {
      updates.push('title = ?');
      args.push(params.title.trim());
    }
    if (params.sourceUrl !== undefined) {
      updates.push('source_url = ?');
      args.push(params.sourceUrl.trim());
    }
    if (params.sourceDomain !== undefined) {
      updates.push('source_domain = ?');
      args.push(params.sourceDomain.trim());
    }
    if (params.personalNotes !== undefined) {
      updates.push('personal_notes = ?');
      args.push(params.personalNotes);
    }
    if (params.isFavorite !== undefined) {
      updates.push('is_favorite = ?');
      args.push(params.isFavorite ? 1 : 0);
    }

    args.push(id, userId);
    db.prepare(`UPDATE references_items SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...args);

    // Update collections if provided
    if (params.collectionIds !== undefined) {
      db.prepare('DELETE FROM reference_collections WHERE reference_id = ?').run(id);
      const stmt = db.prepare('INSERT OR IGNORE INTO reference_collections (reference_id, collection_id) VALUES (?, ?)');
      for (const colId of params.collectionIds) {
        stmt.run(id, colId);
      }
    }

    // Update user tags if provided
    if (params.tags !== undefined) {
      db.prepare("DELETE FROM reference_tags WHERE reference_id = ? AND tag_origin = 'user'").run(id);
      for (const tagName of params.tags) {
        const cleanTag = tagName.trim();
        if (!cleanTag) continue;
        let tag = db.prepare('SELECT id FROM tags WHERE user_id = ? AND LOWER(name) = LOWER(?)').get(userId, cleanTag) as { id: string } | undefined;
        let tagId = tag?.id;
        if (!tagId) {
          tagId = crypto.randomUUID();
          db.prepare('INSERT INTO tags (id, user_id, name, created_at) VALUES (?, ?, ?, ?)').run(tagId, userId, cleanTag, now);
        }
        db.prepare('INSERT OR IGNORE INTO reference_tags (reference_id, tag_id, tag_origin) VALUES (?, ?, ?)').run(id, tagId, 'user');
      }
    }
  })();

  return getReferenceById(id, userId);
}

export function toggleFavorite(id: string, userId: string): boolean {
  const ref = getReferenceById(id, userId);
  if (!ref) return false;
  const newFav = ref.isFavorite ? 0 : 1;
  const now = new Date().toISOString();
  db.prepare('UPDATE references_items SET is_favorite = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(newFav, now, id, userId);
  return Boolean(newFav);
}

export function softDeleteReference(id: string, userId: string): boolean {
  const now = new Date().toISOString();
  const res = db.prepare('UPDATE references_items SET deleted_at = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(now, now, id, userId);
  return res.changes > 0;
}

export function restoreReference(id: string, userId: string): boolean {
  const now = new Date().toISOString();
  const res = db.prepare('UPDATE references_items SET deleted_at = NULL, updated_at = ? WHERE id = ? AND user_id = ?').run(now, id, userId);
  return res.changes > 0;
}

export function permanentDeleteReference(id: string, userId: string): boolean {
  const ref = getReferenceById(id, userId);
  if (!ref) return false;

  db.transaction(() => {
    // Foreign keys with CASCADE will delete reference_collections, reference_tags, design_analyses
    db.prepare('DELETE FROM references_items WHERE id = ? AND user_id = ?').run(id, userId);

    // Clean up physical file only if no other active reference uses the same image storage path
    if (ref.imageStoragePath) {
      const otherRef = db.prepare('SELECT id FROM references_items WHERE image_storage_path = ? AND id != ?').get(ref.imageStoragePath, id);
      if (!otherRef) {
        const filePath = path.join(UPLOADS_DIR, ref.imageStoragePath);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch {
            // Ignore error
          }
        }
      }
    }
  })();

  return true;
}

// Collections
export function getCollections(userId: string): Collection[] {
  const rows = db.prepare(`
    SELECT c.id, c.user_id as userId, c.name, c.description, c.created_at as createdAt, c.updated_at as updatedAt,
      (SELECT COUNT(*) FROM reference_collections rc JOIN references_items r ON r.id = rc.reference_id WHERE rc.collection_id = c.id AND r.deleted_at IS NULL) as referenceCount
    FROM collections c
    WHERE c.user_id = ?
    ORDER BY LOWER(c.name) ASC
  `).all(userId) as any[];

  return rows.map(r => ({ ...r, referenceCount: Number(r.referenceCount || 0) }));
}

export function createCollection(userId: string, name: string, description?: string): Collection {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO collections (id, user_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, userId, name.trim(), description?.trim() || null, now, now);
  return { id, userId, name: name.trim(), description: description?.trim(), createdAt: now, updatedAt: now, referenceCount: 0 };
}

export function updateCollection(id: string, userId: string, name: string, description?: string): Collection | null {
  const now = new Date().toISOString();
  const res = db.prepare('UPDATE collections SET name = ?, description = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(name.trim(), description?.trim() || null, now, id, userId);
  if (res.changes === 0) return null;
  return db.prepare('SELECT id, user_id as userId, name, description, created_at as createdAt, updated_at as updatedAt FROM collections WHERE id = ?').get(id) as any;
}

export function deleteCollection(id: string, userId: string): boolean {
  // Only deletes the collection and links, NOT references!
  const res = db.prepare('DELETE FROM collections WHERE id = ? AND user_id = ?').run(id, userId);
  return res.changes > 0;
}

// Tags
export function getTags(userId: string): Tag[] {
  const rows = db.prepare(`
    SELECT t.id, t.user_id as userId, t.name, t.created_at as createdAt,
      (SELECT COUNT(*) FROM reference_tags rt JOIN references_items r ON r.id = rt.reference_id WHERE rt.tag_id = t.id AND r.deleted_at IS NULL) as count
    FROM tags t
    WHERE t.user_id = ?
    ORDER BY count DESC, LOWER(t.name) ASC
  `).all(userId) as any[];

  return rows.map(r => ({ ...r, count: Number(r.count || 0) }));
}

export function deleteTag(id: string, userId: string): boolean {
  const res = db.prepare('DELETE FROM tags WHERE id = ? AND user_id = ?').run(id, userId);
  return res.changes > 0;
}

// Design Analyses
export function upsertDesignAnalysis(params: {
  referenceId: string;
  userId: string;
  modelIdentifier: string;
  analysisJson: any;
  creativeBrief: string;
  reusablePrompt: string;
}): DesignAnalysis {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const jsonStr = JSON.stringify(params.analysisJson);

  db.transaction(() => {
    db.prepare(`
      INSERT INTO design_analyses (id, reference_id, user_id, model_identifier, analysis_json, creative_brief, reusable_prompt, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(reference_id) DO UPDATE SET
        model_identifier = excluded.model_identifier,
        analysis_json = excluded.analysis_json,
        creative_brief = excluded.creative_brief,
        reusable_prompt = excluded.reusable_prompt,
        updated_at = excluded.updated_at
    `).run(
      id,
      params.referenceId,
      params.userId,
      params.modelIdentifier,
      jsonStr,
      params.creativeBrief,
      params.reusablePrompt,
      now,
      now
    );

    // Also auto-add suggested AI keywords as tags without overwriting user tags
    if (Array.isArray(params.analysisJson.keywords)) {
      for (const kw of params.analysisJson.keywords) {
        const clean = String(kw).trim();
        if (!clean) continue;
        let tag = db.prepare('SELECT id FROM tags WHERE user_id = ? AND LOWER(name) = LOWER(?)').get(params.userId, clean) as { id: string } | undefined;
        let tagId = tag?.id;
        if (!tagId) {
          tagId = crypto.randomUUID();
          db.prepare('INSERT INTO tags (id, user_id, name, created_at) VALUES (?, ?, ?, ?)').run(tagId, params.userId, clean, now);
        }
        db.prepare('INSERT OR IGNORE INTO reference_tags (reference_id, tag_id, tag_origin) VALUES (?, ?, ?)').run(params.referenceId, tagId, 'ai');
      }
    }
  })();

  const row = db.prepare('SELECT * FROM design_analyses WHERE reference_id = ?').get(params.referenceId) as any;
  const parsed = JSON.parse(row.analysis_json);

  return {
    id: row.id,
    referenceId: row.reference_id,
    userId: row.user_id,
    modelIdentifier: row.model_identifier,
    summary: parsed.summary || '',
    primaryStyle: parsed.primaryStyle || 'Editorial',
    secondaryStyles: parsed.secondaryStyles || [],
    visualMood: parsed.visualMood || '',
    associations: parsed.associations || [],
    keywords: parsed.keywords || [],
    typography: parsed.typography || { classification: '', characteristics: '', hierarchyNotes: '' },
    colorPalette: parsed.colorPalette || [],
    layout: parsed.layout || { gridType: '', density: '', whitespace: '', compositionNotes: '' },
    shapesAndTextures: parsed.shapesAndTextures || [],
    interactionObservations: parsed.interactionObservations || '',
    whyItWorks: parsed.whyItWorks || '',
    potentialUses: parsed.potentialUses || [],
    implementationIdeas: parsed.implementationIdeas || [],
    creativeBrief: row.creative_brief,
    reusablePrompt: row.reusable_prompt,
    confidenceOrUncertainty: parsed.confidenceOrUncertainty,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function updateDesignAnalysis(referenceId: string, userId: string, params: {
  creativeBrief?: string;
  reusablePrompt?: string;
  primaryStyle?: string;
  summary?: string;
}): DesignAnalysis | null {
  const row = db.prepare('SELECT * FROM design_analyses WHERE reference_id = ? AND user_id = ?').get(referenceId, userId) as any;
  if (!row) return null;

  const now = new Date().toISOString();
  const parsed = JSON.parse(row.analysis_json);

  if (params.primaryStyle !== undefined) parsed.primaryStyle = params.primaryStyle;
  if (params.summary !== undefined) parsed.summary = params.summary;

  const newBrief = params.creativeBrief !== undefined ? params.creativeBrief : row.creative_brief;
  const newPrompt = params.reusablePrompt !== undefined ? params.reusablePrompt : row.reusable_prompt;

  db.prepare(`
    UPDATE design_analyses
    SET analysis_json = ?, creative_brief = ?, reusable_prompt = ?, updated_at = ?
    WHERE reference_id = ? AND user_id = ?
  `).run(JSON.stringify(parsed), newBrief, newPrompt, now, referenceId, userId);

  return {
    id: row.id,
    referenceId: row.reference_id,
    userId: row.user_id,
    modelIdentifier: row.model_identifier,
    summary: parsed.summary,
    primaryStyle: parsed.primaryStyle,
    secondaryStyles: parsed.secondaryStyles || [],
    visualMood: parsed.visualMood || '',
    associations: parsed.associations || [],
    keywords: parsed.keywords || [],
    typography: parsed.typography || { classification: '', characteristics: '', hierarchyNotes: '' },
    colorPalette: parsed.colorPalette || [],
    layout: parsed.layout || { gridType: '', density: '', whitespace: '', compositionNotes: '' },
    shapesAndTextures: parsed.shapesAndTextures || [],
    interactionObservations: parsed.interactionObservations || '',
    whyItWorks: parsed.whyItWorks || '',
    potentialUses: parsed.potentialUses || [],
    implementationIdeas: parsed.implementationIdeas || [],
    creativeBrief: newBrief,
    reusablePrompt: newPrompt,
    confidenceOrUncertainty: parsed.confidenceOrUncertainty,
    createdAt: row.created_at,
    updatedAt: now
  };
}

// Distinct Styles across user library
export function getDistinctStyles(userId: string): Array<{ name: string; count: number; sampleKeywords: string[]; description?: string }> {
  const rows = db.prepare(`
    SELECT da.analysis_json
    FROM design_analyses da
    JOIN references_items r ON r.id = da.reference_id
    WHERE da.user_id = ? AND r.deleted_at IS NULL
  `).all(userId) as any[];

  const styleMap = new Map<string, { count: number; keywords: Set<string>; summaries: string[] }>();

  for (const r of rows) {
    try {
      const data = JSON.parse(r.analysis_json);
      const primary = (data.primaryStyle || data.primary_style || '').trim();
      if (primary) {
        if (!styleMap.has(primary)) {
          styleMap.set(primary, { count: 0, keywords: new Set(), summaries: [] });
        }
        const s = styleMap.get(primary)!;
        s.count += 1;
        if (data.summary) s.summaries.push(data.summary);
        if (Array.isArray(data.keywords)) {
          data.keywords.slice(0, 5).forEach((k: string) => s.keywords.add(k));
        }
      }
    } catch {}
  }

  const result: Array<{ name: string; count: number; sampleKeywords: string[]; description?: string }> = [];
  for (const [name, s] of styleMap.entries()) {
    result.push({
      name,
      count: s.count,
      sampleKeywords: Array.from(s.keywords).slice(0, 6),
      description: s.summaries[0] || 'Visual style identified in your library.'
    });
  }

  return result.sort((a, b) => b.count - a.count);
}

// Library Statistics & Counts
export function getLibraryCounts(userId: string) {
  const allCount = db.prepare('SELECT COUNT(*) as count FROM references_items WHERE user_id = ? AND deleted_at IS NULL').get(userId) as any;
  const favCount = db.prepare('SELECT COUNT(*) as count FROM references_items WHERE user_id = ? AND is_favorite = 1 AND deleted_at IS NULL').get(userId) as any;
  const trashCount = db.prepare('SELECT COUNT(*) as count FROM references_items WHERE user_id = ? AND deleted_at IS NOT NULL').get(userId) as any;
  const colCount = db.prepare('SELECT COUNT(*) as count FROM collections WHERE user_id = ?').get(userId) as any;

  return {
    all: Number(allCount?.count || 0),
    favorites: Number(favCount?.count || 0),
    trash: Number(trashCount?.count || 0),
    collections: Number(colCount?.count || 0)
  };
}

// Export All User Data
export function exportUserData(userId: string) {
  const user = findUserById(userId);
  const references = getReferences({ userId, isTrash: false });
  const collections = getCollections(userId);
  const tags = getTags(userId);

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    user,
    collections,
    tags,
    references
  };
}

// Import & Restore User Data
export function importUserData(userId: string, data: any) {
  if (!data || !Array.isArray(data.references)) {
    throw new Error('Invalid backup file: references array missing');
  }

  let importedCount = 0;
  const now = new Date().toISOString();

  db.transaction(() => {
    // Restore collections
    if (Array.isArray(data.collections)) {
      for (const col of data.collections) {
        if (!col.name) continue;
        const existing = db.prepare('SELECT id FROM collections WHERE user_id = ? AND LOWER(name) = LOWER(?)').get(userId, col.name) as any;
        if (!existing) {
          db.prepare('INSERT INTO collections (id, user_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(
            col.id || crypto.randomUUID(),
            userId,
            col.name,
            col.description || null,
            col.createdAt || now,
            now
          );
        }
      }
    }

    // Restore references
    for (const ref of data.references) {
      if (!ref.title) continue;

      // Check if reference exists by matching title or image
      const existing = db.prepare('SELECT id FROM references_items WHERE user_id = ? AND title = ? AND (source_url = ? OR image_storage_path = ?)').get(
        userId,
        ref.title,
        ref.sourceUrl || '',
        ref.imageStoragePath || ''
      ) as any;

      if (existing) continue; // Do not duplicate

      const newId = ref.id || crypto.randomUUID();
      db.prepare(`
        INSERT INTO references_items (
          id, user_id, title, source_url, source_domain, image_storage_path, original_filename,
          mime_type, file_size, personal_notes, is_favorite, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId,
        userId,
        ref.title,
        ref.sourceUrl || null,
        ref.sourceDomain || null,
        ref.imageStoragePath || null,
        ref.originalFilename || null,
        ref.mimeType || null,
        ref.fileSize || null,
        ref.personalNotes || null,
        ref.isFavorite ? 1 : 0,
        ref.createdAt || now,
        ref.updatedAt || now
      );

      // Restore Analysis
      if (ref.analysis) {
        upsertDesignAnalysis({
          referenceId: newId,
          userId,
          modelIdentifier: ref.analysis.modelIdentifier || 'backup-restore',
          analysisJson: ref.analysis,
          creativeBrief: ref.analysis.creativeBrief || '',
          reusablePrompt: ref.analysis.reusablePrompt || ''
        });
      }

      importedCount++;
    }
  })();

  return { importedCount };
}
