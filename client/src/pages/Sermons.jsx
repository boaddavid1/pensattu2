import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api';

const filters = [
  { label: 'All Messages', value: 'all' },
  { label: 'Sunday Sermons', value: 'Sermon' },
  { label: 'Series', value: 'Series' },
  { label: 'Youth', value: 'Youth' },
  { label: 'Guest Speakers', value: 'Guest Speaker' },
];

const fallbackSermons = [
  { id: 1, tag: 'Sermon', duration: '32 min', img: '/images/pensafallback-bw.png', meta: 'Aug 10, 2026', title: 'What It Means to Belong Before You Believe', speaker: 'Pastor Mark Johnson', description: 'A look at how the earliest church welcomed people long before they had their theology sorted out — and what that means for how we welcome people today.' },
  { id: 2, tag: 'Series', duration: '28 min', img: '/images/pensafallback-bw.png', meta: 'Aug 3, 2026', title: 'Faith and Doubt Aren\'t Opposites', speaker: 'Pastor Mark Johnson', description: 'Exploring the balance between faith and doubt.' },
  { id: 3, tag: 'Youth', duration: '24 min', img: '/images/pensafallback-bw.png', meta: 'Jul 27, 2026', title: 'Finding Your Identity Before the World Names You', speaker: 'Pastor Alex Mensah', description: 'A message for the youth on divine identity.' },
  { id: 4, tag: 'Sermon', duration: '35 min', img: '/images/pensafallback-bw.png', meta: 'Jul 20, 2026', title: 'Grace Over Performance', speaker: 'Pastor Mark Johnson', description: 'Resting in the unmerited favor of God.' },
  { id: 5, tag: 'Guest Speaker', duration: '30 min', img: '/images/pensafallback-bw.png', meta: 'Jul 13, 2026', title: 'Worship Isn\'t a Song, It\'s a Lifestyle', speaker: 'Pastor Helen Owusu', description: 'Everyday devotion beyond Sunday gatherings.' },
  { id: 6, tag: 'Series', duration: '29 min', img: '/images/pensafallback-bw.png', meta: 'Jul 6, 2026', title: 'Loving the Neighborhood You Actually Live In', speaker: 'Pastor Mark Johnson', description: 'Practical discipleship and community outreach.' },
];

const series = [
  { title: 'Foundations', count: '6 messages', img: '/images/pensafallback-bw.png' },
  { title: 'Grace in the Ordinary', count: '4 messages', img: '/images/pensafallback-bw.png' },
  { title: 'Belonging', count: '5 messages', img: '/images/pensafallback-bw.png' },
];

function getYoutubeId(url) {
  if (!url) return null;
  const match = String(url).trim().match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  return match ? match[1] : null;
}

export default function Sermons() {
  const [active, setActive] = useState('all');
  const [sermonsList, setSermonsList] = useState(fallbackSermons);
  const [activePlayer, setActivePlayer] = useState(null); // sermon object for in-page player

  useEffect(() => {
    api.get('/sermons')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item) => {
            let metaDate = 'Recent';
            if (item.date_preached) {
              const d = new Date(item.date_preached);
              if (!isNaN(d.getTime())) {
                metaDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              }
            }
            const ytId = getYoutubeId(item.youtube_url);
            const coverImg = item.image_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '/images/pensafallback-bw.png');

            return {
              id: item.id,
              tag: item.category || 'Sermon',
              duration: item.audio_url ? 'Audio' : item.youtube_url ? 'Video' : 'Message',
              img: getImageUrl(coverImg),
              meta: metaDate,
              title: item.title,
              speaker: item.speaker || 'PENSA Minister',
              description: item.description || '',
              audio_url: item.audio_url,
              youtube_url: item.youtube_url,
              tiktok_url: item.tiktok_url,
            };
          });
          setSermonsList(mapped);
        }
      })
      .catch(() => {
        // Keep fallback
      });
  }, []);

  const visible = useMemo(() => {
    if (active === 'all') return sermonsList;
    return sermonsList.filter((s) => (s.tag || '').toLowerCase() === active.toLowerCase());
  }, [sermonsList, active]);

  const featured = sermonsList[0] || fallbackSermons[0];

  const scrollToArchive = (e) => {
    e.preventDefault();
    const el = document.getElementById('archive');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="sermons-page">
      <section className="page-hero">
        <div className="page-hero-bg">
          <img src="/images/sermon.png" alt="Pastor preaching on a Sunday morning" />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">Sermons &amp; messages</span>
          <h1>Every message, <em>ready to revisit</em>.</h1>
          <p>Missed a Sunday, or want to sit with something again? Every sermon since 2020 lives here — free to watch, listen, or share.</p>
        </div>
      </section>

      {/* Featured Latest Sermon */}
      <section className="sermon-featured featured">
        <div className="wrap">
          <div className="featured-card">
            <div
              className="featured-media"
              onClick={() => setActivePlayer(featured)}
              style={{ cursor: 'pointer' }}
            >
              <img src={featured.img} alt={featured.title} />
              <div className="play"><span>▶</span></div>
            </div>
            <div className="featured-body">
              <span className="eyebrow">Latest message</span>
              <h2>{featured.title}</h2>
              <div className="featured-meta">
                <span>{featured.speaker}</span>
                <span>·</span>
                <span>{featured.meta}</span>
                {featured.duration && (
                  <>
                    <span>·</span>
                    <span>{featured.duration}</span>
                  </>
                )}
              </div>
              <p>{featured.description}</p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setActivePlayer(featured)}
                  className="btn btn-primary"
                  style={{ width: 'fit-content' }}
                >
                  {featured.youtube_url ? 'Watch video' : featured.audio_url ? 'Listen audio' : 'View message'} <span className="btn-arrow">→</span>
                </button>
                <a href="#archive" onClick={scrollToArchive} style={{ fontSize: 13, fontWeight: 600, color: 'var(--pine-deep)' }}>
                  Browse all messages ↓
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="filters">
        <div className="wrap filter-row">
          {filters.map((f) => (
            <button
              key={f.value}
              className={`pill ${active === f.value ? 'active' : ''}`}
              onClick={() => setActive(f.value)}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Archive Grid */}
      <section className="archive" id="archive">
        <div className="wrap">
          <div className="sermon-grid">
            {visible.map((s) => (
              <article
                className="sermon-card"
                key={s.id}
                onClick={() => setActivePlayer(s)}
                style={{ cursor: 'pointer' }}
              >
                <div className="img">
                  <span className="sermon-tag">{s.tag}</span>
                  {s.duration && <span className="duration">{s.duration}</span>}
                  <img src={s.img} alt={s.title} />
                </div>
                <div className="body">
                  <div className="sermon-meta">{s.meta}</div>
                  <h3>{s.title}</h3>
                  <div className="speaker">{s.speaker}</div>
                  <span className="sermon-link">
                    {s.youtube_url ? 'Watch video →' : s.audio_url ? 'Listen audio →' : 'View message →'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Series Grid */}
      <section className="series">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Browse by series</span>
            <h2>Deeper dives, <em>one theme at a time</em>.</h2>
          </div>
          <div className="series-grid">
            {series.map((s) => (
              <div className="series-card" key={s.title}>
                <img src={s.img} alt={s.title} />
                <div className="series-info"><span>{s.count}</span><h3>{s.title}</h3></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta sermon-cta">
        <div className="wrap">
          <div className="cta-box">
            <h2>Never miss a <em>message</em> — get notified Sundays.</h2>
            <Link to="/#newsletter" className="btn btn-dark">
              Subscribe to updates <span className="btn-arrow" style={{ background: 'var(--moss)', color: 'var(--pine-deep)' }}>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* In-Page Media Player Modal */}
      {activePlayer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 30, 60, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setActivePlayer(null)}
        >
          <div
            style={{
              background: '#0d1e33',
              borderRadius: 20,
              maxWidth: 720,
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 70px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h4 style={{ margin: 0, color: '#fff', fontSize: 16 }}>{activePlayer.title}</h4>
              <button
                type="button"
                onClick={() => setActivePlayer(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Media Body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              {/* YouTube Video if available */}
              {activePlayer.youtube_url && getYoutubeId(activePlayer.youtube_url) ? (
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden' }}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${getYoutubeId(activePlayer.youtube_url)}?autoplay=1`}
                    title={activePlayer.title}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : activePlayer.audio_url ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px 0' }}>
                  <img
                    src={activePlayer.img}
                    alt={activePlayer.title}
                    style={{ width: 140, height: 140, borderRadius: 14, objectFit: 'cover' }}
                  />
                  <audio controls autoPlay src={activePlayer.audio_url} style={{ width: '100%', maxWidth: 500 }}>
                    Your browser does not support audio playback.
                  </audio>
                </div>
              ) : activePlayer.tiktok_url ? (
                <div style={{ textAlign: 'center', color: '#fff', padding: '30px 0' }}>
                  <p style={{ fontSize: 15, marginBottom: 16 }}>Watch this highlight message on TikTok:</p>
                  <a
                    href={activePlayer.tiktok_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ textDecoration: 'none' }}
                  >
                    Open on TikTok ↗
                  </a>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#cbd5e1', padding: '30px 0' }}>
                  <p>{activePlayer.description || 'Full recording coming soon to our media library.'}</p>
                </div>
              )}

              {/* Speaker info */}
              <div style={{ width: '100%', textAlign: 'left', color: '#94a3b8', fontSize: 13 }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>Speaker: {activePlayer.speaker}</span>
                <span style={{ marginLeft: 12 }}>Date: {activePlayer.meta}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
