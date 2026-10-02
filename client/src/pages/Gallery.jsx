import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './Gallery.css';
import { api, getImageUrl } from '../api';
import { albums as fallbackAlbums } from '../data/albums';

// Client-side cache for instant subsequent and initial loads
let memoryGalleryCache = null;
try {
  const stored = sessionStorage.getItem('pensa_gallery_cache');
  if (stored) memoryGalleryCache = JSON.parse(stored);
} catch {}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildColumns(urls, colCount = 5, perCol = 3) {
  if (!urls || urls.length === 0) return Array.from({ length: colCount }, () => []);
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

function extractAllPhotos(albumList) {
  return (albumList || []).flatMap((album) =>
    (album.items || []).map((p) =>
      getImageUrl(p.src, { width: 280, quality: 'auto:low' })
    ).filter(Boolean)
  );
}

export default function Gallery() {
  const heroRef = useRef(null);
  const tracksRef = useRef([]);

  // Instant render from cache or fallback data — 0ms blank screen delay
  const [albums, setAlbums] = useState(() => memoryGalleryCache || fallbackAlbums);

  const initialPhotos = useMemo(() => extractAllPhotos(memoryGalleryCache || fallbackAlbums), []);
  const [heroColumns, setHeroColumns] = useState(() => buildColumns(initialPhotos));

  useEffect(() => {
    // Stale-while-revalidate background refresh
    api.get('/gallery')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAlbums(data);
          memoryGalleryCache = data;
          try {
            sessionStorage.setItem('pensa_gallery_cache', JSON.stringify(data));
          } catch {}

          const freshPhotos = extractAllPhotos(data);
          if (freshPhotos.length > 0) {
            setHeroColumns(buildColumns(freshPhotos));
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const tracks = tracksRef.current;
    let ticking = false;

    const updateAnimationState = () => {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const inView = rect.bottom > 0 && window.scrollY < window.innerHeight * 0.8;
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
                  <img
                    key={i}
                    src={src}
                    alt="Gallery moment"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    width="260"
                    height="260"
                  />
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
                <div className="cover-img">
                  <img
                    src={getImageUrl(album.cover, { width: 550, quality: 'auto' })}
                    alt={`${album.title} album cover`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
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
            <Link to="/contact" className="btn btn-dark">
              Plan your visit <span className="btn-arrow" style={{ background: 'var(--moss)', color: 'var(--pine-deep)' }}>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
