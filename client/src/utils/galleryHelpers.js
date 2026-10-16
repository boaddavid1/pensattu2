/**
 * Utility helpers for sharing and downloading gallery albums and individual photos
 */
import { getImageUrl } from '../api';

/**
 * Extract a stable photo identifier for deep-linking
 */
export function getPhotoId(item, index = 0) {
  if (!item) return String(index + 1);
  if (item.id !== undefined && item.id !== null) {
    return String(item.id);
  }
  if (item.src) {
    try {
      const parts = item.src.split('/');
      const last = parts[parts.length - 1];
      const name = last.split('?')[0].replace(/\.[^/.]+$/, '');
      if (name) return encodeURIComponent(name);
    } catch {
      // fallback to index
    }
  }
  return String(index + 1);
}

/**
 * Format a clean filename for download (e.g. PENSA-TTU-worship-photo.jpg)
 */
export function formatDownloadFilename(title = '', albumTitle = '', ext = 'jpg') {
  const parts = ['PENSA-TTU'];
  if (albumTitle) parts.push(albumTitle);
  if (title) parts.push(title);
  
  const raw = parts.join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${raw || 'pensa-gallery-photo'}.${ext}`;
}

/**
 * Get Cloudinary direct attachment download URL
 */
export function getCloudinaryAttachmentUrl(url, cleanFilename = '') {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
    return url;
  }

  const uploadIndex = url.indexOf('/image/upload/');
  if (uploadIndex === -1) return url;

  const prefix = url.slice(0, uploadIndex + 14);
  const rest = url.slice(uploadIndex + 14);

  // If already has fl_attachment, return as is
  if (rest.includes('fl_attachment')) return url;

  // Add attachment flag with optional filename
  const safeName = cleanFilename ? cleanFilename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') : '';
  const flag = safeName ? `fl_attachment:${safeName}` : 'fl_attachment';

  return `${prefix}${flag}/${rest}`;
}

/**
 * Robust image download that handles cross-origin images (Cloudinary, local, external)
 */
export async function downloadImage(url, filename = 'pensa-photo.jpg') {
  if (!url) throw new Error('No image URL provided');

  const resolvedUrl = getImageUrl(url);
  const cleanFilename = filename.endsWith('.jpg') || filename.endsWith('.png') || filename.endsWith('.webp')
    ? filename
    : `${filename}.jpg`;

  // 1. If it's a Cloudinary URL, the most reliable and direct way is using fl_attachment
  if (resolvedUrl.includes('res.cloudinary.com') && resolvedUrl.includes('/image/upload/')) {
    try {
      const attachmentUrl = getCloudinaryAttachmentUrl(resolvedUrl, cleanFilename);
      const link = document.createElement('a');
      link.href = attachmentUrl;
      link.download = cleanFilename;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, method: 'direct' };
    } catch (e) {
      console.warn('Cloudinary direct attachment failed, falling back to blob:', e);
    }
  }

  // 2. Fetch as blob (ensures cross-origin download dialog opens in browser)
  try {
    const response = await fetch(resolvedUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = cleanFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
    }, 1000);

    return { success: true, method: 'blob' };
  } catch (err) {
    console.warn('Blob fetch failed, falling back to anchor trigger / tab:', err);

    // 3. Fallback: try anchor click or open in new tab
    try {
      const link = document.createElement('a');
      link.href = resolvedUrl;
      link.download = cleanFilename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, method: 'anchor' };
    } catch {
      window.open(resolvedUrl, '_blank');
      return { success: true, method: 'tab' };
    }
  }
}

/**
 * Reliable copy to clipboard with fallback for older environments
 */
export async function copyToClipboard(text) {
  if (!text) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard failed, using fallback:', err);
    }
  }

  // ExecCommand fallback
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Native or clipboard sharing helper
 */
export async function shareLink({ title, text, url }) {
  const shareData = {
    title: title || 'PENSA TTU Gallery',
    text: text || 'Check out this moment from PENSA TTU',
    url: url || window.location.href,
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'native' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, cancelled: true };
      }
      // Fallback to copy
    }
  }

  const copied = await copyToClipboard(shareData.url);
  return { success: copied, method: 'clipboard' };
}

/**
 * Generate quick social share URLs
 */
export function getSocialShareUrls({ title = '', url = '' }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`Check this out from PENSA TTU: ${url}`)}`,
  };
}
