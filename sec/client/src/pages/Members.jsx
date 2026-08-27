// Members.jsx — Member list with search, filter, pagination, graduate (ported from members.php)
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { secApi } from '../api/secApi.js';

export default function Members() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [membershipType, setMembershipType] = useState('');
  const [hall, setHall] = useState('');
  const [officer, setOfficer] = useState(false);
  const [page, setPage] = useState(1);
  const [showDelete, setShowDelete] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (gender) params.set('gender', gender);
      if (membershipType) params.set('membership_type', membershipType);
      if (hall) params.set('hall', hall);
      if (officer) params.set('officer', 'true');
      params.set('page', page);
      params.set('perPage', 20);
      const result = await secApi.listMembers(params.toString());
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, gender, membershipType, hall, officer, page]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchMembers(); };

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
          <h1>Members</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Members</a></li>
          </ul>
        </div>
        <Link to="/members/add" className="btn-download">
          <i className='bx bxs-user-plus'></i> Add Member
        </Link>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <form className="filter-bar" onSubmit={handleSearch}>
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
          <input type="text" placeholder="Hall" value={hall} onChange={e => setHall(e.target.value)} />
          <label className="col-1">
            <input type="checkbox" checked={officer} onChange={e => setOfficer(e.target.checked)} /> Officers only
          </label>
          <button type="submit" className="btn btn-primary"><i className='bx bx-search'></i> Search</button>
        </form>
      </div>

      <div className="table-data">
        <div className="order">
          <div className="head">
            <h3>Member List {pagination && `(${pagination.total})`}</h3>
          </div>
          {loading ? <div className="loading">Loading...</div> : members.length === 0 ? (
            <div className="empty-state">
              <i className='bx bxs-group'></i>
              <p>No members found</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Contact</th>
                  <th>Program</th>
                  <th>Level</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td>
                      {m.profile_image && <img src={m.profile_image} alt="" />}
                      {m.surname} {m.othernames}
                      {m.is_officer == 1 && <span className="badge badge-yellow" style={{ marginLeft: 8 }}>Officer</span>}
                    </td>
                    <td>{m.gender}</td>
                    <td>{m.contact || '-'}</td>
                    <td>{m.program || '-'}</td>
                    <td>{m.education_level || '-'}</td>
                    <td><span className={`status ${m.membership_type}`}>{m.membership_type}</span></td>
                    <td>
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
