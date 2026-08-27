// PhotoUpload.jsx — Reusable profile photo upload component (base64 data URL)
import { useRef, useState } from 'react';

export default function PhotoUpload({ photoData, onChange, size = 120 }) {
  const fileRef = useRef(null);
  const [error, setError] = useState('');

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.match(/^image\//)) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      // Compress: load into image, redraw to canvas at max 400x400
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width;
          width = maxDim;
        } else if (height > maxDim) {
          width = (width * maxDim) / height;
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onChange(dataUrl);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="photo-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{
          width: size, height: size, borderRadius: '50%', border: '2px dashed var(--grey)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', background: 'var(--light)', position: 'relative',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--blue)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--grey)'}
      >
        {photoData ? (
          <img src={photoData} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--dark-grey)' }}>
            <i className='bx bxs-camera-plus' style={{ fontSize: 32, display: 'block' }}></i>
            <span style={{ fontSize: 11 }}>Click or drop</span>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }}
          onClick={() => fileRef.current?.click()}>
          <i className='bx bx-upload'></i> Upload
        </button>
        {photoData && (
          <button type="button" className="btn btn-danger" style={{ padding: '4px 12px', fontSize: 12 }}
            onClick={() => onChange('')}>
            <i className='bx bx-trash'></i> Remove
          </button>
        )}
      </div>
      {error && <span style={{ color: 'var(--red)', fontSize: 12 }}>{error}</span>}
    </div>
  );
}
