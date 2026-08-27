// Layout.jsx — Sidebar + Navbar
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext.jsx';

const menuItems = [
  { to: '/', icon: 'bxs-dashboard', label: 'Dashboard', end: true },
  { to: '/messages', icon: 'bxs-message-dots', label: 'Messages' },
  { to: '/broadcast', icon: 'bx-broadcast', label: 'Broadcast' },
  { to: '/prayer', icon: 'bxs-message-rounded', label: 'Prayer' },
  { to: '/import-old', icon: 'bx-file-import', label: 'Import Old List' },
];

export default function Layout({ children }) {
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <section id="sidebar" className={sidebarHidden ? 'hide' : ''}>
        <NavLink to="/" className="brand">
          <img src="/pns.png" alt="PENSA" />
          <span className="text">PENSA TTU</span>
        </NavLink>
        <ul className="side-menu top">
          {menuItems.map(item => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end}>
                <i className={`bx ${item.icon}`}></i>
                <span className="text">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <ul className="side-menu">
          <li>
            <NavLink to="/settings">
              <i className='bx bxs-cog'></i>
              <span className="text">Settings</span>
            </NavLink>
          </li>
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
          <span className="nav-link">Alumni Portal</span>
          <div className="profile">
            <span>{user?.username || 'Admin'}</span>
            <i className='bx bxs-user-circle' style={{ fontSize: 28, marginLeft: 8 }}></i>
          </div>
        </nav>
        <main>
          {children}
        </main>
      </section>
    </>
  );
}
