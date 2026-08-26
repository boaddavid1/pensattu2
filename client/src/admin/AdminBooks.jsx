import { useEffect, useState } from 'react';
import { adminApi } from './adminApi';
import { uploadFileToCloudinary, uploadImageToCloudinary } from '../cloudinaryUpload';

const CATEGORIES = ['Theology', 'Christian Living', 'Bible Study', 'Prayer', 'Leadership', 'History', 'Fiction', 'Other'];

export default function AdminBooks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  function emptyForm() {
    return {
      title: '', author: '', category: '', description: '',
      cover_image: '', file_url: '', file_type: '', file_size: '',
      pages: '', is_readable: '0', content: '', is_active: '1',
    };
  }

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await adminApi.list('books');
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
    setForm({
      ...item,
      is_readable: item.is_readable ? '1' : '0',
      is_active: item.is_active ? '1' : '0',
      pages: item.pages ? String(item.pages) : '',
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm());
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const url = await uploadFileToCloudinary(file, 'pensattu/books');
      setForm((prev) => ({
        ...prev,
        file_url: url,
        file_type: file.type || file.name.split('.').pop(),
        file_size: file.size,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleCoverChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadImageToCloudinary(file, 'pensattu/books/covers');
      setForm((prev) => ({ ...prev, cover_image: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingCover(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        pages: form.pages ? Number(form.pages) : null,
        file_size: form.file_size ? Number(form.file_size) : null,
        is_readable: form.is_readable === '1' ? 1 : 0,
        is_active: form.is_active === '1' ? 1 : 0,
      };
      if (editing === 'new') {
        await adminApi.create('books', payload);
      } else {
        await adminApi.update('books', editing, payload);
      }
      cancelEdit();
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this book?')) return;
    try {
      await adminApi.remove('books', id);
      await loadItems();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <h2>Library Books</h2>
        {!editing && <button className="btn btn-primary" onClick={startCreate}>+ Add Book</button>}
      </div>
      {error && <div className="admin-error">{error}</div>}

      {editing && (
        <form className="admin-form admin-card" onSubmit={save}>
          <h3>{editing === 'new' ? 'New Book' : 'Edit Book'}</h3>
          <div className="admin-form-grid">
            <label>Title *
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label>Author
              <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </label>
            <label>Category
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>Pages
              <input type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} />
            </label>
            <label>Cover Image
              <input type="file" accept="image/*" onChange={handleCoverChange} disabled={uploadingCover} />
              {uploadingCover && <span>Uploading...</span>}
              {form.cover_image && <img src={form.cover_image} alt="Cover" className="admin-cover-preview" />}
            </label>
            <label>Book File *
              <input type="file" onChange={handleFileChange} disabled={uploadingFile} required={!form.file_url} />
              {uploadingFile && <span>Uploading...</span>}
              {form.file_url && <span className="admin-cell-text">Uploaded ✓</span>}
            </label>
            <label>Readable in browser?
              <select value={form.is_readable} onChange={(e) => setForm({ ...form, is_readable: e.target.value })}>
                <option value="0">Download only</option>
                <option value="1">Yes, embed content</option>
              </select>
            </label>
            <label>Status
              <select value={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.value })}>
                <option value="1">Active</option>
                <option value="0">Hidden</option>
              </select>
            </label>
          </div>
          <label style={{ marginTop: '16px' }}>
            Description
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </label>
          {form.is_readable === '1' && (
            <label style={{ marginTop: '16px' }}>
              Embedded Content (for in-browser reading)
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} placeholder="Paste the book content here for in-browser reading..." />
            </label>
          )}
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={uploadingFile || uploadingCover}>Save</button>
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
                {item.cover_image ? (
                  <img src={item.cover_image} alt={item.title} />
                ) : (
                  <div className="admin-pq-icon">📖</div>
                )}
              </div>
              <div className="admin-crud-card-body">
                <h3>{item.title}</h3>
                <div className="admin-crud-card-meta">
                  {item.author && (
                    <div className="admin-crud-card-meta-item">
                      <span className="admin-crud-card-meta-label">Author</span>
                      <span className="admin-crud-card-meta-value">{item.author}</span>
                    </div>
                  )}
                  {item.category && (
                    <div className="admin-crud-card-meta-item">
                      <span className="admin-crud-card-meta-label">Category</span>
                      <span className="admin-crud-card-meta-value">{item.category}</span>
                    </div>
                  )}
                  {item.pages && (
                    <div className="admin-crud-card-meta-item">
                      <span className="admin-crud-card-meta-label">Pages</span>
                      <span className="admin-crud-card-meta-value">{item.pages}</span>
                    </div>
                  )}
                </div>
                {item.description && <p className="admin-crud-card-desc">{item.description}</p>}
                <p className="admin-crud-card-desc">{item.downloads || 0} downloads</p>
              </div>
              <div className="admin-crud-card-actions">
                <button className="admin-edit" onClick={() => startEdit(item)}>Edit</button>
                <button className="admin-delete" onClick={() => remove(item.id)}>Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="admin-empty">No books yet.</p>}
        </div>
      )}
    </div>
  );
}
