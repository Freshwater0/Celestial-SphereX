import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Check,
  Error,
  Close,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

export const ImportDialog = ({ open, onClose, onImport }) => {
  const [files, setFiles] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles.map(file => ({
        file,
        status: 'pending', // pending, processing, success, error
        error: null,
      })));
    },
  });

  const handleImport = async () => {
    if (files.length === 0) return;

    setImporting(true);
    setProgress(0);

    // Simulate progress
    progressTimer.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressTimer.current);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await onImport(files.map(f => f.file));
      setProgress(100);
      setTimeout(() => {
        onClose();
        setFiles([]);
        setProgress(0);
      }, 500);
    } catch (error) {
      setFiles(files.map(f => ({
        ...f,
        status: 'error',
        error: error.message,
      })));
    } finally {
      setImporting(false);
      clearInterval(progressTimer.current);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import Data</DialogTitle>
      <DialogContent>
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'action.active', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drag & drop files here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to select files
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Supported formats: XLSX, XLS, CSV, JSON
          </Typography>
        </Box>

        {files.length > 0 && (
          <List sx={{ mt: 2 }}>
            {files.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton edge="end" onClick={() => removeFile(index)}>
                    <Close />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  {file.status === 'success' ? (
                    <Check color="success" />
                  ) : file.status === 'error' ? (
                    <Error color="error" />
                  ) : (
                    <Description />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={file.file.name}
                  secondary={file.error || `${(file.file.size / 1024).toFixed(1)} KB`}
                  secondaryTypographyProps={{
                    color: file.error ? 'error' : 'text.secondary',
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {importing && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Importing... {progress}%
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          disabled={files.length === 0 || importing}
          variant="contained"
          startIcon={importing ? <CircularProgress size={20} /> : null}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};
