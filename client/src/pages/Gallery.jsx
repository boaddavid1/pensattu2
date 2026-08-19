import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Gallery.css';
import { api } from '../api';

const heroColumns = [
  ['https://images.unsplash.com/photo-1438032005730-c779502df39b?w=500&q=80', 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=500&q=80', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80'],
  ['https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80', 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=500&q=80', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&q=80'],
  ['https://images.unsplash.com/photo-1507692049790-de58290a4334?w=500&q=80', 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=500&q=80', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=500&q=80'],
  ['https://images.unsplash.com/photo-1478147427282-58a87a120781?w=500&q=80', 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=500&q=80', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80'],
  ['https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=500&q=80', 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&q=80', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&q=80'],
];

export default function Gallery() {
  const heroRef = useRef(null);
  const tracksRef = useRef([]);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    api.get('/gallery')
      .then(setAlbums)
      .catch(() => setAlbums([]));
  }, []);

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
              <Link className="cover-card" to={`/gallery/${album.id}`} key={album.id}>
                <div className="cover-img"><img src={album.cover} alt={`${album.title} album cover`} /></div>
                <div className="cover-body">
                  <h3>{album.title}</h3>
                  <span>{album.count}</span>
                  <span className="cover-link">View full album <em className="btn-arrow">→</em></span>
                </div>
              </Link>
            ))}
          </div>
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

    </main>
  );
}
