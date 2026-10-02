import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './Register.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal uncaught error:', error, errorInfo);
  }

  handleReset() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((k) => caches.delete(k));
      });
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'sans-serif',
          background: '#f8f9fa',
          color: '#13357e',
          textAlign: 'center',
        }}>
          <img src="/pns.png" alt="PENSA" style={{ width: 80, height: 80, marginBottom: 16 }} />
          <h2 style={{ margin: '0 0 8px' }}>Unable to load Registration Portal</h2>
          <p style={{ color: '#6c757d', maxWidth: 450, margin: '0 0 20px', fontSize: '0.95rem' }}>
            A newer version of the portal is available or cached data needs to be refreshed.
          </p>
          <button
            type="button"
            onClick={() => this.handleReset()}
            style={{
              background: '#13357e',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(19, 53, 126, 0.25)',
            }}
          >
            Clear Cache &amp; Reload
          </button>
          {this.state.error && (
            <pre style={{
              marginTop: 24,
              fontSize: '0.75rem',
              color: '#dc3545',
              background: '#fff',
              padding: 12,
              borderRadius: 6,
              maxWidth: 600,
              overflow: 'auto',
              border: '1px solid #e9ecef',
            }}>
              {String(this.state.error?.message || this.state.error)}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.update();
      })
      .catch((err) => {
        console.error('Service worker registration failed:', err);
      });
  });
}

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
