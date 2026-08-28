import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    img: '/images/slide1.webp',
    alt: 'PENSA TTU members celebrating at Supernatural Encounter',
    pre: 'Faith that gives your heart room to ',
    em: 'breathe',
    post: '.',
    desc: 'PENSA TTU is a community built around honest worship, real friendship, and a Word that meets you where you are — whether this is your first Sunday or your five hundredth.',
  },
  {
    img: '/images/wecare.png',
    alt: 'We care for you at PENSA TTU',
    pre: 'We ',
    em: 'care',
    post: ' for you.',
    desc: 'A community where everyone is welcomed, supported, and loved — because nobody should do life alone.',
  },
  {
    img: '/images/slide.png',
    alt: 'PENSA TTU community in worship',
    pre: 'Together we ',
    em: 'rise',
    post: '.',
    desc: 'A family of believers growing in faith, serving with love, and shining the light of Christ on campus and beyond.',
  },
  {
    img: '/images/slide1.png',
    alt: 'PENSA TTU gathering of students',
    pre: 'Young hearts, ',
    em: 'bold',
    post: ' faith.',
    desc: 'Empowering students to live with purpose, lead with integrity, and impact their generation for Christ.',
  },
  {
    img: '/images/slid.png',
    alt: 'PENSA TTU students united in Christ',
    pre: 'One family, ',
    em: 'one',
    post: ' mission.',
    desc: 'Bound by love and driven by purpose — together we grow, serve, and shine for Christ on campus.',
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
