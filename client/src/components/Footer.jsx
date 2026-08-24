import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { requestNotificationPermission, showLocalNotification, registerPushSubscription } from '../utils/notifications.js';

export default function Footer() {
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
      showLocalNotification('PENSA TTU', {
        body: 'You will now receive updates from PENSA TTU.',
        data: '/',
      });
    }
  }

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="foot-logo">PENSA <span>TTU</span></div>
            <p>A church community in Accra built on honest worship, real friendship, and a Word that meets you where you are.</p>
            <div className="foot-social"><a href="#">f</a><a href="#">ig</a><a href="#">yt</a></div>
            <div className="foot-notify">
              {notifyStatus === 'granted' ? (
                <span>Notifications enabled</span>
              ) : (
                <button type="button" onClick={enableNotifications}>
                  Enable notifications
                </button>
              )}
            </div>
          </div>
          <div>
            <h4>Church</h4>
            <ul><li><Link to="/about">About Us</Link></li><li><Link to="/#services">Ministries</Link></li><li><Link to="/leadership">Leadership</Link></li><li><Link to="/sermons">Sermons</Link></li><li><Link to="/contact">Contact</Link></li></ul>
          </div>
          <div>
            <h4>Ministries</h4>
            <ul><li><Link to="/#services">Worship & Music</Link></li><li><Link to="/#services">Youth & Kids</Link></li><li><Link to="/#services">Outreach</Link></li><li><Link to="/#services">Bible Study</Link></li></ul>
          </div>
          <div>
            <h4>Visit Us</h4>
            <ul className="foot-contact">
              <li>📍 12 Cantonments Road, Accra, GH</li>
              <li>✉️ hello@pensattu.example</li>
              <li>☎ +233 24 000 0000</li>
              <li>🕊 Sundays, 9:00 AM & 11:00 AM</li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 PENSA TTU. All rights reserved.</span>
          <span>Privacy · Terms</span>
        </div>
        <div className="foot-word">PENSA TTU</div>
      </div>
    </footer>
  );
}
