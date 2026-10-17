import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api.js';
import { ministriesData } from '../data/ministriesData.js';
import './MinistryDetail.css';
import './Ministries.css';

const initialMinistries = ministriesData;

const categoryFilters = [
  'All',
  'Worship & Creative Arts',
  'Hospitality & Protocol',
  'Outreach & Evangelism',
  'Prayer & Intercession',
  'Media & Tech',
  'Care & Discipleship',
];

export default function Ministries() {
  const [ministries, setMinistries] = useState(initialMinistries);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState(null);

  // Modal join form state
  const [joinForm, setJoinForm] = useState({
    name: '',
    phone: '',
    email: '',
    year: 'Level 100',
    notes: '',
  });
  const [submitStatus, setSubmitStatus] = useState(null); // 'idle' | 'sending' | 'success' | 'error'

  useEffect(() => {
    api.get('/ministries')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = data.map((item, index) => {
            const fallbackMatch = initialMinistries.find(
              (d) => d.title.toLowerCase() === (item.title || '').toLowerCase()
            ) || initialMinistries[index % initialMinistries.length];

            return {
              ...fallbackMatch,
              ...item,
              id: item.id || fallbackMatch.id,
              title: item.title || fallbackMatch.title,
              description: item.description || fallbackMatch.description,
              image_url: item.image_url || fallbackMatch.image_url,
              category: item.category || fallbackMatch.category,
              meeting: item.meeting || fallbackMatch.meeting,
              responsibilities: item.responsibilities || fallbackMatch.responsibilities,
              idealFor: item.idealFor || fallbackMatch.idealFor,
            };
          });
          setMinistries(merged);
        }
      })
      .catch(() => {});

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSelectedMinistry(null);
        setSubmitStatus(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filteredMinistries = ministries.filter((d) => {
    const matchesCategory =
      activeCategory === 'All' || d.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      (d.category && d.category.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleOpenModal = (min) => {
    setSelectedMinistry(min);
    setSubmitStatus(null);
    setJoinForm({
      name: '',
      phone: '',
      email: '',
      year: 'Level 100',
      notes: '',
    });
  };

  const handleCloseModal = () => {
    setSelectedMinistry(null);
    setSubmitStatus(null);
  };

  const handleSubmitJoin = async (e) => {
    e.preventDefault();
    if (!joinForm.name || !joinForm.phone) return;

    setSubmitStatus('sending');
    try {
      const body = {
        name: joinForm.name,
        email: joinForm.email || 'not-provided@pensattu.org',
        message: `Topic: Joining Ministry: ${selectedMinistry.title}\nPhone: ${joinForm.phone}\nAcademic Level: ${joinForm.year}\n\nNote / Experience: ${joinForm.notes || 'None provided'}`,
      };
      await api.post('/contact', body);
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    }
  };

  return (
    <main className="departments-page ministries-page">
      {/* 1. Hero Section */}
      <section className="ministries-hero">
        <div className="ministries-hero-bg">
          <img src="/images/leadership-hero.png" alt="PENSA TTU Ministries" />
        </div>
        <div className="wrap">
          <div className="ministries-hero-inner">
            <span className="ministries-hero-badge">
              <span className="pulse-dot" />
              Departments &amp; Teams
            </span>
            <h1 className="ministries-hero-title">
              Serving with passion, <em>growing together in Christ</em>.
            </h1>
            <p className="ministries-hero-lead">
              Every department and team at PENSA TTU exists to build God's Kingdom, equip believers,
              and provide a vibrant family where your spiritual gifts find true purpose.
            </p>
            <div className="ministries-hero-stats">
              <span className="ministries-hero-pill">
                ✨ {ministries.length} Active Departments
              </span>
              <span className="ministries-hero-pill">
                👥 Open to All Academic Levels
              </span>
              <span className="ministries-hero-pill">
                🌱 Mentorship &amp; Fellowship
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter & Search Controls */}
      <section className="ministries-filter-section">
        <div className="wrap">
          <div className="ministries-filter-container">
            <div className="ministries-filter-head">
              <div className="ministries-filter-titles">
                <span className="ministries-filter-eyebrow">Find Your Calling</span>
                <h2 className="ministries-filter-heading">Explore Departments &amp; Teams</h2>
              </div>
              <div className="ministries-search-box">
                <span className="ministries-search-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="ministries-search-input"
                  placeholder="Search department, team or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search departments"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="ministries-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Horizontal Scrollable Category Pills on Mobile */}
            <div className="ministries-pills-wrapper">
              <div className="ministries-pills-scroll" role="tablist">
                {categoryFilters.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === cat}
                    className={`ministry-category-pill${activeCategory === cat ? ' active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Grid of Ministries */}
      <section className="ministries-body-section">
        <div className="wrap">
          <div className="ministries-results-bar">
            <span className="ministries-results-count">
              Showing <strong>{filteredMinistries.length}</strong> {filteredMinistries.length === 1 ? 'department or team' : 'departments & teams'}
            </span>
            {(activeCategory !== 'All' || searchQuery) && (
              <button
                type="button"
                className="ministries-reset-btn"
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              >
                Reset filters &times;
              </button>
            )}
          </div>

          <div className="ministries-cards-grid">
            {filteredMinistries.map((min) => (
              <Link
                to={`/departments-and-teams/${min.id}`}
                className="ministry-card"
                key={min.id}
              >
                <div>
                  <div className="ministry-card-cover">
                    <img
                      src={getImageUrl(min.image_url)}
                      alt={min.title}
                      className="ministry-card-img"
                      loading="lazy"
                    />
                    <div className="ministry-card-cover-overlay" />
                    <span className="ministry-card-badge">
                      {min.category}
                    </span>
                  </div>
                  <div className="ministry-card-body">
                    <h3 className="ministry-card-title">{min.title}</h3>
                    <p className="ministry-card-desc">{min.description}</p>
                    {min.meeting && (
                      <div className="ministry-card-meeting">
                        <span>🕒</span>
                        <span>{min.meeting}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ministry-card-footer">
                  <span className="ministry-card-leader" title={min.leader?.name ? `Lead: ${min.leader.name}` : 'Team leadership'}>
                    {min.leader ? `Lead: ${min.leader.name}` : 'Team Leadership'}
                  </span>
                  <span className="ministry-card-action-btn">
                    Explore details &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filteredMinistries.length === 0 && (
            <div className="ministries-empty-card">
              <div className="ministries-empty-icon">🔍</div>
              <h3>No department or team found</h3>
              <p>We couldn't find any department or team matching "{searchQuery || activeCategory}". Try searching with different keywords or clear filters.</p>
              <button
                type="button"
                className="btn btn-dark"
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. Why Serve Section */}
      <section className="ministries-values-section">
        <div className="wrap">
          <div className="section-head center">
            <span className="eyebrow">Why Serve</span>
            <h2>More than volunteering — <em>it's discipleship</em>.</h2>
            <p>
              Joining a department or team is one of the quickest ways to build deep friendships,
              discover your leadership potential, and leave a permanent mark on campus.
            </p>
          </div>
          <div className="ministries-values-grid">
            <div className="ministries-value-item">
              <div className="ministries-value-icon">🌱</div>
              <h3>Spiritual Growth</h3>
              <p>Serving pushes your faith into practical action, drawing you closer to Christ as you depend on His strength.</p>
            </div>
            <div className="ministries-value-item">
              <div className="ministries-value-icon">🤝</div>
              <h3>Deep Fellowship</h3>
              <p>Team members become lifelong friends, prayer partners, and support systems throughout your university journey.</p>
            </div>
            <div className="ministries-value-item">
              <div className="ministries-value-icon">⚡</div>
              <h3>Skill &amp; Leadership</h3>
              <p>Gain hands-on skills in leadership, public speaking, technical production, organizational planning, and care.</p>
            </div>
            <div className="ministries-value-item">
              <div className="ministries-value-icon">🌍</div>
              <h3>Kingdom Impact</h3>
              <p>Be part of life-changing encounters, touching hundreds of students and people in the Takoradi metropolis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom CTA */}
      <section className="ministries-cta-section">
        <div className="wrap">
          <div className="ministries-cta-box">
            <span className="eyebrow">Ready to take the step?</span>
            <h2 className="ministries-cta-title">
              Every member has a <em>place to belong</em>.
            </h2>
            <p className="ministries-cta-desc">
              Still unsure which department or team suits you best? Reach out to our leadership team or speak to any executive after Sunday service.
            </p>
            <div className="ministries-cta-actions">
              <Link to="/contact" className="btn btn-dark">
                Contact our leaders <span className="btn-arrow" style={{ background: 'var(--moss)', color: 'var(--pine-deep)' }}>→</span>
              </Link>
              <Link to="/leadership" className="btn btn-ghost" style={{ background: '#fff', borderColor: 'var(--line)' }}>
                Meet the Leadership Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Detail & Join Modal */}
      {selectedMinistry && (
        <div className="ministries-modal-overlay" onClick={handleCloseModal}>
          <div className="ministries-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="ministries-modal-close-btn"
              onClick={handleCloseModal}
              aria-label="Close dialog"
            >
              &times;
            </button>

            <div className="ministries-modal-hero">
              <img
                src={getImageUrl(selectedMinistry.image_url)}
                alt={selectedMinistry.title}
              />
              <div className="ministries-modal-hero-overlay">
                <div>
                  <span className="ministries-modal-cat-tag">
                    {selectedMinistry.category}
                  </span>
                  <h2 className="ministries-modal-heading">{selectedMinistry.title}</h2>
                </div>
              </div>
            </div>

            <div className="ministries-modal-body">
              {selectedMinistry.meeting && (
                <div className="ministries-modal-meeting-box">
                  <span style={{ fontSize: '20px' }}>🕒</span>
                  <div>
                    <strong>Meeting Schedule</strong>
                    <span>{selectedMinistry.meeting}</span>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '15px', color: 'var(--pine-deep)', marginBottom: '6px' }}>About This Ministry</h4>
                <p style={{ color: 'var(--ink-soft)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{selectedMinistry.description}</p>
              </div>

              {selectedMinistry.responsibilities && (
                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ fontSize: '15px', color: 'var(--pine-deep)', marginBottom: '6px' }}>Key Responsibilities</h4>
                  <p style={{ color: 'var(--ink-soft)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{selectedMinistry.responsibilities}</p>
                </div>
              )}

              {selectedMinistry.idealFor && (
                <div style={{ marginBottom: '22px' }}>
                  <h4 style={{ fontSize: '15px', color: 'var(--pine-deep)', marginBottom: '6px' }}>Ideal For</h4>
                  <p style={{ color: 'var(--ink-soft)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{selectedMinistry.idealFor}</p>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '20px 0' }} />

              <div>
                <h3 style={{ fontSize: '18px', color: 'var(--pine-deep)', marginBottom: '6px' }}>
                  Express Interest in Joining
                </h3>
                <p style={{ color: 'var(--ink-soft)', fontSize: '13.5px', marginBottom: '18px' }}>
                  Fill out this quick form and the ministry leadership will get in touch with you.
                </p>

                {submitStatus === 'success' ? (
                  <div
                    style={{
                      background: 'rgba(74, 124, 89, 0.12)',
                      border: '1px solid var(--moss)',
                      color: 'var(--pine-deep)',
                      padding: '20px',
                      borderRadius: '14px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '6px' }}>🎉</div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '17px' }}>Interest Submitted!</h4>
                    <p style={{ margin: 0, fontSize: '13.5px' }}>
                      Thank you for volunteering! A team lead will reach out to you shortly.
                    </p>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ marginTop: '16px', background: '#fff' }}
                      onClick={handleCloseModal}
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitJoin}>
                    {submitStatus === 'error' && (
                      <div style={{ background: '#fdf2f2', color: '#c53030', padding: '10px 14px', borderRadius: '8px', fontSize: '13.5px', marginBottom: '14px' }}>
                        Failed to send. Please check your internet connection or contact us directly.
                      </div>
                    )}

                    <div className="ministries-form-group">
                      <label className="ministries-form-label">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="ministries-form-input"
                        placeholder="e.g. Samuel Mensah"
                        value={joinForm.name}
                        onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                      />
                    </div>

                    <div className="ministries-form-row">
                      <div className="ministries-form-group">
                        <label className="ministries-form-label">Phone / WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          className="ministries-form-input"
                          placeholder="e.g. 0244123456"
                          value={joinForm.phone}
                          onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="ministries-form-group">
                        <label className="ministries-form-label">Academic Level</label>
                        <select
                          className="ministries-form-select"
                          value={joinForm.year}
                          onChange={(e) => setJoinForm({ ...joinForm, year: e.target.value })}
                        >
                          <option>Level 100</option>
                          <option>Level 200</option>
                          <option>Level 300</option>
                          <option>Level 400</option>
                          <option>Post-Graduate</option>
                          <option>Alumni</option>
                        </select>
                      </div>
                    </div>

                    <div className="ministries-form-group">
                      <label className="ministries-form-label">Email (Optional)</label>
                      <input
                        type="email"
                        className="ministries-form-input"
                        placeholder="you@example.com"
                        value={joinForm.email}
                        onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                      />
                    </div>

                    <div className="ministries-form-group">
                      <label className="ministries-form-label">Prior Experience or Questions (Optional)</label>
                      <textarea
                        rows={3}
                        className="ministries-form-textarea"
                        placeholder="Tell us about any instruments you play, software you use, or why you'd like to join..."
                        value={joinForm.notes}
                        onChange={(e) => setJoinForm({ ...joinForm, notes: e.target.value })}
                      />
                    </div>

                    <div className="ministries-modal-actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={handleCloseModal}
                        disabled={submitStatus === 'sending'}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitStatus === 'sending'}
                      >
                        {submitStatus === 'sending' ? 'Submitting...' : 'Submit Interest'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

