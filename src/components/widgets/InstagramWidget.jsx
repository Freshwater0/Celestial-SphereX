import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Grid,
    IconButton,
    Tooltip,
    Alert
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    Instagram as InstagramIcon,
    PhotoLibrary as MediaIcon,
    People as FollowersIcon,
    Timeline as PostsIcon
} from '@mui/icons-material';
import BaseWidget from './BaseWidget';
import { socialMediaService } from '../../services/socialMediaService';
import { apiKeyService } from '../../services/apiKeyService';
import ApiKeyManager from '../settings/ApiKeyManager';

const InstagramWidget = ({ onRemove, onSettingsChange, settings }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showApiKeyManager, setShowApiKeyManager] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const hasApiKey = apiKeyService.hasKey('instagram');

    const fetchData = async () => {
        if (!hasApiKey) return;
        
        setLoading(true);
        setError(null);
        try {
            const [profile, recentMedia] = await Promise.all([
                socialMediaService.instagram.getProfile(),
                socialMediaService.instagram.getRecentMedia()
            ]);

            // Get insights for recent posts
            const mediaInsights = await Promise.all(
                recentMedia.data.slice(0, 3).map(media => 
                    socialMediaService.instagram.getMediaInsights(media.id)
                )
            );

            setData({
                profile,
                recentMedia: recentMedia.data,
                insights: mediaInsights
            });
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching Instagram data:', error);
            setError(error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (hasApiKey) {
            fetchData();
            // Refresh every 30 minutes
            const interval = setInterval(fetchData, 1800000);
            return () => clearInterval(interval);
        }
    }, [hasApiKey]);

    const renderNoApiKey = () => (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2,
            p: 3
        }}>
            <InstagramIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography variant="body1" textAlign="center" color="text.secondary">
                Instagram API key is required to view analytics
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => setShowApiKeyManager(true)}
                startIcon={<SettingsIcon />}
            >
                Add API Key
            </Button>
        </Box>
    );

    const renderContent = () => {
        if (!hasApiKey) return renderNoApiKey();

        if (loading && !data) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (error) {
            return (
                <Alert 
                    severity="error" 
                    action={
                        <Button color="inherit" size="small" onClick={fetchData}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            );
        }

        if (!data) return null;

        const { profile, recentMedia, insights } = data;
        const { utils } = socialMediaService;

        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
                {/* Profile Stats */}
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <FollowersIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {utils.formatNumber(profile.followers_count)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Followers
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <PostsIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {utils.formatNumber(profile.media_count)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Posts
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <MediaIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {insights.length > 0 ? 
                                    utils.calculateEngagementRate(
                                        insights.reduce((sum, insight) => sum + insight.engagement, 0) / insights.length,
                                        profile.followers_count
                                    ) : '0%'
                                }
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Engagement
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Recent Posts */}
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Recent Posts Performance
                </Typography>
                <Box sx={{ 
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    pb: 1
                }}>
                    {recentMedia.slice(0, 3).map((post, index) => (
                        <Box 
                            key={post.id}
                            sx={{
                                minWidth: 120,
                                textAlign: 'center',
                                p: 1,
                                bgcolor: 'background.paper',
                                borderRadius: 1
                            }}
                        >
                            <Typography variant="body2">
                                {utils.formatNumber(insights[index]?.impressions || 0)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Impressions
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Last Updated */}
                <Box sx={{ 
                    mt: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="caption" color="text.secondary">
                        Last updated: {lastUpdated?.toLocaleTimeString()}
                    </Typography>
                    <Tooltip title="Refresh">
                        <IconButton size="small" onClick={fetchData}>
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        );
    };

    return (
        <>
            <BaseWidget
                title="Instagram Analytics"
                onRemove={onRemove}
                onSettingsChange={onSettingsChange}
                settings={settings}
            >
                {renderContent()}
            </BaseWidget>

            <ApiKeyManager
                open={showApiKeyManager}
                onClose={() => setShowApiKeyManager(false)}
            />
        </>
    );
};

export default InstagramWidget;
