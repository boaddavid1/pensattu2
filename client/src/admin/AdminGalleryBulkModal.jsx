import { useState, useRef, useEffect, useCallback } from 'react';
import { uploadImageToCloudinary } from '../cloudinaryUpload';
import { adminApi } from './adminApi';

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

function formatFilenameToTitle(filename) {
  if (!filename) return '';
  const withoutExt = filename.replace(/\.[^/.]+$/, '');
  const clean = withoutExt.replace(/[-_.]+/g, ' ').trim();
  return clean.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function AdminGalleryBulkModal({
  isOpen,
  onClose,
  albums = [],
  defaultAlbumId = null,
  categoriesList = DEFAULT_CATEGORIES,
  onSuccess,
}) {
  const fileInputRef = useRef(null);
  const [targetAlbumId, setTargetAlbumId] = useState('');
  const [batchCategory, setBatchCategory] = useState('');
  const [batchCaption, setBatchCaption] = useState('');
  const [titleMode, setTitleMode] = useState('filename'); // 'filename' | 'prefix' | 'common'
  const [titlePrefix, setTitlePrefix] = useState('');

  const [queue, setQueue] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0, percent: 0 });
  const [errorMessage, setErrorMessage] = useState('');
  const [successSummary, setSuccessSummary] = useState(null);

  // Sync default target album when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialAlbum = defaultAlbumId || (albums[0]?.id ? String(albums[0].id) : '');
      setTargetAlbumId(initialAlbum ? String(initialAlbum) : '');
      setBatchCategory('');
      setBatchCaption('');
      setTitlePrefix('');
      setTitleMode('filename');
      setQueue([]);
      setErrorMessage('');
      setSuccessSummary(null);
      setIsUploading(false);
    }
  }, [isOpen, defaultAlbumId, albums]);

  // Cleanup object URLs on unmount or when queue clears
  useEffect(() => {
    return () => {
      queue.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  if (!isOpen) return null;

  // Compute title for a file item based on titleMode
  function computeItemTitle(file, index, currentPrefix = titlePrefix, mode = titleMode) {
    if (mode === 'prefix') {
      const base = currentPrefix.trim() || 'Photo';
      return `${base} ${index + 1}`;
    }
    if (mode === 'common') {
      return currentPrefix.trim() || formatFilenameToTitle(file.name);
    }
    return formatFilenameToTitle(file.name);
  }

  // Handle file additions
  function handleAddFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    const incomingFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (incomingFiles.length === 0) {
      setErrorMessage('Please select valid image files (JPEG, PNG, WebP, etc.).');
      return;
    }

    setErrorMessage('');
    const startIndex = queue.length;

    const newItems = incomingFiles.map((file, i) => {
      const idx = startIndex + i;
      return {
        id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        file,
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
        title: computeItemTitle(file, idx),
        category: batchCategory || '',
        caption: batchCaption || '',
        status: 'pending', // 'pending' | 'uploading' | 'success' | 'error'
        cloudinaryUrl: null,
        error: null,
      };
    });

    setQueue((prev) => [...prev, ...newItems]);
  }

  // Apply batch category to all queued items
  function applyCategoryToAll(cat) {
    setBatchCategory(cat);
    setQueue((prev) =>
      prev.map((item) => ({
        ...item,
        category: cat,
      }))
    );
  }

  // Apply batch title settings to all queued items
  function applyTitleModeChange(newMode, newPrefix = titlePrefix) {
    setTitleMode(newMode);
    setQueue((prev) =>
      prev.map((item, idx) => ({
        ...item,
        title: computeItemTitle(item.file, idx, newPrefix, newMode),
      }))
    );
  }

  function handlePrefixChange(newPrefix) {
    setTitlePrefix(newPrefix);
    if (titleMode !== 'filename') {
      setQueue((prev) =>
        prev.map((item, idx) => ({
          ...item,
          title: computeItemTitle(item.file, idx, newPrefix, titleMode),
        }))
      );
    }
  }

  // Apply batch caption to all
  function applyCaptionToAll(caption) {
    setBatchCaption(caption);
    setQueue((prev) =>
      prev.map((item) => ({
        ...item,
        caption,
      }))
    );
  }

  // Item level updates
  function updateItem(id, updates) {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  function removeItem(id) {
    setQueue((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
      const remaining = prev.filter((item) => item.id !== id);
      // Recalculate prefix numbering if in prefix mode
      if (titleMode === 'prefix') {
        return remaining.map((item, idx) => ({
          ...item,
          title: computeItemTitle(item.file, idx, titlePrefix, 'prefix'),
        }));
      }
      return remaining;
    });
  }

  function clearQueue() {
    queue.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    setQueue([]);
    setErrorMessage('');
    setSuccessSummary(null);
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

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  }

  // Start concurrent bulk upload
  async function handleStartBulkUpload() {
    if (queue.length === 0) {
      setErrorMessage('Please add photos to the queue before uploading.');
      return;
    }
    if (!targetAlbumId) {
      setErrorMessage('Please select a target album.');
      return;
    }

    const albumObj = albums.find((a) => String(a.id) === String(targetAlbumId));
    const albumName = albumObj ? albumObj.name : 'Selected Album';

    setIsUploading(true);
    setErrorMessage('');
    setSuccessSummary(null);

    const pendingItems = queue.filter((item) => item.status !== 'success');
    const totalToUpload = pendingItems.length;
    let completedCount = 0;
    const CONCURRENCY = 3;

    // Track successfully uploaded items
    const successPayloads = [];

    // Helper to upload a single item
    async function uploadSingleItem(item) {
      updateItem(item.id, { status: 'uploading', error: null });
      try {
        const url = await uploadImageToCloudinary(item.file, 'pensattu/gallery');
        updateItem(item.id, {
          status: 'success',
          cloudinaryUrl: url,
        });

        successPayloads.push({
          album_id: Number(targetAlbumId),
          src: url,
          alt: item.title.trim() || formatFilenameToTitle(item.file.name),
          category: (item.category || batchCategory || '').trim(),
          caption: (item.caption || batchCaption || '').trim(),
        });
      } catch (err) {
        updateItem(item.id, {
          status: 'error',
          error: err.message || 'Upload failed',
        });
      } finally {
        completedCount++;
        const percent = Math.round((completedCount / totalToUpload) * 100);
        setUploadProgress({
          completed: completedCount,
          total: totalToUpload,
          percent,
        });
      }
    }

    // Process pool with limit of CONCURRENCY
    const itemPool = [...pendingItems];
    async function worker() {
      while (itemPool.length > 0) {
        const nextItem = itemPool.shift();
        if (nextItem) {
          await uploadSingleItem(nextItem);
        }
      }
    }

    const workers = Array.from({ length: Math.min(CONCURRENCY, itemPool.length) }, () => worker());
    await Promise.all(workers);

    // If any succeeded, register them in database via bulk API
    if (successPayloads.length > 0) {
      try {
        await adminApi.bulkAddPhotos({ photos: successPayloads });
        setSuccessSummary({
          count: successPayloads.length,
          total: totalToUpload,
          albumName,
          failedCount: totalToUpload - successPayloads.length,
        });

        if (onSuccess) {
          onSuccess(successPayloads.length, albumName);
        }
      } catch (err) {
        setErrorMessage(`Photos uploaded to Cloudinary, but failed to save in database: ${err.message}`);
      }
    } else {
      setErrorMessage('None of the photos could be uploaded to Cloudinary. Please check your network or upload preset.');
    }

    setIsUploading(false);
  }

  // Retry failed items
  function handleRetryFailed() {
    setQueue((prev) =>
      prev.map((item) =>
        item.status === 'error' ? { ...item, status: 'pending', error: null } : item
      )
    );
    handleStartBulkUpload();
  }

  const totalBytes = queue.reduce((sum, item) => sum + (item.file?.size || 0), 0);
  const pendingCount = queue.filter((i) => i.status !== 'success').length;
  const successCount = queue.filter((i) => i.status === 'success').length;
  const errorCount = queue.filter((i) => i.status === 'error').length;

  return (
    <div className="ag-modal-overlay" onClick={isUploading ? undefined : onClose}>
      <div
        className="ag-modal ag-bulk-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 940, width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Modal Header */}
        <div className="ag-modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid #e2ecf7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0E4C92 0%, #1a66bc 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(14,76,146,0.25)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <h3 className="ag-modal-title" style={{ margin: 0, fontSize: 18 }}>
                Bulk Photo Upload Studio
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                Upload multiple high-resolution photos with batch album, category tagging, and automatic formatting.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ag-modal-close"
            onClick={onClose}
            disabled={isUploading}
            title={isUploading ? 'Upload in progress' : 'Close (Esc)'}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div
          className="ag-modal-body"
          style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}
        >
          {/* Notification Alerts */}
          {errorMessage && (
            <div className="ag-alert error">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
              >
                ✕
              </button>
            </div>
          )}

          {successSummary && (
            <div className="ag-alert success" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  🎉 {successSummary.count} photo{successSummary.count !== 1 ? 's' : ''} successfully published to "{successSummary.albumName}"!
                </span>
                <button
                  type="button"
                  onClick={() => setSuccessSummary(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  ✕
                </button>
              </div>
              {successSummary.failedCount > 0 && (
                <span style={{ fontSize: 12.5, opacity: 0.9 }}>
                  Note: {successSummary.failedCount} item{successSummary.failedCount !== 1 ? 's' : ''} had network issues. You can retry them below.
                </span>
              )}
            </div>
          )}

          {/* ── Batch Configuration Settings Bar ── */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0A2E5C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ⚙️ Batch Settings (Applied to Queue)
              </span>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                You can also customize individual titles and tags in the queue below.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {/* Target Album Selection */}
              <div>
                <label className="ag-form-label" style={{ marginBottom: 6 }}>
                  Target Album *
                </label>
                <select
                  className="ag-form-select"
                  value={targetAlbumId}
                  onChange={(e) => setTargetAlbumId(e.target.value)}
                  disabled={isUploading}
                  required
                >
                  <option value="">Select Target Album</option>
                  {albums.map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title Auto-naming Format */}
              <div>
                <label className="ag-form-label" style={{ marginBottom: 6 }}>
                  Title Formatting
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <select
                    className="ag-form-select"
                    value={titleMode}
                    onChange={(e) => applyTitleModeChange(e.target.value)}
                    disabled={isUploading}
                  >
                    <option value="filename">Use Clean Filenames</option>
                    <option value="prefix">Prefix + Sequential #</option>
                    <option value="common">Common Title for All</option>
                  </select>
                </div>
              </div>

              {/* Conditional Prefix input */}
              {titleMode !== 'filename' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="ag-form-label" style={{ marginBottom: 6 }}>
                    {titleMode === 'prefix' ? 'Title Prefix (e.g., Annual Camp 2026)' : 'Shared Title for All Photos'}
                  </label>
                  <input
                    type="text"
                    className="ag-form-input"
                    placeholder="e.g. Sunday Celebration"
                    value={titlePrefix}
                    onChange={(e) => handlePrefixChange(e.target.value)}
                    disabled={isUploading}
                  />
                </div>
              )}
            </div>

            {/* Batch Category Tag & Chips */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="ag-form-label" style={{ margin: 0 }}>
                  Batch Category Tag
                </label>
                {batchCategory && (
                  <button
                    type="button"
                    onClick={() => applyCategoryToAll('')}
                    style={{ background: 'none', border: 'none', color: '#e74c3c', fontSize: 11.5, cursor: 'pointer', fontWeight: 600 }}
                  >
                    Clear Tag
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="ag-form-input"
                  style={{ maxWidth: 200 }}
                  placeholder="Custom category..."
                  value={batchCategory}
                  onChange={(e) => applyCategoryToAll(e.target.value)}
                  disabled={isUploading}
                />
                <div className="ag-chip-suggestions" style={{ margin: 0 }}>
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`ag-chip-tag ${batchCategory.toLowerCase() === cat.toLowerCase() ? 'selected' : ''}`}
                      onClick={() => applyCategoryToAll(cat)}
                      disabled={isUploading}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Batch Caption */}
            <div>
              <label className="ag-form-label" style={{ marginBottom: 6 }}>
                Default Story / Caption (Optional)
              </label>
              <input
                type="text"
                className="ag-form-input"
                placeholder="Shared caption or scripture reference for all queued photos..."
                value={batchCaption}
                onChange={(e) => applyCaptionToAll(e.target.value)}
                disabled={isUploading}
              />
            </div>
          </div>

          {/* ── Drag & Drop Multi-file Upload Zone ── */}
          <div
            className={`ag-dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: queue.length > 0 ? '24px 20px' : '36px 20px',
              cursor: 'pointer',
              border: isDragging ? '2px dashed #0E4C92' : '2px dashed #cbd5e1',
              backgroundColor: isDragging ? '#eaf3fc' : '#f8fafc',
              borderRadius: 14,
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                handleAddFiles(e.target.files);
                e.target.value = ''; // Reset input to allow selecting the same files again
              }}
              disabled={isUploading}
            />

            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: '#e0ecf8',
                color: '#0E4C92',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: '#0A2E5C', marginBottom: 4 }}>
              Drag & Drop Multiple Photos Here, or Browse
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Select 5, 20, or 50+ photos at once. Supported formats: JPEG, PNG, WebP up to 15MB each.
            </div>
          </div>

          {/* ── Active Queue Header & Batch Actions ── */}
          {queue.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0A2E5C' }}>
                    Queued Photos ({queue.length})
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: 999 }}>
                    Total Size: {formatBytes(totalBytes)}
                  </span>
                  {successCount > 0 && (
                    <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>
                      ✓ {successCount} uploaded
                    </span>
                  )}
                  {errorCount > 0 && (
                    <span style={{ fontSize: 12, color: '#b91c1c', fontWeight: 600 }}>
                      ✕ {errorCount} failed
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="ag-btn-create-album"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    + Add More Photos
                  </button>
                  <button
                    type="button"
                    onClick={clearQueue}
                    disabled={isUploading}
                    style={{
                      background: 'transparent',
                      border: '1px solid #cbd5e1',
                      color: '#64748b',
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Progress Bar (Visible while uploading or after completion) */}
              {(isUploading || uploadProgress.completed > 0) && (
                <div
                  style={{
                    background: '#f1f5f9',
                    borderRadius: 12,
                    padding: '12px 16px',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#0A2E5C' }}>
                    <span>
                      {isUploading
                        ? `⚡ Uploading photos to Cloudinary... (${uploadProgress.completed} of ${uploadProgress.total})`
                        : `Finished uploading batch (${uploadProgress.completed} of ${uploadProgress.total})`}
                    </span>
                    <span>{uploadProgress.percent}%</span>
                  </div>

                  <div style={{ width: '100%', height: 10, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${uploadProgress.percent}%`,
                        background: isUploading
                          ? 'linear-gradient(90deg, #0E4C92, #3b82f6)'
                          : '#16a34a',
                        borderRadius: 999,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Queue Items List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  maxHeight: 340,
                  overflowY: 'auto',
                  paddingRight: 4,
                }}
              >
                {queue.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '70px 1fr 180px 140px 36px',
                        gap: 12,
                        alignItems: 'center',
                        background: item.status === 'success' ? '#f0fdf4' : item.status === 'error' ? '#fef2f2' : '#ffffff',
                        border: item.status === 'success' ? '1px solid #bbf7d0' : item.status === 'error' ? '1px solid #fecaca' : '1px solid #e2e8f0',
                        borderRadius: 10,
                        padding: '8px 12px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Thumbnail Preview */}
                      <div
                        style={{
                          width: 64,
                          height: 52,
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: '#071220',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {item.status === 'success' && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(22, 163, 74, 0.75)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: 16,
                              fontWeight: 800,
                            }}
                          >
                            ✓
                          </div>
                        )}
                      </div>

                      {/* Title & Filename */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <input
                          type="text"
                          className="ag-form-input"
                          style={{ padding: '6px 10px', fontSize: 13, height: 32 }}
                          placeholder="Photo Title..."
                          value={item.title}
                          onChange={(e) => updateItem(item.id, { title: e.target.value })}
                          disabled={isUploading || item.status === 'success'}
                        />
                        <span style={{ fontSize: 11, color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={item.name}>
                          {item.name} • {formatBytes(item.size)}
                        </span>
                      </div>

                      {/* Category Tag Input */}
                      <div>
                        <input
                          type="text"
                          className="ag-form-input"
                          style={{ padding: '6px 10px', fontSize: 12, height: 32 }}
                          placeholder="Category..."
                          value={item.category}
                          onChange={(e) => updateItem(item.id, { category: e.target.value })}
                          disabled={isUploading || item.status === 'success'}
                        />
                      </div>

                      {/* Status Indicator */}
                      <div style={{ textAlign: 'center' }}>
                        {item.status === 'pending' && (
                          <span style={{ fontSize: 11.5, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 999, fontWeight: 600 }}>
                            Ready
                          </span>
                        )}
                        {item.status === 'uploading' && (
                          <span style={{ fontSize: 11.5, background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: 999, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span className="ag-spinner-dot" /> Uploading...
                          </span>
                        )}
                        {item.status === 'success' && (
                          <span style={{ fontSize: 11.5, background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 999, fontWeight: 700 }}>
                            ✓ Uploaded
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span
                            style={{ fontSize: 11.5, background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: 999, fontWeight: 700 }}
                            title={item.error || 'Upload error'}
                          >
                            Failed
                          </span>
                        )}
                      </div>

                      {/* Remove / Action Button */}
                      <div>
                        {item.status !== 'uploading' && item.status !== 'success' && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              fontSize: 16,
                              padding: 4,
                            }}
                            title="Remove photo from queue"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="ag-modal-footer"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2ecf7',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            className="ag-btn-cancel"
            onClick={onClose}
            disabled={isUploading}
          >
            {successSummary ? 'Done & Close' : 'Cancel'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {errorCount > 0 && !isUploading && (
              <button
                type="button"
                className="ag-btn-create-album"
                onClick={handleRetryFailed}
                style={{ color: '#b91c1c', borderColor: '#b91c1c' }}
              >
                Retry {errorCount} Failed Photos
              </button>
            )}

            <button
              type="button"
              className="ag-btn-submit"
              onClick={handleStartBulkUpload}
              disabled={isUploading || queue.length === 0 || pendingCount === 0 || !targetAlbumId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                fontSize: 13.5,
              }}
            >
              {isUploading ? (
                <>
                  <span className="ag-spinner-dot" />
                  Uploading ({uploadProgress.completed}/{uploadProgress.total})...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload {pendingCount > 0 ? `${pendingCount} Photo${pendingCount !== 1 ? 's' : ''}` : 'Photos'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
