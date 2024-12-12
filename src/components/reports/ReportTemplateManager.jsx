import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const ReportTemplateManager = ({
  categories,
  onTemplateSelect,
  selectedTemplate,
  selectedCategory,
}) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  const handleCategoryClick = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getTemplateDescription = (template) => {
    const descriptions = {
      // News Templates
      LatestMarketNews: "Summarizes top news stories affecting markets",
      SectorSpecificNews: "Aggregates news stories by specific sectors",
      SentimentAnalysis: "Analyzes sentiment of news articles",
      BreakingNewsAlerts: "Highlights important breaking news",

      // Trading Templates
      TradePerformance: "Detailed breakdown of trades",
      TradeAnalytics: "Analyzes trading patterns and performance metrics",
      RiskAndPortfolioManagement: "Summarizes portfolio risk and asset allocation",
      ProfitAndLossStatement: "Summarizes trading profits and losses",
      TradeComparison: "Compares performance between assets/strategies",
      TradeEfficiency: "Provides insights into trade efficiency",

      // Crypto Templates
      CryptoPortfolio: "Summarizes cryptocurrency holdings",
      CryptoTransactionHistory: "Lists cryptocurrency transactions",
      MarketMovement: "Shows cryptocurrency price movements",
      CryptoNewsAndSentiment: "Gathers crypto news and market sentiment",
      CryptoTaxReport: "Helps track capital gains and losses",

      // Weather Templates
      WeatherForecast: "Provides weather predictions",
      WeatherImpactOnMarkets: "Correlates weather data with market performance",
      ExtremeWeatherEvent: "Tracks significant weather events and their impacts",

      // Social Media Templates
      SocialMediaSentimentAnalysis: "Analyzes social media sentiment trends",
      TopMentionsAndInfluencers: "Tracks influential users and popular mentions",
      EngagementAndTrends: "Monitors social media engagement metrics",
      SocialMediaMarketImpact: "Analyzes social media impact on markets"
    };

    return descriptions[template] || "No description available";
  };

  const formatTemplateName = (name) => {
    return name.replace(/([A-Z])/g, ' $1').trim();
  };

  const getCategoryIcon = (category) => {
    return expandedCategories[category] ? <ExpandLessIcon /> : <ExpandMoreIcon />;
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Report Templates
      </Typography>
      <List>
        {Object.entries(categories).map(([category, templates]) => (
          <Box key={category}>
            <ListItemButton onClick={() => handleCategoryClick(category)}>
              <ListItemText
                primary={category.charAt(0).toUpperCase() + category.slice(1)}
                sx={{ textTransform: 'capitalize' }}
              />
              {getCategoryIcon(category)}
            </ListItemButton>
            <Collapse in={expandedCategories[category]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {templates.map((template) => (
                  <ListItem
                    key={template}
                    sx={{
                      pl: 4,
                      bgcolor:
                        selectedTemplate === template
                          ? 'action.selected'
                          : 'transparent',
                    }}
                    secondaryAction={
                      <Tooltip title={getTemplateDescription(template)}>
                        <IconButton edge="end" size="small">
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemButton
                      onClick={() => onTemplateSelect(template, category)}
                      selected={selectedTemplate === template}
                    >
                      <ListItemText
                        primary={formatTemplateName(template)}
                        secondary={getTemplateDescription(template)}
                        secondaryTypographyProps={{
                          noWrap: true,
                          sx: { maxWidth: '200px' },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </List>
    </Paper>
  );
};

export default ReportTemplateManager;
