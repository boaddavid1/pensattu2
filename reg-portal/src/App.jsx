import { useState, useEffect } from 'react';
import HomeSelector from './HomeSelector.jsx';
import NewbieForm from './NewbieForm.jsx';
import Register from './Register.jsx';

export default function App() {
  const [mode, setMode] = useState('home'); // 'home' | 'newbie' | 'member'
  const [prefillData, setPrefillData] = useState(null);

  // Check URL query parameters on initial mount (e.g. ?mode=newbie or ?continue=024xxxxxxx)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    const continueContact = params.get('continue');

    if (continueContact) {
      handleContinueWithContact(continueContact);
    } else if (modeParam === 'newbie' || modeParam === 'member') {
      setMode(modeParam);
    }
  }, []);

  async function handleContinueWithContact(contact) {
    const cleanPhone = String(contact || '').trim();
    if (!cleanPhone) return;
    try {
      const res = await fetch(`/api/reg/newbie/check/${cleanPhone}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.found && data.newbie) {
        setPrefillData(data.newbie);
      } else {
        setPrefillData({ contact: cleanPhone });
      }
    } catch {
      setPrefillData({ contact: cleanPhone });
    }
    setMode('member');
  }

  function handleBackToHome() {
    setPrefillData(null);
    setMode('home');
    // Clear any query params
    if (window.history.pushState) {
      window.history.pushState({}, '', window.location.pathname);
    }
  }

  if (mode === 'newbie') {
    return (
      <NewbieForm
        onBack={handleBackToHome}
        onCompleteToMember={(data) => {
          setPrefillData(data);
          setMode('member');
        }}
      />
    );
  }

  if (mode === 'member') {
    return (
      <Register
        initialData={prefillData}
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <HomeSelector
      onSelectMode={(selectedMode) => setMode(selectedMode)}
      onContinueWithContact={handleContinueWithContact}
    />
  );
}
