export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { supported: false, permission: 'unsupported' };
  }

  const permission = await Notification.requestPermission();
  return { supported: true, permission };
}

export async function registerPushSubscription() {
  if (!('serviceWorker' in navigator)) return null;
  const registration = await navigator.serviceWorker.ready;

  if (!registration.pushManager) {
    return null;
  }

  const subscription = await registration.pushManager.getSubscription();
  if (subscription) return subscription;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || ''),
  });
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
