import { useState, useEffect, useRef, useCallback } from "react";
import { photosApi, authApi } from "../services/api";
import { FixedSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Video from "yet-another-react-lightbox/plugins/video";
import type { Slide } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "../styles/PhotosPage.css";

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

// Cell renderer for the grid
interface CellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
}

const PhotosPage = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(
    undefined
  );
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  // Grid configuration
  const [columnCount, setColumnCount] = useState(5);
  const CELL_HEIGHT = 200;
  const GRID_GAP = 8;

  // Update column count based on window width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width > 1600) setColumnCount(8);
      else if (width > 1200) setColumnCount(6);
      else if (width > 900) setColumnCount(5);
      else if (width > 600) setColumnCount(4);
      else if (width > 480) setColumnCount(3);
      else setColumnCount(2);
    };

    handleResize(); // Initial call
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate row count based on photos length and column count
  const rowCount = Math.ceil(photos.length / columnCount);

  // Infinite loading
  const gridRef = useRef<Grid>(null);
  const loadMoreItemsRef = useRef<boolean>(false);

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

  const loadMorePhotos = useCallback(async () => {
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
  }, [nextPageToken, loadingMore, setPhotos, setNextPageToken, setHasMore, setLoadingMore]);
  
  const loadMoreItems = useCallback(() => {
    if (!loadingMore && hasMore && !loadMoreItemsRef.current) {
      loadMoreItemsRef.current = true;
      loadMorePhotos().finally(() => {
        loadMoreItemsRef.current = false;
      });
    }
  }, [loadingMore, hasMore, loadMorePhotos]);
  
  const onItemsRendered = useCallback(({ visibleRowStopIndex }: { visibleRowStopIndex: number }) => {
    // If we're close to the end of the list, load more items
    if (visibleRowStopIndex >= rowCount - 2) {
      loadMoreItems();
    }
  }, [rowCount, loadMoreItems]);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const isVideo = (photo: Photo): boolean => {
    return (
      photo.mimeType.startsWith("video/") || photo.mimeType.includes("mp4")
    );
  };

  // Cell renderer for the grid
  const Cell = ({ columnIndex, rowIndex, style }: CellProps) => {
    const index = rowIndex * columnCount + columnIndex;
    
    // Return empty cell if index is out of bounds
    if (index >= photos.length) {
      return <div style={style} />;
    }
    
    const photo = photos[index];
    const imageUrl = `${photo.baseUrl}=w400-h400`;
    const isVideoItem = isVideo(photo);
    
    // Adjust style to account for grid gap
    const cellStyle = {
      ...style,
      left: Number(style.left) + GRID_GAP,
      top: Number(style.top) + GRID_GAP,
      width: Number(style.width) - GRID_GAP,
      height: Number(style.height) - GRID_GAP,
    };
    
    return (
      <div
        style={cellStyle}
        className={`photo-card ${isVideoItem ? "video-item" : ""}`}
        onClick={() => openLightbox(index)}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <img 
            src={imageUrl} 
            alt={photo.filename} 
            loading="lazy"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              backgroundColor: '#f5f5f5'
            }}
          />
          {isVideoItem && (
            <div className="video-indicator">
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  };

  const slides: Slide[] = photos.map((photo) => {
    if (isVideo(photo)) {
      // Handle video
      return {
        type: "video",
        width: photo.mediaMetadata?.width
          ? parseInt(photo.mediaMetadata.width)
          : undefined,
        height: photo.mediaMetadata?.height
          ? parseInt(photo.mediaMetadata.height)
          : undefined,
        poster: `${photo.baseUrl}=w1920-h1080`,
        title: photo.filename,
        description: photo.mediaMetadata?.creationTime
          ? `Taken on ${formatDate(photo.mediaMetadata.creationTime)}`
          : undefined,
        sources: [
          {
            src: `${photo.baseUrl}=dv`,
            type: photo.mimeType,
          },
        ],
        alt: photo.filename,
      };
    } else {
      // Handle image
      return {
        type: "image",
        src: `${photo.baseUrl}=d`,
        alt: photo.filename,
        width: photo.mediaMetadata?.width
          ? parseInt(photo.mediaMetadata.width)
          : undefined,
        height: photo.mediaMetadata?.height
          ? parseInt(photo.mediaMetadata.height)
          : undefined,
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
          <div className="virtualized-grid-container">
            <AutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <Grid
                  ref={gridRef}
                  columnCount={columnCount}
                  columnWidth={width / columnCount}
                  height={height}
                  rowCount={rowCount}
                  rowHeight={CELL_HEIGHT}
                  width={width}
                  onItemsRendered={onItemsRendered}
                  itemData={photos}
                >
                  {Cell}
                </Grid>
              )}
            </AutoSizer>
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
