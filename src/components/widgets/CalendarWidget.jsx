import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Grid,
  Tooltip,
  Badge
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import BaseWidget from './BaseWidget';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarWidget = ({ id, onEdit, onDelete }) => {
  const [date, setDate] = useState(new Date());

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ p: 1 }} />);
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = 
        today.getDate() === day && 
        today.getMonth() === month && 
        today.getFullYear() === year;

      days.push(
        <Box
          key={day}
          sx={{
            p: 1,
            textAlign: 'center',
            ...(isToday && {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 1
            })
          }}
        >
          <Typography variant="body2">
            {day}
          </Typography>
        </Box>
      );
    }

    return days;
  };

  return (
    <BaseWidget
      id={id}
      title="Calendar"
      onDelete={onDelete}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={handlePrevMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6">
            {MONTHS[date.getMonth()]} {date.getFullYear()}
          </Typography>
          <IconButton onClick={handleNextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>

        <Grid container columns={7} sx={{ mb: 1 }}>
          {DAYS.map(day => (
            <Grid item xs={1} key={day}>
              <Typography
                variant="caption"
                align="center"
                sx={{ display: 'block', fontWeight: 'bold' }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        <Grid container columns={7}>
          {renderCalendarDays().map((day, index) => (
            <Grid item xs={1} key={index}>
              {day}
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Tooltip title="Settings">
            <IconButton onClick={onEdit} size="small">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </BaseWidget>
  );
};

export default CalendarWidget;
