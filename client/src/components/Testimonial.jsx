import { useState, useEffect } from 'react';
import { api, getImageUrl } from '../api';
import { DEFAULT_HOME_SETTINGS } from '../data/defaultPageSettings';

export default function Testimonial() {
  const [settings, setSettings] = useState(DEFAULT_HOME_SETTINGS);

  useEffect(() => {
    api.get('/home-settings')
      .then((res) => {
        if (res && typeof res === 'object') {
          setSettings((prev) => ({ ...prev, ...res }));
        }
      })
      .catch(() => {});
  }, []);

  const eyebrow = settings.testi_eyebrow || DEFAULT_HOME_SETTINGS.testi_eyebrow;
  const quote = settings.testi_quote || DEFAULT_HOME_SETTINGS.testi_quote;
  const authorName = settings.testi_author_name || DEFAULT_HOME_SETTINGS.testi_author_name;
  const authorTitle = settings.testi_author_title || DEFAULT_HOME_SETTINGS.testi_author_title;
  const authorImg = settings.testi_author_img || DEFAULT_HOME_SETTINGS.testi_author_img;
  const mediaImg = settings.testi_media_img || DEFAULT_HOME_SETTINGS.testi_media_img;
  const serviceTime = settings.testi_service_time || DEFAULT_HOME_SETTINGS.testi_service_time;
  const serviceDay = settings.testi_service_day || DEFAULT_HOME_SETTINGS.testi_service_day;
  const serviceType = settings.testi_service_type || DEFAULT_HOME_SETTINGS.testi_service_type;

  return (
    <section className="testi">
      <div className="wrap testi-grid">
        <div className="testi-media">
          <img src={getImageUrl(mediaImg)} alt="Member of the congregation" />
          <div className="testi-rating">
            <strong>{serviceTime}</strong>
            <div className="stars">{serviceDay}</div>
            <span>{serviceType}</span>
          </div>
        </div>
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <p className="quote">{quote}</p>
          <div className="quote-author">
            <img src={getImageUrl(authorImg)} alt={authorName} />
            <div>
              <strong>{authorName}</strong>
              <span>{authorTitle}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
