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
  useTheme,
  ButtonGroup,
  Button,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Favorite,
  Share,
  Comment,
  TrendingUp,
  People,
  Timeline,
  Public,
  Visibility,
  ThumbUp,
  Message,
  Repeat,
  BarChart,
  Language,
  AccessTime,
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
  Bar,
  ComposedChart,
} from 'recharts';

const SocialMediaAnalyticsTemplate = ({ data = {} }) => {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('7D');

  // Sample engagement data
  const engagementData = [
    { date: 'Mon', likes: 1200, comments: 450, shares: 280, reach: 5000 },
    { date: 'Tue', likes: 1500, comments: 520, shares: 350, reach: 6200 },
    { date: 'Wed', likes: 1100, comments: 480, shares: 240, reach: 4800 },
    { date: 'Thu', likes: 1800, comments: 650, shares: 420, reach: 7500 },
    { date: 'Fri', likes: 2000, comments: 700, shares: 500, reach: 8200 },
    { date: 'Sat', likes: 1600, comments: 550, shares: 380, reach: 6800 },
    { date: 'Sun', likes: 1400, comments: 500, shares: 320, reach: 5900 },
  ];

  // Audience demographics
  const demographics = {
    age: [
      { group: '18-24', value: 25 },
      { group: '25-34', value: 35 },
      { group: '35-44', value: 20 },
      { group: '45-54', value: 12 },
      { group: '55+', value: 8 },
    ],
    locations: [
      { country: 'USA', value: 45 },
      { country: 'UK', value: 15 },
      { country: 'Canada', value: 12 },
      { country: 'Australia', value: 8 },
      { country: 'Others', value: 20 },
    ],
  };

  // Performance metrics
  const metrics = {
    followers: 25800,
    engagement: 3.8,
    reach: 45000,
    impressions: 68000,
  };

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const renderMetricCard = (title, value, subtitle, icon, color) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {value.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
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
            <Typography variant="h4">Social Media Analytics</Typography>
            <ButtonGroup variant="outlined" size="small">
              {['24H', '7D', '30D', '90D', 'YTD'].map((period) => (
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
          {renderMetricCard('Followers', metrics.followers, '+12% from last month', <People />, 'primary')}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('Engagement Rate', metrics.engagement, 'Average per post', <ThumbUp />, 'success')}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('Reach', metrics.reach, 'Unique viewers', <Visibility />, 'info')}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('Impressions', metrics.impressions, 'Total views', <Timeline />, 'warning')}
        </Grid>

        {/* Engagement Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Engagement Overview
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="reach"
                    name="Reach"
                    fill={theme.palette.info.light}
                    stroke={theme.palette.info.main}
                  />
                  <Bar yAxisId="left" dataKey="likes" name="Likes" fill={theme.palette.primary.main} />
                  <Bar yAxisId="left" dataKey="comments" name="Comments" fill={theme.palette.secondary.main} />
                  <Bar yAxisId="left" dataKey="shares" name="Shares" fill={theme.palette.success.main} />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Demographics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Age Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographics.age}
                    dataKey="value"
                    nameKey="group"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {demographics.age.map((entry, index) => (
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

        {/* Geographic Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Geographic Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={demographics.locations}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="country" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Audience"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Favorite color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Average Likes per Post"
                      secondary="1,520"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Comment color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Average Comments per Post"
                      secondary="550"
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={4}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Share color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Average Shares per Post"
                      secondary="355"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Best Posting Time"
                      secondary="2:00 PM - 4:00 PM"
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={4}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Language color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Top Performing Platform"
                      secondary="Instagram"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <BarChart color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Content Performance"
                      secondary="Videos: 65% | Images: 35%"
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SocialMediaAnalyticsTemplate;
