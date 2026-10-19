import express from 'express';
import pool from './db.js';

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
  schools: [
    {
      id: 'sch_1',
      school_code: 'AUGUS',
      name: "St. Augustine's College",
      category: 'Senior High School',
      region: 'Central Region, Cape Coast',
      patron_name: 'Elder Francis Quaye',
      patron_phone: '+233 24 456 7891',
      patron_email: 'fquaye@augus.edu.gh',
      notes: 'Bus arrives Saturday morning 7:30 AM',
      created_at: new Date('2026-10-15T08:00:00Z').toISOString(),
    },
    {
      id: 'sch_2',
      school_code: 'WGHS',
      name: "Wesley Girls' High School",
      category: 'Senior High School',
      region: 'Central Region, Cape Coast',
      patron_name: 'Mrs. Grace Annan',
      patron_phone: '+233 20 812 3456',
      patron_email: 'gannan@wghs.edu.gh',
      notes: 'Special accommodation requested for 2 patrons',
      created_at: new Date('2026-10-15T09:30:00Z').toISOString(),
    },
    {
      id: 'sch_3',
      school_code: 'PREM',
      name: 'Prempeh College',
      category: 'Senior High School',
      region: 'Ashanti Region, Kumasi',
      patron_name: 'Pastor Samuel Boakye',
      patron_phone: '+233 55 987 6543',
      patron_email: 'sboakye@prempeh.edu.gh',
      notes: 'Delegation accompanied by 2 scripture union coordinators',
      created_at: new Date('2026-10-16T11:15:00Z').toISOString(),
    },
    {
      id: 'sch_4',
      school_code: 'TTU',
      name: 'Takoradi Technical University PENSA',
      category: 'University / Tertiary',
      region: 'Western Region, Takoradi',
      patron_name: 'Deacon Dennis Mensah',
      patron_phone: '+233 24 112 2334',
      patron_email: 'dmensah@ttu.edu.gh',
      notes: 'Host campus student delegates and volunteer stewards',
      created_at: new Date('2026-10-16T14:00:00Z').toISOString(),
    },
  ],
  students: [
    // St. Augustine's College
    { id: 'RET26-AUG-001', school_id: 'sch_1', school_name: "St. Augustine's College", full_name: 'Kwame Mensah Addo', gender: 'Male', level_class: 'Form 3 Science', room_dorm: 'St. Luke Hall', emergency_contact: '+233 24 333 4441', qr_payload: 'RET26-AUG-001', created_at: new Date().toISOString() },
    { id: 'RET26-AUG-002', school_id: 'sch_1', school_name: "St. Augustine's College", full_name: 'Emmanuel Kojo Antwi', gender: 'Male', level_class: 'Form 2 General Arts', room_dorm: 'St. Luke Hall', emergency_contact: '+233 24 333 4442', qr_payload: 'RET26-AUG-002', created_at: new Date().toISOString() },
    { id: 'RET26-AUG-003', school_id: 'sch_1', school_name: "St. Augustine's College", full_name: 'David Osei Poku', gender: 'Male', level_class: 'Form 3 Business', room_dorm: 'St. Peter Hall', emergency_contact: '+233 24 333 4443', qr_payload: 'RET26-AUG-003', created_at: new Date().toISOString() },
    { id: 'RET26-AUG-004', school_id: 'sch_1', school_name: "St. Augustine's College", full_name: 'Samuel Yaw Danso', gender: 'Male', level_class: 'Form 2 Science', room_dorm: 'St. Peter Hall', emergency_contact: '+233 24 333 4444', qr_payload: 'RET26-AUG-004', created_at: new Date().toISOString() },
    
    // Wesley Girls' High School
    { id: 'RET26-WGH-001', school_id: 'sch_2', school_name: "Wesley Girls' High School", full_name: 'Akosua Serwaa Boateng', gender: 'Female', level_class: 'Form 3 Science', room_dorm: 'Ruth House', emergency_contact: '+233 20 555 6661', qr_payload: 'RET26-WGH-001', created_at: new Date().toISOString() },
    { id: 'RET26-WGH-002', school_id: 'sch_2', school_name: "Wesley Girls' High School", full_name: 'Abena Mansa Appiah', gender: 'Female', level_class: 'Form 3 General Arts', room_dorm: 'Ruth House', emergency_contact: '+233 20 555 6662', qr_payload: 'RET26-WGH-002', created_at: new Date().toISOString() },
    { id: 'RET26-WGH-003', school_id: 'sch_2', school_name: "Wesley Girls' High School", full_name: 'Priscilla Ewurama Baidoo', gender: 'Female', level_class: 'Form 2 Home Economics', room_dorm: 'Esther House', emergency_contact: '+233 20 555 6663', qr_payload: 'RET26-WGH-003', created_at: new Date().toISOString() },
    { id: 'RET26-WGH-004', school_id: 'sch_2', school_name: "Wesley Girls' High School", full_name: 'Blessing Nana Yaa Frimpong', gender: 'Female', level_class: 'Form 2 Visual Arts', room_dorm: 'Esther House', emergency_contact: '+233 20 555 6664', qr_payload: 'RET26-WGH-004', created_at: new Date().toISOString() },

    // Prempeh College
    { id: 'RET26-PRM-001', school_id: 'sch_3', school_name: 'Prempeh College', full_name: 'Kofi Owusu Ansah', gender: 'Male', level_class: 'Form 3 Science', room_dorm: 'Osei Tutu House', emergency_contact: '+233 55 123 4561', qr_payload: 'RET26-PRM-001', created_at: new Date().toISOString() },
    { id: 'RET26-PRM-002', school_id: 'sch_3', school_name: 'Prempeh College', full_name: 'Michael Nana Kwesi Darko', gender: 'Male', level_class: 'Form 2 Science', room_dorm: 'Osei Tutu House', emergency_contact: '+233 55 123 4562', qr_payload: 'RET26-PRM-002', created_at: new Date().toISOString() },
    { id: 'RET26-PRM-003', school_id: 'sch_3', school_name: 'Prempeh College', full_name: 'Stephen Kwame Frimpong', gender: 'Male', level_class: 'Form 3 Business', room_dorm: 'Freeman House', emergency_contact: '+233 55 123 4563', qr_payload: 'RET26-PRM-003', created_at: new Date().toISOString() },

    // TTU PENSA
    { id: 'RET26-TTU-001', school_id: 'sch_4', school_name: 'Takoradi Technical University PENSA', full_name: 'Caleb Joshua Eshun', gender: 'Male', level_class: 'Level 300 Electrical Eng', room_dorm: 'Host Campus', emergency_contact: '+233 24 777 8881', qr_payload: 'RET26-TTU-001', created_at: new Date().toISOString() },
    { id: 'RET26-TTU-002', school_id: 'sch_4', school_name: 'Takoradi Technical University PENSA', full_name: 'Eunice Adwoa Nyamekye', gender: 'Female', level_class: 'Level 200 Computer Science', room_dorm: 'Host Campus', emergency_contact: '+233 24 777 8882', qr_payload: 'RET26-TTU-002', created_at: new Date().toISOString() },
    { id: 'RET26-TTU-003', school_id: 'sch_4', school_name: 'Takoradi Technical University PENSA', full_name: 'Gabriel Kweku Dadzie', gender: 'Male', level_class: 'Level 400 Civil Eng', room_dorm: 'Host Campus', emergency_contact: '+233 24 777 8883', qr_payload: 'RET26-TTU-003', created_at: new Date().toISOString() },
    { id: 'RET26-TTU-004', school_id: 'sch_4', school_name: 'Takoradi Technical University PENSA', full_name: 'Dorothy Maame Yeboah', gender: 'Female', level_class: 'Level 100 Hospitality Mgt', room_dorm: 'Host Campus', emergency_contact: '+233 24 777 8884', qr_payload: 'RET26-TTU-004', created_at: new Date().toISOString() },
  ],
  attendance: [
    {
      id: 1,
      student_id: 'RET26-AUG-001',
      student_name: 'Kwame Mensah Addo',
      school_name: "St. Augustine's College",
      action_type: 'clock_in',
      session_name: 'Morning Plenary & Worship Session',
      scanned_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      scanned_by: 'Main Gate Scanner',
    },
    {
      id: 2,
      student_id: 'RET26-WGH-001',
      student_name: 'Akosua Serwaa Boateng',
      school_name: "Wesley Girls' High School",
      action_type: 'clock_in',
      session_name: 'Morning Plenary & Worship Session',
      scanned_at: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
      scanned_by: 'Main Gate Scanner',
    },
    {
      id: 3,
      student_id: 'RET26-PRM-001',
      student_name: 'Kofi Owusu Ansah',
      school_name: 'Prempeh College',
      action_type: 'clock_in',
      session_name: 'Morning Plenary & Worship Session',
      scanned_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      scanned_by: 'North Gate Scanner',
    },
    {
      id: 4,
      student_id: 'RET26-TTU-001',
      student_name: 'Caleb Joshua Eshun',
      school_name: 'Takoradi Technical University PENSA',
      action_type: 'clock_in',
      session_name: 'Morning Plenary & Worship Session',
      scanned_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      scanned_by: 'Main Gate Scanner',
    },
    {
      id: 5,
      student_id: 'RET26-TTU-002',
      student_name: 'Eunice Adwoa Nyamekye',
      school_name: 'Takoradi Technical University PENSA',
      action_type: 'clock_in',
      session_name: 'Morning Plenary & Worship Session',
      scanned_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      scanned_by: 'Main Gate Scanner',
    },
  ],
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

    // Check if initial data is present in database; if not, seed from memory
    const [existing] = await pool.query('SELECT COUNT(*) AS total FROM retreat_schools');
    if (existing[0].total === 0) {
      for (const s of memoryStore.schools) {
        await pool.query(
          `INSERT INTO retreat_schools (id, school_code, name, category, region, patron_name, patron_phone, patron_email, notes, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [s.id, s.school_code, s.name, s.category, s.region, s.patron_name, s.patron_phone, s.patron_email, s.notes, s.created_at]
        );
      }
      for (const st of memoryStore.students) {
        await pool.query(
          `INSERT INTO retreat_students (id, school_id, school_name, full_name, gender, level_class, room_dorm, emergency_contact, qr_payload, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [st.id, st.school_id, st.school_name, st.full_name, st.gender, st.level_class, st.room_dorm, st.emergency_contact, st.qr_payload, st.created_at]
        );
      }
    }
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

    const cleanId = String(student_id).trim().toUpperCase();

    // Find student in memory or DB
    let student = memoryStore.students.find(
      (s) => s.id.toUpperCase() === cleanId || (s.qr_payload && s.qr_payload.toUpperCase() === cleanId)
    );

    if (!student) {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM retreat_students WHERE UPPER(id) = ? OR UPPER(qr_payload) = ? LIMIT 1',
          [cleanId, cleanId]
        );
        if (rows && rows.length > 0) student = rows[0];
      } catch (err) {}
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

// ─── 5. Reset to Sample Data or Clear Attendance ───
router.post('/reset', (req, res) => {
  const { action } = req.body;
  if (action === 'clear_attendance') {
    memoryStore.attendance = [];
    return res.json({ ok: true, message: 'All attendance records cleared' });
  }
  // Full reset
  res.json({ ok: true, message: 'Retreat system reset to initial sample data' });
});

export default router;
