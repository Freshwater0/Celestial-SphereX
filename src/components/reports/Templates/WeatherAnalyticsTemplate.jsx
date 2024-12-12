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
} from '@mui/material';
import {
  WbSunny,
  Cloud,
  Opacity,
  Air,
  Speed,
  Thermostat,
  Navigation,
  Schedule,
  LocationOn,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Bar,
} from 'recharts';

const WeatherAnalyticsTemplate = ({ data = {} }) => {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('24H');

  // Sample weather data
  const hourlyForecast = [
    { time: '00:00', temp: 18, humidity: 65, windSpeed: 12, precipitation: 0 },
    { time: '04:00', temp: 16, humidity: 70, windSpeed: 10, precipitation: 0.2 },
    { time: '08:00', temp: 20, humidity: 60, windSpeed: 15, precipitation: 0 },
    { time: '12:00', temp: 25, humidity: 55, windSpeed: 18, precipitation: 0 },
    { time: '16:00', temp: 24, humidity: 58, windSpeed: 14, precipitation: 0.1 },
    { time: '20:00', temp: 21, humidity: 62, windSpeed: 11, precipitation: 0 },
  ];

  // Current conditions
  const currentConditions = {
    temperature: 22,
    humidity: 58,
    windSpeed: 14,
    windDirection: 'NE',
    pressure: 1015,
    visibility: 10,
    uvIndex: 6,
    airQuality: 45,
  };

  // Daily forecast
  const dailyForecast = [
    { day: 'Mon', high: 25, low: 16, condition: 'Sunny' },
    { day: 'Tue', high: 24, low: 15, condition: 'Partly Cloudy' },
    { day: 'Wed', high: 23, low: 17, condition: 'Cloudy' },
    { day: 'Thu', high: 26, low: 18, condition: 'Sunny' },
    { day: 'Fri', high: 22, low: 16, condition: 'Rain' },
  ];

  const renderMetricCard = (title, value, unit, icon, color) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {value}{unit}
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
            <Box>
              <Typography variant="h4">Weather Analytics</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                <LocationOn sx={{ verticalAlign: 'middle', mr: 1 }} />
                San Francisco, CA
              </Typography>
            </Box>
            <ButtonGroup variant="outlined" size="small">
              {['24H', '7D', '30D', 'Season', 'Year'].map((period) => (
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

        {/* Current Conditions */}
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('Temperature', currentConditions.temperature, '°C', <Thermostat />, 'warning')}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('Humidity', currentConditions.humidity, '%', <Opacity />, 'info')}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('Wind Speed', currentConditions.windSpeed, 'km/h', <Air />, 'success')}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard('Air Quality', currentConditions.airQuality, '', <Speed />, 'error')}
        </Grid>

        {/* Temperature and Precipitation Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Temperature & Precipitation
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={hourlyForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="temp"
                    name="Temperature (°C)"
                    stroke={theme.palette.warning.main}
                    fill={theme.palette.warning.light}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="precipitation"
                    name="Precipitation (mm)"
                    fill={theme.palette.info.main}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Weather Conditions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Daily Forecast
            </Typography>
            <Grid container spacing={2}>
              {dailyForecast.map((day) => (
                <Grid item xs={12} sm={6} md={2.4} key={day.day}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" align="center">
                        {day.day}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        {day.condition === 'Sunny' && <WbSunny sx={{ fontSize: 40, color: 'warning.main' }} />}
                        {day.condition === 'Cloudy' && <Cloud sx={{ fontSize: 40, color: 'action.disabled' }} />}
                        {day.condition === 'Partly Cloudy' && <Cloud sx={{ fontSize: 40, color: 'info.main' }} />}
                        {day.condition === 'Rain' && <Opacity sx={{ fontSize: 40, color: 'info.main' }} />}
                      </Box>
                      <Typography align="center">
                        {day.high}° / {day.low}°
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Weather Metrics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Weather Metrics
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={[
                  { metric: 'Temperature', value: (currentConditions.temperature / 50) * 100 },
                  { metric: 'Humidity', value: currentConditions.humidity },
                  { metric: 'Wind', value: (currentConditions.windSpeed / 30) * 100 },
                  { metric: 'Visibility', value: (currentConditions.visibility / 10) * 100 },
                  { metric: 'UV Index', value: (currentConditions.uvIndex / 10) * 100 },
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Weather"
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

        {/* Additional Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detailed Conditions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Speed />
                    </ListItemIcon>
                    <ListItemText
                      primary="Pressure"
                      secondary={`${currentConditions.pressure} hPa`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Navigation />
                    </ListItemIcon>
                    <ListItemText
                      primary="Wind Direction"
                      secondary={currentConditions.windDirection}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <WbSunny />
                    </ListItemIcon>
                    <ListItemText
                      primary="UV Index"
                      secondary={currentConditions.uvIndex}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Schedule />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Updated"
                      secondary="10 minutes ago"
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

export default WeatherAnalyticsTemplate;
