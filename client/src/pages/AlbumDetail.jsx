import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import '../pages/Gallery.css';

export default function AlbumDetail() {
  const { albumId } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/gallery')
      .then((albums) => {
        const found = albums.find((a) => String(a.id) === albumId);
        setAlbum(found || null);
      })
      .catch(() => setAlbum(null))
      .finally(() => setLoading(false));
  }, [albumId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (loading) {
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
        <img src={album.cover} alt={`${album.title} cover`} />
        <div className="wrap">
          <Link to="/gallery" className="album-back">← Back to gallery</Link>
          <h1>{album.title}</h1>
        </div>
      </section>
      <div className="wrap">
        <div className="g-grid">
          {album.items.map((item, i) => (
            <div className="g-item" key={i} onClick={() => setLightbox({ src: item.src, alt: item.alt })}>
              <img src={item.src} alt={item.alt} />
              <div className="g-item-cap">
                <span>{item.category}</span>
                <strong>{item.caption}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightbox && (
        <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox.src} alt={lightbox.alt} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </main>
  );
}
