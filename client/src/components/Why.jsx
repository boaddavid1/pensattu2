import { useState, useEffect } from 'react';
import { api } from '../api';
import { DEFAULT_HOME_SETTINGS } from '../data/defaultPageSettings';

export default function Why() {
  const [settings, setSettings] = useState(DEFAULT_HOME_SETTINGS);

  useEffect(() => {
    api.get('/home-settings')
      .then((res) => {
        if (res && typeof res === 'object' && Object.keys(res).length > 0) {
          setSettings((prev) => ({ ...prev, ...res }));
        }
      })
      .catch(() => {});
  }, []);

  const reasons = settings.why_reasons || DEFAULT_HOME_SETTINGS.why_reasons;

  return (
    <section className="why" id="why">
      <div className="wrap why-grid">
        <div>
          <span className="eyebrow">{settings.why_eyebrow || 'Why PENSA TTU'}</span>
          <h2>{settings.why_title || 'Three reasons this becomes home.'}</h2>
          <p style={{ color: 'var(--ink-soft)', margin: '16px 0 36px', lineHeight: 1.65 }}>
            {settings.why_desc || 'We are not trying to be the biggest church in Accra — just a place where people are known, the teaching is honest, and there is always a seat for one more.'}
          </p>
          <div className="why-list">
            {reasons.map((r, i) => (
              <div className="why-item" key={r.num || i}>
                <div className="why-num">{r.num || `0${i + 1}`}</div>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="why-media">
          <div className="why-media-grid">
            <img
              className="tall"
              src={settings.why_image_tall || '/images/pensa%20(1).JPG'}
              alt="Worship band leading a Sunday service"
            />
            <img
              className="short"
              src={settings.why_image_short || '/images/pastor.JPG'}
              alt="Pastor"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
