import { google } from 'googleapis';
import dotenv from 'dotenv';
import User, { GoogleTokens } from '../models/User';

dotenv.config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  throw new Error('Missing required Google OAuth environment variables');
}

// Create OAuth2 client
export const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
};

// Default OAuth2 client for routes that don't have user context
export const oauth2Client = createOAuth2Client();

// Define scopes needed for Google Photos API
export const SCOPES = [
  'https://www.googleapis.com/auth/photoslibrary.readonly',
  'profile',
  'email'
];

// Generate authentication URL
export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force to get refresh token
  });
};

// Check if token is expired
export const isTokenExpired = (expiry_date: number): boolean => {
  return expiry_date <= Date.now();
};

// Refresh access token if expired
export const refreshAccessToken = async (userId: string, tokens: GoogleTokens): Promise<GoogleTokens> => {
  try {
    // If token is not expired, return the existing tokens
    if (!isTokenExpired(tokens.expiry_date)) {
      return tokens;
    }

    // If no refresh token, we can't refresh
    if (!tokens.refresh_token) {
      throw new Error('No refresh token available');
    }

    // Create a new OAuth2 client
    const oauth2 = createOAuth2Client();
    
    // Set the refresh token
    oauth2.setCredentials({
      refresh_token: tokens.refresh_token
    });

    // Refresh the token
    const { credentials } = await oauth2.refreshAccessToken();
    
    // Update tokens in database
    const updatedTokens: GoogleTokens = {
      access_token: credentials.access_token!,
      refresh_token: credentials.refresh_token || tokens.refresh_token,
      scope: credentials.scope!,
      token_type: credentials.token_type!,
      expiry_date: credentials.expiry_date!
    };

    try {
      // Update user in database
      await User.findByIdAndUpdate(userId, { tokens: updatedTokens });
    } catch (dbError) {
      console.error('Database error when updating tokens:', dbError);
      // Continue even if database update fails
    }

    return updatedTokens;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

// Get access token for a user, refreshing if necessary
export const getUserAccessToken = async (userId: string): Promise<string | null> => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return null;
    }

    // Refresh token if expired
    const tokens = await refreshAccessToken(userId, user.tokens);
    
    return tokens.access_token;
  } catch (error) {
    console.error('Error getting user access token:', error);
    return null;
  }
}; 