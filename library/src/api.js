const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('pensa_library_token');
}

function setToken(token) {
  localStorage.setItem('pensa_library_token', token);
}

function removeToken() {
  localStorage.removeItem('pensa_library_token');
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const auth = {
  getToken,
  setToken,
  removeToken,
  isLoggedIn: () => !!getToken(),

  register: (body) => request('/library/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/library/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/library/me'),
};

export async function fetchPastQuestions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.year) params.append('year', filters.year);
  if (filters.semester) params.append('semester', filters.semester);
  if (filters.level) params.append('level', filters.level);
  if (filters.programme) params.append('programme', filters.programme);
  if (filters.exam_type) params.append('exam_type', filters.exam_type);
  const qs = params.toString();
  return request(`/past-questions${qs ? `?${qs}` : ''}`);
}

export async function fetchMeta() {
  return request('/past-questions-meta');
}

export async function trackDownload(id) {
  return request(`/past-questions/${id}/download`, { method: 'POST' });
}

// Books
export async function fetchBooks(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  const qs = params.toString();
  return request(`/books${qs ? `?${qs}` : ''}`);
}

export async function fetchBook(id) {
  return request(`/books/${id}`);
}

export async function fetchBookCategories() {
  return request('/books-categories');
}

export async function trackBookDownload(id) {
  return request(`/books/${id}/download`, { method: 'POST' });
}
