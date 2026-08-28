// regRoutes.js — PENSA TTU member registration API (converted from the PHP reg project).
// All endpoints are prefixed with /api/reg and connect to the u197926764_pensattu
// database (same DB as the sec/alumni modules, so we reuse secPool).
//
// Endpoints:
//   Public:
//     POST   /              — submit a new registration (port of submit.php)
//   Admin (requireAuth):
//     GET    /              — list registrations (search, pagination)
//     GET    /stats         — aggregate stats (totals, by type, by gender, by dept)
//     GET    /:id           — single registration with departments
//     DELETE /:id           — delete a registration (and its departments)

import { Router } from 'express';
import secPool from './secDb.js';
import { requireAuth } from './auth.js';

const router = Router();

// Fields stored directly on the registrations table (excluding departments).
const REG_COLUMNS = [
  'surname', 'othernames', 'gender', 'dob', 'contact',
  'residence', 'room', 'program', 'education_level', 'membership_type',
  'district', 'pastor', 'guardian', 'guardian_contact',
  'photo_data', 'other_info',
  'campus_residence', 'campus_hall', 'offcampus_location',
  'room_campus', 'room_offcampus', 'program_duration',
  'is_officer', 'officer_role', 'landmark',
];

// Lightweight sanitiser — trims and strips HTML tags. Mirrors the PHP
// htmlspecialchars(strip_tags(trim(...))) used in Registration::sanitizeInputs.
function clean(value) {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  if (trimmed === '') return '';
  return trimmed
    .replace(/<[^>]*>/g, '') // strip tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── Public: create registration ───────────────────────────
router.post('/', async (req, res) => {
  const b = req.body || {};

  // Required fields (mirrors submit.php $required_fields + campus residence logic)
  const required = [
    'surname', 'othernames', 'gender', 'dob', 'contact',
    'program', 'education_level', 'membership',
    'district', 'pastor', 'guardian', 'guardian_contact',
    'campus_residence', 'program_duration',
  ];
  const missing = required.filter((f) => {
    const key = f === 'membership' ? 'membership' : f;
    const val = b[key];
    return val === undefined || val === null || String(val).trim() === '';
  });
  if (missing.length) {
    return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
  }

  const campusResidence = String(b.campus_residence).toLowerCase();
  if (campusResidence !== 'yes' && campusResidence !== 'no') {
    return res.status(400).json({ success: false, message: 'Please select campus residence option' });
  }
  if (campusResidence === 'yes') {
    if (!b.campus_hall || !String(b.campus_hall).trim()) return res.status(400).json({ success: false, message: 'Please select your campus hall' });
    if (!b.room_campus || !String(b.room_campus).trim()) return res.status(400).json({ success: false, message: 'Please enter your room number' });
  } else {
    if (!b.offcampus_location || !String(b.offcampus_location).trim()) return res.status(400).json({ success: false, message: 'Please enter your hostel/location name' });
    if (!b.room_offcampus || !String(b.room_offcampus).trim()) return res.status(400).json({ success: false, message: 'Please enter your room number' });
  }

  // Validate contact numbers (exactly 10 digits)
  const phoneRe = /^[0-9]{10}$/;
  if (!phoneRe.test(String(b.contact).trim())) {
    return res.status(400).json({ success: false, message: 'Contact number must be exactly 10 digits' });
  }
  if (!phoneRe.test(String(b.guardian_contact).trim())) {
    return res.status(400).json({ success: false, message: 'Guardian contact number must be exactly 10 digits' });
  }

  // Validate date of birth
  const dob = new Date(b.dob);
  const today = new Date();
  if (isNaN(dob.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid date of birth' });
  }
  if (dob > today) {
    return res.status(400).json({ success: false, message: 'Date of birth cannot be in the future' });
  }
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  if (age < 15) {
    return res.status(400).json({ success: false, message: 'You must be at least 15 years old to register' });
  }

  // Duplicate check on contact
  try {
    const [dup] = await secPool.query('SELECT id FROM registrations WHERE contact = ? LIMIT 1', [String(b.contact).trim()]);
    if (dup.length) {
      return res.status(409).json({
        success: false,
        message: 'A registration with this contact number already exists. Please use a different contact number or contact support.',
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }

  // Resolve residence/room from the campus selection (mirrors submit.php)
  const residence = campusResidence === 'yes' ? b.campus_hall : b.offcampus_location;
  const room = campusResidence === 'yes' ? b.room_campus : b.room_offcampus;

  // Build other_info JSON (officer + landmark) for compatibility with the PHP schema
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

  // Departments (array of strings)
  let departments = [];
  if (Array.isArray(b.departments)) departments = b.departments.filter((d) => typeof d === 'string' && d.trim());
  else if (typeof b.departments === 'string' && b.departments.trim()) {
    try { const parsed = JSON.parse(b.departments); if (Array.isArray(parsed)) departments = parsed; } catch { /* ignore */ }
  }
  departments = departments.map((d) => String(d).trim()).filter(Boolean);

  const conn = await secPool.getConnection();
  try {
    await conn.beginTransaction();

    const columns = REG_COLUMNS;
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map((c) => row[c]);
    const [result] = await conn.query(
      `INSERT INTO registrations (${columns.map((c) => `\`${c}\``).join(', ')}) VALUES (${placeholders})`,
      values
    );
    const id = result.insertId;

    if (departments.length) {
      await conn.query(
        'INSERT INTO departments (registration_id, department) VALUES ?',
        [departments.map((d) => [id, d])]
      );
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        id,
        name: `${row.surname} ${row.othernames}`.trim(),
        membership_type: row.membership_type,
        departments_count: departments.length,
      },
    });
  } catch (err) {
    try { await conn.rollback(); } catch { /* ignore */ }
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// ─── Admin: list registrations ─────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search, membership_type, gender, page = 1, limit = 50 } = req.query;
    const where = [];
    const params = [];
    if (search) {
      where.push('(surname LIKE ? OR othernames LIKE ? OR contact LIKE ? OR program LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (membership_type) { where.push('membership_type = ?'); params.push(membership_type); }
    if (gender) { where.push('gender = ?'); params.push(gender); }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const offset = (Math.max(1, Number(page) || 1) - 1) * (Number(limit) || 50);
    const lim = Number(limit) || 50;

    const [rows] = await secPool.query(
      `SELECT id, surname, othernames, gender, dob, contact, residence, room,
              program, education_level, membership_type, district, pastor,
              guardian, guardian_contact, campus_residence, campus_hall,
              offcampus_location, program_duration, is_officer, officer_role,
              created_at
       FROM registrations ${clause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, lim, offset]
    );

    const [[{ total }]] = await secPool.query(
      `SELECT COUNT(*) AS total FROM registrations ${clause}`,
      params
    );

    res.json({ items: rows, total, page: Number(page) || 1, limit: lim });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin: stats ──────────────────────────────────────────
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [[totalRow]] = await secPool.query('SELECT COUNT(*) AS total FROM registrations');
    const [byType] = await secPool.query('SELECT membership_type, COUNT(*) AS count FROM registrations GROUP BY membership_type');
    const [byGender] = await secPool.query('SELECT gender, COUNT(*) AS count FROM registrations GROUP BY gender');
    const [byLevel] = await secPool.query('SELECT education_level, COUNT(*) AS count FROM registrations GROUP BY education_level');
    const [byDept] = await secPool.query('SELECT department, COUNT(*) AS count FROM departments GROUP BY department ORDER BY count DESC');

    const membership = {};
    byType.forEach((r) => { membership[r.membership_type] = r.count; });
    const gender = {};
    byGender.forEach((r) => { gender[r.gender] = r.count; });
    const levels = {};
    byLevel.forEach((r) => { levels[r.education_level] = r.count; });

    res.json({
      total: totalRow.total,
      membership,
      gender,
      levels,
      departments: byDept,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin: single registration (with departments) ─────────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await secPool.query('SELECT * FROM registrations WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Registration not found' });
    const [depts] = await secPool.query('SELECT department FROM departments WHERE registration_id = ?', [req.params.id]);
    res.json({ ...rows[0], departments: depts.map((d) => d.department) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin: delete registration ────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  const conn = await secPool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM departments WHERE registration_id = ?', [req.params.id]);
    const [result] = await conn.query('DELETE FROM registrations WHERE id = ?', [req.params.id]);
    await conn.commit();
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Registration not found' });
    res.json({ ok: true });
  } catch (err) {
    try { await conn.rollback(); } catch { /* ignore */ }
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

export default router;
