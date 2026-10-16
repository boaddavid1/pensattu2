import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from './db.js';
import * as data from './data.js';
import { comparePassword, generateToken, requireAuth, requireSuperAdmin } from './auth.js';
import { calculateEventStatus, syncEventsDatabaseStatus } from './eventStatusHelper.js';

const DEMO_USER = {
  id: 1,
  name: 'Super Admin',
  email: 'admin@pensattu.org',
  role: 'superadmin',
  password: 'PensaAdmin2026!',
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
  ministries: data.ministries?.map((r) => ({ ...r })) || data.coreValues.map((r) => ({ ...r })),
  sermons: data.sermons.map((r) => ({ ...r })),
  team: data.leadership?.map((r) => ({ ...r })) || data.team.map((r) => ({ ...r })),
  events: data.events.map((r) => ({ ...r })),
  notices: data.news?.map((r, i) => ({ id: i + 1, title: r.title, body: r.content, published_at: toIso(r.created_at) })) || data.notices.map((r, i) => ({ id: i + 1, title: r.title, body: r.body, published_at: toIso(r.date) })),
  gallery_albums: [
    ...(data.albums || []).map((r) => ({
      id: r.id,
      name: r.name || r.title || 'Sunday Worship',
      title: r.name || r.title || 'Sunday Worship',
      description: r.description || '',
      cover_image: r.cover_image || r.cover || '/images/pensafallback-bw.png',
      cover: r.cover_image || r.cover || '/images/pensafallback-bw.png',
      created_at: r.created_at || '2026-08-23',
    })),
    ...(data.galleryAlbums || [])
      .filter((g) => !(data.albums || []).some((a) => (a.name || a.title || '').toLowerCase() === (g.title || g.name || '').toLowerCase()))
      .map((r, i) => ({
        id: r.id || (i + 2),
        name: r.title || r.name,
        title: r.title || r.name,
        description: r.description || '',
        cover_image: r.cover || r.cover_image || '/images/pensafallback-bw.png',
        cover: r.cover || r.cover_image || '/images/pensafallback-bw.png',
        created_at: '2026-08-23',
      })),
  ],
  visits: data.visits,
  subscribers: data.subscribers,
  contacts: data.contactMessages || data.contacts,
  gallery_photos: [
    ...(data.gallery || []).map((r) => ({
      id: r.id,
      album_id: r.album_id,
      image_url: r.image_url || r.src || '/images/pensafallback-bw.png',
      src: r.image_url || r.src || '/images/pensafallback-bw.png',
      title: r.title || r.alt || 'Worship Service',
      alt: r.title || r.alt || 'Worship Service',
      category: r.category || 'Worship',
      description: r.description || r.caption || '',
      caption: r.description || r.caption || '',
    })),
    ...((data.galleryAlbums || []).flatMap((album, aIdx) => {
      const resolvedAlbumId = album.id === 'worship' ? 1 : album.id;
      return (album.items || []).map((item, pIdx) => ({
        id: (aIdx + 1) * 100 + pIdx + 1,
        album_id: resolvedAlbumId,
        image_url: item.src || item.image_url || '/images/pensafallback-bw.png',
        src: item.src || item.image_url || '/images/pensafallback-bw.png',
        title: item.alt || item.title || '',
        alt: item.alt || item.title || '',
        category: item.category || '',
        description: item.caption || item.description || '',
        caption: item.caption || item.description || '',
      }));
    })),
  ],
  users: [{ ...DEMO_USER, password_hash: null }],
  navigation: JSON.parse(JSON.stringify(data.defaultNavigation || {})),
  hero_slider: [],
  about_gallery: [],
  page_settings: {
    about: {},
    home: {},
    contact: {},
  },
};

function isDbUnavailable(err) {
  if (!err) return false;
  const msg = err.message ? err.message.toLowerCase() : '';
  const code = err.code ? err.code.toLowerCase() : '';
  return (
    code === 'econnrefused' ||
    code === 'etimedout' ||
    code === 'er_bad_db_error' ||
    code === 'er_access_denied_error' ||
    code === 'er_no_such_table' ||
    code === 'enotfound' ||
    msg.includes('unknown database') ||
    msg.includes("doesn't exist") ||
    msg.includes('no such table') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    msg.includes('access denied') ||
    msg.includes("can't connect") ||
    msg.includes('connection lost') ||
    msg.includes('connect timeout')
  );
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

function extractMissingColumn(errMsg) {
  if (!errMsg) return null;
  const match = errMsg.match(/Unknown column '([^']+)' in '(?:SET|field list|where clause)'/i);
  return match ? match[1] : null;
}

function guessColumnDefinition(colName) {
  const c = colName.toLowerCase();
  if (c.includes('image') || c.includes('url') || c.includes('photo') || c.includes('avatar') || c.includes('file') || c.includes('cover')) {
    return 'VARCHAR(500)';
  }
  if (c.includes('phone')) return 'VARCHAR(50)';
  if (c.includes('email')) return 'VARCHAR(150)';
  if (c.includes('role') || c.includes('category') || c.includes('programme') || c.includes('hall') || c.includes('venue') || c.includes('meeting')) {
    return 'VARCHAR(200)';
  }
  if (c.includes('order') || c.includes('downloads') || c.includes('year') || c.includes('pages') || c.includes('size')) {
    return 'INT DEFAULT 0';
  }
  if (c.startsWith('is_') || c === 'featured') {
    return 'BOOLEAN DEFAULT TRUE';
  }
  if (c.includes('date')) return 'DATE';
  if (c.includes('assistants') || c.includes('activities') || c.includes('content') || c.includes('payload')) {
    return 'LONGTEXT';
  }
  if (c.includes('desc') || c.includes('bio') || c.includes('responsibilit') || c.includes('ideal') || c.includes('scripture')) {
    return 'TEXT';
  }
  return 'TEXT';
}

async function tryAddMissingColumn(actualTable, colName) {
  try {
    const def = guessColumnDefinition(colName);
    await pool.query(`ALTER TABLE \`${actualTable}\` ADD COLUMN \`${colName}\` ${def}`);
    return true;
  } catch (err) {
    return false;
  }
}

const router = Router();

const TABLES = {
  ministries: {
    actualTable: 'core_values',
    columns: [
      'title', 'description', 'icon', 'image_url', 'display_order', 'is_active',
      'category', 'meeting', 'venue', 'scripture', 'full_description', 'responsibilities', 'ideal_for',
      'leader_name', 'leader_role', 'leader_image', 'leader_phone', 'leader_email', 'leader_bio',
      'assistants', 'activities'
    ],
    required: ['title'],
    orderBy: 'display_order, id',
  },
  sermons: {
    actualTable: 'sermons',
    columns: ['title', 'speaker', 'category', 'description', 'audio_url', 'image_url', 'youtube_url', 'tiktok_url', 'date_preached', 'is_active'],
    required: ['title'],
    orderBy: 'date_preached DESC, id DESC',
  },
  team: {
    actualTable: 'leadership',
    columns: ['name', 'role', 'category', 'academic_year', 'programme', 'hall', 'previous_portfolio', 'description', 'image_url', 'display_order', 'is_active'],
    required: ['name', 'role', 'category', 'academic_year'],
    orderBy: 'display_order, id',
    defaults: { is_active: 1, display_order: 0, image_url: '/images/pensafallback-bw.png' },
  },
  events: {
    actualTable: 'events',
    columns: ['title', 'event_date', 'event_end_date', 'event_time', 'location', 'description', 'category', 'image_url', 'featured', 'status'],
    required: ['title', 'event_date'],
    orderBy: 'event_date',
  },
  notices: {
    actualTable: 'news', // Using news table for notices as well
    columns: ['title', 'content', 'excerpt', 'image_url', 'category'],
    required: ['title', 'content'],
    orderBy: 'created_at DESC, id DESC',
    defaults: { category: 'Notice' },
  },
  gallery_albums: {
    actualTable: 'albums',
    columns: ['name', 'description', 'cover_image'],
    required: ['name'],
    orderBy: 'id',
  },
  past_questions: {
    actualTable: 'past_questions',
    columns: ['course_code', 'course_title', 'year', 'semester', 'level', 'programme', 'exam_type', 'file_url', 'file_type', 'file_size', 'is_active'],
    required: ['course_code', 'course_title', 'year', 'semester', 'level', 'exam_type', 'file_url'],
    orderBy: 'created_at DESC',
  },
  books: {
    actualTable: 'library_books',
    columns: ['title', 'author', 'category', 'description', 'cover_image', 'file_url', 'file_type', 'file_size', 'pages', 'is_readable', 'content', 'is_active'],
    required: ['title', 'file_url'],
    orderBy: 'created_at DESC',
  },
  hero_slider: {
    actualTable: 'hero_slider',
    columns: ['title', 'subtitle', 'image_url', 'button_text', 'button_link', 'display_order', 'is_active'],
    required: ['image_url'],
    orderBy: 'display_order, id',
    defaults: { display_order: 0, is_active: 1 },
  },
  about_gallery: {
    actualTable: 'about_gallery',
    columns: ['title', 'description', 'image_url', 'display_order', 'is_active'],
    required: ['image_url'],
    orderBy: 'display_order, id',
    defaults: { display_order: 0, is_active: 1 },
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
    if (
      isDbUnavailable(err) &&
      (email?.toLowerCase() === DEMO_USER.email.toLowerCase() || email?.toLowerCase() === 'admin') &&
      password === DEMO_USER.password
    ) {
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
async function safeCount(table) {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
    return rows[0].count;
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE' || err.errno === 1146) return 0;
    throw err;
  }
}

router.get('/stats', requireAuth, async (req, res) => {
  try {
    const stats = {};
    for (const [key, config] of Object.entries(TABLES)) {
      const actualTable = config.actualTable || key;
      stats[key] = await safeCount(actualTable);
    }
    for (const table of READONLY_TABLES) {
      stats[table] = await safeCount(table);
    }
    stats.contacts = stats.contact_messages || 0;
    stats.prayers = await safeCount('prayer_requests');
    stats.registrations = await safeCount('registrations');
    stats.users = await safeCount('admin_users');
    const [recent] = await pool.query(
      'SELECT al.*, u.full_name AS name FROM activity_logs al LEFT JOIN admin_users u ON al.user_id = u.id ORDER BY al.id DESC LIMIT 10'
    );
    res.json({ stats, recentActivity: recent });
  } catch (err) {
    if (isDbUnavailable(err)) {
      const stats = {};
      for (const table of Object.keys(TABLES)) stats[table] = memoryList(table).length;
      for (const table of READONLY_TABLES) stats[table] = memoryList(table).length;
      stats.contacts = memoryList('contacts').length;
      stats.prayers = (memory.prayers || []).length;
      stats.registrations = (memory.registrations || []).length;
      stats.users = (memory.users || []).length;
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
    if (table === 'events') {
      await syncEventsDatabaseStatus(pool, memory.events).catch(() => {});
    }
    try {
      const [rows] = await pool.query(`SELECT * FROM ${actualTable} ORDER BY ${config.orderBy}`);
      if (table === 'events') {
        const enhanced = (rows || []).map((r) => ({
          ...r,
          status: calculateEventStatus(r),
        }));
        return res.json(enhanced);
      }
      res.json(rows);
    } catch (err) {
      if (isDbUnavailable(err)) {
        const list = memoryList(table);
        if (table === 'events') {
          return res.json(list.map((r) => ({ ...r, status: calculateEventStatus(r) })));
        }
        return res.json(list);
      }
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
        if (!row) return res.status(503).json({ error: 'Database connection is temporarily unavailable. Please try again.' });
        return res.json(row);
      }
      res.status(500).json({ error: err.message });
    }
  });

  // Create
  router.post(`/${table}`, requireAuth, async (req, res) => {
    let data = validateColumns(req.body, config.columns);
    // Apply server-side defaults (e.g. notices must be category='Notice' to
    // appear on the public notice board).
    if (config.defaults) {
      for (const [k, v] of Object.entries(config.defaults)) {
        if (data[k] === undefined || data[k] === '' || data[k] === null) data[k] = v;
      }
    }
    for (const field of config.required) {
      if (!data[field]) return res.status(400).json({ error: `Missing required field: ${field}` });
    }

    let attempts = 0;
    while (attempts < 5) {
      attempts++;
      try {
        const cols = Object.keys(data);
        const vals = Object.values(data);
        const [result] = await pool.query(
          `INSERT INTO ${actualTable} (${cols.join(', ')}) VALUES (${placeholders(vals.length)})`,
          vals
        );
        logAction(req.user.id, 'CREATE', actualTable, result.insertId);
        return res.status(201).json({ id: result.insertId, ...data });
      } catch (err) {
        const missingCol = extractMissingColumn(err.message);
        if (missingCol && data[missingCol] !== undefined) {
          // Attempt to add column to database schema
          const added = await tryAddMissingColumn(actualTable, missingCol);
          if (added) continue;
          // If ALTER TABLE failed or not permitted, drop missing column and re-try
          delete data[missingCol];
          continue;
        }
        if (isDbUnavailable(err)) {
          const row = memoryCreate(table, data);
          return res.status(201).json({ demo: true, ...row });
        }
        return res.status(500).json({ error: err.message });
      }
    }
    const row = memoryCreate(table, data);
    return res.status(201).json({ demo: true, ...row });
  });

  // Update
  router.put(`/${table}/:id`, requireAuth, async (req, res) => {
    let data = validateColumns(req.body, config.columns);
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    let attempts = 0;
    while (attempts < 5) {
      attempts++;
      try {
        const cols = Object.keys(data);
        const vals = Object.values(data);
        const [result] = await pool.query(
          `UPDATE ${actualTable} SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
          [...vals, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        logAction(req.user.id, 'UPDATE', actualTable, Number(req.params.id), data);
        return res.json({ id: Number(req.params.id), ...data });
      } catch (err) {
        const missingCol = extractMissingColumn(err.message);
        if (missingCol && data[missingCol] !== undefined) {
          const added = await tryAddMissingColumn(actualTable, missingCol);
          if (added) continue;
          delete data[missingCol];
          if (Object.keys(data).length === 0) {
            const row = memoryUpdate(table, req.params.id, req.body);
            return res.json({ demo: true, id: Number(req.params.id), ...(row || req.body) });
          }
          continue;
        }
        if (isDbUnavailable(err)) {
          const row = memoryUpdate(table, req.params.id, data);
          if (!row) return res.status(404).json({ error: 'Not found' });
          return res.json({ demo: true, ...row });
        }
        return res.status(500).json({ error: err.message });
      }
    }
    const row = memoryUpdate(table, req.params.id, data);
    return res.json({ demo: true, id: Number(req.params.id), ...(row || data) });
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
      const order = 'created_at DESC';
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

// Contacts alias for contact_messages table
router.get('/contacts', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    if (isDbUnavailable(err)) return res.json(memoryList('contacts'));
    res.status(500).json({ error: err.message });
  }
});

router.delete('/contacts/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    logAction(req.user.id, 'DELETE', 'contact_messages', Number(req.params.id));
    res.json({ message: 'Deleted' });
  } catch (err) {
    if (isDbUnavailable(err)) {
      const ok = memoryDelete('contacts', req.params.id);
      if (!ok) return res.status(404).json({ error: 'Not found' });
      return res.json({ message: 'Deleted', demo: true });
    }
    res.status(500).json({ error: err.message });
  }
});

// Helpers to safely resolve album ID between slugs, numeric IDs, and creating missing albums
async function resolveAlbumId(rawAlbumId) {
  if (rawAlbumId === undefined || rawAlbumId === null || rawAlbumId === '') return 1;
  const numericId = Number(rawAlbumId);
  try {
    if (!isNaN(numericId) && numericId > 0) {
      const [rows] = await pool.query('SELECT id FROM albums WHERE id = ?', [numericId]);
      if (rows.length > 0) return rows[0].id;
    }
    const [nameRows] = await pool.query('SELECT id FROM albums WHERE name = ? OR name LIKE ?', [String(rawAlbumId), `%${rawAlbumId}%`]);
    if (nameRows.length > 0) return nameRows[0].id;

    const [firstRows] = await pool.query('SELECT id FROM albums ORDER BY id ASC LIMIT 1');
    if (firstRows.length > 0) {
      if (typeof rawAlbumId === 'string' && isNaN(Number(rawAlbumId)) && rawAlbumId.trim()) {
        const [createResult] = await pool.query('INSERT INTO albums (name) VALUES (?)', [rawAlbumId.trim()]);
        return createResult.insertId;
      }
      return firstRows[0].id;
    }

    const albumName = (typeof rawAlbumId === 'string' && isNaN(Number(rawAlbumId)) && rawAlbumId.trim()) ? rawAlbumId.trim() : 'General Gallery';
    const [createResult] = await pool.query('INSERT INTO albums (name) VALUES (?)', [albumName]);
    return createResult.insertId;
  } catch (err) {
    return !isNaN(numericId) && numericId > 0 ? numericId : 1;
  }
}

function resolveMemoryAlbumId(rawAlbumId) {
  if (rawAlbumId === undefined || rawAlbumId === null || rawAlbumId === '') {
    return memory.gallery_albums?.[0]?.id || 1;
  }
  const albumsList = memory.gallery_albums || [];
  const found = albumsList.find((a) => String(a.id) === String(rawAlbumId) || (a.name && a.name.toLowerCase() === String(rawAlbumId).toLowerCase()));
  if (found) return found.id;
  return isNaN(Number(rawAlbumId)) ? rawAlbumId : Number(rawAlbumId);
}

// Gallery photos nested under album
router.get('/gallery_photos', requireAuth, async (req, res) => {
  const albumId = req.query.album_id;
  try {
    const query = albumId
      ? 'SELECT * FROM gallery WHERE album_id = ? ORDER BY id'
      : 'SELECT * FROM gallery ORDER BY id';
    const params = albumId ? [albumId] : [];
    const [rows] = await pool.query(query, params);
    const normalized = rows.map((r) => ({
      ...r,
      src: r.image_url || r.src,
      image_url: r.image_url || r.src,
      alt: r.title || r.alt || '',
      title: r.title || r.alt || '',
      caption: r.description || r.caption || '',
      description: r.description || r.caption || '',
    }));
    res.json(normalized);
  } catch (err) {
    if (isDbUnavailable(err)) {
      const rows = memoryList('gallery_photos')
        .filter((p) => (albumId ? String(p.album_id) === String(albumId) : true))
        .map((r) => ({
          ...r,
          src: r.image_url || r.src,
          image_url: r.image_url || r.src,
          alt: r.title || r.alt || '',
          title: r.title || r.alt || '',
          caption: r.description || r.caption || '',
          description: r.description || r.caption || '',
        }));
      return res.json(rows);
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/gallery_photos', requireAuth, async (req, res) => {
  const { album_id, src, alt, category, caption, image_url, title, description } = req.body;
  const photoSrc = src || image_url;
  const photoAlt = alt || title || '';
  const photoDesc = caption || description || '';
  if (!album_id || !photoSrc) {
    return res.status(400).json({ error: 'album_id and src required' });
  }
  try {
    const resolvedAlbumId = await resolveAlbumId(album_id);
    let result;
    try {
      const [insertRes] = await pool.query(
        'INSERT INTO gallery (album_id, image_url, title, category, description) VALUES (?, ?, ?, ?, ?)',
        [resolvedAlbumId, photoSrc, photoAlt || null, category || null, photoDesc || null]
      );
      result = insertRes;
    } catch (insertErr) {
      const missingCol = extractMissingColumn(insertErr.message);
      if (missingCol) {
        await tryAddMissingColumn('gallery', missingCol);
        const [retryRes] = await pool.query(
          'INSERT INTO gallery (album_id, image_url, title, category, description) VALUES (?, ?, ?, ?, ?)',
          [resolvedAlbumId, photoSrc, photoAlt || null, category || null, photoDesc || null]
        );
        result = retryRes;
      } else {
        throw insertErr;
      }
    }
    logAction(req.user.id, 'CREATE', 'gallery', result.insertId);
    res.status(201).json({
      id: result.insertId,
      album_id: resolvedAlbumId,
      image_url: photoSrc,
      src: photoSrc,
      title: photoAlt,
      alt: photoAlt,
      category,
      description: photoDesc,
      caption: photoDesc,
    });
  } catch (err) {
    if (isDbUnavailable(err)) {
      const memoryAlbumId = resolveMemoryAlbumId(album_id);
      const row = memoryCreate('gallery_photos', {
        album_id: memoryAlbumId,
        src: photoSrc,
        image_url: photoSrc,
        alt: photoAlt,
        title: photoAlt,
        category: category || '',
        caption: photoDesc,
        description: photoDesc,
      });
      return res.status(201).json({ demo: true, ...row });
    }
    res.status(500).json({ error: err.message });
  }
});

// Bulk upload gallery photos
router.post('/gallery_photos/bulk', requireAuth, async (req, res) => {
  const { photos } = req.body;
  if (!Array.isArray(photos) || photos.length === 0) {
    return res.status(400).json({ error: 'photos array is required and must not be empty' });
  }

  const validPhotos = photos.filter((p) => p && p.album_id !== undefined && p.album_id !== null && p.album_id !== '' && (p.src || p.image_url));
  if (validPhotos.length === 0) {
    return res.status(400).json({ error: 'No valid photos provided (album_id and src/image_url required)' });
  }

  try {
    const resolvedPhotos = await Promise.all(
      validPhotos.map(async (p) => {
        const resolvedAlbumId = await resolveAlbumId(p.album_id);
        return {
          album_id: resolvedAlbumId,
          image_url: p.src || p.image_url,
          title: p.alt || p.title || null,
          category: p.category || null,
          description: p.caption || p.description || null,
        };
      })
    );

    const values = resolvedPhotos.map((p) => [
      p.album_id,
      p.image_url,
      p.title,
      p.category,
      p.description,
    ]);

    let result;
    try {
      const [insertRes] = await pool.query(
        'INSERT INTO gallery (album_id, image_url, title, category, description) VALUES ?',
        [values]
      );
      result = insertRes;
    } catch (insertErr) {
      const missingCol = extractMissingColumn(insertErr.message);
      if (missingCol) {
        await tryAddMissingColumn('gallery', missingCol);
        const [retryRes] = await pool.query(
          'INSERT INTO gallery (album_id, image_url, title, category, description) VALUES ?',
          [values]
        );
        result = retryRes;
      } else {
        throw insertErr;
      }
    }

    logAction(req.user.id, 'BULK_CREATE', 'gallery', null, { count: validPhotos.length });
    res.status(201).json({
      success: true,
      count: validPhotos.length,
      affectedRows: result.affectedRows,
      firstInsertId: result.insertId,
    });
  } catch (err) {
    if (isDbUnavailable(err)) {
      const createdList = validPhotos.map((p) => {
        const memoryAlbumId = resolveMemoryAlbumId(p.album_id);
        const img = p.src || p.image_url;
        const txt = p.alt || p.title || '';
        const desc = p.caption || p.description || '';
        return memoryCreate('gallery_photos', {
          album_id: memoryAlbumId,
          src: img,
          image_url: img,
          alt: txt,
          title: txt,
          category: p.category || '',
          caption: desc,
          description: desc,
        });
      });
      return res.status(201).json({
        demo: true,
        success: true,
        count: createdList.length,
        photos: createdList,
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// Bulk delete gallery photos
router.post('/gallery_photos/bulk-delete', requireAuth, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array is required' });
  }

  try {
    const [result] = await pool.query('DELETE FROM gallery WHERE id IN (?)', [ids]);
    logAction(req.user.id, 'BULK_DELETE', 'gallery', null, { ids, count: result.affectedRows });
    res.json({ success: true, count: result.affectedRows });
  } catch (err) {
    if (isDbUnavailable(err)) {
      let count = 0;
      ids.forEach((id) => {
        if (memoryDelete('gallery_photos', id)) count++;
      });
      return res.json({ success: true, count, demo: true });
    }
    res.status(500).json({ error: err.message });
  }
});

// Bulk move gallery photos to a different album
router.post('/gallery_photos/bulk-move', requireAuth, async (req, res) => {
  const { ids, album_id } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || !album_id) {
    return res.status(400).json({ error: 'ids array and album_id are required' });
  }

  try {
    const resolvedAlbumId = await resolveAlbumId(album_id);
    const [result] = await pool.query('UPDATE gallery SET album_id = ? WHERE id IN (?)', [resolvedAlbumId, ids]);
    logAction(req.user.id, 'BULK_MOVE', 'gallery', null, { ids, album_id: resolvedAlbumId, count: result.affectedRows });
    res.json({ success: true, count: result.affectedRows, album_id: resolvedAlbumId });
  } catch (err) {
    if (isDbUnavailable(err)) {
      const memoryAlbumId = resolveMemoryAlbumId(album_id);
      let count = 0;
      ids.forEach((id) => {
        if (memoryUpdate('gallery_photos', id, { album_id: memoryAlbumId })) count++;
      });
      return res.json({ success: true, count, album_id: memoryAlbumId, demo: true });
    }
    res.status(500).json({ error: err.message });
  }
});

// Bulk assign category to gallery photos
router.post('/gallery_photos/bulk-tag', requireAuth, async (req, res) => {
  const { ids, category } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || category === undefined) {
    return res.status(400).json({ error: 'ids array and category are required' });
  }

  try {
    const [result] = await pool.query('UPDATE gallery SET category = ? WHERE id IN (?)', [category, ids]);
    logAction(req.user.id, 'BULK_TAG', 'gallery', null, { ids, category, count: result.affectedRows });
    res.json({ success: true, count: result.affectedRows, category });
  } catch (err) {
    if (isDbUnavailable(err)) {
      let count = 0;
      ids.forEach((id) => {
        if (memoryUpdate('gallery_photos', id, { category })) count++;
      });
      return res.json({ success: true, count, category, demo: true });
    }
    res.status(500).json({ error: err.message });
  }
});

router.put('/gallery_photos/:id', requireAuth, async (req, res) => {
  const { album_id, title, category, description, image_url, src, alt, caption } = req.body;
  const newImg = src || image_url;
  const newTitle = alt !== undefined ? alt : title;
  const newDesc = caption !== undefined ? caption : description;

  try {
    const [existing] = await pool.query('SELECT * FROM gallery WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Photo not found' });
    const row = existing[0];
    const finalAlbumId = album_id !== undefined ? (await resolveAlbumId(album_id)) : row.album_id;
    const finalTitle = newTitle !== undefined ? newTitle : row.title;
    const finalCat = category !== undefined ? category : row.category;
    const finalDesc = newDesc !== undefined ? newDesc : row.description;
    const finalImg = newImg !== undefined ? newImg : row.image_url;

    await pool.query(
      'UPDATE gallery SET album_id = ?, image_url = ?, title = ?, category = ?, description = ? WHERE id = ?',
      [finalAlbumId, finalImg, finalTitle, finalCat, finalDesc, req.params.id]
    );
    logAction(req.user.id, 'UPDATE', 'gallery', Number(req.params.id));
    res.json({ id: Number(req.params.id), album_id: finalAlbumId, image_url: finalImg, title: finalTitle, category: finalCat, description: finalDesc });
  } catch (err) {
    if (isDbUnavailable(err)) {
      const memoryAlbumId = album_id !== undefined ? resolveMemoryAlbumId(album_id) : undefined;
      const updated = memoryUpdate('gallery_photos', req.params.id, {
        ...(memoryAlbumId !== undefined ? { album_id: memoryAlbumId } : {}),
        ...(newImg ? { src: newImg, image_url: newImg } : {}),
        ...(newTitle !== undefined ? { alt: newTitle, title: newTitle } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(newDesc !== undefined ? { caption: newDesc, description: newDesc } : {}),
      });
      return res.json({ id: Number(req.params.id), demo: true, ...(updated || req.body) });
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

// Navigation & Footer Management
router.get('/navigation', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT setting_value FROM navigation_settings WHERE setting_key = 'main_navigation' LIMIT 1");
    if (rows && rows.length > 0 && rows[0].setting_value) {
      const parsed = JSON.parse(rows[0].setting_value);
      return res.json(parsed);
    }
  } catch (err) {
    // If DB unavailable or empty, fallback
  }
  res.json(memory.navigation || data.defaultNavigation);
});

router.put('/navigation', requireAuth, async (req, res) => {
  const { navbar, footer } = req.body;
  if (!navbar && !footer) {
    return res.status(400).json({ error: 'Navbar or footer data required' });
  }

  const current = memory.navigation || JSON.parse(JSON.stringify(data.defaultNavigation));
  const updated = {
    navbar: navbar || current.navbar,
    footer: footer || current.footer,
  };

  memory.navigation = updated;

  try {
    const jsonStr = JSON.stringify(updated);
    await pool.query(
      `INSERT INTO navigation_settings (setting_key, setting_value)
       VALUES ('main_navigation', ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [jsonStr, jsonStr]
    );
    logAction(req.user.id, 'UPDATE', 'navigation_settings', 1, { section: 'navbar_and_footer' });
    res.json({ ok: true, message: 'Navbar and Footer updated successfully', data: updated });
  } catch (err) {
    if (isDbUnavailable(err)) {
      return res.json({ ok: true, message: 'Saved (fallback mode)', data: updated, demo: true });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/navigation/reset', requireAuth, async (req, res) => {
  const def = JSON.parse(JSON.stringify(data.defaultNavigation));
  memory.navigation = def;

  try {
    const jsonStr = JSON.stringify(def);
    await pool.query(
      `INSERT INTO navigation_settings (setting_key, setting_value)
       VALUES ('main_navigation', ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [jsonStr, jsonStr]
    );
    logAction(req.user.id, 'RESET', 'navigation_settings', 1);
    res.json({ ok: true, message: 'Reset to default navigation', data: def });
  } catch (err) {
    if (isDbUnavailable(err)) {
      return res.json({ ok: true, message: 'Reset to default (fallback mode)', data: def, demo: true });
    }
    res.status(500).json({ error: err.message });
  }
});

// Page Settings endpoints (about, home, contact)
const VALID_PAGES = {
  about: 'about_settings',
  home: 'home_settings',
  contact: 'contact_settings',
};

router.get('/page_settings/:page', requireAuth, async (req, res) => {
  const page = req.params.page;
  const tableName = VALID_PAGES[page];
  if (!tableName) {
    return res.status(400).json({ error: `Invalid page: ${page}. Supported: about, home, contact` });
  }

  try {
    const [rows] = await pool.query(`SELECT setting_key, setting_value FROM ${tableName}`);
    const settings = {};
    (rows || []).forEach((row) => {
      try {
        settings[row.setting_key] = JSON.parse(row.setting_value);
      } catch {
        settings[row.setting_key] = row.setting_value;
      }
    });
    res.json(settings);
  } catch (err) {
    if (isDbUnavailable(err)) {
      return res.json(memory.page_settings[page] || {});
    }
    res.status(500).json({ error: err.message });
  }
});

router.put('/page_settings/:page', requireAuth, async (req, res) => {
  const page = req.params.page;
  const tableName = VALID_PAGES[page];
  if (!tableName) {
    return res.status(400).json({ error: `Invalid page: ${page}. Supported: about, home, contact` });
  }

  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'settings object required' });
  }

  // Always keep in-memory cache synchronized immediately
  if (!memory.page_settings[page]) memory.page_settings[page] = {};
  Object.assign(memory.page_settings[page], settings);

  try {
    for (const [key, val] of Object.entries(settings)) {
      const stringVal = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '');
      try {
        await pool.query(
          `INSERT INTO ${tableName} (setting_key, setting_value)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [key, stringVal]
        );
      } catch (insertErr) {
        if (insertErr.code === 'ER_NO_SUCH_TABLE' || (insertErr.message && insertErr.message.includes("doesn't exist"))) {
          await pool.query(`CREATE TABLE IF NOT EXISTS ${tableName} (
            id INT PRIMARY KEY AUTO_INCREMENT,
            setting_key VARCHAR(100) NOT NULL UNIQUE,
            setting_value LONGTEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )`);
          await pool.query(
            `INSERT INTO ${tableName} (setting_key, setting_value)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
            [key, stringVal]
          );
        } else {
          throw insertErr;
        }
      }
    }
    logAction(req.user.id, 'UPDATE_PAGE_SETTINGS', tableName, null, { keys: Object.keys(settings) });
    res.json({ ok: true, message: `${page} page settings updated successfully`, updated: Object.keys(settings).length });
  } catch (err) {
    if (isDbUnavailable(err)) {
      return res.json({ ok: true, message: 'Settings saved (fallback mode)', demo: true, updated: Object.keys(settings).length });
    }
    res.status(500).json({ error: err.message });
  }
});

export function getActiveNavigation() {
  return memory.navigation || data.defaultNavigation;
}

export function getLeadershipMemory() {
  return memory.team || [];
}

export function getPageSettingsMemory(page) {
  return (memory.page_settings && memory.page_settings[page]) || {};
}

export default router;
