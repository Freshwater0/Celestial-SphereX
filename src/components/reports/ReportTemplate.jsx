// Constants
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { TEMPLATE_TYPES, DEFAULT_TEMPLATES } from './constants';

const ReportTemplate = ({
  template,
  onSave,
  onShare,
  onDelete,
  onApply,
  isEditing = false,
  onCancel,
}) => {
  const [editedTemplate, setEditedTemplate] = useState(template);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setEditedTemplate(template);
    setIsModified(false);
  }, [template]);

  const handleTemplateUpdate = (field, value) => {
    const updatedTemplate = { 
      ...editedTemplate, 
      [field]: value 
    };
    setEditedTemplate(updatedTemplate);
    setIsModified(true);
  };

  const handleSectionAdd = (sectionType) => {
    const newSection = {
      type: sectionType,
      ...(sectionType === 'chart' && { 
        chartType: 'line', 
        dataSource: '', 
        metrics: [] 
      }),
      ...(sectionType === 'summary' && { metrics: [] }),
      ...(sectionType === 'table' && { columns: [] }),
      ...(sectionType === 'insights' && { rules: {} })
    };

    const updatedTemplate = {
      ...editedTemplate,
      sections: [...(editedTemplate.sections || []), newSection]
    };

    setEditedTemplate(updatedTemplate);
    setIsModified(true);
  };

  const handleSectionRemove = (index) => {
    const updatedSections = editedTemplate.sections.filter((_, i) => i !== index);
    const updatedTemplate = { 
      ...editedTemplate, 
      sections: updatedSections 
    };
    setEditedTemplate(updatedTemplate);
    setIsModified(true);
  };

  const handleSectionUpdate = (index, updatedSection) => {
    const updatedSections = [...editedTemplate.sections];
    updatedSections[index] = updatedSection;
    
    const updatedTemplate = { 
      ...editedTemplate, 
      sections: updatedSections 
    };
    
    setEditedTemplate(updatedTemplate);
    setIsModified(true);
  };

  const handleSubmit = () => {
    if (onSave) {
      onSave(editedTemplate);
      setIsModified(false);
    }
  };

  if (!isEditing) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6">{editedTemplate.name}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {editedTemplate.description}
          </Typography>
          
          {editedTemplate.sections?.map((section, index) => (
            <Box key={index} sx={{ mt: 2 }}>
              <Typography variant="body2">
                Section Type: {section.type}
              </Typography>
              {section.type === 'chart' && (
                <Typography variant="caption">
                  Chart: {section.chartType} | Source: {section.dataSource}
                </Typography>
              )}
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container spacing={2}>
          {/* Template Metadata */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Template Name"
              value={editedTemplate.name}
              onChange={(e) => handleTemplateUpdate('name', e.target.value)}
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={editedTemplate.description}
              onChange={(e) => handleTemplateUpdate('description', e.target.value)}
              variant="outlined"
              margin="normal"
              multiline
              rows={3}
            />
          </Grid>

          {/* Sections */}
          <Grid item xs={12}>
            <Typography variant="h6">Sections</Typography>
            {editedTemplate.sections?.map((section, index) => (
              <Card 
                key={index} 
                variant="outlined" 
                sx={{ mb: 2, p: 2 }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2 
                }}>
                  <Typography variant="subtitle1">
                    {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
                  </Typography>
                  <IconButton 
                    color="error" 
                    size="small"
                    onClick={() => handleSectionRemove(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                {/* Section-specific editing */}
                {section.type === 'chart' && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>Chart Type</InputLabel>
                        <Select
                          value={section.chartType}
                          onChange={(e) => handleSectionUpdate(index, {
                            ...section,
                            chartType: e.target.value
                          })}
                          label="Chart Type"
                        >
                          {['line', 'bar', 'pie', 'area'].map(type => (
                            <MenuItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Data Source"
                        value={section.dataSource}
                        onChange={(e) => handleSectionUpdate(index, {
                          ...section,
                          dataSource: e.target.value
                        })}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                )}
              </Card>
            ))}

            {/* Add Section Dropdown */}
            <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
              <InputLabel>Add Section</InputLabel>
              <Select
                label="Add Section"
                onChange={(e) => handleSectionAdd(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>Select Section Type</MenuItem>
                <MenuItem value="chart">Chart</MenuItem>
                <MenuItem value="summary">Summary</MenuItem>
                <MenuItem value="table">Table</MenuItem>
                <MenuItem value="insights">Insights</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
      
      <CardActions>
        <Button 
          startIcon={<SaveIcon />}
          variant="contained" 
          color="primary"
          onClick={handleSubmit}
          disabled={!isModified}
        >
          Save Template
        </Button>
        <Button 
          variant="outlined" 
          color="secondary"
          onClick={() => onCancel && onCancel()}
        >
          Cancel
        </Button>
      </CardActions>
    </Card>
  );
};

export { TEMPLATE_TYPES, DEFAULT_TEMPLATES };
export default ReportTemplate;
