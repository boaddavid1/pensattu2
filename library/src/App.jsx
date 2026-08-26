import { useEffect, useState, useMemo } from 'react';
import { fetchPastQuestions, fetchMeta, trackDownload, fetchBooks, fetchBook, fetchBookCategories, trackBookDownload, auth } from './api';
import Landing from './Landing';
import AuthPage from './AuthPage';

export default function App() {
  const [view, setView] = useState('landing');
  const [tab, setTab] = useState('past-questions');
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState('');

  // Past questions state
  const [questions, setQuestions] = useState([]);
  const [pqMeta, setPqMeta] = useState({ years: [], semesters: [], levels: [], examTypes: [], programmes: [] });
  const [pqLoading, setPqLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ year: '', semester: '', level: '', programme: '', exam_type: '' });

  // Books state
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [bookSearch, setBookSearch] = useState('');
  const [bookCategory, setBookCategory] = useState('');
  const [readingBook, setReadingBook] = useState(null);

  useEffect(() => {
    if (auth.isLoggedIn()) {
      auth.me().then((u) => setUser(u)).catch(() => auth.removeToken());
    }
    fetchMeta().then(setPqMeta).catch(() => {});
    fetchBookCategories().then(setCategories).catch(() => {});
    loadQuestions();
    loadBooks();
  }, []);

  async function loadQuestions(currentFilters = {}) {
    setPqLoading(true);
    try {
      const data = await fetchPastQuestions({ ...currentFilters, search });
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setPqLoading(false);
    }
  }

  async function loadBooks(currentFilters = {}) {
    setBooksLoading(true);
    try {
      const data = await fetchBooks(currentFilters);
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBooksLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => loadQuestions({ ...filters, search }), 300);
    return () => clearTimeout(timer);
  }, [search, filters]);

  useEffect(() => {
    const timer = setTimeout(() => loadBooks({ search: bookSearch, category: bookCategory }), 300);
    return () => clearTimeout(timer);
  }, [bookSearch, bookCategory]);

  function updateFilter(key, value) {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    loadQuestions({ ...newFilters, search });
  }

  function clearFilters() {
    setSearch('');
    setFilters({ year: '', semester: '', level: '', programme: '', exam_type: '' });
    setBookSearch('');
    setBookCategory('');
  }

  const activeFilterCount = useMemo(() => {
    if (tab === 'past-questions') {
      return Object.values(filters).filter(Boolean).length + (search ? 1 : 0);
    }
    return (bookSearch ? 1 : 0) + (bookCategory ? 1 : 0);
  }, [filters, search, tab, bookSearch, bookCategory]);

  async function handleDownload(q) {
    if (!auth.isLoggedIn()) { setShowLoginModal(true); return; }
    try {
      await trackDownload(q.id);
      window.open(q.file_url, '_blank');
    } catch (err) {
      if (err.message.includes('log in') || err.message.includes('Unauthorized')) setShowLoginModal(true);
      else setError(err.message);
    }
  }

  async function handleBookDownload(book) {
    if (!auth.isLoggedIn()) { setShowLoginModal(true); return; }
    try {
      await trackBookDownload(book.id);
      window.open(book.file_url, '_blank');
    } catch (err) {
      if (err.message.includes('log in') || err.message.includes('Unauthorized')) setShowLoginModal(true);
      else setError(err.message);
    }
  }

  async function handleReadBook(book) {
    try {
      const full = await fetchBook(book.id);
      setReadingBook(full);
    } catch (err) {
      setError(err.message);
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

  if (readingBook) {
    return (
      <div className="pq-app">
        <header className="pq-header">
          <div className="pq-header-content">
            <div className="pq-logo" onClick={() => { setReadingBook(null); setView('browse'); }} style={{ cursor: 'pointer' }}>
              <span className="pq-logo-icon">📚</span>
              <div><h1>PENSA TTU Library</h1><p>Past Question Hub</p></div>
            </div>
            <button className="pq-back-link" onClick={() => setReadingBook(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>← Back to library</button>
          </div>
        </header>
        <main className="pq-main pq-reader">
          <h2 className="pq-reader-title">{readingBook.title}</h2>
          {readingBook.author && <p className="pq-reader-author">by {readingBook.author}</p>}
          <div className="pq-reader-content">
            {readingBook.content ? (
              <div dangerouslySetInnerHTML={{ __html: readingBook.content }} />
            ) : readingBook.file_url ? (
              <div className="pq-reader-pdf">
                <iframe src={readingBook.file_url} title={readingBook.title} style={{ width: '100%', height: '70vh', border: 'none' }} />
              </div>
            ) : (
              <p>No content available for this book.</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pq-app">
      <header className="pq-header">
        <div className="pq-header-content">
          <div className="pq-logo" onClick={() => setView('landing')} style={{ cursor: 'pointer' }}>
            <span className="pq-logo-icon">📚</span>
            <div><h1>PENSA TTU Library</h1><p>Knowledge Hub</p></div>
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

      <div className="pq-tabs">
        <button className={tab === 'past-questions' ? 'pq-tab active' : 'pq-tab'} onClick={() => setTab('past-questions')}>
          📝 Past Questions
        </button>
        <button className={tab === 'books' ? 'pq-tab active' : 'pq-tab'} onClick={() => setTab('books')}>
          📖 Books
        </button>
      </div>

      <main className="pq-main">
        {error && <div className="pq-error">{error}</div>}

        {tab === 'past-questions' ? (
          <>
            <div className="pq-search-section">
              <div className="pq-search-bar">
                <input type="text" placeholder="Search by course code or title..." value={search} onChange={(e) => setSearch(e.target.value)} />
                {activeFilterCount > 0 && <button className="pq-clear-btn" onClick={clearFilters}>Clear ({activeFilterCount})</button>}
              </div>
              <div className="pq-filters">
                <select value={filters.year} onChange={(e) => updateFilter('year', e.target.value)}>
                  <option value="">All Years</option>
                  {pqMeta.years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={filters.semester} onChange={(e) => updateFilter('semester', e.target.value)}>
                  <option value="">All Semesters</option>
                  {pqMeta.semesters.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filters.level} onChange={(e) => updateFilter('level', e.target.value)}>
                  <option value="">All Levels</option>
                  {pqMeta.levels.map((l) => <option key={l} value={l}>Level {l}</option>)}
                </select>
                <select value={filters.exam_type} onChange={(e) => updateFilter('exam_type', e.target.value)}>
                  <option value="">All Types</option>
                  {pqMeta.examTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filters.programme} onChange={(e) => updateFilter('programme', e.target.value)}>
                  <option value="">All Programmes</option>
                  {pqMeta.programmes.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="pq-results-info">{pqLoading ? 'Loading...' : `${questions.length} past question${questions.length !== 1 ? 's' : ''} found`}</div>
            <div className="pq-grid">
              {!pqLoading && questions.map((q) => (
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
                      {auth.isLoggedIn() ? 'Download' : 'Log in'}
                    </button>
                  </div>
                </div>
              ))}
              {!pqLoading && questions.length === 0 && (
                <div className="pq-empty"><span className="pq-empty-icon">🔍</span><p>No past questions found. Try adjusting your filters.</p></div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="pq-search-section">
              <div className="pq-search-bar">
                <input type="text" placeholder="Search by title or author..." value={bookSearch} onChange={(e) => setBookSearch(e.target.value)} />
                {activeFilterCount > 0 && <button className="pq-clear-btn" onClick={clearFilters}>Clear ({activeFilterCount})</button>}
              </div>
              <div className="pq-filters">
                <select value={bookCategory} onChange={(e) => setBookCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="pq-results-info">{booksLoading ? 'Loading...' : `${books.length} book${books.length !== 1 ? 's' : ''} found`}</div>
            <div className="pq-grid pq-books-grid">
              {!booksLoading && books.map((book) => (
                <div key={book.id} className="pq-card pq-book-card">
                  <div className="pq-book-cover">
                    {book.cover_image ? (
                      <img src={book.cover_image} alt={book.title} />
                    ) : (
                      <div className="pq-book-cover-placeholder">📖</div>
                    )}
                  </div>
                  <div className="pq-book-info">
                    <h3 className="pq-card-title">{book.title}</h3>
                    {book.author && <p className="pq-book-author">by {book.author}</p>}
                    {book.category && <span className="pq-tag">{book.category}</span>}
                    {book.description && <p className="pq-book-desc">{book.description.length > 80 ? book.description.slice(0, 80) + '...' : book.description}</p>}
                    <div className="pq-card-footer">
                      <span className="pq-downloads">{book.downloads || 0} downloads</span>
                      <div className="pq-book-actions">
                        {book.is_readable && (
                          <button className="pq-read-btn" onClick={() => handleReadBook(book)}>Read</button>
                        )}
                        <button className="pq-download-btn" onClick={() => handleBookDownload(book)}>
                          {auth.isLoggedIn() ? 'Download' : 'Log in'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!booksLoading && books.length === 0 && (
                <div className="pq-empty"><span className="pq-empty-icon">🔍</span><p>No books found. Try adjusting your search.</p></div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="pq-footer">
        <p>PENSA TTU Library — Knowledge Hub</p>
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
