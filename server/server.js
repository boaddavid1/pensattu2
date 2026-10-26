import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Serve static client build in production / local runs; falls through for SPA routes
app.use(express.static(path.join(__dirname, '../client/dist')));

// Ensure missing or expired hashed chunks return 404 instead of index.html fallback
app.all('/assets/*', (req, res) => {
  res.status(404).type('text/plain').send('Asset chunk expired or not found');
});

// Single Page Application fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start local listener
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Initial sync & recurring 5-minute background check to transition upcoming -> ongoing -> past
  syncEventsDatabaseStatus(pool, events).catch(() => {});
  setInterval(() => {
    syncEventsDatabaseStatus(pool, events).catch(() => {});
  }, 5 * 60 * 1000);
});
