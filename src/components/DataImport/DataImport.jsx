import React, { useState, useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const DataImport = ({ open, onClose, onImport }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  const handleImport = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setProgress(0);

    try {
      const file = files[0];
      const extension = file.name.split('.').pop().toLowerCase();
      let data = [];

      if (extension === 'csv') {
        data = await new Promise((resolve) => {
          Papa.parse(file, {
            complete: (results) => resolve(results.data),
            header: true,
          });
        });
      } else if (['xlsx', 'xls'].includes(extension)) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(firstSheet);
      }

      // Process the data in chunks to show progress
      const chunkSize = Math.ceil(data.length / 100);
      const processedData = [];

      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        processedData.push(...chunk);
        setProgress((i / data.length) * 100);
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      onImport(processedData);
      onClose();
    } catch (error) {
      console.error('Error importing file:', error);
    } finally {
      setLoading(false);
      setProgress(0);
      setFiles([]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Import Data
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            borderRadius: 1,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            mb: 2,
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon sx={{ fontSize: 48, color: 'action.active', mb: 1 }} />
          <Typography>
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag and drop files here, or click to select files'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported formats: CSV, XLSX, XLS
          </Typography>
        </Box>

        {files.length > 0 && (
          <List>
            {files.map((file) => (
              <ListItem key={file.name}>
                <ListItemIcon>
                  <FileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024).toFixed(2)} KB`}
                />
              </ListItem>
            ))}
          </List>
        )}

        {loading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Processing... {Math.round(progress)}%
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          disabled={files.length === 0 || loading}
          variant="contained"
          startIcon={<UploadIcon />}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataImport;
