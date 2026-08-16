import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1600&q=80',
    alt: 'Congregation worshipping together',
    pre: 'Faith that gives your heart room to ',
    em: 'breathe',
    post: '.',
    desc: 'PENSA TTU is a community built around honest worship, real friendship, and a Word that meets you where you are — whether this is your first Sunday or your five hundredth.',
  },
  {
    img: 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=1600&q=80',
    alt: 'Community gathering',
    pre: 'A place to belong, grow and ',
    em: 'serve',
    post: '.',
    desc: 'From students to young professionals, everyone finds a seat at the table. Growth happens in circles, not rows.',
  },
  {
    img: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1600&q=80',
    alt: 'Hands raised in worship',
    pre: 'Worship that lifts your whole ',
    em: 'life',
    post: '.',
    desc: 'Honest worship and a Word that meets you right where you are — every single Sunday.',
  },
  {
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=80',
    alt: 'Friends laughing together',
    pre: 'Real friendships that last beyond ',
    em: 'Sunday',
    post: '.',
    desc: 'We do life together: small groups, outreach days, meals, and honest conversation.',
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [pos, setPos] = useState(0);

  const slide = SLIDES[current];
  const full = slide.pre + slide.em + slide.post;

  useEffect(() => {
    setPos(0);
  }, [current]);

  useEffect(() => {
    if (pos >= full.length) return;
    const timer = setTimeout(() => setPos((p) => p + 1), 60);
    return () => clearTimeout(timer);
  }, [pos, current]);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 7000);
    return () => clearInterval(timer);
  }, []);

  const typed = full.slice(0, pos);
  const a = typed.slice(0, slide.pre.length);
  const b = typed.slice(slide.pre.length, slide.pre.length + slide.em.length);
  const c = typed.slice(slide.pre.length + slide.em.length);

  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        {SLIDES.map((s, i) => (
          <img key={s.img} src={s.img} alt={s.alt} className={i === current ? 'active' : ''} />
        ))}
      </div>
      <div className="hero-inner">
        <div className="hero-content">
          <span className="eyebrow" style={{ color: 'var(--moss)' }}>A church home in Accra</span>
          <h1>{a}<em>{b}</em>{c}</h1>
          <p>{slide.desc}</p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/about" className="btn btn-primary">About us <span className="btn-arrow">→</span></Link>
            <a href="#services" className="btn btn-ghost" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>Explore ministries</a>
          </div>
        </div>
      </div>
    </section>
  );
}
