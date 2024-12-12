import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Avatar,
  IconButton,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  BookmarkBorder,
  Share,
  Timeline,
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LatestMarketNewsTemplate = ({ data = {}, onNewsClick, onBookmark }) => {
  const theme = useTheme();

  // Sample market impact data for visualization
  const marketImpactData = [
    { time: '9:30', impact: 65 },
    { time: '10:00', impact: 78 },
    { time: '10:30', impact: 72 },
    { time: '11:00', impact: 85 },
    { time: '11:30', impact: 82 },
    { time: '12:00', impact: 90 },
  ];

  const renderNewsCard = (news) => (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={news.sourceIcon} alt={news.source}>
              {news.source[0]}
            </Avatar>
            <Typography variant="subtitle2" color="text.secondary">
              {news.source}
            </Typography>
          </Box>
          <Box>
            <IconButton size="small">
              <BookmarkBorder />
            </IconButton>
            <IconButton size="small">
              <Share />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom>
          {news.headline}
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          {news.summary}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip
            icon={news.sentiment === 'positive' ? <TrendingUp /> : <TrendingDown />}
            label={`${news.sentiment} impact`}
            color={news.sentiment === 'positive' ? 'success' : 'error'}
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            {news.time} • {news.date}
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Market Impact
          </Typography>
          <LinearProgress
            variant="determinate"
            value={news.marketImpact}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {news.relatedTickers && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Related Tickers
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {news.relatedTickers.map((ticker) => (
                <Chip
                  key={ticker}
                  label={ticker}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Latest Market News</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="Real-time Updates" color="primary" />
              <Chip label="AI-Powered Analysis" variant="outlined" />
            </Box>
          </Box>
        </Grid>

        {/* Market Impact Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Market Sentiment Timeline
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketImpactData}>
                  <defs>
                    <linearGradient id="marketImpact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="impact"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#marketImpact)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* News Feed */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Top Stories
          </Typography>
          {(data.news || [
            {
              source: 'Bloomberg',
              sourceIcon: '/icons/bloomberg.png',
              headline: 'Fed Signals Potential Rate Changes Amid Economic Data',
              summary: 'Federal Reserve officials indicated they may adjust interest rates based on incoming economic data, while maintaining their commitment to price stability.',
              sentiment: 'positive',
              time: '2 hours ago',
              date: 'Today',
              marketImpact: 75,
              relatedTickers: ['SPY', 'QQQ', 'TLT'],
            },
            {
              source: 'Reuters',
              sourceIcon: '/icons/reuters.png',
              headline: 'Tech Giants Report Strong Quarterly Earnings',
              summary: 'Major technology companies exceeded analyst expectations, driven by AI initiatives and cloud services growth.',
              sentiment: 'positive',
              time: '4 hours ago',
              date: 'Today',
              marketImpact: 85,
              relatedTickers: ['AAPL', 'MSFT', 'GOOGL'],
            },
          ]).map((news, index) => (
            <Box key={index}>
              {renderNewsCard(news)}
            </Box>
          ))}
        </Grid>

        {/* Market Overview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Market Overview
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Trending Topics
              </Typography>
              {(data.trendingTopics || [
                'Artificial Intelligence',
                'Interest Rates',
                'Earnings Season',
                'Cryptocurrency',
              ]).map((topic, index) => (
                <Chip
                  key={index}
                  label={topic}
                  sx={{ m: 0.5 }}
                  variant="outlined"
                />
              ))}
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Key Market Indicators
              </Typography>
              {(data.marketIndicators || [
                { name: 'VIX', value: '15.2', change: '-0.8' },
                { name: 'US 10Y', value: '1.58%', change: '+0.03' },
                { name: 'Gold', value: '$1,845', change: '+12.5' },
              ]).map((indicator, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                  }}
                >
                  <Typography variant="body2">{indicator.name}</Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">{indicator.value}</Typography>
                    <Typography
                      variant="caption"
                      color={indicator.change.startsWith('+') ? 'success.main' : 'error.main'}
                    >
                      {indicator.change}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

LatestMarketNewsTemplate.propTypes = {
  data: PropTypes.shape({
    news: PropTypes.arrayOf(PropTypes.shape({
      source: PropTypes.string.isRequired,
      sourceIcon: PropTypes.string,
      headline: PropTypes.string.isRequired,
      summary: PropTypes.string.isRequired,
      sentiment: PropTypes.oneOf(['positive', 'negative', 'neutral']).isRequired,
      time: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      marketImpact: PropTypes.number.isRequired,
      relatedTickers: PropTypes.arrayOf(PropTypes.string),
    })),
    trendingTopics: PropTypes.arrayOf(PropTypes.string),
    marketIndicators: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      change: PropTypes.string.isRequired,
    })),
  }),
  onNewsClick: PropTypes.func,
  onBookmark: PropTypes.func,
};

LatestMarketNewsTemplate.defaultProps = {
  data: {
    news: [],
    trendingTopics: [],
    marketIndicators: [],
  },
  onNewsClick: () => {},
  onBookmark: () => {},
};

export default LatestMarketNewsTemplate;
