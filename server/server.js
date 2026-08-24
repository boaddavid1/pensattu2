import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';
import adminRoutes from './adminRoutes.js';
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

app.use(cors());
app.use(express.json());

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
    const comparison = past ? '<' : '>=';
    const [rows] = await pool.query(
      `SELECT * FROM events WHERE event_date ${comparison} CURDATE() ORDER BY event_date ${past ? 'DESC' : 'ASC'} LIMIT 8`
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

// Admin routes
app.use('/api/admin', adminRoutes);

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
