import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminApi, isLoggedIn } from './adminApi';
import './admin.css';

const navItems = [
  { to: '/control-panel/dashboard', label: 'Dashboard' },
  { to: '/control-panel/ministries', label: 'Ministries' },
  { to: '/control-panel/sermons', label: 'Sermons' },
  { to: '/control-panel/team', label: 'Team' },
  { to: '/control-panel/events', label: 'Events' },
  { to: '/control-panel/announcements', label: 'Announcements' },
  { to: '/control-panel/notices', label: 'Notices' },
  { to: '/control-panel/gallery', label: 'Gallery' },
  { to: '/control-panel/past-questions', label: 'Past Questions' },
  { to: '/control-panel/books', label: 'Books' },
  { to: '/control-panel/prayers', label: 'Prayers' },
  { to: '/control-panel/registrations', label: 'Registrations' },
  { to: '/control-panel/visits', label: 'Visits' },
  { to: '/control-panel/subscribers', label: 'Subscribers' },
  { to: '/control-panel/contacts', label: 'Messages' },
  { to: '/control-panel/users', label: 'Admins' },
];

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/control-panel/login', { replace: true });
      return;
    }
    adminApi.me().then((res) => setUser(res.user)).catch(() => {
      navigate('/control-panel/login', { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    // Ensure the admin manifest is active when on /control-panel/*
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) manifestLink.href = '/control-panel-manifest.json';
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = '#1a1a2e';
  }, []);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('cp-pwa-dismissed');
    if (dismissed === '1') return;
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  }

  function handleDismissInstall() {
    sessionStorage.setItem('cp-pwa-dismissed', '1');
    setInstallPrompt(null);
  }

  function handleLogout() {
    sessionStorage.removeItem('pensa_admin_token');
    navigate('/control-panel/login', { replace: true });
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar${menuOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-head">
          <Link to="/control-panel/dashboard" className="admin-logo">PENSA <span>Admin</span></Link>
          <button className="admin-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={pathname === item.to ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          {user && <div className="admin-user">{user.name} <small>{user.role}</small></div>}
          <button className="admin-logout" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <div className={`admin-overlay${menuOpen ? ' show' : ''}`} onClick={() => setMenuOpen(false)} />
      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open menu">☰</button>
          <span className="admin-page-title">Super Admin Portal</span>
          <a href="/" className="admin-back-link">← Back to site</a>
        </header>
        <div className="admin-content">{children}</div>
      </main>
      {installPrompt && (
        <div className="cp-install-prompt">
          <img src="/cp-icon-192.png" alt="PENSA Admin" />
          <div>
            <strong>Install Admin App</strong>
            <p>Add to your home screen for quick access.</p>
          </div>
          <div className="cp-install-actions">
            <button className="cp-install-btn" onClick={handleInstall}>Install</button>
            <button className="cp-dismiss-btn" onClick={handleDismissInstall}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
