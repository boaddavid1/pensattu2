import express from 'express';
import schoolPool from './schoolDb.js';

// Dedicated MySQL pool for School Retreat module (reads SCHOOL_DB_* / SCH_DB_*)
const pool = schoolPool;

const router = express.Router();

// Fallback in-memory state so the retreat system works seamlessly even if MySQL is offline
const memoryStore = {
  settings: {
    retreat_title: 'PENSA Schools & Campus Spiritual Retreat 2026',
    retreat_theme: 'Ignite & Shine — Transformed for Global Impact',
    venue: 'Takoradi Technical University Auditorium',
    dates: 'Nov 14 – Nov 17, 2026',
    active_session: 'Morning Plenary & Worship Session',
    sessions: [
      { id: 'sess_1', name: 'Day 1: Opening & Evening Revival', date: '2026-11-14', active: false },
      { id: 'sess_2', name: 'Day 2: Morning Plenary & Worship Session', date: '2026-11-15', active: true },
      { id: 'sess_3', name: 'Day 2: Leadership Seminar & Workshops', date: '2026-11-15', active: false },
      { id: 'sess_4', name: 'Day 3: Holy Ghost & Healing Encounter', date: '2026-11-16', active: false },
      { id: 'sess_5', name: 'Day 4: Communion & Commissioning Service', date: '2026-11-17', active: false },
    ],
  },
  schools: [],
  students: [],
  attendance: [],
};

// Auto-sync schema in MySQL if available
export async function syncRetreatSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS retreat_schools (
        id VARCHAR(50) PRIMARY KEY,
        school_code VARCHAR(30) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        registrant_name VARCHAR(150),
        registrant_contact VARCHAR(50),
        category VARCHAR(100),
        region VARCHAR(150),
        patron_name VARCHAR(150),
        patron_phone VARCHAR(50),
        patron_email VARCHAR(150),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Add registrant columns if table was created previously without them
    try {
      await pool.query(`ALTER TABLE retreat_schools ADD COLUMN registrant_name VARCHAR(150) NULL AFTER name`);
    } catch (e) {}
    try {
      await pool.query(`ALTER TABLE retreat_schools ADD COLUMN registrant_contact VARCHAR(50) NULL AFTER registrant_name`);
    } catch (e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS retreat_students (
        id VARCHAR(50) PRIMARY KEY,
        school_id VARCHAR(50) NOT NULL,
        school_name VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        gender VARCHAR(20),
        level_class VARCHAR(100),
        room_dorm VARCHAR(100),
        emergency_contact VARCHAR(100),
        qr_payload TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_school (school_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS retreat_attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        school_name VARCHAR(255) NOT NULL,
        action_type ENUM('clock_in', 'clock_out') NOT NULL,
        session_name VARCHAR(150) NOT NULL,
        scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        scanned_by VARCHAR(100) DEFAULT 'Gate Scanner',
        INDEX idx_student_session (student_id, session_name),
        INDEX idx_scanned_at (scanned_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Sync MySQL records into memoryStore so memory is ALWAYS complete
    const [dbSchools] = await pool.query('SELECT * FROM retreat_schools ORDER BY name ASC');
    const [dbStudents] = await pool.query('SELECT * FROM retreat_students ORDER BY full_name ASC');
    const [dbAttendance] = await pool.query('SELECT * FROM retreat_attendance ORDER BY scanned_at DESC LIMIT 1000');
    if (dbSchools) memoryStore.schools = dbSchools;
    if (dbStudents) memoryStore.students = dbStudents;
    if (dbAttendance) memoryStore.attendance = dbAttendance;
  } catch (err) {
    // Non-fatal, falls back to memoryStore
  }
}

// ─── 1. Get All Retreat Data (Schools, Students, Live Attendance, Settings) ───
router.get('/data', async (req, res) => {
  try {
    const [dbSchools] = await pool.query('SELECT * FROM retreat_schools ORDER BY name ASC');
    const [dbStudents] = await pool.query('SELECT * FROM retreat_students ORDER BY full_name ASC');
    const [dbAttendance] = await pool.query('SELECT * FROM retreat_attendance ORDER BY scanned_at DESC LIMIT 1000');

    if (dbSchools && dbSchools.length > 0) {
      memoryStore.schools = dbSchools;
      if (dbStudents && dbStudents.length > 0) memoryStore.students = dbStudents;
      if (dbAttendance && dbAttendance.length > 0) memoryStore.attendance = dbAttendance;

      // Calculate active clock-in status for each student in the active session
      const activeSession = memoryStore.settings.active_session;
      const studentStatusMap = {};

      for (const log of dbAttendance) {
        if (!studentStatusMap[log.student_id]) {
          studentStatusMap[log.student_id] = {
            status: log.action_type === 'clock_in' ? 'clocked_in' : 'clocked_out',
            last_scan: log.scanned_at,
            session_name: log.session_name,
          };
        }
      }

      return res.json({
        ok: true,
        settings: memoryStore.settings,
        schools: dbSchools,
        students: dbStudents.map((st) => ({
          ...st,
          current_status: studentStatusMap[st.id]?.status || 'not_arrived',
          last_scan: studentStatusMap[st.id]?.last_scan || null,
        })),
        attendance: dbAttendance,
      });
    }
  } catch (err) {
    // Falls through to memoryStore fallback
  }

  // Memory fallback
  const studentStatusMap = {};
  for (const log of memoryStore.attendance) {
    if (!studentStatusMap[log.student_id]) {
      studentStatusMap[log.student_id] = {
        status: log.action_type === 'clock_in' ? 'clocked_in' : 'clocked_out',
        last_scan: log.scanned_at,
        session_name: log.session_name,
      };
    }
  }

  res.json({
    ok: true,
    settings: memoryStore.settings,
    schools: memoryStore.schools,
    students: memoryStore.students.map((st) => ({
      ...st,
      current_status: studentStatusMap[st.id]?.status || 'not_arrived',
      last_scan: studentStatusMap[st.id]?.last_scan || null,
    })),
    attendance: memoryStore.attendance,
  });
});

// ─── 2. Register a School & Students in Batch ───
router.post('/register', async (req, res) => {
  try {
    const { school, students } = req.body;
    if (!school || !school.name) {
      return res.status(400).json({ error: 'School name is required' });
    }

    const schoolId = school.id || `sch_${Date.now()}`;
    const cleanSchoolName = school.name.trim();

    // Auto-generate school prefix if not given (e.g. "St. Peter's Boys" -> "STP")
    let schoolCode = (school.school_code || '').trim().toUpperCase();
    if (!schoolCode) {
      schoolCode = cleanSchoolName
        .replace(/[^A-Za-z]/g, '')
        .slice(0, 4)
        .toUpperCase() || 'SCH';
    }

    const registrantName = (school.registrant_name || school.name || school.submitter_name || '').trim();
    const registrantContact = (school.registrant_contact || school.contact || school.submitter_contact || '').trim();
    const teacherInchargeName = (school.teacher_incharge_name || school.teacher_name || school.patron_name || '').trim();
    const teacherInchargeContact = (school.teacher_incharge_contact || school.teacher_contact || school.patron_phone || '').trim();

    const newSchool = {
      id: schoolId,
      school_code: schoolCode,
      name: cleanSchoolName,
      registrant_name: registrantName,
      registrant_contact: registrantContact,
      teacher_incharge_name: teacherInchargeName,
      teacher_incharge_contact: teacherInchargeContact,
      patron_name: teacherInchargeName || registrantName,
      patron_phone: teacherInchargeContact || registrantContact,
      category: school.category || 'Senior High School',
      region: school.region || 'Ghana',
      patron_email: school.patron_email || '',
      notes: school.notes || '',
      created_at: new Date().toISOString(),
    };

    // Prepare student records with unique QR code IDs
    const studentList = Array.isArray(students) ? students : [];
    const formattedStudents = studentList
      .filter((st) => st && (st.full_name || st.name))
      .map((st, idx) => {
        const studentIndex = String(idx + 1).padStart(3, '0');
        const studentId = st.id || `RET26-${schoolCode}-${studentIndex}`;
        const name = (st.full_name || st.name).trim();
        return {
          id: studentId,
          school_id: schoolId,
          school_name: cleanSchoolName,
          full_name: name,
          gender: st.gender || 'Not Specified',
          level_class: st.level_class || st.class || 'Student Delegate',
          room_dorm: st.room_dorm || st.room || '',
          emergency_contact: st.emergency_contact || teacherInchargeContact || registrantContact || '',
          qr_payload: studentId,
          created_at: new Date().toISOString(),
        };
      });

    // Try saving to MySQL database
    try {
      await pool.query(
        `INSERT INTO retreat_schools (id, school_code, name, registrant_name, registrant_contact, category, region, patron_name, patron_phone, patron_email, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), registrant_name = VALUES(registrant_name), registrant_contact = VALUES(registrant_contact), patron_name = VALUES(patron_name), patron_phone = VALUES(patron_phone), notes = VALUES(notes)`,
        [newSchool.id, newSchool.school_code, newSchool.name, newSchool.registrant_name, newSchool.registrant_contact, newSchool.category, newSchool.region, newSchool.patron_name, newSchool.patron_phone, newSchool.patron_email, newSchool.notes, newSchool.created_at]
      );

      for (const st of formattedStudents) {
        await pool.query(
          `INSERT INTO retreat_students (id, school_id, school_name, full_name, gender, level_class, room_dorm, emergency_contact, qr_payload, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), gender = VALUES(gender), level_class = VALUES(level_class), room_dorm = VALUES(room_dorm)`,
          [st.id, st.school_id, st.school_name, st.full_name, st.gender, st.level_class, st.room_dorm, st.emergency_contact, st.qr_payload, st.created_at]
        );
      }
    } catch (dbErr) {
      // Non-fatal, falls back to memory
    }

    // Always update memoryStore
    const existingSchoolIdx = memoryStore.schools.findIndex((s) => s.id === schoolId || s.name.toLowerCase() === cleanSchoolName.toLowerCase());
    if (existingSchoolIdx >= 0) {
      memoryStore.schools[existingSchoolIdx] = newSchool;
    } else {
      memoryStore.schools.unshift(newSchool);
    }

    // Append or replace students
    memoryStore.students = memoryStore.students.filter((st) => st.school_id !== schoolId);
    memoryStore.students.push(...formattedStudents);

    res.status(201).json({
      ok: true,
      message: `Successfully registered ${newSchool.name} with ${formattedStudents.length} student badges generated!`,
      school: newSchool,
      students: formattedStudents,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to register school' });
  }
});

// ─── 3. Process QR Scan (Clock In & Clock Out) ───
router.post('/scan', async (req, res) => {
  try {
    const { student_id, action_type, session_name, scanner_label } = req.body;
    if (!student_id) {
      return res.status(400).json({ error: 'Student ID or QR code is required' });
    }

    let cleanId = String(student_id).trim().toUpperCase().replace(/^["']+|["']+$/g, '').trim();

    // 1. If QR payload was JSON-encoded
    if (cleanId.startsWith('{') && cleanId.endsWith('}')) {
      try {
        const parsed = JSON.parse(student_id);
        cleanId = String(parsed.id || parsed.student_id || parsed.qr_payload || parsed.name || cleanId).trim().toUpperCase();
      } catch (e) {}
    }

    // 2. If QR payload was a URL
    if (cleanId.includes('HTTP://') || cleanId.includes('HTTPS://') || cleanId.includes('://')) {
      try {
        const u = new URL(String(student_id).trim());
        const paramId = u.searchParams.get('id') || u.searchParams.get('student_id') || u.searchParams.get('badge') || u.searchParams.get('code');
        if (paramId) {
          cleanId = paramId.trim().toUpperCase();
        } else {
          const parts = u.pathname.split('/').filter(Boolean);
          if (parts.length > 0) cleanId = parts[parts.length - 1].trim().toUpperCase();
        }
      } catch (e) {}
    }

    // 3. Extract standard RET code if contained (e.g. RET26-AUG-001)
    const retMatch = cleanId.match(/(RET\d*-[A-Za-z0-9_-]+-\d+)/i);
    const candidateId = retMatch ? retMatch[1].toUpperCase() : cleanId;
    const strippedId = candidateId.replace(/[^A-Z0-9]/g, '');

    // 4. Search in memoryStore
    let student = memoryStore.students.find((s) => {
      const sId = (s.id || '').toUpperCase().trim();
      const sPayload = (s.qr_payload || '').toUpperCase().trim();
      const sName = (s.full_name || '').toUpperCase().trim();
      const sStripped = sId.replace(/[^A-Z0-9]/g, '');
      return (
        sId === candidateId ||
        sPayload === candidateId ||
        sId === cleanId ||
        sPayload === cleanId ||
        sName === cleanId ||
        (strippedId && sStripped === strippedId) ||
        cleanId.includes(sId) ||
        (candidateId && sId.includes(candidateId)) ||
        (cleanId.length >= 3 && sName.includes(cleanId))
      );
    });

    // 5. Search in MySQL database
    if (!student) {
      try {
        const [rows] = await pool.query(
          `SELECT * FROM retreat_students 
           WHERE UPPER(TRIM(id)) = ? 
              OR UPPER(TRIM(qr_payload)) = ?
              OR UPPER(TRIM(id)) = ?
              OR UPPER(TRIM(qr_payload)) = ?
              OR UPPER(TRIM(full_name)) = ?
              OR UPPER(REPLACE(id, '-', '')) = ?
              OR ? LIKE CONCAT('%', UPPER(TRIM(id)), '%')
              OR (LENGTH(?) >= 3 AND UPPER(TRIM(full_name)) LIKE ?)
           LIMIT 1`,
          [candidateId, candidateId, cleanId, cleanId, cleanId, strippedId, cleanId, cleanId, `%${cleanId}%`]
        );
        if (rows && rows.length > 0) {
          student = rows[0];
          // Cache in memory for instant lookups
          if (!memoryStore.students.some((s) => s.id === student.id)) {
            memoryStore.students.push(student);
          }
        }
      } catch (err) {
        console.error('MySQL student scan query error:', err);
      }
    }

    if (!student) {
      return res.status(404).json({
        ok: false,
        error: `Unrecognized QR Code: "${cleanId}". No registered student matches this badge.`,
      });
    }

    const activeSession = session_name || memoryStore.settings.active_session || 'Main Session';

    // Check recent scans for this student to determine toggle and duplicate cooldown
    const recentScans = memoryStore.attendance.filter(
      (a) => a.student_id === student.id && a.session_name === activeSession
    );
    const lastScan = recentScans[0]; // Most recent

    // Determine action: either requested, or toggle if not specified / 'auto'
    let finalAction = action_type;
    if (!finalAction || finalAction === 'auto') {
      finalAction = lastScan && lastScan.action_type === 'clock_in' ? 'clock_out' : 'clock_in';
    }

    // Cooldown check (prevent accidental double tap within 10 seconds of identical action)
    if (lastScan && lastScan.action_type === finalAction) {
      const secondsAgo = Math.floor((Date.now() - new Date(lastScan.scanned_at).getTime()) / 1000);
      if (secondsAgo < 12) {
        return res.status(200).json({
          ok: true,
          duplicate: true,
          action_type: finalAction,
          message: `Already ${finalAction === 'clock_in' ? 'clocked in' : 'clocked out'} ${secondsAgo} seconds ago.`,
          student,
          last_scan: lastScan,
        });
      }
    }

    const scanRecord = {
      id: Date.now(),
      student_id: student.id,
      student_name: student.full_name,
      school_name: student.school_name,
      action_type: finalAction,
      session_name: activeSession,
      scanned_at: new Date().toISOString(),
      scanned_by: scanner_label || 'Gate Terminal 1',
    };

    // Store in MySQL
    try {
      const [insertRes] = await pool.query(
        `INSERT INTO retreat_attendance (student_id, student_name, school_name, action_type, session_name, scanned_at, scanned_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [scanRecord.student_id, scanRecord.student_name, scanRecord.school_name, scanRecord.action_type, scanRecord.session_name, scanRecord.scanned_at, scanRecord.scanned_by]
      );
      if (insertRes && insertRes.insertId) scanRecord.id = insertRes.insertId;
    } catch (err) {}

    // Store at top of memory
    memoryStore.attendance.unshift(scanRecord);

    res.json({
      ok: true,
      action_type: finalAction,
      message: `Successfully ${finalAction === 'clock_in' ? 'Clocked In' : 'Clocked Out'}!`,
      student,
      record: scanRecord,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Scan processing failed' });
  }
});

// ─── 4. Update Settings (Active Session, Title, etc.) ───
router.put('/settings', (req, res) => {
  try {
    const { active_session, retreat_title, retreat_theme, venue } = req.body;
    if (active_session) memoryStore.settings.active_session = active_session;
    if (retreat_title) memoryStore.settings.retreat_title = retreat_title;
    if (retreat_theme) memoryStore.settings.retreat_theme = retreat_theme;
    if (venue) memoryStore.settings.venue = venue;

    res.json({ ok: true, settings: memoryStore.settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 5. Update Student Details ───
router.put('/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const { full_name, gender, level_class, room_dorm, emergency_contact } = req.body;

    // Update in MySQL if connected
    try {
      await pool.query(
        `UPDATE retreat_students 
         SET full_name = COALESCE(?, full_name),
             gender = COALESCE(?, gender),
             level_class = COALESCE(?, level_class),
             room_dorm = COALESCE(?, room_dorm),
             emergency_contact = COALESCE(?, emergency_contact)
         WHERE id = ?`,
        [full_name, gender, level_class, room_dorm, emergency_contact, studentId]
      );
    } catch (e) {}

    // Update in memory
    const idx = memoryStore.students.findIndex((s) => s.id === studentId);
    if (idx >= 0) {
      if (full_name) memoryStore.students[idx].full_name = full_name;
      if (gender) memoryStore.students[idx].gender = gender;
      if (level_class !== undefined) memoryStore.students[idx].level_class = level_class;
      if (room_dorm !== undefined) memoryStore.students[idx].room_dorm = room_dorm;
      if (emergency_contact !== undefined) memoryStore.students[idx].emergency_contact = emergency_contact;
      return res.json({ ok: true, student: memoryStore.students[idx] });
    }

    res.json({ ok: true, message: 'Student updated' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update student' });
  }
});

// ─── 6. Delete a Student ───
router.delete('/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;

    // Delete in MySQL
    try {
      await pool.query('DELETE FROM retreat_students WHERE id = ?', [studentId]);
      await pool.query('DELETE FROM retreat_attendance WHERE student_id = ?', [studentId]);
    } catch (e) {}

    // Delete in memory
    memoryStore.students = memoryStore.students.filter((s) => s.id !== studentId);
    memoryStore.attendance = memoryStore.attendance.filter((a) => a.student_id !== studentId);

    res.json({ ok: true, message: `Student ${studentId} deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete student' });
  }
});

// ─── 7. Update School Details ───
router.put('/schools/:id', async (req, res) => {
  try {
    const schoolId = req.params.id;
    const { name, category, region, patron_name, patron_phone, patron_email, notes, teacher_incharge_name, teacher_incharge_contact } = req.body;

    // Update in MySQL
    try {
      await pool.query(
        `UPDATE retreat_schools
         SET name = COALESCE(?, name),
             category = COALESCE(?, category),
             region = COALESCE(?, region),
             patron_name = COALESCE(?, patron_name),
             patron_phone = COALESCE(?, patron_phone),
             patron_email = COALESCE(?, patron_email),
             notes = COALESCE(?, notes)
         WHERE id = ?`,
        [name, category, region, patron_name || teacher_incharge_name, patron_phone || teacher_incharge_contact, patron_email, notes, schoolId]
      );
    } catch (e) {}

    // Update in memory
    const idx = memoryStore.schools.findIndex((s) => s.id === schoolId);
    if (idx >= 0) {
      if (name) memoryStore.schools[idx].name = name;
      if (category) memoryStore.schools[idx].category = category;
      if (region !== undefined) memoryStore.schools[idx].region = region;
      if (patron_name) memoryStore.schools[idx].patron_name = patron_name;
      if (patron_phone) memoryStore.schools[idx].patron_phone = patron_phone;
      if (patron_email !== undefined) memoryStore.schools[idx].patron_email = patron_email;
      if (notes !== undefined) memoryStore.schools[idx].notes = notes;
      return res.json({ ok: true, school: memoryStore.schools[idx] });
    }

    res.json({ ok: true, message: 'School updated' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update school' });
  }
});

// ─── 8. Delete a School and All its Students ───
router.delete('/schools/:id', async (req, res) => {
  try {
    const schoolId = req.params.id;

    // Delete in MySQL
    try {
      const [stuRows] = await pool.query('SELECT id FROM retreat_students WHERE school_id = ?', [schoolId]);
      const studentIds = (stuRows || []).map((s) => s.id);

      await pool.query('DELETE FROM retreat_schools WHERE id = ?', [schoolId]);
      await pool.query('DELETE FROM retreat_students WHERE school_id = ?', [schoolId]);
      if (studentIds.length > 0) {
        await pool.query('DELETE FROM retreat_attendance WHERE student_id IN (?)', [studentIds]);
      }
    } catch (e) {}

    // Delete in memory
    memoryStore.schools = memoryStore.schools.filter((s) => s.id !== schoolId);
    const deletedStudents = memoryStore.students.filter((st) => st.school_id === schoolId).map((st) => st.id);
    memoryStore.students = memoryStore.students.filter((st) => st.school_id !== schoolId);
    memoryStore.attendance = memoryStore.attendance.filter((a) => !deletedStudents.includes(a.student_id));

    res.json({ ok: true, message: `School ${schoolId} and delegates deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete school' });
  }
});

// ─── 9. Reset to Sample Data or Clear Attendance ───
router.post('/reset', async (req, res) => {
  const { action } = req.body;
  if (action === 'clear_attendance') {
    try {
      await pool.query('TRUNCATE TABLE retreat_attendance');
    } catch (e) {}
    memoryStore.attendance = [];
    return res.json({ ok: true, message: 'All attendance records cleared' });
  }

  if (action === 'wipe_all_production') {
    try {
      await pool.query('TRUNCATE TABLE retreat_attendance');
      await pool.query('TRUNCATE TABLE retreat_students');
      await pool.query('TRUNCATE TABLE retreat_schools');
    } catch (e) {}
    memoryStore.schools = [];
    memoryStore.students = [];
    memoryStore.attendance = [];
    return res.json({ ok: true, message: 'All retreat database data permanently cleared for production.' });
  }

  // Full reset
  res.json({ ok: true, message: 'Reset handled' });
});

export default router;
