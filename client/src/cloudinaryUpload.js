const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'pensattu';

export async function uploadImageToCloudinary(file, folder = 'pensattu/misc') {
  if (!CLOUD_NAME) {
    throw new Error('VITE_CLOUDINARY_CLOUD_NAME is not set');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.secure_url;
}

export async function uploadFileToCloudinary(file, folder = 'pensattu/files') {
  if (!CLOUD_NAME) {
    throw new Error('VITE_CLOUDINARY_CLOUD_NAME is not set');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('folder', folder);

  // Use 'raw' upload type for non-image files (PDFs, docs, etc.)
  // This stores them as raw resources which are publicly accessible.
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary file upload failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.secure_url;
}
