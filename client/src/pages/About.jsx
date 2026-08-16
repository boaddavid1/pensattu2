import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <section className="page-hero about-page-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1600&q=80" alt="Congregation gathered in worship" />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">About PENSA TTU</span>
          <h1>A church built on <em>showing up</em>, not showing off.</h1>
          <p>Twelve years in, we're still the same church we started as — honest about scripture, serious about community, and glad you're here.</p>
        </div>
      </section>

      <section className="story-split">
        <div className="wrap story-split-grid">
          <div>
            <span className="eyebrow">How we started</span>
            <h2 style={{ fontSize: 'clamp(28px, 3vw, 38px)', color: 'var(--pine-deep)', marginBottom: '20px' }}>
              From a rented hall to a <em style={{ fontStyle: 'normal', color: 'var(--moss-deep)' }}>home for hundreds</em>.
            </h2>
            <p>In 2014, twelve people gathered in a rented community hall in East Legon with one plain conviction: church shouldn't feel like a performance you watch — it should feel like a family you belong to.</p>
            <p>That conviction hasn't moved, even as the numbers have. What began as folding chairs and a borrowed keyboard has grown into two Sunday services, thirty community groups, and a staff team that treats pastoral care as their actual job, not an afterthought.</p>
            <p>We're still not interested in being the biggest church in Accra. We're interested in being a church where you're known by name before your third visit.</p>
            <Link to="/#team" className="btn btn-dark" style={{ marginTop: '10px' }}>
              Meet our leadership <span className="btn-arrow" style={{ background: 'var(--moss)', color: 'var(--pine-deep)' }}>→</span>
            </Link>
          </div>
          <div className="story-media">
            <img src="https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=800&q=80" alt="Inside the PENSA TTU sanctuary" />
          </div>
        </div>
      </section>

      <section className="values">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">What we value</span>
            <h2>Four things that shape <em>every decision</em>.</h2>
          </div>
          <div className="value-grid">
            <div className="value-card">
              <div className="ic">📖</div>
              <h3>Scripture Over Trends</h3>
              <p>We'd rather be biblically faithful than culturally fashionable, every time.</p>
            </div>
            <div className="value-card">
              <div className="ic">🤝</div>
              <h3>Real Community</h3>
              <p>Faith grows in relationship, not in rows of chairs facing forward.</p>
            </div>
            <div className="value-card">
              <div className="ic">🌍</div>
              <h3>Outward-Facing</h3>
              <p>A church that only serves itself has stopped being the church.</p>
            </div>
            <div className="value-card">
              <div className="ic">🌱</div>
              <h3>Room to Grow</h3>
              <p>We expect doubt, questions, and slow growth — and make space for all three.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="wrap stats-grid">
          <div><strong>500+</strong><span>Members &amp; regular attendees</span></div>
          <div><strong>12+</strong><span>Years serving Accra</span></div>
          <div><strong>30+</strong><span>Community groups</span></div>
          <div><strong>2</strong><span>Sunday services</span></div>
        </div>
      </section>

      <section className="timeline">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Our journey</span>
            <h2>Twelve years, <em>one conviction</em>.</h2>
          </div>
          <div className="timeline-list">
            <div className="timeline-item">
              <div className="timeline-year">2014</div>
              <div>
                <h3>Twelve people, one rented hall</h3>
                <p>PENSA TTU holds its first Sunday gathering in East Legon with a borrowed keyboard and folding chairs.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2017</div>
              <div>
                <h3>First community groups launch</h3>
                <p>Six neighborhood groups begin meeting weekly, putting relationship ahead of attendance.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2020</div>
              <div>
                <h3>Online service goes live</h3>
                <p>We start streaming Sunday mornings so members outside Accra could still gather with us.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2023</div>
              <div>
                <h3>Second Sunday service added</h3>
                <p>Growth means an earlier 9AM service alongside our original 11AM gathering.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2026</div>
              <div>
                <h3>500+ gather with us weekly</h3>
                <p>Thirty community groups, four ministries, and one church family still growing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="beliefs-wrap">
        <div className="beliefs">
          <div className="beliefs-inner">
            <span className="eyebrow">What we believe</span>
            <h2>The convictions we <em>build on</em>.</h2>
            <div className="belief-grid">
              <div className="belief-item">
                <h4>Scripture</h4>
                <p>We hold the Bible as God's Word — trustworthy, sufficient, and the final word on how we live.</p>
              </div>
              <div className="belief-item">
                <h4>Grace</h4>
                <p>We believe no one earns their way to God — it's a gift, received by faith, not achievement.</p>
              </div>
              <div className="belief-item">
                <h4>Community</h4>
                <p>We were never meant to walk through life alone — the church is family, not an audience.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <div className="cta-box">
            <h2>Come see it for <em>yourself</em> this Sunday.</h2>
            <Link to="/#book" className="btn btn-dark">
              Plan your visit <span className="btn-arrow" style={{ background: 'var(--moss)', color: 'var(--pine-deep)' }}>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
