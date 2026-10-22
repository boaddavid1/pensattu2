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
 * Format a clean filename for download (e.g. PENSA-TTU-worship-photo.jpg or .png)
 */
export function formatDownloadFilename(title = '', albumTitle = '', ext = 'jpg') {
  const parts = ['PENSA-TTU'];
  if (albumTitle) parts.push(albumTitle);
  if (title) parts.push(title);
  
  const raw = parts.join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const cleanExt = (ext || 'jpg').toLowerCase().replace(/^\./, '');
  const finalExt = cleanExt === 'png' ? 'png' : 'jpg';
  return `${raw || 'pensa-gallery-photo'}.${finalExt}`;
}

/**
 * Get Cloudinary direct attachment download URL with format transformation
 */
export function getCloudinaryAttachmentUrl(url, cleanFilename = '', format = 'jpg') {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) {
    return url;
  }

  const uploadIndex = url.indexOf('/image/upload/');
  if (uploadIndex === -1) return url;

  const prefix = url.slice(0, uploadIndex + 14);
  let rest = url.slice(uploadIndex + 14);

  // If rest starts with an existing transformation segment (e.g. f_auto,q_auto,w_700/...),
  // strip it so we download the full-resolution original photo!
  const segments = rest.split('/');
  if (segments.length > 1 && /(^|,)(f_|q_|w_|c_|fl_|h_|b_)/.test(segments[0])) {
    segments.shift();
    rest = segments.join('/');
  }

  const targetFormat = format?.toLowerCase() === 'png' ? 'png' : 'jpg';
  const safeName = cleanFilename
    ? cleanFilename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
    : 'pensa_photo';

  const transformFlags = [`fl_attachment:${safeName}`, `f_${targetFormat}`];
  if (targetFormat === 'jpg') {
    transformFlags.push('q_auto:best');
  }

  // Also replace any file extension at the end of the public_id with the target format
  const restWithExt = rest.replace(/\.[a-zA-Z0-9]+$/, `.${targetFormat}`);

  return `${prefix}${transformFlags.join(',')}/${restWithExt}`;
}

/**
 * Converts any image blob (WebP, AVIF, PNG, JPG) to the requested format ('jpg' or 'png')
 * using an HTML5 Canvas. Transparent backgrounds in PNG/WebP become solid white in JPG.
 */
export async function convertBlobToFormat(blob, targetFormat = 'jpg', quality = 0.95) {
  const normFormat = targetFormat?.toLowerCase() === 'png' ? 'png' : 'jpg';
  const mimeType = normFormat === 'png' ? 'image/png' : 'image/jpeg';

  // If already exactly that type, return immediately
  if (blob && blob.type === mimeType) {
    return blob;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = window.URL.createObjectURL(blob);

      img.onload = () => {
        window.URL.revokeObjectURL(objectUrl);
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          if (!width || !height) {
            resolve(blob);
            return;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (mimeType === 'image/jpeg') {
            // Fill background with white so transparent PNG/WebP doesn't turn black
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (convertedBlob) => {
              if (convertedBlob) {
                resolve(convertedBlob);
              } else {
                resolve(blob);
              }
            },
            mimeType,
            quality
          );
        } catch (err) {
          console.warn('Canvas conversion error, using original blob:', err);
          resolve(blob);
        }
      };

      img.onerror = () => {
        window.URL.revokeObjectURL(objectUrl);
        resolve(blob);
      };

      img.src = objectUrl;
    } catch (e) {
      console.warn('convertBlobToFormat exception:', e);
      resolve(blob);
    }
  });
}

/**
 * Robust image download that handles cross-origin images (Cloudinary, local, external)
 * with support for JPG and PNG format selection and real MIME conversion.
 */
export async function downloadImage(url, filename = 'pensa-photo.jpg', format = 'jpg') {
  if (!url) throw new Error('No image URL provided');

  const normFormat = format?.toLowerCase() === 'png' ? 'png' : 'jpg';
  const resolvedUrl = getImageUrl(url);
  const cleanFilename = filename.toLowerCase().endsWith(`.${normFormat}`)
    ? filename
    : filename.replace(/\.[^/.]+$/, '') + `.${normFormat}`;

  // 1. If it's a Cloudinary URL, we can fetch high-res transcoded to target format directly
  let fetchTargetUrl = resolvedUrl;
  if (resolvedUrl.includes('res.cloudinary.com') && resolvedUrl.includes('/image/upload/')) {
    const uploadIndex = resolvedUrl.indexOf('/image/upload/');
    const prefix = resolvedUrl.slice(0, uploadIndex + 14);
    let rest = resolvedUrl.slice(uploadIndex + 14);

    // Strip thumbnail flags if any
    const segments = rest.split('/');
    if (segments.length > 1 && /(^|,)(f_|q_|w_|c_|fl_|h_|b_)/.test(segments[0])) {
      segments.shift();
      rest = segments.join('/');
    }

    const restWithExt = rest.replace(/\.[a-zA-Z0-9]+$/, `.${normFormat}`);
    const transformFlag = normFormat === 'png' ? 'f_png' : 'f_jpg,q_auto:best';
    fetchTargetUrl = `${prefix}${transformFlag}/${restWithExt}`;
  }

  // 2. Fetch as blob & ensure exact format conversion
  try {
    const response = await fetch(fetchTargetUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const rawBlob = await response.blob();
    const finalBlob = await convertBlobToFormat(rawBlob, normFormat);

    const objectUrl = window.URL.createObjectURL(finalBlob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = cleanFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
    }, 4000);

    return { success: true, method: 'blob', format: normFormat, filename: cleanFilename };
  } catch (err) {
    console.warn('Direct blob fetch failed, trying direct attachment or anchor:', err);

    // 3. Fallback for Cloudinary: direct attachment flag triggers download dialog
    if (resolvedUrl.includes('res.cloudinary.com') && resolvedUrl.includes('/image/upload/')) {
      try {
        const attachmentUrl = getCloudinaryAttachmentUrl(resolvedUrl, cleanFilename, normFormat);
        const link = document.createElement('a');
        link.href = attachmentUrl;
        link.download = cleanFilename;
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return { success: true, method: 'attachment', format: normFormat, filename: cleanFilename };
      } catch (e) {
        console.warn('Cloudinary attachment fallback failed:', e);
      }
    }

    // 4. Ultimate fallback: anchor click or open in new tab
    try {
      const link = document.createElement('a');
      link.href = fetchTargetUrl || resolvedUrl;
      link.download = cleanFilename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, method: 'anchor', format: normFormat, filename: cleanFilename };
    } catch {
      window.open(fetchTargetUrl || resolvedUrl, '_blank');
      return { success: true, method: 'tab', format: normFormat, filename: cleanFilename };
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
