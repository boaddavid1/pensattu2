import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  });
}

// Remove the loading screen once React has mounted
function removeLoader() {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('hide');
    setTimeout(() => loader.remove(), 600);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Give React a tick to paint, then fade out the loader
setTimeout(removeLoader, 300);
