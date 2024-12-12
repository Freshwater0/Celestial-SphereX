import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Radio,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
} from '@mui/material';
import {
  Description,
  TableChart,
  Code,
  PictureAsPdf,
} from '@mui/icons-material';

const exportFormats = [
  {
    id: 'xlsx',
    name: 'Excel Spreadsheet',
    extension: '.xlsx',
    icon: <TableChart />,
    description: 'Export as Microsoft Excel file with formatting preserved',
  },
  {
    id: 'csv',
    name: 'CSV File',
    extension: '.csv',
    icon: <Description />,
    description: 'Export as comma-separated values file',
  },
  {
    id: 'json',
    name: 'JSON File',
    extension: '.json',
    icon: <Code />,
    description: 'Export as structured JSON data',
  },
  {
    id: 'pdf',
    name: 'PDF Document',
    extension: '.pdf',
    icon: <PictureAsPdf />,
    description: 'Export as PDF document with table layout',
  },
];

export const ExportDialog = ({ open, onClose, onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState('xlsx');
  const [filename, setFilename] = useState('export');
  const [options, setOptions] = useState({
    includeHeaders: true,
    includeFormulas: true,
    preserveFormatting: true,
  });

  const handleExport = () => {
    onExport(selectedFormat, {
      filename: `${filename}${exportFormats.find(f => f.id === selectedFormat).extension}`,
      ...options,
    });
  };

  const handleOptionChange = (event) => {
    setOptions({
      ...options,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Data</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            margin="normal"
            helperText={`Will be saved as: ${filename}${exportFormats.find(f => f.id === selectedFormat).extension}`}
          />
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Choose Format
        </Typography>
        
        <List sx={{ mb: 3 }}>
          {exportFormats.map((format) => (
            <ListItem
              key={format.id}
              disablePadding
              secondaryAction={
                <Radio
                  checked={selectedFormat === format.id}
                  onChange={() => setSelectedFormat(format.id)}
                />
              }
            >
              <ListItemButton onClick={() => setSelectedFormat(format.id)}>
                <ListItemIcon>{format.icon}</ListItemIcon>
                <ListItemText
                  primary={format.name}
                  secondary={format.description}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Typography variant="subtitle1" gutterBottom>
          Export Options
        </Typography>

        <FormControl component="fieldset">
          <FormControlLabel
            control={
              <Checkbox
                checked={options.includeHeaders}
                onChange={handleOptionChange}
                name="includeHeaders"
              />
            }
            label="Include column headers"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.includeFormulas}
                onChange={handleOptionChange}
                name="includeFormulas"
              />
            }
            label="Include formulas (Excel only)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={options.preserveFormatting}
                onChange={handleOptionChange}
                name="preserveFormatting"
              />
            }
            label="Preserve formatting (Excel and PDF only)"
          />
        </FormControl>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={!filename}
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};
