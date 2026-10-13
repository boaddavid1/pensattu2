import { useEffect, useState, useMemo } from 'react';
import { adminApi } from './adminApi';
import { uploadImageToCloudinary, uploadAudioToCloudinary } from '../cloudinaryUpload';
import './admin-sermons.css';

const DEFAULT_CATEGORIES = [
  'Sunday Sermon',
  'Midweek Service',
  'Youth Service',
  'Word Feast',
  'Special Conference',
  'Revival',
  'Series'
];

const SUGGESTED_SPEAKERS = [
  'Pastor Mark Johnson',
  'Pastor Alex Mensah',
  'Pastor Helen Owusu',
  'Resident Minister',
  'Youth Pastor',
  'Guest Speaker'
];

// Helper to extract YouTube video ID from various URL formats
export function getYoutubeId(url) {
  if (!url) return null;
  const str = String(url).trim();
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  return match ? match[1] : null;
}

export function getYoutubeEmbedUrl(url) {
  const id = getYoutubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

export function getYoutubeThumbnail(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

// Helper to extract TikTok Video ID or format embed link
export function getTiktokEmbedUrl(url) {
  if (!url) return null;
  const str = String(url).trim();
  const match = str.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/)(\d+)/i);
  if (match) {
    return `https://www.tiktok.com/embed/v2/${match[1]}`;
  }
  return null;
}

function formatDate(dateStr) {
  if (!dateStr) return 'No date';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function AdminSermons() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering & View state
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState('ALL'); // 'ALL' | 'AUDIO' | 'YOUTUBE' | 'TIKTOK' | 'ACTIVE'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'edit'
  const [previewMedia, setPreviewMedia] = useState(null); // sermon object for in-modal preview
  const [previewType, setPreviewType] = useState('audio'); // 'audio' | 'youtube' | 'tiktok'
  const [editingSermon, setEditingSermon] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    category: 'Sunday Sermon',
    description: '',
    date_preached: new Date().toISOString().split('T')[0],
    audio_url: '',
    image_url: '',
    youtube_url: '',
    tiktok_url: '',
    is_active: 1,
  });

  // Uploading / submitting states
  const [audioUploading, setAudioUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAudioDragging, setIsAudioDragging] = useState(false);
  const [isImageDragging, setIsImageDragging] = useState(false);

  useEffect(() => {
    loadSermons();
  }, []);

  // Auto-dismiss success message
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(''), 4500);
    return () => clearTimeout(timer);
  }, [successMsg]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (previewMedia) setPreviewMedia(null);
        else if (activeModal) closeModal();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewMedia, activeModal]);

  async function loadSermons() {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.list('sermons');
      setSermons(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load sermons.');
    } finally {
      setLoading(false);
    }
  }

  // Derived metrics
  const totalCount = sermons.length;
  const audioCount = useMemo(() => sermons.filter((s) => Boolean(s.audio_url)).length, [sermons]);
  const videoCount = useMemo(() => sermons.filter((s) => Boolean(s.youtube_url || s.tiktok_url)).length, [sermons]);
  const activeCount = useMemo(() => sermons.filter((s) => s.is_active === 1 || s.is_active === true).length, [sermons]);

  // Derived category list
  const categoryList = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    sermons.forEach((s) => {
      if (s.category && s.category.trim()) set.add(s.category.trim());
    });
    return Array.from(set);
  }, [sermons]);

  // Filtered sermons
  const filteredSermons = useMemo(() => {
    return sermons.filter((s) => {
      // Media filter
      if (mediaFilter === 'AUDIO' && !s.audio_url) return false;
      if (mediaFilter === 'YOUTUBE' && !s.youtube_url) return false;
      if (mediaFilter === 'TIKTOK' && !s.tiktok_url) return false;
      if (mediaFilter === 'ACTIVE' && (s.is_active === 0 || s.is_active === false)) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && (s.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (s.title || '').toLowerCase().includes(q);
        const speakerMatch = (s.speaker || '').toLowerCase().includes(q);
        const catMatch = (s.category || '').toLowerCase().includes(q);
        const descMatch = (s.description || '').toLowerCase().includes(q);
        return titleMatch || speakerMatch || catMatch || descMatch;
      }

      return true;
    });
  }, [sermons, mediaFilter, selectedCategory, searchQuery]);

  // Open modals
  function openCreateModal() {
    setFormData({
      title: '',
      speaker: '',
      category: 'Sunday Sermon',
      description: '',
      date_preached: new Date().toISOString().split('T')[0],
      audio_url: '',
      image_url: '',
      youtube_url: '',
      tiktok_url: '',
      is_active: 1,
    });
    setEditingSermon(null);
    setActiveModal('create');
  }

  function openEditModal(sermon, e) {
    if (e) e.stopPropagation();
    setEditingSermon(sermon);
    let dateStr = '';
    if (sermon.date_preached) {
      dateStr = String(sermon.date_preached).split('T')[0];
    }
    setFormData({
      title: sermon.title || '',
      speaker: sermon.speaker || '',
      category: sermon.category || 'Sunday Sermon',
      description: sermon.description || '',
      date_preached: dateStr,
      audio_url: sermon.audio_url || '',
      image_url: sermon.image_url || '',
      youtube_url: sermon.youtube_url || '',
      tiktok_url: sermon.tiktok_url || '',
      is_active: sermon.is_active !== undefined ? (sermon.is_active ? 1 : 0) : 1,
    });
    setActiveModal('edit');
  }

  function closeModal() {
    setActiveModal(null);
    setEditingSermon(null);
    setError('');
  }

  // Audio Upload Handling
  async function handleAudioFile(file) {
    if (!file) return;
    setAudioUploading(true);
    setError('');
    try {
      const url = await uploadAudioToCloudinary(file, 'pensattu/sermons/audio');
      setFormData((prev) => ({
        ...prev,
        audio_url: url,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));
    } catch (err) {
      setError(err.message || 'Audio upload failed. Please try again or provide audio URL.');
    } finally {
      setAudioUploading(false);
    }
  }

  // Cover Image Upload Handling
  async function handleImageFile(file) {
    if (!file) return;
    setImageUploading(true);
    setError('');
    try {
      const url = await uploadImageToCloudinary(file, 'pensattu/sermons');
      setFormData((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      setError(err.message || 'Image upload failed.');
    } finally {
      setImageUploading(false);
    }
  }

  // Auto-fill thumbnail from YouTube link
  function handleUseYoutubeThumbnail() {
    const thumb = getYoutubeThumbnail(formData.youtube_url);
    if (thumb) {
      setFormData((prev) => ({ ...prev, image_url: thumb }));
    }
  }

  // CRUD Handlers
  async function handleSaveSermon(e) {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Sermon title is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      title: formData.title.trim(),
      speaker: formData.speaker.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),
      date_preached: formData.date_preached || null,
      audio_url: formData.audio_url.trim() || null,
      image_url: formData.image_url.trim() || null,
      youtube_url: formData.youtube_url.trim() || null,
      tiktok_url: formData.tiktok_url.trim() || null,
      is_active: formData.is_active ? 1 : 0,
    };

    try {
      if (editingSermon) {
        await adminApi.update('sermons', editingSermon.id, payload);
        setSuccessMsg(`Sermon "${formData.title}" updated successfully.`);
      } else {
        await adminApi.create('sermons', payload);
        setSuccessMsg(`Sermon "${formData.title}" created successfully.`);
      }
      closeModal();
      await loadSermons();
    } catch (err) {
      setError(err.message || 'Failed to save sermon.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSermon(sermon, e) {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete sermon "${sermon.title}"?`)) return;

    try {
      await adminApi.remove('sermons', sermon.id);
      setSuccessMsg(`Sermon "${sermon.title}" removed.`);
      if (previewMedia && previewMedia.id === sermon.id) {
        setPreviewMedia(null);
      }
      await loadSermons();
    } catch (err) {
      setError(err.message || 'Failed to delete sermon.');
    }
  }

  async function handleToggleStatus(sermon, e) {
    if (e) e.stopPropagation();
    const newStatus = sermon.is_active ? 0 : 1;
    try {
      await adminApi.update('sermons', sermon.id, { is_active: newStatus });
      setSermons((prev) =>
        prev.map((s) => (s.id === sermon.id ? { ...s, is_active: newStatus } : s))
      );
    } catch (err) {
      setError(err.message || 'Failed to toggle status.');
    }
  }

  // Quick media preview trigger
  function openMediaPreview(sermon, preferredType = 'audio') {
    setPreviewMedia(sermon);
    if (preferredType === 'youtube' && sermon.youtube_url) {
      setPreviewType('youtube');
    } else if (preferredType === 'tiktok' && sermon.tiktok_url) {
      setPreviewType('tiktok');
    } else if (sermon.audio_url) {
      setPreviewType('audio');
    } else if (sermon.youtube_url) {
      setPreviewType('youtube');
    } else if (sermon.tiktok_url) {
      setPreviewType('tiktok');
    } else {
      setPreviewType('audio');
    }
  }

  if (loading) {
    return (
      <div className="admin-sermons-page">
        <div className="as-hero">
          <div className="as-hero-content">
            <span className="as-pill-badge">Media &amp; Pulpit • Sermons Studio</span>
            <h1 className="as-hero-title">Sermons &amp; Pulpit Ministry</h1>
            <p className="as-hero-subtitle">Loading sermon catalog and multimedia links...</p>
          </div>
        </div>
        <div className="as-empty-state">
          <div className="as-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3 className="as-empty-title">Loading Messages</h3>
          <p className="as-empty-desc">Fetching audio streams, YouTube recordings, and pulpit archives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-sermons-page">
      {/* ─── Hero Header & Stats ─── */}
      <div className="as-hero">
        <div className="as-hero-content">
          <span className="as-pill-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            Media &amp; Pulpit • Sermons Studio
          </span>
          <h1 className="as-hero-title">Sermons &amp; Pulpit Ministry</h1>
          <p className="as-hero-subtitle">
            Archive preachings, stream high-fidelity audio messages, and seamlessly link YouTube broadcasts and TikTok clips.
          </p>
        </div>

        <div className="as-hero-stats">
          <div className="as-stat-box">
            <div className="as-stat-num">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              {totalCount}
            </div>
            <div className="as-stat-label">Total Messages</div>
          </div>
          <div className="as-stat-box">
            <div className="as-stat-num" style={{ color: '#15803d' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              {audioCount}
            </div>
            <div className="as-stat-label">Audio Tracks</div>
          </div>
          <div className="as-stat-box">
            <div className="as-stat-num" style={{ color: '#b91c1c' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              {videoCount}
            </div>
            <div className="as-stat-label">Video Links</div>
          </div>
          <div className="as-stat-box">
            <div className="as-stat-num" style={{ color: '#0A2E5C' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              {activeCount}
            </div>
            <div className="as-stat-label">Published</div>
          </div>
        </div>
      </div>

      {/* ─── Notification Alerts ─── */}
      {successMsg && (
        <div className="as-alert success">
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
        <div className="as-alert error">
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
      <div className="as-controls-bar">
        {/* Media Filter Tabs */}
        <div className="as-filter-tabs">
          <button
            type="button"
            className={`as-filter-tab ${mediaFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setMediaFilter('ALL')}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            className={`as-filter-tab ${mediaFilter === 'AUDIO' ? 'active' : ''}`}
            onClick={() => setMediaFilter('AUDIO')}
          >
            🎧 Audio ({audioCount})
          </button>
          <button
            type="button"
            className={`as-filter-tab ${mediaFilter === 'YOUTUBE' ? 'active' : ''}`}
            onClick={() => setMediaFilter('YOUTUBE')}
          >
            ▶ YouTube ({sermons.filter((s) => s.youtube_url).length})
          </button>
          <button
            type="button"
            className={`as-filter-tab ${mediaFilter === 'TIKTOK' ? 'active' : ''}`}
            onClick={() => setMediaFilter('TIKTOK')}
          >
            📱 TikTok ({sermons.filter((s) => s.tiktok_url).length})
          </button>
          <button
            type="button"
            className={`as-filter-tab ${mediaFilter === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setMediaFilter('ACTIVE')}
          >
            ✓ Published ({activeCount})
          </button>
        </div>

        {/* Live Search */}
        <div className="as-search-wrapper">
          <span className="as-search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="as-search-input"
            placeholder="Search by title, speaker, scripture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="as-search-clear"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Actions & View Toggle */}
        <div className="as-actions-group">
          <div className="as-view-toggle">
            <button
              type="button"
              className={`as-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              type="button"
              className={`as-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            className="as-btn-add"
            onClick={openCreateModal}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Sermon
          </button>
        </div>
      </div>

      {/* ─── Category Filter Chips ─── */}
      <div className="as-chips-bar">
        <span className="as-chips-label">Series &amp; Category:</span>
        <button
          type="button"
          className={`as-chip ${selectedCategory === 'ALL' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('ALL')}
        >
          All Categories
        </button>
        {categoryList.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`as-chip ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
            onClick={() => setSelectedCategory(selectedCategory.toLowerCase() === cat.toLowerCase() ? 'ALL' : cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ─── Sermons List (Grid View) ─── */}
      {viewMode === 'grid' && (
        <>
          {filteredSermons.length === 0 ? (
            <div className="as-empty-state">
              <div className="as-empty-icon">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </div>
              <h3 className="as-empty-title">
                {searchQuery || mediaFilter !== 'ALL' || selectedCategory !== 'ALL'
                  ? 'No sermons match your filters'
                  : 'No sermons created yet'}
              </h3>
              <p className="as-empty-desc">
                {searchQuery || mediaFilter !== 'ALL' || selectedCategory !== 'ALL'
                  ? 'Try clearing your search query or switching to all media types.'
                  : 'Add your first sermon to archive Sunday messages, audio podcasts, and video links.'}
              </p>
              {!searchQuery && mediaFilter === 'ALL' && selectedCategory === 'ALL' && (
                <button
                  type="button"
                  className="as-btn-add"
                  onClick={openCreateModal}
                  style={{ marginTop: 8 }}
                >
                  Create First Sermon
                </button>
              )}
            </div>
          ) : (
            <div className="as-grid">
              {filteredSermons.map((sermon) => {
                const hasAudio = Boolean(sermon.audio_url);
                const hasYoutube = Boolean(sermon.youtube_url);
                const hasTiktok = Boolean(sermon.tiktok_url);
                const isActive = sermon.is_active === 1 || sermon.is_active === true;
                const cover = sermon.image_url || getYoutubeThumbnail(sermon.youtube_url);

                return (
                  <div key={sermon.id} className="as-card">
                    {/* Media Artwork Cover */}
                    <div className="as-card-media">
                      {cover ? (
                        <img
                          src={cover}
                          alt={sermon.title}
                          className="as-card-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="as-card-placeholder">
                          <span className="as-placeholder-icon">🎙️</span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>
                            {sermon.speaker || 'PENSA Pulpit'}
                          </span>
                        </div>
                      )}

                      <div className="as-card-badges">
                        <span className="as-card-tag">{sermon.category || 'Sermon'}</span>
                        <span className="as-card-date">{formatDate(sermon.date_preached)}</span>
                      </div>

                      {/* Hover action circle to preview media */}
                      {(hasAudio || hasYoutube || hasTiktok) && (
                        <div className="as-card-overlay-actions">
                          {hasAudio && (
                            <button
                              type="button"
                              className="as-preview-circle-btn"
                              onClick={() => openMediaPreview(sermon, 'audio')}
                              title="Listen to audio"
                            >
                              🎧
                            </button>
                          )}
                          {hasYoutube && (
                            <button
                              type="button"
                              className="as-preview-circle-btn"
                              onClick={() => openMediaPreview(sermon, 'youtube')}
                              title="Watch YouTube video"
                            >
                              ▶
                            </button>
                          )}
                          {hasTiktok && (
                            <button
                              type="button"
                              className="as-preview-circle-btn"
                              onClick={() => openMediaPreview(sermon, 'tiktok')}
                              title="Watch TikTok video"
                            >
                              📱
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="as-card-body">
                      {sermon.speaker && (
                        <div className="as-card-speaker">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          {sermon.speaker}
                        </div>
                      )}

                      <h3 className="as-card-title" title={sermon.title}>
                        {sermon.title}
                      </h3>

                      <p className="as-card-desc" title={sermon.description || 'No description'}>
                        {sermon.description || 'No scripture or sermon notes provided.'}
                      </p>

                      {/* Media Badges */}
                      <div className="as-media-chips-row">
                        {hasAudio && (
                          <button
                            type="button"
                            className="as-media-chip audio"
                            onClick={() => openMediaPreview(sermon, 'audio')}
                          >
                            🎧 Audio Available
                          </button>
                        )}
                        {hasYoutube && (
                          <button
                            type="button"
                            className="as-media-chip youtube"
                            onClick={() => openMediaPreview(sermon, 'youtube')}
                          >
                            ▶ YouTube
                          </button>
                        )}
                        {hasTiktok && (
                          <button
                            type="button"
                            className="as-media-chip tiktok"
                            onClick={() => openMediaPreview(sermon, 'tiktok')}
                          >
                            📱 TikTok
                          </button>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="as-card-footer">
                        <button
                          type="button"
                          className={`as-status-badge ${isActive ? 'active' : 'draft'}`}
                          onClick={(e) => handleToggleStatus(sermon, e)}
                          title="Click to toggle status"
                          style={{ border: 'none', cursor: 'pointer' }}
                        >
                          <span style={{ fontSize: 9 }}>●</span> {isActive ? 'Published' : 'Draft / Inactive'}
                        </button>

                        <div className="as-card-actions">
                          <button
                            type="button"
                            className="as-action-icon-btn"
                            onClick={(e) => openEditModal(sermon, e)}
                            title="Edit sermon"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="as-action-icon-btn danger"
                            onClick={(e) => handleDeleteSermon(sermon, e)}
                            title="Delete sermon"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

      {/* ─── Sermons List (Table View) ─── */}
      {viewMode === 'table' && (
        <div className="as-table-card">
          <div className="as-table-wrap">
            <table className="as-table">
              <thead>
                <tr>
                  <th>Sermon &amp; Speaker</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Media Available</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSermons.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                      No sermons matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredSermons.map((sermon) => {
                    const cover = sermon.image_url || getYoutubeThumbnail(sermon.youtube_url);
                    const isActive = sermon.is_active === 1 || sermon.is_active === true;
                    return (
                      <tr key={sermon.id}>
                        <td>
                          <div className="as-table-sermon-cell">
                            {cover ? (
                              <img src={cover} alt={sermon.title} className="as-table-thumb" />
                            ) : (
                              <div className="as-table-thumb-placeholder">🎙️</div>
                            )}
                            <div>
                              <strong style={{ color: '#0A2E5C', display: 'block', fontSize: 14 }}>
                                {sermon.title}
                              </strong>
                              <span style={{ fontSize: 12, color: '#0E4C92', fontWeight: 600 }}>
                                {sermon.speaker || 'PENSA Preacher'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: 13, color: '#64748b' }}>
                          {formatDate(sermon.date_preached)}
                        </td>
                        <td>
                          <span className="as-card-tag" style={{ background: '#f1f5fa', color: '#0A2E5C', border: '1px solid #d4e0ee' }}>
                            {sermon.category || 'Sermon'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {sermon.audio_url && (
                              <button
                                type="button"
                                className="as-media-chip audio"
                                onClick={() => openMediaPreview(sermon, 'audio')}
                              >
                                🎧 Audio
                              </button>
                            )}
                            {sermon.youtube_url && (
                              <button
                                type="button"
                                className="as-media-chip youtube"
                                onClick={() => openMediaPreview(sermon, 'youtube')}
                              >
                                ▶ YouTube
                              </button>
                            )}
                            {sermon.tiktok_url && (
                              <button
                                type="button"
                                className="as-media-chip tiktok"
                                onClick={() => openMediaPreview(sermon, 'tiktok')}
                              >
                                📱 TikTok
                              </button>
                            )}
                            {!sermon.audio_url && !sermon.youtube_url && !sermon.tiktok_url && (
                              <span style={{ fontSize: 12, color: '#94a3b8' }}>None</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`as-status-badge ${isActive ? 'active' : 'draft'}`}
                            onClick={(e) => handleToggleStatus(sermon, e)}
                            style={{ border: 'none', cursor: 'pointer' }}
                          >
                            {isActive ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              type="button"
                              className="as-action-icon-btn"
                              onClick={(e) => openEditModal(sermon, e)}
                              title="Edit sermon"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="as-action-icon-btn danger"
                              onClick={(e) => handleDeleteSermon(sermon, e)}
                              title="Delete sermon"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE / EDIT SERMON ─── */}
      {(activeModal === 'create' || activeModal === 'edit') && (
        <div className="as-modal-overlay" onClick={closeModal}>
          <div className="as-modal" onClick={(e) => e.stopPropagation()}>
            <div className="as-modal-header">
              <h3 className="as-modal-title">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                {activeModal === 'edit' ? 'Edit Sermon & Media' : 'Add New Sermon'}
              </h3>
              <button type="button" className="as-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSermon}>
              <div className="as-modal-body">
                {/* 1. General Info */}
                <div className="as-form-section">
                  <h4 className="as-form-section-title">
                    <span>📖</span> Message Details
                  </h4>

                  <div className="as-form-group">
                    <label className="as-form-label">Sermon Title *</label>
                    <input
                      type="text"
                      className="as-form-input"
                      placeholder="e.g., The Mystery of Divine Remembrance"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="as-form-row">
                    <div className="as-form-group">
                      <label className="as-form-label">
                        Preacher / Speaker
                        <span className="as-form-label-opt">Name &amp; Title</span>
                      </label>
                      <input
                        type="text"
                        className="as-form-input"
                        placeholder="e.g., Pastor Mark Johnson"
                        value={formData.speaker}
                        onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                      />
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                        {SUGGESTED_SPEAKERS.map((sp) => (
                          <button
                            key={sp}
                            type="button"
                            className="as-chip"
                            style={{ fontSize: 10.5, padding: '2px 8px' }}
                            onClick={() => setFormData({ ...formData, speaker: sp })}
                          >
                            {sp}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="as-form-group">
                      <label className="as-form-label">Date Preached</label>
                      <input
                        type="date"
                        className="as-form-input"
                        value={formData.date_preached}
                        onChange={(e) => setFormData({ ...formData, date_preached: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="as-form-group">
                    <label className="as-form-label">Category / Series</label>
                    <input
                      type="text"
                      className="as-form-input"
                      placeholder="e.g., Sunday Sermon, Midweek, Revival"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className="as-chip"
                          style={{ fontSize: 10.5, padding: '2px 8px' }}
                          onClick={() => setFormData({ ...formData, category: cat })}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="as-form-group">
                    <label className="as-form-label">
                      Scripture Reference &amp; Message Notes
                      <span className="as-form-label-opt">Optional</span>
                    </label>
                    <textarea
                      className="as-form-textarea"
                      placeholder="e.g., Genesis 8:1, Psalm 103:1-5 — Sermon summary and key revelation points..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                {/* 2. Audio Upload & Hub */}
                <div className="as-form-section">
                  <h4 className="as-form-section-title">
                    <span>🎧</span> Audio Recording Upload
                  </h4>

                  {formData.audio_url ? (
                    <div className="as-audio-preview">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>✓</span> Audio Attached
                        </span>
                        <button
                          type="button"
                          className="as-chip"
                          style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                          onClick={() => setFormData({ ...formData, audio_url: '' })}
                        >
                          Remove Audio
                        </button>
                      </div>
                      <audio controls src={formData.audio_url} className="as-audio-player">
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  ) : (
                    <label
                      className={`as-dropzone ${isAudioDragging ? 'dragging' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setIsAudioDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsAudioDragging(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsAudioDragging(false);
                        const files = e.dataTransfer.files;
                        if (files && files[0]) handleAudioFile(files[0]);
                      }}
                    >
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                        style={{ display: 'none' }}
                        onChange={(e) => handleAudioFile(e.target.files[0])}
                        disabled={audioUploading}
                      />
                      <div className="as-dropzone-icon">
                        {audioUploading ? '⏳' : '🎧'}
                      </div>
                      <div className="as-dropzone-text">
                        {audioUploading ? 'Uploading audio to Cloudinary...' : 'Click or drag MP3 / Audio file here'}
                      </div>
                      <div className="as-dropzone-sub">
                        MP3, M4A, WAV, AAC supported (Auto-streamed)
                      </div>
                    </label>
                  )}

                  <div style={{ marginTop: 4 }}>
                    <input
                      type="text"
                      className="as-form-input"
                      placeholder="Or paste direct audio URL (https://...)"
                      value={formData.audio_url}
                      onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                    />
                  </div>
                </div>

                {/* 3. Video Links (YouTube & TikTok) */}
                <div className="as-form-section">
                  <h4 className="as-form-section-title">
                    <span>🎬</span> Video Streaming Links
                  </h4>

                  {/* YouTube Link */}
                  <div className="as-form-group">
                    <label className="as-form-label">
                      YouTube Video Link
                      <span className="as-form-label-opt">Full message or live stream</span>
                    </label>
                    <input
                      type="text"
                      className="as-form-input"
                      placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    />

                    {formData.youtube_url && getYoutubeId(formData.youtube_url) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                            ✓ YouTube Video Detected
                          </span>
                          {!formData.image_url && (
                            <button
                              type="button"
                              className="as-chip"
                              onClick={handleUseYoutubeThumbnail}
                              style={{ color: '#0E4C92', borderColor: '#93c5fd' }}
                            >
                              Use YouTube Thumbnail as Artwork
                            </button>
                          )}
                        </div>
                        <div className="as-video-preview">
                          <iframe
                            src={getYoutubeEmbedUrl(formData.youtube_url)}
                            title="YouTube Preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TikTok Link */}
                  <div className="as-form-group" style={{ marginTop: 10 }}>
                    <label className="as-form-label">
                      TikTok Video Link
                      <span className="as-form-label-opt">Short clip or highlight</span>
                    </label>
                    <input
                      type="text"
                      className="as-form-input"
                      placeholder="https://www.tiktok.com/@pensattu/video/..."
                      value={formData.tiktok_url}
                      onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                    />

                    {formData.tiktok_url && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 12, color: '#0f172a', fontWeight: 600 }}>
                          📱 TikTok link attached
                        </span>
                        <a
                          href={formData.tiktok_url}
                          target="_blank"
                          rel="noreferrer"
                          className="as-chip"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          Open in TikTok ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Artwork / Cover Image */}
                <div className="as-form-section">
                  <h4 className="as-form-section-title">
                    <span>🖼️</span> Cover Artwork
                  </h4>

                  {formData.image_url ? (
                    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 180, border: '1px solid #d4e0ee' }}>
                      <img src={formData.image_url} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'rgba(231,76,60,0.9)',
                          color: '#fff',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Remove Artwork
                      </button>
                    </div>
                  ) : (
                    <label
                      className={`as-dropzone ${isImageDragging ? 'dragging' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setIsImageDragging(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsImageDragging(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsImageDragging(false);
                        const files = e.dataTransfer.files;
                        if (files && files[0]) handleImageFile(files[0]);
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleImageFile(e.target.files[0])}
                        disabled={imageUploading}
                      />
                      <div className="as-dropzone-icon">
                        {imageUploading ? '⏳' : '🖼️'}
                      </div>
                      <div className="as-dropzone-text">
                        {imageUploading ? 'Uploading artwork...' : 'Click or drag cover image here'}
                      </div>
                      <div className="as-dropzone-sub">
                        16:9 ratio recommended (JPG, PNG, WebP)
                      </div>
                    </label>
                  )}

                  <div style={{ marginTop: 4 }}>
                    <input
                      type="text"
                      className="as-form-input"
                      placeholder="Or paste direct image URL (https://...)"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>
                </div>

                {/* 5. Publish Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px' }}>
                  <div>
                    <strong style={{ fontSize: 13.5, color: '#0A2E5C', display: 'block' }}>
                      Publish Immediately
                    </strong>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      Active sermons appear on the public website and sermons archive.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.is_active)}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div className="as-modal-footer">
                <button type="button" className="as-btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="as-btn-submit"
                  disabled={!formData.title.trim() || audioUploading || imageUploading || submitting}
                >
                  {submitting
                    ? 'Saving...'
                    : activeModal === 'edit'
                    ? 'Update Sermon'
                    : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MEDIA PREVIEW LIGHTBOX MODAL ─── */}
      {previewMedia && (
        <div className="as-lightbox-overlay" onClick={() => setPreviewMedia(null)}>
          <div className="as-lightbox-container" onClick={(e) => e.stopPropagation()}>
            <div className="as-lightbox-header">
              <h4 className="as-lightbox-title">
                {previewType === 'audio' && '🎧 Audio Sermon Preview'}
                {previewType === 'youtube' && '▶ YouTube Message Broadcast'}
                {previewType === 'tiktok' && '📱 TikTok Clip Preview'}
                {' — '}{previewMedia.title}
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Media Switcher Buttons */}
                {previewMedia.audio_url && (
                  <button
                    type="button"
                    className={`as-chip ${previewType === 'audio' ? 'active' : ''}`}
                    onClick={() => setPreviewType('audio')}
                    style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: previewType === 'audio' ? '#0E4C92' : 'transparent' }}
                  >
                    Audio
                  </button>
                )}
                {previewMedia.youtube_url && (
                  <button
                    type="button"
                    className={`as-chip ${previewType === 'youtube' ? 'active' : ''}`}
                    onClick={() => setPreviewType('youtube')}
                    style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: previewType === 'youtube' ? '#b91c1c' : 'transparent' }}
                  >
                    YouTube
                  </button>
                )}
                {previewMedia.tiktok_url && (
                  <button
                    type="button"
                    className={`as-chip ${previewType === 'tiktok' ? 'active' : ''}`}
                    onClick={() => setPreviewType('tiktok')}
                    style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', background: previewType === 'tiktok' ? '#0f172a' : 'transparent' }}
                  >
                    TikTok
                  </button>
                )}
                <button
                  type="button"
                  className="as-modal-close"
                  onClick={() => setPreviewMedia(null)}
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="as-lightbox-media-wrap">
              {/* Audio Player View */}
              {previewType === 'audio' && previewMedia.audio_url && (
                <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                  {previewMedia.image_url ? (
                    <img
                      src={previewMedia.image_url}
                      alt={previewMedia.title}
                      style={{ width: 180, height: 180, borderRadius: 16, objectFit: 'cover', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}
                    />
                  ) : (
                    <div style={{ width: 140, height: 140, borderRadius: '50%', background: '#0E4C92', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                      🎙️
                    </div>
                  )}
                  <div style={{ textAlign: 'center', color: '#fff' }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{previewMedia.title}</h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                      {previewMedia.speaker || 'PENSA TTU Pulpit'} • {formatDate(previewMedia.date_preached)}
                    </p>
                  </div>
                  <audio controls autoPlay src={previewMedia.audio_url} style={{ width: '100%', outline: 'none' }}>
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}

              {/* YouTube Embed View */}
              {previewType === 'youtube' && previewMedia.youtube_url && (
                <div style={{ width: '100%', height: '100%', minHeight: 400, position: 'relative' }}>
                  <iframe
                    src={getYoutubeEmbedUrl(previewMedia.youtube_url)}
                    title={previewMedia.title}
                    style={{ width: '100%', height: '100%', minHeight: 420, border: 'none', borderRadius: 12 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* TikTok View */}
              {previewType === 'tiktok' && previewMedia.tiktok_url && (
                <div style={{ textAlign: 'center', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 50 }}>📱</div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>TikTok Message Clip</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', maxWidth: 440 }}>
                    {previewMedia.title}
                  </p>
                  <a
                    href={previewMedia.tiktok_url}
                    target="_blank"
                    rel="noreferrer"
                    className="as-btn-submit"
                    style={{ textDecoration: 'none', background: '#0f172a' }}
                  >
                    Open on TikTok App / Browser ↗
                  </a>
                </div>
              )}
            </div>

            <div className="as-lightbox-footer">
              <div>
                <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>
                  Preacher: <strong style={{ color: '#fff' }}>{previewMedia.speaker || 'PENSA Minister'}</strong>
                </span>
                {previewMedia.category && (
                  <span style={{ marginLeft: 12, fontSize: 12, color: '#93c5fd' }}>
                    • {previewMedia.category}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="as-chip"
                  onClick={() => {
                    const m = previewMedia;
                    setPreviewMedia(null);
                    openEditModal(m);
                  }}
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  ✎ Edit Details
                </button>
                <button
                  type="button"
                  className="as-chip"
                  onClick={() => setPreviewMedia(null)}
                  style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
