import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import BaseWidget from './BaseWidget';
import { stockService } from '../../services/apiServices';

const StockWidget = ({ symbol, settings, onRemove }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStockData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stockService.getDailyTimeSeries(symbol);
      const timeSeries = data['Time Series (Daily)'];
      
      // Process the data for the chart
      const processedData = Object.entries(timeSeries)
        .slice(0, 30) // Last 30 days
        .reverse()
        .map(([date, values]) => ({
          date,
          close: parseFloat(values['4. close']),
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          volume: parseInt(values['5. volume']),
        }));

      setStockData({
        timeSeries: processedData,
        metadata: data['Meta Data'],
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError(error.message || 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
    // Refresh data every 5 minutes during market hours
    const interval = setInterval(fetchStockData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol]);

  const renderContent = () => {
    if (loading && !stockData) {
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

    if (!stockData) {
      return (
        <Box p={2} textAlign="center">
          <Typography color="text.secondary">No stock data available</Typography>
        </Box>
      );
    }

    const latestData = stockData.timeSeries[stockData.timeSeries.length - 1];
    const previousData = stockData.timeSeries[stockData.timeSeries.length - 2];
    const priceChange = latestData.close - previousData.close;
    const percentChange = (priceChange / previousData.close) * 100;

    return (
      <Box>
        <Grid container spacing={2}>
          {/* Price Overview */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h4">
                      ${latestData.close.toFixed(2)}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      {priceChange >= 0 ? (
                        <TrendingUpIcon color="success" />
                      ) : (
                        <TrendingDownIcon color="error" />
                      )}
                      <Typography
                        variant="body1"
                        color={priceChange >= 0 ? 'success.main' : 'error.main'}
                        ml={1}
                      >
                        {priceChange >= 0 ? '+' : ''}
                        {priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Open: ${latestData.open.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High: ${latestData.high.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Low: ${latestData.low.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Volume: {latestData.volume.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Price Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                30-Day Price History
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockData.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <ChartTooltip
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                      labelFormatter={(date) => format(new Date(date), 'PPP')}
                    />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#8884d8"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <BaseWidget
      title={`${symbol} Stock Price`}
      onRemove={onRemove}
      onRefresh={fetchStockData}
      lastUpdated={lastUpdated}
    >
      {renderContent()}
    </BaseWidget>
  );
};

export default StockWidget;
