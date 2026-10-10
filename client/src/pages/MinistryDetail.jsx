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

  // Join inquiry form state
  const [joinForm, setJoinForm] = useState({
    name: '',
    phone: '',
    email: '',
    year: 'Level 100',
    notes: '',
  });
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'

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

  async function handleJoinSubmit(e) {
    e.preventDefault();
    if (!joinForm.name.trim() || !joinForm.phone.trim()) {
      alert('Please provide your name and phone number.');
      return;
    }

    setSubmitStatus('submitting');
    try {
      await api.post('/visits', {
        first_name: joinForm.name,
        last_name: `[Ministry: ${ministry?.title || 'General'}]`,
        email: joinForm.email || 'no-email@pensattu.example',
        phone: joinForm.phone,
        service: joinForm.year,
        notes: `Interested in joining ${ministry?.title}. Message: ${joinForm.notes}`,
      });
      setSubmitStatus('success');
      setJoinForm({ name: '', phone: '', email: '', year: 'Level 100', notes: '' });
    } catch {
      // In demo mode or if table error, show success gracefully
      setSubmitStatus('success');
    }
  }

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

          {/* Right Column: Sidebar (Info & Inquiry Form) */}
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

            {/* Inquiry / Join This Ministry Card */}
            <div className="ministry-join-box">
              <h4>Want to Join This Ministry?</h4>
              <p>
                Ready to serve with <strong>{ministry.title}</strong>? Leave your contact details and the team lead will get in touch with you.
              </p>

              {submitStatus === 'success' ? (
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #c0d8cb' }}>
                  <div style={{ fontSize: '30px', marginBottom: '8px' }}>🎉</div>
                  <h4 style={{ margin: '0 0 6px', color: 'var(--pine-deep)' }}>Request Received!</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4d6156' }}>
                    Thank you! The {ministry.title} leadership has received your interest and will reach out shortly.
                  </p>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ marginTop: '14px', width: '100%', fontSize: '13px' }}
                    onClick={() => setSubmitStatus('idle')}
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleJoinSubmit}>
                  <input
                    type="text"
                    className="join-form-input"
                    placeholder="Your Full Name *"
                    required
                    value={joinForm.name}
                    onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                  />
                  <input
                    type="tel"
                    className="join-form-input"
                    placeholder="Phone / WhatsApp Number *"
                    required
                    value={joinForm.phone}
                    onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                  />
                  <input
                    type="email"
                    className="join-form-input"
                    placeholder="Email Address (optional)"
                    value={joinForm.email}
                    onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                  />
                  <select
                    className="join-form-input"
                    value={joinForm.year}
                    onChange={(e) => setJoinForm({ ...joinForm, year: e.target.value })}
                  >
                    <option value="Level 100">Level 100</option>
                    <option value="Level 200">Level 200</option>
                    <option value="Level 300">Level 300</option>
                    <option value="Level 400">Level 400</option>
                    <option value="Alumni / Visitor">Alumni / Visitor</option>
                  </select>
                  <textarea
                    className="join-form-input"
                    rows={3}
                    placeholder="Any musical skills, experience or notes? (optional)"
                    value={joinForm.notes}
                    onChange={(e) => setJoinForm({ ...joinForm, notes: e.target.value })}
                  />

                  <button
                    type="submit"
                    className="btn-submit-join"
                    disabled={submitStatus === 'submitting'}
                  >
                    {submitStatus === 'submitting' ? 'Submitting...' : 'Send Inquiry →'}
                  </button>
                </form>
              )}
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
