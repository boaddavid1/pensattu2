import { useState } from 'react';
import './Register.css';

const INITIAL = {
  name: '',
  contact: '',
  residence: '',
  program: '',
  membership: 'member',
};

export default function NewbieForm({ onBack, onCompleteToMember }) {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [submittedData, setSubmittedData] = useState(null);

  function showToast(message, type = 'info') {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    if (!form.name.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!/^[0-9]{10}$/.test(form.contact.trim())) {
      showToast('Contact number must be exactly 10 digits', 'error');
      return;
    }
    if (!form.residence.trim()) {
      showToast('Please enter your residence/hostel/hall', 'error');
      return;
    }
    if (!form.program.trim()) {
      showToast('Please enter your program of study', 'error');
      return;
    }
    if (!form.membership) {
      showToast('Please select your membership type', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reg/newbie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast('Registration submitted successfully!', 'success');
        setSubmittedData({ ...form, id: data.data?.id });
      } else {
        showToast(data.message || 'Submission failed. Please try again.', 'error');
      }
    } catch {
      showToast('Connection error. Please check your network and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedData) {
    return (
      <main className="reg-page">
        <div className="reg-container" style={{ maxWidth: 650 }}>
          <div className="reg-success">
            <div className="reg-success-icon">✓</div>
            <h2>Newbie Registration Received!</h2>
            <p style={{ fontSize: '1.1rem', margin: '8px 0 16px' }}>
              Thank you, <strong>{submittedData.name}</strong>!
            </p>
            <p style={{ color: '#6c757d', marginBottom: 24, lineHeight: 1.6 }}>
              Your basic information has been registered. An executive from the secretariat will review your details,
              or you can proceed directly to complete the full membership form.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="reg-btn reg-btn-primary"
                onClick={() => onCompleteToMember(submittedData)}
              >
                Complete Full Registration Now &rarr;
              </button>
              <button
                type="button"
                className="reg-btn reg-btn-outline"
                onClick={onBack}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="reg-page">
      <div className="reg-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`reg-toast ${t.type}`}>
            <span>{t.message}</span>
            <button className="reg-toast-x" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>
              &times;
            </button>
          </div>
        ))}
      </div>

      <div className="reg-container" style={{ maxWidth: 700 }}>
        {/* Header */}
        <div className="reg-header">
          <div className="reg-logo-container">
            <img src="/pns.png" alt="PENSA Logo" />
            <div className="reg-logo-text">
              <h1>PENSA TTU</h1>
              <p>Newbie / Quick Registration</p>
            </div>
          </div>
        </div>

        <form className="reg-card" onSubmit={handleSubmit} style={{ padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 className="reg-section-title" style={{ margin: 0 }}>🌱 Newbie Information</h3>
            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--reg-blue)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              &larr; Back to Selection
            </button>
          </div>

          <p style={{ color: '#6c757d', fontSize: '0.92rem', marginBottom: 24 }}>
            Please fill in your basic details below. This takes less than a minute.
          </p>

          {/* Full Name */}
          <div className="reg-row">
            <div className="reg-col-12">
              <label className="reg-label req">FULL NAME</label>
              <input
                className="reg-input"
                placeholder="e.g., John Kwabena Mensah"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Contact */}
          <div className="reg-row">
            <div className="reg-col-12">
              <label className="reg-label req">CONTACT NUMBER</label>
              <input
                type="tel"
                className="reg-input"
                pattern="[0-9]{10}"
                placeholder="10-digit phone number (e.g., 0241234567)"
                value={form.contact}
                onChange={(e) => setField('contact', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Residence */}
          <div className="reg-row">
            <div className="reg-col-12">
              <label className="reg-label req">RESIDENCE (HOSTEL / CAMPUS HALL / LOCATION)</label>
              <input
                className="reg-input"
                placeholder="e.g., Nzema Hall Room 204, or Crystal Hostel"
                value={form.residence}
                onChange={(e) => setField('residence', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Program */}
          <div className="reg-row">
            <div className="reg-col-12">
              <label className="reg-label req">PROGRAM OF STUDY</label>
              <input
                className="reg-input"
                placeholder="e.g., HND Mechanical Engineering, B-Tech Computer Science"
                value={form.program}
                onChange={(e) => setField('program', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Membership Type */}
          <div className="reg-row">
            <div className="reg-col-12">
              <label className="reg-label req">MEMBERSHIP TYPE</label>
              <div style={{ display: 'flex', gap: 24, marginTop: 6 }}>
                <label className="reg-check">
                  <input
                    type="radio"
                    name="membership"
                    value="member"
                    checked={form.membership === 'member'}
                    onChange={() => setField('membership', 'member')}
                  />
                  <span>MEMBER (COP Background)</span>
                </label>
                <label className="reg-check">
                  <input
                    type="radio"
                    name="membership"
                    value="associate"
                    checked={form.membership === 'associate'}
                    onChange={() => setField('membership', 'associate')}
                  />
                  <span>ASSOCIATE (Other Denomination)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Nav / Submit Buttons */}
          <div className="reg-nav" style={{ marginTop: 28 }}>
            <button type="button" className="reg-btn reg-btn-secondary" onClick={onBack}>
              &larr; Back
            </button>
            <button
              type="submit"
              className="reg-btn reg-btn-success"
              disabled={submitting}
              style={{ padding: '12px 28px', fontSize: '1rem' }}
            >
              {submitting ? 'Submitting...' : '✓ Submit Newbie Registration'}
            </button>
          </div>
        </form>

        <div className="reg-signature">PENSA TTU &bull; Pentecost Students and Associates</div>
      </div>
    </main>
  );
}
