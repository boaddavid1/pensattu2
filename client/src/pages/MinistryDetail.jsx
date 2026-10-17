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
            let parsedAssistants = [];
            if (typeof apiMatch.assistants === 'string' && apiMatch.assistants.trim()) {
              try {
                const parsed = JSON.parse(apiMatch.assistants);
                if (Array.isArray(parsed)) parsedAssistants = parsed;
              } catch {}
            } else if (Array.isArray(apiMatch.assistants)) {
              parsedAssistants = apiMatch.assistants;
            }

            let parsedActivities = [];
            if (typeof apiMatch.activities === 'string' && apiMatch.activities.trim()) {
              try {
                const parsed = JSON.parse(apiMatch.activities);
                if (Array.isArray(parsed)) parsedActivities = parsed;
              } catch {
                parsedActivities = apiMatch.activities.split('\n').filter(Boolean);
              }
            } else if (Array.isArray(apiMatch.activities)) {
              parsedActivities = apiMatch.activities;
            }

            setMinistry((prev) => {
              const base = prev || localMatch || {};
              return {
                ...base,
                ...apiMatch,
                fullDescription: apiMatch.full_description || apiMatch.fullDescription || base.fullDescription,
                responsibilities: apiMatch.responsibilities || base.responsibilities,
                idealFor: apiMatch.ideal_for || apiMatch.idealFor || base.idealFor,
                leader: apiMatch.leader_name ? {
                  name: apiMatch.leader_name,
                  role: apiMatch.leader_role || 'Ministry Leader',
                  image_url: apiMatch.leader_image || base.leader?.image_url || '/images/pensafallback-bw.png',
                  phone: apiMatch.leader_phone || base.leader?.phone || '',
                  email: apiMatch.leader_email || base.leader?.email || '',
                  bio: apiMatch.leader_bio || base.leader?.bio || '',
                } : base.leader,
                assistants: parsedAssistants.length > 0 ? parsedAssistants : base.assistants || [],
                activities: parsedActivities.length > 0 ? parsedActivities : base.activities || [],
              };
            });
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
        <h2>Department Not Found</h2>
        <p style={{ color: 'var(--ink-soft)', margin: '14px 0 24px' }}>
          We could not find the requested department or team profile.
        </p>
        <Link to="/departments-and-teams" className="btn btn-dark">
          ← Back to Departments &amp; Teams
        </Link>
      </div>
    );
  }

  const otherMinistries = ministriesData.filter((m) => m.id !== ministry.id).slice(0, 4);
  const leader = ministry.leader;
  const assistants = ministry.assistants || [];

  return (
    <main className="ministry-detail-page">
      {/* Hero Section */}
      <section className="ministry-detail-hero">
        <div className="wrap">
          <div className="ministry-detail-breadcrumbs">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link to="/departments-and-teams">Departments &amp; Teams</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{ministry.title}</span>
          </div>

          <Link to="/departments-and-teams" className="ministry-mobile-back-btn">
            &larr; Back to all departments
          </Link>

          <span className="ministry-badge">{ministry.category || 'Department'}</span>
          <h1 className="ministry-detail-title">{ministry.title}</h1>

          {ministry.meeting && (
            <div className="ministry-detail-meta-row">
              <span className="ministry-detail-meta-chip">🕒 <strong>Meeting:</strong> {ministry.meeting}</span>
              {ministry.venue && <span className="ministry-detail-meta-chip">📍 <strong>Venue:</strong> {ministry.venue}</span>}
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
              loading="lazy"
            />

            <div className="ministry-main-content">
              {/* Overview & About */}
              <h2 className="ministry-section-title">
                <span>📖</span> About This Department
              </h2>
              <p className="ministry-lead-text">
                {ministry.fullDescription || ministry.description}
              </p>

              {ministry.responsibilities && (
                <div className="ministry-info-callout">
                  <h3 className="ministry-section-title" style={{ fontSize: '17px', marginBottom: '8px' }}>
                    <span>⚡</span> Core Responsibilities
                  </h3>
                  <p>
                    {ministry.responsibilities}
                  </p>
                </div>
              )}

              {ministry.idealFor && (
                <div className="ministry-info-callout">
                  <h3 className="ministry-section-title" style={{ fontSize: '17px', marginBottom: '8px' }}>
                    <span>🎯</span> Who Should Join?
                  </h3>
                  <p>
                    {ministry.idealFor}
                  </p>
                </div>
              )}

              {/* Leadership & Assistants Section */}
              <div className="leadership-box">
                <h3 className="ministry-section-title" style={{ marginBottom: '6px' }}>
                  <span>👥</span> Department Leadership &amp; Assistants
                </h3>
                <p style={{ fontSize: '13.5px', color: '#5d7088', margin: '0 0 20px' }}>
                  Meet the leader and assistants coordinating the affairs, spiritual growth, and activities of this team.
                </p>

                {/* Primary Leader */}
                {leader && (
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--moss-deep)', display: 'block', marginBottom: '8px' }}>
                      Head Leader
                    </span>
                    <div className="leader-card-featured">
                      <img
                        src={getImageUrl(leader.image_url) || '/images/pensafallback-bw.png'}
                        alt={leader.name}
                        className="leader-avatar"
                        loading="lazy"
                      />
                      <div className="leader-info">
                        <h4>{leader.name}</h4>
                        <span className="leader-role-badge">{leader.role}</span>
                        {leader.bio && <p className="leader-bio">{leader.bio}</p>}
                        <div className="leader-contacts">
                          {leader.phone && (
                            <a href={`tel:${leader.phone.replace(/\s+/g, '')}`} className="leader-contact-pill" title="Call Leader">
                              <span>☎</span> {leader.phone}
                            </a>
                          )}
                          {leader.email && (
                            <a href={`mailto:${leader.email}`} className="leader-contact-pill" title="Email Leader">
                              <span>✉</span> {leader.email}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assistants */}
                {assistants.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--moss-deep)', display: 'block', marginBottom: '10px' }}>
                      Assistant Leaders ({assistants.length})
                    </span>
                    <div className="assistants-grid">
                      {assistants.map((ast) => (
                        <div key={ast.id || ast.name} className="assistant-card">
                          <img
                            src={getImageUrl(ast.image_url) || '/images/pensafallback-bw.png'}
                            alt={ast.name}
                            className="assistant-avatar"
                            loading="lazy"
                          />
                          <div className="assistant-info">
                            <h5>{ast.name}</h5>
                            <div className="assistant-role">{ast.role}</div>
                            {ast.phone && (
                              <a href={`tel:${ast.phone.replace(/\s+/g, '')}`} className="assistant-phone">
                                ☎ {ast.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <aside className="ministry-detail-sidebar">
            {/* Quick Overview Card */}
            <div className="ministry-sidebar-card">
              <h3 className="sidebar-card-title">
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

            {/* Get In Touch Card */}
            <div className="ministry-sidebar-touch-card">
              <h4 className="sidebar-card-title" style={{ fontSize: '16px' }}>
                Get In Touch
              </h4>
              <p className="sidebar-touch-desc">
                Have questions about {ministry.title}? Speak with the team leadership after any service or reach out through our contact page.
              </p>
              <Link to="/contact" className="btn btn-dark sidebar-touch-btn">
                Contact Fellowship &rarr;
              </Link>
            </div>

            {/* Key Regular Activities */}
            {ministry.activities && ministry.activities.length > 0 && (
              <div className="ministry-activities-card">
                <h4 className="sidebar-card-title" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🗓️</span> Key Regular Activities
                </h4>
                <ul className="activities-list">
                  {ministry.activities.map((act, index) => (
                    <li key={index} className="activity-item">
                      <span className="activity-check">✓</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Other Departments & Teams Navigation */}
            {otherMinistries.length > 0 && (
              <div className="other-dept-container">
                <h4 className="sidebar-card-title" style={{ fontSize: '15px' }}>
                  Explore Other Departments
                </h4>
                <div className="other-dept-list">
                  {otherMinistries.map((om) => (
                    <Link
                      key={om.id}
                      to={`/departments-and-teams/${om.id}`}
                      className="other-dept-link"
                    >
                      <span>{om.title}</span>
                      <span className="arrow">&rarr;</span>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/departments-and-teams"
                  className="all-dept-link"
                >
                  View All Departments &amp; Teams &rarr;
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
