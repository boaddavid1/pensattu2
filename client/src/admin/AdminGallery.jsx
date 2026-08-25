import { useEffect, useState } from 'react';
import { adminApi } from './adminApi';
import { uploadImageToCloudinary } from '../cloudinaryUpload';

export default function AdminGallery() {
  const [albums, setAlbums] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoForm, setPhotoForm] = useState({ src: '', alt: '', category: '', caption: '', album_id: '' });
  const [albumForm, setAlbumForm] = useState({ name: '', description: '', cover_image: '' });
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [expandedAlbum, setExpandedAlbum] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [albumsData, photosData] = await Promise.all([
        adminApi.list('gallery_albums'),
        adminApi.listPhotos(),
      ]);
      setAlbums(albumsData);
      setAllPhotos(photosData);
      if (albumsData.length) setExpandedAlbum(albumsData[0].id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function photosForAlbum(albumId) {
    return allPhotos.filter((p) => p.album_id === albumId);
  }

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
      setExpandedAlbum(newAlbum.id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addPhoto(e) {
    e.preventDefault();
    try {
      await adminApi.addPhoto({ ...photoForm, album_id: photoForm.album_id });
      setPhotoForm({ src: '', alt: '', category: '', caption: '', album_id: photoForm.album_id });
      const list = await adminApi.listPhotos();
      setAllPhotos(list);
    } catch (err) {
      setError(err.message);
    }
  }

  async function removePhoto(id) {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await adminApi.removePhoto(id);
      const list = await adminApi.listPhotos();
      setAllPhotos(list);
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleAlbum(albumId) {
    setExpandedAlbum((prev) => (prev === albumId ? null : albumId));
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

      <form className="admin-form admin-card" onSubmit={addPhoto}>
        <h3>Add photo to album</h3>
        <div className="admin-form-grid">
          <label>
            Album
            <select
              value={photoForm.album_id}
              onChange={(e) => setPhotoForm({ ...photoForm, album_id: Number(e.target.value) })}
              required
            >
              <option value="">Select album</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>{album.name}</option>
              ))}
            </select>
          </label>
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
          <button type="submit" className="btn btn-primary" disabled={!photoForm.src || !photoForm.album_id || uploading}>
            Add Photo
          </button>
        </div>
      </form>

      <div className="admin-gallery-albums">
        {albums.map((album) => {
          const photos = photosForAlbum(album.id);
          const isOpen = expandedAlbum === album.id;
          return (
            <div key={album.id} className="admin-gallery-album-section">
              <button
                type="button"
                className="admin-gallery-album-header"
                onClick={() => toggleAlbum(album.id)}
              >
                <div className="admin-gallery-album-cover">
                  {album.cover_image ? (
                    <img src={album.cover_image} alt={album.name} />
                  ) : (
                    <span className="admin-gallery-album-placeholder">{album.name[0]}</span>
                  )}
                  <div className="admin-gallery-album-overlay">
                    <h3>{album.name}</h3>
                    <span>{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <span className="admin-gallery-album-toggle">{isOpen ? '▲ Collapse' : '▼ Expand'}</span>
              </button>
              {isOpen && (
                <div className="admin-gallery-album-body">
                  {photos.length === 0 ? (
                    <p className="admin-empty">No photos in this album yet.</p>
                  ) : (
                    <div className="admin-gallery-grid">
                      {photos.map((photo) => (
                        <div key={photo.id} className="admin-gallery-card">
                          <img src={photo.image_url} alt={photo.title || ''} />
                          <div className="admin-gallery-meta">
                            <strong>{photo.title || 'Untitled'}</strong>
                            <button className="admin-delete" onClick={() => removePhoto(photo.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
