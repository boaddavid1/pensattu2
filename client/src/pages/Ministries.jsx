import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api.js';

const initialMinistries = [
  {
    id: 1,
    title: 'Music & Worship Ministry',
    category: 'Worship & Creative Arts',
    meeting: 'Saturdays, 3:00 PM',
    description: 'Musicians, vocalists, and choir members leading the congregation into deep, heartfelt worship and praise every Sunday and during special services.',
    responsibilities: 'Praise & worship leading, instrumental training, choir rehearsals, and musical arrangement.',
    idealFor: 'Singers, keyboardists, drummers, bassists, and anyone with a passion for music and praise.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 2,
    title: 'Organizing & Ushering Ministry',
    category: 'Hospitality & Protocol',
    meeting: 'Sundays, 6:00 AM',
    description: 'The first smile you see at PENSA TTU. Welcoming members, coordinating seating, handling offering collections, and creating a warm, orderly environment.',
    responsibilities: 'Auditorium setup, welcoming worshippers, seating protocol, order of service coordination, and hospitality.',
    idealFor: 'Friendly, hospitable, and detail-oriented people who love serving behind the scenes.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 3,
    title: 'Evangelism & Outreach Ministry',
    category: 'Outreach & Evangelism',
    meeting: 'Saturdays, 7:00 AM',
    description: 'Taking the Gospel beyond the church walls. Spearheading campus room-to-room evangelism, outreach to secondary schools, and rural community missions.',
    responsibilities: 'Room-to-room outreach, high school missions, tract distribution, and follow-up with new converts.',
    idealFor: 'Passionate believers with a burning heart to win souls for Christ and share the Gospel.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 4,
    title: 'Prayer & Intercessory Ministry',
    category: 'Prayer & Intercession',
    meeting: 'Fridays, 8:00 PM',
    description: 'The powerhouse of the fellowship. Standing in the gap through prayer vigils, fasting, chain prayers, and seeking God’s presence for the campus and nation.',
    responsibilities: 'Leading morning devotionals, organizing prayer vigils, intercessory chains, and personal prayer ministry.',
    idealFor: 'Anyone with a burden for prayer, spiritual alertness, and interceding for others.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 5,
    title: 'Media & Publicity Ministry',
    category: 'Media & Tech',
    meeting: 'Saturdays, 10:00 AM',
    description: 'Crafting the visual and digital story of PENSA TTU through livestreaming, social media content, photography, graphic design, and video production.',
    responsibilities: 'Photography, videography, livestreaming Sunday services, flyer and social graphics design, and social media management.',
    idealFor: 'Photographers, videographers, graphic designers, copywriters, and content creators.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 6,
    title: 'Bible Studies & Discipleship Ministry',
    category: 'Care & Discipleship',
    meeting: 'Wednesdays, 5:30 PM',
    description: 'Fostering biblical literacy and spiritual growth through structured cell group meetings, syllabus drafting, and discipleship mentoring.',
    responsibilities: 'Curating study materials, training cell leaders, organizing Bible quizzes, and mentoring new believers.',
    idealFor: 'Enthusiastic students of the Word who love teaching, discussing scripture, and discipling others.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 7,
    title: 'Counseling & Welfare Ministry',
    category: 'Care & Discipleship',
    meeting: 'Tuesdays, 4:00 PM',
    description: 'Ensuring no member walks alone. Providing compassionate pastoral care, emotional support, welfare assistance, and hospital and hostel visits.',
    responsibilities: 'Welfare distribution, hospital visits, peer counseling, academic encouragement, and follow-ups.',
    idealFor: 'Good listeners, empathetic hearts, and anyone with a gift of compassion and care.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 8,
    title: 'Creative Arts & Choreography Ministry',
    category: 'Worship & Creative Arts',
    meeting: 'Fridays, 4:00 PM',
    description: 'Communicating the timeless Gospel through choreography, drama, poetry, spoken word, and creative stage performances during services and events.',
    responsibilities: 'Stage acting, dance and choreography choreography, spoken word poetry, and scriptwriting.',
    idealFor: 'Actors, dancers, spoken-word artists, and creative performers.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 9,
    title: 'Technical & Sound Engineering Ministry',
    category: 'Media & Tech',
    meeting: 'Sundays, 5:45 AM',
    description: 'Powering the sound, projection, and lighting that make our worship services smooth, audible, and immersive.',
    responsibilities: 'Audio mixing, microphone management, projector displays, hymn presentation, and equipment maintenance.',
    idealFor: 'Tech enthusiasts, sound lovers, and anyone who wants to learn live audio production.',
    image_url: '/images/pensafallback-bw.png',
  },
];

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
    <main className="departments-page">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="page-hero-bg">
          <img src="/images/leadership-hero.png" alt="PENSA TTU Ministries" />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">Ministries &bull; Departments &amp; Teams</span>
          <h1>Serving with passion, <em>growing together in Christ</em>.</h1>
          <p>
            Every ministry and team at PENSA TTU exists to build God's Kingdom, equip believers,
            and provide a vibrant family where your spiritual gifts find true purpose.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="filters" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="wrap">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '36px 0 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: '8px' }}>Find Your Fit</span>
                <h2 style={{ fontSize: '28px', color: 'var(--pine-deep)' }}>Explore Our Ministries</h2>
              </div>
              <div style={{ minWidth: '260px', maxWidth: '380px', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Search ministry or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: '100px',
                    border: '1px solid var(--line)',
                    background: '#fff',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="filter-row" style={{ padding: '0', gap: '8px' }}>
              {categoryFilters.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`pill${activeCategory === cat ? ' active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Ministries */}
      <section className="services" style={{ background: 'var(--paper)', paddingTop: '50px' }}>
        <div className="wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <p style={{ color: 'var(--ink-soft)', fontSize: '15px' }}>
              Showing <strong>{filteredMinistries.length}</strong> {filteredMinistries.length === 1 ? 'ministry' : 'ministries'}
            </p>
            {activeCategory !== 'All' && (
              <button
                type="button"
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--moss-deep)',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Reset filters &times;
              </button>
            )}
          </div>

          <div className="service-grid" style={{ marginTop: '0', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {filteredMinistries.map((min) => (
              <div
                className="service-card"
                key={min.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '20px',
                  background: '#fff',
                  border: '1px solid var(--line)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                }}
              >
                <div>
                  <div className="img" style={{ position: 'relative', height: '200px' }}>
                    <img
                      src={getImageUrl(min.image_url)}
                      alt={min.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '14px',
                        left: '14px',
                        background: 'rgba(25, 45, 36, 0.88)',
                        color: 'var(--paper)',
                        padding: '4px 12px',
                        borderRadius: '100px',
                        fontSize: '12px',
                        fontWeight: '600',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {min.category}
                    </span>
                  </div>
                  <div className="body" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '19px', color: 'var(--pine-deep)', marginBottom: '8px' }}>{min.title}</h3>
                    <p style={{ color: 'var(--ink-soft)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
                      {min.description}
                    </p>
                    {min.meeting && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--moss-deep)', fontWeight: '600', marginBottom: '14px' }}>
                        <span>🕒 Meeting Time:</span>
                        <span>{min.meeting}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ padding: '0 24px 24px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleOpenModal(min)}
                  >
                    Join Ministry &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredMinistries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '20px', border: '1px solid var(--line)' }}>
              <h3 style={{ fontSize: '20px', color: 'var(--pine-deep)', marginBottom: '8px' }}>No ministry found</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14.5px', marginBottom: '20px' }}>
                We couldn't find any ministry matching your current filter or search criteria.
              </p>
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

      {/* Why Serve Section */}
      <section className="values" style={{ background: '#fff' }}>
        <div className="wrap">
          <div className="section-head center">
            <span className="eyebrow">Why Serve</span>
            <h2>More than volunteering — <em>it's discipleship</em>.</h2>
            <p>
              Joining a ministry is one of the quickest ways to build deep friendships,
              discover your leadership potential, and leave a permanent mark on campus.
            </p>
          </div>
          <div className="value-grid">
            <div className="value-card">
              <div className="ic">🌱</div>
              <h3>Spiritual Growth</h3>
              <p>Serving pushes your faith into practical action, drawing you closer to Christ as you depend on His strength.</p>
            </div>
            <div className="value-card">
              <div className="ic">🤝</div>
              <h3>Deep Fellowship</h3>
              <p>Team members become lifelong friends, prayer partners, and support systems throughout your university journey.</p>
            </div>
            <div className="value-card">
              <div className="ic">⚡</div>
              <h3>Skill &amp; Leadership</h3>
              <p>Gain hands-on skills in leadership, public speaking, technical production, organizational planning, and care.</p>
            </div>
            <div className="value-card">
              <div className="ic">🌍</div>
              <h3>Kingdom Impact</h3>
              <p>Be part of life-changing encounters, touching hundreds of students and people in the Takoradi metropolis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="cta" style={{ background: 'var(--sand)' }}>
        <div className="wrap">
          <div className="cta-box" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
            <span className="eyebrow">Ready to take the step?</span>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', color: 'var(--pine-deep)', marginBottom: '16px' }}>
              Every member has a <em>place to belong</em>.
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: '15.5px', lineHeight: 1.65, marginBottom: '26px' }}>
              Still unsure which ministry suits you best? Reach out to our leadership team or speak to any executive after Sunday service.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
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

      {/* Detail & Join Modal */}
      {selectedMinistry && (
        <div
          className="modal-overlay"
          onClick={handleCloseModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 19, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '24px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 48px rgba(0,0,0,0.2)',
              position: 'relative',
              animation: 'fadeIn 0.25s ease-out',
            }}
          >
            <button
              type="button"
              onClick={handleCloseModal}
              aria-label="Close dialog"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.06)',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              &times;
            </button>

            <div style={{ position: 'relative', height: '220px' }}>
              <img
                src={getImageUrl(selectedMinistry.image_url)}
                alt={selectedMinistry.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '24px',
                }}
              >
                <div>
                  <span
                    style={{
                      background: 'var(--moss)',
                      color: 'var(--pine-deep)',
                      padding: '3px 10px',
                      borderRadius: '100px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'inline-block',
                      marginBottom: '8px',
                    }}
                  >
                    {selectedMinistry.category}
                  </span>
                  <h2 style={{ color: '#fff', fontSize: '24px', margin: 0 }}>{selectedMinistry.title}</h2>
                </div>
              </div>
            </div>

            <div style={{ padding: '24px 28px' }}>
              {selectedMinistry.meeting && (
                <div style={{ background: 'var(--sand)', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>🕒</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: 'var(--pine-deep)' }}>Meeting Schedule</strong>
                    <span style={{ fontSize: '13.5px', color: 'var(--ink-soft)' }}>{selectedMinistry.meeting}</span>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '15px', color: 'var(--pine-deep)', marginBottom: '6px' }}>About This Ministry</h4>
                <p style={{ color: 'var(--ink-soft)', fontSize: '14px', lineHeight: 1.6 }}>{selectedMinistry.description}</p>
              </div>

              {selectedMinistry.responsibilities && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '15px', color: 'var(--pine-deep)', marginBottom: '6px' }}>Key Responsibilities</h4>
                  <p style={{ color: 'var(--ink-soft)', fontSize: '14px', lineHeight: 1.6 }}>{selectedMinistry.responsibilities}</p>
                </div>
              )}

              {selectedMinistry.idealFor && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '15px', color: 'var(--pine-deep)', marginBottom: '6px' }}>Ideal For</h4>
                  <p style={{ color: 'var(--ink-soft)', fontSize: '14px', lineHeight: 1.6 }}>{selectedMinistry.idealFor}</p>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '24px 0' }} />

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
                      padding: '18px',
                      borderRadius: '14px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>🎉</div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '16px' }}>Interest Submitted!</h4>
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
                  <form onSubmit={handleSubmitJoin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {submitStatus === 'error' && (
                      <div style={{ background: '#fdf2f2', color: '#c53030', padding: '10px 14px', borderRadius: '8px', fontSize: '13.5px' }}>
                        Failed to send. Please check your internet connection or contact us directly.
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--pine-deep)' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Samuel Mensah"
                        value={joinForm.name}
                        onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--line)',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--pine-deep)' }}>
                          Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 0244123456"
                          value={joinForm.phone}
                          onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid var(--line)',
                            fontSize: '14px',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--pine-deep)' }}>
                          Academic Level
                        </label>
                        <select
                          value={joinForm.year}
                          onChange={(e) => setJoinForm({ ...joinForm, year: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid var(--line)',
                            fontSize: '14px',
                            background: '#fff',
                            outline: 'none',
                          }}
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

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--pine-deep)' }}>
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={joinForm.email}
                        onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--line)',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--pine-deep)' }}>
                        Prior Experience or Questions (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tell us about any instruments you play, software you use, or why you'd like to join..."
                        value={joinForm.notes}
                        onChange={(e) => setJoinForm({ ...joinForm, notes: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--line)',
                          fontSize: '14px',
                          outline: 'none',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
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
