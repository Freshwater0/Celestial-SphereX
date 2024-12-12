import React, { useState } from 'react';
import { Modal, Box, Button, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

const ChartModal = ({ open, onClose, data }) => {
  const [chartType, setChartType] = useState('bar');

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const chartData = {
    labels: data.map((_, index) => `Row ${index + 1}`),
    datasets: [
      {
        label: 'Dataset 1',
        data: data.map(row => row[data[0].field]),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <Line data={chartData} />;
      case 'pie':
        return <Pie data={chartData} />;
      case 'bar':
      default:
        return <Bar data={chartData} />;
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6">Select Chart Type</Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Chart Type</InputLabel>
          <Select value={chartType} onChange={handleChartTypeChange}>
            <MenuItem value="bar">Bar</MenuItem>
            <MenuItem value="line">Line</MenuItem>
            <MenuItem value="pie">Pie</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ mt: 4 }}>{renderChart()}</Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ChartModal;
