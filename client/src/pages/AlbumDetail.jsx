import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api, getImageUrl } from '../api';
import { albums as fallbackAlbums } from '../data/albums';
import { downloadImage, getPhotoId, formatDownloadFilename } from '../utils/galleryHelpers';
import GalleryShareModal from '../components/GalleryShareModal';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const photoParam = searchParams.get('photo');

  // Instant render from cache or fallback data
  const [allAlbums, setAllAlbums] = useState(() => getCachedAlbums());
  const [album, setAlbum] = useState(() => {
    const cached = getCachedAlbums();
    return cached.find((a) => String(a.id) === albumId) || null;
  });
  const [loading, setLoading] = useState(!album);

  // Active photo index in album.items for Lightbox (null if closed)
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  // Share modal state
  const [shareModal, setShareModal] = useState({
    isOpen: false,
    type: 'album',
    item: null,
    index: 0,
  });

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');
  const [downloading, setDownloading] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? '' : cur));
    }, 2800);
  };

  // Sync fresh albums from server
  useEffect(() => {
    api.get('/gallery')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          try {
            sessionStorage.setItem('pensa_gallery_cache', JSON.stringify(data));
          } catch {}
          setAllAlbums(data);
          const found = data.find((a) => String(a.id) === albumId);
          if (found) setAlbum(found);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [albumId]);

  const parentAlbum = album?.parent_id
    ? (allAlbums || []).find((a) => String(a.id) === String(album.parent_id)) || (album.parent_title ? { id: album.parent_id, title: album.parent_title } : null)
    : null;

  // Deep-linking: open photo if ?photo= query parameter is present
  useEffect(() => {
    if (!album || !album.items || album.items.length === 0) return;
    if (photoParam) {
      const idx = album.items.findIndex((item, i) => {
        return (
          getPhotoId(item, i) === photoParam ||
          String(item.id) === photoParam ||
          String(i + 1) === photoParam
        );
      });
      if (idx !== -1) {
        setActivePhotoIndex(idx);
      }
    }
  }, [album, photoParam]);

  // Lightbox handlers
  const openLightbox = (index) => {
    if (!album?.items?.[index]) return;
    setActivePhotoIndex(index);
    const photoId = getPhotoId(album.items[index], index);
    setSearchParams({ photo: photoId }, { replace: true });
  };

  const closeLightbox = () => {
    setActivePhotoIndex(null);
    setSearchParams({}, { replace: true });
  };

  const nextPhoto = useCallback(() => {
    if (!album?.items?.length || activePhotoIndex === null) return;
    const nextIdx = (activePhotoIndex + 1) % album.items.length;
    openLightbox(nextIdx);
  }, [album, activePhotoIndex]);

  const prevPhoto = useCallback(() => {
    if (!album?.items?.length || activePhotoIndex === null) return;
    const prevIdx = (activePhotoIndex - 1 + album.items.length) % album.items.length;
    openLightbox(prevIdx);
  }, [album, activePhotoIndex]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (activePhotoIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'd' || e.key === 'D' || (e.shiftKey && (e.key === 'J' || e.key === 'j'))) {
        e.preventDefault();
        const photo = album?.items?.[activePhotoIndex];
        if (photo) handleDownload(photo, activePhotoIndex);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activePhotoIndex, nextPhoto, prevPhoto, album]);

  // Download photo handler (JPG only)
  const handleDownload = async (item, index, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const cleanFilename = formatDownloadFilename(
      item.caption || item.alt || `photo-${index + 1}`,
      album?.title || 'album',
      'jpg'
    );

    showToast('Downloading photo as JPG...');
    try {
      setDownloading(true);
      await downloadImage(item.src, cleanFilename, 'jpg');
      showToast('✓ Photo downloaded as JPG successfully!');
    } catch (err) {
      showToast('Opening high-res image...');
      window.open(getImageUrl(item.src), '_blank');
    } finally {
      setDownloading(false);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Share album handler
  const handleShareAlbum = () => {
    setShareModal({
      isOpen: true,
      type: 'album',
      item: null,
      index: 0,
    });
  };

  // Share photo handler
  const handleSharePhoto = (item, index, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShareModal({
      isOpen: true,
      type: 'photo',
      item,
      index,
    });
  };

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

  const items = album.items || [];
  const currentPhoto = activePhotoIndex !== null ? items[activePhotoIndex] : null;

  return (
    <main className="albums">
      {/* Album Hero Banner */}
      <section className="album-hero">
        <img
          src={getImageUrl(album.cover, { width: 1400, quality: 'auto' })}
          alt={`${album.title} cover`}
          decoding="async"
        />
        <div className="wrap">
          <div className="album-hero-content">
            <div>
              <nav className="album-breadcrumbs-trail" aria-label="Breadcrumb navigation">
                <Link to="/gallery" className="album-breadcrumb-link">
                  Gallery
                </Link>
                {parentAlbum && (
                  <>
                    <span className="album-breadcrumb-divider">/</span>
                    <Link to={`/gallery/${parentAlbum.id}`} className="album-breadcrumb-link">
                      {parentAlbum.title}
                    </Link>
                  </>
                )}
                <span className="album-breadcrumb-divider">/</span>
                <span className="album-breadcrumb-active">{album.title}</span>
              </nav>
              <h1>{album.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.16)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {items.length} photo{items.length !== 1 ? 's' : ''}
                </span>
                {album.sub_albums && album.sub_albums.length > 0 && (
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.22)',
                      border: '1px solid rgba(52, 211, 153, 0.4)',
                      backdropFilter: 'blur(8px)',
                      color: '#6ee7b7',
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: 12.5,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    📁 {album.sub_albums.length} sub-album{album.sub_albums.length !== 1 ? 's' : ''}
                  </span>
                )}
                {album.description && (
                  <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 13 }}>
                    {album.description}
                  </span>
                )}
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="album-hero-actions">
              <button
                type="button"
                className="btn-hero-action btn-hero-share"
                onClick={handleShareAlbum}
                title="Share this entire album"
                aria-label="Share album"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share Album
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-Collections in this Album (if any) */}
      {album.sub_albums && album.sub_albums.length > 0 && (
        <section className="album-subcollections-section">
          <div className="wrap">
            <div className="section-head" style={{ marginBottom: 24, paddingTop: 36 }}>
              <span className="eyebrow">Nested Collections</span>
              <h2 style={{ fontSize: 'clamp(22px, 2.5vw, 30px)' }}>
                Sub-albums inside <em>{album.title}</em>
              </h2>
            </div>
            <div className="cover-grid" style={{ marginBottom: 44 }}>
              {album.sub_albums.map((sub) => (
                <Link className="cover-card" to={`/gallery/${sub.id}`} key={sub.id}>
                  <div className="cover-img cover-img-wrap">
                    <img
                      src={getImageUrl(sub.cover, { width: 550, quality: 'auto' })}
                      alt={`${sub.title} cover`}
                      loading="lazy"
                    />
                  </div>
                  <div className="cover-body">
                    <h3>{sub.title}</h3>
                    <span>{sub.count || `${sub.items?.length || 0} photos`}</span>
                    <span className="cover-link">View sub-album <em className="btn-arrow">→</em></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Album Photos Masonry Grid */}
      <div className="wrap album-content">
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <p>{album.sub_albums && album.sub_albums.length > 0 ? 'No direct photos in this parent folder yet. Browse sub-albums above.' : 'No photos in this album yet.'}</p>
            <Link to="/gallery" className="cover-link">← Browse other albums</Link>
          </div>
        ) : (
          <div className="g-grid g-grid-detail">
            {items.map((item, i) => (
              <div
                className="g-item g-item-detail"
                key={item.id || i}
                onClick={() => openLightbox(i)}
                tabIndex={0}
                role="button"
                aria-label={`View photo ${i + 1}: ${item.caption || item.alt || 'Gallery photo'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(i);
                  }
                }}
              >
                {/* Floating Quick Action Overlay */}
                <div className="g-item-actions-bar">
                  <button
                    type="button"
                    className="g-action-pill"
                    onClick={(e) => handleSharePhoto(item, i, e)}
                    title="Share this photo link"
                    aria-label="Share photo"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="g-action-pill download"
                    onClick={(e) => handleDownload(item, i, e)}
                    title="Download photo as JPG"
                    aria-label="Download photo as JPG"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>

                <img
                  src={getImageUrl(item.src, { width: 700, quality: 'auto' })}
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
        )}
      </div>

      {/* Enhanced Lightbox Viewer */}
      {currentPhoto && (
        <div className="gallery-lightbox-overlay" onClick={closeLightbox}>
          {/* Top Control Bar */}
          <div className="lightbox-topbar" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-info">
              <span className="lightbox-counter">
                {activePhotoIndex + 1} / {items.length}
              </span>
              {currentPhoto.category && (
                <span className="lightbox-category-tag">
                  {currentPhoto.category}
                </span>
              )}
              <span className="lightbox-title" title={currentPhoto.caption || currentPhoto.alt || album.title}>
                {currentPhoto.caption || currentPhoto.alt || album.title}
              </span>
            </div>

            <div className="lightbox-controls">
              {/* Share Photo Button */}
              <button
                type="button"
                className="lightbox-btn"
                onClick={() => handleSharePhoto(currentPhoto, activePhotoIndex)}
                title="Share this individual photo link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share Photo
              </button>

              {/* Download Photo Button (JPG) */}
              <button
                type="button"
                className="lightbox-btn btn-download"
                onClick={(e) => handleDownload(currentPhoto, activePhotoIndex, e)}
                disabled={downloading}
                title="Download high-resolution JPG image (D)"
              >
                {downloading ? (
                  <svg className="ag-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
                <span>{downloading ? 'Downloading JPG...' : 'Download JPG'}</span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                className="lightbox-btn"
                onClick={toggleFullscreen}
                title="Toggle fullscreen"
                style={{ padding: '7px 10px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </button>

              {/* Close Button */}
              <button
                type="button"
                className="lightbox-btn btn-close"
                onClick={closeLightbox}
                title="Close viewer (Esc)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Main Photo Stage */}
          <div className="lightbox-stage" onClick={closeLightbox}>
            {/* Previous Button */}
            {items.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-arrow prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
                title="Previous photo (Left arrow)"
                aria-label="Previous photo"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            {/* Photo Image */}
            <img
              key={currentPhoto.src}
              src={getImageUrl(currentPhoto.src, { width: 1600, quality: 'auto' })}
              alt={currentPhoto.alt || currentPhoto.caption || 'Full size photo'}
              className="lightbox-main-img"
              onClick={(e) => e.stopPropagation()}
              decoding="async"
            />

            {/* Next Button */}
            {items.length > 1 && (
              <button
                type="button"
                className="lightbox-nav-arrow next"
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
                title="Next photo (Right arrow)"
                aria-label="Next photo"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </div>

          {/* Bottom Caption & Thumbnail Strip */}
          <div className="lightbox-bottom" onClick={(e) => e.stopPropagation()}>
            {(currentPhoto.caption || currentPhoto.alt) && (
              <p className="lightbox-caption">
                {currentPhoto.caption || currentPhoto.alt}
              </p>
            )}

            {/* Thumbnail Strip */}
            {items.length > 1 && (
              <div className="lightbox-thumbs-bar">
                {items.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    type="button"
                    className={`lightbox-thumb-btn ${idx === activePhotoIndex ? 'active' : ''}`}
                    onClick={() => openLightbox(idx)}
                    title={`Jump to photo ${idx + 1}`}
                  >
                    <img
                      src={getImageUrl(item.src, { width: 120, quality: 'auto:low' })}
                      alt={`Thumbnail ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Modal for Album or Individual Photo */}
      <GalleryShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, type: 'album', item: null, index: 0 })}
        type={shareModal.type}
        title={shareModal.type === 'album' ? album.title : (shareModal.item?.caption || shareModal.item?.alt || `Photo from ${album.title}`)}
        subtitle={shareModal.type === 'album' ? 'PENSA TTU Album Collection' : album.title}
        url={
          shareModal.type === 'album'
            ? `${window.location.origin}/gallery/${album.id}`
            : `${window.location.origin}/gallery/${album.id}?photo=${getPhotoId(shareModal.item, shareModal.index)}`
        }
        imageUrl={shareModal.type === 'album' ? album.cover : shareModal.item?.src}
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
