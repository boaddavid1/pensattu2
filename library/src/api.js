const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

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
  try {
    await fetch(`${API_BASE}/past-questions/${id}/download`, { method: 'POST' });
  } catch {}
}
