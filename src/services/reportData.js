import axios from 'axios';

// CoinGecko API for crypto data
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
// OpenWeatherMap API for weather data
const WEATHER_API = 'https://api.openweathermap.org/data/2.5';
// Twitter API v2
const TWITTER_API = 'https://api.twitter.com/2';

export const fetchCryptoData = async (coinId, days = 1200) => {
  try {
    const response = await axios.get(
      `${COINGECKO_API}/coins/${coinId}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: 'daily',
        },
      }
    );

    // Transform data into a more usable format
    const prices = response.data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toISOString().split('T')[0],
      price: price,
    }));

    const volumes = response.data.total_volumes.map(([timestamp, volume]) => ({
      date: new Date(timestamp).toISOString().split('T')[0],
      volume: volume,
    }));

    return {
      prices,
      volumes,
    };
  } catch (error) {
    console.error('Failed to fetch crypto data:', error);
    throw error;
  }
};

export const fetchWeatherData = async (city, apiKey) => {
  try {
    const response = await axios.get(`${WEATHER_API}/forecast`, {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric',
      },
    });

    // Transform 5-day forecast data
    const forecasts = response.data.list.map(item => ({
      date: new Date(item.dt * 1000).toISOString().split('T')[0],
      temperature: item.main.temp,
      humidity: item.main.humidity,
      description: item.weather[0].description,
      windSpeed: item.wind.speed,
    }));

    return forecasts;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    throw error;
  }
};

export const fetchSocialMediaStats = async (username, bearerToken) => {
  try {
    // Get user metrics
    const userResponse = await axios.get(
      `${TWITTER_API}/users/by/username/${username}`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        params: {
          'user.fields': 'public_metrics',
        },
      }
    );

    // Get recent tweets metrics
    const tweetsResponse = await axios.get(
      `${TWITTER_API}/users/${userResponse.data.data.id}/tweets`,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        params: {
          max_results: 100,
          'tweet.fields': 'public_metrics,created_at',
        },
      }
    );

    const userData = userResponse.data.data;
    const tweets = tweetsResponse.data.data;

    // Calculate engagement metrics
    const engagementMetrics = tweets.reduce(
      (acc, tweet) => {
        acc.totalLikes += tweet.public_metrics.like_count;
        acc.totalRetweets += tweet.public_metrics.retweet_count;
        acc.totalReplies += tweet.public_metrics.reply_count;
        return acc;
      },
      { totalLikes: 0, totalRetweets: 0, totalReplies: 0 }
    );

    return {
      followers: userData.public_metrics.followers_count,
      following: userData.public_metrics.following_count,
      totalTweets: userData.public_metrics.tweet_count,
      engagement: engagementMetrics,
      recentTweets: tweets.map(tweet => ({
        date: new Date(tweet.created_at).toISOString().split('T')[0],
        likes: tweet.public_metrics.like_count,
        retweets: tweet.public_metrics.retweet_count,
        replies: tweet.public_metrics.reply_count,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch social media stats:', error);
    throw error;
  }
};

// Mock data for development (when APIs are not available)
export const getMockData = (type, dateRange) => {
  const generateDatePoints = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= new Date(endDate)) {
      dates.push(new Date(currentDate).toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const dates = generateDatePoints(dateRange[0], dateRange[1]);

  switch (type) {
    case 'crypto':
      return {
        prices: dates.map(date => ({
          date,
          price: 20000 + Math.random() * 10000,
        })),
        volumes: dates.map(date => ({
          date,
          volume: 1000000 + Math.random() * 500000,
        })),
      };

    case 'weather':
      return dates.map(date => ({
        date,
        temperature: 15 + Math.random() * 10,
        humidity: 40 + Math.random() * 40,
        description: 'Partly cloudy',
        windSpeed: 5 + Math.random() * 10,
      }));

    case 'social':
      return {
        followers: 10000 + Math.floor(Math.random() * 5000),
        following: 1000 + Math.floor(Math.random() * 500),
        totalTweets: 5000 + Math.floor(Math.random() * 1000),
        engagement: {
          totalLikes: 50000 + Math.floor(Math.random() * 10000),
          totalRetweets: 10000 + Math.floor(Math.random() * 2000),
          totalReplies: 5000 + Math.floor(Math.random() * 1000),
        },
        recentTweets: dates.map(date => ({
          date,
          likes: Math.floor(Math.random() * 100),
          retweets: Math.floor(Math.random() * 20),
          replies: Math.floor(Math.random() * 10),
        })),
      };

    default:
      return null;
  }
};
