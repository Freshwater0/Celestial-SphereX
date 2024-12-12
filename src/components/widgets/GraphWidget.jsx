import React from 'react';
import BaseWidget from './BaseWidget';
import { Typography } from '@mui/material';

const GraphWidget = () => {
  return (
    <BaseWidget title="Graph" onRefresh={() => {}} onSettings={() => {}}>
      <Typography>Graph Widget Content</Typography>
    </BaseWidget>
  );
};

export default GraphWidget;
