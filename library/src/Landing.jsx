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
          <h1>Past Question Hub</h1>
          <p className="pq-hero-subtitle">
            Access past examination questions for all courses at Takoradi Technical University.
            Search, filter, and download past questions to prepare for your exams.
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
            <span className="pq-hero-stat-num">All</span>
            <span className="pq-hero-stat-label">Courses</span>
          </div>
          <div className="pq-hero-stat">
            <span className="pq-hero-stat-num">100-400</span>
            <span className="pq-hero-stat-label">Levels</span>
          </div>
          <div className="pq-hero-stat">
            <span className="pq-hero-stat-num">Free</span>
            <span className="pq-hero-stat-label">Access</span>
          </div>
        </div>
      </section>

      <section className="pq-features">
        <h2>Why use the library?</h2>
        <div className="pq-features-grid">
          <div className="pq-feature">
            <span className="pq-feature-icon">🔍</span>
            <h3>Smart Search</h3>
            <p>Find past questions by course code, title, year, semester, level, or exam type.</p>
          </div>
          <div className="pq-feature">
            <span className="pq-feature-icon">📥</span>
            <h3>Easy Download</h3>
            <p>Download past questions in PDF, Word, or image format with a single click.</p>
          </div>
          <div className="pq-feature">
            <span className="pq-feature-icon">🎯</span>
            <h3>Filter by Programme</h3>
            <p>Narrow down to questions relevant to your specific programme of study.</p>
          </div>
          <div className="pq-feature">
            <span className="pq-feature-icon">📱</span>
            <h3>Mobile Friendly</h3>
            <p>Access the library from any device — phone, tablet, or computer.</p>
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
