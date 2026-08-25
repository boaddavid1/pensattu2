import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi';
import { uploadImageToCloudinary } from '../cloudinaryUpload';

const teamFields = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'role', label: 'Role/Position', type: 'text' },
  { name: 'category', label: 'Category', type: 'select', required: true, options: ['pastor', 'patroness', 'ec', 'lcc'] },
  { name: 'academic_year', label: 'Academic Year of Administration', type: 'select', required: true, options: ['2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030'] },
  { name: 'programme', label: 'Programme of Study', type: 'text' },
  { name: 'hall', label: 'Affiliated Hall', type: 'select', options: ['Nzima-Mensah Hall', 'Ahanta Hall', 'Prof. Duncan Hall', 'University Hall', 'GETFund Hall', 'SRC Hall Complex'] },
  { name: 'previous_portfolio', label: 'Portfolio(s) Held Previously at PENSA TTU', type: 'textarea' },
  { name: 'description', label: 'Bio / Description', type: 'textarea' },
  { name: 'image_url', label: 'Upload Image', type: 'image', folder: 'pensattu/team' },
  { name: 'display_order', label: 'Display Order', type: 'number' },
];

export default function AdminTeamForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [form, setForm] = useState(() =>
    Object.fromEntries(teamFields.map((f) => [f.name, f.type === 'number' ? 0 : '']))
  );
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    adminApi.get('team', id)
      .then((data) => {
        const formatted = { ...data };
        if (formatted.image_url && !formatted.image_url.startsWith('http')) {
          formatted.image_url = '';
        }
        setForm((prev) => ({ ...prev, ...formatted }));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

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
        <h2>{isNew ? 'Add Team Member' : 'Edit Team Member'}</h2>
      </div>
      {error && <div className="admin-error">{error}</div>}
      <form className="admin-form admin-card" onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          {teamFields.map((field) => {
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
                <label key={field.name}>
                  {field.label}
                  <textarea
                    value={form[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
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
                  value={form[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                />
              </label>
            );
          })}
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/team')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
