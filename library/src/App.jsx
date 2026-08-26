import { useEffect, useState, useMemo } from 'react';
import { fetchPastQuestions, fetchMeta, trackDownload, auth } from './api';
import Landing from './Landing';
import AuthPage from './AuthPage';

export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [meta, setMeta] = useState({ years: [], semesters: [], levels: [], examTypes: [], programmes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ year: '', semester: '', level: '', programme: '', exam_type: '' });
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (auth.isLoggedIn()) {
      auth.me().then((u) => setUser(u)).catch(() => auth.removeToken());
    }
    fetchMeta().then(setMeta).catch(() => {});
    loadQuestions();
  }, []);

  async function loadQuestions(currentFilters = {}) {
    setLoading(true);
    try {
      const data = await fetchPastQuestions({ ...currentFilters, search });
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => loadQuestions({ ...filters, search }), 300);
    return () => clearTimeout(timer);
  }, [search, filters]);

  function updateFilter(key, value) {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    loadQuestions({ ...newFilters, search });
  }

  function clearFilters() {
    setSearch('');
    setFilters({ year: '', semester: '', level: '', programme: '', exam_type: '' });
    loadQuestions({});
  }

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length + (search ? 1 : 0);
  }, [filters, search]);

  async function handleDownload(q) {
    if (!auth.isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }
    try {
      await trackDownload(q.id);
      window.open(q.file_url, '_blank');
    } catch (err) {
      if (err.message.includes('log in') || err.message.includes('Unauthorized')) {
        setShowLoginModal(true);
      } else {
        setError(err.message);
      }
    }
  }

  function handleAuthSuccess(userData) {
    setUser(userData);
    setShowLoginModal(false);
    setView('browse');
  }

  function handleLogout() {
    auth.removeToken();
    setUser(null);
    setView('landing');
  }

  if (view === 'landing') {
    return (
      <>
        <Landing onBrowse={() => setView('browse')} onLogin={() => setShowLoginModal(true)} />
        {showLoginModal && (
          <div className="pq-modal-overlay" onClick={() => setShowLoginModal(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <AuthPage onSuccess={handleAuthSuccess} />
              <button className="pq-modal-close" onClick={() => setShowLoginModal(false)}>×</button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="pq-app">
      <header className="pq-header">
        <div className="pq-header-content">
          <div className="pq-logo" onClick={() => setView('landing')} style={{ cursor: 'pointer' }}>
            <span className="pq-logo-icon">📚</span>
            <div>
              <h1>PENSA TTU Library</h1>
              <p>Past Question Hub</p>
            </div>
          </div>
          <div className="pq-header-right">
            <a href="https://pensattu.com" className="pq-back-link">← Main site</a>
            {user ? (
              <div className="pq-user-menu">
                <span className="pq-user-name">Hi, {user.full_name.split(' ')[0]}</span>
                <button className="pq-logout-btn" onClick={handleLogout}>Log out</button>
              </div>
            ) : (
              <button className="pq-login-btn" onClick={() => setShowLoginModal(true)}>Log In</button>
            )}
          </div>
        </div>
      </header>

      <main className="pq-main">
        <div className="pq-search-section">
          <div className="pq-search-bar">
            <input
              type="text"
              placeholder="Search by course code or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {activeFilterCount > 0 && (
              <button className="pq-clear-btn" onClick={clearFilters}>
                Clear ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="pq-filters">
            <select value={filters.year} onChange={(e) => updateFilter('year', e.target.value)}>
              <option value="">All Years</option>
              {meta.years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filters.semester} onChange={(e) => updateFilter('semester', e.target.value)}>
              <option value="">All Semesters</option>
              {meta.semesters.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.level} onChange={(e) => updateFilter('level', e.target.value)}>
              <option value="">All Levels</option>
              {meta.levels.map((l) => <option key={l} value={l}>Level {l}</option>)}
            </select>
            <select value={filters.exam_type} onChange={(e) => updateFilter('exam_type', e.target.value)}>
              <option value="">All Types</option>
              {meta.examTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filters.programme} onChange={(e) => updateFilter('programme', e.target.value)}>
              <option value="">All Programmes</option>
              {meta.programmes.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="pq-error">{error}</div>}

        <div className="pq-results-info">
          {loading ? 'Loading...' : `${questions.length} past question${questions.length !== 1 ? 's' : ''} found`}
        </div>

        <div className="pq-grid">
          {!loading && questions.map((q) => (
            <div key={q.id} className="pq-card">
              <div className="pq-card-top">
                <span className="pq-card-code">{q.course_code}</span>
                <span className="pq-card-type">{q.exam_type}</span>
              </div>
              <h3 className="pq-card-title">{q.course_title}</h3>
              <div className="pq-card-tags">
                <span className="pq-tag">{q.year}</span>
                <span className="pq-tag">{q.semester}</span>
                <span className="pq-tag">Level {q.level}</span>
                {q.programme && <span className="pq-tag">{q.programme}</span>}
              </div>
              <div className="pq-card-footer">
                <span className="pq-downloads">{q.downloads || 0} downloads</span>
                <button className="pq-download-btn" onClick={() => handleDownload(q)}>
                  {auth.isLoggedIn() ? 'Download' : 'Log in to download'}
                </button>
              </div>
            </div>
          ))}
          {!loading && questions.length === 0 && (
            <div className="pq-empty">
              <span className="pq-empty-icon">🔍</span>
              <p>No past questions found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="pq-footer">
        <p>PENSA TTU Library — Past Question Hub</p>
        <p className="pq-footer-sub">Pentecost Students and Associates, Takoradi Technical University</p>
      </footer>

      {showLoginModal && (
        <div className="pq-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <AuthPage onSuccess={handleAuthSuccess} />
            <button className="pq-modal-close" onClick={() => setShowLoginModal(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}
