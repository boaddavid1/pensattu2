// Halls.jsx — Members grouped by Hall & Off-Campus Residence
import { useState, useEffect, useMemo } from 'react';
import { secApi } from '../api/secApi.js';

export default function Halls() {
  const [data, setData] = useState({
    halls: [],
    campusHalls: [],
    offCampusResidences: [],
    totalCampus: 0,
    totalOffCampus: 0,
    totalMembers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'campus' | 'offcampus'
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');

  useEffect(() => {
    secApi
      .halls()
      .then((res) => {
        setData({
          halls: res.halls || [],
          campusHalls: res.campusHalls || [],
          offCampusResidences: res.offCampusResidences || [],
          totalCampus: res.totalCampus || 0,
          totalOffCampus: res.totalOffCampus || 0,
          totalMembers: res.totalMembers || 0,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load halls and residences');
        setLoading(false);
      });
  }, []);

  // Filter residence cards based on tab and search
  const filteredList = useMemo(() => {
    let list = [];
    if (activeTab === 'campus') {
      list = data.campusHalls.length ? data.campusHalls : data.halls.filter((h) => h.type === 'campus');
    } else if (activeTab === 'offcampus') {
      list = data.offCampusResidences.length
        ? data.offCampusResidences
        : data.halls.filter((h) => h.type === 'offcampus');
    } else {
      list = data.halls;
    }

    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (item) =>
        item.hall.toLowerCase().includes(q) ||
        item.members.some(
          (m) =>
            `${m.surname} ${m.othernames}`.toLowerCase().includes(q) ||
            String(m.contact || '').includes(q)
        )
    );
  }, [data, activeTab, search]);

  const selectedResidence = useMemo(() => {
    if (!expanded) return null;
    return data.halls.find((h) => h.hall === expanded) || null;
  }, [expanded, data.halls]);

  const filteredMembers = useMemo(() => {
    if (!selectedResidence) return [];
    if (!memberSearch.trim()) return selectedResidence.members;
    const q = memberSearch.toLowerCase();
    return selectedResidence.members.filter(
      (m) =>
        `${m.surname} ${m.othernames}`.toLowerCase().includes(q) ||
        String(m.contact || '').includes(q) ||
        String(m.program || '').toLowerCase().includes(q) ||
        String(m.roomDisplay || '').toLowerCase().includes(q)
    );
  }, [selectedResidence, memberSearch]);

  if (loading) return <div className="loading">Loading halls & residences...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <>
      {/* Page Header */}
      <div className="head-title">
        <div className="left">
          <h1>Halls &amp; Residences</h1>
          <ul className="breadcrumb">
            <li><a className="active">PENSA TTU</a></li>
            <li><i className="bx bx-chevron-right"></i></li>
            <li><a>Halls &amp; Off-Campus Residences</a></li>
          </ul>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <ul className="box-info">
        <li
          style={{ cursor: 'pointer', border: activeTab === 'campus' ? '2px solid var(--blue)' : 'none' }}
          onClick={() => setActiveTab(activeTab === 'campus' ? 'all' : 'campus')}
        >
          <i className="bx bx-building" style={{ background: 'var(--light-blue)', color: 'var(--blue)' }}></i>
          <span className="text">
            <h3>{data.totalCampus}</h3>
            <p>Campus Halls ({data.campusHalls.length})</p>
          </span>
        </li>

        <li
          style={{ cursor: 'pointer', border: activeTab === 'offcampus' ? '2px solid var(--yellow)' : 'none' }}
          onClick={() => setActiveTab(activeTab === 'offcampus' ? 'all' : 'offcampus')}
        >
          <i className="bx bx-home-heart" style={{ background: 'var(--light-yellow)', color: 'var(--yellow)' }}></i>
          <span className="text">
            <h3>{data.totalOffCampus}</h3>
            <p>Off-Campus Hostels ({data.offCampusResidences.length})</p>
          </span>
        </li>

        <li
          style={{ cursor: 'pointer', border: activeTab === 'all' ? '2px solid #27ae60' : 'none' }}
          onClick={() => setActiveTab('all')}
        >
          <i className="bx bx-map-pin" style={{ background: '#d4f5dd', color: '#27ae60' }}></i>
          <span className="text">
            <h3>{data.halls.length}</h3>
            <p>Total Locations</p>
          </span>
        </li>

        <li>
          <i className="bx bxs-group" style={{ background: 'var(--light-orange)', color: 'var(--orange)' }}></i>
          <span className="text">
            <h3>{data.totalMembers}</h3>
            <p>Total Registered</p>
          </span>
        </li>
      </ul>

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ marginTop: 24, padding: 18 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('all')}
              style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.9rem' }}
            >
              All Residences ({data.halls.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'campus' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('campus')}
              style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.9rem' }}
            >
              Campus Halls ({data.campusHalls.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'offcampus' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('offcampus')}
              style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.9rem' }}
            >
              Off-Campus &amp; Hostels ({data.offCampusResidences.length})
            </button>
          </div>

          <div style={{ minWidth: 260, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search hall, hostel, or member..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px 8px 36px',
                borderRadius: 8,
                border: '1px solid #ced4da',
                fontSize: '0.9rem',
              }}
            />
            <i
              className="bx bx-search"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }}
            ></i>
          </div>
        </div>
      </div>

      {/* Residence Cards Grid */}
      <div style={{ marginTop: 20 }}>
        {filteredList.length === 0 ? (
          <div className="card" style={{ padding: 36, textAlign: 'center', color: '#6c757d' }}>
            <i className="bx bx-buildings" style={{ fontSize: 44, color: '#ccc', marginBottom: 12 }}></i>
            <p>No residences found matching your filter.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {filteredList.map((h, i) => {
              const isSelected = expanded === h.hall;
              const isCampus = h.type === 'campus';
              return (
                <div
                  key={h.hall}
                  onClick={() => {
                    setExpanded(isSelected ? null : h.hall);
                    setMemberSearch('');
                  }}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '20px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 6px 18px rgba(19, 53, 126, 0.2)' : '0 2px 6px rgba(0,0,0,0.06)',
                    border: isSelected ? '2px solid var(--blue)' : '1px solid #e9ecef',
                    borderTop: `4px solid ${isCampus ? 'var(--blue)' : '#f39c12'}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 26,
                      background: isCampus ? 'var(--light-blue)' : 'var(--light-yellow)',
                      color: isCampus ? 'var(--blue)' : '#d35400',
                      flexShrink: 0,
                    }}
                  >
                    <i className={isCampus ? 'bx bx-building' : 'bx bx-home-heart'}></i>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                          background: isCampus ? 'rgba(19, 53, 126, 0.1)' : 'rgba(243, 156, 18, 0.15)',
                          color: isCampus ? 'var(--blue)' : '#d35400',
                        }}
                      >
                        {isCampus ? 'Campus Hall' : 'Off-Campus'}
                      </span>
                    </div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--dark)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={h.hall}
                    >
                      {h.hall}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#6c757d' }}>
                      <strong style={{ color: 'var(--dark)' }}>{h.count}</strong> {h.count === 1 ? 'member' : 'members'}
                    </p>
                  </div>

                  <i
                    className={`bx ${isSelected ? 'bx-chevron-up' : 'bx-chevron-right'}`}
                    style={{ fontSize: 22, color: '#aaa' }}
                  ></i>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expanded Members Table */}
      {selectedResidence && (
        <div className="table-data" style={{ marginTop: 28 }}>
          <div className="order">
            <div
              className="head"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ margin: 0 }}>{selectedResidence.hall}</h3>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 12,
                      background: selectedResidence.type === 'campus' ? 'var(--light-blue)' : 'var(--light-yellow)',
                      color: selectedResidence.type === 'campus' ? 'var(--blue)' : '#d35400',
                    }}
                  >
                    {selectedResidence.type === 'campus' ? 'Campus Hall' : 'Off-Campus Residence'}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#6c757d' }}>
                  Showing {filteredMembers.length} of {selectedResidence.count} members registered in this residence
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Filter members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #ced4da',
                    fontSize: '0.85rem',
                    minWidth: 180,
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setExpanded(null)}
                  style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: 6 }}
                >
                  &times; Close
                </button>
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#6c757d' }}>
                No members found matching &quot;{memberSearch}&quot;.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Contact</th>
                      <th>Room / Landmark</th>
                      <th>Program</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((m, idx) => (
                      <tr key={m.id || idx}>
                        <td style={{ color: '#888', fontSize: '0.85rem' }}>{idx + 1}</td>
                        <td>
                          <strong>{m.surname} {m.othernames}</strong>
                        </td>
                        <td>
                          <span style={{ textTransform: 'capitalize' }}>{m.gender || '-'}</span>
                        </td>
                        <td>
                          {m.contact ? (
                            <a
                              href={`tel:${m.contact}`}
                              style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}
                            >
                              {m.contact}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>
                            {m.roomDisplay && m.roomDisplay !== '-' ? `Room ${m.roomDisplay}` : '-'}
                          </span>
                          {m.landmarkDisplay && (
                            <div style={{ fontSize: '0.78rem', color: '#888' }}>
                              📍 {m.landmarkDisplay}
                            </div>
                          )}
                        </td>
                        <td>{m.program || '-'}</td>
                        <td>
                          {m.education_level ? (
                            <span
                              style={{
                                background: '#f1f3f5',
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: '0.82rem',
                                fontWeight: 600,
                              }}
                            >
                              L{m.education_level}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
