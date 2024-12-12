import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  Error,
  Info,
  CheckCircle,
} from '@mui/icons-material';
import {
  calculateBasicStats,
  detectAnomalies,
  analyzeTrends,
  checkThresholdViolation,
} from '../../utils/analytics';

const InsightsPanel = ({ data, field, rules, timeframe }) => {
  const [insights, setInsights] = useState({
    stats: null,
    anomalies: [],
    trends: null,
    violations: [],
  });

  useEffect(() => {
    if (!data || !field) return;

    // Calculate all insights
    const stats = calculateBasicStats(data, field);
    const anomalies = detectAnomalies(data, field);
    const trends = analyzeTrends(data, field);
    const violations = data.map(item => 
      checkThresholdViolation(item[field], rules)
    ).flat();

    setInsights({ stats, anomalies, trends, violations });
  }, [data, field, rules]);

  const renderTrendIcon = (trend) => {
    switch (trend) {
      case 'upward':
        return <TrendingUp color="success" />;
      case 'downward':
        return <TrendingDown color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const renderSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <Error color="error" />;
      case 'medium':
        return <Warning color="warning" />;
      case 'low':
        return <Info color="info" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Insights & Analysis
        </Typography>
        
        {/* Statistical Summary */}
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Statistical Summary
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {insights.stats && (
              <>
                <Chip
                  label={`Average: ${insights.stats.mean.toFixed(2)}`}
                  variant="outlined"
                />
                <Chip
                  label={`Max: ${insights.stats.max.toFixed(2)}`}
                  variant="outlined"
                />
                <Chip
                  label={`Min: ${insights.stats.min.toFixed(2)}`}
                  variant="outlined"
                />
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Trend Analysis */}
        {insights.trends && (
          <Box mb={2}>
            <Typography variant="subtitle1" gutterBottom>
              Trend Analysis
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  {renderTrendIcon(insights.trends.trend)}
                </ListItemIcon>
                <ListItemText
                  primary={`Overall Trend: ${insights.trends.trend}`}
                  secondary={`Momentum: ${insights.trends.momentum.toFixed(2)}%`}
                />
              </ListItem>
            </List>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Alerts & Violations */}
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Alerts & Violations
          </Typography>
          <List dense>
            {insights.violations.map((violation, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {renderSeverityIcon(violation.severity)}
                </ListItemIcon>
                <ListItemText
                  primary={violation.message}
                  secondary={`Threshold: ${violation.threshold}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Anomalies */}
        {insights.anomalies.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Detected Anomalies
            </Typography>
            <List dense>
              {insights.anomalies.map((anomaly, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Anomaly detected: ${anomaly[field]}`}
                    secondary={`Deviation: ${(
                      Math.abs(anomaly[field] - insights.stats.mean) /
                      insights.stats.stdDev
                    ).toFixed(2)} σ`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;
