import React from 'react';
import BaseWidget from './BaseWidget';
import { Typography } from '@mui/material';

const PieChartWidget = () => {
  return (
    <BaseWidget title="Pie Chart" onRefresh={() => {}} onSettings={() => {}}>
      <Typography>Pie Chart Widget Content</Typography>
    </BaseWidget>
  );
};

export default PieChartWidget;
