// secApi.js — API client for the SEC member management module
const API_BASE = import.meta.env.VITE_SEC_API_URL || import.meta.env.VITE_API_URL || '/api/sec';

function getToken() {
  return localStorage.getItem('sec_admin_token');
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) {
    localStorage.removeItem('sec_admin_token');
    localStorage.removeItem('sec_admin_user');
    if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
      window.location.href = '/login';
    }
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const secApi = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),

  // Dashboard
  dashboard: () => request('/dashboard'),

  // Members
  listMembers: (params = '') => request(`/members${params ? `?${params}` : ''}`),
  getMember: (id) => request(`/members/${id}`),
  createMember: (data) => request('/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMember: (id, data) => request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),
  importMembers: (data) => request('/members/import', { method: 'POST', body: JSON.stringify(data) }),
  graduateMember: (id) => request(`/members/${id}/graduate`, { method: 'POST' }),

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
