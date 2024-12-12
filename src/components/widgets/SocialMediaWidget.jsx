import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Favorite as LikeIcon,
  Share as RetweetIcon,
  Comment as ReplyIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import BaseWidget from './BaseWidget';
import { format } from 'date-fns';

// Mock data for development (replace with actual API calls)
const fetchSocialData = async (username) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate mock data
  const now = new Date();
  const recentPosts = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString(),
      likes: Math.floor(Math.random() * 1000),
      retweets: Math.floor(Math.random() * 200),
      replies: Math.floor(Math.random() * 100),
    };
  });

  return {
    followers: 50000 + Math.floor(Math.random() * 10000),
    following: 1000 + Math.floor(Math.random() * 500),
    totalPosts: 5000 + Math.floor(Math.random() * 1000),
    engagement: {
      totalLikes: recentPosts.reduce((sum, post) => sum + post.likes, 0),
      totalRetweets: recentPosts.reduce((sum, post) => sum + post.retweets, 0),
      totalReplies: recentPosts.reduce((sum, post) => sum + post.replies, 0),
    },
    recentPosts,
  };
};

const SocialMediaWidget = ({ onRemove, onSettingsChange, settings }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const socialData = await fetchSocialData(settings?.username || 'default');
      setData(socialData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching social media data:', error);
      setError(error.message || 'Failed to fetch social media data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings?.username]);

  const renderContent = () => {
    if (loading && !data) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box p={2} textAlign="center">
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    if (!data) {
      return (
        <Box p={2} textAlign="center">
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Grid container spacing={2}>
          {/* Overview Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Followers
                </Typography>
                <Typography variant="h4">
                  {data.followers.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Following
                </Typography>
                <Typography variant="h4">
                  {data.following.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Posts
                </Typography>
                <Typography variant="h4">
                  {data.totalPosts.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Engagement Stats */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Engagement
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <LikeIcon color="primary" />
                    <Typography variant="h6">
                      {data.engagement.totalLikes.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Likes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <RetweetIcon color="primary" />
                    <Typography variant="h6">
                      {data.engagement.totalRetweets.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Retweets
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box textAlign="center">
                    <ReplyIcon color="primary" />
                    <Typography variant="h6">
                      {data.engagement.totalReplies.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Replies
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Recent Posts */}
          <Grid item xs={12}>
            <Paper>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TimelineIcon />
                  </ListItemIcon>
                  <ListItemText primary="Recent Posts" />
                </ListItem>
                <Divider />
                {data.recentPosts.map((post, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(post.date), 'PP')}
                              </Typography>
                            </Grid>
                            <Grid item xs={4} sm={2}>
                              <Typography variant="body2">
                                <LikeIcon fontSize="small" /> {post.likes}
                              </Typography>
                            </Grid>
                            <Grid item xs={4} sm={2}>
                              <Typography variant="body2">
                                <RetweetIcon fontSize="small" /> {post.retweets}
                              </Typography>
                            </Grid>
                            <Grid item xs={4} sm={2}>
                              <Typography variant="body2">
                                <ReplyIcon fontSize="small" /> {post.replies}
                              </Typography>
                            </Grid>
                          </Grid>
                        }
                      />
                    </ListItem>
                    {index < data.recentPosts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <BaseWidget
      title={`Social Media Analytics${settings?.username ? ` - @${settings.username}` : ''}`}
      onRemove={onRemove}
      onRefresh={fetchData}
      lastUpdated={lastUpdated}
    >
      {renderContent()}
    </BaseWidget>
  );
};

export default SocialMediaWidget;
