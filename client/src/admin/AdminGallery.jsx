import { useEffect, useState } from 'react';
import { adminApi } from './adminApi';

export default function AdminGallery() {
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoForm, setPhotoForm] = useState({ src: '', alt: '', category: '', caption: '' });

  useEffect(() => {
    loadAlbums();
  }, []);

  async function loadAlbums() {
    setLoading(true);
    try {
      const data = await adminApi.list('gallery_albums');
      setAlbums(data);
      if (data.length && !selectedAlbum) setSelectedAlbum(data[0].id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedAlbum) return;
    adminApi.listPhotos(selectedAlbum).then(setPhotos).catch(() => setPhotos([]));
  }, [selectedAlbum]);

  async function addPhoto(e) {
    e.preventDefault();
    try {
      await adminApi.addPhoto({ ...photoForm, album_id: selectedAlbum });
      setPhotoForm({ src: '', alt: '', category: '', caption: '' });
      const list = await adminApi.listPhotos(selectedAlbum);
      setPhotos(list);
    } catch (err) {
      setError(err.message);
    }
  }

  async function removePhoto(id) {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await adminApi.removePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <h2>Gallery</h2>
      </div>
      {error && <div className="admin-error">{error}</div>}
      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
        <>
          <div className="admin-card">
            <label className="admin-inline-label">
              Album
              <select value={selectedAlbum || ''} onChange={(e) => setSelectedAlbum(Number(e.target.value))}>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>{album.title}</option>
                ))}
              </select>
            </label>
          </div>
          {selectedAlbum && (
            <form className="admin-form admin-card" onSubmit={addPhoto}>
              <h3>Add photo to album</h3>
              <div className="admin-form-grid">
                <label>
                  Image URL
                  <input type="text" value={photoForm.src} onChange={(e) => setPhotoForm({ ...photoForm, src: e.target.value })} required />
                </label>
                <label>
                  Alt text
                  <input type="text" value={photoForm.alt} onChange={(e) => setPhotoForm({ ...photoForm, alt: e.target.value })} />
                </label>
                <label>
                  Category
                  <input type="text" value={photoForm.category} onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })} />
                </label>
                <label>
                  Caption
                  <input type="text" value={photoForm.caption} onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })} />
                </label>
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="btn btn-primary">Add Photo</button>
              </div>
            </form>
          )}
          <div className="admin-gallery-grid">
            {photos.map((photo) => (
              <div key={photo.id} className="admin-gallery-card">
                <img src={photo.src} alt={photo.alt || ''} />
                <div className="admin-gallery-meta">
                  <strong>{photo.caption || 'Untitled'}</strong>
                  <button className="admin-delete" onClick={() => removePhoto(photo.id)}>Delete</button>
                </div>
              </div>
            ))}
            {photos.length === 0 && <p className="admin-empty">No photos in this album yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}
