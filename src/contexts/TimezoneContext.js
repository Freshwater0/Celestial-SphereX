import React, { createContext, useContext, useState, useEffect } from 'react';
import moment from 'moment-timezone';

const TimezoneContext = createContext();

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};

export const TimezoneProvider = ({ children }) => {
  // Initialize with system timezone or saved preference
  const [currentTimezone, setCurrentTimezone] = useState(
    localStorage.getItem('userTimezone') || moment.tz.guess()
  );

  // Get all IANA timezone names and create formatted labels
  const allTimezones = moment.tz.names().map(tz => {
    const now = moment().tz(tz);
    const offset = now.format('Z');
    const label = `${tz.replace(/_/g, ' ')} (${offset})`;
    
    return {
      value: tz,
      label,
      offset: now.utcOffset()
    };
  });

  // Group timezones by continent/region
  const groupedTimezones = allTimezones.reduce((acc, tz) => {
    const [continent] = tz.value.split('/');
    if (!acc[continent]) {
      acc[continent] = [];
    }
    acc[continent].push(tz);
    return acc;
  }, {});

  // Sort timezones within each group by offset
  Object.keys(groupedTimezones).forEach(continent => {
    groupedTimezones[continent].sort((a, b) => a.offset - b.offset);
  });

  const changeTimezone = (timezone) => {
    setCurrentTimezone(timezone);
    localStorage.setItem('userTimezone', timezone);
  };

  const getCurrentTime = () => {
    return moment().tz(currentTimezone);
  };

  const getTimezoneOffset = () => {
    return moment().tz(currentTimezone).format('Z');
  };

  const getTimezoneAbbr = () => {
    return moment().tz(currentTimezone).zoneAbbr();
  };

  const formatInTimezone = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    return moment(date).tz(currentTimezone).format(format);
  };

  useEffect(() => {
    // Update timezone if system timezone changes and no saved preference exists
    const systemTimezone = moment.tz.guess();
    const savedTimezone = localStorage.getItem('userTimezone');
    
    if (!savedTimezone && systemTimezone !== currentTimezone) {
      changeTimezone(systemTimezone);
    }
  }, [currentTimezone]);

  const value = {
    currentTimezone,
    changeTimezone,
    getCurrentTime,
    getTimezoneOffset,
    getTimezoneAbbr,
    formatInTimezone,
    groupedTimezones,
    allTimezones
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
};
