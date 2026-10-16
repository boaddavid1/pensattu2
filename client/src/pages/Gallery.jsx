import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './Gallery.css';
import { api, getImageUrl } from '../api';
import { albums as fallbackAlbums } from '../data/albums';
import GalleryShareModal from '../components/GalleryShareModal';

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
  const [shareModal, setShareModal] = useState({ isOpen: false, album: null });
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? '' : cur));
    }, 2800);
  };

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

  const rootAlbums = useMemo(() => {
    return (albums || []).filter((a) => !a.parent_id);
  }, [albums]);

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
            <h2>{rootAlbums.length > 0 ? `${rootAlbums.length} collections` : 'Explore collections'}, <em>one community</em>.</h2>
          </div>
          <div className="cover-grid">
            {rootAlbums.map((album) => (
              <Link className="cover-card" to={`/gallery/${album.id}`} key={album.id}>
                <div className="cover-img cover-img-wrap">
                  <button
                    type="button"
                    className="cover-share-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShareModal({ isOpen: true, album });
                    }}
                    title={`Share ${album.title} album`}
                    aria-label={`Share ${album.title} album`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    Share
                  </button>
                  <img
                    src={getImageUrl(album.cover, { width: 550, quality: 'auto' })}
                    alt={`${album.title} album cover`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="cover-body">
                  <h3>{album.title}</h3>
                  <div className="cover-meta-badges">
                    <span>{album.count}</span>
                    {album.sub_albums && album.sub_albums.length > 0 && (
                      <span className="sub-collection-badge">
                        📁 {album.sub_albums.length} sub-collection{album.sub_albums.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <span className="cover-link">View collection <em className="btn-arrow">→</em></span>
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

      {/* Share Modal */}
      <GalleryShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, album: null })}
        type="album"
        title="PENSA TTU Gallery Album"
        subtitle={shareModal.album?.title || ''}
        url={shareModal.album ? `${window.location.origin}/gallery/${shareModal.album.id}` : ''}
        imageUrl={shareModal.album?.cover || ''}
        onShowToast={showToast}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="gallery-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
