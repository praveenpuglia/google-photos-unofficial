const API_URL = 'http://localhost:3001';

// Authentication API calls
export const authApi = {
  // Get Google auth URL
  getAuthUrl: async (): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/auth/google`);
      const data = await response.json();
      return data.authUrl;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      throw error;
    }
  },

  // Check authentication status
  checkAuthStatus: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      return data.isAuthenticated;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }
};

// Photos API calls
export const photosApi = {
  // Get all photos
  getPhotos: async () => {
    try {
      const response = await fetch(`${API_URL}/photos`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  },

  // Get a single photo by ID
  getPhoto: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/photos/${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching photo ${id}:`, error);
      throw error;
    }
  }
}; 