// prayerApi.js — self-contained API client for the Operation Paga prayer admin.
// Uses the same superadmin JWT token as the rest of the admin portal.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken() {
  return sessionStorage.getItem('pensa_admin_token');
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
    sessionStorage.removeItem('pensa_admin_token');
    if (typeof window !== 'undefined' && !path.startsWith('/cp/login')) {
      window.location.href = '/control-panel/login';
    }
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const prayerApi = {
  list: (params = '') => request(`/prayers${params ? `?${params}` : ''}`),
  stats: (params = '') => request(`/prayers/stats${params ? `?${params}` : ''}`),
  markPrayed: (id, params = '') => request(`/prayers/${id}/pray${params ? `?${params}` : ''}`, { method: 'POST' }),
  bulkPray: (body) => request('/prayers/bulk-pray', { method: 'POST', body: JSON.stringify(body) }),
  remove: (id, params = '') => request(`/prayers/${id}${params ? `?${params}` : ''}`, { method: 'DELETE' }),
  bulkDelete: (body) => request('/prayers/bulk-delete', { method: 'POST', body: JSON.stringify(body) }),
};
