import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../api';
import { DEFAULT_HOME_SETTINGS } from '../data/defaultPageSettings';

export default function Hero() {
  const [settings, setSettings] = useState(DEFAULT_HOME_SETTINGS);
  const [current, setCurrent] = useState(0);
  const [pos, setPos] = useState(0);

  useEffect(() => {
    api.get('/home-settings')
      .then((res) => {
        if (res && typeof res === 'object' && Object.keys(res).length > 0) {
          setSettings((prev) => ({ ...prev, ...res }));
        }
      })
      .catch(() => {});
  }, []);

  const rawSlides = Array.isArray(settings.hero_slides) && settings.hero_slides.length > 0
    ? settings.hero_slides
    : DEFAULT_HOME_SETTINGS.hero_slides;

  const slides = rawSlides.map((s) => ({
    img: s.img || s.image_url || '/images/pensafallback-bw.png',
    alt: s.alt || s.title || 'PENSA TTU',
    pre: s.pre ?? '',
    em: s.em ?? '',
    post: s.post ?? '',
    desc: s.desc || s.description || '',
  }));

  const activeIndex = current < slides.length ? current : 0;
  const slide = slides[activeIndex] || slides[0] || {};
  const full = (slide.pre || '') + (slide.em || '') + (slide.post || '');

  useEffect(() => {
    setPos(0);
  }, [activeIndex]);

  useEffect(() => {
    if (pos >= full.length) return;
    const timer = setTimeout(() => setPos((p) => p + 1), 60);
    return () => clearTimeout(timer);
  }, [pos, activeIndex, full]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const typed = full.slice(0, pos);
  const preLen = (slide.pre || '').length;
  const emLen = (slide.em || '').length;
  const a = typed.slice(0, preLen);
  const b = typed.slice(preLen, preLen + emLen);
  const c = typed.slice(preLen + emLen);

  const eyebrow = settings.hero_eyebrow || DEFAULT_HOME_SETTINGS.hero_eyebrow;
  const btn1Text = settings.hero_btn1_text || DEFAULT_HOME_SETTINGS.hero_btn1_text;
  const btn1Link = settings.hero_btn1_link || DEFAULT_HOME_SETTINGS.hero_btn1_link;
  const btn2Text = settings.hero_btn2_text || DEFAULT_HOME_SETTINGS.hero_btn2_text;
  const btn2Link = settings.hero_btn2_link || DEFAULT_HOME_SETTINGS.hero_btn2_link;

  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        {slides.map((s, i) => (
          <img
            key={i}
            src={getImageUrl(s.img)}
            alt={s.alt}
            className={i === activeIndex ? 'active' : ''}
          />
        ))}
      </div>
      <div className="hero-inner">
        <div className="hero-content">
          <span className="eyebrow" style={{ color: 'var(--moss)' }}>{eyebrow}</span>
          <h1>
            {a}
            {b && <em>{b}</em>}
            {c}
          </h1>
          <p>{slide.desc}</p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to={btn1Link} className="btn btn-primary">
              {btn1Text} <span className="btn-arrow">→</span>
            </Link>
            <Link
              to={btn2Link}
              className="btn btn-ghost"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              {btn2Text}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
