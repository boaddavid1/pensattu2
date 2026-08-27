// prayerRoutes.js — Operation Paga prayer request API
// Converted from the PHP prayer project (submit_prayer.php, prayer_request.php, students.php).
//
// Endpoints:
//   Public:
//     POST   /api/prayers                — submit an anonymous prayer request
//   Student prayer admin (separate password login, JWT with role 'prayer_admin'):
//     POST   /api/prayers/student/login  — password login (brute-force protected)
//     GET    /api/prayers/student/me     — current prayer admin session
//     GET    /api/prayers?userStatus=Student — list student prayers (auth)
//     GET    /api/prayers/stats?userStatus=Student — stats (auth)
//     POST   /api/prayers/:id/pray       — mark as prayed (auth)
//     POST   /api/prayers/bulk-pray      — bulk mark as prayed (auth)
//     DELETE /api/prayers/:id            — delete (auth)
//     POST   /api/prayers/bulk-delete    — bulk delete (auth)
//   Alumni prayer admin (superadmin JWT via requireAuth):
//     same list/stats/pray/bulk/delete endpoints with userStatus=Alumni

import { Router } from 'express';
import pool from '../server/db.js';
import { requireAuth, generateToken, verifyToken, comparePassword } from '../server/auth.js';

const router = Router();

// Default to the bcrypt hash from the original PHP config/auth.php so the same
// password continues to work after migration. Override via PRAYER_ADMIN_PASSWORD_HASH.
const PRAYER_ADMIN_PASSWORD_HASH =
  process.env.PRAYER_ADMIN_PASSWORD_HASH ||
  '$2y$10$o13F0b.vvoEi4m6qbMtP0uOq0wmnG83RUnVavUyMlaaME4604b/HK';

const VALID_CATEGORIES = [
  'healing', 'guidance', 'academics', 'family', 'career',
  'spiritual', 'campus', 'thanks', 'other',
];

// ---- Brute-force protection (in-memory, keyed by IP) ----
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 900; // 15 minutes
const loginAttempts = new Map(); // ip -> { count, lastAttempt }

function checkLockout(ip) {
  const rec = loginAttempts.get(ip);
  if (!rec) return { locked: false, remaining: 0 };
  const now = Date.now();
  const elapsed = (now - rec.lastAttempt) / 1000;
  if (rec.count >= MAX_ATTEMPTS && elapsed < LOCKOUT_SECONDS) {
    return { locked: true, remaining: Math.ceil((LOCKOUT_SECONDS - elapsed) / 60) };
  }
  if (elapsed >= LOCKOUT_SECONDS) {
    loginAttempts.delete(ip);
  }
  return { locked: false, remaining: 0 };
}

function recordFailedAttempt(ip) {
  const rec = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  rec.count += 1;
  rec.lastAttempt = Date.now();
  loginAttempts.set(ip, rec);
}

function clearAttempts(ip) {
  loginAttempts.delete(ip);
}

function getIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim() || 'unknown';
}

// ---- Auth middleware for the separate prayer admin (student) login ----
function requirePrayerAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const user = verifyToken(token);
  if (!user || (user.role !== 'prayer_admin' && user.role !== 'superadmin')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  next();
}

// Student prayer admins (role 'prayer_admin') can ONLY ever see Student
// prayers, no matter what userStatus they pass. Superadmins (alumni portal)
// can filter by any userStatus. This is enforced server-side for security.
function effectiveUserStatus(req) {
  if (req.user && req.user.role === 'prayer_admin') return 'Student';
  const us = req.query.userStatus || req.body.userStatus;
  return (us && ['Alumni', 'Student'].includes(us)) ? us : null;
}

// ============================================================
// PUBLIC: Submit a prayer request (replaces submit_prayer.php)
// ============================================================
router.post('/', async (req, res) => {
  try {
    const { category, userStatus, prayerText } = req.body || {};

    if (!category || !userStatus || !prayerText) {
      return res.status(400).json({ success: false, message: 'Category, status, and prayer text are required.' });
    }

    const cat = String(category).trim();
    const status = String(userStatus).trim();
    const text = String(prayerText).trim();

    if (!cat || !status || !text) {
      return res.status(400).json({ success: false, message: 'Category, status, and prayer text are required.' });
    }
    if (!['Alumni', 'Student'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status selected.' });
    }

    const ip = getIp(req);

    await pool.query(
      'INSERT INTO prayer_requests (category, user_status, prayer_text, ip_address) VALUES (?, ?, ?, ?)',
      [cat, status, text, ip]
    );

    res.json({ success: true, message: 'Prayer request received.' });
  } catch (err) {
    console.error('Prayer submission error:', err.message);
    res.status(500).json({ success: false, message: 'Database error. Please try later.' });
  }
});

// ============================================================
// STUDENT PRAYER ADMIN: separate password login (replaces students.php login)
// ============================================================
router.post('/student/login', async (req, res) => {
  const ip = getIp(req);
  const { lockout, remaining } = checkLockout(ip);
  if (lockout) {
    return res.status(429).json({ error: `Too many failed attempts. Please try again in ${remaining} minute(s).` });
  }

  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  const ok = await comparePassword(String(password), PRAYER_ADMIN_PASSWORD_HASH);
  if (!ok) {
    recordFailedAttempt(ip);
    return res.status(401).json({ error: 'Invalid password. Please try again.' });
  }

  clearAttempts(ip);
  const token = generateToken({ id: 0, email: 'prayer-admin', role: 'prayer_admin', name: 'Prayer Admin' });
  res.json({ token, user: { name: 'Prayer Admin', role: 'prayer_admin' } });
});

router.get('/student/me', requirePrayerAdmin, (req, res) => {
  res.json({ user: req.user });
});

// ============================================================
// ADMIN: List prayer requests with filters + pagination
// (replaces the listing logic in prayer_request.php & students.php)
// ============================================================
router.get('/', requirePrayerAdmin, async (req, res) => {
  try {
    const { category, status, date_from, date_to, page } = req.query;
    const userStatus = effectiveUserStatus(req);
    const perPage = 20;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const offset = (pageNum - 1) * perPage;

    const where = [];
    const params = [];

    if (userStatus) {
      where.push('user_status = ?');
      params.push(userStatus);
    }
    if (category) { where.push('category = ?'); params.push(category); }
    if (status) { where.push('status = ?'); params.push(status); }
    if (date_from) { where.push('DATE(submitted_at) >= ?'); params.push(date_from); }
    if (date_to) { where.push('DATE(submitted_at) <= ?'); params.push(date_to); }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM prayer_requests ${whereSql}`, params);
    const totalPages = Math.ceil(total / perPage);

    const [rows] = await pool.query(
      `SELECT * FROM prayer_requests ${whereSql} ORDER BY submitted_at DESC LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );

    res.json({
      requests: rows,
      pagination: { page: pageNum, perPage, total, totalPages },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ADMIN: Stats (overall + per-category) for a given userStatus
// ============================================================
router.get('/stats', requirePrayerAdmin, async (req, res) => {
  try {
    const userStatus = effectiveUserStatus(req);
    const statusFilter = userStatus ? 'WHERE user_status = ?' : '';
    const params = userStatus ? [userStatus] : [];

    const [[overall]] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'prayed' THEN 1 ELSE 0 END) AS prayed
       FROM prayer_requests ${statusFilter}`,
      params
    );

    const [categoryStats] = await pool.query(
      `SELECT category, COUNT(*) AS count FROM prayer_requests ${statusFilter} GROUP BY category`,
      params
    );

    res.json({
      total: overall.total || 0,
      pending: overall.pending || 0,
      prayed: overall.prayed || 0,
      categoryStats,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ADMIN: Mark a single request as prayed
// ============================================================
router.post('/:id/pray', requirePrayerAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userStatus = effectiveUserStatus(req);
    const statusClause = userStatus ? 'AND user_status = ?' : '';
    const params = userStatus ? [id, userStatus] : [id];

    await pool.query(
      `UPDATE prayer_requests SET status = 'prayed', prayed_at = NOW() WHERE id = ? ${statusClause}`,
      params
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ADMIN: Bulk mark as prayed
// ============================================================
router.post('/bulk-pray', requirePrayerAdmin, async (req, res) => {
  try {
    let ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    ids = ids.map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
    if (!ids.length) return res.status(400).json({ error: 'No ids provided' });

    const userStatus = effectiveUserStatus(req);
    const placeholders = ids.map(() => '?').join(',');
    const statusClause = userStatus ? 'AND user_status = ?' : '';
    const params = userStatus ? [...ids, userStatus] : ids;

    await pool.query(
      `UPDATE prayer_requests SET status = 'prayed', prayed_at = NOW() WHERE id IN (${placeholders}) ${statusClause}`,
      params
    );
    res.json({ ok: true, count: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ADMIN: Delete a single request
// ============================================================
router.delete('/:id', requirePrayerAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userStatus = effectiveUserStatus(req);
    const statusClause = userStatus ? 'AND user_status = ?' : '';
    const params = userStatus ? [id, userStatus] : [id];

    await pool.query(`DELETE FROM prayer_requests WHERE id = ? ${statusClause}`, params);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ADMIN: Bulk delete
// ============================================================
router.post('/bulk-delete', requirePrayerAdmin, async (req, res) => {
  try {
    let ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    ids = ids.map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
    if (!ids.length) return res.status(400).json({ error: 'No ids provided' });

    const userStatus = effectiveUserStatus(req);
    const placeholders = ids.map(() => '?').join(',');
    const statusClause = userStatus ? 'AND user_status = ?' : '';
    const params = userStatus ? [...ids, userStatus] : ids;

    await pool.query(`DELETE FROM prayer_requests WHERE id IN (${placeholders}) ${statusClause}`, params);
    res.json({ ok: true, count: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { VALID_CATEGORIES };
export default router;
