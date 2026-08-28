// LevelMembers.jsx — Shows all members in a specific education level
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { secApi } from '../api/secApi.js';

export default function LevelMembers() {
  const { level } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [membershipType, setMembershipType] = useState('');
  const [page, setPage] = useState(1);
  const [showDelete, setShowDelete] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('level', level);
      if (search) params.set('search', search);
      if (gender) params.set('gender', gender);
      if (membershipType) params.set('membership_type', membershipType);
      params.set('page', page);
      params.set('perPage', 25);
      const result = await secApi.listMembers(params.toString());
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [level, search, gender, membershipType, page]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleDelete = async (id) => {
    try {
      await secApi.deleteMember(id);
      setShowDelete(null);
      fetchMembers();
    } catch (err) { setError(err.message); }
  };

  const handleGraduate = async (id) => {
    if (!confirm('Graduate this member to alumni?')) return;
    try {
      await secApi.graduateMember(id);
      fetchMembers();
    } catch (err) { setError(err.message); }
  };

  const members = data?.members || [];
  const pagination = data?.pagination;

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Level {level}</h1>
          <ul className="breadcrumb">
            <li><a className="active" href="/members">Members</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Level {level}</a></li>
          </ul>
        </div>
        <Link to="/members" className="btn-download" style={{ background: 'var(--grey)', color: 'var(--dark)' }}>
          <i className='bx bx-arrow-back'></i> Back to Levels
        </Link>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* Search & filters */}
      <div className="card">
        <form className="filter-bar" onSubmit={(e) => { e.preventDefault(); setPage(1); fetchMembers(); }}>
          <input type="text" placeholder="Search name, contact, program..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
          <select value={gender} onChange={e => setGender(e.target.value)}>
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select value={membershipType} onChange={e => setMembershipType(e.target.value)}>
            <option value="">All Types</option>
            <option value="member">Member</option>
            <option value="associate">Associate</option>
          </select>
          <button type="submit" className="btn btn-primary"><i className='bx bx-search'></i> Search</button>
        </form>
      </div>

      {/* Member table */}
      <div className="table-data">
        <div className="order">
          <div className="head">
            <h3>Level {level} {pagination && `(${pagination.total})`}</h3>
          </div>
          {loading ? <div className="loading">Loading...</div> : members.length === 0 ? (
            <div className="empty-state">
              <i className='bx bxs-group'></i>
              <p>No members found in Level {level}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Contact</th>
                  <th>Program</th>
                  <th>Duration</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td>
                      {m.profile_image && <img src={m.profile_image} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginRight: 6 }} />}
                      {m.surname} {m.othernames}
                      {m.is_officer == 1 && <span className="badge badge-yellow" style={{ marginLeft: 8 }}>Officer</span>}
                    </td>
                    <td>{m.gender}</td>
                    <td>{m.contact || '-'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.program || '-'}</td>
                    <td>{m.program_duration || '-'}</td>
                    <td><span className={`status ${m.membership_type}`}>{m.membership_type}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Link to={`/members/${m.id}`} className="btn btn-primary" style={{ padding: '4px 10px', marginRight: 4 }}>View</Link>
                      <Link to={`/members/${m.id}/edit`} className="btn btn-warning" style={{ padding: '4px 10px', marginRight: 4 }}>Edit</Link>
                      <button onClick={() => handleGraduate(m.id)} className="btn btn-success" style={{ padding: '4px 10px', marginRight: 4 }}>Graduate</button>
                      <button onClick={() => setShowDelete(m)} className="btn btn-danger" style={{ padding: '4px 10px' }}>Delete</button>
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

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Delete Member</h2>
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
