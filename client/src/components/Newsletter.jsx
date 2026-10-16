import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { DEFAULT_HOME_SETTINGS } from '../data/defaultPageSettings';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [title, setTitle] = useState(DEFAULT_HOME_SETTINGS.newsletter_title);
  const [placeholder, setPlaceholder] = useState(DEFAULT_HOME_SETTINGS.newsletter_placeholder);
  const [btnText, setBtnText] = useState(DEFAULT_HOME_SETTINGS.newsletter_btn_text);

  useEffect(() => {
    api.get('/home-settings')
      .then((res) => {
        if (res && typeof res === 'object') {
          if (res.newsletter_title) setTitle(res.newsletter_title);
          if (res.newsletter_placeholder) setPlaceholder(res.newsletter_placeholder);
          if (res.newsletter_btn_text) setBtnText(res.newsletter_btn_text);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/subscribers', { email });
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
          <h2>{title}</h2>
          <form className="news-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-dark">
              {status === 'success' ? 'Subscribed ✓' : status === 'sending' ? '...' : btnText}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
