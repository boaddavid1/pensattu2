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

  // Promotion modal state
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [promoting, setPromoting] = useState(false);
  const [promoteResult, setPromoteResult] = useState(null);
  const [promoteError, setPromoteError] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [previewSearch, setPreviewSearch] = useState('');
  const [showPreviewList, setShowPreviewList] = useState(false);
  const [topupTarget, setTopupTarget] = useState(null);
  const [topupProgram, setTopupProgram] = useState('');
  const [topupSaving, setTopupSaving] = useState(false);
  const [topupNotice, setTopupNotice] = useState('');

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

  const openPromoteModal = async () => {
    setShowPromoteModal(true);
    setPromoteResult(null);
    setPromoteError('');
    setConfirmChecked(false);
    setPreviewLoading(true);
    try {
      const res = await secApi.getPromotionPreview();
      setPreviewData(res);
    } catch (err) {
      setPromoteError(err.message || 'Failed to load promotion preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExecutePromote = async () => {
    if (!confirmChecked) return;
    setPromoting(true);
    setPromoteError('');
    try {
      const res = await secApi.promoteMembers();
      setPromoteResult(res);
      fetchMembers(); // refresh level counts
    } catch (err) {
      setPromoteError(err.message || 'Failed to advance member levels');
    } finally {
      setPromoting(false);
    }
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
    setPromoteError('');
    try {
      await secApi.topupBTech(topupTarget.id, { program: topupProgram, level: '200' });
      setTopupNotice(`${topupTarget.name} converted to BTech Top-up (Level 200)!`);
      setTimeout(() => setTopupNotice(''), 5000);
      setTopupTarget(null);
      // Refresh preview data
      const res = await secApi.getPromotionPreview();
      setPreviewData(res);
      fetchMembers();
    } catch (err) {
      setPromoteError(err.message || 'Failed to convert member to BTech Top-up');
    } finally {
      setTopupSaving(false);
    }
  };

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
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-download"
            onClick={openPromoteModal}
            style={{ background: '#27ae60', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            <i className='bx bx-trending-up'></i> Move to Next Level
          </button>
          <Link to="/members/add" className="btn-download">
            <i className='bx bxs-user-plus'></i> Add Member
          </Link>
        </div>
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

      {/* Promotion Modal */}
      {showPromoteModal && (
        <div className="modal-overlay" onClick={() => !promoting && setShowPromoteModal(false)}>
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 800, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className='bx bx-trending-up' style={{ color: '#27ae60' }}></i>
                Advance Members to Next Level
              </h2>
              {!promoting && (
                <button
                  type="button"
                  onClick={() => setShowPromoteModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--dark-grey)' }}
                >
                  <i className='bx bx-x'></i>
                </button>
              )}
            </div>

            {/* Progression Rules Card */}
            <div style={{ background: 'var(--grey)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
              <strong style={{ display: 'block', marginBottom: 6, color: 'var(--dark)' }}>
                <i className='bx bx-info-circle' style={{ marginRight: 6, color: 'var(--blue)' }}></i>
                Academic Level & Graduation Rules:
              </strong>
              <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--dark-grey)' }}>
                <li><strong>Diploma (2 Years):</strong> Level 100 &rarr; 200, Level 200 &rarr; <em>Graduates to Alumni Portal</em> (or click <strong>BTech Top-up</strong> below to manually change program to BTECH and continue from Level 200).</li>
                <li><strong>HND (3 Years):</strong> Level 100 &rarr; 200, Level 200 &rarr; 300, Level 300 &rarr; <em>Graduates to Alumni Portal</em></li>
                <li><strong>BTECH (4 Years):</strong> Level 100 &rarr; 200, Level 200 &rarr; 300, Level 300 &rarr; 400, Level 400 &rarr; <em>Graduates to Alumni Portal</em></li>
                <li>Graduated members are automatically recorded in the <strong>Alumni Portal</strong> and archived from undergraduate level lists.</li>
              </ul>
            </div>

            {topupNotice && (
              <div style={{ background: '#d4f5dd', color: '#1e8449', border: '1px solid #a9dfbf', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className='bx bx-check-circle' style={{ fontSize: 18 }}></i> {topupNotice}
              </div>
            )}

            {promoteError && <div className="error-msg" style={{ marginBottom: 16 }}>{promoteError}</div>}

            {promoteResult ? (
              <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                <i className='bx bxs-check-circle' style={{ fontSize: 56, color: '#27ae60', marginBottom: 12, display: 'inline-block' }}></i>
                <h3 style={{ marginBottom: 8, color: 'var(--dark)' }}>Level Progression Complete!</h3>
                <p style={{ color: 'var(--dark-grey)', marginBottom: 20, fontSize: 14 }}>
                  Successfully advanced <strong>{promoteResult.promoted}</strong> member(s) to the next level, and moved <strong>{promoteResult.graduated}</strong> final-year member(s) to the Alumni portal.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => { setShowPromoteModal(false); setPromoteResult(null); }}
                  >
                    Done
                  </button>
                  <Link
                    to="/alumni"
                    className="btn btn-download"
                    style={{ background: '#27ae60', color: '#fff' }}
                  >
                    <i className='bx bxs-graduation'></i> View Alumni Portal
                  </Link>
                </div>
              </div>
            ) : previewLoading ? (
              <div className="loading" style={{ padding: '30px 0', textAlign: 'center' }}>
                <i className='bx bx-loader-alt bx-spin' style={{ fontSize: 32, display: 'block', marginBottom: 8 }}></i>
                Analyzing member records & program durations...
              </div>
            ) : previewData ? (
              <>
                {/* Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                  <div style={{ background: '#e8f4fd', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--blue)' }}>
                      {previewData.summary?.promotions?.total || 0}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--dark-grey)', marginTop: 4 }}>
                      Total Advancing Levels
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--dark-grey)', marginTop: 6 }}>
                      100&rarr;200: <strong>{previewData.summary?.promotions?.['100_to_200'] || 0}</strong> | 
                      200&rarr;300: <strong>{previewData.summary?.promotions?.['200_to_300'] || 0}</strong> | 
                      300&rarr;400: <strong>{previewData.summary?.promotions?.['300_to_400'] || 0}</strong>
                    </div>
                  </div>

                  <div style={{ background: '#d4f5dd', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#27ae60' }}>
                      {previewData.summary?.graduations?.total || 0}
                    </div>
                    <div style={{ fontSize: 12, color: '#1e8449', marginTop: 4 }}>
                      Graduating to Alumni
                    </div>
                    <div style={{ fontSize: 11, color: '#1e8449', marginTop: 6 }}>
                      Diploma 200: <strong>{previewData.summary?.graduations?.diploma_200 || 0}</strong> | 
                      HND 300: <strong>{previewData.summary?.graduations?.hnd_300 || 0}</strong> | 
                      BTECH 400: <strong>{previewData.summary?.graduations?.btech_400 || 0}</strong>
                    </div>
                  </div>

                  <div style={{ background: 'var(--grey)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--dark)' }}>
                      {previewData.summary?.totalActive || 0}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--dark-grey)', marginTop: 4 }}>
                      Total Active Members
                    </div>
                    {previewData.summary?.skipped > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 6 }}>
                        {previewData.summary.skipped} skipped (unspecified level)
                      </div>
                    )}
                  </div>
                </div>

                {/* Collapsible Member Preview List */}
                <div style={{ border: '1px solid var(--grey)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
                  <div
                    onClick={() => setShowPreviewList(!showPreviewList)}
                    style={{
                      background: 'var(--light)',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderBottom: showPreviewList ? '1px solid var(--grey)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)' }}>
                      <i className='bx bx-list-ul' style={{ marginRight: 6 }}></i>
                      Preview Affected Members ({previewData.previewList?.length || 0})
                    </span>
                    <i className={`bx bx-chevron-${showPreviewList ? 'up' : 'down'}`} style={{ fontSize: 20 }}></i>
                  </div>

                  {showPreviewList && (
                    <div style={{ padding: 12, maxHeight: 220, overflowY: 'auto' }}>
                      <input
                        type="text"
                        placeholder="Filter preview by name, program, level..."
                        value={previewSearch}
                        onChange={e => setPreviewSearch(e.target.value)}
                        style={{ width: '100%', padding: '6px 12px', fontSize: 12, borderRadius: 6, border: '1px solid var(--grey)', marginBottom: 8 }}
                      />
                      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--grey)', color: 'var(--dark-grey)' }}>
                            <th style={{ padding: '6px 4px' }}>Name</th>
                            <th style={{ padding: '6px 4px' }}>Program</th>
                            <th style={{ padding: '6px 4px' }}>Duration</th>
                            <th style={{ padding: '6px 4px' }}>Current</th>
                            <th style={{ padding: '6px 4px' }}>Action & Target</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(previewData.previewList || [])
                            .filter(m => {
                              if (!previewSearch) return true;
                              const q = previewSearch.toLowerCase();
                              return (
                                m.name.toLowerCase().includes(q) ||
                                m.program.toLowerCase().includes(q) ||
                                m.duration.toLowerCase().includes(q) ||
                                m.currentLevel.toLowerCase().includes(q)
                              );
                            })
                            .slice(0, 100)
                            .map(m => (
                              <tr key={m.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '6px 4px', fontWeight: 500 }}>{m.name}</td>
                                <td style={{ padding: '6px 4px', color: 'var(--dark-grey)' }}>{m.program}</td>
                                <td style={{ padding: '6px 4px' }}>{m.duration}</td>
                                <td style={{ padding: '6px 4px' }}>Level {m.currentLevel}</td>
                                <td style={{ padding: '6px 4px' }}>
                                  {m.action === 'graduate' ? (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                      <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <i className='bx bxs-graduation'></i> Graduate &rarr; Alumni
                                      </span>
                                      {(m.duration || '').toLowerCase().includes('diploma') && (
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); openTopupModal(m); }}
                                          style={{
                                            padding: '2px 8px',
                                            fontSize: 11,
                                            borderRadius: 4,
                                            border: '1px solid #2980b9',
                                            background: '#ebf5fb',
                                            color: '#2980b9',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 3,
                                          }}
                                          title="Doing BTech Top-up? Click to switch program to BTECH and continue from Level 200"
                                        >
                                          <i className='bx bx-transfer'></i> BTech Top-up
                                        </button>
                                      )}
                                    </div>
                                  ) : m.action === 'promote' ? (
                                    <span className="badge badge-yellow">
                                      &rarr; Level {m.targetLevel}
                                    </span>
                                  ) : (
                                    <span className="badge" style={{ background: '#eee', color: '#666' }}>
                                      Skipped ({m.reason || 'unspecified'})
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Confirmation Checkbox */}
                <div style={{ background: '#fff9e6', border: '1px solid #ffeaa7', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#855700' }}>
                    <input
                      type="checkbox"
                      checked={confirmChecked}
                      onChange={e => setConfirmChecked(e.target.checked)}
                      style={{ marginTop: 2 }}
                    />
                    <span>
                      I confirm that I want to advance all eligible members to their next academic level. Final-year students (Diploma 200, HND 300, BTECH 400) will be automatically graduated and moved to the Alumni portal.
                    </span>
                  </label>
                </div>

                {/* Modal Actions */}
                <div className="modal-actions" style={{ marginTop: 0 }}>
                  <button
                    type="button"
                    className="btn btn-back"
                    onClick={() => setShowPromoteModal(false)}
                    disabled={promoting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleExecutePromote}
                    disabled={!confirmChecked || promoting}
                    style={{
                      background: confirmChecked ? '#27ae60' : 'var(--grey)',
                      color: confirmChecked ? '#fff' : 'var(--dark-grey)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {promoting ? (
                      <>
                        <i className='bx bx-loader-alt bx-spin'></i> Advancing Levels...
                      </>
                    ) : (
                      <>
                        <i className='bx bx-check-circle'></i> Confirm & Move Levels
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : null}
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
                <strong>{topupTarget.name}</strong> has completed Diploma Level 200.
              </p>
              <p style={{ margin: 0, color: '#2980b9' }}>
                Transitioning to <strong>BTech Top-up</strong> keeps this member active in the student directory, continuing from <strong>Level 200</strong> instead of graduating to the Alumni portal.
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
    </>
  );
}
