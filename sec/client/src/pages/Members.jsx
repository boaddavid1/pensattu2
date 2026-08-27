// Members.jsx — Members grouped by education level in cards (ported from members.php)
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
  const [duration, setDuration] = useState('');

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
      if (duration) params.set('duration', duration);
      const result = await secApi.membersByLevel(params.toString());
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, gender, membershipType, hall, officer, duration]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleSearch = (e) => { e.preventDefault(); fetchMembers(); };

  const levels = data?.levels || [];
  const total = data?.total || 0;

  // Level card colors
  const levelColors = [
    { bg: 'var(--light-blue)', icon: 'var(--blue)', text: 'var(--blue)' },
    { bg: 'var(--light-yellow)', icon: 'var(--yellow)', text: '#b78c00' },
    { bg: 'var(--light-orange)', icon: 'var(--orange)', text: 'var(--orange)' },
    { bg: '#d4f5dd', icon: '#27ae60', text: '#27ae60' },
    { bg: '#f9d6d4', icon: 'var(--red)', text: 'var(--red)' },
    { bg: '#e8d5f5', icon: '#8e44ad', text: '#8e44ad' },
  ];

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

      {/* Search & filters */}
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
          <select value={duration} onChange={e => setDuration(e.target.value)}>
            <option value="">All Durations</option>
            <option value="HND">HND</option>
            <option value="B-TECH">B-TECH</option>
            <option value="Diploma">Diploma</option>
            <option value="Certificate">Certificate</option>
          </select>
          <label className="col-1">
            <input type="checkbox" checked={officer} onChange={e => setOfficer(e.target.checked)} /> Officers only
          </label>
          <button type="submit" className="btn btn-primary"><i className='bx bx-search'></i> Search</button>
        </form>
      </div>

      {/* Level cards */}
      {loading ? (
        <div className="loading">Loading members...</div>
      ) : levels.length === 0 ? (
        <div className="empty-state">
          <i className='bx bxs-group'></i>
          <p>No members found</p>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 24, marginBottom: 8, color: 'var(--dark-grey)', fontSize: 14 }}>
            {total} members across {levels.length} level{levels.length !== 1 ? 's' : ''}
          </div>
          <div className="box-info" style={{ marginTop: 12 }}>
            {levels.map((lvl, i) => {
              const colors = levelColors[i % levelColors.length];
              return (
                <li key={lvl.level} style={{ listStyle: 'none', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                  <Link to={`/members/level/${encodeURIComponent(lvl.level)}`} style={{ display: 'flex', alignItems: 'center', gap: 24, width: '100%', color: 'inherit' }}>
                    <i className='bx bxs-graduation'
                      style={{ background: colors.bg, color: colors.icon, width: 80, height: 80, borderRadius: 10, fontSize: 36, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}></i>
                    <span className="text" style={{ flex: 1 }}>
                      <h3>{lvl.count}</h3>
                      <p>Level {lvl.level}</p>
                    </span>
                    <i className='bx bx-chevron-right' style={{ fontSize: 24, color: 'var(--dark-grey)' }}></i>
                  </Link>
                </li>
              );
            })}
          </div>
        </>
      )}

    </>
  );
}
