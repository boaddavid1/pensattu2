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
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'role', label: 'Role/Position', type: 'text' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: ['pastor', 'patroness', 'ec', 'lcc'] },
    { name: 'academic_year', label: 'Academic Year of Administration', type: 'select', required: true, options: ['2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030'] },
    { name: 'programme', label: 'Programme of Study', type: 'text' },
    { name: 'hall', label: 'Affiliated Hall', type: 'text' },
    { name: 'previous_portfolio', label: 'Portfolio(s) Held Previously at PENSA TTU', type: 'textarea' },
    { name: 'description', label: 'Bio / Description', type: 'textarea' },
    { name: 'image_url', label: 'Upload Image', type: 'image', folder: 'pensattu/team' },
    { name: 'display_order', label: 'Display Order', type: 'number' },
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

  function renderCellValue(f, item) {
    const value = item[f.name];
    if (f.type === 'image' || f.name === 'image_url' || f.name === 'cover') {
      return value ? <img src={value} alt="" style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '4px' }} /> : '-';
    }
    if (f.type === 'textarea') {
      return (value || '').slice(0, 60) + ((value || '').length > 60 ? '...' : '');
    }
    return value || '-';
  }

  function MemberCard({ p }) {
    return (
      <div key={p.id} className="admin-team-card">
        <img src={p.image_url || ''} alt={p.name} className="admin-team-img" />
        <div className="admin-team-body">
          <strong>{p.name}</strong>
          <span>{p.role}</span>
        </div>
        <div className="admin-team-actions">
          <button className="admin-edit" onClick={() => startEdit(p)}>Edit</button>
          <button className="admin-delete" onClick={() => remove(p.id)}>Delete</button>
        </div>
      </div>
    );
  }

  function TeamCards() {
    const [expanded, setExpanded] = useState({});

    const seniorLeaders = items.filter((p) => ['pastor', 'patroness'].includes(p.category));
    const albumMembers = items.filter((p) => !['pastor', 'patroness'].includes(p.category));

    const groups = albumMembers.reduce((acc, p) => {
      const year = p.academic_year || 'Other';
      (acc[year] = acc[year] || []).push(p);
      return acc;
    }, {});
    const sortedYears = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    function toggleYear(year) {
      setExpanded((prev) => ({ ...prev, [year]: !prev[year] }));
    }

    function renderSection(title, members) {
      if (!members.length) return null;
      return (
        <div className="admin-team-section">
          <h3 className="admin-team-section-title">{title}</h3>
          <div className="admin-team-grid">
            {members.map((p) => <MemberCard key={p.id} p={p} />)}
          </div>
        </div>
      );
    }

    return (
      <div>
        {renderSection('Senior Leaders', seniorLeaders)}

        {sortedYears.length > 0 && (
          <div className="admin-team-albums">
            {sortedYears.map((year) => {
              const members = groups[year];
              const cover = members.find((p) => p.image_url)?.image_url || '';
              const isOpen = !!expanded[year];
              return (
                <div key={year} className="admin-team-album">
                  <button
                    type="button"
                    className="admin-team-album-header"
                    onClick={() => toggleYear(year)}
                  >
                    <div className="admin-team-album-cover">
                      {cover ? <img src={cover} alt={year} /> : <span className="admin-team-album-placeholder">{year}</span>}
                      <div className="admin-team-album-overlay">
                        <h3>{year}</h3>
                        <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <span className="admin-team-album-toggle">{isOpen ? '▲ Collapse' : '▼ Expand'}</span>
                  </button>
                  {isOpen && (
                    <div className="admin-team-album-body">
                      <div className="admin-team-grid compact">
                        {members.map((p) => <MemberCard key={p.id} p={p} />)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
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
                  ) : field.type === 'select' ? (
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
      ) : entity === 'team' ? (
        <TeamCards />
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
                    <td key={f.name}>{renderCellValue(f, item)}</td>
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
