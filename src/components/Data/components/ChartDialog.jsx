import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Box,
  Typography,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Timeline as LineChartIcon,
  PieChart as PieChartIcon,
  Scatter as ScatterIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: <BarChartIcon /> },
  { value: 'line', label: 'Line Chart', icon: <LineChartIcon /> },
  { value: 'pie', label: 'Pie Chart', icon: <PieChartIcon /> },
  { value: 'scatter', label: 'Scatter Plot', icon: <ScatterIcon /> },
];

const COLORS = [
  '#1976d2',
  '#2e7d32',
  '#d32f2f',
  '#ed6c02',
  '#9c27b0',
  '#0288d1',
];

export const ChartDialog = ({
  open,
  onClose,
  onGenerate,
  data,
  columns,
  chartData,
}) => {
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [aggregation, setAggregation] = useState('sum');
  const [showLegend, setShowLegend] = useState(true);
  const [stacked, setStacked] = useState(false);
  const [groupBy, setGroupBy] = useState('');
  const [chartTitle, setChartTitle] = useState('');

  useEffect(() => {
    if (columns.length > 0) {
      const numericColumns = columns.filter(col => col.type === 'number');
      const categoryColumns = columns.filter(col => col.type === 'string');
      
      if (categoryColumns.length > 0) {
        setXAxis(categoryColumns[0].field);
      }
      if (numericColumns.length > 0) {
        setYAxis(numericColumns[0].field);
      }
    }
  }, [columns]);

  const handleGenerate = () => {
    onGenerate({
      type: chartType,
      xAxis,
      yAxis,
      aggregation,
      showLegend,
      stacked,
      groupBy,
      title: chartTitle,
    });
  };

  const renderChart = () => {
    if (!chartData) return null;

    const ChartComponent = {
      bar: (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {stacked ? (
              <Bar dataKey="value" stackId="a">
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            ) : (
              <Bar dataKey="value" fill={COLORS[0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      ),
      line: (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLORS[0]}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
      pie: (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      ),
      scatter: (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" name={xAxis} />
            <YAxis dataKey="y" name={yAxis} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {showLegend && <Legend />}
            <Scatter
              name="Data Points"
              data={chartData}
              fill={COLORS[0]}
            />
          </ScatterChart>
        </ResponsiveContainer>
      ),
    }[chartType];

    return (
      <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom align="center">
          {chartTitle || 'Chart Preview'}
        </Typography>
        {ChartComponent}
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>Generate Chart</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Chart Type</InputLabel>
                <Select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  label="Chart Type"
                >
                  {CHART_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {type.icon}
                        <span>{type.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Chart Title"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>X-Axis</InputLabel>
                <Select
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  label="X-Axis"
                >
                  {columns.map((col) => (
                    <MenuItem key={col.field} value={col.field}>
                      {col.headerName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Y-Axis</InputLabel>
                <Select
                  value={yAxis}
                  onChange={(e) => setYAxis(e.target.value)}
                  label="Y-Axis"
                >
                  {columns
                    .filter((col) => col.type === 'number')
                    .map((col) => (
                      <MenuItem key={col.field} value={col.field}>
                        {col.headerName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {chartType !== 'scatter' && (
                <FormControl fullWidth>
                  <InputLabel>Aggregation</InputLabel>
                  <Select
                    value={aggregation}
                    onChange={(e) => setAggregation(e.target.value)}
                    label="Aggregation"
                  >
                    <MenuItem value="sum">Sum</MenuItem>
                    <MenuItem value="average">Average</MenuItem>
                    <MenuItem value="count">Count</MenuItem>
                    <MenuItem value="min">Minimum</MenuItem>
                    <MenuItem value="max">Maximum</MenuItem>
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth>
                <InputLabel>Group By</InputLabel>
                <Select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  label="Group By"
                >
                  <MenuItem value="">None</MenuItem>
                  {columns
                    .filter((col) => col.type === 'string')
                    .map((col) => (
                      <MenuItem key={col.field} value={col.field}>
                        {col.headerName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={showLegend}
                    onChange={(e) => setShowLegend(e.target.checked)}
                  />
                }
                label="Show Legend"
              />

              {chartType === 'bar' && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={stacked}
                      onChange={(e) => setStacked(e.target.checked)}
                    />
                  }
                  label="Stacked"
                />
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerate}
                disabled={!xAxis || !yAxis}
              >
                Generate Chart
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            {renderChart()}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
