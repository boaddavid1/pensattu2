import { api } from '../api.js';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { supported: false, permission: 'unsupported' };
  }

  const permission = await Notification.requestPermission();
  return { supported: true, permission };
}

async function getVapidPublicKey() {
  try {
    const data = await api.get('/vapid-public-key');
    return data.publicKey;
  } catch {
    return null;
  }
}

export async function registerPushSubscription() {
  if (!('serviceWorker' in navigator)) return null;
  const registration = await navigator.serviceWorker.ready;

  if (!registration.pushManager) {
    return null;
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    const publicKey = await getVapidPublicKey();
    if (!publicKey) return null;

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  if (subscription) {
    await api.post('/push-subscribe', {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.toJSON().keys.p256dh,
        auth: subscription.toJSON().keys.auth,
      },
    });
  }

  return subscription;
}

export async function unregisterPushSubscription() {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await api.post('/push-unsubscribe', { endpoint: subscription.endpoint });
    await subscription.unsubscribe();
  }
}

export function showLocalNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: '/pwa-icon.svg',
        badge: '/pwa-icon.svg',
        ...options,
      });
    });
  } else {
    new Notification(title, options);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}
