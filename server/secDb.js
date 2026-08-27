// secDb.js — Separate MySQL connection pool for the sec (member management) module.
// Connects to the u197926764_pensattu database (the original PHP sec project's DB),
// independent of the main site's u197926764_cop database.
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const secPool = mysql.createPool({
  host: process.env.SEC_DB_HOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.SEC_DB_PORT || process.env.DB_PORT) || 3306,
  user: process.env.SEC_DB_USER || process.env.DB_USER || 'root',
  password: process.env.SEC_DB_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.SEC_DB_NAME || 'u197926764_pensattu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
});

export default secPool;
