import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  CircularProgress,
  Autocomplete,
  InputAdornment,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  WbSunny as SunIcon,
  Cloud as CloudIcon,
  Opacity as RainIcon,
  AcUnit as SnowIcon,
  Thunderstorm as StormIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import BaseWidget from './BaseWidget';
import { weatherService } from '../../services/weatherService';

const WEATHER_ICONS = {
  '01d': <SunIcon sx={{ fontSize: 64, color: '#FFD700' }} />, // clear sky day
  '01n': <SunIcon sx={{ fontSize: 64, color: '#C0C0C0' }} />, // clear sky night
  '02d': <CloudIcon sx={{ fontSize: 64, color: '#A9A9A9' }} />, // few clouds
  '02n': <CloudIcon sx={{ fontSize: 64, color: '#808080' }} />, // few clouds night
  '03d': <CloudIcon sx={{ fontSize: 64, color: '#808080' }} />, // scattered clouds
  '03n': <CloudIcon sx={{ fontSize: 64, color: '#696969' }} />, // scattered clouds night
  '04d': <CloudIcon sx={{ fontSize: 64, color: '#696969' }} />, // broken clouds
  '04n': <CloudIcon sx={{ fontSize: 64, color: '#4F4F4F' }} />, // broken clouds night
  '09d': <RainIcon sx={{ fontSize: 64, color: '#4682B4' }} />, // shower rain
  '09n': <RainIcon sx={{ fontSize: 64, color: '#4682B4' }} />, // shower rain night
  '10d': <RainIcon sx={{ fontSize: 64, color: '#4169E1' }} />, // rain
  '10n': <RainIcon sx={{ fontSize: 64, color: '#4169E1' }} />, // rain night
  '11d': <StormIcon sx={{ fontSize: 64, color: '#483D8B' }} />, // thunderstorm
  '11n': <StormIcon sx={{ fontSize: 64, color: '#483D8B' }} />, // thunderstorm night
  '13d': <SnowIcon sx={{ fontSize: 64, color: '#B0E0E6' }} />, // snow
  '13n': <SnowIcon sx={{ fontSize: 64, color: '#B0E0E6' }} />, // snow night
  'default': <CloudIcon sx={{ fontSize: 64, color: '#808080' }} />
};

const WeatherSettings = ({ settings, onSettingsChange }) => {
  const [searchInput, setSearchInput] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value) => {
    if (!value) {
      setOptions([]);
      return;
    }
    
    setLoading(true);
    try {
      const cities = await weatherService.searchCities(value);
      setOptions(cities);
    } catch (error) {
      console.error('Error searching cities:', error);
      setOptions([]);
    }
    setLoading(false);
  };

  return (
    <Autocomplete
      value={settings.city}
      onChange={(event, newValue) => {
        onSettingsChange({ city: newValue });
      }}
      filterOptions={(x) => x}
      options={options}
      loading={loading}
      onInputChange={(event, value) => {
        setSearchInput(value);
        handleSearch(value);
      }}
      getOptionLabel={(option) => option.label || ''}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search city"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <LocationIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

const WeatherWidget = ({ onRemove, onSettingsChange, settings }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchWeather = async () => {
    if (!settings?.city?.lat || !settings?.city?.lon) return;

    setLoading(true);
    setError(null);
    try {
      const data = await weatherService.getWeather(settings.city.lat, settings.city.lon);
      setWeather(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching weather:', error);
      setError('Failed to load weather data');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (settings?.city) {
      fetchWeather();
      // Set up auto-refresh every 10 minutes
      const interval = setInterval(fetchWeather, 600000);
      return () => clearInterval(interval);
    }
  }, [settings?.city]);

  const renderContent = () => {
    if (!settings?.city) {
      return (
        <Box 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2,
            color: 'text.secondary'
          }}
        >
          <LocationIcon sx={{ fontSize: 48 }} />
          <Typography variant="body1">
            Select a city in the settings
          </Typography>
        </Box>
      );
    }

    if (loading && !weather) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ textAlign: 'center', color: 'error.main', p: 2 }}>
          <Typography>{error}</Typography>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchWeather}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      );
    }

    if (!weather) return null;

    const weatherIcon = WEATHER_ICONS[weather.weather[0].icon] || WEATHER_ICONS.default;

    return (
      <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {weatherIcon}
          <Typography variant="h3" sx={{ mt: 2 }}>
            {Math.round(weather.main.temp)}°C
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            {weather.weather[0].description}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Feels like {Math.round(weather.main.feels_like)}°C
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Humidity</Typography>
            <Typography variant="body1">{weather.main.humidity}%</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Wind</Typography>
            <Typography variant="body1">{Math.round(weather.wind.speed)} m/s</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Pressure</Typography>
            <Typography variant="body1">{weather.main.pressure} hPa</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={fetchWeather}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  };

  return (
    <BaseWidget
      title={settings?.city ? `Weather in ${settings.city.name}` : 'Weather'}
      onRemove={onRemove}
      onSettingsChange={onSettingsChange}
      settings={settings}
      SettingsComponent={WeatherSettings}
    >
      {renderContent()}
    </BaseWidget>
  );
};

export default WeatherWidget;
