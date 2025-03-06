import express from 'express';
import fetch from 'node-fetch';
import { getUserAccessToken } from '../config/google';

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId && !req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Get access token (either from database or session)
const getAccessToken = async (req: express.Request): Promise<string | null> => {
  // Try to get token from database first
  if (req.session.userId) {
    try {
      const token = await getUserAccessToken(req.session.userId);
      if (token) return token;
    } catch (error) {
      console.error('Error getting token from database:', error);
      // Fall through to session fallback
    }
  }
  
  // Fallback to session tokens
  if (req.session.tokens) {
    return req.session.tokens.access_token;
  }
  
  return null;
};

// Get list of photos with pagination support
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Get the access token
    const accessToken = await getAccessToken(req);
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Get pagination parameters from query
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 25;
    const pageToken = req.query.pageToken as string | undefined;
    
    // Build URL with pagination parameters
    let url = `https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=${pageSize}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }
    
    // Fetch photos using the mediaItems.list endpoint
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Google Photos API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Get a single photo by ID
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = await getAccessToken(req);
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const response = await fetch(`https://photoslibrary.googleapis.com/v1/mediaItems/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Google Photos API error: ${response.statusText}`);
    }
    
    const photo = await response.json();
    res.json(photo);
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

// Search photos
router.post('/search', async (req, res) => {
  try {
    const { query, pageSize = 25, pageToken } = req.body;
    
    // Get access token
    const accessToken = await getAccessToken(req);
    if (!accessToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // For Google Photos, we need to use the list endpoint with filters
    // since the search endpoint doesn't support text search directly
    let url = 'https://photoslibrary.googleapis.com/v1/mediaItems';
    let params = new URLSearchParams();
    
    if (pageSize) {
      params.append('pageSize', pageSize.toString());
    }
    
    if (pageToken) {
      params.append('pageToken', pageToken);
    }
    
    // Add the parameters to the URL
    url = `${url}?${params.toString()}`;
    
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Photos API error:', errorData);
      return res.status(response.status).json({ error: 'Failed to search photos' });
    }
    
    const data = await response.json();
    
    // If there's a search query, filter the results on the server side
    if (query && query.trim() !== '' && data.mediaItems) {
      // Simple case-insensitive search in filename
      const filteredItems = data.mediaItems.filter((item: any) => 
        item.filename.toLowerCase().includes(query.toLowerCase())
      );
      
      return res.json({
        mediaItems: filteredItems,
        nextPageToken: data.nextPageToken
      });
    }
    
    // If no query or no results, return the original data
    res.json(data);
  } catch (error) {
    console.error('Error searching photos:', error);
    res.status(500).json({ error: 'Failed to search photos' });
  }
});

export default router; 