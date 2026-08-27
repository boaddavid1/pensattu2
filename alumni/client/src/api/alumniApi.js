// alumniApi.js — API client for the Alumni module
const API_BASE = import.meta.env.VITE_ALUMNI_API_URL || import.meta.env.VITE_API_URL || '/api/alumni';

function getToken() {
  return localStorage.getItem('alumni_admin_token');
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
    localStorage.removeItem('alumni_admin_token');
    localStorage.removeItem('alumni_admin_user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const alumniApi = {
  // Auth
  login: (username, password) => request('/auth/login', {
    method: 'POST', body: JSON.stringify({ username, password }),
  }),
  me: () => request('/auth/me'),

  // Dashboard
  dashboard: () => request('/dashboard'),
  alumniByYear: (year) => request(`/alumni/by-year/${year}`),
  yearStats: () => request('/alumni/year-stats'),

  // Alumni CRUD
  listAlumni: (params = '') => request(`/alumni${params ? `?${params}` : ''}`),
  createAlumni: (data) => request('/alumni', { method: 'POST', body: JSON.stringify(data) }),
  updateAlumni: (id, data) => request(`/alumni/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAlumni: (id) => request(`/alumni/${id}`, { method: 'DELETE' }),
  bulkDeleteAlumni: (ids) => request('/alumni/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
  bulkImportAlumni: (data) => request('/alumni/bulk-import', { method: 'POST', body: JSON.stringify(data) }),
  importOldList: (data) => request('/alumni/import-old', { method: 'POST', body: JSON.stringify(data) }),
  exportAlumni: (year) => `${API_BASE}/alumni/export${year ? `?year=${year}` : ''}`,

  // Messages
  sendMessage: (data) => request('/messages/send', { method: 'POST', body: JSON.stringify(data) }),
  messageLogs: (params = '') => request(`/messages/logs${params ? `?${params}` : ''}`),
  generateAIMessage: (data) => request('/messages/ai-generate', { method: 'POST', body: JSON.stringify(data) }),

  // Broadcast
  uploadContacts: (formData) => fetch(`${API_BASE}/broadcast/upload`, {
    method: 'POST',
    headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    body: formData,
  }).then(r => r.json()),
  listContactGroups: () => request('/broadcast/groups'),
  deleteContactGroup: (id) => request(`/broadcast/groups/${id}`, { method: 'DELETE' }),
  renameContactGroup: (id, name) => request(`/broadcast/groups/${id}`, { method: 'PUT', body: JSON.stringify({ group_name: name }) }),
  sendBroadcast: (data) => request('/broadcast/send', { method: 'POST', body: JSON.stringify(data) }),
  scheduleBroadcast: (data) => request('/broadcast/schedule', { method: 'POST', body: JSON.stringify(data) }),
  listScheduled: () => request('/broadcast/scheduled'),
  cancelScheduled: (id) => request(`/broadcast/scheduled/${id}`, { method: 'DELETE' }),

  // Prayer requests
  listPrayers: (params = '') => request(`/prayers${params ? `?${params}` : ''}`),
  markPrayed: (id) => request(`/prayers/${id}/prayed`, { method: 'POST' }),
  deletePrayer: (id) => request(`/prayers/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => request('/settings'),
  updateSetting: (key, value) => request('/settings', { method: 'PUT', body: JSON.stringify({ key, value }) }),
  testSMS: () => request('/settings/test-sms', { method: 'POST' }),
  testAI: () => request('/settings/test-ai', { method: 'POST' }),
  checkSMSBalance: () => request('/settings/sms-balance'),
};
