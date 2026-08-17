import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { albums } from '../data/albums';
import '../pages/Gallery.css';

export default function AlbumDetail() {
  const { albumId } = useParams();
  const album = albums.find((a) => a.id === albumId);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!album) {
    return (
      <main className="wrap" style={{ paddingTop: '140px', textAlign: 'center' }}>
        <h2>Album not found</h2>
        <Link to="/gallery" className="cover-link">← Back to gallery</Link>
      </main>
    );
  }

  return (
    <main className="albums" style={{ paddingTop: '120px' }}>
      <div className="wrap">
        <div className="album-head">
          <h2>{album.title}</h2>
          <Link to="/gallery" className="cover-link" style={{ fontSize: '13px' }}>← Back to gallery</Link>
        </div>
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
