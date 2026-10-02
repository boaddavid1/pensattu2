// Newbies.jsx — Newbie Registration Management for the Secretariat
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { secApi } from '../api/secApi.js';

export default function Newbies() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, pushed: 0, completed: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pushingId, setPushingId] = useState(null);

  const fetchNewbies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: 50 });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const res = await secApi.listNewbies(params.toString());
      setItems(res.items || []);
      setTotal(res.total || 0);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchNewbies();
  }, [fetchNewbies]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNewbies();
  };

  const handlePush = async (newbie) => {
    if (!window.confirm(`Push "${newbie.name}" to full membership registration?`)) return;
    setPushingId(newbie.id);
    setError('');
    setSuccess('');
    try {
      const res = await secApi.pushNewbie(newbie.id);
      setSuccess(res.message || `${newbie.name} successfully pushed!`);
      await fetchNewbies();
    } catch (err) {
      setError(err.message);
    } finally {
      setPushingId(null);
    }
  };

  const handleDelete = async (newbie) => {
    if (!window.confirm(`Are you sure you want to delete "${newbie.name}"? This cannot be undone.`)) return;
    setError('');
    setSuccess('');
    try {
      await secApi.deleteNewbie(newbie.id);
      setSuccess(`Deleted ${newbie.name}`);
      await fetchNewbies();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'pushed':
        return <span className="badge badge-blue">Pushed</span>;
      case 'completed':
        return <span className="badge badge-green">Completed</span>;
      default:
        return <span className="badge badge-yellow">Pending</span>;
    }
  };

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Newbies</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className="bx bx-chevron-right"></i></li>
            <li><a>Newbie Registrations</a></li>
          </ul>
        </div>
        <button
          type="button"
          className="btn-download"
          onClick={() => fetchNewbies()}
          disabled={loading}
          style={{ cursor: 'pointer', border: 'none' }}
        >
          <i className="bx bx-refresh"></i> Refresh
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      {/* Stat Cards */}
      <ul className="box-info">
        <li>
          <i className="bx bxs-user-pin" style={{ background: 'var(--light-blue)', color: 'var(--blue)' }}></i>
          <span className="text">
            <h3>{stats.total}</h3>
            <p>Total Newbies</p>
          </span>
        </li>
        <li>
          <i className="bx bxs-time" style={{ background: 'var(--light-yellow)', color: 'var(--yellow)' }}></i>
          <span className="text">
            <h3>{stats.pending}</h3>
            <p>Pending Review</p>
          </span>
        </li>
        <li>
          <i className="bx bxs-send" style={{ background: 'var(--light-blue)', color: 'var(--blue)' }}></i>
          <span className="text">
            <h3>{stats.pushed}</h3>
            <p>Pushed to Full Form</p>
          </span>
        </li>
        <li>
          <i className="bx bxs-check-shield" style={{ background: '#d4f5dd', color: '#27ae60' }}></i>
          <span className="text">
            <h3>{stats.completed}</h3>
            <p>Completed Membership</p>
          </span>
        </li>
      </ul>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginTop: 24 }}>
        <form className="filter-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search name, phone, residence, program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="pushed">Pushed</option>
            <option value="completed">Completed</option>
          </select>
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: 8 }}>
            <i className="bx bx-search"></i> Search
          </button>
          {(search || status) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setSearch(''); setStatus(''); setPage(1); }}
              style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--grey)' }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Newbies Table */}
      <div className="table-data" style={{ marginTop: 24 }}>
        <div className="order">
          <div className="head">
            <h3>Registered Newbies ({total})</h3>
          </div>

          {loading ? (
            <div className="loading">Loading newbies...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <i className="bx bx-user-x"></i>
              <p>No newbie registrations found.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Residence</th>
                  <th>Program</th>
                  <th>Membership</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.name}</strong>
                    </td>
                    <td>
                      <a href={`tel:${r.contact}`} style={{ color: 'var(--blue)', textDecoration: 'none' }}>
                        {r.contact}
                      </a>
                    </td>
                    <td>{r.residence}</td>
                    <td>{r.program}</td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>{r.membership}</span>
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td style={{ fontSize: 13, color: '#666' }}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {r.status === 'pending' && (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handlePush(r)}
                            disabled={pushingId === r.id}
                            style={{
                              padding: '4px 10px',
                              fontSize: 12,
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Push to full registration so the member can continue"
                          >
                            <i className="bx bx-send"></i>
                            {pushingId === r.id ? 'Pushing...' : 'Push to Reg'}
                          </button>
                        )}

                        <Link
                          to={`/members/add?newbie_id=${r.id}&contact=${encodeURIComponent(r.contact || '')}&name=${encodeURIComponent(r.name || '')}&program=${encodeURIComponent(r.program || '')}&residence=${encodeURIComponent(r.residence || '')}&membership=${encodeURIComponent(r.membership || '')}`}
                          state={{ newbie: r }}
                          className="btn"
                          style={{
                            padding: '4px 10px',
                            fontSize: 12,
                            borderRadius: 6,
                            background: 'var(--light-blue)',
                            color: 'var(--blue)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                          title="Open Add Member form pre-filled with this newbie"
                        >
                          <i className="bx bx-edit"></i> Open Form
                        </Link>

                        <button
                          type="button"
                          className="btn"
                          onClick={() => handleDelete(r)}
                          style={{
                            padding: '4px 8px',
                            fontSize: 12,
                            borderRadius: 6,
                            background: '#f9d6d4',
                            color: 'var(--red)',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          title="Delete record"
                        >
                          <i className="bx bx-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
