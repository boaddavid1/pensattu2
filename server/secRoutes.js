// secRoutes.js — PENSA TTU member management API (converted from the PHP sec project)
// All endpoints are prefixed with /api/sec and connect to the u197926764_pensattu database.
//
// Endpoints:
//   Auth:
//     POST   /api/sec/auth/register     — register a new admin user
//     POST   /api/sec/auth/login        — login (returns JWT)
//     GET    /api/sec/auth/me           — current user
//     POST   /api/sec/auth/logout       — logout (client-side)
//   Dashboard:
//     GET    /api/sec/dashboard          — stats
//   Members:
//     GET    /api/sec/members            — list (search, filter, pagination)
//     GET    /api/sec/members/:id        — get one
//     POST   /api/sec/members            — create
//     PUT    /api/sec/members/:id        — update
//     DELETE /api/sec/members/:id        — delete
//     POST   /api/sec/members/import     — bulk import (CSV/JSON)
//     POST   /api/sec/members/:id/graduate — graduate to alumni
//   Attendance:
//     GET    /api/sec/attendance/sessions — list sessions
//     POST   /api/sec/attendance/sessions — create session
//     GET    /api/sec/attendance/sessions/:id — session details + records
//     POST   /api/sec/attendance/sessions/:id/checkin — check in member
//     POST   /api/sec/attendance/sessions/:id/visitor — add visitor
//     POST   /api/sec/attendance/ai      — AI query
//   Messages (SMS):
//     POST   /api/sec/messages/send      — send bulk SMS
//     GET    /api/sec/messages/logs      — SMS history
//   Halls:
//     GET    /api/sec/halls              — members grouped by hall
//   Alumni:
//     GET    /api/sec/alumni             — list alumni
//     PUT    /api/sec/alumni/:id         — update alumni
//     DELETE /api/sec/alumni/:id         — delete alumni
//   Reports:
//     GET    /api/sec/reports            — generate report (type, from, to)
//   Export:
//     GET    /api/sec/export             — export data (CSV)
//   Settings:
//     GET    /api/sec/settings/users     — list admin users
//     POST   /api/sec/settings/users     — create admin user
//     PUT    /api/sec/settings/users/:id — update admin user
//     DELETE /api/sec/settings/users/:id — delete admin user
//     GET    /api/sec/settings/logs      — activity logs
//     GET    /api/sec/settings/sms-config — SMS config
//     PUT    /api/sec/settings/sms-config — update SMS config

import { Router } from 'express';
import secPool from './secDb.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();

const SEC_JWT_SECRET = process.env.SEC_JWT_SECRET || process.env.JWT_SECRET || 'sec-dev-secret';

// ─── Helpers ───────────────────────────────────────────────
function getIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim() || '0.0.0.0';
}

async function logActivity(conn, userId, username, action, details = '', req) {
  try {
    await conn.query(
      'INSERT INTO activity_logs (user_id, username, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username, action, details, getIp(req), req.headers['user-agent'] || '']
    );
  } catch (e) { /* silent */ }
}

function generateSecToken(user) {
  return jwt.sign(user, SEC_JWT_SECRET, { expiresIn: '8h' });
}

function verifySecToken(token) {
  try { return jwt.verify(token, SEC_JWT_SECRET); } catch { return null; }
}

// Auth middleware
function requireSecAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const user = verifySecToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}

function requireSecAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin required' });
  next();
}

// ─── Auth ──────────────────────────────────────────────────
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });

    const hashed = await bcrypt.hash(password, 10);
    await secPool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashed]);
    await logActivity(secPool, null, username, 'USER_REGISTER', `New user: ${username} (${email})`, req);
    res.json({ success: true, message: 'Registration successful' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const [rows] = await secPool.query('SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1', [email, email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateSecToken({ id: user.id, username: user.username, email: user.email, role: user.role || 'user' });
    await logActivity(secPool, user.id, user.username, 'USER_LOGIN', `Login from ${getIp(req)}`, req);
    res.json({ success: true, token, user: { id: user.id, username: user.username, email: user.email, role: user.role || 'user' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/auth/me', requireSecAuth, (req, res) => {
  res.json({ user: req.user });
});

// ─── Dashboard ─────────────────────────────────────────────
router.get('/dashboard', requireSecAuth, async (req, res) => {
  try {
    const [[total]] = await secPool.query('SELECT COUNT(*) as total FROM registrations');
    const [[members]] = await secPool.query("SELECT COUNT(*) as cnt FROM registrations WHERE membership_type = 'member'");
    const [[associates]] = await secPool.query("SELECT COUNT(*) as cnt FROM registrations WHERE membership_type = 'associate'");
    const [[male]] = await secPool.query("SELECT COUNT(*) as cnt FROM registrations WHERE gender = 'male'");
    const [[female]] = await secPool.query("SELECT COUNT(*) as cnt FROM registrations WHERE gender = 'female'");
    const [[officers]] = await secPool.query('SELECT COUNT(*) as cnt FROM registrations WHERE is_officer = 1');
    const [[recent]] = await secPool.query('SELECT COUNT(*) as cnt FROM registrations WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    const [[alumniCount]] = await secPool.query('SELECT COUNT(*) as cnt FROM alumni');
    const [durations] = await secPool.query('SELECT program_duration, COUNT(*) as cnt FROM registrations WHERE program_duration IS NOT NULL GROUP BY program_duration');
    const [levels] = await secPool.query('SELECT education_level, COUNT(*) as cnt FROM registrations WHERE education_level IS NOT NULL GROUP BY education_level');
    const [halls] = await secPool.query('SELECT campus_hall, COUNT(*) as cnt FROM registrations WHERE campus_hall IS NOT NULL AND campus_hall != "" GROUP BY campus_hall');
    const [recentMembers] = await secPool.query('SELECT id, surname, othernames, gender, membership_type, created_at FROM registrations ORDER BY created_at DESC LIMIT 10');

    res.json({
      stats: {
        total: total.total, members: members.cnt, associates: associates.cnt,
        male: male.cnt, female: female.cnt, officers: officers.cnt,
        recent: recent.cnt, alumni: alumniCount.cnt,
      },
      durations: Object.fromEntries(durations.map(d => [d.program_duration, d.cnt])),
      levels: Object.fromEntries(levels.map(l => [l.education_level, l.cnt])),
      halls: Object.fromEntries(halls.map(h => [h.campus_hall, h.cnt])),
      recentMembers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Members ───────────────────────────────────────────────
router.get('/members', requireSecAuth, async (req, res) => {
  try {
    const { search, gender, membership_type, hall, officer, level, duration, page, perPage } = req.query;
    const pp = Math.min(parseInt(perPage) || 20, 200);
    const pg = Math.max(parseInt(page) || 1, 1);
    const offset = (pg - 1) * pp;

    const where = [];
    const params = [];
    if (search) {
      where.push('(surname LIKE ? OR othernames LIKE ? OR contact LIKE ? OR program LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (gender) { where.push('gender = ?'); params.push(gender); }
    if (membership_type) { where.push('membership_type = ?'); params.push(membership_type); }
    if (hall) { where.push('campus_hall = ?'); params.push(hall); }
    if (officer === 'true') { where.push('is_officer = 1'); }
    if (level) { where.push('education_level = ?'); params.push(level); }
    if (duration) { where.push('program_duration = ?'); params.push(duration); }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await secPool.query(`SELECT COUNT(*) as total FROM registrations ${whereSql}`, params);
    const [rows] = await secPool.query(
      `SELECT * FROM registrations ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pp, offset]
    );

    res.json({ members: rows, pagination: { page: pg, perPage: pp, total, totalPages: Math.ceil(total / pp) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Members grouped by education level — returns only counts (fast, no member data)
router.get('/members/by-level', requireSecAuth, async (req, res) => {
  try {
    const { search, gender, membership_type, hall, officer, duration } = req.query;
    const where = [];
    const params = [];
    if (search) {
      where.push('(surname LIKE ? OR othernames LIKE ? OR contact LIKE ? OR program LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (gender) { where.push('gender = ?'); params.push(gender); }
    if (membership_type) { where.push('membership_type = ?'); params.push(membership_type); }
    if (hall) { where.push('campus_hall = ?'); params.push(hall); }
    if (officer === 'true') { where.push('is_officer = 1'); }
    if (duration) { where.push('program_duration = ?'); params.push(duration); }

    // Single query: counts per level (only fetches aggregate, no row data)
    const levelWhere = where.length
      ? `WHERE ${where.join(' AND ')} AND education_level IS NOT NULL AND education_level != ''`
      : `WHERE education_level IS NOT NULL AND education_level != ''`;
    const [rows] = await secPool.query(
      `SELECT education_level as level, COUNT(*) as count FROM registrations ${levelWhere} GROUP BY education_level ORDER BY CAST(education_level AS UNSIGNED), education_level`,
      params
    );

    // Also get unspecified count
    const unspecWhere = where.length
      ? `WHERE ${where.join(' AND ')} AND (education_level IS NULL OR education_level = '')`
      : `WHERE education_level IS NULL OR education_level = ''`;
    const [[{ unspecCount }]] = await secPool.query(
      `SELECT COUNT(*) as unspecCount FROM registrations ${unspecWhere}`,
      params
    );

    const levels = rows.map(r => ({ level: r.level, count: r.count }));
    if (unspecCount > 0) levels.push({ level: 'Unspecified', count: unspecCount });

    const total = levels.reduce((sum, l) => sum + l.count, 0);
    res.json({ levels, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/members/:id', requireSecAuth, async (req, res) => {
  try {
    const [rows] = await secPool.query('SELECT * FROM registrations WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ member: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/members', requireSecAuth, async (req, res) => {
  try {
    const b = req.body;
    const [result] = await secPool.query(
      `INSERT INTO registrations (surname, othernames, gender, dob, contact, residence, room, program, program_duration, education_level, membership_type, campus_residence, campus_hall, offcampus_location, landmark, is_officer, officer_role, district, pastor, guardian, guardian_contact, other_info)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [b.surname, b.othernames, b.gender, b.dob || null, b.contact || null, b.residence || null, b.room || null, b.program || null, b.program_duration || null, b.education_level || null, b.membership_type || 'member', b.campus_residence === 'on-campus' ? 'yes' : b.campus_residence === 'off-campus' ? 'no' : (b.campus_residence || null), b.campus_hall || null, b.offcampus_location || null, b.landmark || null, b.is_officer ? 1 : 0, b.officer_role || null, b.district || null, b.pastor || null, b.guardian || null, b.guardian_contact || null, b.departments || b.other_info || null]
    );
    await logActivity(secPool, req.user.id, req.user.username, 'ADD_MEMBER', `Added: ${b.surname} ${b.othernames}`, req);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/members/:id', requireSecAuth, async (req, res) => {
  try {
    const b = req.body;
    await secPool.query(
      `UPDATE registrations SET surname=?, othernames=?, gender=?, dob=?, contact=?, residence=?, room=?, program=?, program_duration=?, education_level=?, membership_type=?, campus_residence=?, campus_hall=?, offcampus_location=?, landmark=?, is_officer=?, officer_role=?, district=?, pastor=?, guardian=?, guardian_contact=?, other_info=? WHERE id=?`,
      [b.surname, b.othernames, b.gender, b.dob || null, b.contact || null, b.residence || null, b.room || null, b.program || null, b.program_duration || null, b.education_level || null, b.membership_type || 'member', b.campus_residence === 'on-campus' ? 'yes' : b.campus_residence === 'off-campus' ? 'no' : (b.campus_residence || null), b.campus_hall || null, b.offcampus_location || null, b.landmark || null, b.is_officer ? 1 : 0, b.officer_role || null, b.district || null, b.pastor || null, b.guardian || null, b.guardian_contact || null, b.departments || b.other_info || null, req.params.id]
    );
    await logActivity(secPool, req.user.id, req.user.username, 'EDIT_MEMBER', `Edited member #${req.params.id}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/members/:id', requireSecAuth, async (req, res) => {
  try {
    const [rows] = await secPool.query('SELECT surname, othernames FROM registrations WHERE id = ?', [req.params.id]);
    await secPool.query('DELETE FROM registrations WHERE id = ?', [req.params.id]);
    const name = rows.length ? `${rows[0].surname} ${rows[0].othernames}` : `#${req.params.id}`;
    await logActivity(secPool, req.user.id, req.user.username, 'DELETE_MEMBER', `Deleted: ${name}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/members/import', requireSecAuth, async (req, res) => {
  try {
    const { members } = req.body;
    if (!Array.isArray(members) || !members.length) return res.status(400).json({ error: 'No members provided' });

    let imported = 0, skipped = 0;
    for (const m of members) {
      try {
        await secPool.query(
          `INSERT INTO registrations (surname, othernames, gender, contact, program, program_duration, education_level, membership_type, campus_hall, district)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [m.surname || '', m.othernames || '', m.gender || 'male', m.contact || null, m.program || null, m.program_duration || null, m.education_level || null, m.membership_type || 'member', m.campus_hall || null, m.district || null]
        );
        imported++;
      } catch { skipped++; }
    }
    await logActivity(secPool, req.user.id, req.user.username, 'IMPORT_MEMBERS', `Imported ${imported}, skipped ${skipped}`, req);
    res.json({ success: true, imported, skipped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/members/:id/graduate', requireSecAuth, async (req, res) => {
  try {
    const [rows] = await secPool.query('SELECT * FROM registrations WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Member not found' });
    const m = rows[0];

    await secPool.query(
      `INSERT INTO alumni (registration_id, surname, othernames, gender, dob, contact, program, education_level, graduation_year)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [m.id, m.surname, m.othernames, m.gender, m.dob, m.contact, m.program, m.education_level, new Date().getFullYear()]
    );
    await secPool.query('UPDATE registrations SET graduated = 1 WHERE id = ?', [req.params.id]);
    await logActivity(secPool, req.user.id, req.user.username, 'GRADUATE_MEMBER', `Graduated: ${m.surname} ${m.othernames}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Attendance ────────────────────────────────────────────
router.get('/attendance/sessions', requireSecAuth, async (req, res) => {
  try {
    const [sessions] = await secPool.query('SELECT * FROM attendance_sessions ORDER BY session_date DESC LIMIT 100');
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/attendance/sessions', requireSecAuth, async (req, res) => {
  try {
    const { session_name, session_date, session_type, description } = req.body;
    const [result] = await secPool.query(
      'INSERT INTO attendance_sessions (session_name, session_date, session_type, description) VALUES (?,?,?,?)',
      [session_name, session_date, session_type || 'sunday', description || null]
    );
    await logActivity(secPool, req.user.id, req.user.username, 'CREATE_SESSION', `Session: ${session_name}`, req);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/attendance/sessions/:id', requireSecAuth, async (req, res) => {
  try {
    const [sessions] = await secPool.query('SELECT * FROM attendance_sessions WHERE id = ?', [req.params.id]);
    if (!sessions.length) return res.status(404).json({ error: 'Session not found' });
    const [records] = await secPool.query(
      `SELECT ar.*, r.surname, r.othernames, r.contact FROM attendance_records ar JOIN registrations r ON ar.registration_id = r.id WHERE ar.session_id = ?`,
      [req.params.id]
    );
    const [visitors] = await secPool.query('SELECT * FROM attendance_visitors WHERE session_id = ?', [req.params.id]);
    res.json({ session: sessions[0], records, visitors, count: records.length + visitors.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/attendance/sessions/:id/checkin', requireSecAuth, async (req, res) => {
  try {
    const { registration_id } = req.body;
    await secPool.query('INSERT IGNORE INTO attendance_records (session_id, registration_id) VALUES (?, ?)', [req.params.id, registration_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/attendance/sessions/:id/visitor', requireSecAuth, async (req, res) => {
  try {
    const { name, contact, invited_by } = req.body;
    const [result] = await secPool.query(
      'INSERT INTO attendance_visitors (session_id, name, contact, invited_by) VALUES (?,?,?,?)',
      [req.params.id, name, contact || null, invited_by || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/attendance/ai', requireSecAuth, async (req, res) => {
  try {
    const { query } = req.body;
    const q = (query || '').toLowerCase().trim();

    const [[{ totalMembers }]] = await secPool.query('SELECT COUNT(*) as totalMembers FROM registrations WHERE graduated = 0 OR graduated IS NULL');
    const [[{ activeSessions }]] = await secPool.query("SELECT COUNT(*) as activeSessions FROM attendance_sessions WHERE status IN ('upcoming','ongoing')");
    const [[{ completedSessions }]] = await secPool.query("SELECT COUNT(*) as completedSessions FROM attendance_sessions WHERE status = 'completed'");
    const [[{ totalVisitors }]] = await secPool.query('SELECT COUNT(*) as totalVisitors FROM attendance_visitors');

    let answer = '';
    if (q.match(/how many.*members|total.*members|number of.*members/)) {
      answer = `There are currently ${totalMembers} active members in the system.`;
    } else if (q.match(/how many.*visitors|total.*visitors/)) {
      answer = `There have been ${totalVisitors} visitors recorded total.`;
    } else if (q.match(/active.*session|ongoing|upcoming/)) {
      answer = `There are ${activeSessions} active/upcoming sessions.`;
    } else if (q.match(/completed|past.*session/)) {
      answer = `There are ${completedSessions} completed sessions.`;
    } else if (q.match(/summary|overview|stats/)) {
      answer = `Overview: ${totalMembers} members, ${activeSessions} active sessions, ${completedSessions} completed sessions, ${totalVisitors} visitors.`;
    } else {
      answer = `I can answer questions about: member count, visitor count, active/completed sessions, or general overview. Try asking "How many members do we have?"`;
    }

    await logActivity(secPool, req.user.id, req.user.username, 'AI_QUERY', `Query: ${q}`, req);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Messages (SMS) ────────────────────────────────────────
router.post('/messages/send', requireSecAuth, async (req, res) => {
  try {
    const { message, recipients, recipient_group } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // Determine recipients
    let phoneList = [];
    if (recipients && Array.isArray(recipients)) {
      phoneList = recipients;
    } else if (recipient_group === 'all') {
      const [rows] = await secPool.query("SELECT contact FROM registrations WHERE contact IS NOT NULL AND contact != ''");
      phoneList = rows.map(r => r.contact);
    } else if (recipient_group === 'members') {
      const [rows] = await secPool.query("SELECT contact FROM registrations WHERE membership_type = 'member' AND contact IS NOT NULL AND contact != ''");
      phoneList = rows.map(r => r.contact);
    } else if (recipient_group === 'officers') {
      const [rows] = await secPool.query("SELECT contact FROM registrations WHERE is_officer = 1 AND contact IS NOT NULL AND contact != ''");
      phoneList = rows.map(r => r.contact);
    }

    if (!phoneList.length) return res.status(400).json({ error: 'No recipients found' });

    // Send via Arkesel SMS API
    const apiKey = process.env.ARKESEL_API_KEY || '';
    const senderId = process.env.ARKESEL_SENDER_ID || 'PENSA-TTU';

    let sent = 0, failed = 0;
    if (apiKey) {
      const formatted = phoneList.map(p => {
        let ph = p.replace(/[^0-9]/g, '');
        if (ph.startsWith('0')) ph = '233' + ph.slice(1);
        else if (!ph.startsWith('233')) ph = '233' + ph;
        return ph;
      });
      try {
        const response = await fetch('https://api.arkesel.com/v2/sms/send', {
          method: 'POST',
          headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: formatted.join(','), from: senderId, message }),
        });
        const result = await response.json();
        sent = formatted.length;
        await secPool.query(
          'INSERT INTO sms_logs (recipient, message, status, type, recipient_group, sent_by, response) VALUES (?,?,?,?,?,?,?)',
          [formatted.join(','), message, 'sent', 'bulk', recipient_group || 'custom', req.user.username, JSON.stringify(result)]
        );
      } catch (smsErr) {
        failed = phoneList.length;
        await secPool.query(
          'INSERT INTO sms_logs (recipient, message, status, type, recipient_group, sent_by, error_message) VALUES (?,?,?,?,?,?,?)',
          [phoneList.join(','), message, 'failed', 'bulk', recipient_group || 'custom', req.user.username, smsErr.message]
        );
      }
    } else {
      // No API key — log as pending
      sent = 0; failed = phoneList.length;
      await secPool.query(
        'INSERT INTO sms_logs (recipient, message, status, type, recipient_group, sent_by, error_message) VALUES (?,?,?,?,?,?,?)',
        [phoneList.join(','), message, 'pending', 'bulk', recipient_group || 'custom', req.user.username, 'No ARKESEL_API_KEY set']
      );
    }

    await logActivity(secPool, req.user.id, req.user.username, 'SEND_SMS', `Sent to ${phoneList.length} recipients`, req);
    res.json({ success: true, sent, failed, total: phoneList.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/messages/logs', requireSecAuth, async (req, res) => {
  try {
    const [logs] = await secPool.query('SELECT * FROM sms_logs ORDER BY sent_at DESC LIMIT 100');
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Halls ─────────────────────────────────────────────────
router.get('/halls', requireSecAuth, async (req, res) => {
  try {
    const [halls] = await secPool.query(
      `SELECT campus_hall, COUNT(*) as count FROM registrations WHERE campus_hall IS NOT NULL AND campus_hall != '' GROUP BY campus_hall ORDER BY count DESC`
    );
    const result = [];
    for (const h of halls) {
      const [members] = await secPool.query('SELECT id, surname, othernames, gender, contact, program, education_level, program_duration FROM registrations WHERE campus_hall = ? ORDER BY surname', [h.campus_hall]);
      result.push({ hall: h.campus_hall, count: h.count, members });
    }
    // Also include off-campus
    const [offcampus] = await secPool.query("SELECT id, surname, othernames, gender, contact, program, education_level, offcampus_location FROM registrations WHERE campus_residence = 'off-campus' ORDER BY surname");
    if (offcampus.length) result.push({ hall: 'Off-Campus', count: offcampus.length, members: offcampus });
    res.json({ halls: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Alumni ────────────────────────────────────────────────
router.get('/alumni', requireSecAuth, async (req, res) => {
  try {
    const { search, page, perPage } = req.query;
    const pp = Math.min(parseInt(perPage) || 20, 200);
    const pg = Math.max(parseInt(page) || 1, 1);
    const offset = (pg - 1) * pp;

    const where = [];
    const params = [];
    if (search) {
      where.push('(surname LIKE ? OR othernames LIKE ? OR program LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [[{ total }]] = await secPool.query(`SELECT COUNT(*) as total FROM alumni ${whereSql}`, params);
    const [rows] = await secPool.query(`SELECT * FROM alumni ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, pp, offset]);
    res.json({ alumni: rows, pagination: { page: pg, perPage: pp, total, totalPages: Math.ceil(total / pp) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/alumni/:id', requireSecAuth, async (req, res) => {
  try {
    const b = req.body;
    await secPool.query(
      `UPDATE alumni SET surname=?, othernames=?, gender=?, dob=?, contact=?, program=?, education_level=?, graduation_year=?, alumni_status=? WHERE id=?`,
      [b.surname, b.othernames, b.gender, b.dob || null, b.contact || null, b.program || null, b.education_level || null, b.graduation_year || null, b.alumni_status || 'active', req.params.id]
    );
    await logActivity(secPool, req.user.id, req.user.username, 'EDIT_ALUMNI', `Edited alumni #${req.params.id}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/alumni/:id', requireSecAuth, async (req, res) => {
  try {
    await secPool.query('DELETE FROM alumni WHERE id = ?', [req.params.id]);
    await logActivity(secPool, req.user.id, req.user.username, 'DELETE_ALUMNI', `Deleted alumni #${req.params.id}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Reports ───────────────────────────────────────────────
router.get('/reports', requireSecAuth, async (req, res) => {
  try {
    const { type, from, to } = req.query;
    const dateFrom = from || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const dateTo = to || new Date().toISOString().slice(0, 10);
    let data = [], title = '';

    switch (type) {
      case 'membership':
        title = 'Membership Report';
        const [[t]] = await secPool.query('SELECT COUNT(*) as v FROM registrations');
        const [[m]] = await secPool.query("SELECT COUNT(*) as v FROM registrations WHERE membership_type='member'");
        const [[a]] = await secPool.query("SELECT COUNT(*) as v FROM registrations WHERE membership_type='associate'");
        data = [
          { label: 'Members', count: m.v, pct: t.v ? ((m.v / t.v) * 100).toFixed(1) : 0 },
          { label: 'Associates', count: a.v, pct: t.v ? ((a.v / t.v) * 100).toFixed(1) : 0 },
          { label: 'Total', count: t.v, pct: 100 },
        ];
        break;
      case 'gender':
        title = 'Gender Distribution';
        const [[gt]] = await secPool.query('SELECT COUNT(*) as v FROM registrations');
        const [[gm]] = await secPool.query("SELECT COUNT(*) as v FROM registrations WHERE gender='male'");
        const [[gf]] = await secPool.query("SELECT COUNT(*) as v FROM registrations WHERE gender='female'");
        data = [
          { label: 'Male', count: gm.v, pct: gt.v ? ((gm.v / gt.v) * 100).toFixed(1) : 0 },
          { label: 'Female', count: gf.v, pct: gt.v ? ((gf.v / gt.v) * 100).toFixed(1) : 0 },
          { label: 'Total', count: gt.v, pct: 100 },
        ];
        break;
      case 'hall':
        title = 'Hall Distribution';
        const [halls] = await secPool.query("SELECT campus_hall as label, COUNT(*) as count FROM registrations WHERE campus_hall IS NOT NULL AND campus_hall != '' GROUP BY campus_hall ORDER BY count DESC");
        const [[hallTotal]] = await secPool.query("SELECT COUNT(*) as v FROM registrations WHERE campus_hall IS NOT NULL AND campus_hall != ''");
        data = halls.map(h => ({ ...h, pct: hallTotal.v ? ((h.count / hallTotal.v) * 100).toFixed(1) : 0 }));
        break;
      case 'officers':
        title = 'Church Officers';
        const [officers] = await secPool.query("SELECT officer_role as label, COUNT(*) as count FROM registrations WHERE is_officer = 1 AND officer_role IS NOT NULL GROUP BY officer_role ORDER BY count DESC");
        data = officers;
        break;
      case 'attendance':
        title = `Attendance Report (${dateFrom} to ${dateTo})`;
        const [sessions] = await secPool.query('SELECT s.*, COUNT(ar.id) as attendance_count FROM attendance_sessions s LEFT JOIN attendance_records ar ON s.id = ar.session_id WHERE s.session_date BETWEEN ? AND ? GROUP BY s.id ORDER BY s.session_date DESC', [dateFrom, dateTo]);
        data = sessions;
        break;
      case 'registration_trend':
        title = `Registration Trend (${dateFrom} to ${dateTo})`;
        const [trend] = await secPool.query("SELECT DATE(created_at) as date, COUNT(*) as count FROM registrations WHERE created_at BETWEEN ? AND ? GROUP BY DATE(created_at) ORDER BY date", [dateFrom, dateTo]);
        data = trend;
        break;
      default:
        title = 'Membership Report';
        data = [];
    }

    await logActivity(secPool, req.user.id, req.user.username, 'VIEW_REPORT', `Type: ${type || 'membership'}`, req);
    res.json({ title, type: type || 'membership', dateFrom, dateTo, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Export ────────────────────────────────────────────────
router.get('/export', requireSecAuth, async (req, res) => {
  try {
    const { format, filter, hall, level, duration } = req.query;
    const where = [];
    const params = [];
    if (filter === 'hall' && hall) { where.push('campus_hall = ?'); params.push(hall); }
    if (filter === 'level' && level) { where.push('education_level = ?'); params.push(level); }
    if (filter === 'duration' && duration) { where.push('program_duration = ?'); params.push(duration); }
    if (filter === 'final') { where.push("(program_duration='HND' AND education_level='300') OR (program_duration='B-TECH' AND education_level='400')"); }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const [rows] = await secPool.query(`SELECT * FROM registrations ${whereSql} ORDER BY surname`, params);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="members_export_${Date.now()}.csv"`);
      const headers = ['id', 'surname', 'othernames', 'gender', 'contact', 'program', 'program_duration', 'education_level', 'membership_type', 'campus_hall', 'district', 'is_officer', 'officer_role'];
      res.write('\uFEFF'); // BOM for Excel
      res.write(headers.join(',') + '\n');
      for (const r of rows) {
        res.write(headers.map(h => `"${String(r[h] || '').replace(/"/g, '""')}"`).join(',') + '\n');
      }
      res.end();
    } else {
      res.json({ members: rows, count: rows.length });
    }
    await logActivity(secPool, req.user.id, req.user.username, 'EXPORT_DATA', `Format: ${format || 'json'}, Filter: ${filter || 'all'}`, req);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Settings ──────────────────────────────────────────────
router.get('/settings/users', requireSecAuth, requireSecAdmin, async (req, res) => {
  try {
    const [users] = await secPool.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/settings/users', requireSecAuth, requireSecAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await secPool.query('INSERT INTO users (username, email, password, role) VALUES (?,?,?,?)', [username, email, hashed, role || 'user']);
    await logActivity(secPool, req.user.id, req.user.username, 'ADD_USER', `Added admin user: ${username}`, req);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username or email exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings/users/:id', requireSecAuth, requireSecAdmin, async (req, res) => {
  try {
    const { username, email, role, password } = req.body;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await secPool.query('UPDATE users SET username=?, email=?, role=?, password=? WHERE id=?', [username, email, role || 'user', hashed, req.params.id]);
    } else {
      await secPool.query('UPDATE users SET username=?, email=?, role=? WHERE id=?', [username, email, role || 'user', req.params.id]);
    }
    await logActivity(secPool, req.user.id, req.user.username, 'EDIT_USER', `Edited admin user #${req.params.id}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/settings/users/:id', requireSecAuth, requireSecAdmin, async (req, res) => {
  try {
    await secPool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    await logActivity(secPool, req.user.id, req.user.username, 'DELETE_USER', `Deleted admin user #${req.params.id}`, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/settings/logs', requireSecAuth, async (req, res) => {
  try {
    const { page, perPage } = req.query;
    const pp = Math.min(parseInt(perPage) || 50, 200);
    const pg = Math.max(parseInt(page) || 1, 1);
    const offset = (pg - 1) * pp;
    const [[{ total }]] = await secPool.query('SELECT COUNT(*) as total FROM activity_logs');
    const [logs] = await secPool.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ? OFFSET ?', [pp, offset]);
    res.json({ logs, pagination: { page: pg, perPage: pp, total, totalPages: Math.ceil(total / pp) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
