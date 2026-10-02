// secSyncSchema.js — Auto-creates all tables for the sec (member management) module
// in the u197926764_pensattu database. Called on server startup.
import secPool from './secDb.js';

export default async function secSyncSchema() {
  const conn = secPool.getConnection ? await secPool.getConnection() : secPool;

  const statements = [
    // Admin users
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin','user') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // Member registrations (matches the original PHP schema)
    `CREATE TABLE IF NOT EXISTS registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      surname VARCHAR(100) NOT NULL,
      othernames VARCHAR(150) NOT NULL,
      gender ENUM('male','female') NOT NULL,
      dob DATE NULL,
      contact VARCHAR(20) NULL,
      residence VARCHAR(200) NULL,
      room VARCHAR(50) NULL,
      program VARCHAR(200) NULL,
      program_duration VARCHAR(20) NULL,
      education_level VARCHAR(20) NULL,
      membership_type ENUM('member','associate') DEFAULT 'member',
      campus_residence ENUM('on-campus','off-campus') NULL,
      campus_hall VARCHAR(100) NULL,
      offcampus_location VARCHAR(200) NULL,
      landmark VARCHAR(200) NULL,
      is_officer TINYINT(1) DEFAULT 0,
      officer_role VARCHAR(100) NULL,
      district VARCHAR(200) NULL,
      pastor VARCHAR(100) NULL,
      guardian VARCHAR(100) NULL,
      guardian_contact VARCHAR(20) NULL,
      departments TEXT NULL,
      profile_image VARCHAR(255) NULL,
      graduated TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_surname (surname),
      INDEX idx_membership (membership_type),
      INDEX idx_gender (gender),
      INDEX idx_hall (campus_hall),
      INDEX idx_officer (is_officer),
      INDEX idx_education (education_level)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // Alumni (graduated members) — owned by alumniSyncSchema.js to avoid
    // conflicting column definitions. Do NOT create it here.

    // Activity logs (audit trail)
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      username VARCHAR(50) NOT NULL,
      action VARCHAR(255) NOT NULL,
      details TEXT NULL,
      ip_address VARCHAR(45) NULL,
      user_agent TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      INDEX idx_username (username),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // SMS logs
    `CREATE TABLE IF NOT EXISTS sms_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id INT NULL,
      recipient VARCHAR(20) NOT NULL,
      message TEXT NOT NULL,
      status ENUM('sent','failed','pending') DEFAULT 'pending',
      type ENUM('individual','bulk') DEFAULT 'individual',
      recipient_group VARCHAR(50) NULL,
      sent_by VARCHAR(50) NULL,
      response TEXT NULL,
      error_message TEXT NULL,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_session (session_id),
      INDEX idx_recipient (recipient),
      INDEX idx_status (status),
      INDEX idx_sent_at (sent_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // Attendance sessions
    `CREATE TABLE IF NOT EXISTS attendance_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_name VARCHAR(200) NOT NULL,
      session_date DATE NOT NULL,
      session_type ENUM('sunday','tuesday','friday','special','other') DEFAULT 'sunday',
      status ENUM('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
      description TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_date (session_date),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // Attendance records (members who attended)
    `CREATE TABLE IF NOT EXISTS attendance_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id INT NOT NULL,
      registration_id INT NOT NULL,
      check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_session (session_id),
      INDEX idx_registration (registration_id),
      UNIQUE KEY uniq_attendance (session_id, registration_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // Attendance visitors (non-members who attended)
    `CREATE TABLE IF NOT EXISTS attendance_visitors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id INT NOT NULL,
      name VARCHAR(150) NOT NULL,
      contact VARCHAR(20) NULL,
      invited_by VARCHAR(100) NULL,
      check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_session (session_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    // Newbie registrations (simplified fast form before full membership)
    `CREATE TABLE IF NOT EXISTS newbie_registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      contact VARCHAR(20) NOT NULL,
      residence VARCHAR(255) NOT NULL,
      program VARCHAR(255) NOT NULL,
      membership VARCHAR(50) NOT NULL,
      status ENUM('pending','pushed','completed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      pushed_at TIMESTAMP NULL DEFAULT NULL,
      pushed_by VARCHAR(100) NULL DEFAULT NULL,
      INDEX idx_newbie_contact (contact),
      INDEX idx_newbie_status (status),
      INDEX idx_newbie_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];

  for (const sql of statements) {
    try {
      await conn.query(sql);
    } catch (err) {
      console.error('secSyncSchema error:', err.message);
    }
  }

  // Ensure 'graduated' column exists on registrations table
  try {
    const [cols] = await conn.query("SHOW COLUMNS FROM registrations LIKE 'graduated'");
    if (!cols || cols.length === 0) {
      await conn.query("ALTER TABLE registrations ADD COLUMN graduated TINYINT(1) NOT NULL DEFAULT 0");
      console.log("secSyncSchema: added 'graduated' column to registrations");
    } else {
      // Standardize NULL values to 0 for index efficiency
      await conn.query("UPDATE registrations SET graduated = 0 WHERE graduated IS NULL");
    }
  } catch (err) {
    console.warn("secSyncSchema: could not check/add 'graduated' column:", err.message);
  }

  // Ensure 'profile_image' column exists on registrations table
  try {
    const [cols] = await conn.query("SHOW COLUMNS FROM registrations LIKE 'profile_image'");
    if (!cols || cols.length === 0) {
      await conn.query("ALTER TABLE registrations ADD COLUMN profile_image VARCHAR(255) NULL");
      console.log("secSyncSchema: added 'profile_image' column to registrations");
    }
  } catch (err) {
    console.warn("secSyncSchema: could not check/add 'profile_image' column:", err.message);
  }

  // ─── Index & Performance Optimization for fast member fetching ───────────
  const ensureIndex = async (table, indexName, cols) => {
    try {
      const [rows] = await conn.query(`SHOW INDEX FROM ${table} WHERE Key_name = ?`, [indexName]);
      if (!rows || rows.length === 0) {
        await conn.query(`CREATE INDEX ${indexName} ON ${table} (${cols})`);
        console.log(`secSyncSchema: created index ${indexName} on ${table}`);
      }
    } catch (e) {
      console.warn(`secSyncSchema: index ${indexName} note:`, e.message);
    }
  };

  await ensureIndex('registrations', 'idx_reg_grad_level_created', 'graduated, education_level, created_at');
  await ensureIndex('registrations', 'idx_reg_grad_created', 'graduated, created_at');
  await ensureIndex('registrations', 'idx_reg_grad_level', 'graduated, education_level');
  await ensureIndex('registrations', 'idx_reg_contact', 'contact');
  await ensureIndex('registrations', 'idx_reg_hall', 'campus_hall');
  await ensureIndex('registrations', 'idx_reg_program', 'program(100)');
  await ensureIndex('registrations', 'idx_reg_officer', 'is_officer');
  await ensureIndex('registrations', 'idx_reg_gender', 'gender');
  await ensureIndex('registrations', 'idx_reg_membership', 'membership_type');
  await ensureIndex('registrations', 'idx_reg_duration', 'program_duration');

  // ─── One-time migration: Move previous Level 400 class to Alumni portal ─────
  try {
    // Only target Level 400 members registered BEFORE October 2026 who are not yet marked graduated
    const [previous400] = await conn.query(`
      SELECT * FROM registrations 
      WHERE education_level = '400' 
        AND (graduated = 0 OR graduated IS NULL)
        AND created_at < '2026-10-01 00:00:00'
      ORDER BY id ASC
    `);

    if (previous400.length > 0) {
      console.log(`secSyncSchema: Moving ${previous400.length} previous Level 400 members to Alumni portal...`);
      const gradYear = 2026;
      for (const m of previous400) {
        let dobVal = '2000-01-01';
        if (m.dob && m.dob !== '0000-00-00') {
          const d = new Date(m.dob);
          if (!isNaN(d.getTime())) {
            dobVal = d.toISOString().slice(0, 10);
          }
        }

        // 1. Mark as graduated in registrations table
        await conn.query('UPDATE registrations SET graduated = 1 WHERE id = ?', [m.id]);

        // 2. Insert into alumni table if not already present
        const [existing] = await conn.query(
          'SELECT id FROM alumni WHERE registration_id = ? OR (contact = ? AND contact != "" AND surname = ?)',
          [m.id, m.contact || '', m.surname]
        );

        if (existing.length === 0) {
          await conn.query(
            `INSERT INTO alumni (
              registration_id, surname, othernames, gender, dob, contact, program,
              education_level, graduation_year, graduation_level, alumni_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [
              m.id,
              m.surname,
              m.othernames || '',
              m.gender === 'female' ? 'female' : 'male',
              dobVal,
              m.contact || '',
              m.program || '',
              '400',
              gradYear,
              '400',
            ]
          );
        } else {
          await conn.query(
            'UPDATE alumni SET alumni_status = "active", graduation_year = ?, graduation_level = "400" WHERE id = ?',
            [gradYear, existing[0].id]
          );
        }
      }
      console.log(`secSyncSchema: Successfully graduated ${previous400.length} previous Level 400 members to Alumni portal! Recent ones were preserved.`);
    } else {
      console.log('secSyncSchema: Previous Level 400 cohort is already graduated.');
    }
  } catch (err) {
    console.warn('secSyncSchema previous Level 400 graduation note:', err.message);
  }

  if (conn.release) conn.release();
  console.log('sec schema sync complete');
}
