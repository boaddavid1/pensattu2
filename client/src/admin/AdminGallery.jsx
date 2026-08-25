import { useEffect, useState } from 'react';
import { adminApi } from './adminApi';
import { uploadImageToCloudinary } from '../cloudinaryUpload';

export default function AdminGallery() {
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoForm, setPhotoForm] = useState({ src: '', alt: '', category: '', caption: '' });
  const [albumForm, setAlbumForm] = useState({ name: '', description: '', cover_image: '' });
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

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

  async function handlePhotoFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file, 'pensattu/gallery');
      setPhotoForm((prev) => ({ ...prev, src: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleCoverFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadImageToCloudinary(file, 'pensattu/gallery');
      setAlbumForm((prev) => ({ ...prev, cover_image: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setCoverUploading(false);
    }
  }

  async function addAlbum(e) {
    e.preventDefault();
    try {
      const newAlbum = await adminApi.create('gallery_albums', {
        name: albumForm.name,
        description: albumForm.description,
        cover_image: albumForm.cover_image,
      });
      setAlbumForm({ name: '', description: '', cover_image: '' });
      setSelectedAlbum(newAlbum.id);
      await loadAlbums();
    } catch (err) {
      setError(err.message);
    }
  }

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

  if (loading) {
    return (
      <div>
        <div className="admin-page-header"><h2>Gallery</h2></div>
        <div className="admin-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h2>Gallery</h2>
      </div>
      {error && <div className="admin-error">{error}</div>}

      <form className="admin-form admin-card" onSubmit={addAlbum}>
        <h3>Create new album</h3>
        <div className="admin-form-grid">
          <label>
            Album name
            <input
              type="text"
              value={albumForm.name}
              onChange={(e) => setAlbumForm({ ...albumForm, name: e.target.value })}
              required
            />
          </label>
          <label>
            Description
            <input
              type="text"
              value={albumForm.description}
              onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
            />
          </label>
          <label>
            Cover image
            <input type="file" accept="image/*" onChange={handleCoverFileChange} disabled={coverUploading} />
            {coverUploading && <span>Uploading...</span>}
            {albumForm.cover_image && (
              <img src={albumForm.cover_image} alt="Cover preview" className="admin-cover-preview" />
            )}
          </label>
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={!albumForm.name || coverUploading}>
            Create album
          </button>
        </div>
      </form>

      <div className="admin-card">
        <label className="admin-inline-label">
          Album
          <select value={selectedAlbum || ''} onChange={(e) => setSelectedAlbum(Number(e.target.value))}>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>{album.name}</option>
            ))}
          </select>
        </label>
      </div>

      {selectedAlbum && (
        <form className="admin-form admin-card" onSubmit={addPhoto}>
          <h3>Add photo to album</h3>
          <div className="admin-form-grid">
            <label>
              Image
              <input type="file" accept="image/*" onChange={handlePhotoFileChange} disabled={uploading} required />
              {uploading && <span>Uploading...</span>}
              {photoForm.src && (
                <img src={photoForm.src} alt="Preview" className="admin-photo-preview" />
              )}
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
            <button type="submit" className="btn btn-primary" disabled={!photoForm.src || uploading}>
              Add Photo
            </button>
          </div>
        </form>
      )}

      <div className="admin-gallery-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="admin-gallery-card">
            <img src={photo.image_url || photo.src} alt={photo.title || photo.alt || ''} />
            <div className="admin-gallery-meta">
              <strong>{photo.title || photo.caption || 'Untitled'}</strong>
              <button className="admin-delete" onClick={() => removePhoto(photo.id)}>Delete</button>
            </div>
          </div>
        ))}
        {photos.length === 0 && <p className="admin-empty">No photos in this album yet.</p>}
      </div>
    </div>
  );
}
