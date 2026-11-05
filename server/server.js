import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import app from './app.js';
import pool from './db.js';
import { events } from './data.js';
import { syncEventsDatabaseStatus } from './eventStatusHelper.js';

const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standalone Retreat School portal (served statically for local runs)
app.use('/school', express.static(path.join(__dirname, '../school')));

// Standalone Operation Paga pages (public form + student admin)
const prayerPublic = path.join(__dirname, '../prayer/public');
app.get('/operation-paga', (req, res) => {
  res.sendFile(path.join(prayerPublic, 'index.html'));
});
app.get('/student-prayers', (req, res) => {
  res.sendFile(path.join(prayerPublic, 'students.html'));
});
app.use('/operation-paga', express.static(prayerPublic, { index: false }));
app.use('/student-prayers', express.static(prayerPublic, { index: false }));

// Static client build check
const clientDistDir = path.join(__dirname, '../client/dist');
const clientIndexHtml = path.join(clientDistDir, 'index.html');
const hasClientBuild = fs.existsSync(clientIndexHtml);

if (hasClientBuild) {
  // Serve static client build in production / local runs; falls through for SPA routes
  app.use(express.static(clientDistDir));

  // Ensure missing or expired hashed chunks return 404 instead of index.html fallback
  app.all('/assets/*', (req, res) => {
    res.status(404).type('text/plain').send('Asset chunk expired or not found');
  });

  // Single Page Application fallback
  app.get('*', (req, res) => {
    res.sendFile(clientIndexHtml);
  });
} else {
  // Clean JSON 404 fallback for backend-only deployments
  app.all('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ ok: false, error: 'Endpoint not found', path: req.path });
    }
    res.status(404).json({
      ok: false,
      error: 'Not found',
      message: 'PENSA TTU Backend API is online. Frontend client is hosted separately.',
      health: '/api/health',
    });
  });
}

// Start listener on 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  // Initial sync & recurring 5-minute background check to transition upcoming -> ongoing -> past
  syncEventsDatabaseStatus(pool, events).catch(() => {});
  setInterval(() => {
    syncEventsDatabaseStatus(pool, events).catch(() => {});
  }, 5 * 60 * 1000);
});
