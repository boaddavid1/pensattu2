// api/reg.js — Vercel serverless function for the PENSA TTU registration portal.
// Handles POST /api/reg (member submit), POST /api/reg/newbie (newbie submit),
// GET /api/reg/newbie/check/:contact (prefill check), and GET /api/reg (admin list).
// Compatible with both Vercel Serverless Functions (req, res) and AWS Lambda (event, context).
// Connects directly to the u197926764_pensattu MySQL database via env vars.
//
// Required env vars (set in Vercel project settings):
//   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
//   DB_SSL (optional, set to 'true' if the MySQL host requires SSL)
//   JWT_SECRET (optional, defaults to a dev value)
//   ADMIN_TOKEN (optional — if set, admin actions require this as a Bearer token)

import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

let pool = null;

function getPool() {
  if (pool) return pool;
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'u197926764_pensattu',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 15000,
  };

  if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
    config.ssl = { rejectUnauthorized: false };
  }

  pool = mysql.createPool(config);
  return pool;
}

const REG_COLUMNS = [
  'surname', 'othernames', 'gender', 'dob', 'contact',
  'residence', 'room', 'program', 'education_level', 'membership_type',
  'district', 'pastor', 'guardian', 'guardian_contact',
  'photo_data', 'other_info',
  'campus_residence', 'campus_hall', 'offcampus_location',
  'room_campus', 'room_offcampus', 'program_duration',
  'is_officer', 'officer_role', 'landmark',
];

function clean(value) {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  if (trimmed === '') return '';
  return trimmed
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let schemaInitialized = false;

// Ensure registrations + departments + newbie_registrations tables exist (idempotent).
async function ensureSchema() {
  if (schemaInitialized) return;
  const p = getPool();
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`registrations\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`surname\` varchar(100) NOT NULL DEFAULT '',
        \`othernames\` varchar(200) NOT NULL DEFAULT '',
        \`gender\` varchar(10) NOT NULL DEFAULT '',
        \`dob\` date DEFAULT NULL,
        \`contact\` varchar(20) NOT NULL DEFAULT '',
        \`residence\` varchar(255) NOT NULL DEFAULT '',
        \`room\` varchar(100) NOT NULL DEFAULT '',
        \`program\` varchar(255) NOT NULL DEFAULT '',
        \`education_level\` varchar(10) NOT NULL DEFAULT '',
        \`membership_type\` varchar(20) NOT NULL DEFAULT '',
        \`district\` varchar(255) NOT NULL DEFAULT '',
        \`pastor\` varchar(255) NOT NULL DEFAULT '',
        \`guardian\` varchar(255) NOT NULL DEFAULT '',
        \`guardian_contact\` varchar(20) NOT NULL DEFAULT '',
        \`photo_data\` longtext,
        \`other_info\` text,
        \`campus_residence\` varchar(5) NOT NULL DEFAULT '',
        \`campus_hall\` varchar(100) DEFAULT NULL,
        \`offcampus_location\` varchar(255) DEFAULT NULL,
        \`room_campus\` varchar(100) DEFAULT NULL,
        \`room_offcampus\` varchar(100) DEFAULT NULL,
        \`program_duration\` varchar(20) DEFAULT NULL,
        \`is_officer\` tinyint(1) NOT NULL DEFAULT 0,
        \`officer_role\` varchar(50) DEFAULT NULL,
        \`landmark\` varchar(255) DEFAULT NULL,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_contact\` (\`contact\`),
        KEY \`idx_membership\` (\`membership_type\`),
        KEY \`idx_created\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`departments\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`registration_id\` int(11) NOT NULL,
        \`department\` varchar(50) NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_registration\` (\`registration_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`newbie_registrations\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`contact\` varchar(20) NOT NULL,
        \`residence\` varchar(255) NOT NULL,
        \`program\` varchar(255) NOT NULL,
        \`membership\` varchar(50) NOT NULL,
        \`status\` varchar(20) NOT NULL DEFAULT 'pending',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`pushed_at\` timestamp NULL DEFAULT NULL,
        \`pushed_by\` varchar(100) NULL DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_contact\` (\`contact\`),
        KEY \`idx_status\` (\`status\`),
        KEY \`idx_created\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    schemaInitialized = true;
  } catch (err) {
    console.warn('ensureSchema note:', err.message);
  }
}

function checkAuth(req) {
  const adminToken = process.env.ADMIN_TOKEN;
  const headers = req.headers || {};
  const auth = headers.authorization || headers.Authorization;
  const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (adminToken) {
    return token === adminToken;
  }
  // Fall back to JWT verification
  const secret = process.env.JWT_SECRET || 'pensa-reg-dev-secret';
  if (!token) return false;
  try {
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}

// ─── POST: submit member registration ─────────────────────
async function createRegistration(body) {
  const b = body || {};
  const required = [
    'surname', 'othernames', 'gender', 'dob', 'contact',
    'program', 'education_level', 'membership',
    'district', 'pastor', 'guardian', 'guardian_contact',
    'campus_residence', 'program_duration',
  ];
  const missing = required.filter((f) => {
    const val = b[f];
    return val === undefined || val === null || String(val).trim() === '';
  });
  if (missing.length) {
    return {
      statusCode: 400,
      body: { success: false, message: `Missing required fields: ${missing.join(', ')}` },
    };
  }

  const campusResidence = String(b.campus_residence).toLowerCase();
  if (campusResidence !== 'yes' && campusResidence !== 'no') {
    return { statusCode: 400, body: { success: false, message: 'Please select campus residence option' } };
  }
  if (campusResidence === 'yes') {
    if (!b.campus_hall || !String(b.campus_hall).trim()) {
      return { statusCode: 400, body: { success: false, message: 'Please select your campus hall' } };
    }
    if (!b.room_campus || !String(b.room_campus).trim()) {
      return { statusCode: 400, body: { success: false, message: 'Please enter your room number' } };
    }
  } else {
    if (!b.offcampus_location || !String(b.offcampus_location).trim()) {
      return { statusCode: 400, body: { success: false, message: 'Please enter your hostel/location name' } };
    }
    if (!b.room_offcampus || !String(b.room_offcampus).trim()) {
      return { statusCode: 400, body: { success: false, message: 'Please enter your room number' } };
    }
  }

  const phoneRe = /^[0-9]{10}$/;
  if (!phoneRe.test(String(b.contact).trim())) {
    return { statusCode: 400, body: { success: false, message: 'Contact number must be exactly 10 digits' } };
  }
  if (!phoneRe.test(String(b.guardian_contact).trim())) {
    return { statusCode: 400, body: { success: false, message: 'Guardian contact number must be exactly 10 digits' } };
  }

  const dob = new Date(b.dob);
  const today = new Date();
  if (isNaN(dob.getTime())) {
    return { statusCode: 400, body: { success: false, message: 'Invalid date of birth' } };
  }
  if (dob > today) {
    return { statusCode: 400, body: { success: false, message: 'Date of birth cannot be in the future' } };
  }
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  if (age < 15) {
    return { statusCode: 400, body: { success: false, message: 'You must be at least 15 years old to register' } };
  }

  const p = getPool();
  try {
    const [dup] = await p.query('SELECT id FROM registrations WHERE contact = ? LIMIT 1', [String(b.contact).trim()]);
    if (dup.length) {
      return {
        statusCode: 409,
        body: {
          success: false,
          message: 'A registration with this contact number already exists. Please use a different contact number or contact support.',
        },
      };
    }
  } catch (err) {
    return { statusCode: 500, body: { success: false, message: `Database error: ${err.message}` } };
  }

  const residence = campusResidence === 'yes' ? b.campus_hall : b.offcampus_location;
  const room = campusResidence === 'yes' ? b.room_campus : b.room_offcampus;

  const otherInfo = {};
  if (b.is_officer === 'yes' || b.is_officer === true || b.is_officer === 1) {
    otherInfo.is_officer = true;
    if (b.officer_role) otherInfo.officer_role = b.officer_role;
  }
  if (b.landmark) otherInfo.landmark = b.landmark;
  const isOfficer = (b.is_officer === 'yes' || b.is_officer === true || b.is_officer === 1) ? 1 : 0;

  const row = {
    surname: clean(b.surname),
    othernames: clean(b.othernames),
    gender: clean(b.gender),
    dob: b.dob,
    contact: clean(b.contact),
    residence: clean(residence),
    room: clean(room),
    program: clean(b.program),
    education_level: clean(b.education_level),
    membership_type: clean(b.membership),
    district: clean(b.district),
    pastor: clean(b.pastor),
    guardian: clean(b.guardian),
    guardian_contact: clean(b.guardian_contact),
    photo_data: b.photoData || b.photo_data || null,
    other_info: Object.keys(otherInfo).length ? JSON.stringify(otherInfo) : null,
    campus_residence: campusResidence,
    campus_hall: clean(b.campus_hall),
    offcampus_location: clean(b.offcampus_location),
    room_campus: clean(b.room_campus),
    room_offcampus: clean(b.room_offcampus),
    program_duration: clean(b.program_duration),
    is_officer: isOfficer,
    officer_role: clean(b.officer_role),
    landmark: clean(b.landmark),
  };

  let departments = [];
  if (Array.isArray(b.departments)) {
    departments = b.departments.filter((d) => typeof d === 'string' && d.trim());
  } else if (typeof b.departments === 'string' && b.departments.trim()) {
    try {
      const parsed = JSON.parse(b.departments);
      if (Array.isArray(parsed)) departments = parsed;
    } catch {
      /* ignore */
    }
  }
  departments = departments.map((d) => String(d).trim()).filter(Boolean);

  let conn;
  try {
    conn = await p.getConnection();
    await conn.beginTransaction();
    const placeholders = REG_COLUMNS.map(() => '?').join(', ');
    const values = REG_COLUMNS.map((c) => row[c]);
    const [result] = await conn.query(
      `INSERT INTO registrations (${REG_COLUMNS.map((c) => `\`${c}\``).join(', ')}) VALUES (${placeholders})`,
      values
    );
    const id = result.insertId;
    if (departments.length) {
      await conn.query(
        'INSERT INTO departments (registration_id, department) VALUES ?',
        [departments.map((d) => [id, d])]
      );
    }

    // Mark any matching newbie record as completed
    try {
      await conn.query("UPDATE newbie_registrations SET status = 'completed' WHERE contact = ?", [row.contact]);
    } catch {
      /* ignore */
    }

    await conn.commit();
    return {
      statusCode: 201,
      body: {
        success: true,
        message: 'Registration successful!',
        data: {
          id,
          name: `${row.surname} ${row.othernames}`.trim(),
          membership_type: row.membership_type,
          departments_count: departments.length,
        },
      },
    };
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch { /* ignore */ }
    }
    return { statusCode: 500, body: { success: false, message: err.message } };
  } finally {
    if (conn) conn.release();
  }
}

// ─── POST: submit newbie registration ─────────────────────
async function createNewbie(body) {
  const b = body || {};
  const required = ['name', 'contact', 'residence', 'program', 'membership'];
  const missing = required.filter((f) => !b[f] || !String(b[f]).trim());
  if (missing.length) {
    return {
      statusCode: 400,
      body: { success: false, message: `Missing required fields: ${missing.join(', ')}` },
    };
  }

  const phoneRe = /^[0-9]{10}$/;
  if (!phoneRe.test(String(b.contact).trim())) {
    return { statusCode: 400, body: { success: false, message: 'Contact number must be exactly 10 digits' } };
  }

  const p = getPool();
  try {
    const contact = String(b.contact).trim();
    const [dup] = await p.query(
      "SELECT id FROM newbie_registrations WHERE contact = ? AND status != 'completed' LIMIT 1",
      [contact]
    );
    if (dup.length) {
      return {
        statusCode: 409,
        body: {
          success: false,
          message: 'A newbie registration with this contact number already exists.',
        },
      };
    }

    try {
      const [result] = await p.query(
        `INSERT INTO newbie_registrations (name, contact, residence, campus_residence, campus_hall, room_campus, offcampus_location, room_offcampus, landmark, program, membership, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [clean(b.name), contact, clean(b.residence), clean(b.campus_residence), clean(b.campus_hall), clean(b.room_campus), clean(b.offcampus_location), clean(b.room_offcampus), clean(b.landmark), clean(b.program), clean(b.membership)]
      );
      return {
        statusCode: 201,
        body: {
          success: true,
          message: 'Newbie registration submitted successfully!',
          data: { id: result.insertId, name: clean(b.name) },
        },
      };
    } catch (insertErr) {
      // Fallback in case optional columns don't exist yet on production DB table
      const [result] = await p.query(
        `INSERT INTO newbie_registrations (name, contact, residence, program, membership, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [clean(b.name), contact, clean(b.residence), clean(b.program), clean(b.membership)]
      );
      return {
        statusCode: 201,
        body: {
          success: true,
          message: 'Newbie registration submitted successfully!',
          data: { id: result.insertId, name: clean(b.name) },
        },
      };
    }
  } catch (err) {
    return { statusCode: 500, body: { success: false, message: err.message } };
  }
}

// ─── GET: check newbie record by contact ──────────────────
async function checkNewbie(contact) {
  const p = getPool();
  try {
    const phone = String(contact || '').trim();
    const [rows] = await p.query(
      'SELECT * FROM newbie_registrations WHERE contact = ? ORDER BY id DESC LIMIT 1',
      [phone]
    );
    if (!rows.length) {
      return { statusCode: 200, body: { found: false } };
    }
    return { statusCode: 200, body: { found: true, newbie: rows[0] } };
  } catch (err) {
    return { statusCode: 500, body: { error: err.message } };
  }
}

// ─── GET: list registrations (admin) ──────────────────────
async function listRegistrations(req) {
  if (!checkAuth(req)) {
    return { statusCode: 401, body: { error: 'Unauthorized' } };
  }
  const params = req.query || req.queryStringParameters || {};
  const { search, membership_type, gender, page = 1, limit = 50 } = params;
  const where = [];
  const args = [];
  if (search) {
    where.push('(surname LIKE ? OR othernames LIKE ? OR contact LIKE ? OR program LIKE ?)');
    const term = `%${search}%`;
    args.push(term, term, term, term);
  }
  if (membership_type) {
    where.push('membership_type = ?');
    args.push(membership_type);
  }
  if (gender) {
    where.push('gender = ?');
    args.push(gender);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Math.max(1, Number(page) || 1) - 1) * (Number(limit) || 50);
  const lim = Number(limit) || 50;

  const p = getPool();
  try {
    const [rows] = await p.query(
      `SELECT id, surname, othernames, gender, dob, contact, residence, room,
              program, education_level, membership_type, district, pastor,
              guardian, guardian_contact, campus_residence, campus_hall,
              offcampus_location, program_duration, is_officer, officer_role, created_at
       FROM registrations ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...args, lim, offset]
    );
    const [[{ total }]] = await p.query(`SELECT COUNT(*) AS total FROM registrations ${clause}`, args);
    return {
      statusCode: 200,
      body: { items: rows, total, page: Number(page) || 1, limit: lim },
    };
  } catch (err) {
    return { statusCode: 500, body: { error: err.message } };
  }
}

function sendResponse(res, statusCode, body) {
  if (res && typeof res.status === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(statusCode).json(body);
  }
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify(body),
  };
}

// ─── Main handler ─────────────────────────────────────────
// Supports both Vercel Node.js runtime (req, res) and AWS Lambda (event, context)
export default async function handler(req, res) {
  const method = req?.method || req?.httpMethod || 'GET';
  const url = req?.url || req?.path || '';

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(204).end();
    }
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  try {
    await ensureSchema();
  } catch (err) {
    console.warn('ensureSchema check:', err.message);
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body || '{}');
      } catch {
        body = {};
      }
    } else if (!body) {
      body = {};
    }

    const query = req.query || req.queryStringParameters || {};
    const isNewbie =
      url.includes('/newbie') ||
      query.type === 'newbie' ||
      query.action === 'newbie' ||
      body.is_newbie;

    // Route: Check newbie by contact: GET /api/reg/newbie/check/:contact or query ?check=...
    if (method === 'GET' && (query.check || url.includes('/check/'))) {
      const match = url.match(/\/check\/([0-9]+)/);
      const contact = query.check || (match ? match[1] : '');
      const result = await checkNewbie(contact);
      return sendResponse(res, result.statusCode, result.body);
    }

    // Route: POST Newbie form
    if (method === 'POST' && isNewbie) {
      const result = await createNewbie(body);
      return sendResponse(res, result.statusCode, result.body);
    }

    // Route: POST Member form
    if (method === 'POST') {
      const result = await createRegistration(body);
      return sendResponse(res, result.statusCode, result.body);
    }

    // Route: GET list registrations
    if (method === 'GET') {
      const result = await listRegistrations(req);
      return sendResponse(res, result.statusCode, result.body);
    }

    return sendResponse(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    return sendResponse(res, 500, { success: false, message: err.message });
  }
}
