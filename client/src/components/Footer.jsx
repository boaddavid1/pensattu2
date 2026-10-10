import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { requestNotificationPermission, showLocalNotification, registerPushSubscription } from '../utils/notifications.js';

export default function Footer() {
  const { navData } = useNavigation();
  const footer = navData?.footer || {};
  const [notifyStatus, setNotifyStatus] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotifyStatus(Notification.permission);
    }
  }, []);

  async function enableNotifications() {
    const { supported, permission } = await requestNotificationPermission();
    if (!supported) {
      alert('Notifications are not supported in this browser.');
      return;
    }
    setNotifyStatus(permission);
    if (permission === 'granted') {
      await registerPushSubscription();
      showLocalNotification(footer.brand_title || 'PENSA TTU', {
        body: `You will now receive updates from ${footer.brand_title || 'PENSA TTU'}.`,
        data: '/',
      });
    }
  }

  const renderSocialIcon = (network, url) => {
    if (!url) return null;
    const labels = {
      facebook: 'f',
      instagram: 'ig',
      youtube: 'yt',
      twitter: 'x',
      tiktok: 'tk',
    };
    return (
      <a
        key={network}
        href={url}
        target={url.startsWith('http') ? '_blank' : '_self'}
        rel="noopener noreferrer"
        aria-label={network}
      >
        {labels[network] || network.slice(0, 2)}
      </a>
    );
  };

  const renderLink = (to, label) => {
    const isExternal = /^https?:\/\//i.test(to);
    if (isExternal) {
      return (
        <a href={to} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      );
    }
    return <Link to={to || '#'}>{label}</Link>;
  };

  const social = footer.social_links || {};
  const columns = footer.columns || [];
  const contact = footer.contact_info || {};

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="foot-logo">
              {footer.brand_title || 'PENSA'} {footer.brand_accent ? <span>{footer.brand_accent}</span> : null}
            </div>
            {footer.brand_tagline && <p>{footer.brand_tagline}</p>}
            <div className="foot-social">
              {Object.entries(social).map(([net, url]) => renderSocialIcon(net, url))}
            </div>
            {footer.show_notifications_btn !== false && (
              <div className="foot-notify">
                {notifyStatus === 'granted' ? (
                  <span>Notifications enabled</span>
                ) : (
                  <button type="button" onClick={enableNotifications}>
                    Enable notifications
                  </button>
                )}
              </div>
            )}
          </div>

          {columns.map((col) => (
            <div key={col.id || col.title}>
              <h4>{col.title}</h4>
              <ul>
                {(col.links || []).map((link) => (
                  <li key={link.id || link.label + link.path}>
                    {renderLink(link.path, link.label)}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4>Visit Us</h4>
            <ul className="foot-contact">
              {contact.address && <li>📍 {contact.address}</li>}
              {contact.email && <li>✉️ {contact.email}</li>}
              {contact.phone && <li>☎ {contact.phone}</li>}
              {contact.service_time && <li>🕊 {contact.service_time}</li>}
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          <span>{footer.copyright_text || '© 2026 PENSA TTU. All rights reserved.'}</span>
          <span>{footer.privacy_terms_text || 'Privacy · Terms'}</span>
        </div>

        {footer.watermark_text && <div className="foot-word">{footer.watermark_text}</div>}
      </div>
    </footer>
  );
}
