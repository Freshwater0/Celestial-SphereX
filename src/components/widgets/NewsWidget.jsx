import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Link,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import BaseWidget from './BaseWidget';
import { newsService } from '../../services/apiServices';

const NewsWidget = ({ category, settings, onRemove }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await newsService.getTopHeadlines(category);
      setArticles(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching news:', error);
      setError(error.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Refresh news every 30 minutes
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [category]);

  const renderContent = () => {
    if (loading && !articles.length) {
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

    if (!articles.length) {
      return (
        <Box p={2} textAlign="center">
          <Typography color="text.secondary">No news articles available</Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={2}>
        {articles.slice(0, 5).map((article, index) => (
          <Grid item xs={12} key={index}>
            <Card>
              <Grid container>
                {article.urlToImage && (
                  <Grid item xs={12} sm={4}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={article.urlToImage}
                      alt={article.title}
                      onError={(e) => {
                        e.target.src = '/placeholder-news.jpg';
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={article.urlToImage ? 8 : 12}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {article.title}
                      <Tooltip title="Open article">
                        <IconButton
                          size="small"
                          component={Link}
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {article.description}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(article.publishedAt), 'PPp')}
                      </Typography>
                      <Chip
                        label={article.source.name}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <BaseWidget
      title={`${category.charAt(0).toUpperCase() + category.slice(1)} News`}
      onRemove={onRemove}
      onRefresh={fetchNews}
      lastUpdated={lastUpdated}
    >
      {renderContent()}
    </BaseWidget>
  );
};

export default NewsWidget;
