// Layout.jsx — Sidebar + Navbar + main content area
import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';

const allMenuItems = [
  { to: '/', icon: 'bxs-dashboard', label: 'Dashboard', end: true, adminOnly: false },
  { to: '/newbies', icon: 'bxs-user-pin', label: 'Newbies', adminOnly: true },
  { to: '/members', icon: 'bxs-group', label: 'Members', end: false, adminOnly: false },
  { to: '/attendance', icon: 'bxs-doughnut-chart', label: 'Attendance', adminOnly: true },
  { to: '/messages', icon: 'bxs-message-dots', label: 'Messages', adminOnly: true },
  { to: '/halls', icon: 'bx-building', label: 'Halls & Residences', adminOnly: false },
  { to: '/alumni', icon: 'bxs-graduation', label: 'Alumni', adminOnly: false },
  { to: '/export', icon: 'bx-export', label: 'Export', adminOnly: true },
  { to: '/reports', icon: 'bxs-report', label: 'Reports', adminOnly: false },
];

export default function Layout({ children }) {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleMenuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      <section id="sidebar" className={sidebarHidden ? 'hide' : ''}>
        <Link to="/" className="brand">
          <i className='bx bxs-smile'></i>
          <span className="text">PENSA TTU</span>
        </Link>
        <ul className="side-menu top">
          {visibleMenuItems.map(item => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end}>
                <i className={`bx ${item.icon}`}></i>
                <span className="text">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <ul className="side-menu">
          {isAdmin && (
            <li>
              <NavLink to="/settings">
                <i className='bx bxs-cog'></i>
                <span className="text">Settings</span>
              </NavLink>
            </li>
          )}
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="logout">
              <i className='bx bxs-log-out-circle'></i>
              <span className="text">Logout</span>
            </a>
          </li>
        </ul>
      </section>

      <section id="content">
        <nav>
          <i className='bx bx-menu' onClick={() => setSidebarHidden(!sidebarHidden)}></i>
          <span className="nav-link">Member Management</span>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-input">
              <input type="search" placeholder="Search..." />
              <button type="submit"><i className='bx bx-search'></i></button>
            </div>
          </form>
          <div className="profile" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--dark)' }}>{user?.username || 'User'}</div>
              <span style={{
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                display: 'inline-block',
                background: isAdmin ? '#e8f8f5' : '#f0f3f4',
                color: isAdmin ? '#16a085' : '#7f8c8d',
                border: isAdmin ? '1px solid #a3e4d7' : '1px solid #bdc3c7'
              }}>
                {isAdmin ? 'Admin' : 'Read-only'}
              </span>
            </div>
            <i className='bx bxs-user-circle' style={{ fontSize: 32, color: 'var(--blue)' }}></i>
          </div>
        </nav>
        <main>
          {children}
        </main>
      </section>
    </>
  );
}
