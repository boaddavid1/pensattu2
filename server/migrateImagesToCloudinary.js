import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'pensattu';

const IMAGE_COLUMNS = [
  { table: 'leadership', column: 'image_url' },
  { table: 'core_values', column: 'image_url' },
  { table: 'sermons', column: 'image_url' },
  { table: 'events', column: 'image_url' },
  { table: 'news', column: 'image_url' },
  { table: 'gallery_albums', column: 'cover' },
  { table: 'gallery_photos', column: 'src' },
  { table: 'about_gallery', column: 'image_url' },
];

function walkDir(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function uploadToCloudinary(filePath) {
  const relative = path.relative(UPLOADS_DIR, filePath).replace(/\\/g, '/');
  const folder = `pensattu/${path.dirname(relative)}`;
  const publicId = path.basename(filePath, path.extname(filePath));
  const buffer = fs.readFileSync(filePath);

  const form = new FormData();
  form.append('file', new Blob([buffer]), path.basename(filePath));
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('folder', folder);
  form.append('public_id', publicId);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  console.log(`Uploading ${relative}...`);

  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return { relative, url: data.secure_url };
}

async function main() {
  if (!CLOUD_NAME) {
    console.error('CLOUDINARY_CLOUD_NAME is not set in .env');
    process.exit(1);
  }

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log('No server/uploads folder found. Nothing to migrate.');
    return;
  }

  const files = walkDir(UPLOADS_DIR);
  console.log(`Found ${files.length} files in ${UPLOADS_DIR}`);

  const uploaded = [];
  for (const file of files) {
    try {
      uploaded.push(await uploadToCloudinary(file));
    } catch (err) {
      console.error(`Failed to upload ${file}:`, err.message);
    }
  }

  console.log(`Uploaded ${uploaded.length} files successfully.`);

  let updatedCount = 0;
  for (const { relative, url } of uploaded) {
    const filename = path.basename(relative);
    for (const { table, column } of IMAGE_COLUMNS) {
      try {
        const [result] = await pool.query(
          `UPDATE \`${table}\` SET \`${column}\` = ? WHERE \`${column}\` IS NOT NULL AND \`${column}\` LIKE ?`,
          [url, `%${filename}`]
        );
        if (result.affectedRows) {
          updatedCount += result.affectedRows;
          console.log(`Updated ${result.affectedRows} row(s) in ${table}.${column} -> ${url}`);
        }
      } catch (err) {
        // Table/column may not exist; ignore.
      }
    }
  }

  console.log(`Migration complete. Updated ${updatedCount} database record(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
