import { SOCIAL_MEDIA_CONFIG } from '../config/socialMedia';

// Twitch OAuth scopes needed for the widget
const TWITCH_SCOPES = [
  'channel:read:subscriptions',
  'channel:read:stream_key',
  'channel:read:goals',
  'channel:read:polls',
  'channel:read:predictions',
  'channel:read:redemptions',
  'analytics:read:games',
  'analytics:read:extensions',
  'user:read:email',
  'user:read:broadcast',
].join(' ');

// Generate OAuth URL
export const getTwitchAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: SOCIAL_MEDIA_CONFIG.TWITCH.CLIENT_ID,
    redirect_uri: SOCIAL_MEDIA_CONFIG.TWITCH.REDIRECT_URI,
    response_type: 'code',
    scope: TWITCH_SCOPES,
    force_verify: 'true',
  });

  return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
};

// Exchange code for access token
export const exchangeCodeForToken = async (code) => {
  const params = new URLSearchParams({
    client_id: SOCIAL_MEDIA_CONFIG.TWITCH.CLIENT_ID,
    client_secret: SOCIAL_MEDIA_CONFIG.TWITCH.CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: SOCIAL_MEDIA_CONFIG.TWITCH.REDIRECT_URI,
  });

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to exchange code: ${error.message}`);
    }

    return response.json();
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
};

// Refresh access token
export const refreshTwitchToken = async (refreshToken) => {
  const params = new URLSearchParams({
    client_id: SOCIAL_MEDIA_CONFIG.TWITCH.CLIENT_ID,
    client_secret: SOCIAL_MEDIA_CONFIG.TWITCH.CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to refresh token: ${error.message}`);
    }

    return response.json();
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

// Validate token
export const validateToken = async (accessToken) => {
  try {
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        'Authorization': `OAuth ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Token validation failed:', await response.text());
    }

    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Helper function to handle API responses
const handleTwitchResponse = async (response, endpoint) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Twitch API error (${endpoint}): ${error.message}`);
  }
  return response.json();
};

// Fetch channel metrics
export const fetchChannelMetrics = async (accessToken, userId) => {
  if (!accessToken || !userId) {
    throw new Error('Missing required parameters: accessToken and userId');
  }

  const endpoints = [
    `/channels?broadcaster_id=${userId}`,
    `/users/follows?to_id=${userId}`,
    `/streams?user_id=${userId}`,
    `/subscriptions?broadcaster_id=${userId}`,
    `/analytics/extensions?first=1`,
    `/channels/followers?broadcaster_id=${userId}`,
    `/goals?broadcaster_id=${userId}`,
    `/polls?broadcaster_id=${userId}`,
    `/predictions?broadcaster_id=${userId}`,
    `/channel_points/custom_rewards?broadcaster_id=${userId}`,
  ];

  const headers = {
    'Client-ID': SOCIAL_MEDIA_CONFIG.TWITCH.CLIENT_ID,
    'Authorization': `Bearer ${accessToken}`,
  };

  try {
    console.log('Fetching Twitch metrics with:', {
      userId,
      clientId: SOCIAL_MEDIA_CONFIG.TWITCH.CLIENT_ID,
      baseUrl: SOCIAL_MEDIA_CONFIG.TWITCH.API_BASE_URL,
    });

    const results = await Promise.allSettled(
      endpoints.map(endpoint =>
        fetch(`${SOCIAL_MEDIA_CONFIG.TWITCH.API_BASE_URL}${endpoint}`, { headers })
          .then(response => handleTwitchResponse(response, endpoint))
          .catch(error => {
            console.error(`Error fetching ${endpoint}:`, error);
            return null;
          })
      )
    );

    const [
      channelData,
      followsData,
      streamData,
      subscriptionData,
      analyticsData,
      followerData,
      goalsData,
      pollsData,
      predictionsData,
      rewardsData,
    ] = results.map(result => result.status === 'fulfilled' ? result.value : null);

    const metrics = {
      channel: channelData?.data[0],
      followers: followsData?.total || 0,
      currentStream: streamData?.data[0],
      subscriptions: subscriptionData?.total || 0,
      analytics: analyticsData?.data,
      recentFollowers: followerData?.data,
      activeGoals: goalsData?.data,
      recentPolls: pollsData?.data,
      activePredictions: predictionsData?.data,
      customRewards: rewardsData?.data,
    };

    console.log('Fetched Twitch metrics:', metrics);
    return metrics;
  } catch (error) {
    console.error('Error fetching Twitch metrics:', error);
    throw new Error(`Failed to fetch Twitch metrics: ${error.message}`);
  }
};

// Fetch historical data
export const fetchHistoricalData = async (accessToken, userId, days = 30) => {
  if (!accessToken || !userId) {
    throw new Error('Missing required parameters: accessToken and userId');
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    console.log('Fetching Twitch historical data:', {
      userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const response = await fetch(
      `${SOCIAL_MEDIA_CONFIG.TWITCH.API_BASE_URL}/analytics/games?` +
      `started_at=${startDate.toISOString()}&ended_at=${endDate.toISOString()}`,
      {
        headers: {
          'Client-ID': SOCIAL_MEDIA_CONFIG.TWITCH.CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch historical data: ${error.message}`);
    }

    const data = await response.json();
    console.log('Fetched historical data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};
