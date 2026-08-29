const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken() {
  return sessionStorage.getItem('pensa_admin_token');
}

function removeToken() {
  sessionStorage.removeItem('pensa_admin_token');
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
    removeToken();
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

export function isLoggedIn() {
  return !!getToken();
}

export function setToken(token) {
  sessionStorage.setItem('pensa_admin_token', token);
}

export const adminApi = {
  login: (body) => request('/cp/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/cp/me'),
  stats: () => request('/cp/stats'),

  list: (entity) => request(`/cp/${entity}`),
  get: (entity, id) => request(`/cp/${entity}/${id}`),
  create: (entity, body) => request(`/cp/${entity}`, { method: 'POST', body: JSON.stringify(body) }),
  update: (entity, id, body) => request(`/cp/${entity}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (entity, id) => request(`/cp/${entity}/${id}`, { method: 'DELETE' }),

  listPhotos: (albumId) => request(`/cp/gallery_photos${albumId ? `?album_id=${albumId}` : ''}`),
  addPhoto: (body) => request('/cp/gallery_photos', { method: 'POST', body: JSON.stringify(body) }),
  removePhoto: (id) => request(`/cp/gallery_photos/${id}`, { method: 'DELETE' }),

  listUsers: () => request('/cp/users'),
  createUser: (body) => request('/cp/users', { method: 'POST', body: JSON.stringify(body) }),
  removeUser: (id) => request(`/cp/users/${id}`, { method: 'DELETE' }),

  // Member registrations (reg module)
  regList: (query) => request(`/reg${query ? `?${query}` : ''}`),
  regStats: () => request('/reg/stats'),
  regGet: (id) => request(`/reg/${id}`),
  regRemove: (id) => request(`/reg/${id}`, { method: 'DELETE' }),
};
