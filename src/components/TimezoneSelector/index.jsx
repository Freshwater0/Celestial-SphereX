import React, { useState, useEffect } from 'react';
import { FormControl, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

const TimezoneSelector = () => {
  const { t } = useTranslation();
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [timezones, setTimezones] = useState([]);

  useEffect(() => {
    // Get all available timezones
    const allTimezones = Intl.supportedValuesOf('timeZone');
    setTimezones(allTimezones);
  }, []);

  const handleChange = (event) => {
    const newTimezone = event.target.value;
    setTimezone(newTimezone);
    // Save to localStorage or your state management system
    localStorage.setItem('userTimezone', newTimezone);
  };

  const formatTimezone = (tz) => {
    try {
      const date = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${tz} (${formatter.format(date)})`;
    } catch (e) {
      return tz;
    }
  };

  return (
    <FormControl fullWidth size="small">
      <Select
        value={timezone}
        onChange={handleChange}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
        }}
      >
        {timezones.map((tz) => (
          <MenuItem key={tz} value={tz}>
            {formatTimezone(tz)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TimezoneSelector;
