import axios from 'axios';
import { apiKeyService } from './apiKeyService';

// Base URLs for each platform
const BASE_URLS = {
    tiktok: 'https://open.tiktokapis.com/v2',
    instagram: 'https://graph.instagram.com/v12.0',
    youtube: 'https://www.googleapis.com/youtube/v3',
    shopify: 'https://shopify.com'
};

// Create API instances for each platform
const createApiInstance = (platform) => {
    const key = apiKeyService.getKey(platform);
    if (!key) {
        throw new Error(`No API key found for ${platform}. Please add your API key in settings.`);
    }

    const config = {
        baseURL: BASE_URLS[platform],
        headers: {}
    };

    // Platform-specific configurations
    switch (platform) {
        case 'tiktok':
            config.headers['Authorization'] = `Bearer ${key}`;
            break;
        case 'instagram':
            config.params = { access_token: key };
            break;
        case 'youtube':
            config.params = { key };
            break;
        case 'shopify':
            const { storeUrl, apiKey, accessToken } = apiKeyService.getShopifyCredentials();
            config.baseURL = `https://${storeUrl}/admin/api/2023-04`;
            config.headers['X-Shopify-Access-Token'] = accessToken;
            break;
    }

    return axios.create(config);
};

// YouTube API endpoints
const youtube = {
    getChannelStats: async () => {
        const apiKey = apiKeyService.getKey('youtube');
        if (!apiKey) throw new Error('YouTube API key is required');

        const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/channels`, {
                params: {
                    part: 'statistics,snippet,contentDetails,brandingSettings',
                    mine: true,
                    key: apiKey
                },
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        );

        return {
            ...response.data.items[0].statistics,
            snippet: response.data.items[0].snippet,
            contentDetails: response.data.items[0].contentDetails,
            branding: response.data.items[0].brandingSettings
        };
    },

    getTopVideos: async () => {
        const apiKey = apiKeyService.getKey('youtube');
        if (!apiKey) throw new Error('YouTube API key is required');

        const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/search`, {
                params: {
                    part: 'snippet',
                    forMine: true,
                    type: 'video',
                    order: 'viewCount',
                    maxResults: 5,
                    key: apiKey
                },
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        );

        return response.data.items;
    },

    getVideoStats: async (videoId) => {
        const apiKey = apiKeyService.getKey('youtube');
        if (!apiKey) throw new Error('YouTube API key is required');

        const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/videos`, {
                params: {
                    part: 'statistics,contentDetails,snippet',
                    id: videoId,
                    key: apiKey
                },
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        );

        return {
            ...response.data.items[0].statistics,
            contentDetails: response.data.items[0].contentDetails,
            snippet: response.data.items[0].snippet
        };
    },

    getAnalytics: async () => {
        const apiKey = apiKeyService.getKey('youtube');
        if (!apiKey) throw new Error('YouTube API key is required');

        // Get last 28 days of data
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const response = await axios.get(
            `https://youtubeanalytics.googleapis.com/v2/reports`, {
                params: {
                    dimensions: 'day',
                    metrics: [
                        'views',
                        'estimatedMinutesWatched',
                        'averageViewDuration',
                        'subscribersGained',
                        'subscribersLost',
                        'likes',
                        'comments',
                        'shares'
                    ].join(','),
                    startDate,
                    endDate,
                    key: apiKey
                },
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        );

        return {
            timeRange: { startDate, endDate },
            data: response.data.rows
        };
    }
};

// Instagram API endpoints
const instagram = {
    getProfileStats: async () => {
        const apiKey = apiKeyService.getKey('instagram');
        if (!apiKey) throw new Error('Instagram API key is required');

        const response = await axios.get(
            `https://graph.instagram.com/me`, {
                params: {
                    fields: [
                        'id',
                        'username',
                        'account_type',
                        'media_count',
                        'followers_count',
                        'follows_count'
                    ].join(','),
                    access_token: apiKey
                }
            }
        );

        return response.data;
    },

    getMediaInsights: async () => {
        const apiKey = apiKeyService.getKey('instagram');
        if (!apiKey) throw new Error('Instagram API key is required');

        // Get recent media
        const mediaResponse = await axios.get(
            `https://graph.instagram.com/me/media`, {
                params: {
                    fields: [
                        'id',
                        'caption',
                        'media_type',
                        'media_url',
                        'thumbnail_url',
                        'permalink',
                        'timestamp',
                        'like_count',
                        'comments_count',
                        'engagement',
                        'impressions',
                        'reach',
                        'saved',
                        'video_views'
                    ].join(','),
                    limit: 10,
                    access_token: apiKey
                }
            }
        );

        // Get insights for each media
        const mediaInsights = await Promise.all(
            mediaResponse.data.data.map(async (media) => {
                const insightsResponse = await axios.get(
                    `https://graph.instagram.com/${media.id}/insights`, {
                        params: {
                            metric: [
                                'engagement',
                                'impressions',
                                'reach',
                                'saved',
                                'video_views'
                            ].join(','),
                            access_token: apiKey
                        }
                    }
                );
                return {
                    ...media,
                    insights: insightsResponse.data.data
                };
            })
        );

        return mediaInsights;
    },

    getAccountInsights: async () => {
        const apiKey = apiKeyService.getKey('instagram');
        if (!apiKey) throw new Error('Instagram API key is required');

        // Get account insights for last 30 days
        const response = await axios.get(
            `https://graph.instagram.com/me/insights`, {
                params: {
                    metric: [
                        'audience_gender_age',
                        'audience_locale',
                        'audience_country',
                        'follower_demographics',
                        'impressions',
                        'reach',
                        'profile_views',
                        'website_clicks',
                        'email_contacts',
                        'get_directions_clicks'
                    ].join(','),
                    period: 'day',
                    access_token: apiKey
                }
            }
        );

        return {
            timeRange: { days: 30 },
            insights: response.data.data
        };
    },

    getStoryInsights: async () => {
        const apiKey = apiKeyService.getKey('instagram');
        if (!apiKey) throw new Error('Instagram API key is required');

        // Get recent stories
        const storiesResponse = await axios.get(
            `https://graph.instagram.com/me/stories`, {
                params: {
                    fields: [
                        'id',
                        'media_type',
                        'media_url',
                        'timestamp'
                    ].join(','),
                    access_token: apiKey
                }
            }
        );

        // Get insights for each story
        const storyInsights = await Promise.all(
            storiesResponse.data.data.map(async (story) => {
                const insightsResponse = await axios.get(
                    `https://graph.instagram.com/${story.id}/insights`, {
                        params: {
                            metric: [
                                'exits',
                                'impressions',
                                'reach',
                                'replies',
                                'taps_forward',
                                'taps_back'
                            ].join(','),
                            access_token: apiKey
                        }
                    }
                );
                return {
                    ...story,
                    insights: insightsResponse.data.data
                };
            })
        );

        return storyInsights;
    }
};

// TikTok API endpoints
const tiktok = {
    getProfileStats: async () => {
        const apiKey = apiKeyService.getKey('tiktok');
        if (!apiKey) throw new Error('TikTok API key is required');

        const response = await axios.get(
            `https://open.tiktokapis.com/v2/user/info/`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        return response.data.data;
    },

    getVideoList: async () => {
        const apiKey = apiKeyService.getKey('tiktok');
        if (!apiKey) throw new Error('TikTok API key is required');

        const response = await axios.get(
            `https://open.tiktokapis.com/v2/video/list/`, {
                params: {
                    fields: [
                        'id',
                        'create_time',
                        'cover_image_url',
                        'share_url',
                        'video_description',
                        'duration',
                        'height',
                        'width',
                        'title',
                        'embed_html',
                        'embed_link',
                        'like_count',
                        'comment_count',
                        'share_count',
                        'view_count'
                    ].join(','),
                    max_count: 20
                },
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        return response.data.data;
    },

    getVideoMetrics: async (videoId) => {
        const apiKey = apiKeyService.getKey('tiktok');
        if (!apiKey) throw new Error('TikTok API key is required');

        const response = await axios.get(
            `https://open.tiktokapis.com/v2/video/query/`, {
                params: {
                    fields: [
                        'like_count',
                        'comment_count',
                        'share_count',
                        'view_count',
                        'engagement_rate',
                        'average_watch_time',
                        'total_watch_time',
                        'video_retention_rate',
                        'reach',
                        'profile_visits',
                        'shares',
                        'unique_viewers',
                        'sound_shares'
                    ].join(','),
                    video_id: videoId
                },
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        return response.data.data;
    },

    getAccountAnalytics: async () => {
        const apiKey = apiKeyService.getKey('tiktok');
        if (!apiKey) throw new Error('TikTok API key is required');

        // Get last 28 days of data
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const response = await axios.get(
            `https://open.tiktokapis.com/v2/research/video/query/`, {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    metrics: [
                        'video_views',
                        'total_play_time',
                        'total_likes',
                        'total_comments',
                        'total_shares',
                        'profile_views',
                        'new_followers',
                        'lost_followers',
                        'engagement_rate',
                        'average_watch_time',
                        'completion_rate',
                        'reach',
                        'impressions'
                    ].join(',')
                },
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        return {
            timeRange: { startDate, endDate },
            data: response.data.data
        };
    },

    getFollowerAnalytics: async () => {
        const apiKey = apiKeyService.getKey('tiktok');
        if (!apiKey) throw new Error('TikTok API key is required');

        const response = await axios.get(
            `https://open.tiktokapis.com/v2/research/user/followers/`, {
                params: {
                    fields: [
                        'follower_active_days',
                        'follower_gender',
                        'follower_age',
                        'follower_device',
                        'follower_country',
                        'follower_province',
                        'follower_city',
                        'follower_language',
                        'follower_interests'
                    ].join(',')
                },
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            }
        );

        return response.data.data;
    }
};

// Shopify API endpoints
const shopify = {
    getStoreStats: async () => {
        const { storeUrl, apiKey, accessToken } = apiKeyService.getShopifyCredentials();
        if (!storeUrl || !apiKey || !accessToken) {
            throw new Error('Shopify credentials are required');
        }

        const api = axios.create({
            baseURL: `https://${storeUrl}/admin/api/2023-04`,
            headers: {
                'X-Shopify-Access-Token': accessToken
            }
        });

        // Get shop information
        const shopResponse = await api.get('/shop.json');
        const shop = shopResponse.data.shop;

        // Get order metrics
        const ordersResponse = await api.get('/orders/count.json');
        const orderCount = ordersResponse.data.count;

        // Get product metrics
        const productsResponse = await api.get('/products/count.json');
        const productCount = productsResponse.data.count;

        // Get customer metrics
        const customersResponse = await api.get('/customers/count.json');
        const customerCount = customersResponse.data.count;

        return {
            shop,
            metrics: {
                orderCount,
                productCount,
                customerCount
            }
        };
    },

    getRecentOrders: async (limit = 10) => {
        const { storeUrl, apiKey, accessToken } = apiKeyService.getShopifyCredentials();
        if (!storeUrl || !apiKey || !accessToken) {
            throw new Error('Shopify credentials are required');
        }

        const api = axios.create({
            baseURL: `https://${storeUrl}/admin/api/2023-04`,
            headers: {
                'X-Shopify-Access-Token': accessToken
            }
        });

        const response = await api.get('/orders.json', {
            params: {
                limit,
                status: 'any',
                fields: [
                    'id',
                    'order_number',
                    'created_at',
                    'total_price',
                    'currency',
                    'customer',
                    'line_items',
                    'fulfillment_status',
                    'financial_status',
                    'shipping_address'
                ].join(',')
            }
        });

        return response.data.orders;
    },

    getSalesAnalytics: async () => {
        const { storeUrl, apiKey, accessToken } = apiKeyService.getShopifyCredentials();
        if (!storeUrl || !apiKey || !accessToken) {
            throw new Error('Shopify credentials are required');
        }

        const api = axios.create({
            baseURL: `https://${storeUrl}/admin/api/2023-04`,
            headers: {
                'X-Shopify-Access-Token': accessToken
            }
        });

        // Get last 30 days of orders
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const response = await api.get('/orders.json', {
            params: {
                created_at_min: thirtyDaysAgo,
                status: 'any',
                fields: [
                    'id',
                    'created_at',
                    'total_price',
                    'currency',
                    'line_items',
                    'financial_status'
                ].join(',')
            }
        });

        const orders = response.data.orders;

        // Calculate metrics
        const metrics = orders.reduce((acc, order) => {
            const totalPrice = parseFloat(order.total_price);
            acc.totalSales += totalPrice;
            acc.orderCount++;
            acc.averageOrderValue = acc.totalSales / acc.orderCount;
            
            order.line_items.forEach(item => {
                acc.totalItems += item.quantity;
            });

            if (order.financial_status === 'paid') {
                acc.paidOrdersCount++;
            }

            return acc;
        }, {
            totalSales: 0,
            orderCount: 0,
            averageOrderValue: 0,
            totalItems: 0,
            paidOrdersCount: 0
        });

        return {
            timeRange: { days: 30 },
            metrics,
            orders
        };
    },

    getInventoryAnalytics: async () => {
        const { storeUrl, apiKey, accessToken } = apiKeyService.getShopifyCredentials();
        if (!storeUrl || !apiKey || !accessToken) {
            throw new Error('Shopify credentials are required');
        }

        const api = axios.create({
            baseURL: `https://${storeUrl}/admin/api/2023-04`,
            headers: {
                'X-Shopify-Access-Token': accessToken
            }
        });

        const response = await api.get('/products.json', {
            params: {
                fields: [
                    'id',
                    'title',
                    'variants',
                    'vendor',
                    'product_type',
                    'created_at',
                    'updated_at',
                    'published_at'
                ].join(',')
            }
        });

        const products = response.data.products;

        // Calculate inventory metrics
        const metrics = products.reduce((acc, product) => {
            acc.totalProducts++;
            
            product.variants.forEach(variant => {
                const inventory = parseInt(variant.inventory_quantity) || 0;
                acc.totalInventory += inventory;
                
                if (inventory === 0) {
                    acc.outOfStockCount++;
                } else if (inventory < 10) {
                    acc.lowStockCount++;
                }
            });

            return acc;
        }, {
            totalProducts: 0,
            totalInventory: 0,
            outOfStockCount: 0,
            lowStockCount: 0
        });

        return {
            metrics,
            products
        };
    },

    getCustomerAnalytics: async () => {
        const { storeUrl, apiKey, accessToken } = apiKeyService.getShopifyCredentials();
        if (!storeUrl || !apiKey || !accessToken) {
            throw new Error('Shopify credentials are required');
        }

        const api = axios.create({
            baseURL: `https://${storeUrl}/admin/api/2023-04`,
            headers: {
                'X-Shopify-Access-Token': accessToken
            }
        });

        // Get customers
        const response = await api.get('/customers.json', {
            params: {
                fields: [
                    'id',
                    'email',
                    'first_name',
                    'last_name',
                    'orders_count',
                    'total_spent',
                    'state',
                    'verified_email',
                    'tax_exempt',
                    'tags',
                    'last_order_name'
                ].join(',')
            }
        });

        const customers = response.data.customers;

        // Calculate customer metrics
        const metrics = customers.reduce((acc, customer) => {
            acc.totalCustomers++;
            acc.totalOrders += parseInt(customer.orders_count) || 0;
            acc.totalSpent += parseFloat(customer.total_spent) || 0;

            if (customer.orders_count > 1) {
                acc.returningCustomers++;
            }

            if (customer.verified_email) {
                acc.verifiedEmails++;
            }

            return acc;
        }, {
            totalCustomers: 0,
            totalOrders: 0,
            totalSpent: 0,
            returningCustomers: 0,
            verifiedEmails: 0
        });

        metrics.averageOrdersPerCustomer = metrics.totalOrders / metrics.totalCustomers;
        metrics.averageCustomerValue = metrics.totalSpent / metrics.totalCustomers;

        return {
            metrics,
            customers
        };
    }
};

export const socialMediaService = {
    // TikTok Analytics
    tiktok: {
        async getProfile() {
            const api = createApiInstance('tiktok');
            const response = await api.get('/user/info/');
            return response.data;
        },

        async getAnalytics(metrics = ['follower_count', 'profile_views', 'video_views']) {
            const api = createApiInstance('tiktok');
            const response = await api.get('/user/stats/', {
                params: { metrics: metrics.join(',') }
            });
            return response.data;
        },

        async getVideoStats(videoId) {
            const api = createApiInstance('tiktok');
            const response = await api.get(`/video/stats/${videoId}`);
            return response.data;
        },

        async getProfileStats() {
            return tiktok.getProfileStats();
        },

        async getVideoList() {
            return tiktok.getVideoList();
        },

        async getVideoMetrics(videoId) {
            return tiktok.getVideoMetrics(videoId);
        },

        async getAccountAnalytics() {
            return tiktok.getAccountAnalytics();
        },

        async getFollowerAnalytics() {
            return tiktok.getFollowerAnalytics();
        }
    },

    // Instagram Analytics
    instagram: {
        async getProfile() {
            const api = createApiInstance('instagram');
            const response = await api.get('/me', {
                params: {
                    fields: 'id,username,account_type,media_count,followers_count,follows_count'
                }
            });
            return response.data;
        },

        async getMediaInsights(mediaId) {
            const api = createApiInstance('instagram');
            const response = await api.get(`/${mediaId}/insights`, {
                params: {
                    metric: 'engagement,impressions,reach,saved'
                }
            });
            return response.data;
        },

        async getRecentMedia() {
            const api = createApiInstance('instagram');
            const response = await api.get('/me/media', {
                params: {
                    fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username'
                }
            });
            return response.data;
        },

        async getProfileStats() {
            return instagram.getProfileStats();
        },

        async getMediaInsightsList() {
            return instagram.getMediaInsights();
        },

        async getAccountInsights() {
            return instagram.getAccountInsights();
        },

        async getStoryInsights() {
            return instagram.getStoryInsights();
        }
    },

    // YouTube Analytics
    youtube: {
        getChannelStats: youtube.getChannelStats,
        getTopVideos: youtube.getTopVideos,
        getVideoStats: youtube.getVideoStats,
        getAnalytics: youtube.getAnalytics
    },

    // Shopify Analytics
    shopify: {
        async getStoreStats() {
            return shopify.getStoreStats();
        },

        async getRecentOrders(limit = 10) {
            return shopify.getRecentOrders(limit);
        },

        async getSalesAnalytics() {
            return shopify.getSalesAnalytics();
        },

        async getInventoryAnalytics() {
            return shopify.getInventoryAnalytics();
        },

        async getCustomerAnalytics() {
            return shopify.getCustomerAnalytics();
        }
    },

    // Utility functions
    utils: {
        formatNumber(num) {
            if (!num) return '0';
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        },

        calculateEngagementRate(engagement, followers) {
            return ((engagement / followers) * 100).toFixed(2) + '%';
        },

        getGrowthRate(current, previous) {
            const rate = ((current - previous) / previous) * 100;
            return rate.toFixed(1) + '%';
        }
    }
};
