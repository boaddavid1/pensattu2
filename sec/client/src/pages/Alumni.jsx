// Alumni.jsx — Alumni management (ported from alumni.php)
import { useState, useEffect, useCallback } from 'react';
import { secApi } from '../api/secApi.js';

export default function Alumni() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editAlumni, setEditAlumni] = useState(null);
  const [showDelete, setShowDelete] = useState(null);

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', page);
      params.set('perPage', 20);
      const result = await secApi.listAlumni(params.toString());
      setData(result);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchAlumni(); }, [fetchAlumni]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await secApi.updateAlumni(editAlumni.id, editAlumni);
      setEditAlumni(null);
      fetchAlumni();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    try {
      await secApi.deleteAlumni(id);
      setShowDelete(null);
      fetchAlumni();
    } catch (err) { setError(err.message); }
  };

  const alumni = data?.alumni || [];
  const pagination = data?.pagination;

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Alumni</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Alumni</a></li>
          </ul>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <form className="filter-bar" onSubmit={(e) => { e.preventDefault(); setPage(1); fetchAlumni(); }}>
          <input type="text" placeholder="Search alumni..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary"><i className='bx bx-search'></i> Search</button>
        </form>
      </div>

      <div className="table-data">
        <div className="order">
          <div className="head"><h3>Alumni List {pagination && `(${pagination.total})`}</h3></div>
          {loading ? <div className="loading">Loading...</div> : alumni.length === 0 ? (
            <div className="empty-state"><i className='bx bxs-graduation'></i><p>No alumni found</p></div>
          ) : (
            <table>
              <thead><tr><th>Name</th><th>Gender</th><th>Contact</th><th>Program</th><th>Year</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {alumni.map(a => (
                  <tr key={a.id}>
                    <td>{a.surname} {a.othernames}</td>
                    <td>{a.gender}</td>
                    <td>{a.contact || '-'}</td>
                    <td>{a.program || '-'}</td>
                    <td>{a.graduation_year || '-'}</td>
                    <td>{a.current_status || '-'}</td>
                    <td>
                      <button className="btn btn-warning" style={{ padding: '4px 10px', marginRight: 4 }} onClick={() => setEditAlumni(a)}>Edit</button>
                      <button className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => setShowDelete(a)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).slice(0, 10).map(p => (
                <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}>Next</button>
            </div>
          )}
        </div>
      </div>

      {editAlumni && (
        <div className="modal-overlay" onClick={() => setEditAlumni(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Alumni</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-group"><label>Surname</label><input value={editAlumni.surname || ''} onChange={e => setEditAlumni(a => ({ ...a, surname: e.target.value }))} /></div>
              <div className="form-group"><label>Other Names</label><input value={editAlumni.othernames || ''} onChange={e => setEditAlumni(a => ({ ...a, othernames: e.target.value }))} /></div>
              <div className="form-group"><label>Contact</label><input value={editAlumni.contact || ''} onChange={e => setEditAlumni(a => ({ ...a, contact: e.target.value }))} /></div>
              <div className="form-group"><label>Email</label><input value={editAlumni.email || ''} onChange={e => setEditAlumni(a => ({ ...a, email: e.target.value }))} /></div>
              <div className="form-group"><label>Current Status</label><input value={editAlumni.current_status || ''} onChange={e => setEditAlumni(a => ({ ...a, current_status: e.target.value }))} /></div>
              <div className="form-group"><label>Workplace</label><input value={editAlumni.workplace || ''} onChange={e => setEditAlumni(a => ({ ...a, workplace: e.target.value }))} /></div>
              <div className="form-group"><label>Graduation Year</label><input type="number" value={editAlumni.graduation_year || ''} onChange={e => setEditAlumni(a => ({ ...a, graduation_year: e.target.value }))} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-back" onClick={() => setEditAlumni(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Delete Alumni</h2>
            <p>Are you sure you want to delete <strong>{showDelete.surname} {showDelete.othernames}</strong>?</p>
            <div className="modal-actions">
              <button className="btn btn-back" onClick={() => setShowDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(showDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
