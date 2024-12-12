import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Calculate,
  Timeline,
  BarChart,
  Functions,
} from '@mui/icons-material';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`calculation-tabpanel-${index}`}
    aria-labelledby={`calculation-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

export const CalculationDialog = ({
  open,
  onClose,
  onCalculate,
  selectedCells,
  results,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleCalculate = (type) => {
    onCalculate(type, selectedCells);
  };

  const renderStatisticsResults = () => {
    const stats = results.statistics || {};
    return (
      <List>
        <ListItem>
          <ListItemText primary="Sum" secondary={stats.sum?.toFixed(2) || 'N/A'} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Average" secondary={stats.average?.toFixed(2) || 'N/A'} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Minimum" secondary={stats.min?.toFixed(2) || 'N/A'} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Maximum" secondary={stats.max?.toFixed(2) || 'N/A'} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Count" secondary={stats.count || 'N/A'} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Distinct Count" secondary={stats.distinctCount || 'N/A'} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Variance" secondary={stats.variance?.toFixed(2) || 'N/A'} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Standard Deviation" secondary={stats.stdDev?.toFixed(2) || 'N/A'} />
        </ListItem>
      </List>
    );
  };

  const renderTimeSeriesResults = () => {
    const timeSeries = results.timeSeries || {};
    return (
      <List>
        <ListItem>
          <ListItemText 
            primary="Trend" 
            secondary={timeSeries.trend ? `${(timeSeries.trend * 100).toFixed(2)}% per period` : 'N/A'} 
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Moving Average (3-period)" 
            secondary={
              timeSeries.movingAverage 
                ? timeSeries.movingAverage.map(v => v.toFixed(2)).join(', ')
                : 'N/A'
            } 
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Seasonality" 
            secondary={timeSeries.seasonality || 'No significant seasonality detected'} 
          />
        </ListItem>
      </List>
    );
  };

  const renderDistributionResults = () => {
    const distribution = results.distribution || {};
    return (
      <List>
        <ListItem>
          <ListItemText 
            primary="Quartiles" 
            secondary={
              distribution.quartiles 
                ? `Q1: ${distribution.quartiles[0]?.toFixed(2)}, Q2: ${distribution.quartiles[1]?.toFixed(2)}, Q3: ${distribution.quartiles[2]?.toFixed(2)}`
                : 'N/A'
            } 
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Outliers" 
            secondary={
              distribution.outliers 
                ? `${distribution.outliers.length} outliers detected`
                : 'No outliers detected'
            } 
          />
        </ListItem>
      </List>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Advanced Calculations</DialogTitle>
      <DialogContent>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab icon={<Calculate />} label="Statistics" />
          <Tab icon={<Timeline />} label="Time Series" />
          <Tab icon={<BarChart />} label="Distribution" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Statistics
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Functions />}
                  onClick={() => handleCalculate('statistics')}
                  disabled={!selectedCells.length}
                >
                  Calculate Statistics
                </Button>
                {renderStatisticsResults()}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Time Series Analysis
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Timeline />}
                  onClick={() => handleCalculate('timeSeries')}
                  disabled={!selectedCells.length}
                >
                  Analyze Time Series
                </Button>
                {renderTimeSeriesResults()}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Distribution Analysis
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<BarChart />}
                  onClick={() => handleCalculate('distribution')}
                  disabled={!selectedCells.length}
                >
                  Analyze Distribution
                </Button>
                {renderDistributionResults()}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
