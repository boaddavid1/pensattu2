import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';
import {
  ministries, sermons, team, events,
  addVisit, addSubscriber, addContact,
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

// Ministries
app.get('/api/ministries', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ministries ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.json(ministries);
  }
});

// Sermons / messages
app.get('/api/sermons', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sermons ORDER BY published_at DESC LIMIT 6'
    );
    res.json(rows);
  } catch (err) {
    res.json(sermons);
  }
});

// Leadership
app.get('/api/team', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM team ORDER BY sort_order');
    res.json(rows);
  } catch (err) {
    res.json(team);
  }
});

// Events
app.get('/api/events', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM events WHERE event_date >= CURDATE() ORDER BY event_date LIMIT 4'
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
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );
    res.status(201).json({ message: 'Message sent' });
  } catch (err) {
    addContact(req.body);
    res.status(201).json({ message: 'Message sent (demo mode)' });
  }
});

// Serve static client build in production; falls through for SPA routes
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
