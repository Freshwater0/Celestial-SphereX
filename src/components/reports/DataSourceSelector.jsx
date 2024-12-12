import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const DataSourceSelector = ({ template, category, onDataUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Define data sources based on category
  const getDataSources = (category) => {
    const sources = {
      news: ['Bloomberg', 'Reuters', 'Financial Times', 'Wall Street Journal'],
      trading: ['Interactive Brokers', 'TD Ameritrade', 'E*TRADE', 'Charles Schwab'],
      crypto: ['Binance', 'Coinbase', 'Kraken', 'FTX'],
      weather: ['OpenWeather', 'WeatherAPI', 'Tomorrow.io', 'AccuWeather'],
      socialMedia: ['Twitter', 'Reddit', 'StockTwits', 'LinkedIn'],
    };
    return sources[category] || [];
  };

  // Define options based on template
  const getTemplateOptions = (template) => {
    const options = {
      // News Templates
      LatestMarketNews: ['Headlines', 'Full Articles', 'Market Impact', 'Related News'],
      SectorSpecificNews: ['Sector Selection', 'Company News', 'Industry Analysis'],
      SentimentAnalysis: ['Article Sentiment', 'Social Media Sentiment', 'Market Sentiment'],
      BreakingNewsAlerts: ['Priority Alerts', 'Market Moving News', 'Sector Alerts'],

      // Trading Templates
      TradePerformance: ['Trade History', 'Performance Metrics', 'Risk Metrics'],
      TradeAnalytics: ['Pattern Analysis', 'Performance Stats', 'Risk Analysis'],
      RiskAndPortfolioManagement: ['Portfolio Holdings', 'Risk Metrics', 'Allocation'],
      ProfitAndLossStatement: ['Daily P&L', 'Monthly P&L', 'YTD Performance'],
      TradeComparison: ['Asset Comparison', 'Strategy Comparison', 'Time Period'],
      TradeEfficiency: ['Execution Quality', 'Cost Analysis', 'Timing Analysis'],

      // Crypto Templates
      CryptoPortfolio: ['Holdings', 'Performance', 'Cost Basis'],
      CryptoTransactionHistory: ['Trades', 'Transfers', 'Fees'],
      MarketMovement: ['Price Action', 'Volume', 'Market Cap'],
      CryptoNewsAndSentiment: ['News', 'Social Sentiment', 'Market Sentiment'],
      CryptoTaxReport: ['Gains/Losses', 'Cost Basis', 'Tax Lots'],

      // Weather Templates
      WeatherForecast: ['Temperature', 'Precipitation', 'Wind', 'Pressure'],
      WeatherImpactOnMarkets: ['Commodity Impact', 'Energy Markets', 'Agricultural'],
      ExtremeWeatherEvent: ['Event Type', 'Severity', 'Market Impact'],

      // Social Media Templates
      SocialMediaSentimentAnalysis: ['Sentiment Score', 'Trend Analysis', 'Key Topics'],
      TopMentionsAndInfluencers: ['Top Posts', 'Key Influencers', 'Engagement'],
      EngagementAndTrends: ['Engagement Metrics', 'Trending Topics', 'Growth'],
      SocialMediaMarketImpact: ['Market Correlation', 'Sentiment Impact', 'Trend Impact'],
    };
    return options[template] || [];
  };

  useEffect(() => {
    if (template && category) {
      setDataSource('');
      setSelectedOptions([]);
      setDateRange({ startDate: null, endDate: null });
    }
  }, [template, category]);

  const handleDataSourceChange = (event) => {
    setDataSource(event.target.value);
  };

  const handleOptionToggle = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleApply = async () => {
    if (!dataSource || selectedOptions.length === 0) {
      setError('Please select a data source and at least one option');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call to fetch data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update parent component with selected data
      onDataUpdate({
        dataSource,
        selectedOptions,
        dateRange,
        // Add more data as needed
      });

      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Data Source Configuration
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Data Source</InputLabel>
            <Select
              value={dataSource}
              onChange={handleDataSourceChange}
              label="Data Source"
            >
              {getDataSources(category).map((source) => (
                <MenuItem key={source} value={source}>
                  {source}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Options
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {getTemplateOptions(template).map((option) => (
                <Chip
                  key={option}
                  label={option}
                  onClick={() => handleOptionToggle(option)}
                  color={selectedOptions.includes(option) ? 'primary' : 'default'}
                  variant={selectedOptions.includes(option) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>

          <Stack direction="row" spacing={2}>
            <DatePicker
              label="Start Date"
              value={dateRange.startDate}
              onChange={(newValue) =>
                setDateRange((prev) => ({ ...prev, startDate: newValue }))
              }
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="End Date"
              value={dateRange.endDate}
              onChange={(newValue) =>
                setDateRange((prev) => ({ ...prev, endDate: newValue }))
              }
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>

          <Button
            variant="contained"
            onClick={handleApply}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Apply'}
          </Button>
        </Stack>
      </Paper>
    </LocalizationProvider>
  );
};

export default DataSourceSelector;
