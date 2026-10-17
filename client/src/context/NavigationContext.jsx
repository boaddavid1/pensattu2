import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export const defaultNavigation = {
  navbar: {
    logo_type: 'image',
    logo_image: '/images/pensa.jpg',
    logo_text: 'PENSA TTU',
    phone: '+233553070627',
    service_time: 'Sun 6:30am - 9:30am',
    cta_label: 'Contact us',
    cta_link: '/contact',
    cta_show: true,
    links: [
      { id: 'nav-home', label: 'Home', path: '/', is_dropdown: false },
      {
        id: 'nav-about',
        label: 'About',
        path: '/about',
        is_dropdown: true,
        children: [
          { id: 'sub-about', label: 'About Us', path: '/about' },
          { id: 'sub-dept', label: 'Departments & Teams', path: '/departments-and-teams' },
          { id: 'sub-leadership', label: 'Leadership', path: '/leadership' },
        ],
      },
      { id: 'nav-departments', label: 'Departments & Teams', path: '/departments-and-teams', is_dropdown: false },
      {
        id: 'nav-feed',
        label: 'Feed',
        path: '',
        is_dropdown: true,
        children: [
          { id: 'sub-events', label: 'Events', path: '/events' },
          { id: 'sub-news', label: 'News', path: '/notice-board' },
        ],
      },
      { id: 'nav-sermons', label: 'Sermons', path: '/sermons', is_dropdown: false },
      { id: 'nav-gallery', label: 'Gallery', path: '/gallery', is_dropdown: false },
    ],
  },
  footer: {
    brand_title: 'PENSA',
    brand_accent: 'TTU',
    brand_tagline: 'A church community in Accra built on honest worship, real friendship, and a Word that meets you where you are.',
    watermark_text: 'PENSA TTU',
    copyright_text: '© 2026 PENSA TTU. All rights reserved.',
    privacy_terms_text: 'Privacy · Terms',
    show_notifications_btn: true,
    social_links: {
      facebook: '#',
      instagram: '#',
      youtube: '#',
      twitter: '',
      tiktok: '',
    },
    contact_info: {
      address: '12 Cantonments Road, Accra, GH',
      email: 'hello@pensattu.example',
      phone: '+233553070627',
      service_time: 'Sundays, 6:30 AM - 9:30 AM',
    },
    columns: [
      {
        id: 'col-1',
        title: 'Church',
        links: [
          { id: 'c1-1', label: 'About Us', path: '/about' },
          { id: 'c1-3', label: 'Departments & Teams', path: '/departments-and-teams' },
          { id: 'c1-4', label: 'Leadership', path: '/leadership' },
          { id: 'c1-5', label: 'Sermons', path: '/sermons' },
          { id: 'c1-6', label: 'Contact', path: '/contact' },
        ],
      },
      {
        id: 'col-2',
        title: 'Departments & Teams',
        links: [
          { id: 'c2-1', label: 'Worship & Music', path: '/departments-and-teams' },
          { id: 'c2-2', label: 'Youth & Kids', path: '/departments-and-teams' },
          { id: 'c2-3', label: 'Outreach & Missions', path: '/departments-and-teams' },
          { id: 'c2-4', label: 'Bible Study & Prayer', path: '/departments-and-teams' },
        ],
      },
    ],
  },
};

// Normalize and deduplicate navigation links so "Ministries" is seamlessly replaced by "Departments & Teams"
function cleanNavData(raw) {
  if (!raw) return defaultNavigation;
  const nav = JSON.parse(JSON.stringify(raw));

  const sanitizeLink = (link) => {
    if (!link) return null;
    let path = link.path || '';
    let label = link.label || '';
    if (path === '/ministries' || path === '/ministry' || path === '/departments') {
      path = '/departments-and-teams';
    }
    if (label.toLowerCase() === 'ministries') {
      label = 'Departments & Teams';
    }
    const children = Array.isArray(link.children)
      ? dedupeList(link.children.map(sanitizeLink).filter(Boolean))
      : undefined;

    return {
      ...link,
      path,
      label,
      ...(children ? { children } : {}),
    };
  };

  const dedupeList = (items) => {
    if (!Array.isArray(items)) return [];
    const seen = new Set();
    const result = [];
    for (const it of items) {
      if (!it) continue;
      const key = (it.path || '').toLowerCase();
      if (key === '/departments-and-teams' || (it.label && it.label.toLowerCase() === 'departments & teams')) {
        if (seen.has('dept-teams')) continue;
        seen.add('dept-teams');
      } else if (key && seen.has(key)) {
        continue;
      } else if (key) {
        seen.add(key);
      }
      result.push(it);
    }
    return result;
  };

  if (nav.navbar && Array.isArray(nav.navbar.links)) {
    const mapped = nav.navbar.links.map(sanitizeLink).filter(Boolean);
    nav.navbar.links = dedupeList(mapped);
  }

  if (nav.footer && Array.isArray(nav.footer.columns)) {
    nav.footer.columns = nav.footer.columns.map((col) => {
      let title = col.title || '';
      if (title.toLowerCase() === 'ministries & teams' || title.toLowerCase() === 'ministries') {
        title = 'Departments & Teams';
      }
      const links = Array.isArray(col.links)
        ? dedupeList(col.links.map(sanitizeLink).filter(Boolean))
        : [];
      return { ...col, title, links };
    });
  }

  return nav;
}

const NavigationContext = createContext({
  navData: defaultNavigation,
  loading: false,
  reloadNav: () => {},
});

export function NavigationProvider({ children }) {
  const [navData, setNavData] = useState(defaultNavigation);
  const [loading, setLoading] = useState(true);

  const fetchNav = useCallback(async () => {
    try {
      const data = await api.get('/navigation');
      if (data && (data.navbar || data.footer)) {
        const merged = {
          navbar: { ...defaultNavigation.navbar, ...(data.navbar || {}) },
          footer: { ...defaultNavigation.footer, ...(data.footer || {}) },
        };
        setNavData(cleanNavData(merged));
      }
    } catch {
      // Use fallback default
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNav();

    const handleCustomUpdate = (e) => {
      if (e.detail) {
        setNavData(cleanNavData(e.detail));
      } else {
        fetchNav();
      }
    };

    window.addEventListener('pensa-navigation-updated', handleCustomUpdate);
    return () => window.removeEventListener('pensa-navigation-updated', handleCustomUpdate);
  }, [fetchNav]);

  return (
    <NavigationContext.Provider value={{ navData, loading, reloadNav: fetchNav }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
