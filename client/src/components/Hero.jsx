export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <img src="https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1600&q=80" alt="Congregation worshipping together" />
      </div>
      <div className="hero-inner">
        <div className="hero-content">
          <span className="eyebrow" style={{ color: 'var(--moss)' }}>A church home in Accra</span>
          <h1>Faith that gives your heart room to <em>breathe</em>.</h1>
          <p>PENSA TTU is a community built around honest worship, real friendship, and a Word that meets you where you are — whether this is your first Sunday or your five hundredth.</p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <a href="#book" className="btn btn-primary">Plan your visit <span className="btn-arrow">→</span></a>
            <a href="#services" className="btn btn-ghost" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>Explore ministries</a>
          </div>
        </div>
      </div>
    </section>
  );
}
