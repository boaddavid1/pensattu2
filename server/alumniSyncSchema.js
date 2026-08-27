// alumniSyncSchema.js — Ensure alumni-related tables exist in the pensattu database
import secPool from './secDb.js';

export default async function alumniSyncSchema() {
  try {
    // alumni table — only create if it doesn't exist (the actual DB has a stricter schema)
    const [[alumniExists]] = await secPool.query("SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'alumni'");
    if (alumniExists.cnt === 0) {
      await secPool.query(`
        CREATE TABLE \`alumni\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`registration_id\` int(11) NOT NULL DEFAULT 0,
          \`surname\` varchar(100) NOT NULL,
          \`othernames\` varchar(200) NOT NULL DEFAULT '',
          \`gender\` enum('male','female') NOT NULL DEFAULT 'male',
          \`dob\` date NOT NULL DEFAULT '2000-01-01',
          \`contact\` varchar(10) NOT NULL DEFAULT '',
          \`program\` varchar(255) NOT NULL DEFAULT '',
          \`education_level\` varchar(10) NOT NULL DEFAULT '',
          \`graduation_year\` year(4) NOT NULL,
          \`graduation_level\` varchar(10) NOT NULL DEFAULT '',
          \`alumni_status\` enum('active','inactive') DEFAULT 'active',
          \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          KEY \`idx_graduation_year\` (\`graduation_year\`),
          KEY \`idx_surname\` (\`surname\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    }

    // alumni_settings table
    await secPool.query(`
      CREATE TABLE IF NOT EXISTS \`alumni_settings\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`setting_key\` varchar(100) NOT NULL UNIQUE,
        \`setting_value\` text,
        \`setting_type\` varchar(50) DEFAULT 'text',
        \`description\` text,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`setting_key\` (\`setting_key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // sms_logs table
    await secPool.query(`
      CREATE TABLE IF NOT EXISTS \`sms_logs\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`recipient\` varchar(20) NOT NULL,
        \`message\` text NOT NULL,
        \`status\` varchar(50) DEFAULT 'pending',
        \`type\` varchar(20) DEFAULT 'bulk',
        \`sent_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_recipient\` (\`recipient\`),
        KEY \`idx_sent_at\` (\`sent_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // scheduled_messages table
    await secPool.query(`
      CREATE TABLE IF NOT EXISTS \`scheduled_messages\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`message\` text NOT NULL,
        \`recipients_json\` text NOT NULL,
        \`recipient_count\` int(11) DEFAULT 0,
        \`scheduled_at\` datetime NOT NULL,
        \`status\` varchar(20) DEFAULT 'pending',
        \`sent_count\` int(11) DEFAULT 0,
        \`failed_count\` int(11) DEFAULT 0,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`sent_at\` datetime DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_status\` (\`status\`),
        KEY \`idx_scheduled\` (\`scheduled_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // contact_groups table
    await secPool.query(`
      CREATE TABLE IF NOT EXISTS \`contact_groups\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`group_name\` varchar(200) NOT NULL,
        \`file_name\` varchar(255) DEFAULT NULL,
        \`contact_count\` int(11) DEFAULT 0,
        \`contacts_json\` text,
        \`headers_json\` text,
        \`status\` varchar(20) DEFAULT 'active',
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // prayer_requests table (shared with the prayer module, but ensure it exists)
    await secPool.query(`
      CREATE TABLE IF NOT EXISTS \`prayer_requests\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`category\` varchar(50) NOT NULL,
        \`user_status\` enum('Alumni','Student') NOT NULL DEFAULT 'Alumni',
        \`prayer_text\` text NOT NULL,
        \`submitted_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`status\` enum('pending','prayed') DEFAULT 'pending',
        \`prayed_at\` datetime DEFAULT NULL,
        \`ip_address\` varchar(45) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`category\` (\`category\`),
        KEY \`status\` (\`status\`),
        KEY \`user_status\` (\`user_status\`),
        KEY \`submitted_at\` (\`submitted_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('alumni schema sync complete');
  } catch (err) {
    console.error('alumni schema sync error:', err.message);
  }
}
