import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PART_A = 'Faith that gives your heart room to ';
const PART_B = 'breathe';
const PART_C = '.';
const FULL = PART_A + PART_B + PART_C;

const SLIDES = [
  'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1600&q=80',
  'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=1600&q=80',
  'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1600&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=80',
];

export default function Hero() {
  const [pos, setPos] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (pos >= FULL.length) return;
    const timer = setTimeout(() => setPos((p) => p + 1), 60);
    return () => clearTimeout(timer);
  }, [pos]);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const typed = FULL.slice(0, pos);
  const a = typed.slice(0, PART_A.length);
  const b = typed.slice(PART_A.length, PART_A.length + PART_B.length);
  const c = typed.slice(PART_A.length + PART_B.length);

  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        {SLIDES.map((src, i) => (
          <img key={src} src={src} alt="Congregation worshipping together" className={i === current ? 'active' : ''} />
        ))}
      </div>
      <div className="hero-inner">
        <div className="hero-content">
          <span className="eyebrow" style={{ color: 'var(--moss)' }}>A church home in Accra</span>
          <h1>{a}<em>{b}</em>{c}</h1>
          <p>PENSA TTU is a community built around honest worship, real friendship, and a Word that meets you where you are — whether this is your first Sunday or your five hundredth.</p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/about" className="btn btn-primary">About us <span className="btn-arrow">→</span></Link>
            <a href="#services" className="btn btn-ghost" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>Explore ministries</a>
          </div>
        </div>
      </div>
    </section>
  );
}
