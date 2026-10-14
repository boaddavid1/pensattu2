import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { adminApi } from './adminApi';
import { uploadImageToCloudinary } from '../cloudinaryUpload';

const teamFields = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'role', label: 'Role/Position', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'select', required: true, options: ['pastor', 'patroness', 'ec', 'lcc'] },
  { name: 'academic_year', label: 'Academic Year of Administration', type: 'select', required: true, options: ['2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030'] },
  { name: 'programme', label: 'Programme of Study', type: 'text' },
  { name: 'hall', label: 'Affiliated Hall', type: 'select', options: ['Nzima-Mensah Hall', 'Ahanta Hall', 'Prof. Duncan Hall', 'University Hall', 'GETFund Hall', 'SRC Hall Complex'] },
  { name: 'previous_portfolio', label: 'Portfolio(s) Held Previously at PENSA TTU', type: 'textarea' },
  { name: 'description', label: 'Bio / Description', type: 'textarea' },
  { name: 'image_url', label: 'Upload Image', type: 'image', folder: 'pensattu/team' },
  { name: 'display_order', label: 'Display Order', type: 'number' },
];

function emptyForm() {
  return Object.fromEntries(teamFields.map((f) => [f.name, f.type === 'number' ? 0 : '']));
}

export default function AdminTeamForm({ isNew: isNewProp }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = isNewProp || id === 'new';
  const passedItem = location.state?.item;
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Always reset form when mode/route changes
    setForm(emptyForm());
    setError('');

    if (isNew) {
      setLoading(false);
      return;
    }

    // Edit mode: use passed item data if available, otherwise fetch from API
    if (passedItem) {
      setForm({ ...emptyForm(), ...passedItem });
      setLoading(false);
      return;
    }

    // No passed data — fetch from API with retry
    let cancelled = false;
    async function load() {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const data = await adminApi.get('team', id);
          if (cancelled) return;
          setForm({ ...emptyForm(), ...data });
          setLoading(false);
          return;
        } catch (err) {
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          } else {
            if (!cancelled) {
              setError(err.message || 'Unable to load this team member. The database may be temporarily unavailable.');
              setLoading(false);
            }
          }
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, isNew, passedItem]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleImageUpload(field, e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    setImageError('');
    setError('');
    try {
      const url = await uploadImageToCloudinary(file, field.folder || 'pensattu/team');
      handleChange(field.name, url);
    } catch (err) {
      const msg = err.message || 'Failed to upload image. Please try again.';
      setImageError(msg);
      setError(msg);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (uploadingImage) {
      setError('Please wait for the image upload to finish before saving.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      teamFields.forEach((f) => {
        if (f.type === 'number') payload[f.name] = Number(payload[f.name]);
        if (!f.required && payload[f.name] === '') payload[f.name] = null;
      });
      payload.is_active = 1;
      if (!payload.image_url || !String(payload.image_url).trim()) {
        payload.image_url = '/images/pensafallback-bw.png';
      }
      if (isNew) {
        await adminApi.create('team', payload);
      } else {
        await adminApi.update('team', id, payload);
      }
      navigate('/control-panel/team');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h2>{isNew ? 'Add New Team Member' : 'Edit Team Member'}</h2>
        <button className="btn btn-ghost" onClick={() => navigate('/control-panel/team')}>
          ← Back to list
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <form className="admin-form admin-card" onSubmit={handleSubmit}>
        <div className="admin-form-section">
          <h3 className="admin-form-section-title">Required Information</h3>
          <div className="admin-form-grid">
            {teamFields.filter((f) => f.required).map((field) => renderField(field, form, handleChange))}
          </div>
        </div>

        <div className="admin-form-section">
          <h3 className="admin-form-section-title">Additional Information</h3>
          <div className="admin-form-grid">
            {teamFields.filter((f) => !f.required && f.type !== 'image').map((field) => renderField(field, form, handleChange))}
          </div>
        </div>

        <div className="admin-form-section">
          <h3 className="admin-form-section-title">Photograph</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {imageError && (
              <div className="admin-error" style={{ margin: 0 }}>
                {imageError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ width: '130px', height: '150px', borderRadius: '12px', overflow: 'hidden', background: 'var(--pine-surface, #f4f6f5)', border: '2px dashed var(--line, #e2e8e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {form.image_url ? (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/pensafallback-bw.png';
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--ink-faint, #888)', padding: '10px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '4px' }}>👤</div>
                    <span style={{ fontSize: '11px' }}>No photo</span>
                  </div>
                )}
              </div>

              <div style={{ flex: '1', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>Upload Image from Device (Cloudinary)</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={(e) => handleImageUpload(teamFields.find((f) => f.name === 'image_url'), e)}
                  />
                </label>

                {uploadingImage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--moss, #1a7f5a)', fontSize: '13px', fontWeight: 600 }}>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                    Uploading photo to Cloudinary... please wait
                  </div>
                )}

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--ink-soft, #555)' }}>Or enter Image URL / Relative Path</span>
                  <input
                    type="text"
                    placeholder="https://res.cloudinary.com/... or /images/..."
                    value={form.image_url || ''}
                    onChange={(e) => handleChange('image_url', e.target.value)}
                  />
                </label>

                {form.image_url && (
                  <div>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ padding: '4px 10px', fontSize: '12px', color: '#c0392b' }}
                      onClick={() => handleChange('image_url', '')}
                    >
                      ✕ Remove Photo (use fallback)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving || uploadingImage}>
            {uploadingImage ? 'Uploading Image...' : saving ? 'Saving...' : isNew ? 'Add Team Member' : 'Update Team Member'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/control-panel/team')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function renderField(field, form, handleChange) {
  if (field.type === 'textarea') {
    return (
      <label key={field.name} className="admin-form-full">
        {field.label}
        <textarea
          value={form[field.name] || ''}
          onChange={(e) => handleChange(field.name, e.target.value)}
          required={field.required}
          rows={3}
        />
      </label>
    );
  }
  if (field.type === 'select') {
    return (
      <label key={field.name}>
        {field.label}
        <select
          value={form[field.name] || ''}
          onChange={(e) => handleChange(field.name, e.target.value)}
          required={field.required}
        >
          <option value="">Select {field.label}</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <label key={field.name}>
      {field.label}
      <input
        type={field.type}
        value={form[field.name] ?? ''}
        onChange={(e) => handleChange(field.name, e.target.value)}
        required={field.required}
      />
    </label>
  );
}
