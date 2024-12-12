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
    Movie as VideoIcon,
    Visibility as ViewsIcon,
    ThumbUp as LikesIcon,
    Share as ShareIcon
} from '@mui/icons-material';
import BaseWidget from './BaseWidget';
import { socialMediaService } from '../../services/socialMediaService';
import { apiKeyService } from '../../services/apiKeyService';
import ApiKeyManager from '../settings/ApiKeyManager';

const TikTokWidget = ({ onRemove, onSettingsChange, settings }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showApiKeyManager, setShowApiKeyManager] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const hasApiKey = apiKeyService.hasKey('tiktok');

    const fetchData = async () => {
        if (!hasApiKey) return;
        
        setLoading(true);
        setError(null);
        try {
            const [profile, analytics] = await Promise.all([
                socialMediaService.tiktok.getProfile(),
                socialMediaService.tiktok.getAnalytics()
            ]);

            setData({
                profile,
                analytics
            });
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching TikTok data:', error);
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
            <VideoIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography variant="body1" textAlign="center" color="text.secondary">
                TikTok API key is required to view analytics
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

        const { profile, analytics } = data;
        const { utils } = socialMediaService;

        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
                {/* Profile Stats */}
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <ViewsIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {utils.formatNumber(analytics.video_views)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Video Views
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <LikesIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {utils.formatNumber(profile.likes_count)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Likes
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <ShareIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {utils.formatNumber(analytics.shares)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Shares
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Performance Metrics */}
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Profile Performance
                </Typography>
                <Box sx={{ 
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    pb: 1
                }}>
                    <Box sx={{
                        flex: 1,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h6">
                            {utils.formatNumber(analytics.follower_count)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Followers
                        </Typography>
                    </Box>
                    <Box sx={{
                        flex: 1,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h6">
                            {utils.formatNumber(analytics.profile_views)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Profile Views
                        </Typography>
                    </Box>
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
                title="TikTok Analytics"
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

export default TikTokWidget;
