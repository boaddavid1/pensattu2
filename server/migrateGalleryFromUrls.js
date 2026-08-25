import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'pensattu';
const BACKEND_URL = (process.env.BACKEND_URL || 'https://pensa-ttu-api.onrender.com').replace(/\/$/, '');

async function uploadToCloudinary(buffer, filename, albumSlug) {
  const folder = `pensattu/gallery${albumSlug ? '/' + albumSlug : ''}`;
  const form = new FormData();
  form.append('file', new Blob([buffer]), filename);
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('folder', folder);
  form.append('public_id', filename.replace(/\.[^/.]+$/, ''));

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.secure_url;
}

async function main() {
  if (!CLOUD_NAME) {
    console.error('CLOUDINARY_CLOUD_NAME is not set in .env');
    process.exit(1);
  }

  const [albums] = await pool.query('SELECT id, name AS slug, cover_image AS cover FROM albums WHERE cover_image IS NOT NULL AND cover_image NOT LIKE ?', ['http%']);
  const [photos] = await pool.query(`
    SELECT g.id, g.image_url AS src, g.album_id, a.name AS album_slug
    FROM gallery g
    LEFT JOIN albums a ON g.album_id = a.id
    WHERE g.image_url IS NOT NULL AND g.image_url NOT LIKE ?
  `, ['http%']);

  console.log(`Found ${albums.length} album covers and ${photos.length} gallery photos to migrate.`);

  let updatedAlbums = 0;
  for (const album of albums) {
    const srcUrl = album.cover.startsWith('/') ? `${BACKEND_URL}${album.cover}` : `${BACKEND_URL}/${album.cover}`;
    try {
      const imageRes = await fetch(srcUrl);
      if (!imageRes.ok) throw new Error(`HTTP ${imageRes.status}`);
      const buffer = Buffer.from(await imageRes.arrayBuffer());
      const cloudUrl = await uploadToCloudinary(buffer, album.cover.split('/').pop(), album.slug);
      await pool.query('UPDATE albums SET cover_image = ? WHERE id = ?', [cloudUrl, album.id]);
      updatedAlbums++;
      console.log(`Migrated album ${album.id} cover -> ${cloudUrl}`);
    } catch (err) {
      console.error(`Failed to migrate album ${album.id} cover (${srcUrl}):`, err.message);
    }
  }

  let updatedPhotos = 0;
  for (const photo of photos) {
    const srcUrl = photo.src.startsWith('/') ? `${BACKEND_URL}${photo.src}` : `${BACKEND_URL}/${photo.src}`;
    try {
      const imageRes = await fetch(srcUrl);
      if (!imageRes.ok) throw new Error(`HTTP ${imageRes.status}`);
      const buffer = Buffer.from(await imageRes.arrayBuffer());
      const cloudUrl = await uploadToCloudinary(buffer, photo.src.split('/').pop(), photo.album_slug);
      await pool.query('UPDATE gallery SET image_url = ? WHERE id = ?', [cloudUrl, photo.id]);
      updatedPhotos++;
      console.log(`Migrated photo ${photo.id} -> ${cloudUrl}`);
    } catch (err) {
      console.error(`Failed to migrate photo ${photo.id} (${srcUrl}):`, err.message);
    }
  }

  console.log(`Migration complete. Updated ${updatedAlbums} album covers and ${updatedPhotos} photos.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
