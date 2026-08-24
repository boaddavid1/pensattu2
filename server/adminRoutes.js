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

// User's database has admin_users table with username field
async function getUserByUsername(username) {
  try {
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE username = ?', [username]);
    return rows[0];
  } catch (err) {
    return null;
  }
}

let nextDemoId = 1000;
const toIso = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d) ? new Date().toISOString() : d.toISOString();
};

const memory = {
  ministries: data.coreValues?.map((r) => ({ ...r })) || data.ministries.map((r) => ({ ...r })),
  sermons: data.sermons.map((r) => ({ ...r })),
  team: data.leadership?.map((r) => ({ ...r })) || data.team.map((r) => ({ ...r })),
  events: data.events.map((r) => ({ ...r })),
  announcements: data.news?.map((r, i) => ({ id: i + 1, title: r.title, body: r.content, published_at: toIso(r.created_at) })) || data.announcements.map((r, i) => ({ id: i + 1, title: r.title, body: r.body, published_at: toIso(r.date) })),
  notices: data.news?.map((r, i) => ({ id: i + 1, title: r.title, body: r.content, published_at: toIso(r.created_at) })) || data.notices.map((r, i) => ({ id: i + 1, title: r.title, body: r.body, published_at: toIso(r.date) })),
  gallery_albums: data.albums?.map((r) => ({ id: r.id, slug: r.id, title: r.name, cover: r.cover_image })) || data.galleryAlbums.map((r) => ({ id: r.id, slug: r.id, title: r.title, cover: r.cover })),
  visits: data.visits,
  subscribers: data.subscribers,
  contacts: data.contactMessages || data.contacts,
  gallery_photos: data.gallery?.map((r) => ({ ...r })) || [],
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
    actualTable: 'core_values',
    columns: ['title', 'description', 'icon'],
    required: ['title'],
    orderBy: 'display_order',
  },
  sermons: {
    actualTable: 'sermons',
    columns: ['title', 'speaker', 'category', 'description', 'audio_url', 'image_url', 'date_preached'],
    required: ['title'],
    orderBy: 'date_preached DESC',
  },
  team: {
    actualTable: 'leadership',
    columns: ['name', 'role', 'category', 'academic_year', 'programme', 'hall', 'previous_portfolio', 'description', 'image_url', 'display_order'],
    required: ['name', 'category', 'academic_year'],
    orderBy: 'display_order',
  },
  events: {
    actualTable: 'events',
    columns: ['title', 'event_date', 'event_time', 'location', 'description', 'category', 'image_url'],
    required: ['title', 'event_date'],
    orderBy: 'event_date',
  },
  announcements: {
    actualTable: 'news',
    columns: ['title', 'content', 'excerpt', 'image_url', 'category'],
    required: ['title', 'content'],
    orderBy: 'created_at DESC, id DESC',
  },
  notices: {
    actualTable: 'news', // Using news table for notices as well
    columns: ['title', 'content', 'excerpt', 'image_url', 'category'],
    required: ['title', 'content'],
    orderBy: 'created_at DESC, id DESC',
  },
  gallery_albums: {
    actualTable: 'albums',
    columns: ['name', 'description', 'cover_image'],
    required: ['name'],
    orderBy: 'id',
  },
};

const READONLY_TABLES = ['visits', 'subscribers', 'contact_messages'];

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
    // Try admin_users table first (user's database)
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE username = ? OR email = ?', [email, email]);
    const user = rows[0];
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.full_name || user.username,
      role: user.role === 'admin' ? 'superadmin' : user.role // Map admin to superadmin for compatibility
    });
    logAction(user.id, 'LOGIN', 'admin_users', user.id);
    res.json({
      token,
      user: { id: user.id, name: user.full_name || user.username, email: user.email, role: user.role },
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
    for (const [key, config] of Object.entries(TABLES)) {
      const actualTable = config.actualTable || key;
      const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM ${actualTable}`);
      stats[key] = rows[0].count;
    }
    for (const table of READONLY_TABLES) {
      const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM ${table}`);
      stats[table] = rows[0].count;
    }
    const [recent] = await pool.query(
      'SELECT al.*, u.name FROM activity_logs al LEFT JOIN admin_users u ON al.user_id = u.id ORDER BY al.id DESC LIMIT 10'
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
  const actualTable = config.actualTable || table;

  // List
  router.get(`/${table}`, requireAuth, async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM ${actualTable} ORDER BY ${config.orderBy}`);
      res.json(rows);
    } catch (err) {
      if (isDbUnavailable(err)) return res.json(memoryList(table));
      res.status(500).json({ error: err.message });
    }
  });

  // Get one
  router.get(`/${table}/:id`, requireAuth, async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM ${actualTable} WHERE id = ?`, [req.params.id]);
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
        `INSERT INTO ${actualTable} (${cols.join(', ')}) VALUES (${placeholders(vals.length)})`,
        vals
      );
      logAction(req.user.id, 'CREATE', actualTable, result.insertId);
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
        `UPDATE ${actualTable} SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
        [...vals, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
      logAction(req.user.id, 'UPDATE', actualTable, Number(req.params.id), data);
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
      const [result] = await pool.query(`DELETE FROM ${actualTable} WHERE id = ?`, [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
      logAction(req.user.id, 'DELETE', actualTable, Number(req.params.id));
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
      ? 'SELECT * FROM gallery WHERE album_id = ? ORDER BY id'
      : 'SELECT * FROM gallery ORDER BY id';
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
      'INSERT INTO gallery (album_id, image_url, title, category, description) VALUES (?, ?, ?, ?, ?)',
      [album_id, src, alt || null, category || null, caption || null]
    );
    logAction(req.user.id, 'CREATE', 'gallery', result.insertId);
    res.status(201).json({ id: result.insertId, album_id, image_url: src, title: alt, category, description: caption });
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
    const [result] = await pool.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    logAction(req.user.id, 'DELETE', 'gallery', Number(req.params.id));
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
    const [rows] = await pool.query('SELECT id, username, full_name AS name, email, role, created_at FROM admin_users ORDER BY id');
    res.json(rows);
  } catch (err) {
    if (isDbUnavailable(err)) {
      return res.json(memoryList('users').map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', requireAuth, requireSuperAdmin, async (req, res) => {
  const { username, full_name, email, password, role = 'admin' } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, and password required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admin_users (username, full_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [username, full_name || username, email, hash, role]
    );
    logAction(req.user.id, 'CREATE', 'admin_users', result.insertId);
    res.status(201).json({ id: result.insertId, username, full_name, email, role });
  } catch (err) {
    if (isDbUnavailable(err)) {
      const row = memoryCreate('users', { name: username, email, role });
      return res.status(201).json({ demo: true, ...row });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM admin_users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    logAction(req.user.id, 'DELETE', 'admin_users', Number(req.params.id));
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
