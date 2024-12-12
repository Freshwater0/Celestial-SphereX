import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

const ProfileDialog = ({ open, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || '',
    avatar: user.avatar || null,
    preferences: {
      language: user.preferences?.language || 'en',
      notifications: user.preferences?.notifications || true,
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form data when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        avatar: user.avatar || null,
        preferences: {
          language: user.preferences?.language || 'en',
          notifications: user.preferences?.notifications || true,
        }
      });
      setError('');
      setSuccess(false);
    }
  }, [open, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    // Clear any previous error
    if (error) {
      setError('');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('Invalid email format');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    setError('');
    setSuccess(false);

    if (validateForm()) {
      try {
        // Prepare the updated profile data
        const updatedProfile = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          avatar: formData.avatar
        };
        
        // Call the onSave callback with the updated data
        onSave(updatedProfile);
        
        // Show success message
        setSuccess(true);
        
        // Close dialog after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (error) {
        console.error('Profile update error:', error);
        setError('Failed to save profile changes. Please try again.');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully!
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={formData.avatar}
              sx={{ width: 100, height: 100, mb: 1 }}
            >
              {!formData.avatar && formData.name.charAt(0)}
            </Avatar>
            <input
              accept="image/*"
              type="file"
              id="avatar-upload"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="avatar-upload">
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
              >
                <PhotoCameraIcon sx={{ color: 'white' }} />
              </IconButton>
            </label>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Click the camera icon to change profile picture
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled
          />
          <TextField
            fullWidth
            label="Language"
            name="language"
            value={formData.preferences.language}
            onChange={(e) => setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, language: e.target.value } }))}
          />
          <TextField
            fullWidth
            label="Notifications"
            name="notifications"
            type="checkbox"
            checked={formData.preferences.notifications}
            onChange={(e) => setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, notifications: e.target.checked } }))}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDialog;
