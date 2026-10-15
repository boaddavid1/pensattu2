import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { DEFAULT_CONTACT_SETTINGS } from '../data/defaultPageSettings';

const topics = [
  "What's this about?",
  'Planning a visit',
  'Joining a community group',
  'Prayer request',
  'Volunteering',
  'General question',
];

export default function Contact() {
  const [settings, setSettings] = useState(DEFAULT_CONTACT_SETTINGS);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    topic: topics[0],
    message: '',
  });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get('/contact-settings')
      .then((res) => {
        if (res && typeof res === 'object' && Object.keys(res).length > 0) {
          setSettings((prev) => ({ ...prev, ...res }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const body = {
      name: `${form.first_name} ${form.last_name}`.trim(),
      email: form.email,
      message: `Topic: ${form.topic}\nPhone: ${form.phone || 'N/A'}\n\n${form.message}`,
    };
    try {
      await api.post('/contact', body);
      setStatus('success');
      setForm({ first_name: '', last_name: '', email: '', phone: '', topic: topics[0], message: '' });
    } catch {
      setStatus('error');
    }
  };

  const faqsList = settings.faqs_list || DEFAULT_CONTACT_SETTINGS.faqs_list;

  return (
    <main className="contact-page">
      {/* ─── Hero Banner ─── */}
      <section className="page-hero contact-hero">
        <div className="page-hero-bg">
          <img
            src={settings.hero_image || DEFAULT_CONTACT_SETTINGS.hero_image}
            alt="Greeters welcoming visitors at PENSA TTU"
          />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">{settings.hero_eyebrow || 'Get in touch'}</span>
          <h1>{settings.hero_title || "We'd genuinely love to hear from you."}</h1>
          <p>{settings.hero_desc || 'Questions about a service, a department or team, or just want to say hello...'}</p>
        </div>
      </section>

      {/* ─── Quick Info Cards ─── */}
      <section className="quick">
        <div className="wrap quick-grid">
          <div className="quick-card">
            <div className="ic">📍</div>
            <h3>{settings.visit_title || 'Visit Us'}</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{settings.visit_address || '12 Cantonments Road\nAccra, Ghana'}</p>
            <a href={settings.visit_link || '#map'}>Get directions →</a>
          </div>

          <div className="quick-card">
            <div className="ic">☎</div>
            <h3>{settings.call_title || 'Call Us'}</h3>
            <p>{settings.call_hours || 'Mon–Fri, 9am–5pm'}</p>
            <a href={`tel:${settings.call_phone || '+233553070627'}`}>
              {settings.call_phone || '+233553070627'}
            </a>
          </div>

          <div className="quick-card">
            <div className="ic">✉️</div>
            <h3>{settings.email_title || 'Email Us'}</h3>
            <p>{settings.email_note || 'We reply within 24 hours'}</p>
            <a href={`mailto:${settings.email_address || 'hello@pensattu.example'}`}>
              {settings.email_address || 'hello@pensattu.example'}
            </a>
          </div>

          <div className="quick-card">
            <div className="ic">🕊</div>
            <h3>{settings.service_title || 'Sunday Services'}</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{settings.service_times || '9:00 AM & 11:00 AM\nIn person & online'}</p>
            <Link to={settings.service_link || '/#book'}>Plan your visit →</Link>
          </div>
        </div>
      </section>

      {/* ─── Contact Form & Map ─── */}
      <section className="contact-main" id="form">
        <div className="wrap contact-grid">
          <div className="contact-form-card">
            <span className="eyebrow">{settings.form_eyebrow || 'Send a message'}</span>
            <h2>{settings.form_title || 'How can we help?'}</h2>
            <form className="form-grid" onSubmit={handleSubmit}>
              <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First name" required />
              <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last name" required />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" required />
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone number (optional)" />
              <select name="topic" className="form-full" value={form.topic} onChange={handleChange}>
                {topics.map((t) => <option key={t}>{t}</option>)}
              </select>
              <textarea name="message" className="form-full" rows="4" value={form.message} onChange={handleChange} placeholder="Tell us a bit more..." required></textarea>
              <button type="submit" className="btn btn-primary form-full" style={{ justifyContent: 'center' }} disabled={status === 'sending'}>
                {status === 'success' ? 'Message sent ✓' : status === 'sending' ? 'Sending...' : 'Send message'} <span className="btn-arrow">→</span>
              </button>
              {status === 'error' && <p className="form-full" style={{ color: '#ff9e9e' }}>Something went wrong. Please try again.</p>}
            </form>
          </div>
          <div className="map-panel" id="map">
            <div className="map-frame">
              <iframe
                src="https://www.google.com/maps?q=Cantonments,Accra,Ghana&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="PENSA TTU location"
              ></iframe>
            </div>
            <div className="map-details">
              <h3>Find us on Sunday</h3>
              <ul>
                <li>📍 {settings.visit_address ? settings.visit_address.split('\n')[0] : '12 Cantonments Road, Accra, GH'}</li>
                <li>🚗 Free parking available on-site</li>
                <li>🕊 Doors open 30 minutes before each service</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Service Times ─── */}
      <section className="times">
        <div className="wrap">
          <div className="section-head center">
            <span className="eyebrow">When to join us</span>
            <h2>A few ways to <em>connect this week</em>.</h2>
          </div>
          <div className="times-grid">
            <div className="time-card">
              <div className="day">Sunday</div>
              <h3>9:00 AM &amp; 11:00 AM</h3>
              <p>Our two main worship services, in person and streaming live for anyone joining remotely.</p>
            </div>
            <div className="time-card">
              <div className="day">Wednesday</div>
              <h3>6:30 PM</h3>
              <p>Midweek Bible study — a smaller, slower dive into scripture, open to everyone.</p>
            </div>
            <div className="time-card">
              <div className="day">Throughout the week</div>
              <h3>30+ Community Groups</h3>
              <p>Neighborhood groups meeting across Accra — reach out and we'll connect you to one nearby.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQs ─── */}
      <section className="faq">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Before you visit</span>
            <h2>Common <em>questions</em>.</h2>
          </div>
          <div className="faq-list">
            {faqsList.map((faq, i) => (
              <details className="faq-item" open={i === 0} key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
