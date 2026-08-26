import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminApi, isLoggedIn } from './adminApi';
import './admin.css';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/ministries', label: 'Ministries' },
  { to: '/admin/sermons', label: 'Sermons' },
  { to: '/admin/team', label: 'Team' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/announcements', label: 'Announcements' },
  { to: '/admin/notices', label: 'Notices' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/past-questions', label: 'Past Questions' },
  { to: '/admin/visits', label: 'Visits' },
  { to: '/admin/subscribers', label: 'Subscribers' },
  { to: '/admin/contacts', label: 'Messages' },
  { to: '/admin/users', label: 'Admins' },
];

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/admin/login', { replace: true });
      return;
    }
    adminApi.me().then((res) => setUser(res.user)).catch(() => {
      navigate('/admin/login', { replace: true });
    });
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem('pensa_admin_token');
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar${menuOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-head">
          <Link to="/admin/dashboard" className="admin-logo">PENSA <span>Admin</span></Link>
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
    </div>
  );
}
