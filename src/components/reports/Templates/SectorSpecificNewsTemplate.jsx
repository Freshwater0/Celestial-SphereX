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
  Tab,
  Tabs,
  useTheme,
  LinearProgress,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpward,
  ArrowDownward,
  BookmarkBorder,
  Share,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const SectorSpecificNewsTemplate = ({ data = {} }) => {
  const theme = useTheme();
  const [selectedSector, setSelectedSector] = useState(0);

  // Sample sector performance data
  const sectorPerformance = [
    { sector: 'Technology', performance: 2.5, news: 15, sentiment: 0.8 },
    { sector: 'Healthcare', performance: 1.8, news: 12, sentiment: 0.6 },
    { sector: 'Finance', performance: -0.5, news: 18, sentiment: 0.4 },
    { sector: 'Energy', performance: 3.2, news: 10, sentiment: 0.7 },
    { sector: 'Consumer', performance: 0.9, news: 8, sentiment: 0.5 },
  ];

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.success.main,
    theme.palette.warning.main,
  ];

  const renderSectorCard = (sector) => (
    <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{sector.sector}</Typography>
          <Chip
            icon={sector.performance > 0 ? <TrendingUp /> : <TrendingDown />}
            label={`${sector.performance}%`}
            color={sector.performance > 0 ? 'success' : 'error'}
            size="small"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Sentiment Score
          </Typography>
          <LinearProgress
            variant="determinate"
            value={sector.sentiment * 100}
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            News Articles: {sector.news}
          </Typography>
          <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
            <Avatar alt="Source 1" src="/icons/bloomberg.png" />
            <Avatar alt="Source 2" src="/icons/reuters.png" />
            <Avatar alt="Source 3" src="/icons/wsj.png" />
          </AvatarGroup>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small">
            <BookmarkBorder />
          </IconButton>
          <IconButton size="small">
            <Share />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Sector Analysis</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="Live Updates" color="primary" />
              <Chip label="Market Hours" variant="outlined" />
            </Box>
          </Box>
        </Grid>

        {/* Sector Performance Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sector Performance
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sector" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="performance" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Sector Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              News Distribution
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorPerformance}
                    dataKey="news"
                    nameKey="sector"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {sectorPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Sector Cards */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Sector Details
          </Typography>
          <Grid container spacing={2}>
            {sectorPerformance.map((sector, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                {renderSectorCard(sector)}
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SectorSpecificNewsTemplate;
