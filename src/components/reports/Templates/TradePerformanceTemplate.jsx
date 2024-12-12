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
  ShowChart,
  Timeline,
  PieChart as PieChartIcon,
  AttachMoney,
  Assessment,
  Speed,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const TradePerformanceTemplate = ({ data = {} }) => {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('1D');

  // Sample performance data
  const performanceData = [
    { time: '9:30', value: 10000, pnl: 0 },
    { time: '10:00', value: 10250, pnl: 250 },
    { time: '10:30', value: 10150, pnl: 150 },
    { time: '11:00', value: 10400, pnl: 400 },
    { time: '11:30', value: 10300, pnl: 300 },
    { time: '12:00', value: 10550, pnl: 550 },
  ];

  // Sample trade data
  const tradeData = [
    { symbol: 'AAPL', type: 'Buy', quantity: 100, price: 150.25, pnl: 250, time: '10:15' },
    { symbol: 'MSFT', type: 'Sell', quantity: 50, price: 285.75, pnl: 175, time: '10:45' },
    { symbol: 'GOOGL', type: 'Buy', quantity: 25, price: 2750.50, pnl: -120, time: '11:20' },
  ];

  // Performance metrics
  const metrics = {
    winRate: 65,
    profitFactor: 2.1,
    sharpeRatio: 1.8,
    maxDrawdown: -15,
    averageWin: 250,
    averageLoss: -120,
  };

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
  ];

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
          value={Math.abs(typeof value === 'number' ? value : 0)}
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
            <Typography variant="h4">Trade Performance</Typography>
            <ButtonGroup variant="outlined" size="small">
              {['1D', '1W', '1M', '3M', 'YTD', '1Y'].map((period) => (
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
          {renderMetricCard('Win Rate', `${metrics.winRate}%`, <Assessment />, 'success')}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('Profit Factor', metrics.profitFactor, <AttachMoney />, 'primary')}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('Sharpe Ratio', metrics.sharpeRatio, <ShowChart />, 'info')}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('Max Drawdown', `${metrics.maxDrawdown}%`, <TrendingDown />, 'error')}
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Portfolio Performance
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Trade History */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Trades
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">P&L</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tradeData.map((trade, index) => (
                    <TableRow key={index}>
                      <TableCell>{trade.symbol}</TableCell>
                      <TableCell>
                        <Chip
                          label={trade.type}
                          color={trade.type === 'Buy' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{trade.quantity}</TableCell>
                      <TableCell align="right">${trade.price}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: trade.pnl >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        ${trade.pnl}
                      </TableCell>
                      <TableCell>{trade.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={[
                  { metric: 'Win Rate', value: metrics.winRate },
                  { metric: 'Profit Factor', value: metrics.profitFactor * 30 },
                  { metric: 'Sharpe Ratio', value: metrics.sharpeRatio * 30 },
                  { metric: 'Risk Adjusted Return', value: 75 },
                  { metric: 'Recovery Factor', value: 60 },
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TradePerformanceTemplate;
