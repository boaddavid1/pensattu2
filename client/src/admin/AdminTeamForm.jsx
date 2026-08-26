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

export default function AdminTeamForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = id === 'new';
  const passedItem = location.state?.item;
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) {
      setForm(emptyForm());
      setLoading(false);
      return;
    }

    // Edit mode: use passed item data if available, otherwise fetch from API
    if (passedItem) {
      const formatted = { ...passedItem };
      if (formatted.image_url && !formatted.image_url.startsWith('http')) {
        formatted.image_url = '';
      }
      setForm({ ...emptyForm(), ...formatted });
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
          const formatted = { ...data };
          if (formatted.image_url && !formatted.image_url.startsWith('http')) {
            formatted.image_url = '';
          }
          setForm({ ...emptyForm(), ...formatted });
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

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleImageUpload(field, e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImageToCloudinary(file, field.folder);
      handleChange(field.name, url);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      teamFields.forEach((f) => {
        if (f.type === 'number') payload[f.name] = Number(payload[f.name]);
        if (!f.required && payload[f.name] === '') payload[f.name] = null;
      });
      if (isNew) {
        await adminApi.create('team', payload);
      } else {
        await adminApi.update('team', id, payload);
      }
      navigate('/admin/team');
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
        <button className="btn btn-ghost" onClick={() => navigate('/admin/team')}>
          ← Back to list
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <form className="admin-form admin-card" onSubmit={handleSubmit}>
        <div className="admin-form-section">
          <h3 className="admin-form-section-title">Required Information</h3>
          <div className="admin-form-grid">
            {teamFields.filter((f) => f.required).map((field) => renderField(field, form, handleChange, handleImageUpload))}
          </div>
        </div>

        <div className="admin-form-section">
          <h3 className="admin-form-section-title">Additional Information</h3>
          <div className="admin-form-grid">
            {teamFields.filter((f) => !f.required && f.type !== 'image').map((field) => renderField(field, form, handleChange, handleImageUpload))}
          </div>
        </div>

        <div className="admin-form-section">
          <h3 className="admin-form-section-title">Image</h3>
          <div className="admin-form-grid">
            {teamFields.filter((f) => f.type === 'image').map((field) => renderField(field, form, handleChange, handleImageUpload))}
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isNew ? 'Add Team Member' : 'Update Team Member'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/team')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function renderField(field, form, handleChange, handleImageUpload) {
  if (field.type === 'image') {
    return (
      <label key={field.name}>
        {field.label}
        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(field, e)} />
        {form[field.name] && (
          <img src={form[field.name]} alt="Preview" className="admin-cover-preview" />
        )}
      </label>
    );
  }
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
