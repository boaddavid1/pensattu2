// api/health.js — Direct Vercel serverless function endpoint for database health & diagnostics
import pool from '../server/db.js';
import secPool from '../server/secDb.js';
import schoolPool from '../server/schoolDb.js';

export default async function handler(req, res) {
  const envCheck = {
    db_host: process.env.DB_HOST ? `${process.env.DB_HOST}:${process.env.DB_PORT || 3306}` : 'MISSING (defaulting to localhost)',
    db_user: process.env.DB_USER || 'MISSING',
    db_name: process.env.DB_NAME || 'MISSING',
    sec_db_host: (process.env.SEC_DB_HOST || process.env.DB_HOST) ? 'configured' : 'MISSING',
    school_db_host: (process.env.SCHOOL_DB_HOST || process.env.DB_HOST) ? 'configured' : 'MISSING',
  };

  const databases = {};

  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    databases.main = { ok: true, connected: rows[0]?.result === 2 };
  } catch (err) {
    databases.main = { ok: false, error: err.message, code: err.code };
  }

  try {
    const [rows] = await secPool.query('SELECT 1 + 1 AS result');
    databases.sec = { ok: true, connected: rows[0]?.result === 2 };
  } catch (err) {
    databases.sec = { ok: false, error: err.message, code: err.code };
  }

  try {
    const [rows] = await schoolPool.query('SELECT 1 + 1 AS result');
    databases.school = { ok: true, connected: rows[0]?.result === 2 };
  } catch (err) {
    databases.school = { ok: false, error: err.message, code: err.code };
  }

  const allConnected = Object.values(databases).every((d) => d.ok);
  res.status(200).json({
    ok: allConnected,
    db: allConnected,
    message: allConnected ? 'All databases connected' : 'Database connection error detected',
    environment: envCheck,
    databases,
  });
}
