// Social Media API Configuration
export const SOCIAL_MEDIA_CONFIG = {
  INSTAGRAM: {
    CLIENT_ID: process.env.REACT_APP_INSTAGRAM_CLIENT_ID,
    CLIENT_SECRET: process.env.REACT_APP_INSTAGRAM_CLIENT_SECRET,
    REDIRECT_URI: process.env.REACT_APP_INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/auth/instagram/callback',
    API_BASE_URL: 'https://graph.instagram.com/v12.0',
  },
  YOUTUBE: {
    API_KEY: process.env.REACT_APP_YOUTUBE_API_KEY,
    CLIENT_ID: process.env.REACT_APP_YOUTUBE_CLIENT_ID,
    CLIENT_SECRET: process.env.REACT_APP_YOUTUBE_CLIENT_SECRET,
    REDIRECT_URI: process.env.REACT_APP_YOUTUBE_REDIRECT_URI || 'http://localhost:3000/auth/youtube/callback',
    API_BASE_URL: 'https://www.googleapis.com/youtube/v3',
  },
  TIKTOK: {
    CLIENT_KEY: process.env.REACT_APP_TIKTOK_CLIENT_KEY,
    CLIENT_SECRET: process.env.REACT_APP_TIKTOK_CLIENT_SECRET,
    REDIRECT_URI: process.env.REACT_APP_TIKTOK_REDIRECT_URI || 'http://localhost:3000/auth/tiktok/callback',
    API_BASE_URL: 'https://open-api.tiktok.com/v2',
  },
  TWITCH: {
    CLIENT_ID: process.env.REACT_APP_TWITCH_CLIENT_ID,
    CLIENT_SECRET: process.env.REACT_APP_TWITCH_CLIENT_SECRET,
    REDIRECT_URI: process.env.REACT_APP_TWITCH_REDIRECT_URI || 'http://localhost:3000/auth/twitch/callback',
    API_BASE_URL: 'https://api.twitch.tv/helix',
  },
};

// Secure storage key for encrypted credentials
export const CREDENTIALS_STORAGE_KEY = 'encrypted_social_media_credentials';

// Helper function to securely store credentials
export const secureStore = (platform, credentials) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(CREDENTIALS_STORAGE_KEY) || '{}');
    existingData[platform] = btoa(JSON.stringify(credentials)); // Basic encryption, replace with more secure method in production
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(existingData));
    return true;
  } catch (error) {
    console.error('Error storing credentials:', error);
    return false;
  }
};

// Helper function to securely retrieve credentials
export const secureRetrieve = (platform) => {
  try {
    const data = JSON.parse(localStorage.getItem(CREDENTIALS_STORAGE_KEY) || '{}');
    return data[platform] ? JSON.parse(atob(data[platform])) : null;
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    return null;
  }
};
