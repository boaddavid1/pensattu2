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
    const [
      [statsRows],
      [alumniRows],
      [durations],
      [levels],
      [halls],
      [recentMembers]
    ] = await Promise.all([
      secPool.query(`
        SELECT 
          COUNT(*) as total,
          COALESCE(SUM(membership_type = 'member'), 0) as members,
          COALESCE(SUM(membership_type = 'associate'), 0) as associates,
          COALESCE(SUM(gender = 'male'), 0) as male,
          COALESCE(SUM(gender = 'female'), 0) as female,
          COALESCE(SUM(is_officer = 1), 0) as officers,
          COALESCE(SUM(created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)), 0) as recent
        FROM registrations
        WHERE (graduated = 0 OR graduated IS NULL)
      `),
      secPool.query('SELECT COUNT(*) as cnt FROM alumni'),
      secPool.query('SELECT program_duration, COUNT(*) as cnt FROM registrations WHERE (graduated = 0 OR graduated IS NULL) AND program_duration IS NOT NULL AND program_duration != "" GROUP BY program_duration'),
      secPool.query('SELECT education_level, COUNT(*) as cnt FROM registrations WHERE (graduated = 0 OR graduated IS NULL) AND education_level IS NOT NULL AND education_level != "" GROUP BY education_level'),
      secPool.query('SELECT campus_hall, COUNT(*) as cnt FROM registrations WHERE (graduated = 0 OR graduated IS NULL) AND campus_hall IS NOT NULL AND campus_hall != "" AND campus_hall != "null" GROUP BY campus_hall'),
      secPool.query('SELECT id, surname, othernames, gender, membership_type, created_at FROM registrations WHERE (graduated = 0 OR graduated IS NULL) ORDER BY created_at DESC LIMIT 10')
    ]);

    const s = statsRows[0] || {};
    res.json({
      stats: {
        total: Number(s.total) || 0,
        members: Number(s.members) || 0,
        associates: Number(s.associates) || 0,
        male: Number(s.male) || 0,
        female: Number(s.female) || 0,
        officers: Number(s.officers) || 0,
        recent: Number(s.recent) || 0,
        alumni: Number(alumniRows[0]?.cnt) || 0,
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

// Cache for graduated column presence in registrations table
let hasGraduatedColumnCache = true;
async function hasGraduatedCol() {
  if (hasGraduatedColumnCache === true) return true;
  try {
    const [cols] = await secPool.query("SHOW COLUMNS FROM registrations LIKE 'graduated'");
    if (cols && cols.length > 0) {
      hasGraduatedColumnCache = true;
      return true;
    }
    await secPool.query("ALTER TABLE registrations ADD COLUMN graduated TINYINT(1) NOT NULL DEFAULT 0");
    hasGraduatedColumnCache = true;
    return true;
  } catch (err) {
    console.warn("hasGraduatedCol check:", err.message);
    hasGraduatedColumnCache = false;
    return false;
  }
}

// ─── Members ───────────────────────────────────────────────
router.get('/members', requireSecAuth, async (req, res) => {
  try {
    const { search, gender, membership_type, hall, officer, level, duration, page, perPage } = req.query;
    const pp = Math.min(parseInt(perPage) || 25, 200);
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
    
    if (req.query.include_graduated !== 'true') {
      where.push('(graduated = 0 OR graduated IS NULL)');
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // Parallel fetch: Count and member records simultaneously
    const [countResult, rowsResult] = await Promise.all([
      secPool.query(`SELECT COUNT(*) as total FROM registrations ${whereSql}`, params),
      secPool.query(
        `SELECT * FROM registrations ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, pp, offset]
      )
    ]);

    const total = countResult[0][0]?.total || 0;
    const rows = rowsResult[0];

    res.json({ members: rows, pagination: { page: pg, perPage: pp, total, totalPages: Math.ceil(total / pp) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Members grouped by education level — returns only counts in a single fast query
router.get('/members/by-level', requireSecAuth, async (req, res) => {
  try {
    const { search, gender, membership_type, hall, officer, duration } = req.query;
    const where = ['(graduated = 0 OR graduated IS NULL)'];
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

    const whereSql = `WHERE ${where.join(' AND ')}`;

    // Single query computing all level groups in one pass via indexed GROUP BY
    const [rows] = await secPool.query(`
      SELECT 
        CASE 
          WHEN education_level IS NULL OR education_level = '' THEN 'Unspecified' 
          ELSE education_level 
        END as level, 
        COUNT(*) as count 
      FROM registrations 
      ${whereSql} 
      GROUP BY CASE WHEN education_level IS NULL OR education_level = '' THEN 'Unspecified' ELSE education_level END 
      ORDER BY CASE WHEN level = 'Unspecified' THEN 9999 ELSE CAST(level AS UNSIGNED) END, level
    `, params);

    const levels = rows.map(r => ({ level: r.level, count: Number(r.count) }));
    const total = levels.reduce((sum, l) => sum + l.count, 0);
    res.json({ levels, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: calculate progression for a member
// 100 -> 200, 200 -> 300, 300 -> 400 ("same applies to all"), and 400+ graduates to Alumni
function calculateProgression(member) {
  const rawLevel = String(member.education_level || '').trim();
  const levelNum = parseInt(rawLevel, 10);

  if (!levelNum || isNaN(levelNum)) {
    return { action: 'skip', reason: 'Unspecified or non-numeric level' };
  }

  // 100 moves to 200
  if (levelNum === 100) {
    return { action: 'promote', targetLevel: '200', category: '100_to_200' };
  }

  // 200 moves to 300 ("same applies to all")
  if (levelNum === 200) {
    return { action: 'promote', targetLevel: '300', category: '200_to_300' };
  }

  // 300 moves to 400 ("same applies to all")
  if (levelNum === 300) {
    return { action: 'promote', targetLevel: '400', category: '300_to_400' };
  }

  // 400 and above -> Final Year -> Graduates to Alumni Portal
  if (levelNum >= 400) {
    return { action: 'graduate', category: 'btech_400', targetLevel: 'Alumni' };
  }

  return { action: 'promote', targetLevel: String(levelNum + 100), category: 'other_promote' };
}

// Helper: graduate a member and copy into alumni table
async function graduateMemberRecord(member, conn = secPool) {
  const gradYear = new Date().getFullYear();
  const gradLevel = member.education_level || 'Graduated';

  // Format valid date for dob
  let dobVal = '2000-01-01';
  if (member.dob && member.dob !== '0000-00-00') {
    const d = new Date(member.dob);
    if (!isNaN(d.getTime())) {
      dobVal = d.toISOString().slice(0, 10);
    }
  }

  // Mark in registrations as graduated
  await conn.query('UPDATE registrations SET graduated = 1 WHERE id = ?', [member.id]);

  // Insert or update in alumni table
  const [existing] = await conn.query(
    'SELECT id FROM alumni WHERE registration_id = ? OR (contact = ? AND contact != "" AND surname = ?)',
    [member.id, member.contact || '', member.surname]
  );

  if (existing.length === 0) {
    await conn.query(
      `INSERT INTO alumni (
        registration_id, surname, othernames, gender, dob, contact, program,
        education_level, graduation_year, graduation_level, alumni_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        member.id,
        member.surname,
        member.othernames || '',
        member.gender === 'female' ? 'female' : 'male',
        dobVal,
        member.contact || '',
        member.program || '',
        member.education_level || '',
        gradYear,
        gradLevel,
      ]
    );
  } else {
    await conn.query(
      'UPDATE alumni SET alumni_status = "active", graduation_year = ? WHERE id = ?',
      [gradYear, existing[0].id]
    );
  }
}

// Preview level progression & graduation
router.get('/members/promotion-preview', requireSecAuth, async (req, res) => {
  try {
    const hasGrad = await hasGraduatedCol();
    const where = hasGrad ? 'WHERE (graduated = 0 OR graduated IS NULL)' : '';
    const [members] = await secPool.query(
      `SELECT id, surname, othernames, gender, dob, contact, program, program_duration, education_level FROM registrations ${where} ORDER BY surname ASC`
    );

    const summary = {
      totalActive: members.length,
      promotions: {
        total: 0,
        '100_to_200': 0,
        '200_to_300': 0,
        '300_to_400': 0,
      },
      graduations: {
        total: 0,
        diploma_200: 0,
        hnd_300: 0,
        btech_400: 0,
      },
      skipped: 0,
    };

    const previewList = [];

    for (const m of members) {
      const p = calculateProgression(m);
      if (p.action === 'promote') {
        summary.promotions.total++;
        if (summary.promotions[p.category] !== undefined) {
          summary.promotions[p.category]++;
        }
      } else if (p.action === 'graduate') {
        summary.graduations.total++;
        if (summary.graduations[p.category] !== undefined) {
          summary.graduations[p.category]++;
        }
      } else {
        summary.skipped++;
      }

      previewList.push({
        id: m.id,
        name: `${m.surname} ${m.othernames}`,
        program: m.program || '-',
        duration: m.program_duration || '-',
        currentLevel: m.education_level || '-',
        action: p.action,
        targetLevel: p.targetLevel || '-',
        reason: p.reason || '',
      });
    }

    res.json({ summary, previewList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk advance members to next academic level and graduate final years
router.post('/members/promote', requireSecAuth, async (req, res) => {
  try {
    const hasGrad = await hasGraduatedCol();
    const where = hasGrad ? 'WHERE (graduated = 0 OR graduated IS NULL)' : '';
    const [members] = await secPool.query(`SELECT * FROM registrations ${where}`);

    let promoted = 0;
    let graduated = 0;
    let skipped = 0;

    for (const m of members) {
      const p = calculateProgression(m);
      if (p.action === 'promote') {
        await secPool.query('UPDATE registrations SET education_level = ? WHERE id = ?', [p.targetLevel, m.id]);
        promoted++;
      } else if (p.action === 'graduate') {
        await graduateMemberRecord(m);
        graduated++;
      } else {
        skipped++;
      }
    }

    await logActivity(
      secPool,
      req.user.id,
      req.user.username,
      'BULK_LEVEL_PROGRESSION',
      `Promoted ${promoted} members, graduated ${graduated} members, skipped ${skipped}`,
      req
    );

    res.json({ success: true, promoted, graduated, skipped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Advance a single member to next level or graduate if final year
router.post('/members/:id/promote', requireSecAuth, async (req, res) => {
  try {
    const [rows] = await secPool.query('SELECT * FROM registrations WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Member not found' });
    const member = rows[0];

    const p = calculateProgression(member);
    if (p.action === 'graduate') {
      await graduateMemberRecord(member);
      await logActivity(secPool, req.user.id, req.user.username, 'GRADUATE_MEMBER', `Graduated member #${member.id}: ${member.surname} ${member.othernames}`, req);
      return res.json({ success: true, action: 'graduated', message: 'Graduated to Alumni portal' });
    }

    if (p.action === 'promote') {
      await secPool.query('UPDATE registrations SET education_level = ? WHERE id = ?', [p.targetLevel, member.id]);
      await logActivity(secPool, req.user.id, req.user.username, 'PROMOTE_MEMBER', `Advanced member #${member.id} to Level ${p.targetLevel}`, req);
      return res.json({ success: true, action: 'promoted', newLevel: p.targetLevel });
    }

    res.status(400).json({ error: p.reason || 'Cannot advance member' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Explicitly graduate a single member to alumni
router.post('/members/:id/graduate', requireSecAuth, async (req, res) => {
  try {
    const [rows] = await secPool.query('SELECT * FROM registrations WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Member not found' });
    const member = rows[0];

    await graduateMemberRecord(member);
    await logActivity(secPool, req.user.id, req.user.username, 'GRADUATE_MEMBER', `Graduated member #${member.id}: ${member.surname} ${member.othernames}`, req);

    res.json({ success: true, message: 'Member graduated to Alumni portal' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manually convert Diploma student to BTech Top-up (continues from Level 200)
router.post('/members/:id/topup-btech', requireSecAuth, async (req, res) => {
  try {
    const [rows] = await secPool.query('SELECT * FROM registrations WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Member not found' });
    const member = rows[0];

    // Determine new program name
    let newProgram = (req.body.program || '').trim();
    if (!newProgram) {
      const orig = member.program || '';
      if (/diploma/i.test(orig)) {
        newProgram = orig.replace(/diploma\s*(in)?/i, 'BTECH ').trim();
      } else if (orig) {
        newProgram = `BTECH ${orig}`;
      } else {
        newProgram = 'BTECH';
      }
    }

    const newLevel = req.body.level ? String(req.body.level) : '200';

    await secPool.query(
      `UPDATE registrations SET
        program_duration = 'B-TECH',
        program = ?,
        education_level = ?,
        graduated = 0
       WHERE id = ?`,
      [newProgram, newLevel, member.id]
    );

    // If an alumni record was previously created for this registration, remove it
    await secPool.query('DELETE FROM alumni WHERE registration_id = ?', [member.id]);

    await logActivity(
      secPool,
      req.user.id,
      req.user.username,
      'TOPUP_BTECH',
      `Converted member #${member.id} (${member.surname} ${member.othernames}) to BTech Top-up in ${newProgram} at Level ${newLevel}`,
      req
    );

    res.json({
      success: true,
      message: `${member.surname} ${member.othernames} successfully transitioned to BTech Top-up (Level ${newLevel})`,
      program: newProgram,
      program_duration: 'B-TECH',
      education_level: newLevel,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get rollback diagnostic info
router.get('/members/rollback-info', requireSecAuth, async (req, res) => {
  try {
    const [[{ gradCount }]] = await secPool.query("SELECT COUNT(*) as gradCount FROM registrations WHERE graduated = 1");
    const [[{ activeCount }]] = await secPool.query("SELECT COUNT(*) as activeCount FROM registrations WHERE graduated = 0 OR graduated IS NULL");
    const [[{ alumniCount }]] = await secPool.query("SELECT COUNT(*) as alumniCount FROM alumni WHERE registration_id > 0");
    const [levelCounts] = await secPool.query("SELECT education_level as level, COUNT(*) as count FROM registrations GROUP BY education_level ORDER BY CAST(education_level AS UNSIGNED), education_level");

    res.json({
      gradCount,
      activeCount,
      alumniCount,
      levelCounts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Revert all moves: restore graduated members from alumni, reset graduated=0, delete transferred alumni records
router.post('/members/rollback', requireSecAuth, async (req, res) => {
  try {
    const { stepDown } = req.body || {};

    // 1. Restore education_level from alumni where saved
    try {
      await secPool.query(`
        UPDATE registrations r
        JOIN alumni a ON r.id = a.registration_id
        SET r.education_level = a.graduation_level
        WHERE a.registration_id > 0 
          AND a.graduation_level IS NOT NULL 
          AND a.graduation_level != '' 
          AND a.graduation_level != 'Graduated'
      `);
    } catch (e) {
      console.warn("Could not restore education_level from alumni:", e.message);
    }

    // 2. Unmark all graduated members
    const [regUpdate] = await secPool.query("UPDATE registrations SET graduated = 0 WHERE graduated = 1");

    // 3. Remove transferred alumni records (only those transferred from registrations)
    const [alumniDelete] = await secPool.query("DELETE FROM alumni WHERE registration_id > 0");

    // 4. Optionally step levels back down atomically (200->100, 300->200, 400->300)
    let steppedDown = 0;
    if (stepDown) {
      const [stepResult] = await secPool.query(`
        UPDATE registrations 
        SET education_level = CASE 
          WHEN education_level = '400' THEN '300'
          WHEN education_level = '300' THEN '200'
          WHEN education_level = '200' THEN '100'
          ELSE education_level
        END
        WHERE education_level IN ('200', '300', '400')
      `);
      steppedDown = stepResult.affectedRows;
    }

    await logActivity(
      secPool,
      req.user.id,
      req.user.username,
      'ROLLBACK_LEVEL_PROGRESSION',
      `Restored ${regUpdate.affectedRows} graduated registrations, cleaned ${alumniDelete.affectedRows} alumni records${stepDown ? `, stepped down ${steppedDown} levels` : ''}`,
      req
    );

    const [levelCounts] = await secPool.query("SELECT education_level as level, COUNT(*) as count FROM registrations WHERE graduated = 0 OR graduated IS NULL GROUP BY education_level ORDER BY CAST(education_level AS UNSIGNED), education_level");
    const [[{ totalActive }]] = await secPool.query("SELECT COUNT(*) as totalActive FROM registrations WHERE graduated = 0 OR graduated IS NULL");

    res.json({
      success: true,
      message: `Successfully reversed moves! Restored ${regUpdate.affectedRows} member(s) to active status and cleaned ${alumniDelete.affectedRows} alumni record(s).`,
      restoredCount: regUpdate.affectedRows,
      alumniCleaned: alumniDelete.affectedRows,
      steppedDown,
      totalActive,
      levelCounts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step active levels back down by 100 atomically
router.post('/members/step-down-levels', requireSecAuth, async (req, res) => {
  try {
    const [stepResult] = await secPool.query(`
      UPDATE registrations 
      SET education_level = CASE 
        WHEN education_level = '400' THEN '300'
        WHEN education_level = '300' THEN '200'
        WHEN education_level = '200' THEN '100'
        ELSE education_level
      END
      WHERE education_level IN ('200', '300', '400')
    `);

    const [levelCounts] = await secPool.query("SELECT education_level as level, COUNT(*) as count FROM registrations WHERE graduated = 0 OR graduated IS NULL GROUP BY education_level ORDER BY CAST(education_level AS UNSIGNED), education_level");

    res.json({
      success: true,
      message: `Stepped down ${stepResult.affectedRows} member level(s).`,
      affectedRows: stepResult.affectedRows,
      levelCounts,
    });
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
    // NOT NULL columns get empty string fallback instead of null
    const cr = ['on-campus', 'off-campus'].includes(b.campus_residence) ? b.campus_residence : (b.campus_residence || 'off-campus');
    const [result] = await secPool.query(
      `INSERT INTO registrations (surname, othernames, gender, dob, contact, residence, room, program, program_duration, education_level, membership_type, campus_residence, campus_hall, offcampus_location, landmark, is_officer, officer_role, district, pastor, guardian, guardian_contact, departments, profile_image)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [b.surname, b.othernames, b.gender, b.dob || '', b.contact || '', b.residence || '', b.room || '', b.program || '', b.program_duration || null, b.education_level || '', b.membership_type || 'member', cr, b.campus_hall || null, b.offcampus_location || null, b.landmark || null, b.is_officer ? 1 : 0, b.officer_role || null, b.district || '', b.pastor || '', b.guardian || '', b.guardian_contact || '', b.departments || b.other_info || null, b.photo_data || b.profile_image || null]
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
    const cr = ['on-campus', 'off-campus'].includes(b.campus_residence) ? b.campus_residence : (b.campus_residence || 'off-campus');
    // profile_image is optional — only update it if provided (allows clearing or keeping existing)
    if (b.photo_data !== undefined || b.profile_image !== undefined) {
      const photo = b.profile_image !== undefined ? b.profile_image : b.photo_data;
      await secPool.query(
        `UPDATE registrations SET surname=?, othernames=?, gender=?, dob=?, contact=?, residence=?, room=?, program=?, program_duration=?, education_level=?, membership_type=?, campus_residence=?, campus_hall=?, offcampus_location=?, landmark=?, is_officer=?, officer_role=?, district=?, pastor=?, guardian=?, guardian_contact=?, departments=?, profile_image=? WHERE id=?`,
        [b.surname, b.othernames, b.gender, b.dob || '', b.contact || '', b.residence || '', b.room || '', b.program || '', b.program_duration || null, b.education_level || '', b.membership_type || 'member', cr, b.campus_hall || null, b.offcampus_location || null, b.landmark || null, b.is_officer ? 1 : 0, b.officer_role || null, b.district || '', b.pastor || '', b.guardian || '', b.guardian_contact || '', b.departments || b.other_info || null, photo || null, req.params.id]
      );
    } else {
      await secPool.query(
        `UPDATE registrations SET surname=?, othernames=?, gender=?, dob=?, contact=?, residence=?, room=?, program=?, program_duration=?, education_level=?, membership_type=?, campus_residence=?, campus_hall=?, offcampus_location=?, landmark=?, is_officer=?, officer_role=?, district=?, pastor=?, guardian=?, guardian_contact=?, departments=? WHERE id=?`,
        [b.surname, b.othernames, b.gender, b.dob || '', b.contact || '', b.residence || '', b.room || '', b.program || '', b.program_duration || null, b.education_level || '', b.membership_type || 'member', cr, b.campus_hall || null, b.offcampus_location || null, b.landmark || null, b.is_officer ? 1 : 0, b.officer_role || null, b.district || '', b.pastor || '', b.guardian || '', b.guardian_contact || '', b.departments || b.other_info || null, req.params.id]
      );
    }
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

// Advance an individual member to next level or graduate
router.post('/members/:id/promote', requireSecAuth, async (req, res) => {
  try {
    const [rows] = await secPool.query('SELECT * FROM registrations WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Member not found' });
    const m = rows[0];

    const plan = calculateProgression(m);
    if (plan.action === 'skip') {
      return res.status(400).json({ error: plan.reason || 'Cannot advance member with unspecified level' });
    }

    if (plan.action === 'graduate') {
      await graduateMemberRecord(m);
      await logActivity(
        secPool,
        req.user.id,
        req.user.username,
        'GRADUATE_MEMBER',
        `Graduated: ${m.surname} ${m.othernames} (${m.education_level} ${m.program_duration || ''})`,
        req
      );
      return res.json({ success: true, action: 'graduated', oldLevel: m.education_level, newLevel: 'Alumni' });
    }

    await secPool.query('UPDATE registrations SET education_level = ? WHERE id = ?', [plan.targetLevel, m.id]);
    await logActivity(
      secPool,
      req.user.id,
      req.user.username,
      'PROMOTE_MEMBER',
      `Promoted: ${m.surname} ${m.othernames} from ${m.education_level} to ${plan.targetLevel}`,
      req
    );

    res.json({ success: true, action: 'promoted', oldLevel: m.education_level, newLevel: plan.targetLevel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/members/:id/graduate', requireSecAuth, async (req, res) => {
  try {
    const [rows] = await secPool.query('SELECT * FROM registrations WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Member not found' });
    const m = rows[0];

    await graduateMemberRecord(m);
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

    const hasGrad = await hasGraduatedCol();
    const whereGrad = hasGrad ? 'WHERE graduated = 0 OR graduated IS NULL' : '';
    const [[{ totalMembers }]] = await secPool.query(`SELECT COUNT(*) as totalMembers FROM registrations ${whereGrad}`);
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

// ─── Halls & Residences ─────────────────────────────────────
router.get('/halls', requireSecAuth, async (req, res) => {
  try {
    const hasGrad = await hasGraduatedCol();
    const whereGrad = hasGrad ? 'WHERE (graduated = 0 OR graduated IS NULL)' : '';

    const [rows] = await secPool.query(`
      SELECT id, surname, othernames, gender, contact, program, education_level, program_duration,
             campus_residence, campus_hall, offcampus_location, room_campus, room_offcampus, room, landmark, residence
      FROM registrations 
      ${whereGrad}
      ORDER BY surname
    `);

    const campusHallsMap = {};
    const offCampusMap = {};

    for (const m of rows) {
      const isCampus =
        String(m.campus_residence || '').toLowerCase() === 'yes' ||
        (m.campus_hall && m.campus_hall.trim() !== '' && m.campus_hall.trim().toLowerCase() !== 'null');

      if (isCampus && m.campus_hall && m.campus_hall.trim()) {
        const rawHall = m.campus_hall.trim();
        const displayHall = rawHall.toLowerCase().endsWith('hall') ? rawHall : `${rawHall} Hall`;
        if (!campusHallsMap[displayHall]) {
          campusHallsMap[displayHall] = [];
        }
        campusHallsMap[displayHall].push({
          ...m,
          roomDisplay: m.room_campus || m.room || '-',
          landmarkDisplay: '',
          residenceType: 'campus',
          residenceName: displayHall,
        });
      } else {
        // Off-campus residence or hostel
        let loc = (m.offcampus_location || m.residence || '').trim();
        if (!loc || loc.toLowerCase() === 'null') {
          loc = 'Other Off-Campus';
        }
        // Capitalize words nicely if entered all lowercase
        if (loc === loc.toLowerCase()) {
          loc = loc.replace(/\b\w/g, (c) => c.toUpperCase());
        }

        // Case-insensitive match to existing keys so "crystal hostel" and "Crystal Hostel" group together
        const matchKey =
          Object.keys(offCampusMap).find((k) => k.toLowerCase() === loc.toLowerCase()) || loc;

        if (!offCampusMap[matchKey]) {
          offCampusMap[matchKey] = [];
        }
        offCampusMap[matchKey].push({
          ...m,
          roomDisplay: m.room_offcampus || m.room || '-',
          landmarkDisplay: m.landmark || '',
          residenceType: 'offcampus',
          residenceName: matchKey,
        });
      }
    }

    const campusHalls = Object.entries(campusHallsMap)
      .map(([hall, members]) => ({
        hall,
        name: hall,
        type: 'campus',
        count: members.length,
        members,
      }))
      .sort((a, b) => b.count - a.count);

    const offCampusResidences = Object.entries(offCampusMap)
      .map(([hall, members]) => ({
        hall,
        name: hall,
        type: 'offcampus',
        count: members.length,
        members,
      }))
      .sort((a, b) => b.count - a.count);

    // Combine both so that `halls` array has both campus halls AND all other residences
    const all = [...campusHalls, ...offCampusResidences];

    res.json({
      halls: all,
      campusHalls,
      offCampusResidences,
      totalCampus: campusHalls.reduce((sum, h) => sum + h.count, 0),
      totalOffCampus: offCampusResidences.reduce((sum, r) => sum + r.count, 0),
      totalMembers: rows.length,
    });
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

// ─── Newbie Registrations (SEC Admin) ──────────────────────
// List newbies with search, status filter, and pagination
router.get('/newbies', requireSecAuth, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const where = [];
    const args = [];
    if (search) {
      where.push('(name LIKE ? OR contact LIKE ? OR program LIKE ? OR residence LIKE ?)');
      const term = `%${search}%`;
      args.push(term, term, term, term);
    }
    if (status) {
      where.push('status = ?');
      args.push(status);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (Math.max(1, Number(page) || 1) - 1) * (Number(limit) || 50);
    const lim = Number(limit) || 50;

    const [rows] = await secPool.query(
      `SELECT * FROM newbie_registrations ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...args, lim, offset]
    );
    const [[{ total }]] = await secPool.query(
      `SELECT COUNT(*) AS total FROM newbie_registrations ${clause}`,
      args
    );

    // Summary stats
    const [counts] = await secPool.query(
      'SELECT status, COUNT(*) as cnt FROM newbie_registrations GROUP BY status'
    );
    const stats = { total: 0, pending: 0, pushed: 0, completed: 0 };
    counts.forEach((c) => {
      if (stats[c.status] !== undefined) stats[c.status] = c.cnt;
      stats.total += c.cnt;
    });

    res.json({ items: rows, total, stats, page: Number(page) || 1, limit: lim });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Push newbie to full membership registration
router.post('/newbies/:id/push', requireSecAuth, async (req, res) => {
  try {
    const [rows] = await secPool.query('SELECT * FROM newbie_registrations WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Newbie registration not found' });
    const newbie = rows[0];

    await secPool.query(
      'UPDATE newbie_registrations SET status = "pushed", pushed_at = NOW(), pushed_by = ? WHERE id = ?',
      [req.user?.username || 'admin', req.params.id]
    );

    await logActivity(
      secPool,
      req.user.id,
      req.user.username,
      'PUSH_NEWBIE',
      `Pushed newbie #${req.params.id} (${newbie.name}, ${newbie.contact}) to full registration`,
      req
    );

    res.json({
      success: true,
      message: `${newbie.name} pushed to full registration pipeline`,
      newbie: { ...newbie, status: 'pushed' },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete newbie registration
router.delete('/newbies/:id', requireSecAuth, async (req, res) => {
  try {
    const [rows] = await secPool.query('SELECT * FROM newbie_registrations WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Newbie registration not found' });
    await secPool.query('DELETE FROM newbie_registrations WHERE id = ?', [req.params.id]);
    await logActivity(
      secPool,
      req.user.id,
      req.user.username,
      'DELETE_NEWBIE',
      `Deleted newbie #${req.params.id} (${rows[0].name})`,
      req
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
