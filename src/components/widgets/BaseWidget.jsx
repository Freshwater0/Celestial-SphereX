import React, { useState } from 'react';
import { 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { WidgetContainer, WidgetHeader, WidgetTitle, WidgetContent } from './WidgetStyles';

const BaseWidget = ({ 
  title, 
  children, 
  onRemove,
  onSettingsChange,
  settings,
  SettingsComponent 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsClick = () => {
    handleMenuClose();
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteDialogOpen(false);
    if (onRemove) onRemove();
  };

  return (
    <WidgetContainer>
      <WidgetHeader>
        <WidgetTitle>{title}</WidgetTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Widget options">
            <IconButton 
              size="small" 
              onClick={handleMenuClick}
              aria-label="widget options"
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {SettingsComponent && (
            <MenuItem onClick={handleSettingsClick}>
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">Settings</Typography>
            </MenuItem>
          )}
          <MenuItem onClick={handleDeleteClick}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">Remove</Typography>
          </MenuItem>
        </Menu>
      </WidgetHeader>

      <WidgetContent>
        {children}
      </WidgetContent>

      {/* Settings Dialog */}
      {SettingsComponent && (
        <Dialog 
          open={isSettingsOpen} 
          onClose={handleSettingsClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ 
            m: 0, 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6">Widget Settings</Typography>
            <IconButton
              aria-label="close"
              onClick={handleSettingsClose}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ p: 1 }}>
              <SettingsComponent
                settings={settings}
                onSettingsChange={onSettingsChange}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSettingsClose}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Remove Widget</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove this widget?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetContainer>
  );
};

export default BaseWidget;
