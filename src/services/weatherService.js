const axios = require('axios');

// API configuration
const API_KEY = '4d8fb5b93d4af21d66a2948710284366'; // Free OpenWeather API key
const BASE_URL = 'https://api.openweathermap.org';

// Create axios instance with common configuration
const weatherApi = axios.create({
    baseURL: BASE_URL,
    params: {
        appid: API_KEY
    }
});

// Add response interceptor for error handling
weatherApi.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // Handle specific API errors
            switch (error.response.status) {
                case 401:
                    throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
                case 404:
                    throw new Error('Location not found.');
                case 429:
                    throw new Error('API rate limit exceeded. Please try again later.');
                default:
                    throw new Error('An error occurred while fetching weather data.');
            }
        }
        throw new Error('Network error. Please check your internet connection.');
    }
);

const weatherService = {
    searchCities: async (query) => {
        try {
            const response = await weatherApi.get('/geo/1.0/direct', {
                params: {
                    q: query,
                    limit: 5
                }
            });

            return response.data.map(city => ({
                label: `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`,
                lat: city.lat,
                lon: city.lon,
                name: city.name,
                country: city.country
            }));
        } catch (error) {
            console.error('Error searching cities:', error);
            throw error;
        }
    },

    getWeather: async (lat, lon) => {
        try {
            const cachedWeather = weatherService.getCachedWeather(`${lat},${lon}`);
            if (cachedWeather) {
                return cachedWeather;
            }

            const response = await weatherApi.get('/data/2.5/weather', {
                params: {
                    lat,
                    lon,
                    units: 'metric'
                }
            });
            
            // Cache the response
            weatherService.setCachedWeather(`${lat},${lon}`, response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching weather:', error);
            throw error;
        }
    },

    // Cache management
    clearCache: () => {
        localStorage.removeItem('weatherCache');
    },

    getCachedWeather: (cityKey) => {
        try {
            const cache = JSON.parse(localStorage.getItem('weatherCache') || '{}');
            const cachedData = cache[cityKey];
            
            if (!cachedData) return null;

            // Check if cache is still valid (less than 10 minutes old)
            const now = new Date().getTime();
            if (now - cachedData.timestamp > 600000) {
                // Remove expired cache
                delete cache[cityKey];
                localStorage.setItem('weatherCache', JSON.stringify(cache));
                return null;
            }

            return cachedData.data;
        } catch {
            return null;
        }
    },

    setCachedWeather: (cityKey, data) => {
        try {
            const cache = JSON.parse(localStorage.getItem('weatherCache') || '{}');
            
            // Remove old entries if cache is too large (keep last 10 cities)
            const cities = Object.keys(cache);
            if (cities.length > 10) {
                const oldestCity = cities.sort((a, b) => cache[a].timestamp - cache[b].timestamp)[0];
                delete cache[oldestCity];
            }

            cache[cityKey] = {
                data,
                timestamp: new Date().getTime()
            };
            localStorage.setItem('weatherCache', JSON.stringify(cache));
        } catch (error) {
            console.error('Error caching weather data:', error);
        }
    }
};

module.exports = weatherService;
