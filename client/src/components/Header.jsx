import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const aboutRef = useRef(null);
  const feedRef = useRef(null);
  const { pathname } = useLocation();
  const isAbout = pathname === '/about';

  useEffect(() => {
    if (!aboutOpen && !feedOpen) return;
    const handleClick = (e) => {
      const outsideAbout = aboutRef.current && !aboutRef.current.contains(e.target);
      const outsideFeed = feedRef.current && !feedRef.current.contains(e.target);
      if (outsideAbout && outsideFeed) {
        setAboutOpen(false);
        setFeedOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [aboutOpen, feedOpen]);

  const closeAll = () => {
    setAboutOpen(false);
    setFeedOpen(false);
  };

  const toggleAbout = (e) => {
    e.stopPropagation();
    setFeedOpen(false);
    setAboutOpen(!aboutOpen);
  };

  const toggleFeed = (e) => {
    e.stopPropagation();
    setAboutOpen(false);
    setFeedOpen(!feedOpen);
  };

  return (
    <header>
      <nav className="nav">
        <Link to="/" className="logo">
          <img src="/pwa-icon.svg" alt="PENSA TTU" />
        </Link>
        <ul className="nav-links">
          <li><Link to="/" className={pathname === '/' ? 'active' : ''} onClick={closeAll}>Home</Link></li>
          <li className={`has-dropdown${aboutOpen ? ' open' : ''}`} ref={aboutRef}>
            <div className={`nav-dropdown-trigger${isAbout ? ' active' : ''}`}>
              <Link to="/about" className={`nav-dropdown-btn${isAbout ? ' active' : ''}`} onClick={closeAll}>About</Link>
              <button
                type="button"
                className="nav-dropdown-chevron"
                aria-expanded={aboutOpen}
                aria-label="Toggle About dropdown"
                onClick={toggleAbout}
              >
                <span className="dropdown-caret">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
            <ul className="dropdown">
              <li><Link to="/#services" onClick={closeAll}>Ministries</Link></li>
              <li><Link to="/leadership" onClick={closeAll}>Leadership</Link></li>
            </ul>
          </li>
          <li className={`has-dropdown${feedOpen ? ' open' : ''}`} ref={feedRef}>
            <div className="nav-dropdown-trigger">
              <button
                type="button"
                className="nav-dropdown-btn"
                aria-expanded={feedOpen}
                onClick={toggleFeed}
              >
                Feed
              </button>
              <button
                type="button"
                className="nav-dropdown-chevron"
                aria-expanded={feedOpen}
                aria-label="Toggle Feed dropdown"
                onClick={toggleFeed}
              >
                <span className="dropdown-caret">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
            <ul className="dropdown">
              <li><Link to="/events" onClick={closeAll}>Events</Link></li>
              <li><Link to="/announcements" onClick={closeAll}>Announcements</Link></li>
              <li><Link to="/notice-board" onClick={closeAll}>News</Link></li>
            </ul>
          </li>
          <li><Link to="/sermons" className={pathname === '/sermons' ? 'active' : ''} onClick={closeAll}>Sermons</Link></li>
          <li><Link to="/gallery" className={pathname === '/gallery' ? 'active' : ''} onClick={closeAll}>Gallery</Link></li>
        </ul>
        <div className="nav-right">
          <div className="nav-phone">
            <div className="ic">☎</div>
            <div><strong>+233553070627</strong><small>Sun 6:30am - 9:30am</small></div>
          </div>
          <Link to="/contact" className="btn btn-dark">Contact us</Link>
        </div>
      </nav>
    </header>
  );
}
