import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  ButtonGroup,
  Button,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CurrencyBitcoin,
  ShowChart,
  Timeline,
  Speed,
  CloudQueue,
  Bolt,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart,
} from 'recharts';

const CryptoMarketTemplate = ({ data = {} }) => {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('24H');

  // Sample crypto market data
  const marketData = [
    { time: '00:00', btc: 45000, eth: 3000, volume: 2.5 },
    { time: '04:00', btc: 45500, eth: 3100, volume: 3.1 },
    { time: '08:00', btc: 46000, eth: 3050, volume: 2.8 },
    { time: '12:00', btc: 45800, eth: 3200, volume: 3.5 },
    { time: '16:00', btc: 46500, eth: 3250, volume: 4.2 },
    { time: '20:00', btc: 47000, eth: 3300, volume: 3.8 },
  ];

  // Top cryptocurrencies
  const topCryptos = [
    { name: 'Bitcoin', symbol: 'BTC', price: 46789.50, change24h: 2.5, marketCap: 880.5, volume24h: 28.4 },
    { name: 'Ethereum', symbol: 'ETH', price: 3245.75, change24h: 3.2, marketCap: 380.2, volume24h: 15.6 },
    { name: 'Binance Coin', symbol: 'BNB', price: 412.30, change24h: -1.2, marketCap: 68.5, volume24h: 5.8 },
    { name: 'Cardano', symbol: 'ADA', price: 1.45, change24h: 4.8, marketCap: 45.8, volume24h: 3.2 },
  ];

  // Market metrics
  const metrics = {
    totalMarketCap: 2.1, // trillion
    totalVolume24h: 125.8, // billion
    btcDominance: 42.5,
    activeMarkets: 8750,
  };

  const renderMetricCard = (title, value, icon, color) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {value}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={75}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: `${color}.lighter`,
            '& .MuiLinearProgress-bar': {
              bgcolor: `${color}.main`,
              borderRadius: 3,
            },
          }}
        />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Crypto Market Overview</Typography>
            <ButtonGroup variant="outlined" size="small">
              {['24H', '7D', '30D', '90D', '1Y', 'ALL'].map((period) => (
                <Button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  variant={timeframe === period ? 'contained' : 'outlined'}
                >
                  {period}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('Total Market Cap', `$${metrics.totalMarketCap}T`, <ShowChart />, 'primary')}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('24h Volume', `$${metrics.totalVolume24h}B`, <Timeline />, 'secondary')}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('BTC Dominance', `${metrics.btcDominance}%`, <CurrencyBitcoin />, 'warning')}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('Active Markets', metrics.activeMarkets, <Speed />, 'info')}
        </Grid>

        {/* Price Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Price Movement
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData}>
                  <defs>
                    <linearGradient id="colorBtc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="btc"
                    name="BTC"
                    stroke={theme.palette.warning.main}
                    fillOpacity={1}
                    fill="url(#colorBtc)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="eth"
                    name="ETH"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorEth)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Market Leaders */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Market Leaders
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">24h Change</TableCell>
                    <TableCell align="right">Market Cap</TableCell>
                    <TableCell align="right">24h Volume</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topCryptos.map((crypto) => (
                    <TableRow key={crypto.symbol}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={`/crypto-icons/${crypto.symbol.toLowerCase()}.png`}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          >
                            {crypto.symbol[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{crypto.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {crypto.symbol}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">${crypto.price.toLocaleString()}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: crypto.change24h >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {crypto.change24h >= 0 ? <TrendingUp sx={{ mr: 0.5 }} /> : <TrendingDown sx={{ mr: 0.5 }} />}
                          {crypto.change24h}%
                        </Box>
                      </TableCell>
                      <TableCell align="right">${crypto.marketCap}B</TableCell>
                      <TableCell align="right">${crypto.volume24h}B</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Market Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Market Activity
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="marketCap" name="Market Cap" unit="B" />
                  <YAxis type="number" dataKey="volume24h" name="Volume" unit="B" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter
                    name="Cryptocurrencies"
                    data={topCryptos}
                    fill={theme.palette.primary.main}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CryptoMarketTemplate;
