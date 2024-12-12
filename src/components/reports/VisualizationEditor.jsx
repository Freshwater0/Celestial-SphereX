import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Paper, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon
} from '@mui/icons-material';
import DataVisualization from './DataVisualization';

const VisualizationEditor = ({ 
  template, 
  visualizations, 
  onChange 
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentVisualization, setCurrentVisualization] = useState(null);

  // Derive available chart types from template
  const getAvailableChartTypes = () => {
    return template?.visuals?.map(visual => visual.type) || 
      ['line_chart', 'bar_chart', 'pie_chart'];
  };

  const addVisualization = () => {
    const availableChartTypes = getAvailableChartTypes();
    const newVisualization = {
      id: `viz-${Date.now()}`,
      type: availableChartTypes[0],
      title: 'New Visualization',
      metrics: [],
      data: []
    };
    onChange([...visualizations, newVisualization]);
  };

  const removeVisualization = (id) => {
    onChange(visualizations.filter(viz => viz.id !== id));
  };

  const updateVisualization = (id, updates) => {
    onChange(visualizations.map(viz => 
      viz.id === id ? { ...viz, ...updates } : viz
    ));
  };

  const moveVisualization = (index, direction) => {
    const newVisualizations = [...visualizations];
    const [removed] = newVisualizations.splice(index, 1);
    newVisualizations.splice(
      direction === 'up' ? index - 1 : index + 1, 
      0, 
      removed
    );
    onChange(newVisualizations);
  };

  const openEditDialog = (visualization) => {
    setCurrentVisualization(visualization);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setCurrentVisualization(null);
  };

  const handleVisualizationTypeChange = (e) => {
    setCurrentVisualization({
      ...currentVisualization,
      type: e.target.value
    });
  };

  const saveVisualization = () => {
    if (currentVisualization) {
      updateVisualization(currentVisualization.id, currentVisualization);
      handleEditDialogClose();
    }
  };

  const handleMetricSelection = (metric) => {
    const currentMetrics = currentVisualization.metrics || [];
    const updatedMetrics = currentMetrics.includes(metric)
      ? currentMetrics.filter(m => m !== metric)
      : [...currentMetrics, metric];

    setCurrentVisualization({
      ...currentVisualization,
      metrics: updatedMetrics
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Customize Visualizations for {template?.name || 'Report'}
      </Typography>
      
      <Button 
        variant="contained" 
        startIcon={<AddIcon />} 
        onClick={addVisualization}
        sx={{ mb: 3 }}
        disabled={!template}
      >
        Add Visualization
      </Button>

      <Grid container spacing={3}>
        {visualizations.map((viz, index) => (
          <Grid item xs={12} key={viz.id}>
            <Paper elevation={3} sx={{ p: 2, position: 'relative' }}>
              <Box sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                display: 'flex' 
              }}>
                <IconButton 
                  onClick={() => openEditDialog(viz)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  color="error"
                  onClick={() => removeVisualization(viz.id)}
                >
                  <DeleteIcon />
                </IconButton>
                {index > 0 && (
                  <IconButton 
                    onClick={() => moveVisualization(index, 'up')}
                    sx={{ ml: 1 }}
                  >
                    <UpIcon />
                  </IconButton>
                )}
                {index < visualizations.length - 1 && (
                  <IconButton 
                    onClick={() => moveVisualization(index, 'down')}
                  >
                    <DownIcon />
                  </IconButton>
                )}
              </Box>

              <DataVisualization 
                data={viz.data}
                type={viz.type}
                metrics={viz.metrics}
                title={viz.title}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={editDialogOpen} 
        onClose={handleEditDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Visualization</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={currentVisualization?.type || getAvailableChartTypes()[0]}
                onChange={handleVisualizationTypeChange}
              >
                {getAvailableChartTypes().map((chartType) => (
                  <MenuItem key={chartType} value={chartType}>
                    {chartType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {template && template.fields && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Select Metrics
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {template.fields.map((field) => (
                    <Chip
                      key={field.key}
                      label={field.label}
                      color={
                        currentVisualization?.metrics?.includes(field.key) 
                          ? 'primary' 
                          : 'default'
                      }
                      onClick={() => handleMetricSelection(field.key)}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={saveVisualization}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VisualizationEditor;
