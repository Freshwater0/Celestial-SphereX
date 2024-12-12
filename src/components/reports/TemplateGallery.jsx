import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Preview as PreviewIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const TemplateGallery = ({ onTemplateSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Template preview images and descriptions
  const templates = {
    news: [
      {
        id: 'latest-market-news',
        name: 'Latest Market News',
        description: 'Clean, modern layout for market news with priority highlighting',
        preview: '/templates/news/latest-market-news.png',
        features: [
          'Priority news highlighting',
          'Market impact indicators',
          'Source credibility ratings',
          'Related news links'
        ],
        category: 'news',
        type: 'LatestMarketNews'
      },
      {
        id: 'sector-specific',
        name: 'Sector Analysis',
        description: 'Detailed sector-by-sector news analysis with visual breakdowns',
        preview: '/templates/news/sector-specific.png',
        features: [
          'Sector performance metrics',
          'News impact analysis',
          'Trend indicators',
          'Company highlights'
        ],
        category: 'news',
        type: 'SectorSpecificNews'
      }
    ],
    trading: [
      {
        id: 'trade-performance',
        name: 'Trade Performance Dashboard',
        description: 'Comprehensive view of trading performance with key metrics',
        preview: '/templates/trading/performance.png',
        features: [
          'Performance metrics',
          'Risk analysis',
          'Trade history',
          'P&L breakdown'
        ],
        category: 'trading',
        type: 'TradePerformance'
      },
      {
        id: 'portfolio-risk',
        name: 'Portfolio Risk Analysis',
        description: 'Detailed risk assessment and portfolio management view',
        preview: '/templates/trading/risk.png',
        features: [
          'Risk metrics',
          'Asset allocation',
          'Exposure analysis',
          'Risk alerts'
        ],
        category: 'trading',
        type: 'RiskAndPortfolioManagement'
      }
    ],
    crypto: [
      {
        id: 'crypto-portfolio',
        name: 'Crypto Portfolio Tracker',
        description: 'Modern cryptocurrency portfolio tracking and analysis',
        preview: '/templates/crypto/portfolio.png',
        features: [
          'Holdings overview',
          'Performance metrics',
          'Market data',
          'Transaction history'
        ],
        category: 'crypto',
        type: 'CryptoPortfolio'
      },
      {
        id: 'crypto-tax',
        name: 'Crypto Tax Report',
        description: 'Comprehensive cryptocurrency tax reporting template',
        preview: '/templates/crypto/tax.png',
        features: [
          'Capital gains calculation',
          'Transaction categorization',
          'Tax lot tracking',
          'Cost basis reporting'
        ],
        category: 'crypto',
        type: 'CryptoTaxReport'
      }
    ],
    weather: [
      {
        id: 'weather-market-impact',
        name: 'Weather Market Impact',
        description: 'Analysis of weather patterns and their market effects',
        preview: '/templates/weather/market-impact.png',
        features: [
          'Weather pattern analysis',
          'Market correlation',
          'Commodity impact',
          'Risk assessment'
        ],
        category: 'weather',
        type: 'WeatherImpactOnMarkets'
      }
    ],
    socialMedia: [
      {
        id: 'social-sentiment',
        name: 'Social Media Sentiment',
        description: 'Comprehensive social media sentiment analysis dashboard',
        preview: '/templates/social/sentiment.png',
        features: [
          'Sentiment tracking',
          'Trend analysis',
          'Influence metrics',
          'Engagement stats'
        ],
        category: 'socialMedia',
        type: 'SocialMediaSentimentAnalysis'
      }
    ]
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
  };

  const handleFavorite = (templateId) => {
    setFavorites(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getAllTemplates = () => {
    return Object.values(templates).flat();
  };

  const getFilteredTemplates = () => {
    const allTemplates = getAllTemplates();
    if (selectedCategory === 'all') return allTemplates;
    if (selectedCategory === 'favorites') return allTemplates.filter(t => favorites.includes(t.id));
    return allTemplates.filter(t => t.category === selectedCategory);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Templates" value="all" />
          <Tab label="Favorites" value="favorites" />
          <Tab label="News" value="news" />
          <Tab label="Trading" value="trading" />
          <Tab label="Crypto" value="crypto" />
          <Tab label="Weather" value="weather" />
          <Tab label="Social Media" value="socialMedia" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {getFilteredTemplates().map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={template.preview}
                alt={template.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" component="div">
                    {template.name}
                  </Typography>
                  <IconButton
                    onClick={() => handleFavorite(template.id)}
                    color="primary"
                    size="small"
                  >
                    {favorites.includes(template.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {template.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {template.features.map((feature, index) => (
                    <Chip
                      key={index}
                      label={feature}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                  <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={() => handlePreview(template)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => onTemplateSelect(template.type, template.category)}
                  >
                    Use Template
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Template Preview Dialog */}
      <Dialog
        open={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        maxWidth="lg"
        fullWidth
      >
        {previewTemplate && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{previewTemplate.name}</Typography>
                <IconButton onClick={() => setPreviewTemplate(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <img
                  src={previewTemplate.preview}
                  alt={previewTemplate.name}
                  style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                />
              </Box>
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
              <Grid container spacing={2}>
                {previewTemplate.features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body1">
                        • {feature}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewTemplate(null)}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  onTemplateSelect(previewTemplate.type, previewTemplate.category);
                  setPreviewTemplate(null);
                }}
              >
                Use This Template
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TemplateGallery;
