import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from './db.js';
import * as data from './data.js';
import { comparePassword, generateToken, requireAuth, requireSuperAdmin } from './auth.js';

const DEMO_USER = {
  id: 1,
  name: 'Demo Admin',
  email: 'admin@pensa.com',
  role: 'superadmin',
  password: 'admin123',
};

let nextDemoId = 1000;
const toIso = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d) ? new Date().toISOString() : d.toISOString();
};

const memory = {
  ministries: data.ministries.map((r) => ({ ...r })),
  sermons: data.sermons.map((r) => ({ ...r })),
  team: data.team.map((r) => ({ ...r })),
  events: data.events.map((r) => ({ ...r })),
  announcements: data.announcements.map((r, i) => ({ id: i + 1, title: r.title, body: r.body, published_at: toIso(r.date) })),
  notices: data.notices.map((r, i) => ({ id: i + 1, title: r.title, body: r.body, published_at: toIso(r.date) })),
  gallery_albums: data.galleryAlbums.map((r) => ({ id: r.id, slug: r.id, title: r.title, cover: r.cover })),
  visits: data.visits,
  subscribers: data.subscribers,
  contacts: data.contacts,
  gallery_photos: [],
  users: [{ ...DEMO_USER, password_hash: null }],
};

function isDbUnavailable(err) {
  const msg = err && err.message ? err.message.toLowerCase() : '';
  return msg.includes('unknown database') || msg.includes('econnrefused') || msg.includes('access denied') || msg.includes("can't connect") || msg.includes('connection lost') || msg.includes('connect timeout');
}

function memoryList(table) { return memory[table] || []; }
function memoryGet(table, id) { return (memory[table] || []).find((r) => String(r.id) === String(id)); }
function memoryCreate(table, record) {
  const r = { id: ++nextDemoId, ...record };
  if (!memory[table]) memory[table] = [];
  memory[table].push(r);
  return r;
}
function memoryUpdate(table, id, record) {
  const list = memory[table] || [];
  const idx = list.findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...record };
  return list[idx];
}
function memoryDelete(table, id) {
  const list = memory[table] || [];
  const idx = list.findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return null;
  list.splice(idx, 1);
  return true;
}

const router = Router();

const TABLES = {
  ministries: {
    columns: ['title', 'description', 'image_url'],
    required: ['title'],
    orderBy: 'id',
  },
  sermons: {
    columns: ['title', 'speaker', 'category', 'duration', 'image_url', 'published_at'],
    required: ['title'],
    orderBy: 'published_at DESC',
  },
  team: {
    columns: ['name', 'role', 'image_url', 'sort_order'],
    required: ['name'],
    orderBy: 'sort_order, id',
  },
  events: {
    columns: ['title', 'event_date', 'event_time', 'location', 'description'],
    required: ['title', 'event_date'],
    orderBy: 'event_date',
  },
  announcements: {
    columns: ['title', 'body', 'published_at'],
    required: ['title', 'body'],
    orderBy: 'published_at DESC, id DESC',
  },
  notices: {
    columns: ['title', 'body', 'published_at'],
    required: ['title', 'body'],
    orderBy: 'published_at DESC, id DESC',
  },
  gallery_albums: {
    columns: ['slug', 'title', 'cover'],
    required: ['slug', 'title'],
    orderBy: 'id',
  },
};

const READONLY_TABLES = ['visits', 'subscribers', 'contacts'];

function logAction(userId, action, entity, entityId, details) {
  const detailsJson = details ? JSON.stringify(details) : null;
  pool.query(
    'INSERT INTO activity_logs (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
    [userId, action, entity, entityId, detailsJson]
  ).catch(() => {});
}

function validateColumns(body, allowed) {
  const out = {};
  for (const col of allowed) {
    if (body[col] !== undefined) out[col] = body[col];
  }
  return out;
}

function placeholders(count) {
  return Array(count).fill('?').join(', ');
}

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user);
    logAction(user.id, 'LOGIN', 'users', user.id);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (isDbUnavailable(err) && email === DEMO_USER.email && password === DEMO_USER.password) {
      const token = generateToken({
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        role: DEMO_USER.role,
        name: DEMO_USER.name,
      });
      return res.json({
        token,
        user: { id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email, role: DEMO_USER.role },
        demo: true,
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// Current user
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Dashboard stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const stats = {};
    for (const table of Object.keys(TABLES)) {
      const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM ${table}`);
      stats[table] = rows[0].count;
    }
    for (const table of READONLY_TABLES) {
      const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM ${table}`);
      stats[table] = rows[0].count;
    }
    const [recent] = await pool.query(
      'SELECT al.*, u.name FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.id DESC LIMIT 10'
    );
    res.json({ stats, recentActivity: recent });
  } catch (err) {
    if (isDbUnavailable(err)) {
      const stats = {};
      for (const table of Object.keys(TABLES)) stats[table] = memoryList(table).length;
      for (const table of READONLY_TABLES) stats[table] = memoryList(table).length;
      return res.json({ stats, recentActivity: [], demo: true });
    }
    res.status(500).json({ error: err.message });
  }
});

// Generic CRUD for content tables
for (const [table, config] of Object.entries(TABLES)) {
  // List
  router.get(`/${table}`, requireAuth, async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY ${config.orderBy}`);
      res.json(rows);
    } catch (err) {
      if (isDbUnavailable(err)) return res.json(memoryList(table));
      res.status(500).json({ error: err.message });
    }
  });

  // Get one
  router.get(`/${table}/:id`, requireAuth, async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
      if (!rows[0]) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      if (isDbUnavailable(err)) {
        const row = memoryGet(table, req.params.id);
        if (!row) return res.status(404).json({ error: 'Not found' });
        return res.json(row);
      }
      res.status(500).json({ error: err.message });
    }
  });

  // Create
  router.post(`/${table}`, requireAuth, async (req, res) => {
    const data = validateColumns(req.body, config.columns);
    for (const field of config.required) {
      if (!data[field]) return res.status(400).json({ error: `Missing required field: ${field}` });
    }
    try {
      const cols = Object.keys(data);
      const vals = Object.values(data);
      const [result] = await pool.query(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders(vals.length)})`,
        vals
      );
      logAction(req.user.id, 'CREATE', table, result.insertId);
      res.status(201).json({ id: result.insertId, ...data });
    } catch (err) {
      if (isDbUnavailable(err)) {
        const row = memoryCreate(table, data);
        return res.status(201).json({ demo: true, ...row });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // Update
  router.put(`/${table}/:id`, requireAuth, async (req, res) => {
    const data = validateColumns(req.body, config.columns);
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    try {
      const cols = Object.keys(data);
      const vals = Object.values(data);
      const [result] = await pool.query(
        `UPDATE ${table} SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
        [...vals, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
      logAction(req.user.id, 'UPDATE', table, Number(req.params.id), data);
      res.json({ id: Number(req.params.id), ...data });
    } catch (err) {
      if (isDbUnavailable(err)) {
        const row = memoryUpdate(table, req.params.id, data);
        if (!row) return res.status(404).json({ error: 'Not found' });
        return res.json({ demo: true, ...row });
      }
      res.status(500).json({ error: err.message });
    }
  });

  // Delete
  router.delete(`/${table}/:id`, requireAuth, async (req, res) => {
    try {
      const [result] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
      logAction(req.user.id, 'DELETE', table, Number(req.params.id));
      res.json({ message: 'Deleted' });
    } catch (err) {
      if (isDbUnavailable(err)) {
        const ok = memoryDelete(table, req.params.id);
        if (!ok) return res.status(404).json({ error: 'Not found' });
        return res.json({ message: 'Deleted', demo: true });
      }
      res.status(500).json({ error: err.message });
    }
  });
}

// Readonly tables
for (const table of READONLY_TABLES) {
  router.get(`/${table}`, requireAuth, async (req, res) => {
    try {
      const order = table === 'subscribers' ? 'subscribed_at DESC' : 'created_at DESC';
      const [rows] = await pool.query(`SELECT * FROM ${table} ORDER BY ${order}`);
      res.json(rows);
    } catch (err) {
      if (isDbUnavailable(err)) return res.json(memoryList(table));
      res.status(500).json({ error: err.message });
    }
  });

  router.delete(`/${table}/:id`, requireAuth, async (req, res) => {
    try {
      const [result] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
      logAction(req.user.id, 'DELETE', table, Number(req.params.id));
      res.json({ message: 'Deleted' });
    } catch (err) {
      if (isDbUnavailable(err)) {
        const ok = memoryDelete(table, req.params.id);
        if (!ok) return res.status(404).json({ error: 'Not found' });
        return res.json({ message: 'Deleted', demo: true });
      }
      res.status(500).json({ error: err.message });
    }
  });
}

// Gallery photos nested under album
router.get('/gallery_photos', requireAuth, async (req, res) => {
  try {
    const albumId = req.query.album_id;
    const query = albumId
      ? 'SELECT * FROM gallery_photos WHERE album_id = ? ORDER BY id'
      : 'SELECT * FROM gallery_photos ORDER BY id';
    const params = albumId ? [albumId] : [];
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    if (isDbUnavailable(err)) {
      const rows = memoryList('gallery_photos').filter((p) => (albumId ? String(p.album_id) === String(albumId) : true));
      return res.json(rows);
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/gallery_photos', requireAuth, async (req, res) => {
  const { album_id, src, alt, category, caption } = req.body;
  if (!album_id || !src) {
    return res.status(400).json({ error: 'album_id and src required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO gallery_photos (album_id, src, alt, category, caption) VALUES (?, ?, ?, ?, ?)',
      [album_id, src, alt || null, category || null, caption || null]
    );
    logAction(req.user.id, 'CREATE', 'gallery_photos', result.insertId);
    res.status(201).json({ id: result.insertId, album_id, src, alt, category, caption });
  } catch (err) {
    if (isDbUnavailable(err)) {
      const row = memoryCreate('gallery_photos', { album_id, src, alt, category, caption });
      return res.status(201).json({ demo: true, ...row });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/gallery_photos/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM gallery_photos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    logAction(req.user.id, 'DELETE', 'gallery_photos', Number(req.params.id));
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (isDbUnavailable(err)) {
      const ok = memoryDelete('gallery_photos', req.params.id);
      if (!ok) return res.status(404).json({ error: 'Not found' });
      return res.json({ message: 'Deleted', demo: true });
    }
    res.status(500).json({ error: err.message });
  }
});

// Users management (superadmin only)
router.get('/users', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id');
    res.json(rows);
  } catch (err) {
    if (isDbUnavailable(err)) {
      return res.json(memoryList('users').map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', requireAuth, requireSuperAdmin, async (req, res) => {
  const { name, email, password, role = 'admin' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, role]
    );
    logAction(req.user.id, 'CREATE', 'users', result.insertId);
    res.status(201).json({ id: result.insertId, name, email, role });
  } catch (err) {
    if (isDbUnavailable(err)) {
      const row = memoryCreate('users', { name, email, role });
      return res.status(201).json({ demo: true, ...row });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    logAction(req.user.id, 'DELETE', 'users', Number(req.params.id));
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (isDbUnavailable(err)) {
      const ok = memoryDelete('users', req.params.id);
      if (!ok) return res.status(404).json({ error: 'Not found' });
      return res.json({ message: 'Deleted', demo: true });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
