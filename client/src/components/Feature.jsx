export default function Feature() {
  return (
    <section className="feature" id="work">
      <div className="wrap feature-grid">
        <div className="feature-media">
          <img src="https://images.unsplash.com/photo-1507692049790-de58290a4334?w=700&q=80" alt="Congregation in worship" />
        </div>
        <div>
          <span className="eyebrow">What we hold to</span>
          <h2>Two commitments we <em>never</em> compromise on.</h2>
          <div className="feature-list">
            <div className="feature-row">
              <div className="ic">✓</div>
              <div><h4>Scripture first, always</h4><p>Every message is grounded in the Bible — not trends, not opinions.</p></div>
            </div>
            <div className="feature-row">
              <div className="ic">🤝</div>
              <div><h4>A welcome that isn&apos;t a formality</h4><p>You&apos;ll be greeted by name within a few visits — that&apos;s not an accident.</p></div>
            </div>
          </div>
          <a href="#book" className="btn btn-dark">Plan your visit <span className="btn-arrow" style={{ background: 'var(--moss)', color: 'var(--pine-deep)' }}>→</span></a>
        </div>
      </div>
    </section>
  );
}
