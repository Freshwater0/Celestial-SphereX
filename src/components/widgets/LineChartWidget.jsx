import React from 'react';
import BaseWidget from './BaseWidget';
import { Typography } from '@mui/material';

const LineChartWidget = () => {
  return (
    <BaseWidget title="Line Chart" onRefresh={() => {}} onSettings={() => {}}>
      <Typography>Line Chart Widget Content</Typography>
    </BaseWidget>
  );
};

export default LineChartWidget;
