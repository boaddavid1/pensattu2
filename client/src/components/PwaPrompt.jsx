import { useEffect, useState } from 'react';
import { requestNotificationPermission, registerPushSubscription, showLocalNotification } from '../utils/notifications.js';

export default function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [notifyStatus, setNotifyStatus] = useState('default');
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const alreadyDismissed = sessionStorage.getItem('pensa-pwa-prompt-dismissed');
    setDismissed(alreadyDismissed === '1');

    if ('Notification' in window) {
      setNotifyStatus(Notification.permission);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const installable = !!deferredPrompt;
    const notificationsPending = notifyStatus === 'default';
    if (!dismissed && (installable || notificationsPending)) {
      setShow(true);
    }
  }, [deferredPrompt, notifyStatus, dismissed]);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }

  async function handleEnableNotifications() {
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

  function handleDismiss() {
    sessionStorage.setItem('pensa-pwa-prompt-dismissed', '1');
    setDismissed(true);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="pwa-prompt-overlay">
      <div className="pwa-prompt">
        <button className="pwa-prompt-close" onClick={handleDismiss} aria-label="Close">✕</button>
        <div className="pwa-prompt-icon">
          <img src="/pwa-icon.svg" alt="PENSA TTU" />
        </div>
        <h3>Stay connected with PENSA TTU</h3>
        <p>Get the latest events, announcements, and updates directly on your device.</p>
        <div className="pwa-prompt-actions">
          {deferredPrompt && (
            <button className="btn btn-primary" onClick={handleInstall}>
              Install app
            </button>
          )}
          {notifyStatus !== 'granted' && notifyStatus !== 'denied' && (
            <button className="btn btn-dark" onClick={handleEnableNotifications}>
              Enable notifications
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
