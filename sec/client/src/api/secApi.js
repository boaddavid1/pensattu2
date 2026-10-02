// secApi.js — API client for the SEC member management module
function getSecApiBase() {
  const envSec = import.meta.env.VITE_SEC_API_URL;
  if (envSec) return envSec.replace(/\/+$/, '');
  const envApi = import.meta.env.VITE_API_URL;
  if (envApi) {
    const clean = envApi.replace(/\/+$/, '');
    if (clean.endsWith('/sec')) return clean;
    if (clean.endsWith('/api')) return `${clean}/sec`;
    return `${clean}/api/sec`;
  }
  return '/api/sec';
}

export const SEC_API_BASE = getSecApiBase();
const API_BASE = SEC_API_BASE;

function getToken() {
  return sessionStorage.getItem('sec_admin_token');
}

const cache = new Map();
const CACHE_TTL_MS = 30000; // 30 seconds

export function clearSecCache() {
  cache.clear();
}

async function request(path, options = {}, retries = 1) {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';

  // Check cache for GET requests
  if (isGet && !options.noCache) {
    const cached = cache.get(path);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }
  }

  // Mutating requests invalidate cache immediately
  if (!isGet) {
    cache.clear();
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      ...options,
    });
  } catch (netErr) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return request(path, options, retries - 1);
    }
    throw new Error(netErr.message || 'Failed to fetch');
  }

  if (res.status === 401) {
    sessionStorage.removeItem('sec_admin_token');
    sessionStorage.removeItem('sec_admin_user');
    if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
      window.location.href = '/login';
    }
  }

  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    let errMsg = `Request failed: ${res.status}`;
    if (contentType.includes('application/json')) {
      const err = await res.json().catch(() => ({}));
      errMsg = err.error || errMsg;
    } else {
      const text = await res.text().catch(() => '');
      errMsg = text.slice(0, 120) || errMsg;
    }
    throw new Error(errMsg);
  }

  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(`Server returned non-JSON response (status ${res.status}). Verify API URL.`);
  }

  const data = await res.json();
  if (isGet) {
    cache.set(path, { data, timestamp: Date.now() });
  }
  return data;
}

export const secApi = {
  clearCache: clearSecCache,
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),

  // Dashboard
  dashboard: () => request('/dashboard'),

  // Members
  listMembers: (params = '') => request(`/members${params ? `?${params}` : ''}`),
  membersByLevel: (params = '') => request(`/members/by-level${params ? `?${params}` : ''}`),
  getMember: (id) => request(`/members/${id}`),
  createMember: (data) => request('/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMember: (id, data) => request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),
  importMembers: (data) => request('/members/import', { method: 'POST', body: JSON.stringify(data) }),
  graduateMember: (id) => request(`/members/${id}/graduate`, { method: 'POST' }),
  getPromotionPreview: () => request('/members/promotion-preview'),
  promoteMembers: () => request('/members/promote', { method: 'POST' }),
  promoteMember: (id) => request(`/members/${id}/promote`, { method: 'POST' }),
  topupBTech: (id, data) => request(`/members/${id}/topup-btech`, { method: 'POST', body: JSON.stringify(data || {}) }),
  getRollbackInfo: () => request('/members/rollback-info'),
  rollbackMoves: (data = {}) => request('/members/rollback', { method: 'POST', body: JSON.stringify(data) }),
  stepDownLevels: () => request('/members/step-down-levels', { method: 'POST' }),
  getLevel400Candidates: () => request('/members/level400-candidates'),
  graduateBatch: (memberIds) => request('/members/graduate-batch', { method: 'POST', body: JSON.stringify({ memberIds }) }),
  autoGraduatePrevious400: (daysThreshold = 30) => request('/members/graduate-previous-400-auto', { method: 'POST', body: JSON.stringify({ daysThreshold }) }),

  // Newbies (Fast registration queue)
  listNewbies: (params = '') => request(`/newbies${params ? `?${params}` : ''}`),
  pushNewbie: (id) => request(`/newbies/${id}/push`, { method: 'POST' }),
  deleteNewbie: (id) => request(`/newbies/${id}`, { method: 'DELETE' }),

  // Attendance
  listSessions: () => request('/attendance/sessions'),
  createSession: (data) => request('/attendance/sessions', { method: 'POST', body: JSON.stringify(data) }),
  getSession: (id) => request(`/attendance/sessions/${id}`),
  checkin: (sessionId, registrationId) => request(`/attendance/sessions/${sessionId}/checkin`, { method: 'POST', body: JSON.stringify({ registration_id: registrationId }) }),
  addVisitor: (sessionId, data) => request(`/attendance/sessions/${sessionId}/visitor`, { method: 'POST', body: JSON.stringify(data) }),
  aiQuery: (query) => request('/attendance/ai', { method: 'POST', body: JSON.stringify({ query }) }),

  // Messages (SMS)
  sendMessage: (data) => request('/messages/send', { method: 'POST', body: JSON.stringify(data) }),
  messageLogs: () => request('/messages/logs'),

  // Halls
  halls: () => request('/halls'),

  // Alumni
  listAlumni: (params = '') => request(`/alumni${params ? `?${params}` : ''}`),
  updateAlumni: (id, data) => request(`/alumni/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAlumni: (id) => request(`/alumni/${id}`, { method: 'DELETE' }),

  // Reports
  reports: (params = '') => request(`/reports${params ? `?${params}` : ''}`),

  // Export
  exportUrl: (params = '') => `${API_BASE}/export${params ? `?${params}` : ''}`,

  // Settings
  listUsers: () => request('/settings/users'),
  createUser: (data) => request('/settings/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/settings/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/settings/users/${id}`, { method: 'DELETE' }),
  logs: (params = '') => request(`/settings/logs${params ? `?${params}` : ''}`),
};
