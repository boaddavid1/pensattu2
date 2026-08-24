import { useEffect, useState } from 'react';
import { adminApi } from './adminApi';
import { uploadImageToCloudinary } from '../cloudinaryUpload';

const fieldConfig = {
  ministries: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'image_url', label: 'Image', type: 'image', folder: 'pensattu/ministries' },
  ],
  sermons: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'speaker', label: 'Speaker', type: 'text' },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'duration', label: 'Duration', type: 'text' },
    { name: 'image_url', label: 'Image', type: 'image', folder: 'pensattu/sermons' },
    { name: 'published_at', label: 'Published Date', type: 'date' },
  ],
  team: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'role', label: 'Role', type: 'text' },
    { name: 'image_url', label: 'Image', type: 'image', folder: 'pensattu/team' },
    { name: 'sort_order', label: 'Sort Order', type: 'number' },
  ],
  events: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'event_date', label: 'Date', type: 'date', required: true },
    { name: 'event_time', label: 'Time', type: 'text' },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'image_url', label: 'Image', type: 'image', folder: 'pensattu/events' },
  ],
  announcements: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'body', label: 'Body', type: 'textarea', required: true },
    { name: 'image_url', label: 'Image', type: 'image', folder: 'pensattu/news' },
    { name: 'published_at', label: 'Published Date', type: 'date' },
  ],
  notices: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'body', label: 'Body', type: 'textarea', required: true },
    { name: 'image_url', label: 'Image', type: 'image', folder: 'pensattu/news' },
    { name: 'published_at', label: 'Published Date', type: 'date' },
  ],
  gallery_albums: [
    { name: 'slug', label: 'Slug', type: 'text', required: true },
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'cover', label: 'Cover Image', type: 'image', folder: 'pensattu/gallery' },
  ],
};

export default function AdminCrudPage({ entity, title }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const fields = fieldConfig[entity] || [];

  useEffect(() => {
    loadItems();
  }, [entity]);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await adminApi.list(entity);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setEditing('new');
    setForm(Object.fromEntries(fields.map((f) => [f.name, f.type === 'number' ? 0 : ''])));
  }

  function startEdit(item) {
    setEditing(item.id);
    const formatted = { ...item };
    if (formatted.published_at && formatted.published_at.includes('T')) {
      formatted.published_at = formatted.published_at.split('T')[0];
    }
    if (formatted.event_date && formatted.event_date.includes('T')) {
      formatted.event_date = formatted.event_date.split('T')[0];
    }
    setForm(formatted);
  }

  function cancelEdit() {
    setEditing(null);
    setForm({});
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      fields.forEach((f) => {
        if (f.type === 'number') payload[f.name] = Number(payload[f.name]);
      });
      if (editing === 'new') {
        await adminApi.create(entity, payload);
      } else {
        await adminApi.update(entity, editing, payload);
      }
      await loadItems();
      cancelEdit();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await adminApi.remove(entity, id);
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function ImageField({ field }) {
    const [uploading, setUploading] = useState(false);
    async function handleFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      try {
        const url = await uploadImageToCloudinary(file, field.folder || 'pensattu/misc');
        handleChange(field.name, url);
      } catch (err) {
        setError(err.message);
      } finally {
        setUploading(false);
      }
    }
    return (
      <label key={field.name}>
        {field.label}
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        {uploading && <span>Uploading...</span>}
        {form[field.name] && (
          <img src={form[field.name]} alt="Preview" style={{ maxWidth: '120px', maxHeight: '120px', display: 'block', marginTop: '8px' }} />
        )}
      </label>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h2>{title}</h2>
        <button className="btn btn-primary" onClick={startCreate}>+ Add {title}</button>
      </div>
      {error && <div className="admin-error">{error}</div>}
      {editing && (
        <form className="admin-form admin-card" onSubmit={save}>
          <h3>{editing === 'new' ? `New ${title}` : `Edit ${title}`}</h3>
          <div className="admin-form-grid">
            {fields.map((field) => {
              if (field.type === 'image') return <ImageField key={field.name} field={field} />;
              return (
                <label key={field.name}>
                  {field.label}
                  {field.type === 'textarea' ? (
                    <textarea
                      value={form[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={form[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                    />
                  )}
                </label>
              );
            })}
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
          </div>
        </form>
      )}
      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
        <div className="admin-table-wrap admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                {fields.map((f) => <th key={f.name}>{f.label}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {fields.map((f) => (
                    <td key={f.name}>
                      {f.type === 'textarea'
                        ? (item[f.name] || '').slice(0, 60) + ((item[f.name] || '').length > 60 ? '...' : '')
                        : item[f.name] || '-'}
                    </td>
                  ))}
                  <td className="admin-actions">
                    <button className="admin-edit" onClick={() => startEdit(item)}>Edit</button>
                    <button className="admin-delete" onClick={() => remove(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={fields.length + 1} className="admin-empty">No items yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
