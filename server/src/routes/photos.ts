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
    
    // For natural language search, we need to use the mediaItems:search endpoint
    const url = 'https://photoslibrary.googleapis.com/v1/mediaItems:search';
    
    // Map common search terms to content categories
    // See: https://developers.google.com/photos/library/reference/rest/v1/mediaItems/search#ContentCategory
    const contentCategories = [];
    const lowerQuery = query.toLowerCase();
    
    // Map natural language queries to Google's content categories
    if (
      lowerQuery.includes('landscape') || 
      lowerQuery.includes('scenery') || 
      lowerQuery.includes('outdoor') ||
      lowerQuery.includes('nature')
    ) {
      contentCategories.push('LANDSCAPES');
    }
    
    if (
      lowerQuery.includes('selfie') || 
      lowerQuery.includes('portrait') || 
      lowerQuery.includes('face') ||
      lowerQuery.includes('people') ||
      lowerQuery.includes('person')
    ) {
      contentCategories.push('SELFIES');
      contentCategories.push('PEOPLE');
    }
    
    if (
      lowerQuery.includes('city') || 
      lowerQuery.includes('building') || 
      lowerQuery.includes('architecture') ||
      lowerQuery.includes('skyline')
    ) {
      contentCategories.push('CITYSCAPES');
    }
    
    if (
      lowerQuery.includes('food') || 
      lowerQuery.includes('meal') || 
      lowerQuery.includes('dish') ||
      lowerQuery.includes('restaurant')
    ) {
      contentCategories.push('FOOD');
    }
    
    if (
      lowerQuery.includes('dog') || 
      lowerQuery.includes('cat') || 
      lowerQuery.includes('pet') ||
      lowerQuery.includes('animal')
    ) {
      contentCategories.push('PETS');
    }
    
    if (
      lowerQuery.includes('document') || 
      lowerQuery.includes('receipt') || 
      lowerQuery.includes('text') ||
      lowerQuery.includes('paper')
    ) {
      contentCategories.push('DOCUMENTS');
    }
    
    if (
      lowerQuery.includes('birthday') || 
      lowerQuery.includes('party') || 
      lowerQuery.includes('celebration') ||
      lowerQuery.includes('event')
    ) {
      contentCategories.push('BIRTHDAYS');
      contentCategories.push('WEDDINGS');
    }
    
    if (
      lowerQuery.includes('travel') || 
      lowerQuery.includes('vacation') || 
      lowerQuery.includes('trip')
    ) {
      contentCategories.push('TRAVEL');
    }
    
    if (
      lowerQuery.includes('flower') || 
      lowerQuery.includes('plant') || 
      lowerQuery.includes('garden')
    ) {
      contentCategories.push('FLOWERS');
    }
    
    // Prepare the request body
    const requestBody: any = {
      pageSize: Number(pageSize),
      pageToken: pageToken || undefined
    };
    
    // Add filters if we have content categories or a query
    if (contentCategories.length > 0) {
      requestBody.filters = {
        contentFilter: {
          includedContentCategories: contentCategories
        }
      };
      
      // Check if the query specifically mentions videos
      if (lowerQuery.includes('video')) {
        requestBody.filters.mediaTypeFilter = {
          mediaTypes: ['VIDEO']
        };
      } else {
        // Default to photos only to avoid the "Only one media type" error
        requestBody.filters.mediaTypeFilter = {
          mediaTypes: ['PHOTO']
        };
      }
    }
    
    console.log('Search request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Photos API error:', errorData);
      return res.status(response.status).json({ error: 'Failed to search photos' });
    }
    
    const data = await response.json();
    
    // If we didn't use content categories or didn't get results, fall back to filename search
    if ((contentCategories.length === 0 || !data.mediaItems || data.mediaItems.length === 0) && query && query.trim() !== '') {
      console.log('No results from content categories, falling back to filename search');
      
      // Fetch all photos and filter by filename
      const listUrl = 'https://photoslibrary.googleapis.com/v1/mediaItems';
      const listParams = new URLSearchParams();
      
      if (pageSize) {
        listParams.append('pageSize', pageSize.toString());
      }
      
      if (pageToken) {
        listParams.append('pageToken', pageToken);
      }
      
      const listResponse = await fetch(`${listUrl}?${listParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!listResponse.ok) {
        const errorData = await listResponse.json();
        console.error('Google Photos API error:', errorData);
        return res.status(listResponse.status).json({ error: 'Failed to search photos' });
      }
      
      const listData = await listResponse.json();
      
      if (listData.mediaItems) {
        // Simple case-insensitive search in filename
        const filteredItems = listData.mediaItems.filter((item: any) => 
          item.filename.toLowerCase().includes(query.toLowerCase())
        );
        
        return res.json({
          mediaItems: filteredItems,
          nextPageToken: listData.nextPageToken
        });
      }
    }
    
    // Return the original search results
    res.json(data);
  } catch (error) {
    console.error('Error searching photos:', error);
    res.status(500).json({ error: 'Failed to search photos' });
  }
});

export default router; 