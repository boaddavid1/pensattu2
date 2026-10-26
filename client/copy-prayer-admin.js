// client/copy-prayer-admin.js — Prepares static assets for the Vite build.
// Copies standalone modules into client directories so Vercel can serve them statically.
import { cpSync, mkdirSync, existsSync, rmSync, copyFileSync } from 'fs';
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

// 3. Copies prayer/public/ into public/operation-paga and public/student-prayers
const prayerPublicSrc = join(__dirname, '..', 'prayer', 'public');
const pagaDest = join(__dirname, 'public', 'operation-paga');
const studentPrayersDest = join(__dirname, 'public', 'student-prayers');

if (existsSync(prayerPublicSrc)) {
  // Operation Paga
  if (existsSync(pagaDest)) rmSync(pagaDest, { recursive: true, force: true });
  mkdirSync(pagaDest, { recursive: true });
  cpSync(prayerPublicSrc, pagaDest, { recursive: true });

  // Student prayers admin portal
  if (existsSync(studentPrayersDest)) rmSync(studentPrayersDest, { recursive: true, force: true });
  mkdirSync(studentPrayersDest, { recursive: true });
  cpSync(prayerPublicSrc, studentPrayersDest, { recursive: true });
  const studentsHtml = join(studentPrayersDest, 'students.html');
  if (existsSync(studentsHtml)) {
    copyFileSync(studentsHtml, join(studentPrayersDest, 'index.html'));
  }
  console.log('[copy-assets] Copied prayer standalone pages -> public/operation-paga & public/student-prayers');
}
