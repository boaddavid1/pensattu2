// Halls.jsx — Members grouped by Hall & Off-Campus Residence with Right-Hand Side Drawer
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { secApi, SEC_API_BASE } from '../api/secApi.js';

// Module-level cache for instant zero-wait rendering
let clientHallsCache = null;

export default function Halls() {
  const [data, setData] = useState(() => {
    return (
      clientHallsCache || {
        halls: [],
        campusHalls: [],
        offCampusResidences: [],
        totalCampus: 0,
        totalOffCampus: 0,
        totalMembers: 0,
      }
    );
  });
  const [loading, setLoading] = useState(() => !clientHallsCache);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'campus' | 'offcampus'
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null); // Hall/residence currently open in right-hand drawer
  const [memberSearch, setMemberSearch] = useState('');
  const [copiedPhones, setCopiedPhones] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchHalls = useCallback((force = false) => {
    if (!clientHallsCache || force) {
      setLoading(true);
    }
    setError('');
    secApi
      .halls()
      .then((res) => {
        const payload = {
          halls: res.halls || [],
          campusHalls: res.campusHalls || [],
          offCampusResidences: res.offCampusResidences || [],
          totalCampus: res.totalCampus || 0,
          totalOffCampus: res.totalOffCampus || 0,
          totalMembers: res.totalMembers || 0,
        };
        clientHallsCache = payload;
        setData(payload);
        setLoading(false);
      })
      .catch((err) => {
        if (!clientHallsCache) {
          setError(err.message || 'Failed to load halls and residences');
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  // Lock body scroll and listen for Escape key when right drawer is open
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && expanded) {
        setExpanded(null);
      }
    }
    if (expanded) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expanded]);

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

  const stats = useMemo(() => {
    if (!selectedResidence) return { total: 0, male: 0, female: 0 };
    const male = selectedResidence.members.filter((m) => String(m.gender).toLowerCase() === 'male').length;
    const female = selectedResidence.members.filter((m) => String(m.gender).toLowerCase() === 'female').length;
    return {
      total: selectedResidence.members.length,
      male,
      female,
    };
  }, [selectedResidence]);

  function handleCopyPhones() {
    if (!selectedResidence) return;
    const phones = selectedResidence.members
      .map((m) => m.contact)
      .filter(Boolean)
      .join(', ');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phones);
      setCopiedPhones(true);
      setTimeout(() => setCopiedPhones(false), 2500);
    }
  }

  if (loading) return <div className="loading">Loading halls & residences...</div>;
  if (error) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center', margin: '40px auto', maxWidth: 480 }}>
        <i className="bx bx-error-circle" style={{ fontSize: 48, color: '#e74c3c', marginBottom: 12 }}></i>
        <h3 style={{ marginBottom: 8, color: 'var(--dark)' }}>Unable to load halls</h3>
        <p style={{ color: '#6c757d', marginBottom: 20 }}>{error}</p>
        <button className="btn btn-primary" onClick={() => fetchHalls(true)} style={{ margin: '0 auto' }}>
          <i className="bx bx-refresh"></i> Retry
        </button>
      </div>
    );
  }

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
            {filteredList.map((h) => {
              const isSelected = expanded === h.hall;
              const isCampus = h.type === 'campus';
              return (
                <div
                  key={h.hall}
                  onClick={() => {
                    setExpanded(h.hall);
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
                    boxShadow: isSelected ? '0 6px 20px rgba(19, 53, 126, 0.25)' : '0 2px 6px rgba(0,0,0,0.06)',
                    border: isSelected ? '2px solid var(--blue)' : '1px solid #e9ecef',
                    borderTop: `4px solid ${isCampus ? 'var(--blue)' : '#f39c12'}`,
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--blue)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>View</span>
                    <i className="bx bx-right-arrow-alt" style={{ fontSize: 20 }}></i>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Right-Hand Side Drawer / Slide-Over Panel ─── */}
      {selectedResidence && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setExpanded(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(3px)',
              zIndex: 9998,
              transition: 'opacity 0.25s ease',
            }}
          />

          {/* Drawer Container */}
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 640,
              maxWidth: '92vw',
              background: '#ffffff',
              zIndex: 9999,
              boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInFromRight 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '24px 24px 18px',
                borderBottom: '1px solid #e9ecef',
                background: '#f8f9fa',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 26,
                      background: selectedResidence.type === 'campus' ? 'var(--light-blue)' : 'var(--light-yellow)',
                      color: selectedResidence.type === 'campus' ? 'var(--blue)' : '#d35400',
                      flexShrink: 0,
                    }}
                  >
                    <i className={selectedResidence.type === 'campus' ? 'bx bx-building' : 'bx bx-home-heart'}></i>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                          background:
                            selectedResidence.type === 'campus'
                              ? 'rgba(19, 53, 126, 0.12)'
                              : 'rgba(243, 156, 18, 0.18)',
                          color: selectedResidence.type === 'campus' ? 'var(--blue)' : '#d35400',
                        }}
                      >
                        {selectedResidence.type === 'campus' ? 'Campus Hall' : 'Off-Campus Residence'}
                      </span>
                    </div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: '1.35rem',
                        fontWeight: 700,
                        color: 'var(--dark)',
                        lineHeight: 1.25,
                      }}
                    >
                      {selectedResidence.hall}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded(null)}
                  style={{
                    background: '#fff',
                    border: '1px solid #ced4da',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    cursor: 'pointer',
                    color: '#6c757d',
                    transition: 'all 0.15s ease',
                  }}
                  title="Close panel (Esc)"
                >
                  &times;
                </button>
              </div>

              {/* Quick Summary Pill Badges */}
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: '#fff',
                    border: '1px solid #dee2e6',
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--dark)',
                  }}
                >
                  👥 {stats.total} Total Members
                </span>
                <span
                  style={{
                    background: '#e3f2fd',
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#1976d2',
                  }}
                >
                  ♂ {stats.male} Male
                </span>
                <span
                  style={{
                    background: '#fce4ec',
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#c2185b',
                  }}
                >
                  ♀ {stats.female} Female
                </span>
              </div>
            </div>

            {/* Drawer Search & Action Bar */}
            <div
              style={{
                padding: '14px 24px',
                borderBottom: '1px solid #f1f3f5',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                background: '#fff',
              }}
            >
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search in this residence (name, phone, room, program)..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    borderRadius: 8,
                    border: '1px solid #ced4da',
                    fontSize: '0.88rem',
                  }}
                />
                <i
                  className="bx bx-search"
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#999' }}
                ></i>
                {memberSearch && (
                  <button
                    type="button"
                    onClick={() => setMemberSearch('')}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                    }}
                  >
                    &times;
                  </button>
                )}
              </div>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCopyPhones}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                }}
                title="Copy all contacts in this residence for broadcast"
              >
                <i className={`bx ${copiedPhones ? 'bx-check' : 'bx-copy'}`}></i>{' '}
                {copiedPhones ? 'Copied!' : 'Copy Numbers'}
              </button>
            </div>

            {/* Drawer Body — Scrollable Member List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '18px 24px',
                background: '#fcfcfd',
              }}
            >
              {filteredMembers.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#6c757d' }}>
                  <i className="bx bx-search-alt" style={{ fontSize: 40, color: '#ccc', marginBottom: 8 }}></i>
                  <p style={{ margin: 0 }}>No members found matching &quot;{memberSearch}&quot;</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredMembers.map((m, idx) => {
                    const photoSrc = m.photo_url || (m.has_photo ? `${SEC_API_BASE}/members/${m.id}/photo` : null);
                    return (
                    <div
                      key={m.id || idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e9ecef',
                        borderRadius: 12,
                        padding: '14px 16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        display: 'flex',
                        gap: 14,
                        alignItems: 'flex-start',
                        transition: 'box-shadow 0.15s ease',
                      }}
                    >
                      {/* Member Photo / Avatar */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        {photoSrc ? (
                          <img
                            src={photoSrc}
                            alt={`${m.surname} ${m.othernames}`}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }
                            }}
                            onClick={() =>
                              setPreviewImage({
                                url: photoSrc,
                                name: `${m.surname} ${m.othernames}`,
                                program: m.program,
                                room: m.roomDisplay,
                                contact: m.contact,
                              })
                            }
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid var(--blue)',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              display: 'block',
                            }}
                            title="Click to enlarge photo"
                          />
                        ) : null}
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            background:
                              String(m.gender).toLowerCase() === 'female' ? '#fce4ec' : 'var(--light-blue)',
                            color:
                              String(m.gender).toLowerCase() === 'female' ? '#c2185b' : 'var(--blue)',
                            display: photoSrc ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            border: '2px solid #e9ecef',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                          }}
                        >
                          {`${m.surname?.[0] || ''}${m.othernames?.[0] || ''}`.toUpperCase() || (
                            <i className="bx bx-user" />
                          )}
                        </div>
                      </div>

                      {/* Member Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: 10,
                            marginBottom: 6,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: '#f1f3f5',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#6c757d',
                              }}
                            >
                              {idx + 1}
                            </span>
                            <strong style={{ fontSize: '1rem', color: 'var(--dark)' }}>
                              {m.surname} {m.othernames}
                            </strong>
                          </div>

                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 4,
                                background:
                                  String(m.gender).toLowerCase() === 'female' ? '#fce4ec' : '#e3f2fd',
                                color: String(m.gender).toLowerCase() === 'female' ? '#c2185b' : '#1976d2',
                                textTransform: 'capitalize',
                              }}
                            >
                              {m.gender || '-'}
                            </span>
                            {m.education_level && (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  background: '#f8f9fa',
                                  border: '1px solid #e9ecef',
                                  color: '#495057',
                                }}
                              >
                                L{m.education_level}
                              </span>
                            )}
                            {m.id && (
                              <Link
                                to={`/members/${m.id}`}
                                target="_blank"
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--blue)',
                                  textDecoration: 'none',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  background: 'rgba(19, 53, 126, 0.08)',
                                  fontWeight: 600,
                                }}
                                title="Open full member profile"
                              >
                                View ↗
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Room & Contact Row */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 8,
                            fontSize: '0.88rem',
                            color: '#555',
                            marginBottom: 6,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                background: 'rgba(19, 53, 126, 0.08)',
                                color: 'var(--blue)',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 6,
                                fontSize: '0.82rem',
                              }}
                            >
                              🚪 {m.roomDisplay && m.roomDisplay !== '-' ? `Room ${m.roomDisplay}` : 'Room unassigned'}
                            </span>
                            {m.landmarkDisplay && (
                              <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                📍 {m.landmarkDisplay}
                              </span>
                            )}
                          </div>

                          <div>
                            {m.contact ? (
                              <a
                                href={`tel:${m.contact}`}
                                style={{
                                  color: 'var(--blue)',
                                  textDecoration: 'none',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  background: '#f8f9fa',
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  border: '1px solid #e9ecef',
                                  fontSize: '0.84rem',
                                }}
                              >
                                <i className="bx bx-phone"></i> {m.contact}
                              </a>
                            ) : (
                              <span style={{ color: '#aaa', fontSize: '0.82rem' }}>No phone</span>
                            )}
                          </div>
                        </div>

                        {/* Program */}
                        {m.program && (
                          <div style={{ fontSize: '0.82rem', color: '#6c757d' }}>
                            🎓 {m.program}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #e9ecef',
                background: '#f8f9fa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                Showing <strong>{filteredMembers.length}</strong> of{' '}
                <strong>{selectedResidence.count}</strong> members
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setExpanded(null)}
                style={{ padding: '8px 18px', borderRadius: 8, fontSize: '0.88rem' }}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </>
      )}

      {/* Enlarged Photo Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            }}
          >
            <img
              src={previewImage.url}
              alt={previewImage.name}
              style={{
                width: '100%',
                maxHeight: 380,
                objectFit: 'cover',
                borderRadius: 12,
                border: '1px solid #e9ecef',
              }}
            />
            <h3 style={{ margin: '14px 0 4px', color: 'var(--dark)' }}>{previewImage.name}</h3>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>{previewImage.program || ''}</p>
            {previewImage.room && previewImage.room !== '-' && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 8,
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: 'var(--light-blue)',
                  color: 'var(--blue)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                🚪 Room {previewImage.room}
              </span>
            )}
            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPreviewImage(null)}
                style={{ padding: '8px 24px', borderRadius: 8 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS animation for the right drawer */}
      <style>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
