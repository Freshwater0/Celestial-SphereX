import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  IconButton,
  Chip,
  Stack,
  Alert,
  Snackbar,
  Badge,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../contexts/ProfileContext';
import { useAuth } from '../../contexts/AuthContext';
import PageWrapper from '../../components/common/PageWrapper';

// Default profile data structure
const defaultProfileData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  position: '',
  company: '',
  location: '',
  bio: '',
  avatarUrl: '',
  skills: [],
  socialLinks: {
    linkedin: '',
    github: '',
    twitter: '',
  },
};

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profileData, loading, error, updateProfile, updateProfilePicture } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [editedData, setEditedData] = useState(defaultProfileData);
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize edited data when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setEditedData({ ...defaultProfileData, ...profileData });
    }
  }, [profileData]);

  const validateForm = () => {
    const errors = {};
    if (!editedData.firstName?.trim()) errors.firstName = t('profile.errors.firstNameRequired');
    if (!editedData.lastName?.trim()) errors.lastName = t('profile.errors.lastNameRequired');
    if (!editedData.email?.trim()) errors.email = t('profile.errors.emailRequired');
    if (editedData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedData.email)) {
      errors.email = t('profile.errors.emailInvalid');
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSnackbarMessage(t('profile.errors.validationFailed'));
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    try {
      const result = await updateProfile(editedData);
      if (result.success) {
        setSnackbarMessage(t('profile.saveSuccess'));
        setSnackbarSeverity('success');
        setIsEditing(false);
      } else {
        throw new Error(result.error || t('profile.saveFailed'));
      }
    } catch (err) {
      setSnackbarMessage(err.message);
      setSnackbarSeverity('error');
    }
    setShowSnackbar(true);
  };

  const handleCancel = () => {
    setEditedData(profileData || defaultProfileData);
    setIsEditing(false);
    setValidationErrors({});
    setSnackbarMessage(t('profile.cancelEdit'));
    setSnackbarSeverity('info');
    setShowSnackbar(true);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setSnackbarMessage(t('profile.errors.avatarTooLarge'));
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    try {
      const result = await updateProfilePicture(file);
      if (result.success) {
        setSnackbarMessage(t('profile.avatarUpdateSuccess'));
        setSnackbarSeverity('success');
      } else {
        throw new Error(result.error || t('profile.avatarUpdateFailed'));
      }
    } catch (err) {
      setSnackbarMessage(err.message);
      setSnackbarSeverity('error');
    }
    setShowSnackbar(true);
  };

  if (loading && !profileData) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !profileData) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        p={3}
      >
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              {t('common.retry')}
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {/* Profile Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Tooltip title={t('profile.updateAvatar')}>
                  <IconButton
                    component="label"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                    size="small"
                    disabled={!isEditing || loading}
                  >
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleAvatarUpload}
                    />
                    <PhotoCameraIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <Avatar
                src={editedData.avatarUrl}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {editedData.firstName?.[0]}{editedData.lastName?.[0]}
              </Avatar>
            </Badge>

            <Box sx={{ ml: 4, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                  {editedData.firstName} {editedData.lastName}
                </Typography>
                <IconButton
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  color={isEditing ? 'primary' : 'default'}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : isEditing ? (
                    <SaveIcon />
                  ) : (
                    <EditIcon />
                  )}
                </IconButton>
              </Box>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                <WorkIcon sx={{ fontSize: '1rem', mr: 1, verticalAlign: 'text-bottom' }} />
                {editedData.position} {editedData.company && `at ${editedData.company}`}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {editedData.skills?.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={2}>
                {editedData.socialLinks?.linkedin && (
                  <Tooltip title="LinkedIn">
                    <IconButton
                      href={editedData.socialLinks.linkedin}
                      target="_blank"
                      color="primary"
                      size="small"
                    >
                      <LinkedInIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {editedData.socialLinks?.github && (
                  <Tooltip title="GitHub">
                    <IconButton
                      href={editedData.socialLinks.github}
                      target="_blank"
                      color="primary"
                      size="small"
                    >
                      <GitHubIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {editedData.socialLinks?.twitter && (
                  <Tooltip title="Twitter">
                    <IconButton
                      href={editedData.socialLinks.twitter}
                      target="_blank"
                      color="primary"
                      size="small"
                    >
                      <TwitterIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Contact Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {t('profile.contactInfo')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{editedData.email}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{editedData.phone || t('profile.notProvided')}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{editedData.location || t('profile.notProvided')}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Profile Form */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                {t('profile.personalInfo')}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label={t('profile.firstName')}
                  name="firstName"
                  value={editedData.firstName || ''}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  margin="normal"
                  size="small"
                  error={!!validationErrors.firstName}
                  helperText={validationErrors.firstName}
                  required
                />
                <TextField
                  fullWidth
                  label={t('profile.lastName')}
                  name="lastName"
                  value={editedData.lastName || ''}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  margin="normal"
                  size="small"
                  error={!!validationErrors.lastName}
                  helperText={validationErrors.lastName}
                  required
                />
                <TextField
                  fullWidth
                  label={t('profile.email')}
                  name="email"
                  value={editedData.email || ''}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  margin="normal"
                  size="small"
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  required
                />
                <TextField
                  fullWidth
                  label={t('profile.phone')}
                  name="phone"
                  value={editedData.phone || ''}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  margin="normal"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                {t('profile.professionalInfo')}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label={t('profile.company')}
                  name="company"
                  value={editedData.company || ''}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  margin="normal"
                  size="small"
                />
                <TextField
                  fullWidth
                  label={t('profile.position')}
                  name="position"
                  value={editedData.position || ''}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  margin="normal"
                  size="small"
                />
                <TextField
                  fullWidth
                  label={t('profile.location')}
                  name="location"
                  value={editedData.location || ''}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  margin="normal"
                  size="small"
                />
                <TextField
                  fullWidth
                  label={t('profile.bio')}
                  name="bio"
                  value={editedData.bio || ''}
                  onChange={handleChange}
                  disabled={!isEditing || loading}
                  margin="normal"
                  size="small"
                  multiline
                  rows={4}
                />
              </Box>
            </Grid>
          </Grid>

          {isEditing && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                disabled={loading}
              >
                {t('profile.cancel')}
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
              >
                {t('profile.save')}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
};

export default Profile;
