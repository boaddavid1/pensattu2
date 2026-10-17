import { useEffect, useState, useMemo } from 'react';
import { adminApi } from './adminApi';
import { uploadImageToCloudinary } from '../cloudinaryUpload';
import AdminGalleryBulkModal from './AdminGalleryBulkModal';
import AdminGalleryBulkBar from './AdminGalleryBulkBar';
import './admin-gallery.css';

const DEFAULT_CATEGORIES = [
  'Worship',
  'Conferences',
  'Outreach',
  'Fellowship',
  'Youth',
  'Sunday Service',
  'Executives',
  'Special Events'
];

function normalizePhoto(p) {
  return {
    id: p.id,
    album_id: p.album_id,
    image_url: p.image_url || p.src || '',
    title: p.title || p.alt || '',
    category: p.category || '',
    description: p.description || p.caption || '',
  };
}

function normalizeAlbum(a) {
  if (!a) return null;
  return {
    id: a.id,
    name: a.name || a.title || 'Untitled Album',
    title: a.title || a.name || 'Untitled Album',
    description: a.description || '',
    cover_image: a.cover_image || a.cover || '/images/pensafallback-bw.png',
    cover: a.cover || a.cover_image || '/images/pensafallback-bw.png',
    parent_id: a.parent_id ? Number(a.parent_id) : null,
    created_at: a.created_at || '',
  };
}

export default function AdminGallery() {
  const [albums, setAlbums] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Navigation & Filtering
  const [viewMode, setViewMode] = useState('albums'); // 'albums' | 'allPhotos'
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals state: null | 'createAlbum' | 'editAlbum' | 'uploadPhoto' | 'editPhoto'
  const [activeModal, setActiveModal] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);

  // Form states
  const [albumForm, setAlbumForm] = useState({ name: '', description: '', cover_image: '', parent_id: '' });
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [photoForm, setPhotoForm] = useState({ album_id: '', src: '', alt: '', category: '', caption: '' });
  const [editingPhoto, setEditingPhoto] = useState(null);

  // Upload & submitting states
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-dismiss success message
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(''), 4500);
    return () => clearTimeout(timer);
  }, [successMsg]);

  // Keyboard navigation (Escape closes modal/lightbox/selection)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (lightboxPhoto) setLightboxPhoto(null);
        else if (isBulkModalOpen) setIsBulkModalOpen(false);
        else if (activeModal) closeModal();
        else if (selectedPhotoIds.length > 0) setSelectedPhotoIds([]);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPhoto, isBulkModalOpen, activeModal, selectedPhotoIds]);

  function openBulkUpload(defaultAlbum = null) {
    if (defaultAlbum) setSelectedAlbumId(defaultAlbum);
    setIsBulkModalOpen(true);
  }

  function toggleSelectPhoto(photoId, e) {
    if (e) e.stopPropagation();
    setSelectedPhotoIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  }

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [albumsData, photosData] = await Promise.all([
        adminApi.list('gallery_albums'),
        adminApi.listPhotos(),
      ]);
      const normalizedAlbums = (albumsData || []).map(normalizeAlbum).filter(Boolean);
      setAlbums(normalizedAlbums);
      setAllPhotos((photosData || []).map(normalizePhoto));
    } catch (err) {
      setError(err.message || 'Failed to load gallery items.');
    } finally {
      setLoading(false);
    }
  }

  // Active selected album object
  const currentAlbum = useMemo(() => {
    if (!selectedAlbumId) return null;
    return albums.find((a) => String(a.id) === String(selectedAlbumId)) || null;
  }, [albums, selectedAlbumId]);

  // Derived categories
  const categoriesList = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    allPhotos.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [allPhotos]);

  // Stats
  const totalAlbumsCount = albums.filter((a) => !a.parent_id).length;
  const totalSubAlbumsCount = albums.filter((a) => a.parent_id).length;
  const totalPhotosCount = allPhotos.length;
  const distinctCategoriesCount = useMemo(() => {
    const cats = new Set(allPhotos.map((p) => p.category).filter(Boolean));
    return cats.size;
  }, [allPhotos]);

  // Album lookup helper
  function getAlbumName(albumId) {
    const found = albums.find((a) => String(a.id) === String(albumId));
    return found ? (found.name || found.title || `Album #${found.id}`) : 'Unassigned';
  }

  // Sub-albums mapping: parent_id -> list of sub-albums
  const subAlbumsMap = useMemo(() => {
    const map = {};
    albums.forEach((a) => {
      if (a.parent_id) {
        if (!map[a.parent_id]) map[a.parent_id] = [];
        map[a.parent_id].push(a);
      }
    });
    return map;
  }, [albums]);

  // Direct sub-albums of current selected album
  const currentSubAlbums = useMemo(() => {
    if (!selectedAlbumId) return [];
    return albums.filter((a) => String(a.parent_id) === String(selectedAlbumId));
  }, [albums, selectedAlbumId]);

  // Current album's parent album (if nested)
  const currentParentAlbum = useMemo(() => {
    if (!currentAlbum?.parent_id) return null;
    return albums.find((a) => String(a.id) === String(currentAlbum.parent_id)) || null;
  }, [albums, currentAlbum]);

  // Complete ancestor breadcrumb trail for selected album
  const albumBreadcrumbs = useMemo(() => {
    if (!currentAlbum) return [];
    const trail = [currentAlbum];
    let curr = currentAlbum;
    const visited = new Set([curr.id]);
    while (curr?.parent_id) {
      const parent = albums.find((a) => String(a.id) === String(curr.parent_id));
      if (!parent || visited.has(parent.id)) break;
      visited.add(parent.id);
      trail.unshift(parent);
      curr = parent;
    }
    return trail;
  }, [albums, currentAlbum]);

  // Set of album IDs that are descendants of the currently editing album (prevent circular references)
  const editingDescendantIds = useMemo(() => {
    if (!editingAlbum) return new Set();
    const set = new Set([editingAlbum.id]);
    let added = true;
    while (added) {
      added = false;
      albums.forEach((a) => {
        if (a.parent_id && set.has(a.parent_id) && !set.has(a.id)) {
          set.add(a.id);
          added = true;
        }
      });
    }
    return set;
  }, [editingAlbum, albums]);

  // Filtered Albums for Albums view: ONLY root/main albums appear outside.
  // Sub-folders and sub-albums are strictly visible and managed within their parent album.
  const filteredAlbums = useMemo(() => {
    let list = albums.filter((a) => !a.parent_id);

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((a) =>
      (a.name || '').toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q) ||
      (subAlbumsMap[a.id] || []).some((sub) => (sub.name || '').toLowerCase().includes(q))
    );
  }, [albums, searchQuery, subAlbumsMap]);

  // Filtered Photos for current view
  const filteredPhotos = useMemo(() => {
    let list = allPhotos;

    // If inside an album drilldown
    if (selectedAlbumId) {
      list = list.filter((p) => String(p.album_id) === String(selectedAlbumId));
    }

    // Category filter (in All Photos view)
    if (selectedCategory !== 'ALL') {
      list = list.filter((p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => {
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const albumMatch = getAlbumName(p.album_id).toLowerCase().includes(q);
        return titleMatch || catMatch || descMatch || albumMatch;
      });
    }

    return list;
  }, [allPhotos, selectedAlbumId, selectedCategory, searchQuery, albums]);

  // Photos count per album map
  const albumPhotoCounts = useMemo(() => {
    const map = {};
    albums.forEach((a) => { map[a.id] = 0; });
    allPhotos.forEach((p) => {
      if (p.album_id !== undefined && p.album_id !== null) {
        map[p.album_id] = (map[p.album_id] || 0) + 1;
      }
    });
    return map;
  }, [albums, allPhotos]);

  // Modal open helpers
  function openCreateAlbum(defaultParentId = null) {
    setAlbumForm({
      name: '',
      description: '',
      cover_image: '',
      parent_id: defaultParentId ? String(defaultParentId) : '',
    });
    setEditingAlbum(null);
    setActiveModal('createAlbum');
  }

  function openEditAlbum(album, e) {
    if (e) e.stopPropagation();
    setEditingAlbum(album);
    setAlbumForm({
      name: album.name || '',
      description: album.description || '',
      cover_image: album.cover_image || '',
      parent_id: album.parent_id ? String(album.parent_id) : '',
    });
    setActiveModal('editAlbum');
  }

  function openUploadPhoto(defaultAlbumId = null) {
    const albumToUse = defaultAlbumId || selectedAlbumId || (albums[0]?.id ? String(albums[0].id) : '');
    setPhotoForm({
      album_id: albumToUse ? String(albumToUse) : '',
      src: '',
      alt: '',
      category: '',
      caption: '',
    });
    setEditingPhoto(null);
    setActiveModal('uploadPhoto');
  }

  function openEditPhoto(photo, e) {
    if (e) e.stopPropagation();
    setEditingPhoto(photo);
    setPhotoForm({
      album_id: photo.album_id ? String(photo.album_id) : '',
      src: photo.image_url,
      alt: photo.title || '',
      category: photo.category || '',
      caption: photo.description || '',
    });
    setActiveModal('editPhoto');
  }

  function closeModal() {
    setActiveModal(null);
    setEditingAlbum(null);
    setEditingPhoto(null);
    setError('');
  }

  // Upload handlers
  async function handlePhotoFileUpload(file) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadImageToCloudinary(file, 'pensattu/gallery');
      setPhotoForm((prev) => ({
        ...prev,
        src: url,
        alt: prev.alt || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));
    } catch (err) {
      setError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleCoverFileUpload(file) {
    if (!file) return;
    setCoverUploading(true);
    setError('');
    try {
      const url = await uploadImageToCloudinary(file, 'pensattu/gallery');
      setAlbumForm((prev) => ({ ...prev, cover_image: url }));
    } catch (err) {
      setError(err.message || 'Cover upload failed. Please try again.');
    } finally {
      setCoverUploading(false);
    }
  }

  // Drag and drop handlers
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handlePhotoDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handlePhotoFileUpload(files[0]);
    }
  }

  function handleCoverDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleCoverFileUpload(files[0]);
    }
  }

  // CRUD Album Handlers
  async function handleSaveAlbum(e) {
    e.preventDefault();
    if (!albumForm.name.trim()) {
      setError('Album name is required.');
      return;
    }
    setSubmitting(true);
    setError('');
    const parentIdVal = albumForm.parent_id && !isNaN(Number(albumForm.parent_id)) && Number(albumForm.parent_id) > 0
      ? Number(albumForm.parent_id)
      : null;

    try {
      if (editingAlbum) {
        await adminApi.update('gallery_albums', editingAlbum.id, {
          name: albumForm.name.trim(),
          description: albumForm.description.trim(),
          cover_image: albumForm.cover_image || null,
          parent_id: parentIdVal,
        });
        setSuccessMsg(`Album "${albumForm.name}" updated successfully.`);
      } else {
        const created = await adminApi.create('gallery_albums', {
          name: albumForm.name.trim(),
          description: albumForm.description.trim(),
          cover_image: albumForm.cover_image || null,
          parent_id: parentIdVal,
        });
        setSuccessMsg(
          parentIdVal
            ? `Sub-album "${albumForm.name}" created inside "${getAlbumName(parentIdVal)}".`
            : `Album "${albumForm.name}" created successfully.`
        );
        if (created?.id) setSelectedAlbumId(created.id);
      }
      closeModal();
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save album.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteAlbum(album, e) {
    if (e) e.stopPropagation();
    const count = albumPhotoCounts[album.id] || 0;
    const confirmMsg = count > 0
      ? `Delete album "${album.name}"? This album contains ${count} photo${count !== 1 ? 's' : ''}.`
      : `Delete album "${album.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await adminApi.remove('gallery_albums', album.id);
      setSuccessMsg(`Album "${album.name}" deleted.`);
      if (selectedAlbumId === album.id) {
        setSelectedAlbumId(null);
      }
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete album.');
    }
  }

  // CRUD Photo Handlers
  async function handleSavePhoto(e) {
    e.preventDefault();
    if (!photoForm.src) {
      setError('Please upload or provide an image URL.');
      return;
    }
    if (!photoForm.album_id) {
      setError('Please select an album for this photo.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const safeAlbumId = isNaN(Number(photoForm.album_id)) ? photoForm.album_id : Number(photoForm.album_id);
      if (editingPhoto) {
        await adminApi.updatePhoto(editingPhoto.id, {
          album_id: safeAlbumId,
          src: photoForm.src,
          image_url: photoForm.src,
          alt: photoForm.alt.trim(),
          title: photoForm.alt.trim(),
          category: photoForm.category.trim(),
          caption: photoForm.caption.trim(),
          description: photoForm.caption.trim(),
        });
        setSuccessMsg('Photo details updated successfully.');
        if (lightboxPhoto && lightboxPhoto.id === editingPhoto.id) {
          setLightboxPhoto({
            ...lightboxPhoto,
            album_id: safeAlbumId,
            image_url: photoForm.src,
            title: photoForm.alt.trim(),
            category: photoForm.category.trim(),
            description: photoForm.caption.trim(),
          });
        }
      } else {
        await adminApi.addPhoto({
          album_id: safeAlbumId,
          src: photoForm.src,
          image_url: photoForm.src,
          alt: photoForm.alt.trim(),
          title: photoForm.alt.trim(),
          category: photoForm.category.trim(),
          caption: photoForm.caption.trim(),
          description: photoForm.caption.trim(),
        });
        setSuccessMsg('Photo added to album successfully.');
      }
      closeModal();
      const updatedPhotos = await adminApi.listPhotos();
      setAllPhotos(updatedPhotos.map(normalizePhoto));
    } catch (err) {
      setError(err.message || 'Failed to save photo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePhoto(photo, e) {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete this photo${photo.title ? ` ("${photo.title}")` : ''}?`)) return;

    try {
      await adminApi.removePhoto(photo.id);
      setSuccessMsg('Photo deleted.');
      if (lightboxPhoto && lightboxPhoto.id === photo.id) {
        setLightboxPhoto(null);
      }
      const updatedPhotos = await adminApi.listPhotos();
      setAllPhotos(updatedPhotos.map(normalizePhoto));
    } catch (err) {
      setError(err.message || 'Failed to delete photo.');
    }
  }

  if (loading) {
    return (
      <div className="admin-gallery-page">
        <div className="ag-hero">
          <div className="ag-hero-content">
            <span className="ag-pill-badge">Media Studio • Gallery Manager</span>
            <h1 className="ag-hero-title">Visual Assets & Gallery</h1>
            <p className="ag-hero-subtitle">Loading albums and media library...</p>
          </div>
        </div>
        <div className="ag-empty-state">
          <div className="ag-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="ag-empty-title">Loading Media Assets</h3>
          <p className="ag-empty-desc">Synchronizing albums and high-resolution photo data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-gallery-page">
      {/* ─── Hero Header & Stats ─── */}
      <div className="ag-hero">
        <div className="ag-hero-content">
          <span className="ag-pill-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Media Studio • Gallery Manager
          </span>
          <h1 className="ag-hero-title">Visual Assets & Gallery</h1>
          <p className="ag-hero-subtitle">
            Curate photo albums, manage high-resolution community images, and organize memories with full Cloudinary synchronization.
          </p>
        </div>

        <div className="ag-hero-stats">
          <div className="ag-stat-box">
            <div className="ag-stat-num">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              {totalAlbumsCount}
            </div>
            <div className="ag-stat-label">
              Main Albums {totalSubAlbumsCount > 0 ? `(${totalSubAlbumsCount} sub-folders)` : ''}
            </div>
          </div>
          <div className="ag-stat-box">
            <div className="ag-stat-num">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {totalPhotosCount}
            </div>
            <div className="ag-stat-label">Total Photos</div>
          </div>
          <div className="ag-stat-box">
            <div className="ag-stat-num">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              {distinctCategoriesCount}
            </div>
            <div className="ag-stat-label">Categories</div>
          </div>
        </div>
      </div>

      {/* ─── Notification Alerts ─── */}
      {successMsg && (
        <div className="ag-alert success">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16 }}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="ag-alert error">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── Control Bar ─── */}
      <div className="ag-controls-bar">
        {!selectedAlbumId ? (
          <div className="ag-tabs">
            <button
              type="button"
              className={`ag-tab-btn ${viewMode === 'albums' ? 'active' : ''}`}
              onClick={() => { setViewMode('albums'); setSelectedCategory('ALL'); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Albums & Collections ({totalAlbumsCount})
            </button>
            <button
              type="button"
              className={`ag-tab-btn ${viewMode === 'allPhotos' ? 'active' : ''}`}
              onClick={() => setViewMode('allPhotos')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              All Photos Grid ({allPhotos.length})
            </button>
          </div>
        ) : (
          <nav className="ag-breadcrumbs-bar" aria-label="Breadcrumb navigation">
            <button
              type="button"
              className="ag-back-btn"
              onClick={() => { setSelectedAlbumId(null); setSearchQuery(''); }}
              title="Return to all collections"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Collections
            </button>
            {albumBreadcrumbs.map((crumb, idx) => {
              const isLast = idx === albumBreadcrumbs.length - 1;
              return (
                <span key={crumb.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span className="ag-breadcrumb-sep">/</span>
                  {isLast ? (
                    <span className="ag-breadcrumb-current" title={crumb.name}>
                      {crumb.name}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="ag-breadcrumb-crumb-btn"
                      onClick={() => { setSelectedAlbumId(crumb.id); setSearchQuery(''); }}
                      title={`Go to ${crumb.name}`}
                    >
                      {crumb.name}
                    </button>
                  )}
                </span>
              );
            })}
          </nav>
        )}

        <div className="ag-search-wrapper">
          <span className="ag-search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="ag-search-input"
            placeholder={
              selectedAlbumId
                ? `Search in ${currentAlbum?.name || 'album'}...`
                : viewMode === 'albums'
                ? 'Search albums by title or description...'
                : 'Search photos by title, category, album...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="ag-search-clear"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="ag-action-buttons">
          <button
            type="button"
            className="ag-btn-create-album"
            onClick={openCreateAlbum}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Album
          </button>
          <button
            type="button"
            className="ag-btn-bulk-upload"
            onClick={() => openBulkUpload(selectedAlbumId)}
            disabled={albums.length === 0}
            title={albums.length === 0 ? 'Create an album first before uploading photos' : 'Bulk upload photos'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Bulk Upload
          </button>
          <button
            type="button"
            className="ag-btn-upload-photo"
            onClick={() => openUploadPhoto(selectedAlbumId)}
            disabled={albums.length === 0}
            title={albums.length === 0 ? 'Create an album first before uploading photos' : 'Upload single photo'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Single Photo
          </button>
        </div>
      </div>

      {/* ─── Category Filter Chips (Shown in All Photos view or inside Album) ─── */}
      {(viewMode === 'allPhotos' || selectedAlbumId) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#72849a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Filter Category:
          </span>
          <button
            type="button"
            className={`ag-chip-tag ${selectedCategory === 'ALL' ? 'selected' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            All Categories
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`ag-chip-tag ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'selected' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory.toLowerCase() === cat.toLowerCase() ? 'ALL' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}

      {/* Mode 1: Selected Album Drill-Down View */}
      {selectedAlbumId && currentAlbum && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Album Hero Cover Banner */}
          <div className="ag-album-header-banner">
            {currentAlbum.cover_image && (
              <img
                src={currentAlbum.cover_image}
                alt={currentAlbum.name}
                className="ag-album-banner-bg"
              />
            )}
            <div className="ag-album-banner-overlay" />
            <div className="ag-album-banner-content">
              <div className="ag-album-banner-info">
                {currentParentAlbum && (
                  <div
                    className="ag-banner-parent-tag"
                    onClick={() => { setSelectedAlbumId(currentParentAlbum.id); setSearchQuery(''); }}
                    title={`Parent collection: ${currentParentAlbum.name}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 14 4 9 9 4" />
                      <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                    </svg>
                    Sub-album of <strong>{currentParentAlbum.name}</strong>
                  </div>
                )}
                <h2>{currentAlbum.name}</h2>
                {currentAlbum.description ? (
                  <p>{currentAlbum.description}</p>
                ) : (
                  <p style={{ fontStyle: 'italic', opacity: 0.8 }}>No description provided for this collection.</p>
                )}
                <div className="ag-album-banner-meta">
                  <span className="ag-album-meta-badge">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''}
                  </span>
                  {currentSubAlbums.length > 0 && (
                    <span className="ag-album-meta-badge subalbums">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      {currentSubAlbums.length} sub-album{currentSubAlbums.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              <div className="ag-album-banner-actions">
                <button
                  type="button"
                  className="ag-banner-action-btn primary"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', borderColor: '#34d399' }}
                  onClick={() => openCreateAlbum(currentAlbum.id)}
                  title="Create a nested sub-album inside this album"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    <line x1="12" y1="11" x2="12" y2="17" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                  + Sub-Album
                </button>
                <button
                  type="button"
                  className="ag-banner-action-btn primary"
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', borderColor: '#38bdf8' }}
                  onClick={() => openBulkUpload(currentAlbum.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Bulk Upload
                </button>
                <button
                  type="button"
                  className="ag-banner-action-btn primary"
                  onClick={() => openUploadPhoto(currentAlbum.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Photo
                </button>
                <button
                  type="button"
                  className="ag-banner-action-btn"
                  onClick={(e) => openEditAlbum(currentAlbum, e)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Album
                </button>
                <button
                  type="button"
                  className="ag-banner-action-btn danger"
                  onClick={(e) => handleDeleteAlbum(currentAlbum, e)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Albums & Folders in Selected Album */}
          <div className="ag-subalbums-section">
            <div className="ag-subalbums-header">
              <div className="ag-subalbums-title-wrap">
                <div className="ag-subalbums-icon-circle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="ag-subalbums-heading">
                    Sub-Albums & Folders in "{currentAlbum.name}" ({currentSubAlbums.length})
                  </h3>
                  <p className="ag-subalbums-subheading">
                    {currentSubAlbums.length > 0
                      ? `${currentSubAlbums.length} sub-folder${currentSubAlbums.length !== 1 ? 's' : ''} organized inside this collection`
                      : `Divide "${currentAlbum.name}" into sub-folders for events, sessions, or teams`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="ag-btn-add-subalbum-mini"
                onClick={() => openCreateAlbum(currentAlbum.id)}
                title={`Create a sub-album inside "${currentAlbum.name}"`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
                + Create Sub-Album
              </button>
            </div>

            {currentSubAlbums.length === 0 ? (
              <div className="ag-subalbums-empty-banner">
                <div className="ag-subalbums-empty-left">
                  <div className="ag-subalbums-folder-art">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      <line x1="12" y1="11" x2="12" y2="17" />
                      <line x1="9" y1="14" x2="15" y2="14" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0A2E5C' }}>
                      No sub-albums or folders inside "{currentAlbum.name}" yet
                    </h4>
                    <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#64748b' }}>
                      You can organize photos into sub-folders (e.g., "Day 1", "Day 2", "Outreach", "Worship Night", "Executives")
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="ag-btn-create-subalbum-cta"
                  onClick={() => openCreateAlbum(currentAlbum.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  + Create Sub-Album / Folder
                </button>
              </div>
            ) : (
              <div className="ag-subalbums-grid">
                {currentSubAlbums.map((sub) => {
                  const pCount = albumPhotoCounts[sub.id] || 0;
                  const nestedCount = (subAlbumsMap[sub.id] || []).length;
                  return (
                    <div
                      key={sub.id}
                      className="ag-subalbum-card"
                      onClick={() => { setSelectedAlbumId(sub.id); setSearchQuery(''); }}
                    >
                      <div className="ag-subalbum-cover">
                        {sub.cover_image ? (
                          <img src={sub.cover_image} alt={sub.name} loading="lazy" />
                        ) : (
                          <div className="ag-subalbum-placeholder">
                            <span>{sub.name ? sub.name[0].toUpperCase() : 'A'}</span>
                          </div>
                        )}
                        <span className="ag-subalbum-photo-count">
                          {pCount} photo{pCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="ag-subalbum-content">
                        <h4 className="ag-subalbum-title" title={sub.name}>
                          {sub.name}
                        </h4>
                        <p className="ag-subalbum-desc" title={sub.description}>
                          {sub.description || 'No description provided.'}
                        </p>
                        <div className="ag-subalbum-footer">
                          {nestedCount > 0 ? (
                            <span className="ag-subalbum-nested-tag">
                              📁 {nestedCount} sub-folder{nestedCount !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Direct sub-album</span>
                          )}
                          <span className="ag-subalbum-open-btn">
                            Open &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Quick Add Sub-Album Card */}
                <div
                  className="ag-subalbum-add-card"
                  onClick={() => openCreateAlbum(currentAlbum.id)}
                  title={`Create another sub-album inside "${currentAlbum.name}"`}
                >
                  <div className="ag-subalbum-add-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      <line x1="12" y1="11" x2="12" y2="17" />
                      <line x1="9" y1="14" x2="15" y2="14" />
                    </svg>
                  </div>
                  <span className="ag-subalbum-add-label">+ Add Sub-Album</span>
                  <span className="ag-subalbum-add-sub">Create folder in "{currentAlbum.name}"</span>
                </div>
              </div>
            )}
          </div>

          {/* Photos Grid in Selected Album */}
          {filteredPhotos.length === 0 ? (
            <div className="ag-empty-state">
              <div className="ag-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <h3 className="ag-empty-title">
                {searchQuery || selectedCategory !== 'ALL' ? 'No matching photos found' : 'No photos in this album yet'}
              </h3>
              <p className="ag-empty-desc">
                {searchQuery || selectedCategory !== 'ALL'
                  ? 'Try clearing your search query or category filter.'
                  : 'Start uploading high-resolution photos to curate this collection.'}
              </p>
              {!searchQuery && selectedCategory === 'ALL' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="ag-btn-bulk-upload"
                    onClick={() => openBulkUpload(currentAlbum.id)}
                    style={{ padding: '9px 18px' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Bulk Upload Photos
                  </button>
                  <button
                    type="button"
                    className="ag-btn-upload-photo"
                    onClick={() => openUploadPhoto(currentAlbum.id)}
                    style={{ padding: '9px 18px' }}
                  >
                    Single Photo
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ag-photos-grid">
              {filteredPhotos.map((photo) => (
                <div key={photo.id} className={`ag-photo-card ${selectedPhotoIds.includes(photo.id) ? 'selected' : ''}`}>
                  <div
                    className="ag-photo-thumb-wrap"
                    onClick={() => setLightboxPhoto(photo)}
                  >
                    <div
                      className={`ag-photo-select-box ${selectedPhotoIds.includes(photo.id) ? 'checked' : ''}`}
                      onClick={(e) => toggleSelectPhoto(photo.id, e)}
                      title={selectedPhotoIds.includes(photo.id) ? 'Deselect photo' : 'Select photo for bulk actions'}
                    >
                      {selectedPhotoIds.includes(photo.id) ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.4)' }} />
                      )}
                    </div>
                    <img
                      src={photo.image_url}
                      alt={photo.title || 'Gallery image'}
                      className="ag-photo-img"
                      loading="lazy"
                    />
                    {photo.category && (
                      <span className="ag-photo-cat-badge">{photo.category}</span>
                    )}
                    <div className="ag-photo-overlay-actions">
                      <button
                        type="button"
                        className="ag-overlay-circle-btn"
                        onClick={(e) => { e.stopPropagation(); setLightboxPhoto(photo); }}
                        title="Preview photo"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="ag-overlay-circle-btn"
                        onClick={(e) => openEditPhoto(photo, e)}
                        title="Edit metadata"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="ag-overlay-circle-btn delete"
                        onClick={(e) => handleDeletePhoto(photo, e)}
                        title="Delete photo"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="ag-photo-meta">
                    <h4 className="ag-photo-title" title={photo.title || 'Untitled'}>
                      {photo.title || 'Untitled Photo'}
                    </h4>
                    {photo.description && (
                      <p className="ag-photo-caption" title={photo.description}>
                        {photo.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Albums & Collections Grid Overview (Only Main Albums Shown Outside) */}
      {!selectedAlbumId && viewMode === 'albums' && (
        <>
          {/* Main Albums Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                Main Albums ({filteredAlbums.length})
              </span>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                • Click an album to open and manage its sub-folders & photos
              </span>
            </div>
            {searchQuery && (
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Showing {filteredAlbums.length} of {totalAlbumsCount} main collections
              </span>
            )}
          </div>

          {filteredAlbums.length === 0 ? (
            <div className="ag-empty-state">
              <div className="ag-empty-icon">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="ag-empty-title">
                {searchQuery ? 'No albums match your search' : 'No albums created yet'}
              </h3>
              <p className="ag-empty-desc">
                {searchQuery
                  ? 'Try searching with different keywords.'
                  : 'Create your first album to organize church events, services, and outreach photos.'}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  className="ag-btn-create-album"
                  onClick={openCreateAlbum}
                  style={{ marginTop: 8 }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create First Album
                </button>
              )}
            </div>
          ) : (
            <div className="ag-albums-grid">
              {filteredAlbums.map((album) => {
                const count = albumPhotoCounts[album.id] || 0;
                const subCount = (subAlbumsMap[album.id] || []).length;
                return (
                  <div key={album.id} className="ag-album-card">
                    <div
                      className="ag-album-card-cover"
                      onClick={() => { setSelectedAlbumId(album.id); setSearchQuery(''); }}
                    >
                      {album.cover_image ? (
                        <img
                          src={album.cover_image}
                          alt={album.name}
                          className="ag-album-card-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="ag-album-card-placeholder">
                          <span>{album.name ? album.name[0].toUpperCase() : 'A'}</span>
                        </div>
                      )}

                      <span className="ag-album-badge-count">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        {count} photo{count !== 1 ? 's' : ''}
                      </span>

                      {subCount > 0 && (
                        <span className="ag-album-subcount-badge">
                          📁 {subCount} sub-folder{subCount !== 1 ? 's' : ''}
                        </span>
                      )}

                      <div className="ag-album-card-overlay-btn">
                        <span className="ag-view-collection-chip">
                          Open Collection
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    <div className="ag-album-card-body">
                      <h3
                        className="ag-album-card-title"
                        onClick={() => { setSelectedAlbumId(album.id); setSearchQuery(''); }}
                      >
                        {album.name}
                      </h3>
                      <p className="ag-album-card-desc">
                        {album.description || 'No description provided.'}
                      </p>

                      <div className="ag-album-card-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="ag-btn-album-open"
                            onClick={() => { setSelectedAlbumId(album.id); setSearchQuery(''); }}
                          >
                            Open Album
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="ag-btn-card-subalbum"
                            onClick={(e) => { e.stopPropagation(); openCreateAlbum(album.id); }}
                            title={`Create a sub-album or folder inside "${album.name}"`}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                              <line x1="12" y1="11" x2="12" y2="17" />
                              <line x1="9" y1="14" x2="15" y2="14" />
                            </svg>
                            + Sub-Album
                          </button>
                        </div>

                        <div className="ag-album-actions-group">
                          <button
                            type="button"
                            className="ag-icon-btn"
                            onClick={(e) => openEditAlbum(album, e)}
                            title="Edit album details"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="ag-icon-btn danger"
                            onClick={(e) => handleDeleteAlbum(album, e)}
                            title="Delete album"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Mode 3: All Photos Grid Overview */}
      {!selectedAlbumId && viewMode === 'allPhotos' && (
        <>
          {filteredPhotos.length === 0 ? (
            <div className="ag-empty-state">
              <div className="ag-empty-icon">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <h3 className="ag-empty-title">
                {searchQuery || selectedCategory !== 'ALL' ? 'No photos match your filter' : 'No photos found in media library'}
              </h3>
              <p className="ag-empty-desc">
                {searchQuery || selectedCategory !== 'ALL'
                  ? 'Try selecting a different category or clearing the search text.'
                  : 'Upload images to start populating the gallery.'}
              </p>
              {!searchQuery && selectedCategory === 'ALL' && albums.length > 0 && (
                <button
                  type="button"
                  className="ag-btn-upload-photo"
                  onClick={() => openUploadPhoto()}
                  style={{ marginTop: 8 }}
                >
                  Upload First Photo
                </button>
              )}
            </div>
          ) : (
            <div className="ag-photos-grid">
              {filteredPhotos.map((photo) => (
                <div key={photo.id} className={`ag-photo-card ${selectedPhotoIds.includes(photo.id) ? 'selected' : ''}`}>
                  <div
                    className="ag-photo-thumb-wrap"
                    onClick={() => setLightboxPhoto(photo)}
                  >
                    <div
                      className={`ag-photo-select-box ${selectedPhotoIds.includes(photo.id) ? 'checked' : ''}`}
                      onClick={(e) => toggleSelectPhoto(photo.id, e)}
                      title={selectedPhotoIds.includes(photo.id) ? 'Deselect photo' : 'Select photo for bulk actions'}
                    >
                      {selectedPhotoIds.includes(photo.id) ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.4)' }} />
                      )}
                    </div>
                    <img
                      src={photo.image_url}
                      alt={photo.title || 'Gallery image'}
                      className="ag-photo-img"
                      loading="lazy"
                    />
                    {photo.category && (
                      <span className="ag-photo-cat-badge">{photo.category}</span>
                    )}

                    <div className="ag-photo-overlay-actions">
                      <button
                        type="button"
                        className="ag-overlay-circle-btn"
                        onClick={(e) => { e.stopPropagation(); setLightboxPhoto(photo); }}
                        title="Preview photo"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="ag-overlay-circle-btn"
                        onClick={(e) => openEditPhoto(photo, e)}
                        title="Edit metadata"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="ag-overlay-circle-btn delete"
                        onClick={(e) => handleDeletePhoto(photo, e)}
                        title="Delete photo"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="ag-photo-meta">
                    <h4 className="ag-photo-title" title={photo.title || 'Untitled'}>
                      {photo.title || 'Untitled Photo'}
                    </h4>
                    {photo.description && (
                      <p className="ag-photo-caption" title={photo.description}>
                        {photo.description}
                      </p>
                    )}
                    <div className="ag-photo-footer">
                      <span
                        className="ag-photo-album-tag"
                        title={`Album: ${getAlbumName(photo.album_id)}`}
                        onClick={() => {
                          if (photo.album_id) {
                            setSelectedAlbumId(photo.album_id);
                            setViewMode('albums');
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        📁 {getAlbumName(photo.album_id)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── MODAL: CREATE / EDIT ALBUM ─── */}
      {(activeModal === 'createAlbum' || activeModal === 'editAlbum') && (
        <div className="ag-modal-overlay" onClick={closeModal}>
          <div className="ag-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ag-modal-header">
              <h3 className="ag-modal-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                {activeModal === 'editAlbum'
                  ? 'Edit Album Details'
                  : albumForm.parent_id
                  ? `Create Sub-Album in "${getAlbumName(albumForm.parent_id)}"`
                  : 'Create New Album'}
              </h3>
              <button type="button" className="ag-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAlbum}>
              <div className="ag-modal-body">
                {/* Album Scope Switcher (Top-Level vs Nested Sub-Album) */}
                {activeModal === 'createAlbum' && (
                  <div className="ag-album-type-switch-box">
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Collection Type:
                    </span>
                    <div className="ag-album-type-pills">
                      <button
                        type="button"
                        className={`ag-type-pill ${!albumForm.parent_id ? 'selected' : ''}`}
                        onClick={() => setAlbumForm({ ...albumForm, parent_id: '' })}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Main Top-Level Album
                      </button>
                      <button
                        type="button"
                        className={`ag-type-pill ${albumForm.parent_id ? 'selected' : ''}`}
                        onClick={() => {
                          if (!albumForm.parent_id) {
                            const defaultParent = selectedAlbumId || albums[0]?.id || '';
                            setAlbumForm({ ...albumForm, parent_id: String(defaultParent) });
                          }
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                        📁 Sub-Album / Folder
                      </button>
                    </div>
                  </div>
                )}

                {/* Parent Album Picker */}
                {Boolean(albumForm.parent_id || activeModal === 'editAlbum') && (
                  <div
                    className="ag-form-group"
                    style={{
                      background: albumForm.parent_id ? '#f0fdf4' : '#f8fafc',
                      border: albumForm.parent_id ? '1px solid #86efac' : '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: '12px 14px',
                    }}
                  >
                    <label className="ag-form-label" style={{ color: albumForm.parent_id ? '#166534' : 'inherit', fontWeight: 700 }}>
                      📁 Parent Album (Folder) {albumForm.parent_id ? '*' : ''}
                      <span className="ag-form-label-opt">
                        {albumForm.parent_id ? 'Nest inside this collection' : 'Optional'}
                      </span>
                    </label>
                    <select
                      className="ag-form-select"
                      value={albumForm.parent_id || ''}
                      onChange={(e) => setAlbumForm({ ...albumForm, parent_id: e.target.value })}
                      style={{
                        borderColor: albumForm.parent_id ? '#10b981' : undefined,
                        fontWeight: 600,
                      }}
                      required={Boolean(albumForm.parent_id)}
                    >
                      <option value="">None (Keep as Main Top-Level Album)</option>
                      {albums
                        .filter((a) => !editingDescendantIds.has(a.id))
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.parent_id ? `  ↳ ${a.name} (Sub-album)` : `📁 ${a.name}`}
                          </option>
                        ))}
                    </select>
                    {albumForm.parent_id && (
                      <p style={{ fontSize: 12, color: '#15803d', margin: '6px 0 0', fontWeight: 600 }}>
                        ✓ This sub-album will live inside <strong>"{getAlbumName(albumForm.parent_id)}"</strong> and will only appear when opening this parent album.
                      </p>
                    )}
                  </div>
                )}

                <div className="ag-form-group">
                  <label className="ag-form-label">
                    {albumForm.parent_id ? 'Sub-Album Name *' : 'Album Name *'}
                  </label>
                  <input
                    type="text"
                    className="ag-form-input"
                    placeholder={
                      albumForm.parent_id
                        ? 'e.g., Day 1, Outreach Team, Evening Worship, Executives'
                        : "e.g., Annual Camp 2026, Freshers' Welcome"
                    }
                    value={albumForm.name}
                    onChange={(e) => setAlbumForm({ ...albumForm, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="ag-form-group">
                  <label className="ag-form-label">
                    Description
                    <span className="ag-form-label-opt">Optional</span>
                  </label>
                  <textarea
                    className="ag-form-textarea"
                    placeholder="Brief description of this collection..."
                    value={albumForm.description}
                    onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="ag-form-group">
                  <label className="ag-form-label">
                    Cover Image
                    <span className="ag-form-label-opt">Cloudinary auto-upload</span>
                  </label>

                  {albumForm.cover_image ? (
                    <div className="ag-preview-box">
                      <img src={albumForm.cover_image} alt="Album cover preview" />
                      <button
                        type="button"
                        className="ag-preview-remove"
                        onClick={() => setAlbumForm({ ...albumForm, cover_image: '' })}
                      >
                        Remove Cover
                      </button>
                    </div>
                  ) : (
                    <label
                      className={`ag-dropzone ${isDragging ? 'dragging' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleCoverDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleCoverFileUpload(e.target.files[0])}
                        disabled={coverUploading}
                      />
                      <div className="ag-dropzone-icon">
                        {coverUploading ? (
                          '⏳'
                        ) : (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        )}
                      </div>
                      <div className="ag-dropzone-text">
                        {coverUploading ? 'Uploading cover to Cloudinary...' : 'Click or drag cover image here'}
                      </div>
                      <div className="ag-dropzone-sub">
                        JPEG, PNG, WebP up to 10MB
                      </div>
                    </label>
                  )}

                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      className="ag-form-input"
                      placeholder="Or paste direct image URL (https://...)"
                      value={albumForm.cover_image}
                      onChange={(e) => setAlbumForm({ ...albumForm, cover_image: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="ag-modal-footer">
                <button type="button" className="ag-btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ag-btn-submit"
                  disabled={!albumForm.name.trim() || coverUploading || submitting}
                >
                  {submitting
                    ? 'Saving...'
                    : activeModal === 'editAlbum'
                    ? 'Update Album'
                    : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: UPLOAD / EDIT PHOTO ─── */}
      {(activeModal === 'uploadPhoto' || activeModal === 'editPhoto') && (
        <div className="ag-modal-overlay" onClick={closeModal}>
          <div className="ag-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ag-modal-header">
              <h3 className="ag-modal-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                {activeModal === 'editPhoto' ? 'Edit Photo Metadata' : 'Upload Photo to Album'}
              </h3>
              <button type="button" className="ag-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePhoto}>
              <div className="ag-modal-body">
                {/* Target Album Selection */}
                <div className="ag-form-group">
                  <label className="ag-form-label">
                    Target Album *
                  </label>
                  <select
                    className="ag-form-select"
                    value={photoForm.album_id}
                    onChange={(e) => setPhotoForm({ ...photoForm, album_id: e.target.value })}
                    required
                  >
                    <option value="">Select Target Album</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.parent_id
                          ? `  ↳ ${album.name || `Album #${album.id}`} (Inside: ${getAlbumName(album.parent_id)})`
                          : (album.name || `Album #${album.id}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Photo File Upload / Dropzone */}
                <div className="ag-form-group">
                  <label className="ag-form-label">
                    Photo File *
                    <span className="ag-form-label-opt">Cloudinary auto-upload</span>
                  </label>

                  {photoForm.src ? (
                    <div className="ag-preview-box">
                      <img src={photoForm.src} alt="Upload preview" />
                      {activeModal !== 'editPhoto' && (
                        <button
                          type="button"
                          className="ag-preview-remove"
                          onClick={() => setPhotoForm({ ...photoForm, src: '' })}
                        >
                          Change Photo
                        </button>
                      )}
                    </div>
                  ) : (
                    <label
                      className={`ag-dropzone ${isDragging ? 'dragging' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handlePhotoDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handlePhotoFileUpload(e.target.files[0])}
                        disabled={uploading}
                      />
                      <div className="ag-dropzone-icon">
                        {uploading ? (
                          '⏳'
                        ) : (
                          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        )}
                      </div>
                      <div className="ag-dropzone-text">
                        {uploading ? 'Uploading to Cloudinary...' : 'Click or drag photo file here'}
                      </div>
                      <div className="ag-dropzone-sub">
                        High-resolution JPEG, PNG, WebP supported
                      </div>
                    </label>
                  )}

                  <div style={{ marginTop: 8 }}>
                    <input
                      type="text"
                      className="ag-form-input"
                      placeholder="Or paste direct image URL (https://...)"
                      value={photoForm.src}
                      onChange={(e) => setPhotoForm({ ...photoForm, src: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Title / Alt Text */}
                <div className="ag-form-group">
                  <label className="ag-form-label">
                    Photo Title / Alt Text
                    <span className="ag-form-label-opt">Recommended</span>
                  </label>
                  <input
                    type="text"
                    className="ag-form-input"
                    placeholder="e.g., Sunday Worship Praise Team"
                    value={photoForm.alt}
                    onChange={(e) => setPhotoForm({ ...photoForm, alt: e.target.value })}
                  />
                </div>

                {/* Category & Chip Suggestions */}
                <div className="ag-form-group">
                  <label className="ag-form-label">
                    Category Tag
                    <span className="ag-form-label-opt">Used for public filtering</span>
                  </label>
                  <input
                    type="text"
                    className="ag-form-input"
                    placeholder="e.g., Worship, Outreach, Youth"
                    value={photoForm.category}
                    onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
                  />
                  <div className="ag-chip-suggestions">
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`ag-chip-tag ${photoForm.category.toLowerCase() === cat.toLowerCase() ? 'selected' : ''}`}
                        onClick={() => setPhotoForm({ ...photoForm, category: cat })}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Caption / Description */}
                <div className="ag-form-group">
                  <label className="ag-form-label">
                    Caption / Story
                    <span className="ag-form-label-opt">Optional</span>
                  </label>
                  <textarea
                    className="ag-form-textarea"
                    placeholder="Brief description or scripture reference for this memory..."
                    value={photoForm.caption}
                    onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="ag-modal-footer">
                <button type="button" className="ag-btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ag-btn-submit"
                  disabled={!photoForm.src || !photoForm.album_id || uploading || submitting}
                >
                  {submitting
                    ? 'Saving...'
                    : activeModal === 'editPhoto'
                    ? 'Update Photo'
                    : 'Save & Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── LIGHTBOX PREVIEW MODAL ─── */}
      {lightboxPhoto && (
        <div className="ag-lightbox-overlay" onClick={() => setLightboxPhoto(null)}>
          <div className="ag-lightbox-container" onClick={(e) => e.stopPropagation()}>
            <div className="ag-lightbox-header">
              <h4 className="ag-lightbox-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                {lightboxPhoto.title || 'Photo Preview'}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="ag-icon-btn"
                  style={{ color: '#ffffff' }}
                  onClick={(e) => openEditPhoto(lightboxPhoto, e)}
                  title="Edit metadata"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="ag-icon-btn danger"
                  onClick={(e) => handleDeletePhoto(lightboxPhoto, e)}
                  title="Delete photo"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="ag-modal-close"
                  onClick={() => setLightboxPhoto(null)}
                  title="Close preview (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="ag-lightbox-image-wrap">
              <img
                src={lightboxPhoto.image_url}
                alt={lightboxPhoto.title || 'Preview'}
                className="ag-lightbox-image"
              />
            </div>

            <div className="ag-lightbox-details">
              <div>
                <p className="ag-lightbox-desc">
                  {lightboxPhoto.description || 'No caption provided for this photo.'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {lightboxPhoto.category && (
                  <span className="ag-album-meta-badge">
                    {lightboxPhoto.category}
                  </span>
                )}
                <span className="ag-album-meta-badge" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  📁 {getAlbumName(lightboxPhoto.album_id)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── BULK PHOTO UPLOAD STUDIO MODAL ─── */}
      <AdminGalleryBulkModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        albums={albums}
        defaultAlbumId={selectedAlbumId}
        categoriesList={categoriesList}
        onSuccess={async (count, albumName) => {
          setSuccessMsg(`Bulk upload complete! ${count} photos successfully added to "${albumName}".`);
          await loadData();
        }}
        onAlbumCreated={loadData}
      />

      {/* ─── BULK ACTIONS FLOATING BAR & MODALS FOR EXISTING PHOTOS ─── */}
      <AdminGalleryBulkBar
        selectedPhotoIds={selectedPhotoIds}
        setSelectedPhotoIds={setSelectedPhotoIds}
        filteredPhotos={filteredPhotos}
        albums={albums}
        categoriesList={categoriesList}
        onRefresh={loadData}
        setSuccessMsg={setSuccessMsg}
        setErrorMsg={setError}
      />
    </div>
  );
}
