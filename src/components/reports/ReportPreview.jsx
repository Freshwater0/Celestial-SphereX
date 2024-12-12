import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Button,
  Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Chart } from 'react-chartjs-2';

const ReportPreview = ({ reportData, onSave, onDownload }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState(reportData);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('PDF');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = (format) => {
    onDownload(editedData, format);
    handleMenuClose();
  };

  const handleEdit = useCallback((sectionIndex, field, value) => {
    setEditedData(prev => {
      const newData = { ...prev };
      if (field === 'content') {
        newData.sections[sectionIndex].content = value;
      } else if (field === 'title') {
        newData.sections[sectionIndex].title = value;
      }
      return newData;
    });
  }, []);

  const handleSave = () => {
    onSave(editedData);
    setEditMode(false);
  };

  if (!reportData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="h6" color="textSecondary">
          No Report Data Available
        </Typography>
      </Box>
    );
  }

  const renderSection = (section, index) => {
    if (section.type === 'chart') {
      return (
        <Box height={300}>
          <Chart
            type={section.chartType}
            data={section.data}
            options={section.options}
          />
        </Box>
      );
    }

    if (editMode) {
      return (
        <TextField
          fullWidth
          multiline
          variant="outlined"
          value={section.content}
          onChange={(e) => handleEdit(index, 'content', e.target.value)}
        />
      );
    }

    return <Typography variant="body2">{section.content}</Typography>;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <VisibilityIcon sx={{ mr: 2 }} />
          <Typography variant="h6">Report Preview</Typography>
        </Box>
        <Box>
          <Tooltip title={editMode ? "Save Changes" : "Edit Report"}>
            <IconButton onClick={() => editMode ? handleSave() : setEditMode(true)}>
              {editMode ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Report">
            <IconButton onClick={handleMenuOpen}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDownload('PDF')}>Download as PDF</MenuItem>
        <MenuItem onClick={() => handleDownload('XLSX')}>Download as Excel</MenuItem>
      </Menu>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          {editMode ? (
            <TextField
              fullWidth
              label="Report Name"
              value={editedData.name || ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, name: e.target.value }))}
            />
          ) : (
            <Typography variant="subtitle1" color="textSecondary">
              Report Name: {editedData.name || 'Unnamed Report'}
            </Typography>
          )}
        </Grid>
        
        <Grid item xs={12}>
          {editMode ? (
            <TextField
              fullWidth
              multiline
              label="Description"
              value={editedData.description || ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, description: e.target.value }))}
            />
          ) : (
            <Typography variant="body2">
              Description: {editedData.description || 'No description provided'}
            </Typography>
          )}
        </Grid>
        
        {editedData.sections && editedData.sections.map((section, index) => (
          <Grid item xs={12} key={index}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              {editMode ? (
                <TextField
                  fullWidth
                  label="Section Title"
                  value={section.title}
                  onChange={(e) => handleEdit(index, 'title', e.target.value)}
                  sx={{ mb: 2 }}
                />
              ) : (
                <Typography variant="subtitle2">{section.title}</Typography>
              )}
              {renderSection(section, index)}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ReportPreview;
