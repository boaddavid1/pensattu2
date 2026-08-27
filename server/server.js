import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import webPush from 'web-push';
import pool from './db.js';
import adminRoutes from './adminRoutes.js';
import prayerRoutes from '../prayer/routes.js';
import secRoutes from './secRoutes.js';
import alumniRoutes from './alumniRoutes.js';
import { requireAuth, hashPassword, comparePassword, generateToken, verifyToken } from './auth.js';
import syncSchema from './syncSchema.js';
import secSyncSchema from './secSyncSchema.js';
import alumniSyncSchema from './alumniSyncSchema.js';
import cloudinary from './cloudinary.js';
import {
  ministries, sermons, team, events,
  addVisit, addSubscriber, addContact,
  announcements, notices, galleryAlbums,
} from './data.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hello@pensattu.example';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure required tables exist
syncSchema();
secSyncSchema();
alumniSyncSchema();

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ ok: true, db: rows[0].result === 2 });
  } catch (err) {
    res.status(200).json({ ok: false, error: err.message, fallback: true });
  }
});

// Core Values (mapped from ministries)
app.get('/api/ministries', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM core_values WHERE is_active = 1 ORDER BY display_order');
    res.json(rows);
  } catch (err) {
    res.json(ministries);
  }
});

// Sermons / messages
app.get('/api/sermons', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sermons WHERE is_active = 1 ORDER BY date_preached DESC LIMIT 6'
    );
    res.json(rows);
  } catch (err) {
    res.json(sermons);
  }
});

// Leadership
app.get('/api/team', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM leadership WHERE is_active = 1 ORDER BY display_order');
    res.json(rows);
  } catch (err) {
    res.json(team);
  }
});

// Events
app.get('/api/events', async (req, res) => {
  try {
    const past = req.query.past === '1' || req.query.past === 'true';
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(
      past
        ? 'SELECT * FROM events WHERE COALESCE(event_end_date, event_date) < ? ORDER BY event_date DESC LIMIT 8'
        : 'SELECT * FROM events WHERE COALESCE(event_end_date, event_date) >= ? ORDER BY event_date ASC LIMIT 8',
      [today]
    );
    res.json(rows);
  } catch (err) {
    res.json(events);
  }
});

// Visitor form
app.post('/api/visits', async (req, res) => {
  const { first_name, last_name, email, phone, service, notes } = req.body;
  if (!first_name || !last_name || !email || !service) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await pool.query(
      'INSERT INTO visits (first_name, last_name, email, phone, service, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone || null, service, notes || null]
    );
    res.status(201).json({ message: 'Visit planned successfully' });
  } catch (err) {
    addVisit(req.body);
    res.status(201).json({ message: 'Visit planned successfully (demo mode)' });
  }
});

// Newsletter subscriber
app.post('/api/subscribers', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    await pool.query(
      'INSERT INTO subscribers (email) VALUES (?) ON DUPLICATE KEY UPDATE subscribed_at = CURRENT_TIMESTAMP',
      [email]
    );
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    addSubscriber(email);
    res.status(201).json({ message: 'Subscribed successfully (demo mode)' });
  }
});

// Contact form
app.post('/api/contact', async (req, res) => {
  const { name, email, message, phone } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await pool.query(
      'INSERT INTO contact_messages (name, email, message, phone) VALUES (?, ?, ?, ?)',
      [name, email, message, phone || null]
    );
    res.status(201).json({ message: 'Message sent' });
  } catch (err) {
    addContact(req.body);
    res.status(201).json({ message: 'Message sent (demo mode)' });
  }
});

// Public managed content endpoints
app.get('/api/announcements', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DATE_FORMAT(created_at, "%b %e, %Y") AS date, title, content AS body FROM news ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.json(announcements);
  }
});

app.get('/api/notices', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DATE_FORMAT(created_at, "%b %e, %Y") AS date, title, content AS body FROM news WHERE category = "Notice" ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.json(notices);
  }
});

app.get('/api/gallery', async (req, res) => {
  try {
    const [albums] = await pool.query('SELECT id, name AS title, description, cover_image AS cover FROM albums ORDER BY id');
    const [photos] = await pool.query('SELECT album_id, image_url AS src, title AS alt, category, description AS caption FROM gallery ORDER BY id');
    const albumsWithItems = albums.map((album) => ({
      ...album,
      count: `${photos.filter((p) => p.album_id === album.id).length} photos`,
      items: photos.filter((p) => p.album_id === album.id),
    }));
    res.json(albumsWithItems);
  } catch (err) {
    res.json(galleryAlbums);
  }
});

// Home Settings
app.get('/api/home-settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM home_settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json(settings);
  } catch (err) {
    res.json({});
  }
});

// Hero Slider
app.get('/api/hero-slider', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM hero_slider WHERE is_active = 1 ORDER BY display_order');
    res.json(rows);
  } catch (err) {
    res.json([]);
  }
});

// About Settings
app.get('/api/about-settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM about_settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json(settings);
  } catch (err) {
    res.json({});
  }
});

// About Gallery
app.get('/api/about-gallery', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM about_gallery WHERE is_active = 1 ORDER BY display_order');
    res.json(rows);
  } catch (err) {
    res.json([]);
  }
});

// Contact Settings
app.get('/api/contact-settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM contact_settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json(settings);
  } catch (err) {
    res.json({});
  }
});

// Services
app.get('/api/services', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM services WHERE is_active = 1 ORDER BY display_order');
    res.json(rows);
  } catch (err) {
    res.json([]);
  }
});

// Videos
app.get('/api/videos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM videos ORDER BY display_order');
    res.json(rows);
  } catch (err) {
    res.json([]);
  }
});

// Timeline Events
app.get('/api/timeline', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM timeline_events WHERE is_active = 1 ORDER BY display_order');
    res.json(rows);
  } catch (err) {
    res.json([]);
  }
});

// Push notifications
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY || null });
});

app.post('/api/push-subscribe', async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }
    await pool.query(
      'INSERT INTO push_subscriptions (endpoint, p256dh, auth) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth)',
      [endpoint, keys.p256dh, keys.auth]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/push-unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [endpoint]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/send-notification', requireAuth, async (req, res) => {
  try {
    const { title, body, url = '/' } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Title and body required' });

    const [rows] = await pool.query('SELECT * FROM push_subscriptions');
    const payload = JSON.stringify({ title, body, url });

    const results = await Promise.allSettled(
      rows.map((sub) =>
        webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        ).catch((err) => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            pool.query('DELETE FROM push_subscriptions WHERE endpoint = ?', [sub.endpoint]);
          }
          throw err;
        })
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    res.json({ ok: true, sent, failed, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin routes
app.use('/api/admin', adminRoutes);

// Operation Paga prayer request routes (converted from the PHP prayer project)
app.use('/api/prayers', prayerRoutes);

// SEC member management routes (converted from the PHP sec project)
app.use('/api/sec', secRoutes);

// Alumni portal routes (converted from the PHP alumni project)
app.use('/api/alumni', alumniRoutes);

// Standalone Operation Paga pages (public form + student admin) — served as
// static HTML so they stay independent of the React SPA, matching the original.
const prayerPublic = path.join(__dirname, '../prayer/public');

// Explicit route handlers FIRST (before static middleware) so that the root
// path of each mount serves the correct HTML file instead of express.static's
// default index.html behavior.
app.get('/operation-paga', (req, res) => {
  res.sendFile(path.join(prayerPublic, 'index.html'));
});
app.get('/student-prayers', (req, res) => {
  res.sendFile(path.join(prayerPublic, 'students.html'));
});

// Static assets (pns.png, ps.svg, etc.) — index: false so the root path
// doesn't auto-serve index.html, which would shadow the route handlers above.
app.use('/operation-paga', express.static(prayerPublic, { index: false }));
app.use('/student-prayers', express.static(prayerPublic, { index: false }));

// Past Questions - public endpoints

// Library user auth
app.post('/api/library/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const [existing] = await pool.query('SELECT id FROM library_users WHERE email = ?', [email]);
    if (existing[0]) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    const hashed = await hashPassword(password);
    const [result] = await pool.query(
      'INSERT INTO library_users (full_name, email, password) VALUES (?, ?, ?)',
      [full_name, email, hashed]
    );
    const token = generateToken({ id: result.insertId, email, name: full_name, role: 'library_user' });
    res.status(201).json({ token, user: { id: result.insertId, full_name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/library/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const [rows] = await pool.query('SELECT * FROM library_users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = generateToken({ id: user.id, email: user.email, name: user.full_name, role: 'library_user' });
    res.json({ token, user: { id: user.id, full_name: user.full_name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/library/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const user = verifyToken(token);
  if (!user || user.role !== 'library_user') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, profile_picture, created_at FROM library_users WHERE id = ?',
      [user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile (name, email, profile picture)
app.put('/api/library/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const user = verifyToken(token);
  if (!user || user.role !== 'library_user') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { full_name, email, profile_picture } = req.body;
    if (!full_name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    // Check email uniqueness (excluding current user)
    const [existing] = await pool.query(
      'SELECT id FROM library_users WHERE email = ? AND id != ?',
      [email, user.id]
    );
    if (existing[0]) {
      return res.status(409).json({ error: 'That email is already in use' });
    }
    await pool.query(
      'UPDATE library_users SET full_name = ?, email = ?, profile_picture = ? WHERE id = ?',
      [full_name, email, profile_picture || null, user.id]
    );
    const newToken = generateToken({ id: user.id, email, name: full_name, role: 'library_user' });
    res.json({
      token: newToken,
      user: { id: user.id, full_name, email, profile_picture: profile_picture || null },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change password
app.put('/api/library/me/password', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const user = verifyToken(token);
  if (!user || user.role !== 'library_user') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const [rows] = await pool.query('SELECT password FROM library_users WHERE id = ?', [user.id]);
    if (!rows[0] || !(await comparePassword(current_password, rows[0].password))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const hashed = await hashPassword(new_password);
    await pool.query('UPDATE library_users SET password = ? WHERE id = ?', [hashed, user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download history for the logged-in user
app.get('/api/library/me/downloads', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const user = verifyToken(token);
  if (!user || user.role !== 'library_user') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT dh.resource_type, dh.resource_id, dh.downloaded_at,
              pq.course_code, pq.course_title, pq.year, pq.semester,
              b.title AS book_title, b.author AS book_author
       FROM download_history dh
       LEFT JOIN past_questions pq ON dh.resource_type = 'past_question' AND dh.resource_id = pq.id
       LEFT JOIN library_books b ON dh.resource_type = 'book' AND dh.resource_id = b.id
       WHERE dh.user_id = ?
       ORDER BY dh.downloaded_at DESC
       LIMIT 100`,
      [user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Past Questions - public endpoints
app.get('/api/past-questions', async (req, res) => {
  try {
    const { search, year, semester, level, programme, exam_type } = req.query;
    let sql = 'SELECT * FROM past_questions WHERE is_active = 1';
    const params = [];

    if (search) {
      sql += ' AND (course_code LIKE ? OR course_title LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }
    if (year) { sql += ' AND year = ?'; params.push(Number(year)); }
    if (semester) { sql += ' AND semester = ?'; params.push(semester); }
    if (level) { sql += ' AND level = ?'; params.push(level); }
    if (programme) { sql += ' AND programme LIKE ?'; params.push(`%${programme}%`); }
    if (exam_type) { sql += ' AND exam_type = ?'; params.push(exam_type); }

    sql += ' ORDER BY year DESC, course_code ASC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/past-questions/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM past_questions WHERE id = ? AND is_active = 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate a download URL for a Cloudinary file.
// For raw files (which may require authentication), we proxy through the server.
// For image/auto files, the public URL works directly.
function getDownloadUrl(fileUrl) {
  if (!fileUrl) return null;
  if (!fileUrl.includes('cloudinary.com')) return fileUrl;
  // If it's a raw/upload URL, we need to proxy it (raw files may not be publicly accessible)
  if (fileUrl.includes('/raw/upload/')) {
    // Return a proxy URL that goes through our backend
    const encoded = encodeURIComponent(fileUrl);
    return `/api/proxy-download?url=${encoded}`;
  }
  // image/upload or auto/upload URLs are publicly accessible
  return fileUrl;
}

// Proxy endpoint for Cloudinary raw files that aren't publicly accessible.
// The backend generates a signed download URL and redirects to it.
app.get('/api/proxy-download', async (req, res) => {
  const { url } = req.query;
  if (!url || !url.includes('cloudinary.com')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  try {
    // Extract public_id from the Cloudinary raw URL
    const match = url.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) {
      // Not a raw file, just redirect to the public URL
      return res.redirect(url);
    }
    const publicId = match[1];
    // Compensate for server clock skew: if the server's clock is behind
    // Cloudinary's, signed URLs will be rejected as "stale". We temporarily
    // shift time forward by 4 hours to ensure the timestamp is valid.
    const realNow = Date.now;
    const offset = 4 * 60 * 60 * 1000; // 4 hours in ms
    Date.now = () => realNow() + offset;
    const origGetTime = Date.prototype.getTime;
    Date.prototype.getTime = function () { return realNow() + offset; };
    try {
      var signedUrl = cloudinary.utils.private_download_url(publicId, 'raw', {
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        resource_type: 'raw',
      });
    } finally {
      Date.now = realNow;
      Date.prototype.getTime = origGetTime;
    }
    res.redirect(signedUrl);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate download URL: ' + err.message });
  }
});

app.post('/api/past-questions/:id/download', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const user = verifyToken(token);
  if (!user || user.role !== 'library_user') {
    return res.status(401).json({ error: 'Please log in to download past questions' });
  }
  try {
    const [rows] = await pool.query('SELECT file_url FROM past_questions WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    await pool.query('UPDATE past_questions SET downloads = downloads + 1 WHERE id = ?', [req.params.id]);
    await pool.query(
      'INSERT INTO download_history (user_id, resource_type, resource_id) VALUES (?, ?, ?)',
      [user.id, 'past_question', req.params.id]
    );
    const downloadUrl = getDownloadUrl(rows[0].file_url);
    res.json({ ok: true, download_url: downloadUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/past-questions-meta', async (req, res) => {
  try {
    const [years] = await pool.query('SELECT DISTINCT year FROM past_questions WHERE is_active = 1 ORDER BY year DESC');
    const [semesters] = await pool.query('SELECT DISTINCT semester FROM past_questions WHERE is_active = 1 ORDER BY semester');
    const [levels] = await pool.query('SELECT DISTINCT level FROM past_questions WHERE is_active = 1 ORDER BY level');
    const [examTypes] = await pool.query('SELECT DISTINCT exam_type FROM past_questions WHERE is_active = 1 ORDER BY exam_type');
    const [programmes] = await pool.query('SELECT DISTINCT programme FROM past_questions WHERE is_active = 1 AND programme IS NOT NULL ORDER BY programme');
    res.json({
      years: years.map(r => r.year),
      semesters: semesters.map(r => r.semester),
      levels: levels.map(r => r.level),
      examTypes: examTypes.map(r => r.exam_type),
      programmes: programmes.map(r => r.programme),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Library Books - public endpoints
app.get('/api/books', async (req, res) => {
  try {
    const { search, category } = req.query;
    let sql = 'SELECT id, title, author, category, description, cover_image, file_type, pages, is_readable, downloads, created_at FROM library_books WHERE is_active = 1';
    const params = [];
    if (search) {
      sql += ' AND (title LIKE ? OR author LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }
    if (category) { sql += ' AND category = ?'; params.push(category); }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/books/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM library_books WHERE id = ? AND is_active = 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books/:id/download', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const user = verifyToken(token);
  if (!user || user.role !== 'library_user') {
    return res.status(401).json({ error: 'Please log in to download books' });
  }
  try {
    const [rows] = await pool.query('SELECT file_url FROM library_books WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    await pool.query('UPDATE library_books SET downloads = downloads + 1 WHERE id = ?', [req.params.id]);
    await pool.query(
      'INSERT INTO download_history (user_id, resource_type, resource_id) VALUES (?, ?, ?)',
      [user.id, 'book', req.params.id]
    );
    const downloadUrl = getDownloadUrl(rows[0].file_url);
    res.json({ ok: true, download_url: downloadUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/books-categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM library_books WHERE is_active = 1 AND category IS NOT NULL ORDER BY category');
    res.json(rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve uploaded images from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static client build in production; falls through for SPA routes
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
