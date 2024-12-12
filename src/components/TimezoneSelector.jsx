import React, { useState, useMemo } from 'react';
import { useTimezone } from '../contexts/TimezoneContext';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  ListSubheader,
  InputAdornment,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const TimezoneSelector = () => {
  const { t } = useTranslation();
  const {
    currentTimezone,
    changeTimezone,
    groupedTimezones,
    getCurrentTime,
    getTimezoneOffset,
    getTimezoneAbbr
  } = useTimezone();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter timezones based on search query
  const filteredTimezones = useMemo(() => {
    if (!searchQuery) return groupedTimezones;

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = {};

    Object.entries(groupedTimezones).forEach(([continent, zones]) => {
      const matchingZones = zones.filter(
        tz => tz.value.toLowerCase().includes(lowercaseQuery) ||
             tz.label.toLowerCase().includes(lowercaseQuery)
      );

      if (matchingZones.length > 0) {
        filtered[continent] = matchingZones;
      }
    });

    return filtered;
  }, [groupedTimezones, searchQuery]);

  const handleTimezoneChange = (e) => {
    changeTimezone(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const currentTime = getCurrentTime();
  const offset = getTimezoneOffset();
  const abbr = getTimezoneAbbr();

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip 
            label={currentTime.format('HH:mm')}
            color="primary"
            size="small"
          />
          <Chip 
            label={offset}
            color="success"
            size="small"
          />
          <Chip 
            label={abbr}
            color="info"
            size="small"
          />
        </Box>

        <TextField
          placeholder={t('settings.timezone.search')}
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />

        <FormControl size="small">
          <Select
            value={currentTimezone}
            onChange={handleTimezoneChange}
            sx={{ width: '100%' }}
          >
            {Object.entries(filteredTimezones).map(([continent, zones]) => [
              <ListSubheader key={continent}>
                {t(`settings.timezone.regions.${continent}`)}
              </ListSubheader>,
              zones.map(tz => (
                <MenuItem key={tz.value} value={tz.value}>
                  {tz.label}
                </MenuItem>
              ))
            ])}
          </Select>
        </FormControl>

        <Typography variant="caption" color="text.secondary">
          {t('settings.timezone.systemTime')}: {currentTime.format('LLLL')}
        </Typography>
      </Stack>
    </Box>
  );
};

export default TimezoneSelector;
