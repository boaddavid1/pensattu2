import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '../server/.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n======================================================');
console.log('       PENSA TTU — Database Diagnostic & Inspector');
console.log('======================================================\n');

const mainConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'grace_harbor',
  connectTimeout: 20000,
};

const secConfig = {
  host: process.env.SEC_DB_HOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.SEC_DB_PORT || process.env.DB_PORT) || 3306,
  user: process.env.SEC_DB_USER || process.env.DB_USER || 'root',
  password: process.env.SEC_DB_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.SEC_DB_NAME || 'u197926764_pensattu',
  connectTimeout: 20000,
};

const schoolConfig = {
  host: process.env.SCHOOL_DB_HOST || process.env.SCH_DB_HOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.SCHOOL_DB_PORT || process.env.SCH_DB_PORT || process.env.DB_PORT) || 3306,
  user: process.env.SCHOOL_DB_USER || process.env.SCH_DB_USER || process.env.DB_USER || 'root',
  password: process.env.SCHOOL_DB_PASSWORD || process.env.SCH_DB_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.SCHOOL_DB_NAME || process.env.SCH_DB_NAME || process.env.DB_NAME || 'u197926764_sch',
  connectTimeout: 20000,
};

async function testConnection(label, config) {
  console.log(`Checking [${label}] connection:`);
  console.log(`  -> Host: ${config.host}:${config.port}`);
  console.log(`  -> User: ${config.user}`);
  console.log(`  -> Database: ${config.database}`);

  try {
    const conn = await mysql.createConnection(config);
    console.log(`  \x1b[32m✔ Connected successfully!\x1b[0m\n`);
    return conn;
  } catch (err) {
    console.log(`  \x1b[31m✖ Connection failed: ${err.message} (${err.code})\x1b[0m\n`);
    return null;
  }
}

async function fetchSummary() {
  const mainConn = await testConnection('Main Website DB', mainConfig);
  if (mainConn) {
    try {
      console.log('--- Fetching Data from Main Database (' + mainConfig.database + ') ---');
      const [tables] = await mainConn.query('SHOW TABLES');
      const tableNames = tables.map(t => Object.values(t)[0]);
      console.log(`Found ${tableNames.length} tables:`, tableNames.join(', '));
      console.log();

      const queries = [
        { table: 'core_values', name: 'Ministries (core_values)', titleCol: 'title' },
        { table: 'events', name: 'Events', titleCol: 'title' },
        { table: 'sermons', name: 'Sermons', titleCol: 'title' },
        { table: 'leadership', name: 'Leadership Team', titleCol: 'name' },
        { table: 'news', name: 'News & Announcements', titleCol: 'title' },
        { table: 'albums', name: 'Gallery Albums', titleCol: 'name' },
        { table: 'admin_users', name: 'Admin Users', titleCol: 'username' },
      ];

      for (const item of queries) {
        if (tableNames.includes(item.table)) {
          const [countResult] = await mainConn.query(`SELECT COUNT(*) AS total FROM \`${item.table}\``);
          const total = countResult[0]?.total || 0;
          console.log(`• \x1b[36m${item.name}\x1b[0m: ${total} records`);

          if (total > 0) {
            const [samples] = await mainConn.query(`SELECT * FROM \`${item.table}\` LIMIT 3`);
            samples.forEach((row, i) => {
              const label = row[item.titleCol] || row.id;
              console.log(`    [${i + 1}] "${label}"`);
            });
          } else {
            console.log(`    (Table is currently empty)`);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching main data:', err.message);
    } finally {
      await mainConn.end();
    }
  }

  const secConn = await testConnection('SEC Member Management DB', secConfig);
  if (secConn) {
    try {
      console.log('--- Fetching Data from SEC Database (' + secConfig.database + ') ---');
      const [tables] = await secConn.query('SHOW TABLES');
      const tableNames = tables.map(t => Object.values(t)[0]);
      if (tableNames.includes('registrations')) {
        const [regCount] = await secConn.query('SELECT COUNT(*) AS total FROM registrations');
        console.log(`• Registrations: ${regCount[0]?.total || 0} members registered`);
      }
      if (tableNames.includes('users')) {
        const [userCount] = await secConn.query('SELECT COUNT(*) AS total FROM users');
        console.log(`• SEC Admin Users: ${userCount[0]?.total || 0} users`);
      }
    } catch (err) {
      console.error('Error fetching SEC data:', err.message);
    } finally {
      await secConn.end();
    }
  }

  const schoolConn = await testConnection('School Retreat DB', schoolConfig);
  if (schoolConn) {
    try {
      console.log('\n--- Fetching Data from School Retreat Database (' + schoolConfig.database + ') ---');
      const [tables] = await schoolConn.query('SHOW TABLES');
      const tableNames = tables.map(t => Object.values(t)[0]);
      if (tableNames.includes('retreat_registrations') || tableNames.includes('students')) {
        const t = tableNames.includes('retreat_registrations') ? 'retreat_registrations' : 'students';
        const [schCount] = await schoolConn.query(`SELECT COUNT(*) AS total FROM \`${t}\``);
        console.log(`• Retreat Registrations: ${schCount[0]?.total || 0} participants`);
      }
    } catch (err) {
      console.error('Error fetching School data:', err.message);
    } finally {
      await schoolConn.end();
    }
  }

  console.log('\n======================================================');
  if (!mainConn) {
    console.log('\x1b[33mNOTE: If you want to use Docker for local database:\x1b[0m');
    console.log('1. Make sure Docker Desktop is installed and running.');
    console.log('2. Run: npm run docker:up');
    console.log('3. Copy .env.docker.example to .env (or update DB_HOST=127.0.0.1, DB_PASSWORD=rootpass).');
    console.log('4. Run this script again: npm run db:test\n');
  } else {
    console.log('\x1b[32m✔ Database is online and actively providing live data!\x1b[0m\n');
  }
}

fetchSummary().catch(console.error);
