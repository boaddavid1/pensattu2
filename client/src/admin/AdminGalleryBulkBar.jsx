import { useState } from 'react';
import { adminApi } from './adminApi';

export default function AdminGalleryBulkBar({
  selectedPhotoIds = [],
  setSelectedPhotoIds,
  filteredPhotos = [],
  albums = [],
  categoriesList = [],
  onRefresh,
  setSuccessMsg,
  setErrorMsg,
}) {
  const [activeModal, setActiveModal] = useState(null); // 'move' | 'tag' | 'delete' | null
  const [targetAlbumId, setTargetAlbumId] = useState('');
  const [targetCategory, setTargetCategory] = useState('');
  const [loading, setLoading] = useState(false);

  if (selectedPhotoIds.length === 0) return null;

  const count = selectedPhotoIds.length;
  const allVisibleSelected =
    filteredPhotos.length > 0 &&
    filteredPhotos.every((p) => selectedPhotoIds.includes(p.id));

  function handleToggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedPhotoIds([]);
    } else {
      const visibleIds = filteredPhotos.map((p) => p.id);
      setSelectedPhotoIds(Array.from(new Set([...selectedPhotoIds, ...visibleIds])));
    }
  }

  function openMoveModal() {
    setTargetAlbumId(albums[0]?.id ? String(albums[0].id) : '');
    setActiveModal('move');
  }

  function openTagModal() {
    setTargetCategory('');
    setActiveModal('tag');
  }

  function openDeleteModal() {
    setActiveModal('delete');
  }

  function closeModal() {
    if (loading) return;
    setActiveModal(null);
  }

  async function handleExecuteMove(e) {
    e.preventDefault();
    if (!targetAlbumId) return;
    setLoading(true);
    try {
      await adminApi.bulkMovePhotos(selectedPhotoIds, targetAlbumId);
      const targetAlbum = albums.find((a) => String(a.id) === String(targetAlbumId));
      setSuccessMsg(`Successfully moved ${count} photo${count !== 1 ? 's' : ''} to "${targetAlbum?.name || 'Album'}".`);
      setSelectedPhotoIds([]);
      closeModal();
      if (onRefresh) await onRefresh();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to move photos.');
    } finally {
      setLoading(false);
    }
  }

  async function handleExecuteTag(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.bulkTagPhotos(selectedPhotoIds, targetCategory.trim());
      setSuccessMsg(
        targetCategory.trim()
          ? `Successfully assigned category "${targetCategory}" to ${count} photo${count !== 1 ? 's' : ''}.`
          : `Cleared category tags for ${count} photo${count !== 1 ? 's' : ''}.`
      );
      setSelectedPhotoIds([]);
      closeModal();
      if (onRefresh) await onRefresh();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update category.');
    } finally {
      setLoading(false);
    }
  }

  async function handleExecuteDelete() {
    setLoading(true);
    try {
      await adminApi.bulkDeletePhotos(selectedPhotoIds);
      setSuccessMsg(`Successfully deleted ${count} photo${count !== 1 ? 's' : ''}.`);
      setSelectedPhotoIds([]);
      closeModal();
      if (onRefresh) await onRefresh();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete photos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── Floating Action Bar Docked at Bottom Center ── */}
      <div className="ag-bulk-floating-bar">
        <div className="ag-bulk-bar-left">
          <div className="ag-bulk-count-badge">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>
              <strong>{count}</strong> selected
            </span>
          </div>

          <button
            type="button"
            className="ag-bulk-btn ghost"
            onClick={handleToggleSelectAll}
            title={allVisibleSelected ? 'Deselect visible photos' : 'Select all visible photos'}
          >
            {allVisibleSelected ? 'Deselect Visible' : `Select All Visible (${filteredPhotos.length})`}
          </button>
        </div>

        <div className="ag-bulk-bar-actions">
          <button
            type="button"
            className="ag-bulk-btn action"
            onClick={openMoveModal}
            disabled={albums.length <= 1}
            title={albums.length <= 1 ? 'Need more than 1 album to move' : 'Move selected photos to another album'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            Move Album
          </button>

          <button
            type="button"
            className="ag-bulk-btn action"
            onClick={openTagModal}
            title="Assign category to selected photos"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Set Category
          </button>

          <button
            type="button"
            className="ag-bulk-btn danger"
            onClick={openDeleteModal}
            title="Delete all selected photos"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>

          <button
            type="button"
            className="ag-bulk-btn close"
            onClick={() => setSelectedPhotoIds([])}
            title="Clear selection (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Modal: Bulk Move ── */}
      {activeModal === 'move' && (
        <div className="ag-modal-overlay" onClick={closeModal}>
          <div className="ag-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="ag-modal-header">
              <h3 className="ag-modal-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                Move {count} Photo{count !== 1 ? 's' : ''} to Album
              </h3>
              <button type="button" className="ag-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteMove}>
              <div className="ag-modal-body">
                <div className="ag-form-group">
                  <label className="ag-form-label">
                    Destination Album *
                  </label>
                  <select
                    className="ag-form-select"
                    value={targetAlbumId}
                    onChange={(e) => setTargetAlbumId(e.target.value)}
                    required
                  >
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ag-modal-footer">
                <button type="button" className="ag-btn-cancel" onClick={closeModal} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="ag-btn-submit" disabled={loading || !targetAlbumId}>
                  {loading ? 'Moving...' : `Move ${count} Photos`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Bulk Tag Category ── */}
      {activeModal === 'tag' && (
        <div className="ag-modal-overlay" onClick={closeModal}>
          <div className="ag-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="ag-modal-header">
              <h3 className="ag-modal-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                Assign Category to {count} Photo{count !== 1 ? 's' : ''}
              </h3>
              <button type="button" className="ag-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteTag}>
              <div className="ag-modal-body">
                <div className="ag-form-group">
                  <label className="ag-form-label">
                    Category Tag
                    <span className="ag-form-label-opt">Leave blank to clear tags</span>
                  </label>
                  <input
                    type="text"
                    className="ag-form-input"
                    placeholder="e.g., Worship, Outreach, Youth"
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    autoFocus
                  />
                  <div className="ag-chip-suggestions" style={{ marginTop: 10 }}>
                    {categoriesList.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`ag-chip-tag ${targetCategory.toLowerCase() === cat.toLowerCase() ? 'selected' : ''}`}
                        onClick={() => setTargetCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ag-modal-footer">
                <button type="button" className="ag-btn-cancel" onClick={closeModal} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="ag-btn-submit" disabled={loading}>
                  {loading ? 'Applying...' : 'Apply Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Bulk Delete Confirmation ── */}
      {activeModal === 'delete' && (
        <div className="ag-modal-overlay" onClick={closeModal}>
          <div className="ag-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="ag-modal-header">
              <h3 className="ag-modal-title" style={{ color: '#b91c1c' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Delete {count} Selected Photo{count !== 1 ? 's' : ''}?
              </h3>
              <button type="button" className="ag-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="ag-modal-body">
              <p style={{ margin: 0, fontSize: 13.5, color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete these <strong>{count}</strong> photos? This action cannot be undone.
              </p>
            </div>

            <div className="ag-modal-footer">
              <button type="button" className="ag-btn-cancel" onClick={closeModal} disabled={loading}>
                Cancel
              </button>
              <button
                type="button"
                className="ag-banner-action-btn danger"
                style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8 }}
                onClick={handleExecuteDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : `Delete ${count} Photos`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
