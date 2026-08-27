import pool from './db.js';

const TABLES = [
  `CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(150),
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id INT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    endpoint VARCHAR(500) NOT NULL UNIQUE,
    p256dh VARCHAR(255) NOT NULL,
    auth VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS core_values (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(200),
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
  )`,

  `CREATE TABLE IF NOT EXISTS sermons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    speaker VARCHAR(200),
    category VARCHAR(100),
    description TEXT,
    audio_url VARCHAR(500),
    image_url VARCHAR(500),
    date_preached DATE,
    is_active BOOLEAN DEFAULT TRUE
  )`,

  `CREATE TABLE IF NOT EXISTS leadership (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(200),
    category VARCHAR(100),
    academic_year VARCHAR(20),
    programme VARCHAR(200),
    hall VARCHAR(200),
    previous_portfolio TEXT,
    description TEXT,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
  )`,

  `CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    event_end_date DATE,
    event_time VARCHAR(50),
    location VARCHAR(200),
    description TEXT,
    category VARCHAR(100),
    image_url VARCHAR(500),
    featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'upcoming'
  )`,

  `CREATE TABLE IF NOT EXISTS news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url VARCHAR(500),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS albums (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    cover_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS gallery (
    id INT PRIMARY KEY AUTO_INCREMENT,
    album_id INT NOT NULL,
    title VARCHAR(200),
    category VARCHAR(80),
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS visits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    service VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS subscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS past_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(50) NOT NULL,
    course_title VARCHAR(200) NOT NULL,
    year INT NOT NULL,
    semester VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL,
    programme VARCHAR(200),
    exam_type VARCHAR(100) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    downloads INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS library_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS download_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    resource_type VARCHAR(20) NOT NULL,
    resource_id INT NOT NULL,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_resource (resource_type, resource_id)
  )`,

  `CREATE TABLE IF NOT EXISTS library_books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(300) NOT NULL,
    author VARCHAR(200),
    category VARCHAR(100),
    description TEXT,
    cover_image VARCHAR(500),
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    pages INT,
    is_readable BOOLEAN DEFAULT FALSE,
    content TEXT,
    downloads INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Operation Paga prayer requests (migrated from the PHP prayer project)
  `CREATE TABLE IF NOT EXISTS prayer_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(50) NOT NULL,
    user_status ENUM('Alumni','Student') NOT NULL DEFAULT 'Alumni',
    prayer_text TEXT NOT NULL,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending','prayed') DEFAULT 'pending',
    prayed_at DATETIME DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_user_status (user_status),
    INDEX idx_submitted_at (submitted_at)
  )`,
];

// Columns that must exist for the public library view to work correctly.
// Each entry: { table, column, definition }
const REQUIRED_COLUMNS = [
  // past_questions
  { table: 'past_questions', column: 'course_code', definition: "VARCHAR(50) NOT NULL" },
  { table: 'past_questions', column: 'course_title', definition: "VARCHAR(200) NOT NULL" },
  { table: 'past_questions', column: 'year', definition: "INT NOT NULL" },
  { table: 'past_questions', column: 'semester', definition: "VARCHAR(50) NOT NULL" },
  { table: 'past_questions', column: 'level', definition: "VARCHAR(50) NOT NULL" },
  { table: 'past_questions', column: 'programme', definition: "VARCHAR(200)" },
  { table: 'past_questions', column: 'exam_type', definition: "VARCHAR(100) NOT NULL" },
  { table: 'past_questions', column: 'file_url', definition: "VARCHAR(500) NOT NULL" },
  { table: 'past_questions', column: 'file_type', definition: "VARCHAR(50)" },
  { table: 'past_questions', column: 'file_size', definition: "INT" },
  { table: 'past_questions', column: 'downloads', definition: "INT DEFAULT 0" },
  { table: 'past_questions', column: 'is_active', definition: "BOOLEAN DEFAULT TRUE" },
  { table: 'past_questions', column: 'created_at', definition: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
  // library_users
  { table: 'library_users', column: 'full_name', definition: "VARCHAR(150) NOT NULL" },
  { table: 'library_users', column: 'email', definition: "VARCHAR(150) NOT NULL UNIQUE" },
  { table: 'library_users', column: 'password', definition: "VARCHAR(255) NOT NULL" },
  { table: 'library_users', column: 'profile_picture', definition: "VARCHAR(500)" },
  { table: 'library_users', column: 'created_at', definition: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
  // library_books
  { table: 'library_books', column: 'title', definition: "VARCHAR(300) NOT NULL" },
  { table: 'library_books', column: 'author', definition: "VARCHAR(200)" },
  { table: 'library_books', column: 'category', definition: "VARCHAR(100)" },
  { table: 'library_books', column: 'description', definition: "TEXT" },
  { table: 'library_books', column: 'cover_image', definition: "VARCHAR(500)" },
  { table: 'library_books', column: 'file_url', definition: "VARCHAR(500) NOT NULL" },
  { table: 'library_books', column: 'file_type', definition: "VARCHAR(50)" },
  { table: 'library_books', column: 'file_size', definition: "INT" },
  { table: 'library_books', column: 'pages', definition: "INT" },
  { table: 'library_books', column: 'is_readable', definition: "BOOLEAN DEFAULT FALSE" },
  { table: 'library_books', column: 'content', definition: "TEXT" },
  { table: 'library_books', column: 'downloads', definition: "INT DEFAULT 0" },
  { table: 'library_books', column: 'is_active', definition: "BOOLEAN DEFAULT TRUE" },
  { table: 'library_books', column: 'created_at', definition: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
  // prayer_requests (backward-compatible migration for tables created by the PHP app)
  { table: 'prayer_requests', column: 'category', definition: "VARCHAR(50) NOT NULL" },
  { table: 'prayer_requests', column: 'user_status', definition: "ENUM('Alumni','Student') NOT NULL DEFAULT 'Alumni'" },
  { table: 'prayer_requests', column: 'prayer_text', definition: "TEXT NOT NULL" },
  { table: 'prayer_requests', column: 'submitted_at', definition: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP" },
  { table: 'prayer_requests', column: 'status', definition: "ENUM('pending','prayed') DEFAULT 'pending'" },
  { table: 'prayer_requests', column: 'prayed_at', definition: "DATETIME DEFAULT NULL" },
  { table: 'prayer_requests', column: 'ip_address', definition: "VARCHAR(45) DEFAULT NULL" },
];

async function syncColumns() {
  // Group required columns by table
  const byTable = {};
  for (const c of REQUIRED_COLUMNS) {
    if (!byTable[c.table]) byTable[c.table] = [];
    byTable[c.table].push(c);
  }

  for (const [table, cols] of Object.entries(byTable)) {
    let existing;
    try {
      [existing] = await pool.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [table]
      );
    } catch (err) {
      console.error(`Column sync: could not inspect ${table}:`, err.message);
      continue;
    }
    const existingSet = new Set(existing.map((r) => r.COLUMN_NAME));
    for (const col of cols) {
      if (!existingSet.has(col.column)) {
        try {
          await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col.column}\` ${col.definition}`);
          console.log(`Column sync: added ${table}.${col.column}`);
        } catch (err) {
          console.error(`Column sync: failed to add ${table}.${col.column}:`, err.message);
        }
      }
    }
  }
}

export default async function syncSchema() {
  for (const sql of TABLES) {
    try {
      await pool.query(sql);
    } catch (err) {
      console.error('Schema sync error:', err.message);
    }
  }
  await syncColumns();
  console.log('Schema sync complete');
}
