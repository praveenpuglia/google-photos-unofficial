import { useState, useEffect, useRef, useCallback } from 'react';
import { photosApi, authApi } from '../services/api';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Video from 'yet-another-react-lightbox/plugins/video';
import type { Slide } from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import '../styles/PhotosPage.css';

interface Photo {
  id: string;
  baseUrl: string;
  filename: string;
  mimeType: string;
  mediaMetadata?: {
    creationTime: string;
    width: string;
    height: string;
  };
}

interface PhotosResponse {
  mediaItems: Photo[];
  nextPageToken?: string;
}

const PhotosPage = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPhotoElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePhotos();
      }
    }, { threshold: 0.5 });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const fetchPhotos = async (pageToken?: string) => {
    try {
      setLoading(true);
      const response: PhotosResponse = await photosApi.getPhotos(pageToken, 100);
      
      if (response && response.mediaItems) {
        setPhotos(response.mediaItems);
        setNextPageToken(response.nextPageToken);
        setHasMore(!!response.nextPageToken);
      }
    } catch (err) {
      setError('Failed to load photos. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePhotos = async () => {
    if (!nextPageToken || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const response: PhotosResponse = await photosApi.getPhotos(nextPageToken, 100);
      
      if (response && response.mediaItems) {
        setPhotos(prev => [...prev, ...response.mediaItems]);
        setNextPageToken(response.nextPageToken);
        setHasMore(!!response.nextPageToken);
      }
    } catch (err) {
      console.error('Failed to load more photos:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const isVideo = (photo: Photo): boolean => {
    return photo.mimeType.startsWith('video/') || photo.mimeType.includes('mp4');
  };

  const slides: Slide[] = photos.map(photo => {
    if (isVideo(photo)) {
      // Handle video
      return {
        type: 'video',
        width: photo.mediaMetadata?.width ? parseInt(photo.mediaMetadata.width) : undefined,
        height: photo.mediaMetadata?.height ? parseInt(photo.mediaMetadata.height) : undefined,
        poster: `${photo.baseUrl}=w1920-h1080`,
        title: photo.filename,
        description: photo.mediaMetadata?.creationTime 
          ? `Taken on ${formatDate(photo.mediaMetadata.creationTime)}`
          : undefined,
        sources: [
          {
            src: `${photo.baseUrl}=dv`,
            type: photo.mimeType
          }
        ],
        alt: photo.filename,
      };
    } else {
      // Handle image
      return {
        type: 'image',
        src: `${photo.baseUrl}=d`,
        alt: photo.filename,
        width: photo.mediaMetadata?.width ? parseInt(photo.mediaMetadata.width) : undefined,
        height: photo.mediaMetadata?.height ? parseInt(photo.mediaMetadata.height) : undefined,
        title: photo.filename,
        description: photo.mediaMetadata?.creationTime 
          ? `Taken on ${formatDate(photo.mediaMetadata.creationTime)}`
          : undefined,
      };
    }
  });

  if (loading && photos.length === 0) {
    return <div className="loading-container">Loading your photos...</div>;
  }

  if (error && photos.length === 0) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="photos-container">
      <header className="photos-header">
        <h1>🌈 Photos (Unofficial)</h1>
        <div className="header-info">
          {/* {photos.length > 0 && (
            <span className="photo-count">{photos.length} photos</span>
          )} */}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      {photos.length === 0 ? (
        <div className="no-photos">
          <p>No photos found in your Google Photos library.</p>
        </div>
      ) : (
        <>
          <div className="photos-grid">
            {photos.map((photo, index) => {
              const isLastElement = index === photos.length - 1;
              const imageUrl = `${photo.baseUrl}=w800-h800-c`;
              const isVideoItem = isVideo(photo);

              return (
                <div
                  key={photo.id}
                  className={`photo-card ${isVideoItem ? "video-item" : ""}`}
                  ref={isLastElement ? lastPhotoElementRef : null}
                  onClick={() => openLightbox(index)}
                >
                  <img src={imageUrl} alt={photo.filename} loading="lazy" />
                  {isVideoItem && (
                    <div className="video-indicator">
                      <svg viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  {/* <div className="photo-info">
                    <p className="photo-name">{photo.filename}</p>
                    {photo.mediaMetadata && (
                      <p className="photo-date">{formatDate(photo.mediaMetadata.creationTime)}</p>
                    )}
                  </div> */}
                </div>
              );
            })}
          </div>

          {loadingMore && (
            <div className="loading-more">Loading more photos...</div>
          )}

          {!hasMore && photos.length > 0 && (
            <div className="no-more-photos">End of your photo collection</div>
          )}

          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            slides={slides}
            index={lightboxIndex}
            plugins={[Video, Zoom, Fullscreen, Thumbnails, Captions]}
            video={{
              autoPlay: true,
              controls: true,
              playsInline: true,
              loop: false,
            }}
            zoom={{
              maxZoomPixelRatio: 5,
              zoomInMultiplier: 2,
              doubleTapDelay: 300,
              doubleClickDelay: 300,
              keyboardMoveDistance: 50,
              wheelZoomDistanceFactor: 100,
              pinchZoomDistanceFactor: 100,
              scrollToZoom: true,
            }}
            carousel={{
              finite: false,
              preload: 3,
              padding: "16px",
              spacing: "30%",
            }}
            thumbnails={{
              position: "bottom",
              width: 120,
              height: 80,
              borderRadius: 4,
              padding: 4,
              gap: 10,
              showToggle: true,
              hidden: true,
            }}
            captions={{
              showToggle: true,
              descriptionTextAlign: "center",
              descriptionMaxLines: 3,
              hidden: true,
            }}
            animation={{
              swipe: 250,
              zoom: 500,
            }}
            controller={{
              closeOnBackdropClick: true,
              closeOnPullDown: true,
            }}
            render={{
              buttonPrev: photos.length <= 1 ? () => null : undefined,
              buttonNext: photos.length <= 1 ? () => null : undefined,
              iconLoading: () => (
                <div className="lightbox-loading">
                  <div className="spinner"></div>
                  <div>Loading full resolution image...</div>
                </div>
              ),
            }}
          />
        </>
      )}
    </div>
  );
};

export default PhotosPage; 