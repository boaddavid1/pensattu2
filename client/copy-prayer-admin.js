// Copies prayer/admin/ into src/prayer-admin/ so the client can import it.
// This keeps the prayer module standalone while making its React admin
// component available to the client build — both locally and on Vercel.
import { cpSync, mkdirSync, existsSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, '..', 'prayer', 'admin');
const dest = join(__dirname, 'src', 'prayer-admin');

if (!existsSync(src)) {
  console.error('[copy-prayer-admin] Source not found:', src);
  process.exit(1);
}

if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log('[copy-prayer-admin] Copied prayer/admin -> src/prayer-admin');
