import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, getImageUrl } from '../api';
import { albums as fallbackAlbums } from '../data/albums';
import '../pages/Gallery.css';

function getCachedAlbums() {
  try {
    const stored = sessionStorage.getItem('pensa_gallery_cache');
    if (stored) return JSON.parse(stored);
  } catch {}
  return fallbackAlbums;
}

export default function AlbumDetail() {
  const { albumId } = useParams();

  // Instant render from cache or fallback data
  const [album, setAlbum] = useState(() => {
    const cached = getCachedAlbums();
    return cached.find((a) => String(a.id) === albumId) || null;
  });
  const [loading, setLoading] = useState(!album);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/gallery')
      .then((albums) => {
        if (Array.isArray(albums) && albums.length > 0) {
          try {
            sessionStorage.setItem('pensa_gallery_cache', JSON.stringify(albums));
          } catch {}
          const found = albums.find((a) => String(a.id) === albumId);
          if (found) setAlbum(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [albumId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (loading && !album) {
    return (
      <main className="wrap" style={{ paddingTop: '140px', textAlign: 'center' }}>
        <p>Loading album...</p>
      </main>
    );
  }

  if (!album) {
    return (
      <main className="wrap" style={{ paddingTop: '140px', textAlign: 'center' }}>
        <h2>Album not found</h2>
        <Link to="/gallery" className="cover-link">← Back to gallery</Link>
      </main>
    );
  }

  return (
    <main className="albums">
      <section className="album-hero">
        <img
          src={getImageUrl(album.cover, { width: 1200, quality: 'auto' })}
          alt={`${album.title} cover`}
          decoding="async"
        />
        <div className="wrap">
          <Link to="/gallery" className="album-back">← Back to gallery</Link>
          <h1>{album.title}</h1>
        </div>
      </section>
      <div className="wrap album-content">
        <div className="g-grid g-grid-detail">
          {(album.items || []).map((item, i) => (
            <div
              className="g-item g-item-detail"
              key={i}
              onClick={() => setLightbox({ src: item.src, alt: item.alt })}
            >
              <img
                src={getImageUrl(item.src, { width: 600, quality: 'auto' })}
                alt={item.alt || 'Gallery photo'}
                loading="lazy"
                decoding="async"
              />
              {(item.category || item.caption) && (
                <div className="g-item-cap">
                  {item.category && <span>{item.category}</span>}
                  {item.caption && <strong>{item.caption}</strong>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" type="button" onClick={() => setLightbox(null)}>✕</button>
          <img
            src={getImageUrl(lightbox.src)}
            alt={lightbox.alt || 'Full size photo'}
            onClick={(e) => e.stopPropagation()}
            decoding="async"
          />
        </div>
      )}
    </main>
  );
}
