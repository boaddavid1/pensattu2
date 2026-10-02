const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_ROOT = API_BASE.replace(/\/api\/?$/, '');

export function getImageUrl(url, options = {}) {
  if (!url) return '';
  let fullUrl = url;
  if (/^https?:\/\//i.test(url)) {
    fullUrl = url;
  } else if (url.startsWith('/images/')) {
    fullUrl = url;
  } else if (url.startsWith('/')) {
    fullUrl = `${API_ROOT}${url}`;
  } else {
    fullUrl = `${API_ROOT}/${url}`;
  }

  // Cloudinary on-the-fly optimization (reduces payload by 80-90%)
  if (fullUrl.includes('res.cloudinary.com') && fullUrl.includes('/image/upload/')) {
    const { width, quality = 'auto', format = 'auto' } = options;
    const transforms = [`f_${format}`, `q_${quality}`];
    if (width) transforms.push(`w_${width},c_limit`);
    const transformStr = transforms.join(',');

    const uploadIndex = fullUrl.indexOf('/image/upload/');
    if (uploadIndex !== -1) {
      const rest = fullUrl.slice(uploadIndex + 14);
      // Only insert if no existing transformation flags at start
      if (!/^(f_|w_|q_|c_)/.test(rest)) {
        return `${fullUrl.slice(0, uploadIndex + 14)}${transformStr}/${rest}`;
      }
    }
  }

  return fullUrl;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
};
