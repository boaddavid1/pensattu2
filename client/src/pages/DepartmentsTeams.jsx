import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api.js';

const initialDepartments = [
  {
    id: 1,
    title: 'Music & Worship Department',
    category: 'Worship & Creative Arts',
    meeting: 'Saturdays, 3:00 PM',
    description: 'Musicians, vocalists, and choir members leading the congregation into deep, heartfelt worship and praise every Sunday and during special services.',
    responsibilities: 'Praise & worship leading, instrumental training, choir rehearsals, and musical arrangement.',
    idealFor: 'Singers, keyboardists, drummers, bassists, and anyone with a passion for music and praise.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 2,
    title: 'Organizing & Ushering Department',
    category: 'Hospitality & Protocol',
    meeting: 'Sundays, 6:00 AM',
    description: 'The first smile you see at PENSA TTU. Welcoming members, coordinating seating, handling offering collections, and creating a warm, orderly environment.',
    responsibilities: 'Auditorium setup, welcoming worshippers, seating protocol, order of service coordination, and hospitality.',
    idealFor: 'Friendly, hospitable, and detail-oriented people who love serving behind the scenes.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 3,
    title: 'Evangelism & Outreach Team',
    category: 'Outreach & Evangelism',
    meeting: 'Saturdays, 7:00 AM',
    description: 'Taking the Gospel beyond the church walls. Spearheading campus room-to-room evangelism, outreach to secondary schools, and rural community missions.',
    responsibilities: 'Room-to-room outreach, high school missions, tract distribution, and follow-up with new converts.',
    idealFor: 'Passionate believers with a burning heart to win souls for Christ and share the Gospel.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 4,
    title: 'Prayer & Intercessory Team',
    category: 'Prayer & Intercession',
    meeting: 'Fridays, 8:00 PM',
    description: 'The powerhouse of the fellowship. Standing in the gap through prayer vigils, fasting, chain prayers, and seeking God’s presence for the campus and nation.',
    responsibilities: 'Leading morning devotionals, organizing prayer vigils, intercessory chains, and personal prayer ministry.',
    idealFor: 'Anyone with a burden for prayer, spiritual alertness, and interceding for others.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 5,
    title: 'Media & Publicity Department',
    category: 'Media & Tech',
    meeting: 'Saturdays, 10:00 AM',
    description: 'Crafting the visual and digital story of PENSA TTU through livestreaming, social media content, photography, graphic design, and video production.',
    responsibilities: 'Photography, videography, livestreaming Sunday services, flyer and social graphics design, and social media management.',
    idealFor: 'Photographers, videographers, graphic designers, copywriters, and content creators.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 6,
    title: 'Bible Studies & Discipleship Department',
    category: 'Care & Discipleship',
    meeting: 'Wednesdays, 5:30 PM',
    description: 'Fostering biblical literacy and spiritual growth through structured cell group meetings, syllabus drafting, and discipleship mentoring.',
    responsibilities: 'Curating study materials, training cell leaders, organizing Bible quizzes, and mentoring new believers.',
    idealFor: 'Enthusiastic students of the Word who love teaching, discussing scripture, and discipling others.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 7,
    title: 'Counseling & Welfare Department',
    category: 'Care & Discipleship',
    meeting: 'Tuesdays, 4:00 PM',
    description: 'Ensuring no member walks alone. Providing compassionate pastoral care, emotional support, welfare assistance, and hospital and hostel visits.',
    responsibilities: 'Welfare distribution, hospital visits, peer counseling, academic encouragement, and follow-ups.',
    idealFor: 'Good listeners, empathetic hearts, and anyone with a gift of compassion and care.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 8,
    title: 'Creative Arts & Choreography Team',
    category: 'Worship & Creative Arts',
    meeting: 'Fridays, 4:00 PM',
    description: 'Communicating the timeless Gospel through choreography, drama, poetry, spoken word, and creative stage performances during services and events.',
    responsibilities: 'Stage acting, dance and choreography choreography, spoken word poetry, and scriptwriting.',
    idealFor: 'Actors, dancers, spoken-word artists, and creative performers.',
    image_url: '/images/pensafallback-bw.png',
  },
  {
    id: 9,
    title: 'Technical & Sound Engineering',
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

export default function DepartmentsTeams() {
  const [departments, setDepartments] = useState(initialDepartments);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState(null);

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
          // Merge API data with default department details
          const merged = data.map((item, index) => {
            const fallbackMatch = initialDepartments.find(
              (d) => d.title.toLowerCase() === (item.title || '').toLowerCase()
            ) || initialDepartments[index % initialDepartments.length];

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
          setDepartments(merged);
        }
      })
      .catch(() => {
        // Keep initial departments on error
      });

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSelectedDept(null);
        setSubmitStatus(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filteredDepartments = departments.filter((d) => {
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

  const handleOpenModal = (dept) => {
    setSelectedDept(dept);
    setSubmitStatus(null);
    setJoinForm({
      name: '',
      phone: '',
      email: '',
      year: 'Level 100',
      notes: '',
    });
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDept) return;
    setSubmitStatus('sending');

    const body = {
      name: joinForm.name,
      email: joinForm.email,
      message: `Topic: Joining Department/Team: ${selectedDept.title}\nPhone: ${joinForm.phone}\nAcademic Level: ${joinForm.year}\n\nNote / Experience: ${joinForm.notes || 'None provided'}`,
    };

    try {
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
          <img src="/images/leadership-hero.png" alt="PENSA TTU Departments and Teams" />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">Departments &amp; Teams</span>
          <h1>Serving with passion, <em>growing together in Christ</em>.</h1>
          <p>
            Every department and team at PENSA TTU exists to build God's Kingdom, equip believers,
            and provide a vibrant family where your gifts find purpose.
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
                <h2 style={{ fontSize: '28px', color: 'var(--pine-deep)' }}>Explore Our Departments &amp; Teams</h2>
              </div>
              <div style={{ minWidth: '260px', maxWidth: '380px', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Search department or keyword..."
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

      {/* Grid of Departments and Teams */}
      <section className="services" style={{ background: 'var(--paper)', paddingTop: '50px' }}>
        <div className="wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <p style={{ color: 'var(--ink-soft)', fontSize: '15px' }}>
              Showing <strong>{filteredDepartments.length}</strong> {filteredDepartments.length === 1 ? 'department / team' : 'departments & teams'}
            </p>
            {activeCategory !== 'All' && (
              <button
                type="button"
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--moss-deep)', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="service-grid" style={{ marginTop: '0' }}>
            {filteredDepartments.map((dept) => (
              <div
                className="service-card"
                key={dept.id}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onClick={() => handleOpenModal(dept)}
              >
                <div className="img" style={{ position: 'relative' }}>
                  <img src={getImageUrl(dept.image_url) || '/images/pensafallback-bw.png'} alt={dept.title} />
                  {dept.category && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(10, 46, 92, 0.85)',
                        backdropFilter: 'blur(4px)',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '100px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {dept.category}
                    </span>
                  )}
                </div>
                <div className="body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', color: 'var(--pine-deep)' }}>{dept.title}</h3>
                    <p style={{ fontSize: '13.6px', marginTop: '6px', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
                      {dept.description}
                    </p>
                  </div>
                  <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {dept.meeting || 'Weekly Meetings'}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--pine-deep)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Learn more →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDepartments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '20px', border: '1px solid var(--line)' }}>
              <h3 style={{ fontSize: '20px', color: 'var(--pine-deep)', marginBottom: '8px' }}>No department or team found</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14.5px', marginBottom: '20px' }}>
                We couldn't find any team matching your current filter or search criteria.
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
              Joining a department or team is one of the quickest ways to build deep friendships,
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
              Still unsure which department or team suits you best? Reach out to our leadership team or speak to any executive after Sunday service.
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
      {selectedDept && (
        <div className="lead-modal" onClick={() => setSelectedDept(null)}>
          <div
            className="lead-modal-card"
            style={{
              maxWidth: '780px',
              gridTemplateColumns: '0.9fr 1.1fr',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lead-modal-close"
              type="button"
              onClick={() => setSelectedDept(null)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="lead-modal-img" style={{ position: 'relative' }}>
              <img
                src={getImageUrl(selectedDept.image_url) || '/images/pensafallback-bw.png'}
                alt={selectedDept.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10, 46, 92, 0.85) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '24px',
                  color: '#fff',
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: 'var(--moss)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {selectedDept.category}
                  </span>
                  <h4 style={{ fontSize: '18px', color: '#fff', marginTop: '4px' }}>{selectedDept.title}</h4>
                </div>
              </div>
            </div>

            <div className="lead-modal-body" style={{ padding: '32px 28px' }}>
              <span className="lead-modal-role">{selectedDept.category}</span>
              <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>{selectedDept.title}</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '16px' }}>
                {selectedDept.description}
              </p>

              {selectedDept.meeting && (
                <div style={{ marginBottom: '14px', background: 'var(--sand)', padding: '10px 14px', borderRadius: '10px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--pine-deep)' }}>Meeting / Rehearsal: </strong>
                  <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>{selectedDept.meeting}</span>
                </div>
              )}

              {selectedDept.responsibilities && (
                <div style={{ marginBottom: '14px' }}>
                  <strong style={{ fontSize: '13.5px', color: 'var(--pine-deep)', display: 'block', marginBottom: '4px' }}>What You Will Do:</strong>
                  <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>{selectedDept.responsibilities}</p>
                </div>
              )}

              {selectedDept.idealFor && (
                <div style={{ marginBottom: '22px' }}>
                  <strong style={{ fontSize: '13.5px', color: 'var(--pine-deep)', display: 'block', marginBottom: '4px' }}>Ideal For:</strong>
                  <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>{selectedDept.idealFor}</p>
                </div>
              )}

              {/* Express Interest / Join Form */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '20px', marginTop: '10px' }}>
                <h4 style={{ fontSize: '16px', color: 'var(--pine-deep)', marginBottom: '12px' }}>
                  Interested in joining this team?
                </h4>

                {submitStatus === 'success' ? (
                  <div style={{ background: '#eaf7ed', color: '#1e6834', padding: '16px', borderRadius: '12px', fontSize: '14px', textAlign: 'center' }}>
                    <strong>Hooray! Your interest has been received.</strong>
                    <p style={{ marginTop: '4px', fontSize: '13px' }}>The department lead or secretary will connect with you via phone/WhatsApp soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleJoinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={joinForm.name}
                        onChange={(e) => setJoinForm({ ...joinForm, name: e.target.value })}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px', fontFamily: 'inherit' }}
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Phone / WhatsApp"
                        value={joinForm.phone}
                        onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px', fontFamily: 'inherit' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input
                        type="email"
                        required
                        placeholder="Email address"
                        value={joinForm.email}
                        onChange={(e) => setJoinForm({ ...joinForm, email: e.target.value })}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px', fontFamily: 'inherit' }}
                      />
                      <select
                        value={joinForm.year}
                        onChange={(e) => setJoinForm({ ...joinForm, year: e.target.value })}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px', fontFamily: 'inherit', background: '#fff' }}
                      >
                        <option value="Level 100">Level 100</option>
                        <option value="Level 200">Level 200</option>
                        <option value="Level 300">Level 300</option>
                        <option value="Level 400">Level 400</option>
                        <option value="Alumni / Visitor">Alumni / Visitor</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Brief note or any prior experience (optional)"
                      rows={2}
                      value={joinForm.notes}
                      onChange={(e) => setJoinForm({ ...joinForm, notes: e.target.value })}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    {submitStatus === 'error' && (
                      <p style={{ color: '#d9383a', fontSize: '12.5px', margin: 0 }}>
                        Could not submit request. Please try again or reach out on our Contact page.
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={submitStatus === 'sending'}
                      className="btn btn-dark"
                      style={{ marginTop: '4px', justifyContent: 'center', padding: '12px' }}
                    >
                      {submitStatus === 'sending' ? 'Submitting...' : `Join ${selectedDept.title}`}
                    </button>
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
