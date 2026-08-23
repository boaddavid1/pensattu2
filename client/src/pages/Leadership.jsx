import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Leadership() {
  const [modal, setModal] = useState(null);
  const [leadership, setLeadership] = useState([]);

  useEffect(() => {
    // Fetch leadership data from API
    fetch('/api/team')
      .then(res => res.json())
      .then(data => setLeadership(data))
      .catch(err => console.error('Failed to fetch leadership:', err));

    const onKey = (e) => { if (e.key === 'Escape') setModal(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
          <div className="featured-grid show-all">
            {leadership.map((p) => (
              <div className="featured-card" key={p.id}>
                <div className="img">
                  <img src={p.image_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80'} alt={p.name} />
                </div>
                <div className="body">
                  <span className="role">{p.role}</span>
                  <h3>{p.name}</h3>
                  <p>{p.description || p.programme || 'Passionate leader serving the PENSA TTU community.'}</p>
                </div>
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

      {modal && (
        <div className="lead-modal" onClick={() => setModal(null)}>
          <div className="lead-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="lead-modal-close" onClick={() => setModal(null)}>✕</button>
            <div className="lead-modal-img">
              <img src={modal.image_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80'} alt={modal.name} />
            </div>
            <div className="lead-modal-body">
              <span className="lead-modal-role">{modal.role}</span>
              <h3>{modal.name}</h3>
              <p>{modal.description || modal.programme || 'Passionate leader serving the PENSA TTU community.'}</p>
              {modal.hall && <p><strong>Hall:</strong> {modal.hall}</p>}
              {modal.programme && <p><strong>Programme:</strong> {modal.programme}</p>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
