// regSyncSchema.js — Ensure registration tables exist in the pensattu database.
// The reg module (converted from the PHP reg project) stores PENSA TTU member
// registrations in the same u197926764_pensattu database the sec/alumni modules
// use, so we reuse secPool.
import secPool from './secDb.js';

// Columns the reg routes rely on. If the registrations table already exists
// (e.g. created by the original PHP project with a slightly different shape),
// we ALTER TABLE to add any that are missing.
const REQUIRED_REG_COLUMNS = [
  { column: 'surname', definition: "VARCHAR(100) NOT NULL DEFAULT ''" },
  { column: 'othernames', definition: "VARCHAR(200) NOT NULL DEFAULT ''" },
  { column: 'gender', definition: "VARCHAR(10) NOT NULL DEFAULT ''" },
  { column: 'dob', definition: "DATE DEFAULT NULL" },
  { column: 'contact', definition: "VARCHAR(20) NOT NULL DEFAULT ''" },
  { column: 'residence', definition: "VARCHAR(255) NOT NULL DEFAULT ''" },
  { column: 'room', definition: "VARCHAR(100) NOT NULL DEFAULT ''" },
  { column: 'program', definition: "VARCHAR(255) NOT NULL DEFAULT ''" },
  { column: 'education_level', definition: "VARCHAR(10) NOT NULL DEFAULT ''" },
  { column: 'membership_type', definition: "VARCHAR(20) NOT NULL DEFAULT ''" },
  { column: 'district', definition: "VARCHAR(255) NOT NULL DEFAULT ''" },
  { column: 'pastor', definition: "VARCHAR(255) NOT NULL DEFAULT ''" },
  { column: 'guardian', definition: "VARCHAR(255) NOT NULL DEFAULT ''" },
  { column: 'guardian_contact', definition: "VARCHAR(20) NOT NULL DEFAULT ''" },
  { column: 'photo_data', definition: "LONGTEXT DEFAULT NULL" },
  { column: 'other_info', definition: "TEXT DEFAULT NULL" },
  { column: 'campus_residence', definition: "VARCHAR(5) NOT NULL DEFAULT ''" },
  { column: 'campus_hall', definition: "VARCHAR(100) DEFAULT NULL" },
  { column: 'offcampus_location', definition: "VARCHAR(255) DEFAULT NULL" },
  { column: 'room_campus', definition: "VARCHAR(100) DEFAULT NULL" },
  { column: 'room_offcampus', definition: "VARCHAR(100) DEFAULT NULL" },
  { column: 'program_duration', definition: "VARCHAR(20) DEFAULT NULL" },
  { column: 'is_officer', definition: "TINYINT(1) NOT NULL DEFAULT 0" },
  { column: 'officer_role', definition: "VARCHAR(50) DEFAULT NULL" },
  { column: 'landmark', definition: "VARCHAR(255) DEFAULT NULL" },
  { column: 'created_at', definition: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
];

async function syncRegColumns() {
  let existing;
  try {
    [existing] = await secPool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registrations'`
    );
  } catch (err) {
    console.error('reg column sync: could not inspect registrations:', err.message);
    return;
  }
  const existingSet = new Set(existing.map((r) => r.COLUMN_NAME));
  for (const col of REQUIRED_REG_COLUMNS) {
    if (!existingSet.has(col.column)) {
      try {
        await secPool.query(`ALTER TABLE \`registrations\` ADD COLUMN \`${col.column}\` ${col.definition}`);
        console.log(`reg column sync: added registrations.${col.column}`);
      } catch (err) {
        console.error(`reg column sync: failed to add registrations.${col.column}:`, err.message);
      }
    }
  }
}

export default async function regSyncSchema() {
  try {
    // registrations table — only create if it doesn't already exist (the live
    // DB from the PHP project may already have it with real data).
    const [[regExists]] = await secPool.query(
      "SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'registrations'"
    );
    if (regExists.cnt === 0) {
      await secPool.query(`
        CREATE TABLE \`registrations\` (
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
    }

    // departments table (one registration -> many departments)
    const [[deptExists]] = await secPool.query(
      "SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'departments'"
    );
    if (deptExists.cnt === 0) {
      await secPool.query(`
        CREATE TABLE \`departments\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`registration_id\` int(11) NOT NULL,
          \`department\` varchar(50) NOT NULL,
          PRIMARY KEY (\`id\`),
          KEY \`idx_registration\` (\`registration_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    }

    // Patch any missing columns on an existing registrations table.
    await syncRegColumns();

    console.log('reg schema sync complete');
  } catch (err) {
    console.error('reg schema sync error:', err.message);
  }
}
