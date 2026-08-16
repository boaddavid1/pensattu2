import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="news" id="newsletter">
      <div className="wrap">
        <div className="news-box">
          <h2>Get <em>weekly encouragement</em> — a short note every Friday.</h2>
          <form className="news-form" onSubmit={handleSubmit}>
            <input type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" className="btn btn-dark">{status === 'success' ? 'Subscribed ✓' : status === 'sending' ? '...' : 'Subscribe'}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
