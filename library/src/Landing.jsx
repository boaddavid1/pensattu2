export default function Landing({ onBrowse, onLogin }) {
  return (
    <div className="pq-landing">
      <nav className="pq-landing-nav">
        <div className="pq-landing-nav-brand">
          <span className="pq-logo-icon">📚</span>
          <span>PENSA TTU Library</span>
        </div>
        <div className="pq-landing-nav-actions">
          <button className="pq-landing-nav-link" onClick={onBrowse}>Browse</button>
          <button className="pq-landing-nav-btn" onClick={onLogin}>Log In</button>
        </div>
      </nav>

      <section className="pq-hero">
        <div className="pq-hero-content">
          <h1>PENSA TTU Library</h1>
          <p className="pq-hero-subtitle">
            Your one-stop hub for past examination questions and Christian books.
            Search, read, and download resources to excel in your studies and grow spiritually.
          </p>
          <div className="pq-hero-actions">
            <button className="pq-hero-btn-primary" onClick={onBrowse}>
              Browse Past Questions →
            </button>
            <button className="pq-hero-btn-secondary" onClick={onLogin}>
              Create Account
            </button>
          </div>
        </div>
        <div className="pq-hero-stats">
          <div className="pq-hero-stat">
            <span className="pq-hero-stat-num">Past Qs</span>
            <span className="pq-hero-stat-label">Exams</span>
          </div>
          <div className="pq-hero-stat">
            <span className="pq-hero-stat-num">Books</span>
            <span className="pq-hero-stat-label">Library</span>
          </div>
          <div className="pq-hero-stat">
            <span className="pq-hero-stat-num">Free</span>
            <span className="pq-hero-stat-label">Access</span>
          </div>
        </div>
      </section>

      <section className="pq-features">
        <h2>What's in the library?</h2>
        <div className="pq-features-grid">
          <div className="pq-feature">
            <span className="pq-feature-icon">�</span>
            <h3>Past Questions</h3>
            <p>Search past exam questions by course code, year, semester, level, and exam type. Download to prepare for your exams.</p>
          </div>
          <div className="pq-feature">
            <span className="pq-feature-icon">�</span>
            <h3>Books & Textbooks</h3>
            <p>Browse Christian books and textbooks. Read online or download for offline study.</p>
          </div>
          <div className="pq-feature">
            <span className="pq-feature-icon">🔍</span>
            <h3>Smart Search</h3>
            <p>Find exactly what you need with powerful search and filtering across all resources.</p>
          </div>
          <div className="pq-feature">
            <span className="pq-feature-icon">📱</span>
            <h3>Mobile Friendly</h3>
            <p>Access the library from any device — phone, tablet, or computer, anywhere.</p>
          </div>
        </div>
      </section>

      <section className="pq-cta">
        <h2>Ready to start studying?</h2>
        <p>Create a free account to download past questions and ace your exams.</p>
        <button className="pq-cta-btn" onClick={onLogin}>Get Started — It's Free</button>
      </section>

      <footer className="pq-footer">
        <p>PENSA TTU Library — Past Question Hub</p>
        <p className="pq-footer-sub">Pentecost Students and Associates, Takoradi Technical University</p>
        <p className="pq-footer-link"><a href="https://pensattu.com">← Back to main site</a></p>
      </footer>
    </div>
  );
}
