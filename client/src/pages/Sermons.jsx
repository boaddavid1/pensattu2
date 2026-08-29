import { useState } from 'react';
import { Link } from 'react-router-dom';

const filters = [
  { label: 'All Messages', value: 'all' },
  { label: 'Sunday Sermons', value: 'Sermon' },
  { label: 'Series', value: 'Series' },
  { label: 'Youth', value: 'Youth' },
  { label: 'Guest Speakers', value: 'Guest Speaker' },
];

const sermons = [
  { id: 1, tag: 'Sermon', duration: '32 min', img: '/images/pensafallback-bw.png', meta: 'Aug 10, 2026', title: 'What It Means to Belong Before You Believe', speaker: 'Pastor Mark Johnson' },
  { id: 2, tag: 'Series', duration: '28 min', img: '/images/pensafallback-bw.png', meta: 'Aug 3, 2026', title: 'Faith and Doubt Aren\'t Opposites', speaker: 'Pastor Mark Johnson' },
  { id: 3, tag: 'Youth', duration: '24 min', img: '/images/pensafallback-bw.png', meta: 'Jul 27, 2026', title: 'Finding Your Identity Before the World Names You', speaker: 'Pastor Alex Mensah' },
  { id: 4, tag: 'Sermon', duration: '35 min', img: '/images/pensafallback-bw.png', meta: 'Jul 20, 2026', title: 'Grace Over Performance', speaker: 'Pastor Mark Johnson' },
  { id: 5, tag: 'Guest Speaker', duration: '30 min', img: '/images/pensafallback-bw.png', meta: 'Jul 13, 2026', title: 'Worship Isn\'t a Song, It\'s a Lifestyle', speaker: 'Pastor Helen Owusu' },
  { id: 6, tag: 'Series', duration: '29 min', img: '/images/pensafallback-bw.png', meta: 'Jul 6, 2026', title: 'Loving the Neighborhood You Actually Live In', speaker: 'Pastor Mark Johnson' },
];

const series = [
  { title: 'Foundations', count: '6 messages', img: '/images/pensafallback-bw.png' },
  { title: 'Grace in the Ordinary', count: '4 messages', img: '/images/pensafallback-bw.png' },
  { title: 'Belonging', count: '5 messages', img: '/images/pensafallback-bw.png' },
];

export default function Sermons() {
  const [active, setActive] = useState('all');

  const visible = active === 'all' ? sermons : sermons.filter((s) => s.tag === active);

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

      <section className="sermon-featured featured">
        <div className="wrap">
          <div className="featured-card">
            <div className="featured-media">
              <img src="/images/pensafallback-bw.png" alt="Latest Sunday sermon" />
              <div className="play"><span>▶</span></div>
            </div>
            <div className="featured-body">
              <span className="eyebrow">Latest message</span>
              <h2>What It Means to Belong Before You Believe</h2>
              <div className="featured-meta">
                <span>Pastor Mark Johnson</span>
                <span>·</span>
                <span>Aug 10, 2026</span>
                <span>·</span>
                <span>32 min</span>
              </div>
              <p>A look at how the earliest church welcomed people long before they had their theology sorted out — and what that means for how we welcome people today.</p>
              <a href="#archive" onClick={scrollToArchive} className="btn btn-primary" style={{ width: 'fit-content' }}>
                Watch now <span className="btn-arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

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

      <section className="archive" id="archive">
        <div className="wrap">
          <div className="sermon-grid">
            {visible.map((s) => (
              <article className="sermon-card" key={s.id}>
                <div className="img">
                  <span className="sermon-tag">{s.tag}</span>
                  <span className="duration">{s.duration}</span>
                  <img src={s.img} alt={s.title} />
                </div>
                <div className="body">
                  <div className="sermon-meta">{s.meta}</div>
                  <h3>{s.title}</h3>
                  <div className="speaker">{s.speaker}</div>
                  <span className="sermon-link">Watch →</span>
                </div>
              </article>
            ))}
          </div>
          <div className="load-more"><button className="btn btn-ghost" type="button">Load more messages</button></div>
        </div>
      </section>

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
    </main>
  );
}
