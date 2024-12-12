import { encrypt, decrypt } from '../utils/encryption';

const API_KEYS_STORAGE_KEY = 'social_media_api_keys';

export const apiKeyService = {
    // Platform specific validation functions
    validators: {
        tiktok: (key) => /^[a-zA-Z0-9]{32}$/.test(key),
        instagram: (key) => /^IGQ[a-zA-Z0-9_-]{177}$/.test(key),
        youtube: (key) => /^[a-zA-Z0-9_-]{39}$/.test(key)
    },

    // Get all stored API keys
    getAllKeys: () => {
        try {
            const encryptedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
            if (!encryptedKeys) return {};
            return JSON.parse(decrypt(encryptedKeys));
        } catch (error) {
            console.error('Error getting API keys:', error);
            return {};
        }
    },

    // Get API key for specific platform
    getKey: (platform) => {
        const keys = apiKeyService.getAllKeys();
        return keys[platform] || null;
    },

    // Save API key for specific platform
    saveKey: (platform, key) => {
        try {
            // Validate the key format
            if (!apiKeyService.validators[platform]?.(key)) {
                throw new Error(`Invalid ${platform} API key format`);
            }

            const keys = apiKeyService.getAllKeys();
            keys[platform] = key;
            
            // Encrypt and store
            const encryptedKeys = encrypt(JSON.stringify(keys));
            localStorage.setItem(API_KEYS_STORAGE_KEY, encryptedKeys);
            
            return true;
        } catch (error) {
            console.error('Error saving API key:', error);
            throw error;
        }
    },

    // Remove API key for specific platform
    removeKey: (platform) => {
        try {
            const keys = apiKeyService.getAllKeys();
            delete keys[platform];
            
            // Encrypt and store
            const encryptedKeys = encrypt(JSON.stringify(keys));
            localStorage.setItem(API_KEYS_STORAGE_KEY, encryptedKeys);
            
            return true;
        } catch (error) {
            console.error('Error removing API key:', error);
            throw error;
        }
    },

    // Check if API key exists for platform
    hasKey: (platform) => {
        const keys = apiKeyService.getAllKeys();
        return !!keys[platform];
    },

    // Get instructions for obtaining API keys
    getApiKeyInstructions: (platform) => {
        const instructions = {
            tiktok: {
                title: 'How to get TikTok API Key',
                steps: [
                    'Go to TikTok for Developers (developers.tiktok.com)',
                    'Sign in or create a developer account',
                    'Create a new app in the Developer Portal',
                    'Complete the app registration process',
                    'Get your API key from the app dashboard'
                ],
                url: 'https://developers.tiktok.com/doc/login-kit-web'
            },
            instagram: {
                title: 'How to get Instagram API Key',
                steps: [
                    'Go to Meta for Developers (developers.facebook.com)',
                    'Create or log into your Meta developer account',
                    'Create a new app or select an existing one',
                    'Add Instagram Basic Display to your app',
                    'Complete the Instagram Basic Display setup',
                    'Generate a long-lived access token'
                ],
                url: 'https://developers.facebook.com/docs/instagram-basic-display-api/getting-started'
            },
            youtube: {
                title: 'How to get YouTube API Key',
                steps: [
                    'Go to Google Cloud Console (console.cloud.google.com)',
                    'Create a new project or select an existing one',
                    'Enable the YouTube Data API v3',
                    'Go to Credentials',
                    'Create an API key',
                    'Restrict the API key to YouTube Data API v3'
                ],
                url: 'https://developers.google.com/youtube/v3/getting-started'
            }
        };

        return instructions[platform] || null;
    }
};
