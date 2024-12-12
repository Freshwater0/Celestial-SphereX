import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Grid,
    IconButton,
    Tooltip,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    YouTube as YouTubeIcon,
    Visibility as ViewsIcon,
    ThumbUp as LikesIcon,
    People as SubscribersIcon,
    VideoLibrary as VideosIcon
} from '@mui/icons-material';
import BaseWidget from './BaseWidget';
import { socialMediaService } from '../../services/socialMediaService';
import { apiKeyService } from '../../services/apiKeyService';
import ApiKeyManager from '../settings/ApiKeyManager';

const YouTubeWidget = ({ onRemove, onSettingsChange, settings }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showApiKeyManager, setShowApiKeyManager] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const hasApiKey = apiKeyService.hasKey('youtube');

    const fetchData = async () => {
        if (!hasApiKey) return;
        
        setLoading(true);
        setError(null);
        try {
            const [channelStats, topVideos, analytics] = await Promise.all([
                socialMediaService.youtube.getChannelStats(),
                socialMediaService.youtube.getTopVideos(),
                socialMediaService.youtube.getAnalytics()
            ]);

            // Get stats for top videos
            const videoStats = await Promise.all(
                topVideos.map(video => 
                    socialMediaService.youtube.getVideoStats(video.id.videoId)
                )
            );

            setData({
                channelStats,
                topVideos: topVideos.map((video, index) => ({
                    ...video,
                    statistics: videoStats[index]
                })),
                analytics
            });
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching YouTube data:', error);
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
            <YouTubeIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography variant="body1" textAlign="center" color="text.secondary">
                YouTube API key is required to view analytics
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

    const renderAnalytics = () => {
        if (!data?.analytics) return null;

        const { analytics } = data;
        const { utils } = socialMediaService;

        // Calculate totals and changes
        const totals = analytics.data.reduce((acc, day) => ({
            views: acc.views + day[0],
            watchTime: acc.watchTime + day[1],
            subsGained: acc.subsGained + day[3],
            subsLost: acc.subsLost + day[4],
            likes: acc.likes + day[5],
            comments: acc.comments + day[6],
            shares: acc.shares + day[7]
        }), { views: 0, watchTime: 0, subsGained: 0, subsLost: 0, likes: 0, comments: 0, shares: 0 });

        return (
            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                    Last 28 Days Performance
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">Views</Typography>
                            <Typography variant="h6">{utils.formatNumber(totals.views)}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">Watch Time (mins)</Typography>
                            <Typography variant="h6">{utils.formatNumber(totals.watchTime)}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">New Subscribers</Typography>
                            <Typography variant="h6" color={totals.subsGained > totals.subsLost ? 'success.main' : 'error.main'}>
                                {totals.subsGained > totals.subsLost ? '+' : ''}{totals.subsGained - totals.subsLost}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">Engagement</Typography>
                            <Typography variant="h6">
                                {utils.formatNumber(totals.likes + totals.comments + totals.shares)}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        );
    };

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

        const { channelStats, topVideos } = data;
        const { utils } = socialMediaService;

        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
                {/* Channel Stats */}
                <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <SubscribersIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {utils.formatNumber(channelStats.subscriberCount)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Subscribers
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <ViewsIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {utils.formatNumber(channelStats.viewCount)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Views
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <VideosIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {utils.formatNumber(channelStats.videoCount)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Videos
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <LikesIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {utils.formatNumber(
                                    topVideos.reduce((sum, video) => 
                                        sum + parseInt(video.statistics?.likeCount || 0), 0
                                    )
                                )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Likes
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Analytics */}
                {renderAnalytics()}

                {/* Top Videos */}
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Top Performing Videos
                </Typography>
                <List sx={{ 
                    flex: 1,
                    overflowY: 'auto',
                    bgcolor: 'background.paper',
                    borderRadius: 1
                }}>
                    {topVideos.map((video) => (
                        <ListItem
                            key={video.id.videoId}
                            sx={{
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                }
                            }}
                            component="a"
                            href={`https://youtube.com/watch?v=${video.id.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ListItemAvatar>
                                <Avatar
                                    variant="rounded"
                                    src={video.snippet.thumbnails.default.url}
                                    alt={video.snippet.title}
                                />
                            </ListItemAvatar>
                            <ListItemText
                                primary={video.snippet.title}
                                secondary={
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Typography variant="caption" component="span">
                                            {utils.formatNumber(video.statistics?.viewCount || 0)} views
                                        </Typography>
                                        <Typography variant="caption" component="span">
                                            {utils.formatNumber(video.statistics?.likeCount || 0)} likes
                                        </Typography>
                                        <Typography variant="caption" component="span">
                                            {utils.formatNumber(video.statistics?.commentCount || 0)} comments
                                        </Typography>
                                    </Box>
                                }
                                primaryTypographyProps={{
                                    variant: 'body2',
                                    noWrap: true
                                }}
                            />
                        </ListItem>
                    ))}
                </List>

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
                    <Box>
                        <Tooltip title="Settings">
                            <IconButton size="small" onClick={() => setShowApiKeyManager(true)} sx={{ mr: 1 }}>
                                <SettingsIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Refresh">
                            <IconButton size="small" onClick={fetchData}>
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>
        );
    };

    return (
        <>
            <BaseWidget
                title="YouTube Analytics"
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

export default YouTubeWidget;
