// secApi.js — API client for the SEC member management module
const API_BASE = import.meta.env.VITE_SEC_API_URL || import.meta.env.VITE_API_URL || '/api/sec';

function getToken() {
  return sessionStorage.getItem('sec_admin_token');
}

const cache = new Map();
const CACHE_TTL_MS = 30000; // 30 seconds

export function clearSecCache() {
  cache.clear();
}

async function request(path, options = {}) {
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

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) {
    sessionStorage.removeItem('sec_admin_token');
    sessionStorage.removeItem('sec_admin_user');
    if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
      window.location.href = '/login';
    }
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
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
