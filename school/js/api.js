// school/js/api.js — Unified API Resolver, Network Client, & QR Badge Extractor

export const RENDER_API_BASE = 'https://pensa-ttu-api.onrender.com/api/school';

/**
 * Resolves the active base URL for retreat endpoints
 */
export function resolveApiBase() {
  if (typeof window !== 'undefined') {
    if (window.RETREAT_API_BASE) return window.RETREAT_API_BASE;
    // Direct backend host check
    if (window.location.port === '3001' || window.location.origin.includes('pensa-ttu-api.onrender.com')) {
      return '/api/school';
    }
  }
  // Default to live Render cloud backend with Hostinger MySQL
  return RENDER_API_BASE;
}

/**
 * Robust fetch wrapper that queries the live Render backend, with fallback to localhost/same-origin
 */
export async function schoolApiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const candidates = [];
  if (typeof window !== 'undefined') {
    if (window.RETREAT_API_BASE) {
      candidates.push(`${window.RETREAT_API_BASE}${cleanEndpoint}`);
    }
    if (window.location.port === '3001') {
      candidates.push(`/api/school${cleanEndpoint}`);
    }
  }

  // Primary: Live cloud backend (Hostinger MySQL)
  candidates.push(`${RENDER_API_BASE}${cleanEndpoint}`);

  // Fallbacks:
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    candidates.push(`http://localhost:3001/api/school${cleanEndpoint}`);
  }
  candidates.push(`/api/school${cleanEndpoint}`);

  const uniqueCandidates = [...new Set(candidates)];
  let lastError = null;

  for (const url of uniqueCandidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7500);
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Return immediately if successful or explicit client status (400, 404, etc.)
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed to reach school API: ${cleanEndpoint}`);
}

/**
 * Extracts student badge ID from any QR scan payload (JSON, URL, raw string, quotes, etc.)
 */
export function extractBadgeCode(rawInput) {
  if (!rawInput) return '';
  let str = String(rawInput).trim();

  // Strip surrounding quotes
  str = str.replace(/^["']+|["']+$/g, '').trim();

  // 1. JSON payload
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const p = JSON.parse(str);
      str = String(p.id || p.student_id || p.qr_payload || p.code || p.name || str).trim();
    } catch (e) {}
  }

  // 2. URL payload
  if (str.includes('://')) {
    try {
      const u = new URL(str);
      const queryId =
        u.searchParams.get('id') ||
        u.searchParams.get('student_id') ||
        u.searchParams.get('badge') ||
        u.searchParams.get('code');
      if (queryId) {
        str = queryId.trim();
      } else {
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts.length > 0) str = parts[parts.length - 1].trim();
      }
    } catch (e) {}
  }

  // 3. Match standard RET26-XXXX-001 or RET-XXXX-001 patterns
  const retMatch = str.match(/(RET\d*-[A-Za-z0-9_-]+-\d+)/i);
  if (retMatch) {
    return retMatch[1].toUpperCase();
  }

  return str.toUpperCase();
}

/**
 * Matches a scanned input against a list of student records using multiple search strategies
 */
export function matchStudent(students, rawInput) {
  if (!Array.isArray(students) || students.length === 0) return null;
  const candidateCode = extractBadgeCode(rawInput);
  const rawUpper = String(rawInput || '').trim().toUpperCase();
  const strippedCandidate = candidateCode.replace(/[^A-Z0-9]/g, '');

  return (
    students.find((st) => {
      if (!st) return false;
      const sId = (st.id || '').trim().toUpperCase();
      const sPayload = (st.qr_payload || '').trim().toUpperCase();
      const sName = (st.full_name || st.name || '').trim().toUpperCase();
      const sStripped = sId.replace(/[^A-Z0-9]/g, '');

      // Direct ID or QR payload equality
      if (sId === candidateCode || sPayload === candidateCode) return true;
      if (sId === rawUpper || sPayload === rawUpper) return true;

      // Alphanumeric stripped match (handles dash/format variations)
      if (strippedCandidate && sStripped && sStripped === strippedCandidate) return true;

      // Exact full name match
      if (sName && (sName === candidateCode || sName === rawUpper)) return true;

      // Substring containment
      if (sId && rawUpper.includes(sId)) return true;
      if (candidateCode && sId.includes(candidateCode)) return true;
      if (candidateCode.length >= 3 && sName.includes(candidateCode)) return true;

      return false;
    }) || null
  );
}

