import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import { getImageUrl } from '../api';

export default function Header() {
  const { navData } = useNavigation();
  const navbar = navData?.navbar || {};
  const links = navbar.links || [];

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const navRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!openDropdownId) return;
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openDropdownId]);

  const closeAll = () => {
    setOpenDropdownId(null);
  };

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  const isLinkActive = (item) => {
    if (item.path && pathname === item.path) return true;
    if (item.is_dropdown && Array.isArray(item.children)) {
      return item.children.some((child) => child.path === pathname);
    }
    return false;
  };

  const renderLink = (to, label, className = '', onClick = closeAll) => {
    const isExternal = /^https?:\/\//i.test(to);
    if (isExternal) {
      return (
        <a href={to} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
          {label}
        </a>
      );
    }
    return (
      <Link to={to || '#'} className={className} onClick={onClick}>
        {label}
      </Link>
    );
  };

  return (
    <header>
      <nav className="nav" ref={navRef}>
        <Link to="/" className="logo" onClick={closeAll}>
          {navbar.logo_image ? (
            <img src={getImageUrl(navbar.logo_image)} alt={navbar.logo_text || 'PENSA TTU'} />
          ) : (
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
              {navbar.logo_text || 'PENSA TTU'}
            </span>
          )}
        </Link>

        <ul className="nav-links">
          {links.map((item) => {
            const isOpen = openDropdownId === item.id;
            const active = isLinkActive(item);

            if (item.is_dropdown && Array.isArray(item.children) && item.children.length > 0) {
              return (
                <li key={item.id} className={`has-dropdown${isOpen ? ' open' : ''}`}>
                  <div className={`nav-dropdown-trigger${active ? ' active' : ''}`}>
                    {item.path ? (
                      renderLink(item.path, item.label, `nav-dropdown-btn${active ? ' active' : ''}`, closeAll)
                    ) : (
                      <button
                        type="button"
                        className={`nav-dropdown-btn${active ? ' active' : ''}`}
                        aria-expanded={isOpen}
                        onClick={(e) => toggleDropdown(item.id, e)}
                      >
                        {item.label}
                      </button>
                    )}
                    <button
                      type="button"
                      className="nav-dropdown-chevron"
                      aria-expanded={isOpen}
                      aria-label={`Toggle ${item.label} dropdown`}
                      onClick={(e) => toggleDropdown(item.id, e)}
                    >
                      <span className="dropdown-caret">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                  </div>
                  <ul className="dropdown">
                    {item.children.map((child) => (
                      <li key={child.id || child.path + child.label}>
                        {renderLink(child.path, child.label, pathname === child.path ? 'active' : '', closeAll)}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            return (
              <li key={item.id}>
                {renderLink(item.path, item.label, active ? 'active' : '', closeAll)}
              </li>
            );
          })}
        </ul>

        <div className="nav-right">
          {(navbar.phone || navbar.service_time) && (
            <div className="nav-phone">
              <div className="ic">☎</div>
              <div>
                {navbar.phone && <strong>{navbar.phone}</strong>}
                {navbar.service_time && <small>{navbar.service_time}</small>}
              </div>
            </div>
          )}
          {navbar.cta_show !== false && navbar.cta_label && (
            renderLink(navbar.cta_link || '/contact', navbar.cta_label, 'btn btn-dark', closeAll)
          )}
        </div>
      </nav>
    </header>
  );
}
