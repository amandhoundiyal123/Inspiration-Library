import archiver from 'archiver';
import fs from 'node:fs';
import path from 'node:path';
import type { Response } from 'express';
import { exportUserData, importUserData, getReferences } from './db';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');

/**
 * Streams a complete ZIP archive containing metadata.json and all original image assets.
 */
export async function streamZipBackup(userId: string, res: Response): Promise<void> {
  const metadata = exportUserData(userId);
  const references = getReferences({ userId, isTrash: false });

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="designvault-backup-${new Date().toISOString().slice(0, 10)}.zip"`);

  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(res);

  // Append metadata.json
  archive.append(JSON.stringify(metadata, null, 2), { name: 'designvault-metadata.json' });

  // Append images in an images/ folder inside zip
  const addedFiles = new Set<string>();
  for (const ref of references) {
    if (ref.imageStoragePath && !addedFiles.has(ref.imageStoragePath)) {
      const fullPath = path.join(UPLOADS_DIR, ref.imageStoragePath);
      if (fs.existsSync(fullPath)) {
        archive.file(fullPath, { name: `images/${ref.imageStoragePath}` });
        addedFiles.add(ref.imageStoragePath);
      }
    }
  }

  await archive.finalize();
}

export { exportUserData, importUserData };
