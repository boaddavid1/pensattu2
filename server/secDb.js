// secDb.js — Separate MySQL connection pool for the sec (member management) module.
// Connects to the u197926764_pensattu database (the original PHP sec project's DB),
// independent of the main site's u197926764_cop database.
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const secPool = mysql.createPool({
  host: process.env.SEC_DB_HOST || process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.SEC_DB_PORT || process.env.DB_PORT || process.env.MYSQL_PORT) || 3306,
  user: process.env.SEC_DB_USER || process.env.DB_USER || process.env.MYSQL_USER || process.env.MYSQL_USERNAME || 'root',
  password: process.env.SEC_DB_PASSWORD || process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.SEC_DB_NAME || process.env.DB_NAME || process.env.MYSQL_DATABASE || 'u197926764_pensattu',
  waitForConnections: true,
  connectionLimit: 15,
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  queueLimit: 0,
  connectTimeout: 30000,
});

secPool.on('error', (err) => {
  console.warn('[secDb pool error]:', err?.message || err);
});

export default secPool;
