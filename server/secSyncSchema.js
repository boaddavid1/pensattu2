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
      await conn.query("ALTER TABLE registrations ADD COLUMN graduated TINYINT(1) DEFAULT 0");
      console.log("secSyncSchema: added 'graduated' column to registrations");
    }
  } catch (err) {
    console.warn("secSyncSchema: could not check/add 'graduated' column:", err.message);
  }

  // ─── Auto-recovery of accidental bulk graduation ─────────────────────────
  try {
    const [[alumniCount]] = await conn.query("SELECT COUNT(*) as cnt FROM alumni WHERE registration_id > 0");
    const [[gradCount]] = await conn.query("SELECT COUNT(*) as cnt FROM registrations WHERE graduated = 1");

    if (alumniCount.cnt > 0 || gradCount.cnt > 0) {
      console.log(`secSyncSchema: Reversing moves — found ${gradCount.cnt} graduated registrations, ${alumniCount.cnt} alumni records...`);

      // 1. Restore education_level from alumni table where graduation_level was saved
      try {
        await conn.query(`
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

      // 2. Unmark all graduated members in registrations
      await conn.query("UPDATE registrations SET graduated = 0 WHERE graduated = 1");

      // 3. Remove the moved records from alumni table (only those created from registrations)
      await conn.query("DELETE FROM alumni WHERE registration_id > 0");

      console.log("secSyncSchema: Successfully reversed all moves! All members are active.");
    }
  } catch (err) {
    console.warn("secSyncSchema auto-recovery error:", err.message);
  }

  if (conn.release) conn.release();
  console.log('sec schema sync complete');
}
