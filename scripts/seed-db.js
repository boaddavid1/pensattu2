import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seed() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'grace_harbor',
    multipleStatements: true,
  };

  console.log(`Connecting to ${config.user}@${config.host}:${config.port}/${config.database}...`);
  try {
    const conn = await mysql.createConnection(config);
    const seedSqlPath = path.join(__dirname, '../database/seed.sql');
    const sql = fs.readFileSync(seedSqlPath, 'utf8');

    console.log('Applying database/seed.sql...');
    await conn.query(sql);
    console.log('\x1b[32m✔ Seed data applied successfully!\x1b[0m');
    await conn.end();
  } catch (err) {
    console.error('\x1b[31m✖ Seeding failed:\x1b[0m', err.message);
  }
}

seed();
