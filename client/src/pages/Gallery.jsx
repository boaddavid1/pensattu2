import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Gallery.css';
import { api, getImageUrl } from '../api';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildColumns(urls, colCount = 5, perCol = 3) {
  if (urls.length === 0) return Array.from({ length: colCount }, () => []);
  const shuffled = shuffle(urls);
  const cols = [];
  for (let c = 0; c < colCount; c++) {
    const col = [];
    for (let i = 0; i < perCol; i++) {
      col.push(shuffled[(c * perCol + i) % shuffled.length]);
    }
    cols.push(col);
  }
  return cols;
}

export default function Gallery() {
  const heroRef = useRef(null);
  const tracksRef = useRef([]);
  const [albums, setAlbums] = useState([]);
  const [heroColumns, setHeroColumns] = useState([[], [], [], [], []]);

  useEffect(() => {
    api.get('/gallery')
      .then((data) => {
        setAlbums(data);
        const allPhotos = data.flatMap((album) => (album.items || []).map((p) => getImageUrl(p.src)).filter(Boolean));
        if (allPhotos.length > 0) {
          setHeroColumns(buildColumns(allPhotos));
          const interval = setInterval(() => {
            setHeroColumns(buildColumns(allPhotos));
          }, 5000);
          return () => clearInterval(interval);
        }
      })
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
                <div className="cover-img"><img src={getImageUrl(album.cover)} alt={`${album.title} album cover`} /></div>
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
