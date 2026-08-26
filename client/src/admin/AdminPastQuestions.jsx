import { useEffect, useState } from 'react';
import { adminApi } from './adminApi';
import { uploadFileToCloudinary } from '../cloudinaryUpload';

const SEMESTERS = ['Semester 1', 'Semester 2'];
const LEVELS = ['100', '200', '300', '400'];
const EXAM_TYPES = ['Mid-Semester', 'End of Semester', 'Resit', 'Quiz', 'Assignment', 'Practical'];

export default function AdminPastQuestions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [uploading, setUploading] = useState(false);

  function emptyForm() {
    return {
      course_code: '', course_title: '', year: new Date().getFullYear(),
      semester: '', level: '', programme: '', exam_type: '',
      file_url: '', file_type: '', file_size: '', is_active: '1',
    };
  }

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await adminApi.list('past_questions');
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setEditing('new');
    setForm(emptyForm());
  }

  function startEdit(item) {
    setEditing(item.id);
    setForm({ ...item, is_active: item.is_active ? '1' : '0', year: String(item.year) });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm());
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFileToCloudinary(file, 'pensattu/pastquestions');
      setForm((prev) => ({
        ...prev,
        file_url: url,
        file_type: file.type || file.name.split('.').pop(),
        file_size: file.size,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        year: Number(form.year),
        file_size: form.file_size ? Number(form.file_size) : null,
        is_active: form.is_active === '1' ? 1 : 0,
      };
      if (editing === 'new') {
        await adminApi.create('past_questions', payload);
      } else {
        await adminApi.update('past_questions', editing, payload);
      }
      cancelEdit();
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this past question?')) return;
    try {
      await adminApi.remove('past_questions', id);
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <h2>Past Questions</h2>
        {!editing && <button className="btn btn-primary" onClick={startCreate}>+ Add Past Question</button>}
      </div>
      {error && <div className="admin-error">{error}</div>}

      {editing && (
        <form className="admin-form admin-card" onSubmit={save}>
          <h3>{editing === 'new' ? 'New Past Question' : 'Edit Past Question'}</h3>
          <div className="admin-form-grid">
            <label>Course Code *
              <input type="text" value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} required />
            </label>
            <label>Course Title *
              <input type="text" value={form.course_title} onChange={(e) => setForm({ ...form, course_title: e.target.value })} required />
            </label>
            <label>Year *
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
            </label>
            <label>Semester *
              <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required>
                <option value="">Select Semester</option>
                {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>Level *
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} required>
                <option value="">Select Level</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label>Programme
              <input type="text" value={form.programme} onChange={(e) => setForm({ ...form, programme: e.target.value })} placeholder="e.g. Computer Science" />
            </label>
            <label>Exam Type *
              <select value={form.exam_type} onChange={(e) => setForm({ ...form, exam_type: e.target.value })} required>
                <option value="">Select Exam Type</option>
                {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>File *
              <input type="file" onChange={handleFileChange} disabled={uploading} required={!form.file_url} />
              {uploading && <span>Uploading...</span>}
              {form.file_url && <span className="admin-cell-text">Uploaded ✓</span>}
            </label>
            <label>Status
              <select value={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.value })}>
                <option value="1">Active</option>
                <option value="0">Hidden</option>
              </select>
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={uploading}>Save</button>
            <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
        <div className="admin-crud-grid">
          {items.map((item) => (
            <div key={item.id} className="admin-crud-card">
              <div className="admin-crud-card-img">
                <div className="admin-pq-icon">📄</div>
              </div>
              <div className="admin-crud-card-body">
                <h3>{item.course_code}</h3>
                <div className="admin-crud-card-meta">
                  <div className="admin-crud-card-meta-item">
                    <span className="admin-crud-card-meta-label">Title</span>
                    <span className="admin-crud-card-meta-value">{item.course_title}</span>
                  </div>
                  <div className="admin-crud-card-meta-item">
                    <span className="admin-crud-card-meta-label">Year</span>
                    <span className="admin-crud-card-meta-value">{item.year}</span>
                  </div>
                  <div className="admin-crud-card-meta-item">
                    <span className="admin-crud-card-meta-label">Semester</span>
                    <span className="admin-crud-card-meta-value">{item.semester}</span>
                  </div>
                  <div className="admin-crud-card-meta-item">
                    <span className="admin-crud-card-meta-label">Level</span>
                    <span className="admin-crud-card-meta-value">{item.level}</span>
                  </div>
                  <div className="admin-crud-card-meta-item">
                    <span className="admin-crud-card-meta-label">Type</span>
                    <span className="admin-crud-card-meta-value">{item.exam_type}</span>
                  </div>
                </div>
                <p className="admin-crud-card-desc">{item.programme || 'All programmes'} • {item.downloads || 0} downloads</p>
              </div>
              <div className="admin-crud-card-actions">
                <button className="admin-edit" onClick={() => startEdit(item)}>Edit</button>
                <button className="admin-delete" onClick={() => remove(item.id)}>Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="admin-empty">No past questions yet.</p>}
        </div>
      )}
    </div>
  );
}
