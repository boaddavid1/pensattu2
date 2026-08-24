import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const faqs = [
  { q: 'What should I wear?', a: 'Whatever you\'re comfortable in. You\'ll see everything from suits to jeans — there\'s no dress code here.' },
  { q: 'Is there something for my kids?', a: 'Yes — our Kids Ministry runs age-appropriate programming during both Sunday services, with trained volunteers and a secure check-in system.' },
  { q: 'Where do I park?', a: 'Free on-site parking is available, with overflow parking and directions posted on Sunday mornings.' },
  { q: 'Can I watch online if I can\'t make it in person?', a: 'Absolutely — both services stream live, and every message is archived on our Sermons page afterward.' },
  { q: 'How do I join a community group?', a: 'Fill out the form above and select "Joining a community group" — our Community Groups Lead will reach out to match you with one nearby.' },
];

const topics = [
  "What's this about?",
  'Planning a visit',
  'Joining a community group',
  'Prayer request',
  'Volunteering',
  'General question',
];

export default function Contact() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    topic: topics[0],
    message: '',
  });
  const [status, setStatus] = useState(null);

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

  return (
    <main className="contact-page">
      <section className="page-hero contact-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1600&q=80" alt="Greeters welcoming visitors at PENSA TTU" />
        </div>
        <div className="page-hero-inner">
          <span className="eyebrow">Get in touch</span>
          <h1>We'd genuinely love to <em>hear from you</em>.</h1>
          <p>Questions about a service, a ministry, or just want to say hello — reach out and someone from our team will get back to you within a day.</p>
        </div>
      </section>

      <section className="quick">
        <div className="wrap quick-grid">
          <div className="quick-card">
            <div className="ic">📍</div>
            <h3>Visit Us</h3>
            <p>12 Cantonments Road<br />Accra, Ghana</p>
            <a href="#map">Get directions →</a>
          </div>
          <div className="quick-card">
            <div className="ic">☎</div>
            <h3>Call Us</h3>
            <p>Mon–Fri, 9am–5pm</p>
            <a href="tel:+233240000000">+233 24 000 0000</a>
          </div>
          <div className="quick-card">
            <div className="ic">✉️</div>
            <h3>Email Us</h3>
            <p>We reply within 24 hours</p>
            <a href="mailto:hello@pensattu.example">hello@pensattu.example</a>
          </div>
          <div className="quick-card">
            <div className="ic">🕊</div>
            <h3>Sunday Services</h3>
            <p>9:00 AM &amp; 11:00 AM<br />In person &amp; online</p>
            <Link to="/#book">Plan your visit →</Link>
          </div>
        </div>
      </section>

      <section className="contact-main" id="form">
        <div className="wrap contact-grid">
          <div className="contact-form-card">
            <span className="eyebrow">Send a message</span>
            <h2>How can we <em>help</em>?</h2>
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
                <li>📍 12 Cantonments Road, Accra, GH</li>
                <li>🚗 Free parking available on-site</li>
                <li>🕊 Doors open 30 minutes before each service</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

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

      <section className="faq">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Before you visit</span>
            <h2>Common <em>questions</em>.</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq, i) => (
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
