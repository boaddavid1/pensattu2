import { Link, NavLink } from 'react-router-dom';

const tabs = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/about',
    label: 'About',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="8" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    to: '/sermons',
    label: 'Sermons',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H15l5 5v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M15 4v5h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/events',
    label: 'Events',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/contact',
    label: 'Contact',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 5a2 2 0 0 1 2-2h1.5a1 1 0 0 1 .97.757l.86 3.44a1 1 0 0 1-.5 1.115L7.2 9.2a12 12 0 0 0 6.6 6.6l.888-1.63a1 1 0 0 1 1.115-.5l3.44.86a1 1 0 0 1 .757.97V17a2 2 0 0 1-2 2h-1C10.163 19 5 13.837 5 7.5V6a2 2 0 0 1-1-1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const moreLinks = [
  { to: '/#services', label: 'Ministries' },
  { to: '/leadership', label: 'Leadership' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/notice-board', label: 'News' },
  { to: '/gallery', label: 'Gallery' },
];

export default function MobileTabBar({ moreOpen, setMoreOpen }) {
  return (
    <>
      {moreOpen && (
        <div className="more-menu-backdrop" onClick={() => setMoreOpen(false)}>
          <div className="more-menu" onClick={(e) => e.stopPropagation()}>
            {moreLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMoreOpen(false)}>{link.label}</Link>
            ))}
          </div>
        </div>
      )}
      <nav className="mobile-tabbar" aria-label="Primary mobile navigation">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) => `mobile-tab${isActive ? ' active' : ''}`}
        >
          <span className="mobile-tab-icon">{tab.icon}</span>
          <span className="mobile-tab-label">{tab.label}</span>
        </NavLink>
      ))}
      <button
        type="button"
        className={`mobile-tab${moreOpen ? ' active' : ''}`}
        aria-label="More navigation"
        aria-expanded={moreOpen}
        onClick={() => setMoreOpen(!moreOpen)}
      >
        <span className="mobile-tab-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5" cy="12" r="1.8" fill="currentColor"/>
            <circle cx="12" cy="12" r="1.8" fill="currentColor"/>
            <circle cx="19" cy="12" r="1.8" fill="currentColor"/>
          </svg>
        </span>
        <span className="mobile-tab-label">More</span>
      </button>
      </nav>
    </>
  );
}
