import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  AREA: 'area',
};

const CHART_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#0088fe',
  '#00c49f',
  '#ffbb28',
  '#ff8042',
];

const DataVisualization = ({
  data,
  type = CHART_TYPES.LINE,
  metrics = [],
  title = '',
  height = 400,
  timeFormat = 'MMM dd, yyyy',
  customOptions = {},
}) => {
  const chartRef = useRef(null);
  const [selectedMetrics, setSelectedMetrics] = useState(metrics);

  const formatXAxis = (timestamp) => {
    return format(new Date(timestamp), timeFormat);
  };

  const renderTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card>
          <CardContent>
            <Typography variant="subtitle2">
              {format(new Date(label), 'PPpp')}
            </Typography>
            {payload.map((entry, index) => (
              <Typography
                key={index}
                variant="body2"
                style={{ color: entry.color }}
              >
                {`${entry.name}: ${entry.value.toLocaleString()}`}
              </Typography>
            ))}
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  const renderChart = () => {
    const ChartComponent = {
      [CHART_TYPES.LINE]: LineChart,
      [CHART_TYPES.BAR]: BarChart,
      [CHART_TYPES.PIE]: PieChart,
      [CHART_TYPES.AREA]: AreaChart,
    }[type];

    const DataComponent = {
      [CHART_TYPES.LINE]: Line,
      [CHART_TYPES.BAR]: Bar,
      [CHART_TYPES.PIE]: Pie,
      [CHART_TYPES.AREA]: Area,
    }[type];

    if (type === CHART_TYPES.PIE) {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart ref={chartRef}>
            <Pie
              data={data}
              dataKey={selectedMetrics[0]}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent
          ref={chartRef}
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            {...customOptions.xAxis}
          />
          <YAxis {...customOptions.yAxis} />
          <Tooltip content={renderTooltip} />
          <Legend />
          {selectedMetrics.map((metric, index) => (
            <DataComponent
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              {...customOptions.dataComponent}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
          </Grid>
          <Grid item>
            <FormControl size="small">
              <InputLabel>Metrics</InputLabel>
              <Select
                multiple
                value={selectedMetrics}
                onChange={(e) => setSelectedMetrics(e.target.value)}
                style={{ minWidth: 200 }}
                renderValue={(selected) => selected.join(', ')}
              >
                {metrics.map((metric) => (
                  <MenuItem key={metric} value={metric}>
                    {metric}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box mt={2}>{renderChart()}</Box>
      </CardContent>
    </Card>
  );
};

export default DataVisualization;
