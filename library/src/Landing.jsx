export default function Landing({ onBrowse, onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)"/>
          </svg>
        </div>

        <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">StudyVault</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button onClick={onBrowse} className="hover:text-amber-400 transition-colors">Library</button>
            <button onClick={onBrowse} className="hover:text-amber-400 transition-colors">Past Questions</button>
            <button onClick={onBrowse} className="hover:text-amber-400 transition-colors">Community</button>
            <button onClick={onBrowse} className="hover:text-amber-400 transition-colors">About</button>
          </div>
          <button onClick={onLogin} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40">
            Get Started
          </button>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-amber-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Knowledge Hub for PENSA TTU
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Your Knowledge.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Organized & Accessible.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A centralized library and past question hub built for students. Search, read, and download past questions and books to excel in your studies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={onBrowse} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5">
              Browse Library
            </button>
            <button onClick={onLogin} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all border border-slate-700 hover:border-slate-600">
              Try Past Questions
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-y border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-white">All</div>
            <div className="text-slate-500 text-sm mt-1">Past Questions</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">100-400</div>
            <div className="text-slate-500 text-sm mt-1">Levels</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">Books</div>
            <div className="text-slate-500 text-sm mt-1">Library</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">Free</div>
            <div className="text-slate-500 text-sm mt-1">Access</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Excel</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Powerful tools designed to make studying efficient, organized, and effective.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', title: 'Smart Search', desc: 'Instantly find past questions by course code, year, semester, level, or exam type.' },
            { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', title: 'Past Questions', desc: 'Access past examination questions for all courses. Download to prepare for your exams.' },
            { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', title: 'Digital Library', desc: 'Access curated books, textbooks, and study materials. Read online or download.' },
            { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', title: 'Download Tracking', desc: 'Track your downloads and access them anytime from any device.' },
            { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', title: 'For Everyone', desc: 'Built for PENSA TTU students. Free access to all resources with a simple account.' },
            { icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', title: 'Mobile Friendly', desc: 'Study on the go with a fully responsive design. Access from any device, anywhere.' },
          ].map((f, i) => (
            <div key={i} className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 hover:border-amber-500/30 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={f.icon}/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-800/30 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Get started in three simple steps and begin your journey to academic excellence.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0"></div>

            {[
              { num: '1', title: 'Create Account', desc: 'Sign up for free and get instant access to the library and past questions.' },
              { num: '2', title: 'Browse & Select', desc: 'Explore the library or search past questions by course, year, or exam type.' },
              { num: '3', title: 'Download & Learn', desc: 'Download past questions and books to prepare for your exams anywhere.' },
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="w-24 h-24 bg-slate-800 border-2 border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-amber-400 shadow-lg shadow-amber-500/10">{s.num}</div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20"></div>
        <div className="max-w-4xl mx-auto px-8 py-24 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Ace Your Exams?</h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">Join PENSA TTU Library today. Start your free journey to academic excellence.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onLogin} className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5">
              Start Learning Free
            </button>
            <button onClick={onBrowse} className="bg-transparent hover:bg-white/5 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all border border-white/20 hover:border-white/40">
              Browse Library
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold">StudyVault</span>
                <p className="text-slate-600 text-sm">PENSA TTU Library — Knowledge Hub</p>
              </div>
            </div>
            <a href="https://pensattu.com" className="text-slate-500 hover:text-amber-400 transition-colors text-sm">← Back to main site</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
