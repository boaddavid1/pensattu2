import { useEffect, useState, useMemo } from 'react';
import { fetchPastQuestions, fetchMeta, trackDownload, fetchBooks, fetchBook, fetchBookCategories, trackBookDownload, auth } from './api';
import Landing from './Landing';
import AuthPage from './AuthPage';
import Profile from './Profile';
import PwaPrompt from './PwaPrompt';

// Read initial view/tab from the URL hash so refreshes keep the user's place.
// Hash format: #browse/past-questions, #browse/books, #profile
function readHash() {
  const hash = window.location.hash.replace(/^#/, '');
  const parts = hash.split('/');
  const view = parts[0] === 'browse' ? 'browse' : parts[0] === 'profile' ? 'profile' : 'landing';
  const tab = parts[1] === 'books' ? 'books' : 'past-questions';
  return { view, tab };
}

export default function App() {
  const initial = readHash();
  const [view, setView] = useState(initial.view);
  const [tab, setTab] = useState(initial.tab);
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

  // Keep the URL hash in sync with view/tab so refreshes preserve state
  useEffect(() => {
    const newHash = view === 'browse' ? `#browse/${tab}` : '';
    if (newHash !== window.location.hash && !(newHash === '' && window.location.hash === '')) {
      window.history.replaceState(null, '', newHash || window.location.pathname);
    }
  }, [view, tab]);

  // Respond to back/forward navigation
  useEffect(() => {
    const onHashChange = () => {
      const h = readHash();
      setView(h.view);
      setTab(h.tab);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  async function loadQuestions(currentFilters = {}) {
    setPqLoading(true);
    try {
      const data = await fetchPastQuestions({ ...currentFilters, search });
      setQuestions(data);
    } catch (err) { setError(err.message); }
    finally { setPqLoading(false); }
  }

  async function loadBooks(currentFilters = {}) {
    setBooksLoading(true);
    try {
      const data = await fetchBooks(currentFilters);
      setBooks(data);
    } catch (err) { setError(err.message); }
    finally { setBooksLoading(false); }
  }

  useEffect(() => {
    const t = setTimeout(() => loadQuestions({ ...filters, search }), 300);
    return () => clearTimeout(t);
  }, [search, filters]);

  useEffect(() => {
    const t = setTimeout(() => loadBooks({ search: bookSearch, category: bookCategory }), 300);
    return () => clearTimeout(t);
  }, [bookSearch, bookCategory]);

  function updateFilter(key, value) {
    const n = { ...filters, [key]: value };
    setFilters(n);
    loadQuestions({ ...n, search });
  }

  function clearFilters() {
    setSearch(''); setFilters({ year: '', semester: '', level: '', programme: '', exam_type: '' });
    setBookSearch(''); setBookCategory('');
  }

  const activeFilterCount = useMemo(() => {
    if (tab === 'past-questions') return Object.values(filters).filter(Boolean).length + (search ? 1 : 0);
    return (bookSearch ? 1 : 0) + (bookCategory ? 1 : 0);
  }, [filters, search, tab, bookSearch, bookCategory]);

  async function handleDownload(q) {
    if (!auth.isLoggedIn()) { setShowLoginModal(true); return; }
    try {
      const result = await trackDownload(q.id);
      const url = result.download_url || q.file_url;
      if (url) window.open(url, '_blank');
      else setError('Download file is not available.');
    }
    catch (err) { if (err.message.includes('log in') || err.message.includes('Unauthorized')) setShowLoginModal(true); else setError(err.message); }
  }

  async function handleBookDownload(book) {
    if (!auth.isLoggedIn()) { setShowLoginModal(true); return; }
    try {
      const result = await trackBookDownload(book.id);
      const url = result.download_url;
      if (url) window.open(url, '_blank');
      else {
        // Fallback: fetch full book details to get file_url
        const full = await fetchBook(book.id);
        if (full.file_url) window.open(full.file_url, '_blank');
        else setError('Download file is not available for this book.');
      }
    }
    catch (err) { if (err.message.includes('log in') || err.message.includes('Unauthorized')) setShowLoginModal(true); else setError(err.message); }
  }

  async function handleReadBook(book) {
    try { const full = await fetchBook(book.id); setReadingBook(full); }
    catch (err) { setError(err.message); }
  }

  function handleAuthSuccess(userData) {
    setUser(userData); setShowLoginModal(false); setView('browse');
  }

  function handleUserUpdate(updatedUser) {
    setUser(updatedUser);
  }

  function handleLogout() {
    auth.removeToken(); setUser(null); setView('landing');
  }

  // ===== LANDING =====
  if (view === 'landing') {
    return (
      <>
        <Landing onBrowse={() => setView('browse')} onLogin={() => setShowLoginModal(true)} />
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-5" onClick={() => setShowLoginModal(false)}>
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md">
              <AuthPage onSuccess={handleAuthSuccess} />
              <button className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-amber-500 text-slate-900 font-bold text-xl flex items-center justify-center shadow-lg" onClick={() => setShowLoginModal(false)}>×</button>
            </div>
          </div>
        )}
        <PwaPrompt />
      </>
    );
  }

  // ===== BOOK READER =====
  if (readingBook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => { setReadingBook(null); setView('browse'); }} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              </div>
              <span className="text-lg font-bold">StudyVault</span>
            </button>
            <button onClick={() => setReadingBook(null)} className="text-slate-400 hover:text-amber-400 text-sm font-medium transition-colors">← Back to Library</button>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-2">{readingBook.title}</h1>
          {readingBook.author && <p className="text-slate-400 mb-8 italic">by {readingBook.author}</p>}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 md:p-12 leading-relaxed text-slate-300 min-h-[400px]">
            {readingBook.content ? (
              <div dangerouslySetInnerHTML={{ __html: readingBook.content }} />
            ) : readingBook.file_url ? (
              <iframe src={readingBook.file_url} title={readingBook.title} className="w-full border-none" style={{ height: '70vh' }} />
            ) : (
              <p className="text-slate-500">No content available for this book.</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ===== PROFILE =====
  if (view === 'profile') {
    if (!user) {
      setView('browse');
      return null;
    }
    return (
      <Profile
        user={user}
        onBack={() => setView('browse')}
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
      />
    );
  }

  // ===== BROWSE (Library + Past Questions) =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setView('landing')} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <span className="text-lg font-bold tracking-tight">StudyVault</span>
          </button>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button onClick={() => setTab('past-questions')} className={tab === 'past-questions' ? 'text-amber-400' : 'hover:text-amber-400 transition-colors'}>Past Questions</button>
            <button onClick={() => setTab('books')} className={tab === 'books' ? 'text-amber-400' : 'hover:text-amber-400 transition-colors'}>Library</button>
            <a href="https://pensattu.com" className="hover:text-amber-400 transition-colors">Main Site</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setView('profile')} className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 font-bold text-sm hover:ring-2 hover:ring-amber-400/50 transition-all" title="View profile">
                  {user.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </button>
                <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-amber-400 transition-colors font-medium">Log out</button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg shadow-amber-500/20">Log In</button>
            )}
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {tab === 'past-questions' ? 'Past Questions' : 'Digital Library'}
            </h1>
            <p className="text-slate-400">
              {tab === 'past-questions'
                ? 'Browse, search, and download past examination questions.'
                : 'Browse, read, and download books and study resources.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setTab('past-questions')} className={`px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${tab === 'past-questions' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
            📝 Past Questions
          </button>
          <button onClick={() => setTab('books')} className={`px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${tab === 'books' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
            📖 Books
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              type="text"
              placeholder={tab === 'past-questions' ? 'Search by course code or title...' : 'Search by title or author...'}
              value={tab === 'past-questions' ? search : bookSearch}
              onChange={(e) => tab === 'past-questions' ? setSearch(e.target.value) : setBookSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder-slate-600"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            {tab === 'past-questions' ? (
              <>
                <select value={filters.year} onChange={(e) => updateFilter('year', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-300">
                  <option value="">All Years</option>
                  {pqMeta.years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={filters.semester} onChange={(e) => updateFilter('semester', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-300">
                  <option value="">All Semesters</option>
                  {pqMeta.semesters.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filters.level} onChange={(e) => updateFilter('level', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-300">
                  <option value="">All Levels</option>
                  {pqMeta.levels.map((l) => <option key={l} value={l}>Level {l}</option>)}
                </select>
                <select value={filters.exam_type} onChange={(e) => updateFilter('exam_type', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-300">
                  <option value="">All Types</option>
                  {pqMeta.examTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filters.programme} onChange={(e) => updateFilter('programme', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-300">
                  <option value="">All Programmes</option>
                  {pqMeta.programmes.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </>
            ) : (
              <select value={bookCategory} onChange={(e) => setBookCategory(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 text-slate-300">
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="px-4 py-3 rounded-xl border border-slate-700 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="text-sm text-slate-500">
          {tab === 'past-questions'
            ? (pqLoading ? 'Loading...' : `${questions.length} past question${questions.length !== 1 ? 's' : ''} found`)
            : (booksLoading ? 'Loading...' : `${books.length} book${books.length !== 1 ? 's' : ''} found`)}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {tab === 'past-questions' ? (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {!pqLoading && questions.map((q) => (
              <div key={q.id} className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-amber-500/30 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1">
                <div className="h-40 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 flex items-center justify-center relative overflow-hidden">
                  <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">📝</span>
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-amber-400 border border-amber-500/20">{q.exam_type}</div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-medium">{q.course_code}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 text-xs">Level {q.level}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-amber-400 transition-colors line-clamp-1">{q.course_title}</h3>
                  <p className="text-slate-500 text-sm mb-3">{q.year} • {q.semester}{q.programme ? ` • ${q.programme}` : ''}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      {q.downloads || 0}
                    </div>
                    <button onClick={() => handleDownload(q)} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm transition-all">
                      {auth.isLoggedIn() ? 'Download' : 'Log in'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!pqLoading && questions.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-500">
                <span className="text-5xl block mb-4">🔍</span>
                <p>No past questions found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {!booksLoading && books.map((book) => (
              <div key={book.id} className="group bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-amber-500/30 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1">
                <div className="h-40 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 flex items-center justify-center relative overflow-hidden">
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">📖</span>
                  )}
                  {book.file_type && (
                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-amber-400 border border-amber-500/20 uppercase">{book.file_type.split('/').pop()}</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {book.category && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">{book.category}</span>}
                    {book.is_readable && <span className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-400 text-xs">Readable</span>}
                  </div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-amber-400 transition-colors line-clamp-1">{book.title}</h3>
                  {book.author && <p className="text-slate-500 text-sm mb-3">by {book.author}</p>}
                  {book.description && <p className="text-slate-500 text-sm mb-3 line-clamp-2">{book.description}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      {book.downloads || 0}
                    </div>
                    <div className="flex gap-2">
                      {book.is_readable && (
                        <button onClick={() => handleReadBook(book)} className="border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 px-4 py-2 rounded-lg font-semibold text-sm transition-all">Read</button>
                      )}
                      <button onClick={() => handleBookDownload(book)} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm transition-all">
                        {auth.isLoggedIn() ? 'Download' : 'Log in'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!booksLoading && books.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-500">
                <span className="text-5xl block mb-4">🔍</span>
                <p>No books found. Try adjusting your search.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-8 py-8 text-center">
          <p className="text-slate-500 text-sm">StudyVault — PENSA TTU Library</p>
          <p className="text-slate-600 text-xs mt-1">Pentecost Students and Associates, Takoradi Technical University</p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-5" onClick={() => setShowLoginModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md">
            <AuthPage onSuccess={handleAuthSuccess} />
            <button className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-amber-500 text-slate-900 font-bold text-xl flex items-center justify-center shadow-lg" onClick={() => setShowLoginModal(false)}>×</button>
          </div>
        </div>
      )}
      <PwaPrompt />
    </div>
  );
}
