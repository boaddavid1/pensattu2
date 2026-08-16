import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Gallery.css';

const albums = [
  {
    id: 'worship',
    title: 'Sunday Worship',
    cover: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=500&q=80',
    count: '4 photos',
    items: [
      { src: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80', alt: 'Hands raised in worship', category: 'Worship', caption: 'Sunday morning, 11AM' },
      { src: 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=600&q=80', alt: 'Sanctuary interior', category: 'Worship', caption: 'Our sanctuary' },
      { src: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80', alt: 'Worship band', category: 'Worship', caption: 'Music ministry' },
      { src: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80', alt: 'Sunday service', category: 'Worship', caption: 'A packed 9AM service' },
    ],
  },
  {
    id: 'community',
    title: 'Community Life',
    cover: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80',
    count: '3 photos',
    items: [
      { src: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80', alt: 'Community group meeting', category: 'Community', caption: 'East Legon group night' },
      { src: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80', alt: 'Bible study group', category: 'Community', caption: 'Midweek Bible study' },
      { src: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80', alt: 'Greeters welcoming visitors', category: 'Community', caption: 'First-Sunday greeters' },
    ],
  },
  {
    id: 'outreach',
    title: 'Outreach',
    cover: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&q=80',
    count: '2 photos',
    items: [
      { src: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80', alt: 'Outreach event', category: 'Outreach', caption: 'Serving Osu this spring' },
      { src: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?w=600&q=80', alt: 'Planning an outreach event', category: 'Outreach', caption: 'Getting ready to serve' },
    ],
  },
  {
    id: 'youth',
    title: 'Youth & Kids',
    cover: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&q=80',
    count: '2 photos',
    items: [
      { src: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&q=80', alt: 'Youth ministry gathering', category: 'Youth', caption: 'Friday youth night' },
      { src: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80', alt: 'Youth small group', category: 'Youth', caption: 'Youth small group' },
    ],
  },
];

const heroColumns = [
  ['https://images.unsplash.com/photo-1438032005730-c779502df39b?w=500&q=80', 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=500&q=80', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80'],
  ['https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80', 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=500&q=80', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&q=80'],
  ['https://images.unsplash.com/photo-1507692049790-de58290a4334?w=500&q=80', 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&q=80', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=500&q=80'],
  ['https://images.unsplash.com/photo-1478147427282-58a87a120781?w=500&q=80', 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=500&q=80', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80'],
  ['https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=500&q=80', 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&q=80'],
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);
  const heroRef = useRef(null);
  const tracksRef = useRef([]);

  useEffect(() => {
    const hero = heroRef.current;
    const tracks = tracksRef.current;
    let ticking = false;

    const updateAnimationState = () => {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const inView = rect.bottom > 0 && window.scrollY < window.innerHeight * 0.6;
      tracks.forEach((t) => t?.classList.toggle('paused', !inView));
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateAnimationState);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateAnimationState();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openLightbox = (src, alt) => setLightbox({ src, alt });

  return (
    <main>
      <section className="g-hero" id="g-hero" ref={heroRef}>
        <div className="g-columns">
          {heroColumns.map((col, c) => (
            <div className="g-col" key={c}>
              <div
                className="g-col-track"
                ref={(el) => { tracksRef.current[c] = el; }}
              >
                {[...col, ...col].map((src, i) => (
                  <img key={i} src={src} alt="Gallery moment" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="g-overlay" />
        <div className="g-hero-content">
          <span className="eyebrow">Life at PENSA TTU</span>
          <h1>Moments from our <em>community</em>.</h1>
          <p>Worship mornings, community groups, outreach days, and everything in between — a look at what it's actually like here.</p>
        </div>
        <div className="g-scroll-cue"><span>Scroll</span><span className="arrow" /></div>
      </section>

      <section className="albums-covers" id="top">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Browse by album</span>
            <h2>Four collections, <em>one community</em>.</h2>
          </div>
          <div className="cover-grid">
            {albums.map((album) => (
              <a className="cover-card" href={`#album-${album.id}`} key={album.id}>
                <div className="cover-img"><img src={album.cover} alt={`${album.title} album cover`} /></div>
                <div className="cover-body">
                  <h3>{album.title}</h3>
                  <span>{album.count}</span>
                  <span className="cover-link">View full album <em className="btn-arrow">→</em></span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="albums">
        <div className="wrap">
          {albums.map((album) => (
            <div className="album" id={`album-${album.id}`} key={album.id}>
              <div className="album-head">
                <h2>{album.title}</h2>
                <a href="#top" className="cover-link" style={{ fontSize: '13px' }}>← Back to albums</a>
              </div>
              <div className="g-grid">
                {album.items.map((item, i) => (
                  <div className="g-item" key={i} onClick={() => openLightbox(item.src, item.alt)}>
                    <img src={item.src} alt={item.alt} />
                    <div className="g-item-cap">
                      <span>{item.category}</span>
                      <strong>{item.caption}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <div className="cta-box">
            <h2>Come be part of the <em>next photo</em>.</h2>
            <Link to="/contact" className="btn btn-dark">Plan your visit <span className="btn-arrow" style={{ background: 'var(--moss)', color: 'var(--pine-deep)' }}>→</span></Link>
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox.src} alt={lightbox.alt} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </main>
  );
}
