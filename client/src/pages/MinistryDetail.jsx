import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ministriesData, getMinistryByIdOrSlug } from '../data/ministriesData';
import { api, getImageUrl } from '../api';
import './MinistryDetail.css';

export default function MinistryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ministry, setMinistry] = useState(() => getMinistryByIdOrSlug(id));
  const [loading, setLoading] = useState(!ministry);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const localMatch = getMinistryByIdOrSlug(id);
    if (localMatch) {
      setMinistry(localMatch);
      setLoading(false);
    }

    // Also check backend API in case of dynamically added/updated ministries
    api.get('/ministries')
      .then((data) => {
        if (Array.isArray(data)) {
          const apiMatch = data.find((m) => String(m.id) === String(id));
          if (apiMatch) {
            setMinistry((prev) => ({
              ...(prev || localMatch || {}),
              ...apiMatch,
              leader: (prev || localMatch)?.leader || {
                name: apiMatch.leader_name || 'Ministry Leader',
                role: apiMatch.leader_role || 'Head of Department',
                image_url: apiMatch.leader_image || '/images/pensafallback-bw.png',
              },
              assistants: (prev || localMatch)?.assistants || [],
            }));
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
        <h2>Loading ministry details...</h2>
      </div>
    );
  }

  if (!ministry) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
        <h2>Ministry Not Found</h2>
        <p style={{ color: 'var(--ink-soft)', margin: '14px 0 24px' }}>
          We could not find the requested ministry or department.
        </p>
        <Link to="/ministries" className="btn btn-dark">
          ← Back to All Ministries
        </Link>
      </div>
    );
  }

  const otherMinistries = ministriesData.filter((m) => m.id !== ministry.id).slice(0, 3);
  const leader = ministry.leader;
  const assistants = ministry.assistants || [];

  return (
    <main className="ministry-detail-page">
      {/* Hero Section */}
      <section className="ministry-detail-hero">
        <div className="wrap">
          <div className="ministry-detail-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/ministries">Ministries</Link>
            <span>/</span>
            <span style={{ color: '#fff' }}>{ministry.title}</span>
          </div>

          <span className="ministry-badge">{ministry.category || 'Ministry'}</span>
          <h1 className="ministry-detail-title">{ministry.title}</h1>

          {ministry.meeting && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '14.5px', color: 'rgba(255,255,255,0.9)' }}>
              <span>🕒 <strong>Meeting:</strong> {ministry.meeting}</span>
              {ministry.venue && <span>📍 <strong>Venue:</strong> {ministry.venue}</span>}
            </div>
          )}

          {ministry.scripture && (
            <div className="ministry-detail-scripture">
              {ministry.scripture}
            </div>
          )}
        </div>
      </section>

      {/* Main Content and Sidebar */}
      <div className="wrap">
        <div className="ministry-detail-layout">
          {/* Left Column: Details & Leadership */}
          <div className="ministry-main-card">
            <img
              src={getImageUrl(ministry.image_url)}
              alt={ministry.title}
              className="ministry-cover-img"
            />

            <div className="ministry-main-content">
              {/* Overview & About */}
              <h2 className="ministry-section-title">
                <span>📖</span> About This Ministry
              </h2>
              <p className="ministry-lead-text">
                {ministry.fullDescription || ministry.description}
              </p>

              {ministry.responsibilities && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 className="ministry-section-title">
                    <span>⚡</span> Core Responsibilities
                  </h3>
                  <p style={{ color: '#44554d', fontSize: '15px', lineHeight: 1.65 }}>
                    {ministry.responsibilities}
                  </p>
                </div>
              )}

              {ministry.idealFor && (
                <div style={{ marginBottom: '36px' }}>
                  <h3 className="ministry-section-title">
                    <span>🎯</span> Who Should Join?
                  </h3>
                  <p style={{ color: '#44554d', fontSize: '15px', lineHeight: 1.65 }}>
                    {ministry.idealFor}
                  </p>
                </div>
              )}

              {/* Leadership & Assistants Section ("Assistances") */}
              <div className="leadership-box">
                <h3 className="ministry-section-title" style={{ marginBottom: '6px' }}>
                  <span>👥</span> Ministry Leadership &amp; Assistants
                </h3>
                <p style={{ fontSize: '14px', color: '#65776f', margin: '0 0 24px' }}>
                  Meet the leader and assistants coordinating the affairs, spiritual growth, and activities of this ministry.
                </p>

                {/* Primary Leader */}
                {leader && (
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--moss-deep)', display: 'block', marginBottom: '8px' }}>
                      Ministry Leader
                    </span>
                    <div className="leader-card-featured">
                      <img
                        src={getImageUrl(leader.image_url) || '/images/pensafallback-bw.png'}
                        alt={leader.name}
                        className="leader-avatar"
                      />
                      <div className="leader-info">
                        <h4>{leader.name}</h4>
                        <span className="leader-role-badge">{leader.role}</span>
                        {leader.bio && <p className="leader-bio">{leader.bio}</p>}
                        <div className="leader-contacts">
                          {leader.phone && <span>☎ {leader.phone}</span>}
                          {leader.email && <span>✉ {leader.email}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assistants / "Assistances" */}
                {assistants.length > 0 && (
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--moss-deep)', display: 'block', marginBottom: '12px' }}>
                      Assistant Leaders ({assistants.length})
                    </span>
                    <div className="assistants-grid">
                      {assistants.map((ast) => (
                        <div key={ast.id || ast.name} className="assistant-card">
                          <img
                            src={getImageUrl(ast.image_url) || '/images/pensafallback-bw.png'}
                            alt={ast.name}
                            className="assistant-avatar"
                          />
                          <div className="assistant-info">
                            <h5>{ast.name}</h5>
                            <div className="assistant-role">{ast.role}</div>
                            {ast.phone && <div className="assistant-phone">☎ {ast.phone}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Key Activities */}
              {ministry.activities && ministry.activities.length > 0 && (
                <div style={{ marginTop: '28px' }}>
                  <h3 className="ministry-section-title">
                    <span>🗓️</span> Key Regular Activities
                  </h3>
                  <ul style={{ paddingLeft: '20px', color: '#3c4e45', fontSize: '15px', lineHeight: 1.8 }}>
                    {ministry.activities.map((act, index) => (
                      <li key={index}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar (Quick Details & Contact) */}
          <aside>
            {/* Quick Overview Card */}
            <div className="ministry-sidebar-card">
              <h3 style={{ fontSize: '17px', color: 'var(--pine-deep)', margin: '0 0 16px', fontWeight: 700 }}>
                Quick Details
              </h3>

              <div className="sidebar-info-row">
                <span className="icon">🕒</span>
                <div>
                  <strong>Meeting Time</strong>
                  <span>{ministry.meeting || 'Weekly'}</span>
                </div>
              </div>

              <div className="sidebar-info-row">
                <span className="icon">📍</span>
                <div>
                  <strong>Venue</strong>
                  <span>{ministry.venue || 'Campus Auditorium'}</span>
                </div>
              </div>

              <div className="sidebar-info-row">
                <span className="icon">🏷️</span>
                <div>
                  <strong>Category</strong>
                  <span>{ministry.category || 'Fellowship Team'}</span>
                </div>
              </div>

              <div className="sidebar-info-row">
                <span className="icon">👤</span>
                <div>
                  <strong>Head Lead</strong>
                  <span>{leader?.name || 'Assigned Lead'}</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '18px', padding: '22px', border: '1px solid var(--line)', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', color: 'var(--pine-deep)', margin: '0 0 8px', fontWeight: 700 }}>
                Get In Touch
              </h4>
              <p style={{ fontSize: '13.5px', color: '#55665e', lineHeight: 1.55, margin: '0 0 16px' }}>
                Have questions about {ministry.title}? Speak with the ministry leadership after any service or reach out through our contact page.
              </p>
              <Link to="/contact" className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', fontSize: '13.5px' }}>
                Contact Fellowship &rarr;
              </Link>
            </div>

            {/* Other Ministries Navigation */}
            {otherMinistries.length > 0 && (
              <div style={{ marginTop: '24px', background: '#fff', borderRadius: '18px', padding: '20px', border: '1px solid var(--line)' }}>
                <h4 style={{ fontSize: '15px', color: 'var(--pine-deep)', marginBottom: '14px', fontWeight: 700 }}>
                  Explore Other Ministries
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {otherMinistries.map((om) => (
                    <Link
                      key={om.id}
                      to={`/ministries/${om.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: '#f8faf9',
                        textDecoration: 'none',
                        color: 'var(--pine-deep)',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        border: '1px solid #e7eee9',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#edf5ef'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#f8faf9'; }}
                    >
                      <span>{om.title}</span>
                      <span style={{ color: 'var(--moss-deep)' }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
