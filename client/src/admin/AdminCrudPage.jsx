import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi';
import { uploadImageToCloudinary } from '../cloudinaryUpload';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

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
    { name: 'hall', label: 'Affiliated Hall', type: 'select', options: ['Nzima-Mensah Hall', 'Ahanta Hall', 'Prof. Duncan Hall', 'University Hall', 'GETFund Hall', 'SRC Hall Complex'] },
    { name: 'previous_portfolio', label: 'Portfolio(s) Held Previously at PENSA TTU', type: 'textarea' },
    { name: 'description', label: 'Bio / Description', type: 'textarea' },
    { name: 'image_url', label: 'Upload Image', type: 'image', folder: 'pensattu/team' },
    { name: 'display_order', label: 'Display Order', type: 'number' },
  ],
  events: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'event_date', label: 'Start Date', type: 'date', required: true },
    { name: 'event_end_date', label: 'End Date', type: 'date' },
    { name: 'event_time', label: 'Time', type: 'text' },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'image_url', label: 'Image', type: 'image', folder: 'pensattu/events' },
    { name: 'featured', label: 'Featured', type: 'select', options: ['0', '1'] },
    { name: 'status', label: 'Status', type: 'select', options: ['upcoming', 'past'], required: true },
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
  const navigate = useNavigate();
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
    if (entity === 'team') {
      navigate('/admin/team/new');
      return;
    }
    setEditing('new');
    setForm(Object.fromEntries(fields.map((f) => [f.name, f.type === 'number' ? 0 : ''])));
  }

  function startEdit(item) {
    if (entity === 'team') {
      navigate(`/admin/team/${item.id}/edit`, { state: { item } });
      return;
    }
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

  function getImageField() {
    return fields.find((f) => f.type === 'image' || ['image_url', 'cover', 'cover_image'].includes(f.name));
  }

  function getTitle(item) {
    return item.title || item.name || item.full_name || `Item #${item.id}`;
  }

  function renderCardImage(item) {
    const imgField = getImageField();
    const src = imgField ? resolveImageUrl(item[imgField.name]) : null;
    return src ? <img src={src} alt="" /> : <div className="admin-crud-card-noimg" />;
  }

  function renderCardMeta(item) {
    const metaFields = fields
      .filter((f) => f.type !== 'image' && f.type !== 'textarea' && !['title', 'name', 'full_name'].includes(f.name))
      .slice(0, 3);
    return metaFields.map((f) => (
      <div key={f.name} className="admin-crud-card-meta-item">
        <span className="admin-crud-card-meta-label">{f.label}</span>
        <span className="admin-crud-card-meta-value">{renderCellValue(f, item)}</span>
      </div>
    ));
  }

  function renderCardDescription(item) {
    const descField = fields.find((f) => f.type === 'textarea' || ['description', 'body', 'content'].includes(f.name));
    if (!descField) return '';
    const value = item[descField.name] || '';
    return value.length > 90 ? value.slice(0, 90) + '...' : value;
  }

  function isZeroDate(value) {
    if (!value) return true;
    const str = String(value);
    return str.startsWith('0000') || str.startsWith('1899-11-30');
  }

  function formatDate(value) {
    if (isZeroDate(value)) return <span className="admin-cell-empty">—</span>;
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toLocaleDateString();
  }

  function resolveImageUrl(value) {
    if (!value) return null;
    if (value.startsWith('http')) return value;
    return `${API_ROOT}/${value.replace(/^\//, '')}`;
  }

  function renderCellValue(f, item) {
    const value = item[f.name];
    if (f.type === 'image' || f.name === 'image_url' || f.name === 'cover') {
      const src = resolveImageUrl(value);
      return src ? <img src={src} alt="" className="admin-table-img" /> : <span className="admin-cell-empty">—</span>;
    }
    if (f.type === 'date' || f.name.includes('date') || f.name.includes('_at')) {
      return formatDate(value);
    }
    if (f.type === 'textarea') {
      return <span className="admin-cell-text">{(value || '').slice(0, 60) + ((value || '').length > 60 ? '...' : '')}</span>;
    }
    return value ? <span className="admin-cell-text" title={String(value)}>{String(value)}</span> : <span className="admin-cell-empty">—</span>;
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
              return (
                <div key={year} className="admin-team-album">
                  <button
                    type="button"
                    className="admin-team-album-header"
                    onClick={() => navigate(`/admin/team/year/${encodeURIComponent(year)}`)}
                  >
                    <div className="admin-team-album-cover">
                      {cover ? <img src={cover} alt={year} /> : <span className="admin-team-album-placeholder">{year}</span>}
                      <div className="admin-team-album-overlay">
                        <h3>{year}</h3>
                        <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <span className="admin-team-album-toggle">View Members →</span>
                  </button>
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
        <div className="admin-crud-grid">
          {items.map((item) => (
            <div key={item.id} className="admin-crud-card">
              <div className="admin-crud-card-img">
                {renderCardImage(item)}
              </div>
              <div className="admin-crud-card-body">
                <h3>{getTitle(item)}</h3>
                <div className="admin-crud-card-meta">
                  {renderCardMeta(item)}
                </div>
                {renderCardDescription(item) && (
                  <p className="admin-crud-card-desc">{renderCardDescription(item)}</p>
                )}
              </div>
              <div className="admin-crud-card-actions">
                <button className="admin-edit" onClick={() => startEdit(item)}>Edit</button>
                <button className="admin-delete" onClick={() => remove(item.id)}>Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="admin-empty">No items yet.</p>}
        </div>
      )}
    </div>
  );
}
