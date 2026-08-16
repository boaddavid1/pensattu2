import { useState } from 'react';

export default function Booking() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', service: '', notes: '' });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
      setForm({ first_name: '', last_name: '', email: '', phone: '', service: '', notes: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="booking" id="book">
      <div className="wrap">
        <div className="booking-card">
          <div className="booking-form">
            <span className="eyebrow">Plan your visit</span>
            <h2>We&apos;d love to <em>welcome</em> you.</h2>
            <form className="form-grid" onSubmit={handleSubmit}>
              <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First name" required />
              <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last name" required />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" required />
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone number" required />
              <select name="service" className="form-full" value={form.service} onChange={handleChange} required>
                <option value="">Which service will you join?</option>
                <option value="9:00 AM Service">9:00 AM Service</option>
                <option value="11:00 AM Service">11:00 AM Service</option>
                <option value="Online / Livestream">Online / Livestream</option>
              </select>
              <textarea name="notes" className="form-full" rows="3" value={form.notes} onChange={handleChange} placeholder="Anything we should know before you visit?"></textarea>
              <button type="submit" className="btn btn-primary form-full" style={{ justifyContent: 'center' }} disabled={status === 'sending'}>
                {status === 'success' ? 'See you Sunday ✓' : status === 'sending' ? 'Sending...' : 'Reserve my seat'} <span className="btn-arrow">→</span>
              </button>
              {status === 'error' && <p className="form-full" style={{ color: '#ff9e9e' }}>Something went wrong. Please try again.</p>}
            </form>
          </div>
          <div className="booking-media">
            <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=700&q=80" alt="Greeter welcoming visitors" />
            <div className="guarantee">
              <div className="ic">✓</div>
              <div>You&apos;ll Be Warmly<br />Welcomed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
