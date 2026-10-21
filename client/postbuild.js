// client/postbuild.js — Generates physical index.html files and 404.html SPA fallback
// Guarantees that refreshing or direct navigation to /control-panel/ never 404s on Vercel or any static host.
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, 'dist');
const indexHtml = join(distDir, 'index.html');

if (existsSync(indexHtml)) {
  // 1. Create 404.html so Vercel automatically falls back to SPA router on any unmatched path
  copyFileSync(indexHtml, join(distDir, '404.html'));
  console.log('[postbuild] Created dist/404.html');

  // 2. Create physical index.html inside route folders to handle direct hits and trailing slashes (e.g. /control-panel/)
  const routes = [
    'control-panel',
    'control-panel/login',
    'control-panel/dashboard',
    'control-panel/gate-scanner',
    'register',
    'about',
    'contact',
    'events',
    'sermons',
    'gallery',
    'notice-board',
    'leadership',
    'departments-and-teams',
  ];

  for (const route of routes) {
    const targetDir = join(distDir, route);
    mkdirSync(targetDir, { recursive: true });
    copyFileSync(indexHtml, join(targetDir, 'index.html'));
  }
  console.log('[postbuild] Created physical route fallbacks for key routes');
}
