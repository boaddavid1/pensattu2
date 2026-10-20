// Copies prayer/admin/ into src/prayer-admin/ so the client can import it.
// This keeps the prayer module standalone while making its React admin
// component available to the client build — both locally and on Vercel.
import { cpSync, mkdirSync, existsSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 1. Copies prayer/admin/ into src/prayer-admin/ so the client can import it.
const prayerSrc = join(__dirname, '..', 'prayer', 'admin');
const prayerDest = join(__dirname, 'src', 'prayer-admin');

if (existsSync(prayerSrc)) {
  if (existsSync(prayerDest)) rmSync(prayerDest, { recursive: true, force: true });
  mkdirSync(prayerDest, { recursive: true });
  cpSync(prayerSrc, prayerDest, { recursive: true });
  console.log('[copy-assets] Copied prayer/admin -> src/prayer-admin');
}

// 2. Copies school/ into public/school/ so Vercel can serve the retreat school portal statically
const schoolSrc = join(__dirname, '..', 'school');
const schoolDest = join(__dirname, 'public', 'school');

if (existsSync(schoolSrc)) {
  if (existsSync(schoolDest)) rmSync(schoolDest, { recursive: true, force: true });
  mkdirSync(schoolDest, { recursive: true });
  cpSync(schoolSrc, schoolDest, { recursive: true });
  console.log('[copy-assets] Copied school -> public/school');
}
