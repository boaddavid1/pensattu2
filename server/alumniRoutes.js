// alumniRoutes.js — PENSA TTU Alumni portal API (converted from the PHP alumni project)
// All endpoints are prefixed with /api/alumni and connect to the u197926764_pensattu database
// (same DB as the sec module, so we reuse secPool).
//
// Endpoints:
//   Auth:
//     POST   /auth/login          — login (username + password, returns JWT)
//     GET    /auth/me             — current user
//   Dashboard:
//     GET    /dashboard           — year stats + total stats
//     GET    /alumni/by-year/:year — alumni for a specific graduation year
//   Alumni CRUD:
//     GET    /alumni              — list (search, filter, pagination)
//     POST   /alumni              — create
//     PUT    /alumni/:id          — update
//     DELETE /alumni/:id          — delete
//     POST   /alumni/bulk-delete  — bulk delete
//     POST   /alumni/bulk-import  — bulk import (JSON array)
//     POST   /alumni/import-old   — import old 4-column list
//     GET    /alumni/export       — export CSV
//   Messages:
//     POST   /messages/send       — send bulk SMS
//     GET    /messages/logs       — SMS history
//     POST   /messages/ai-generate — AI message generation
//   Broadcast:
//     POST   /broadcast/upload    — upload CSV/Excel contacts (multipart)
//     GET    /broadcast/groups    — list contact groups
//     DELETE /broadcast/groups/:id — delete group
//     PUT    /broadcast/groups/:id — rename group
//     POST   /broadcast/send      — send broadcast SMS
//     POST   /broadcast/schedule  — schedule broadcast SMS
//     GET    /broadcast/scheduled — list scheduled messages
//     DELETE /broadcast/scheduled/:id — cancel scheduled
//   Prayer Requests:
//     GET    /prayers             — list (filter by status, pagination)
//     POST   /prayers/:id/prayed  — mark as prayed
//     DELETE /prayers/:id         — delete
//   Settings:
//     GET    /settings            — get all settings
//     PUT    /settings            — update a setting
//     POST   /settings/test-sms   — test SMS connection
//     POST   /settings/test-ai    — test AI connection
//     GET    /settings/sms-balance — check SMS balance

import { Router } from 'express';
import secPool from './secDb.js';
import pool from './db.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { parse } from 'csv-parse/sync';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const ALUMNI_JWT_SECRET = process.env.ALUMNI_JWT_SECRET || process.env.SEC_JWT_SECRET || process.env.JWT_SECRET || 'alumni-dev-secret';

// ─── Helpers ───────────────────────────────────────────────
function generateToken(user) {
  return jwt.sign(user, ALUMNI_JWT_SECRET, { expiresIn: '8h' });
}

function verifyToken(token) {
  try { return jwt.verify(token, ALUMNI_JWT_SECRET); } catch { return null; }
}

function requireAlumniAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}

// Format Ghana phone number
function formatPhone(phone) {
  if (!phone) return null;
  let p = phone.toString().replace(/[^0-9]/g, '');
  if (p.startsWith('0')) p = '233' + p.slice(1);
  else if (!p.startsWith('233')) p = '233' + p;
  return p;
}

// Get SMS config from alumni_settings
async function getSmsConfig() {
  try {
    const [rows] = await secPool.query(
      "SELECT setting_key, setting_value FROM alumni_settings WHERE setting_key IN ('sms_api_key', 'sms_sender_id', 'sms_api_url')"
    );
    const cfg = { api_key: '', sender_id: 'PENSA TTU', api_url: 'https://sms.arkesel.com' };
    rows.forEach(r => {
      if (r.setting_key === 'sms_api_key') cfg.api_key = r.setting_value;
      if (r.setting_key === 'sms_sender_id') cfg.sender_id = r.setting_value;
      if (r.setting_key === 'sms_api_url') cfg.api_url = r.setting_value;
    });
    return cfg;
  } catch { return { api_key: '', sender_id: 'PENSA TTU', api_url: 'https://sms.arkesel.com' }; }
}

// Send SMS via Arkesel
async function sendSms(recipient, message, senderId, apiKey, apiUrl) {
  const to = formatPhone(recipient);
  if (!to) return { success: false, error: 'Invalid number' };
  const url = `${apiUrl}/sms/api?action=send-sms&api_key=${encodeURIComponent(apiKey)}&to=${encodeURIComponent(to)}&from=${encodeURIComponent(senderId)}&sms=${encodeURIComponent(message)}`;
  try {
    const res = await fetch(url, { timeout: 30000 });
    const data = await res.json().catch(() => ({}));
    const success = data.status === 'success' || data.code === '1000' || data.success === true || res.ok;
    return { success, response: data, error: success ? '' : (data.message || data.error || 'Unknown error') };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get AI config
async function getAiConfig() {
  try {
    const [rows] = await secPool.query(
      "SELECT setting_key, setting_value FROM alumni_settings WHERE setting_key IN ('ai_api_key', 'ai_model', 'ai_api_url')"
    );
    const cfg = { api_key: '', model: 'gpt-4o-mini', api_url: 'https://api.openai.com/v1/chat/completions' };
    rows.forEach(r => {
      if (r.setting_key === 'ai_api_key') cfg.api_key = r.setting_value;
      if (r.setting_key === 'ai_model') cfg.model = r.setting_value;
      if (r.setting_key === 'ai_api_url') cfg.api_url = r.setting_value;
    });
    return cfg;
  } catch { return { api_key: '', model: 'gpt-4o-mini', api_url: 'https://api.openai.com/v1/chat/completions' }; }
}

// ─── Auth ──────────────────────────────────────────────────
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    // Check env-based admin credentials first (from PHP .env: ADMIN_USER / ADMIN_PASS)
    const adminUser = process.env.ALUMNI_ADMIN_USER || process.env.ADMIN_USER || 'Alumni';
    const adminPass = process.env.ALUMNI_ADMIN_PASS || process.env.ADMIN_PASS || 'PensaAluminttu2026';

    if (username === adminUser && password === adminPass) {
      const token = generateToken({ id: 0, username: adminUser, email: 'admin@pensattu.edu', role: 'alumni_admin' });
      return res.json({ success: true, token, user: { id: 0, username: adminUser, email: 'admin@pensattu.edu', role: 'alumni_admin' } });
    }

    // Also check users table (same as sec)
    const [rows] = await secPool.query('SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1', [username, username]);
    if (rows.length) {
      const user = rows[0];
      // Use bcrypt compare if password is hashed
      const bcrypt = (await import('bcryptjs')).default;
      const ok = await bcrypt.compare(password, user.password);
      if (ok) {
        const token = generateToken({ id: user.id, username: user.username, email: user.email, role: user.role || 'alumni_admin' });
        return res.json({ success: true, token, user: { id: user.id, username: user.username, email: user.email, role: user.role || 'alumni_admin' } });
      }
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/auth/me', requireAlumniAuth, (req, res) => {
  res.json({ user: req.user });
});

// ─── Dashboard ─────────────────────────────────────────────
router.get('/dashboard', requireAlumniAuth, async (req, res) => {
  try {
    const [yearStats] = await secPool.query(`
      SELECT graduation_year, COUNT(*) as count,
             SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as males,
             SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as females
      FROM alumni GROUP BY graduation_year ORDER BY graduation_year DESC
    `);
    const [[totalStats]] = await secPool.query(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as males,
             SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as females
      FROM alumni
    `);
    res.json({ yearStats, totalStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/alumni/by-year/:year', requireAlumniAuth, async (req, res) => {
  try {
    const [alumni] = await secPool.query(`
      SELECT a.*, r.photo_data FROM alumni a
      LEFT JOIN registrations r ON a.registration_id = r.id
      WHERE a.graduation_year = ? ORDER BY a.surname ASC
    `, [req.params.year]);
    res.json({ alumni });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Alumni CRUD ───────────────────────────────────────────
router.get('/alumni', requireAlumniAuth, async (req, res) => {
  try {
    const { search, year, status, page = 1, perPage = 50 } = req.query;
    let sql = 'SELECT a.*, r.photo_data FROM alumni a LEFT JOIN registrations r ON a.registration_id = r.id WHERE 1=1';
    const params = [];
    if (search) {
      sql += ' AND (a.surname LIKE ? OR a.othernames LIKE ? OR a.contact LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (year) { sql += ' AND a.graduation_year = ?'; params.push(year); }
    if (status) { sql += ' AND a.alumni_status = ?'; params.push(status); }
    const offset = (Math.max(1, page) - 1) * perPage;
    sql += ' ORDER BY a.graduation_year DESC, a.surname ASC LIMIT ? OFFSET ?';
    params.push(Number(perPage), offset);
    const [rows] = await secPool.query(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM alumni WHERE 1=1';
    const countParams = [];
    if (search) { countSql += ' AND (surname LIKE ? OR othernames LIKE ? OR contact LIKE ?)'; const t = `%${search}%`; countParams.push(t, t, t); }
    if (year) { countSql += ' AND graduation_year = ?'; countParams.push(year); }
    if (status) { countSql += ' AND alumni_status = ?'; countParams.push(status); }
    const [[{ total }]] = await secPool.query(countSql, countParams);

    res.json({ alumni: rows, pagination: { total, page: Number(page), perPage: Number(perPage), totalPages: Math.ceil(total / perPage) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/alumni', requireAlumniAuth, async (req, res) => {
  try {
    const b = req.body;
    const [result] = await secPool.query(
      `INSERT INTO alumni (registration_id, surname, othernames, gender, dob, contact, program, education_level, graduation_year, graduation_level, alumni_status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [b.registration_id || 0, b.surname, b.othernames || '', b.gender || 'male', b.dob || '2000-01-01', b.contact || '', b.program || '', b.education_level || '', b.graduation_year || new Date().getFullYear(), b.graduation_level || '', b.alumni_status || 'active']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/alumni/:id', requireAlumniAuth, async (req, res) => {
  try {
    const b = req.body;
    await secPool.query(
      `UPDATE alumni SET surname=?, othernames=?, gender=?, dob=?, contact=?, program=?, education_level=?, graduation_year=?, graduation_level=?, alumni_status=? WHERE id=?`,
      [b.surname, b.othernames || '', b.gender || 'male', b.dob || '2000-01-01', b.contact || '', b.program || '', b.education_level || '', b.graduation_year || new Date().getFullYear(), b.graduation_level || '', b.alumni_status || 'active', req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/alumni/:id', requireAlumniAuth, async (req, res) => {
  try {
    await secPool.query('DELETE FROM alumni WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/alumni/bulk-delete', requireAlumniAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'No IDs provided' });
    const placeholders = ids.map(() => '?').join(',');
    await secPool.query(`DELETE FROM alumni WHERE id IN (${placeholders})`, ids);
    res.json({ success: true, deleted: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/alumni/bulk-import', requireAlumniAuth, async (req, res) => {
  try {
    const { members } = req.body;
    if (!Array.isArray(members)) return res.status(400).json({ error: 'members array required' });
    let imported = 0;
    for (const m of members) {
      await secPool.query(
        `INSERT INTO alumni (registration_id, surname, othernames, gender, dob, contact, program, education_level, graduation_year, graduation_level, alumni_status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [m.registration_id || 0, m.surname || '', m.othernames || '', m.gender || 'male', m.dob || '2000-01-01', m.contact || '', m.program || '', m.education_level || '', m.graduation_year || new Date().getFullYear(), m.graduation_level || '', m.alumni_status || 'active']
      );
      imported++;
    }
    res.json({ success: true, imported });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/alumni/import-old', requireAlumniAuth, async (req, res) => {
  try {
    const { members, year } = req.body;
    if (!Array.isArray(members)) return res.status(400).json({ error: 'members array required' });
    let imported = 0;
    for (const m of members) {
      await secPool.query(
        `INSERT INTO alumni (registration_id, surname, othernames, gender, dob, contact, program, education_level, graduation_year, graduation_level, alumni_status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [0, m.surname || '', '', 'male', '2000-01-01', m.contact || '', m.program || '', '', m.graduation_year || year || new Date().getFullYear(), '', 'active']
      );
      imported++;
    }
    res.json({ success: true, imported });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/alumni/export', requireAlumniAuth, async (req, res) => {
  try {
    const { year } = req.query;
    let sql = 'SELECT * FROM alumni';
    const params = [];
    if (year && year !== 'all') { sql += ' WHERE graduation_year = ?'; params.push(year); }
    sql += ' ORDER BY graduation_year DESC, surname ASC';
    const [rows] = await secPool.query(sql, params);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="alumni_${year || 'all'}.csv"`);

    if (rows.length === 0) { res.end('No data\n'); return; }
    const headers = Object.keys(rows[0]);
    res.write(headers.join(',') + '\n');
    for (const row of rows) {
      res.write(headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',') + '\n');
    }
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Messages ──────────────────────────────────────────────
router.post('/messages/send', requireAlumniAuth, async (req, res) => {
  try {
    const { message, recipient_group, year } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message required' });

    let recipients = [];
    if (recipient_group === 'year' && year) {
      const [rows] = await secPool.query('SELECT contact FROM alumni WHERE graduation_year = ? AND contact IS NOT NULL AND contact != ""', [year]);
      recipients = rows.map(r => r.contact);
    } else {
      const [rows] = await secPool.query('SELECT contact FROM alumni WHERE contact IS NOT NULL AND contact != ""');
      recipients = rows.map(r => r.contact);
    }

    if (recipients.length === 0) return res.json({ success: true, sent: 0, failed: 0, total: 0, message: 'No recipients found' });

    const cfg = await getSmsConfig();
    if (!cfg.api_key) return res.status(400).json({ error: 'SMS API key not configured. Go to Settings to configure.' });

    let sent = 0, failed = 0;
    for (const r of recipients) {
      const result = await sendSms(r, message, cfg.sender_id, cfg.api_key, cfg.api_url);
      if (result.success) sent++; else failed++;
      // Log to sms_logs
      try {
        await secPool.query('INSERT INTO sms_logs (recipient, message, status, type) VALUES (?,?,?,?)',
          [formatPhone(r), message, result.success ? 'sent' : 'failed', 'bulk']);
      } catch { /* table may not exist */ }
    }

    res.json({ success: true, sent, failed, total: recipients.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/messages/logs', requireAlumniAuth, async (req, res) => {
  try {
    const { page = 1, perPage = 50 } = req.query;
    const offset = (Math.max(1, page) - 1) * perPage;
    const [logs] = await secPool.query('SELECT * FROM sms_logs ORDER BY sent_at DESC LIMIT ? OFFSET ?', [Number(perPage), offset]);
    const [[{ total }]] = await secPool.query('SELECT COUNT(*) as total FROM sms_logs');
    res.json({ logs, pagination: { total, page: Number(page), perPage: Number(perPage) } });
  } catch (err) {
    res.json({ logs: [], pagination: { total: 0, page: 1, perPage: 50 } });
  }
});

router.post('/messages/ai-generate', requireAlumniAuth, async (req, res) => {
  try {
    const { prompt, tone = 'professional', occasion = 'update' } = req.body;
    const cfg = await getAiConfig();
    if (!cfg.api_key) return res.status(400).json({ error: 'AI API key not configured. Go to Settings to configure.' });

    const occasionContext = {
      reunion: 'This is for an alumni reunion event.',
      homecoming: 'This is for a homecoming weekend.',
      donation: 'This is a donation/fundraising appeal.',
      update: 'This is a general alumni update.',
      thanks: 'This is a thank you message.',
      event: 'This is an event invitation.',
      prayer: 'This is about a prayer meeting.',
      news: 'This is a news/newsletter update.',
    };

    const systemPrompt = `You are a helpful assistant for PENSA TTU (Pentecost Students and Associates - Takoradi Technical University) Alumni Relations. You write SMS messages for alumni. Keep messages concise (max 480 characters for SMS). Sign messages with 'PENSA TTU Alumni Relations' at the end. Use a ${tone} tone.`;
    const userMessage = `Write an SMS message about: ${prompt || 'general update'}\nType: ${occasion}\nTone: ${tone}\n${occasionContext[occasion] || ''}\nCurrent date: ${new Date().toLocaleDateString()}\nKeep it under 480 characters. Do not use emojis excessively.`;

    const response = await fetch(cfg.api_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.api_key}` },
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
        max_tokens: 300, temperature: 0.7,
      }),
    });
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      res.json({ message: data.choices[0].message.content.trim() });
    } else {
      res.status(500).json({ error: 'AI generation failed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Broadcast ─────────────────────────────────────────────
router.post('/broadcast/upload', requireAlumniAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const groupName = req.body.group_name || req.file.originalname.replace(/\.[^.]+$/, '');
    const ext = req.file.originalname.split('.').pop().toLowerCase();

    let contacts = [];
    let headers = [];

    if (ext === 'csv') {
      const records = parse(req.file.buffer.toString(), { columns: true, skip_empty_lines: true });
      if (records.length > 0) {
        headers = Object.keys(records[0]);
        contacts = records;
      }
    } else {
      // For xlsx, we'd need a library — for now, only CSV is supported server-side
      return res.status(400).json({ error: 'Only CSV files are supported. Please convert your Excel file to CSV.' });
    }

    const [result] = await secPool.query(
      'INSERT INTO contact_groups (group_name, file_name, contact_count, contacts_json, headers_json, status) VALUES (?,?,?,?,?,?)',
      [groupName, req.file.originalname, contacts.length, JSON.stringify(contacts), JSON.stringify(headers), 'active']
    );
    res.json({ success: true, id: result.insertId, count: contacts.length, headers, contacts: contacts.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/broadcast/groups', requireAlumniAuth, async (req, res) => {
  try {
    const [groups] = await secPool.query("SELECT id, group_name, file_name, contact_count, created_at FROM contact_groups WHERE status = 'active' ORDER BY created_at DESC");
    res.json({ groups });
  } catch (err) {
    res.json({ groups: [] });
  }
});

router.delete('/broadcast/groups/:id', requireAlumniAuth, async (req, res) => {
  try {
    await secPool.query("UPDATE contact_groups SET status = 'deleted' WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/broadcast/groups/:id', requireAlumniAuth, async (req, res) => {
  try {
    await secPool.query('UPDATE contact_groups SET group_name = ? WHERE id = ?', [req.body.group_name, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/broadcast/send', requireAlumniAuth, async (req, res) => {
  try {
    const { group_id, message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message required' });
    const [groups] = await secPool.query('SELECT * FROM contact_groups WHERE id = ? AND status = "active"', [group_id]);
    if (!groups.length) return res.status(404).json({ error: 'Group not found' });

    const contacts = JSON.parse(groups[0].contacts_json || '[]');
    // Find phone column
    const phoneKey = Object.keys(contacts[0] || {}).find(k => /phone|contact|mobile|tel|number/i.test(k));
    if (!phoneKey) return res.status(400).json({ error: 'No phone column found in contacts' });

    const cfg = await getSmsConfig();
    if (!cfg.api_key) return res.status(400).json({ error: 'SMS API key not configured' });

    let sent = 0, failed = 0;
    for (const c of contacts) {
      const result = await sendSms(c[phoneKey], message, cfg.sender_id, cfg.api_key, cfg.api_url);
      if (result.success) sent++; else failed++;
      try {
        await secPool.query('INSERT INTO sms_logs (recipient, message, status, type) VALUES (?,?,?,?)',
          [formatPhone(c[phoneKey]), message, result.success ? 'sent' : 'failed', 'broadcast']);
      } catch {}
    }
    res.json({ success: true, sent, failed, total: contacts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/broadcast/schedule', requireAlumniAuth, async (req, res) => {
  try {
    const { group_id, message, schedule_time } = req.body;
    if (!message?.trim() || !schedule_time) return res.status(400).json({ error: 'Message and schedule time required' });
    const [groups] = await secPool.query('SELECT * FROM contact_groups WHERE id = ? AND status = "active"', [group_id]);
    if (!groups.length) return res.status(404).json({ error: 'Group not found' });

    const contacts = JSON.parse(groups[0].contacts_json || '[]');
    await secPool.query(
      'INSERT INTO scheduled_messages (message, recipients_json, recipient_count, scheduled_at, status) VALUES (?,?,?,?,?)',
      [message, JSON.stringify(contacts), contacts.length, schedule_time, 'pending']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/broadcast/scheduled', requireAlumniAuth, async (req, res) => {
  try {
    const [scheduled] = await secPool.query('SELECT * FROM scheduled_messages ORDER BY scheduled_at DESC LIMIT 50');
    res.json({ scheduled });
  } catch (err) {
    res.json({ scheduled: [] });
  }
});

router.delete('/broadcast/scheduled/:id', requireAlumniAuth, async (req, res) => {
  try {
    await secPool.query('DELETE FROM scheduled_messages WHERE id = ? AND status = "pending"', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Prayer Requests ───────────────────────────────────────
// prayer_requests lives in the main COP database (pool), not the pensattu DB
router.get('/prayers', requireAlumniAuth, async (req, res) => {
  try {
    const { status, page = 1, perPage = 20 } = req.query;
    let sql = "SELECT * FROM prayer_requests WHERE user_status = 'Alumni'";
    const params = [];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    const offset = (Math.max(1, page) - 1) * perPage;
    sql += ' ORDER BY submitted_at DESC LIMIT ? OFFSET ?';
    params.push(Number(perPage), offset);
    const [prayers] = await pool.query(sql, params);

    let countSql = "SELECT COUNT(*) as total FROM prayer_requests WHERE user_status = 'Alumni'";
    const countParams = [];
    if (status) { countSql += ' AND status = ?'; countParams.push(status); }
    const [[{ total }]] = await pool.query(countSql, countParams);

    res.json({ prayers, pagination: { total, page: Number(page), perPage: Number(perPage), totalPages: Math.ceil(total / perPage) } });
  } catch (err) {
    res.json({ prayers: [], pagination: { total: 0, page: 1, perPage: 20, totalPages: 0 } });
  }
});

router.post('/prayers/:id/prayed', requireAlumniAuth, async (req, res) => {
  try {
    await pool.query("UPDATE prayer_requests SET status = 'prayed', prayed_at = NOW() WHERE id = ? AND user_status = 'Alumni'", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/prayers/:id', requireAlumniAuth, async (req, res) => {
  try {
    await pool.query("DELETE FROM prayer_requests WHERE id = ? AND user_status = 'Alumni'", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Settings ──────────────────────────────────────────────
const SETTING_DEFAULTS = {
  portal_name: 'PENSA TTU Alumni Portal',
  portal_description: 'Connecting PENSA TTU alumni worldwide',
  contact_email: 'alumni@pensattu.edu',
  contact_phone: '0547938109',
  portal_address: 'PENSA TTU, Takoradi, Ghana',
  sms_api_key: '',
  sms_sender_id: 'PENSA TTU',
  sms_api_url: 'https://sms.arkesel.com',
  ai_api_key: '',
  ai_model: 'gpt-4o-mini',
  ai_api_url: 'https://api.openai.com/v1/chat/completions',
  items_per_page: '20',
  theme_color: '#3C91E6',
};

router.get('/settings', requireAlumniAuth, async (req, res) => {
  try {
    const [rows] = await secPool.query('SELECT setting_key, setting_value FROM alumni_settings');
    const settings = { ...SETTING_DEFAULTS };
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json({ settings });
  } catch (err) {
    res.json({ settings: SETTING_DEFAULTS });
  }
});

router.put('/settings', requireAlumniAuth, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Setting key required' });
    await secPool.query(
      'INSERT INTO alumni_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
      [key, value]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/settings/test-sms', requireAlumniAuth, async (req, res) => {
  try {
    const cfg = await getSmsConfig();
    if (!cfg.api_key) return res.json({ success: false, message: 'SMS API key not configured' });
    const result = await sendSms('0240000000', 'Test message from PENSA TTU Alumni Portal', cfg.sender_id, cfg.api_key, cfg.api_url);
    res.json({ success: result.success, message: result.success ? 'SMS test successful' : result.error });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/settings/test-ai', requireAlumniAuth, async (req, res) => {
  try {
    const cfg = await getAiConfig();
    if (!cfg.api_key) return res.json({ success: false, message: 'AI API key not configured' });
    const response = await fetch(cfg.api_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.api_key}` },
      body: JSON.stringify({ model: cfg.model, messages: [{ role: 'user', content: 'Say "Connection successful" in 3 words.' }], max_tokens: 10 }),
    });
    const data = await response.json();
    if (data.choices?.[0]?.message?.content) {
      res.json({ success: true, message: 'AI API connection successful' });
    } else {
      res.json({ success: false, message: 'Unexpected response from AI API' });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.get('/settings/sms-balance', requireAlumniAuth, async (req, res) => {
  try {
    const cfg = await getSmsConfig();
    if (!cfg.api_key) return res.json({ error: 'SMS API key not configured' });
    const url = `${cfg.api_url}/sms/api?action=check-balance&api_key=${encodeURIComponent(cfg.api_key)}&response=json`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({ balance: data.balance || data.data?.balance || 'Unknown' });
  } catch (err) {
    res.json({ error: err.message });
  }
});

export default router;
