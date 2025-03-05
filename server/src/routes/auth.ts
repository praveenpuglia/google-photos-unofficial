import express from 'express';
import { oauth2Client, getAuthUrl, createOAuth2Client } from '../config/google';
import User, { GoogleTokens } from '../models/User';
import { google } from 'googleapis';

const router = express.Router();

// Declare session with user property
declare module 'express-session' {
  interface SessionData {
    userId: string;
    tokens?: GoogleTokens; // Fallback for when MongoDB is not available
    userProfile?: {
      googleId: string;
      email: string;
      name: string;
      profilePicture?: string;
    };
  }
}

// Initiate Google OAuth login
router.get('/google', (req, res) => {
  const authUrl = getAuthUrl();
  res.json({ authUrl });
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid authorization code' });
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Get user info from Google
    const oauth2 = createOAuth2Client();
    oauth2.setCredentials(tokens);
    
    const people = google.people({ version: 'v1', auth: oauth2 });
    const userInfo = await people.people.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses,photos'
    });
    
    // Extract user data
    const googleId = userInfo.data.resourceName?.replace('people/', '') || '';
    const email = userInfo.data.emailAddresses?.[0]?.value || '';
    const name = userInfo.data.names?.[0]?.displayName || '';
    const profilePicture = userInfo.data.photos?.[0]?.url || '';
    
    if (!googleId || !email || !name) {
      return res.status(400).json({ error: 'Failed to get user information from Google' });
    }
    
    // Format tokens for storage
    const googleTokens: GoogleTokens = {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token ?? undefined,
      scope: tokens.scope!,
      token_type: tokens.token_type!,
      expiry_date: tokens.expiry_date!
    };
    
    try {
      // Find or create user
      let user = await User.findOne({ googleId });
      
      if (user) {
        // Update existing user
        user.email = email;
        user.name = name;
        user.profilePicture = profilePicture;
        user.tokens = googleTokens;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          googleId,
          email,
          name,
          profilePicture,
          tokens: googleTokens
        });
      }
      
      // Store user ID in session
      req.session.userId = (user as any)._id.toString();
    } catch (dbError) {
      console.error('Database error, using session fallback:', dbError);
      // Fallback: store tokens and user profile in session if database fails
      req.session.tokens = googleTokens;
      req.session.userProfile = {
        googleId,
        email,
        name,
        profilePicture
      };
    }
    
    // Redirect to client with success
    res.redirect(`${process.env.CLIENT_URL}/auth-success`);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

// Check if user is authenticated
router.get('/status', (req, res) => {
  const isAuthenticated = !!req.session.userId || !!req.session.tokens;
  
  res.json({ isAuthenticated });
});

// Get current user info
router.get('/user', async (req, res) => {
  if (!req.session.userId && !req.session.userProfile) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    // Try to get user from database first
    if (req.session.userId) {
      try {
        const user = await User.findById(req.session.userId);
        
        if (user) {
          return res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture
          });
        }
      } catch (dbError) {
        console.error('Database error when fetching user:', dbError);
        // Fall through to session fallback
      }
    }
    
    // Fallback to session data if database fails or user not found
    if (req.session.userProfile) {
      return res.json({
        id: req.session.userProfile.googleId,
        name: req.session.userProfile.name,
        email: req.session.userProfile.email,
        profilePicture: req.session.userProfile.profilePicture
      });
    }
    
    // If we get here, something went wrong
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'User not found' });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    
    res.json({ success: true });
  });
});

export default router; 