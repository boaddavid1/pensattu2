import React from 'react';

export default function HomeSelector({ onSelectMode, onContinueWithContact }) {
  const [contactInput, setContactInput] = React.useState('');
  const [showContinueInput, setShowContinueInput] = React.useState(false);

  function handleContinueSubmit(e) {
    e.preventDefault();
    if (!contactInput.trim()) return;
    onContinueWithContact(contactInput.trim());
  }

  return (
    <main className="reg-page">
      <div className="reg-container" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div className="reg-header">
          <div className="reg-logo-container">
            <img src="/pns.png" alt="PENSA Logo" />
            <div className="reg-logo-text">
              <h1>PENSA TTU</h1>
              <p>Pentecost Students and Associates — Takoradi Technical University</p>
            </div>
          </div>
        </div>

        {/* Welcome Banner */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 32,
            padding: '20px 16px',
            background: '#ffffff',
            borderRadius: 'var(--reg-radius)',
            boxShadow: 'var(--reg-shadow-sm)',
          }}
        >
          <h2 style={{ fontSize: '1.6rem', color: 'var(--reg-blue)', margin: 0, fontWeight: 700 }}>
            Welcome to Member Registration
          </h2>
          <p style={{ color: '#6c757d', marginTop: 8, fontSize: '1rem' }}>
            Please select the registration form that applies to you:
          </p>
        </div>

        {/* 2 Options Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            marginBottom: 32,
          }}
        >
          {/* Option 1: Newbie */}
          <div
            className="reg-card"
            style={{
              padding: 32,
              borderRadius: 'var(--reg-radius)',
              boxShadow: 'var(--reg-shadow-md)',
              borderTop: '6px solid var(--reg-yellow)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'var(--reg-transition)',
            }}
          >
            <div>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255, 204, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  marginBottom: 16,
                }}
              >
                🌱
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--reg-blue)', marginBottom: 8, fontWeight: 700 }}>
                Newbie Registration
              </h3>
              <p style={{ color: '#555', fontSize: '0.95rem', minHeight: 48, marginBottom: 16 }}>
                New to PENSA TTU or registering for the first time? Fill out this quick 1-minute form with basic details.
              </p>
              <div
                style={{
                  background: '#f8f9fa',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  color: '#495057',
                  marginBottom: 24,
                  borderLeft: '3px solid var(--reg-yellow)',
                }}
              >
                ✓ Name &bull; Contact &bull; Residence &bull; Program &bull; Membership
              </div>
            </div>
            <button
              type="button"
              className="reg-btn"
              onClick={() => onSelectMode('newbie')}
              style={{
                background: 'var(--reg-yellow-grad)',
                color: '#13357e',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '14px 20px',
                width: '100%',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 204, 0, 0.35)',
              }}
            >
              Start Newbie Form &rarr;
            </button>
          </div>

          {/* Option 2: Member */}
          <div
            className="reg-card"
            style={{
              padding: 32,
              borderRadius: 'var(--reg-radius)',
              boxShadow: 'var(--reg-shadow-md)',
              borderTop: '6px solid var(--reg-blue)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'var(--reg-transition)',
            }}
          >
            <div>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(19, 53, 126, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  marginBottom: 16,
                }}
              >
                ⛪
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--reg-blue)', marginBottom: 8, fontWeight: 700 }}>
                Member Registration
              </h3>
              <p style={{ color: '#555', fontSize: '0.95rem', minHeight: 48, marginBottom: 16 }}>
                Full official registration for returning students and members to select departments, upload photo ID, and enter guardian info.
              </p>
              <div
                style={{
                  background: '#f8f9fa',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  color: '#495057',
                  marginBottom: 24,
                  borderLeft: '3px solid var(--reg-blue)',
                }}
              >
                ✓ 6-Step Wizard &bull; Departments &bull; Photo &bull; Hall/Hostel
              </div>
            </div>
            <button
              type="button"
              className="reg-btn reg-btn-primary"
              onClick={() => onSelectMode('member')}
              style={{
                fontSize: '1rem',
                padding: '14px 20px',
                width: '100%',
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              Start Member Form &rarr;
            </button>
          </div>
        </div>

        {/* Continuation Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--reg-radius)',
            padding: 24,
            boxShadow: 'var(--reg-shadow-sm)',
            textAlign: 'center',
            border: '1px solid #e9ecef',
          }}
        >
          <h4 style={{ margin: 0, color: 'var(--reg-blue)', fontSize: '1.05rem', fontWeight: 600 }}>
            Already filled the Newbie form?
          </h4>
          <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: '6px 0 16px' }}>
            If an executive pushed your registration or you are ready to complete the full form, enter your phone number to pre-fill your details.
          </p>

          {!showContinueInput ? (
            <button
              type="button"
              className="reg-btn reg-btn-outline"
              onClick={() => setShowContinueInput(true)}
              style={{ padding: '8px 20px', fontSize: '0.9rem' }}
            >
              Continue with my Phone Number &rarr;
            </button>
          ) : (
            <form
              onSubmit={handleContinueSubmit}
              style={{ display: 'flex', gap: 10, maxWidth: 420, margin: '0 auto' }}
            >
              <input
                type="tel"
                pattern="[0-9]{10}"
                className="reg-input"
                placeholder="Enter 10-digit phone number"
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                required
                style={{ flex: 1, padding: '10px 14px' }}
              />
              <button
                type="submit"
                className="reg-btn reg-btn-primary"
                style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
              >
                Continue &rarr;
              </button>
            </form>
          )}
        </div>

        <div className="reg-signature" style={{ marginTop: 32 }}>
          PENSA TTU &bull; Pentecost Students and Associates
        </div>
      </div>
    </main>
  );
}
