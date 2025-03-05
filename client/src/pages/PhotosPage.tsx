import { useState, useEffect } from 'react';
import { photosApi, authApi } from '../services/api';
import '../styles/PhotosPage.css';

interface Photo {
  id: string;
  baseUrl: string;
  filename: string;
  mimeType: string;
}

const PhotosPage = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const response = await photosApi.getPhotos();
        if (response && response.mediaItems) {
          setPhotos(response.mediaItems);
        }
      } catch (err) {
        setError('Failed to load photos. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading your photos...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="photos-container">
      <header className="photos-header">
        <h1>Your Google Photos</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      {photos.length === 0 ? (
        <div className="no-photos">
          <p>No photos found in your Google Photos library.</p>
        </div>
      ) : (
        <div className="photos-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <img 
                src={photo.baseUrl} 
                alt={photo.filename} 
                loading="lazy"
              />
              <div className="photo-info">
                <p>{photo.filename}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotosPage; 