// PrayerRequests.jsx — View and manage alumni prayer requests
import { useState, useEffect, useCallback } from 'react';
import { alumniApi } from '../api/alumniApi.js';

export default function PrayerRequests() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchPrayers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('page', page);
      params.set('perPage', 20);
      const result = await alumniApi.listPrayers(params.toString());
      setData(result);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => { fetchPrayers(); }, [fetchPrayers]);

  const handleMarkPrayed = async (id) => {
    try {
      await alumniApi.markPrayed(id);
      fetchPrayers();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this prayer request?')) return;
    try {
      await alumniApi.deletePrayer(id);
      fetchPrayers();
    } catch (err) { setError(err.message); }
  };

  const prayers = data?.prayers || [];
  const pagination = data?.pagination;

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Prayer Requests</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Prayer</a></li>
          </ul>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <div className="filter-bar">
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Requests</option>
            <option value="pending">Pending</option>
            <option value="prayed">Prayed</option>
          </select>
        </div>
      </div>

      <div className="table-data">
        <div className="order">
          <div className="head"><h3>Prayer Requests {pagination && `(${pagination.total})`}</h3></div>
          {loading ? <div className="loading">Loading...</div> : prayers.length === 0 ? (
            <div className="empty-state"><i className='bx bxs-message-rounded'></i><p>No prayer requests</p></div>
          ) : (
            <table>
              <thead><tr><th>Category</th><th>Prayer</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
              <tbody>
                {prayers.map(p => (
                  <tr key={p.id}>
                    <td><span className="badge badge-blue">{p.category}</span></td>
                    <td style={{ maxWidth: 400 }}>{p.prayer_text}</td>
                    <td><span className={`badge ${p.status === 'prayed' ? 'badge-green' : 'badge-yellow'}`}>{p.status}</span></td>
                    <td>{new Date(p.submitted_at).toLocaleString()}</td>
                    <td>
                      {p.status === 'pending' && (
                        <button className="btn btn-success" style={{ padding: '4px 10px', marginRight: 4 }}
                          onClick={() => handleMarkPrayed(p.id)}>Mark Prayed</button>
                      )}
                      <button className="btn btn-danger" style={{ padding: '4px 10px' }}
                        onClick={() => handleDelete(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
              <span style={{ padding: '6px 12px' }}>Page {page} of {pagination.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}>Next</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
