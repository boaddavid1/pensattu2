import { useEffect, useState } from 'react';

export default function PwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('library-pwa-dismissed');
    if (dismissed === '1') return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShow(false);
    }
  }

  function handleDismiss() {
    sessionStorage.setItem('library-pwa-dismissed', '1');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      background: '#1a1a2e', color: '#fff', borderRadius: 16,
      padding: '20px 24px', maxWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <button onClick={handleDismiss} aria-label="Close"
        style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', color: '#888', fontSize: 18, cursor: 'pointer' }}>✕</button>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
        <img src="/pwa-icon-192.png" alt="PENSA Library" style={{ width: 48, height: 48, borderRadius: 10 }} />
        <div>
          <strong style={{ fontSize: 15 }}>Install PENSA Library</strong>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#aaa' }}>Add to your home screen for quick access.</p>
        </div>
      </div>
      <button onClick={handleInstall}
        style={{ width: '100%', padding: '10px', background: '#c4f092', color: '#1a1a2e', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
        Install app
      </button>
    </div>
  );
}
