import pool from './db.js';

const CLOUD_NAME = 'kw3hzord';
const FOLDER = 'pensattu/gallery';

function buildUrl(filename) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${FOLDER}/${filename}`;
}

async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      console.log(`DB error, retrying in 2s... (${err.code || err.message})`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

async function updateGallery() {
  let g = 0;
  const [gallery] = await withRetry(() => pool.query('SELECT id, image_url FROM gallery WHERE image_url NOT LIKE ?', ['https%']));
  for (const row of gallery) {
    const filename = row.image_url.split('/').pop();
    if (!filename) continue;
    await withRetry(() => pool.query('UPDATE gallery SET image_url = ? WHERE id = ?', [buildUrl(filename), row.id]));
    g++;
    if (g % 50 === 0) console.log(`Updated ${g} gallery photos...`);
  }
  return g;
}

async function updateAlbums() {
  let a = 0;
  const [albums] = await withRetry(() => pool.query('SELECT id, cover_image FROM albums WHERE cover_image IS NOT NULL AND cover_image NOT LIKE ?', ['https%']));
  for (const row of albums) {
    const filename = row.cover_image.split('/').pop();
    if (!filename) continue;
    await withRetry(() => pool.query('UPDATE albums SET cover_image = ? WHERE id = ?', [buildUrl(filename), row.id]));
    a++;
  }
  return a;
}

async function main() {
  const g = await updateGallery();
  const a = await updateAlbums();
  console.log(`Done. Updated ${g} gallery photos and ${a} album covers.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
