import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Swap manifest and service worker based on the current route so the
// admin portal installs as its own PWA with its own icon and theme.
function setupPwa() {
  const isAdmin = window.location.pathname.startsWith('/control-panel');

  // Swap manifest link
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    manifestLink.href = isAdmin ? '/control-panel-manifest.json' : '/manifest.json';
  }

  // Swap theme color
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.content = isAdmin ? '#1a1a2e' : '#2c5f4a';
  }

  // Swap favicon
  const iconLinks = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');
  iconLinks.forEach((link) => {
    if (link.href.includes('pwa-icon')) {
      link.href = isAdmin ? '/cp-icon-192.png' : '/pwa-icon-192.png';
    }
  });
}

setupPwa();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const isAdmin = window.location.pathname.startsWith('/control-panel');
    const swPath = isAdmin ? '/cp-sw.js' : '/sw.js';
    navigator.serviceWorker.register(swPath).catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
