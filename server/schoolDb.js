// schoolDb.js — Dedicated MySQL connection pool for the School Retreat & QR Scanner module.
// Uses SCHOOL_DB_* (and SCH_DB_*) to completely avoid conflicts with DB_* or SEC_DB_* variables.
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const schoolPool = mysql.createPool({
  host: process.env.SCHOOL_DB_HOST || process.env.SCH_DB_HOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.SCHOOL_DB_PORT || process.env.SCH_DB_PORT || process.env.DB_PORT) || 3306,
  user: process.env.SCHOOL_DB_USER || process.env.SCH_DB_USER || process.env.DB_USER || 'root',
  password: process.env.SCHOOL_DB_PASSWORD || process.env.SCH_DB_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.SCHOOL_DB_NAME || process.env.SCH_DB_NAME || process.env.DB_NAME || 'u197926764_sch',
  waitForConnections: true,
  connectionLimit: 15,
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  queueLimit: 0,
  connectTimeout: 30000,
});

schoolPool.on('error', (err) => {
  console.warn('[schoolDb] Pool error:', err?.message || err);
});

export default schoolPool;

