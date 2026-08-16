import { Link } from 'react-router-dom';

const featured = [
  {
    name: 'Mark Johnson',
    role: 'Senior Pastor',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80',
    text: 'Mark has led PENSA TTU since its founding in 2014. He preaches most Sundays and spends the rest of his week in one-on-one conversations he considers just as important as the sermon.',
  },
  {
    name: 'Helen Owusu',
    role: 'Executive & Worship Pastor',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=80',
    text: 'Helen oversees church operations and leads worship on Sunday mornings. She joined the founding team in 2014 and has led the music ministry ever since.',
  },
];

const ministryTeam = [
  { name: 'Alex Mensah', role: 'Youth Pastor', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
  { name: 'Ama Boateng', role: 'Kids Ministry Lead', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80' },
  { name: 'Kwame Asante', role: 'Outreach Director', img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80' },
  { name: 'Naana Adjei', role: 'Community Groups Lead', img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80' },
];

const elders = [
  { name: 'Samuel Owusu', since: '2014', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' },
  { name: 'Grace Nkrumah', since: '2017', img: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?w=400&q=80' },
  { name: 'Daniel Appiah', since: '2019', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80' },
];

export default function Leadership() {
  return (
    <main className="leadership-page">
      <section className="page-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1600&q=80" alt="Leadership team in conversation" />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">Our leadership</span>
          <h1>People who carry this church <em>with care</em>.</h1>
          <p>Pastors, elders and ministry leads who take the responsibility of shepherding this community seriously — and take themselves lightly.</p>
        </div>
      </section>

      <section className="lead-featured">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Senior leadership</span>
            <h2>Setting the <em>direction</em>.</h2>
          </div>
          <div className="featured-grid">
            {featured.map((p) => (
              <div className="featured-card" key={p.name}>
                <div className="img"><img src={p.img} alt={p.name} /></div>
                <div className="body">
                  <span className="role">{p.role}</span>
                  <h3>{p.name}</h3>
                  <p>{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="team lead-team" id="leadership-team">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Ministry team</span>
            <h2>The people behind <em>every ministry</em>.</h2>
          </div>
          <div className="team-grid">
            {ministryTeam.map((m) => (
              <div className="team-card" key={m.name}>
                <img src={m.img} alt={m.name} />
                <div className="team-info"><h3>{m.name}</h3><span>{m.role}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="elders">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Board of elders</span>
            <h2>Providing <em>oversight and counsel</em>.</h2>
          </div>
          <div className="elder-grid">
            {elders.map((e) => (
              <div className="elder-card" key={e.name}>
                <img src={e.img} alt={e.name} />
                <div><h4>{e.name}</h4><span>Elder, since {e.since}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="philosophy-wrap">
        <div className="philosophy">
          <div className="philosophy-inner">
            <div>
              <span className="eyebrow">How we lead</span>
              <h2>Leadership as <em>service</em>, not status.</h2>
            </div>
            <div className="philosophy-list">
              <div className="philosophy-item">
                <h4>Accessible, not distant</h4>
                <p>Every leader here takes calls, answers messages, and sits with people through hard weeks.</p>
              </div>
              <div className="philosophy-item">
                <h4>Accountable to each other</h4>
                <p>No single person leads unchecked — our elders exist to ask hard questions, including of the pastors.</p>
              </div>
              <div className="philosophy-item">
                <h4>Raising the next leaders</h4>
                <p>Every ministry lead is actively mentoring someone to eventually take their place.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta lead-cta">
        <div className="wrap">
          <div className="cta-box">
            <h2>Want to talk to someone on our <em>team</em>?</h2>
            <Link to="/contact" className="btn btn-dark">
              Get in touch <span className="btn-arrow" style={{ background: 'var(--moss)', color: 'var(--pine-deep)' }}>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
