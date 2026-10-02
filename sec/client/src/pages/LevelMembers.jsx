// LevelMembers.jsx — Shows all members in a specific education level
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { secApi } from '../api/secApi.js';

export default function LevelMembers() {
  const { level } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [membershipType, setMembershipType] = useState('');
  const [page, setPage] = useState(1);
  const [showDelete, setShowDelete] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [topupTarget, setTopupTarget] = useState(null);
  const [topupProgram, setTopupProgram] = useState('');
  const [topupSaving, setTopupSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showGrad400Modal, setShowGrad400Modal] = useState(false);
  const [gradCandidates, setGradCandidates] = useState([]);
  const [gradLoading, setGradLoading] = useState(false);
  const [gradSubmitting, setGradSubmitting] = useState(false);
  const [gradModalSearch, setGradModalSearch] = useState('');
  const [gradModalSelected, setGradModalSelected] = useState(new Set());

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
      setSuccessMsg('Member graduated to Alumni portal!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchMembers();
    } catch (err) { setError(err.message); }
  };

  const handlePromote = async (m) => {
    const isFinal =
      (m.program_duration === 'Diploma' && m.education_level === '200') ||
      (m.program_duration === 'HND' && m.education_level === '300') ||
      (m.education_level === '400');

    const promptText = isFinal
      ? `This member is in final year (${m.program_duration || 'degree'} Level ${m.education_level}). Move to Alumni portal?`
      : `Advance ${m.surname} ${m.othernames} to the next academic level?`;

    if (!confirm(promptText)) return;
    try {
      const res = await secApi.promoteMember(m.id);
      if (res.action === 'graduated') {
        setSuccessMsg(`Graduated ${m.surname} ${m.othernames} to Alumni portal!`);
      } else {
        setSuccessMsg(`Advanced ${m.surname} ${m.othernames} to Level ${res.newLevel}!`);
      }
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchMembers();
    } catch (err) { setError(err.message); }
  };

  const openTopupModal = (m) => {
    setTopupTarget(m);
    const orig = m.program || '';
    let autoProg = orig;
    if (/diploma/i.test(orig)) {
      autoProg = orig.replace(/diploma\s*(in)?/i, 'BTECH ').trim();
    } else if (orig && !/btech/i.test(orig)) {
      autoProg = `BTECH ${orig}`;
    } else if (!orig) {
      autoProg = 'BTECH';
    }
    setTopupProgram(autoProg);
  };

  const handleExecuteTopup = async () => {
    if (!topupTarget) return;
    setTopupSaving(true);
    try {
      await secApi.topupBTech(topupTarget.id, { program: topupProgram, level: '200' });
      setSuccessMsg(`${topupTarget.surname} ${topupTarget.othernames} transitioned to BTech Top-up (Level 200)!`);
      setTimeout(() => setSuccessMsg(''), 5000);
      setTopupTarget(null);
      fetchMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setTopupSaving(false);
    }
  };

  const openGraduate400Modal = async () => {
    setShowGrad400Modal(true);
    setGradLoading(true);
    try {
      const res = await secApi.getLevel400Candidates();
      setGradCandidates(res.candidates || []);
      const preSelected = new Set(
        (res.candidates || []).filter(c => c.recommendedToGraduate).map(c => c.id)
      );
      setGradModalSelected(preSelected);
    } catch (err) {
      setError(err.message || 'Failed to load Level 400 candidates');
    } finally {
      setGradLoading(false);
    }
  };

  const handleExecuteBatchGraduate = async () => {
    const ids = Array.from(gradModalSelected);
    if (!ids.length) {
      alert('Please select at least one member to graduate.');
      return;
    }
    if (!confirm(`Are you sure you want to graduate ${ids.length} selected member(s) to the Alumni portal?`)) {
      return;
    }
    setGradSubmitting(true);
    try {
      const res = await secApi.graduateBatch(ids);
      setSuccessMsg(res.message || `Successfully graduated ${ids.length} member(s) to the Alumni portal!`);
      setTimeout(() => setSuccessMsg(''), 5000);
      setShowGrad400Modal(false);
      setSelectedIds([]);
      fetchMembers();
    } catch (err) {
      setError(err.message || 'Failed to graduate members');
    } finally {
      setGradSubmitting(false);
    }
  };

  const toggleSelectMember = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllTableMembers = () => {
    if (selectedIds.length === members.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(members.map(m => m.id));
    }
  };

  const handleTableBatchGraduate = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Graduate the ${selectedIds.length} selected member(s) to the Alumni portal?`)) return;
    setLoading(true);
    try {
      const res = await secApi.graduateBatch(selectedIds);
      setSuccessMsg(res.message || `Graduated ${selectedIds.length} member(s) to Alumni!`);
      setTimeout(() => setSuccessMsg(''), 5000);
      setSelectedIds([]);
      fetchMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const members = data?.members || [];
  const pagination = data?.pagination;

  return (
    <>
      <div className="head-title">
        <div className="left">
          <h1>Level {level}</h1>
          <ul className="breadcrumb">
            <li><Link className="active" to="/members">Members</Link></li>
            <li><i className='bx bx-chevron-right'></i></li>
            <li><a>Level {level}</a></li>
          </ul>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {level === '400' && (
            <button
              type="button"
              className="btn-download"
              onClick={openGraduate400Modal}
              style={{ background: '#8e44ad', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              <i className='bx bxs-graduation'></i> Graduate Previous 400 to Alumni
            </button>
          )}
          <Link to="/members" className="btn-download" style={{ background: 'var(--grey)', color: 'var(--dark)' }}>
            <i className='bx bx-arrow-back'></i> Back to Levels
          </Link>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {successMsg && <div className="success-msg">{successMsg}</div>}

      {/* Search & filters */}
      <div className="card">
        <form className="filter-bar" onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); fetchMembers(); }}>
          <input type="text" placeholder="Search name, contact, program..." value={searchInput}
            onChange={e => setSearchInput(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
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

      {/* Level 400 Batch Actions Bar */}
      {level === '400' && selectedIds.length > 0 && (
        <div style={{ background: '#f5eeff', border: '1px solid #dcd0ff', padding: '10px 16px', borderRadius: 8, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#5b2c6f', fontWeight: 600 }}>
            <i className='bx bx-check-square' style={{ marginRight: 6, fontSize: 16 }}></i>
            {selectedIds.length} member(s) selected
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleTableBatchGraduate}
              style={{ background: '#8e44ad', fontSize: 13, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <i className='bx bxs-graduation'></i> Graduate Selected to Alumni
            </button>
            <button
              type="button"
              className="btn btn-back"
              onClick={() => setSelectedIds([])}
              style={{ fontSize: 13, padding: '6px 12px' }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

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
                  {level === '400' && (
                    <th style={{ width: 36, textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={members.length > 0 && selectedIds.length === members.length} 
                        onChange={selectAllTableMembers}
                        title="Select/Deselect all on this page"
                      />
                    </th>
                  )}
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
                    {level === '400' && (
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(m.id)} 
                          onChange={() => toggleSelectMember(m.id)} 
                        />
                      </td>
                    )}
                    <td>
                      {m.profile_image && <img src={m.profile_image} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginRight: 6 }} />}
                      {m.surname} {m.othernames}
                      {m.is_officer == 1 && <span className="badge badge-yellow" style={{ marginLeft: 8 }}>Officer</span>}
                      {level === '400' && m.created_at && (
                        new Date(m.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                          ? <span className="badge badge-yellow" style={{ marginLeft: 6, fontSize: 10 }}>Recent (Protected)</span>
                          : <span className="badge badge-blue" style={{ marginLeft: 6, fontSize: 10 }}>Senior Class</span>
                      )}
                    </td>
                    <td>{m.gender}</td>
                    <td>{m.contact || '-'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.program || '-'}</td>
                    <td>{m.program_duration || '-'}</td>
                    <td><span className={`status ${m.membership_type}`}>{m.membership_type}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Link to={`/members/${m.id}`} className="btn btn-primary" style={{ padding: '4px 10px', marginRight: 4 }}>View</Link>
                      <Link to={`/members/${m.id}/edit`} className="btn btn-warning" style={{ padding: '4px 10px', marginRight: 4 }}>Edit</Link>
                      {((m.program_duration || '').toLowerCase().includes('diploma') || m.education_level === '200') && (
                        <button
                          onClick={() => openTopupModal(m)}
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', marginRight: 4, background: '#2980b9' }}
                          title="Diploma student doing BTech Top-up? Click to switch to BTech continuing from Level 200"
                        >
                          BTech Top-up
                        </button>
                      )}
                      <button onClick={() => handlePromote(m)} className="btn btn-primary" style={{ padding: '4px 10px', marginRight: 4, background: '#27ae60' }} title="Advance to next level or graduate">Advance</button>
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

      {/* Manual BTech Top-up Modal */}
      {topupTarget && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => !topupSaving && setTopupTarget(null)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, color: 'var(--dark)' }}>
                <i className='bx bx-transfer' style={{ color: '#2980b9', marginRight: 8 }}></i>
                Diploma &rarr; BTech Top-up
              </h2>
              {!topupSaving && (
                <button
                  type="button"
                  onClick={() => setTopupTarget(null)}
                  style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--dark-grey)' }}
                >
                  <i className='bx bx-x'></i>
                </button>
              )}
            </div>

            <div style={{ background: '#ebf5fb', border: '1px solid #bce1f8', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: 13, lineHeight: 1.5 }}>
              <p style={{ margin: '0 0 6px', color: '#1b4f72' }}>
                <strong>{topupTarget.surname} {topupTarget.othernames}</strong> (Diploma Level {topupTarget.education_level || '200'})
              </p>
              <p style={{ margin: 0, color: '#2980b9' }}>
                Transitioning to <strong>BTech Top-up</strong> converts this student to <strong>B-TECH</strong>, continuing from <strong>Level 200</strong> instead of graduating.
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Current Program
              </label>
              <input
                type="text"
                disabled
                value={`${topupTarget.program || '-'} (Diploma)`}
                style={{ width: '100%', padding: '8px 12px', background: '#f5f5f5', borderRadius: 6, border: '1px solid var(--grey)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                New BTech Program Name *
              </label>
              <input
                type="text"
                value={topupProgram}
                onChange={e => setTopupProgram(e.target.value)}
                placeholder="e.g. BTECH Electrical Engineering"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--grey)', fontSize: 13 }}
                required
              />
              <span style={{ fontSize: 11, color: 'var(--dark-grey)', marginTop: 4, display: 'block' }}>
                The program duration will change to <strong>B-TECH</strong>.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                Continuing Academic Level
              </label>
              <input
                type="text"
                disabled
                value="Level 200 (Continues as BTech student)"
                style={{ width: '100%', padding: '8px 12px', background: '#f5f5f5', borderRadius: 6, border: '1px solid var(--grey)' }}
              />
            </div>

            <div className="modal-actions" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn btn-back"
                onClick={() => setTopupTarget(null)}
                disabled={topupSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleExecuteTopup}
                disabled={topupSaving || !topupProgram.trim()}
                style={{ background: '#2980b9', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {topupSaving ? (
                  <>
                    <i className='bx bx-loader-alt bx-spin'></i> Transitioning...
                  </>
                ) : (
                  <>
                    <i className='bx bx-check'></i> Confirm BTech Top-up
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Graduate Level 400 Candidates Modal */}
      {showGrad400Modal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-box" style={{ maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', color: '#5b2c6f' }}>
                <i className='bx bxs-graduation' style={{ color: '#8e44ad', marginRight: 8 }}></i>
                Graduate Previous Level 400 to Alumni
              </h2>
              {!gradSubmitting && (
                <button
                  type="button"
                  onClick={() => setShowGrad400Modal(false)}
                  style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--dark-grey)' }}
                >
                  <i className='bx bx-x'></i>
                </button>
              )}
            </div>

            <div style={{ background: '#f5eeff', border: '1px solid #dcd0ff', borderRadius: 8, padding: '12px 14px', marginBottom: 16, fontSize: 13 }}>
              <p style={{ margin: '0 0 6px', color: '#5b2c6f', fontWeight: 600 }}>
                Select only the previous graduating class of Level 400 to move to the Alumni portal.
              </p>
              <p style={{ margin: 0, color: '#666', fontSize: 12 }}>
                Recent members and newly promoted students are highlighted in amber and <strong>unchecked by default</strong> to prevent accidental graduation.
              </p>
            </div>

            {gradLoading ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--dark-grey)' }}>
                <i className='bx bx-loader-alt bx-spin' style={{ fontSize: 28, marginBottom: 8, display: 'block' }}></i>
                Loading Level 400 candidate analysis...
              </div>
            ) : (
              <>
                {/* Search & Selection Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="Filter candidates..."
                    value={gradModalSearch}
                    onChange={e => setGradModalSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 180, padding: '6px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12 }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        const pre = new Set(gradCandidates.filter(c => c.recommendedToGraduate).map(c => c.id));
                        setGradModalSelected(pre);
                      }}
                      style={{ fontSize: 11, padding: '4px 10px', background: '#8e44ad', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                    >
                      Select Senior Class Only
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setGradModalSelected(new Set(gradCandidates.map(c => c.id)))}
                      style={{ fontSize: 11, padding: '4px 8px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setGradModalSelected(new Set())}
                      style={{ fontSize: 11, padding: '4px 8px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Candidate list table */}
                <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #eee', borderRadius: 6, marginBottom: 16 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#fafafa', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 1 }}>
                        <th style={{ padding: '8px 10px', width: 36, textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={gradCandidates.length > 0 && gradModalSelected.size === gradCandidates.length}
                            onChange={() => {
                              if (gradModalSelected.size === gradCandidates.length) setGradModalSelected(new Set());
                              else setGradModalSelected(new Set(gradCandidates.map(c => c.id)));
                            }}
                          />
                        </th>
                        <th style={{ padding: '8px 10px', textAlign: 'left' }}>Member Name</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left' }}>Program</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>Classification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradCandidates
                        .filter(c => !gradModalSearch || c.name.toLowerCase().includes(gradModalSearch.toLowerCase()) || c.program.toLowerCase().includes(gradModalSearch.toLowerCase()))
                        .map(c => {
                          const isChecked = gradModalSelected.has(c.id);
                          return (
                            <tr
                              key={c.id}
                              style={{
                                borderBottom: '1px solid #f0f0f0',
                                background: isChecked ? '#faf5ff' : c.isRecent ? '#fffdf7' : '#fff',
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                const next = new Set(gradModalSelected);
                                if (next.has(c.id)) next.delete(c.id);
                                else next.add(c.id);
                                setGradModalSelected(next);
                              }}
                            >
                              <td style={{ padding: '8px 10px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const next = new Set(gradModalSelected);
                                    if (next.has(c.id)) next.delete(c.id);
                                    else next.add(c.id);
                                    setGradModalSelected(next);
                                  }}
                                />
                              </td>
                              <td style={{ padding: '8px 10px', fontWeight: 600 }}>
                                {c.name}
                              </td>
                              <td style={{ padding: '8px 10px', color: '#666' }}>
                                {c.program} ({c.duration})
                              </td>
                              <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                {c.isRecent ? (
                                  <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                                    Recent (Protected)
                                  </span>
                                ) : (
                                  <span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                                    Senior / Previous
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 12, color: '#555' }}>
                  <span>
                    Selected to graduate: <strong style={{ color: '#8e44ad' }}>{gradModalSelected.size}</strong> member(s)
                  </span>
                  <span>
                    Total Level 400: <strong>{gradCandidates.length}</strong>
                  </span>
                </div>

                <div className="modal-actions" style={{ marginTop: 0 }}>
                  <button
                    type="button"
                    className="btn btn-back"
                    onClick={() => setShowGrad400Modal(false)}
                    disabled={gradSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleExecuteBatchGraduate}
                    disabled={gradSubmitting || gradModalSelected.size === 0}
                    style={{ background: '#8e44ad', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    {gradSubmitting ? (
                      <>
                        <i className='bx bx-loader-alt bx-spin'></i> Moving to Alumni...
                      </>
                    ) : (
                      <>
                        <i className='bx bxs-graduation'></i> Graduate {gradModalSelected.size} to Alumni Portal
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
