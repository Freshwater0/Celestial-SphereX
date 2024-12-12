import React from 'react';
import BaseWidget from './BaseWidget';
import { Typography } from '@mui/material';

const BarChartWidget = () => {
  return (
    <BaseWidget title="Bar Chart" onRefresh={() => {}} onSettings={() => {}}>
      <Typography>Bar Chart Widget Content</Typography>
    </BaseWidget>
  );
};

export default BarChartWidget;
