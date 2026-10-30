// api/index.js — Vercel Serverless Function entry point for PENSA TTU API
import app from '../server/app.js';

export default function handler(req, res) {
  // Capture rewritten URL from Vercel query or headers
  const queryUrl = req.query?.url || req.query?.__route;
  if (queryUrl) {
    const formatted = queryUrl.startsWith('/api')
      ? queryUrl
      : `/api${queryUrl.startsWith('/') ? queryUrl : `/${queryUrl}`}`;
    req.url = formatted;
  }
  return app(req, res);
}
