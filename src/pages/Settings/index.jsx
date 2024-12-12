import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Button,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListSubheader,
  ButtonGroup,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Campaign as CampaignIcon,
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import TimezoneSelector from '../../components/TimezoneSelector';
import PageWrapper from '../../components/common/PageWrapper';
import BackButton from '../../components/common/BackButton';

const Settings = () => {
  const { t } = useTranslation();
  const { languages, currentLanguage, changeLanguage } = useLanguage();
  const { mode, toggleTheme } = useTheme();
  const { user, updateUserSettings } = useAuth();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);

  // Fetch user settings from backend
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await axios.get('/api/users/settings');
        const userSettings = response.data;
        
        // Initialize settings with backend data or defaults
        setSettings({
          language: userSettings.language || currentLanguage,
          darkMode: userSettings.darkMode || mode === 'dark',
          emailNotifications: userSettings.emailNotifications ?? true,
          pushNotifications: userSettings.pushNotifications ?? true,
          smsNotifications: userSettings.smsNotifications ?? false,
          marketingEmails: userSettings.marketingEmails ?? false,
          twoFactorAuth: userSettings.twoFactorAuth ?? false,
          dataSharing: userSettings.dataSharing ?? true,
          activityLog: userSettings.activityLog ?? true,
          timezone: userSettings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        // Sync theme and language with saved settings
        if (userSettings.darkMode !== (mode === 'dark')) {
          toggleTheme();
        }
        if (userSettings.language && userSettings.language !== currentLanguage) {
          changeLanguage(userSettings.language);
        }
      } catch (error) {
        console.error('Failed to fetch user settings:', error);
        // Fall back to localStorage if backend fetch fails
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        } else {
          setSettings({
            language: currentLanguage,
            darkMode: mode === 'dark',
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            marketingEmails: false,
            twoFactorAuth: false,
            dataSharing: true,
            activityLog: true,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, [currentLanguage, mode, toggleTheme, changeLanguage]);

  // Save settings to localStorage as backup
  useEffect(() => {
    if (settings) {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    }
  }, [settings]);

  const handleThemeChange = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    toggleTheme();
    
    try {
      await axios.patch('/api/users/settings', {
        darkMode: newMode === 'dark'
      });
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      setShowErrorAlert(true);
    }
  };

  const handleLanguageChange = async (event) => {
    const newLanguage = event.target.value;
    
    try {
      await axios.patch('/api/users/settings', {
        language: newLanguage
      });
      
      setSettings(prev => ({
        ...prev,
        language: newLanguage
      }));
      changeLanguage(newLanguage);
      localStorage.setItem('i18nextLng', newLanguage);
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Failed to save language preference:', error);
      setShowErrorAlert(true);
    }
  };

  const handleChange = async (event) => {
    const { name, value, checked } = event.target;
    const newValue = value !== undefined ? value : checked;

    try {
      await axios.patch('/api/users/settings', {
        [name]: newValue
      });

      setSettings(prev => ({
        ...prev,
        [name]: newValue
      }));
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Failed to save setting:', error);
      setShowErrorAlert(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/users/settings', settings);
      setShowSuccessAlert(true);
      
      // Update user context if needed
      if (updateUserSettings) {
        updateUserSettings(settings);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setShowErrorAlert(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <PageWrapper>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <BackButton />
          <Typography variant="h4" component="h1" gutterBottom>
            {t('settings.title')}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {t('settings.description')}
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('settings.appearance.title')}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={mode === 'dark'}
                onChange={handleThemeChange}
                name="darkMode"
              />
            }
            label={t('settings.appearance.theme.title')}
          />

          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="language-select-label">
                {t('settings.appearance.language.title')}
              </InputLabel>
              <Select
                labelId="language-select-label"
                value={settings.language}
                label={t('settings.appearance.language.title')}
                onChange={handleLanguageChange}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Notification Settings */}
          <Grid item xs={12}>
            <Paper>
              <List>
                <ListSubheader>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationsIcon sx={{ mr: 1 }} />
                    {t('settings.notifications.title')}
                  </Box>
                </ListSubheader>

                <ListItem>
                  <ListItemText
                    primary={t('settings.notifications.email.title')}
                    secondary={t('settings.notifications.email.description')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.emailNotifications}
                      onChange={handleChange}
                      name="emailNotifications"
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary={t('settings.notifications.push.title')}
                    secondary={t('settings.notifications.push.description')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.pushNotifications}
                      onChange={handleChange}
                      name="pushNotifications"
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary={t('settings.notifications.sms.title')}
                    secondary={t('settings.notifications.sms.description')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.smsNotifications}
                      onChange={handleChange}
                      name="smsNotifications"
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary={t('settings.notifications.marketing.title')}
                    secondary={t('settings.notifications.marketing.description')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.marketingEmails}
                      onChange={handleChange}
                      name="marketingEmails"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12}>
            <Paper>
              <List>
                <ListSubheader>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SecurityIcon sx={{ mr: 1 }} />
                    {t('settings.security.title')}
                  </Box>
                </ListSubheader>

                <ListItem>
                  <ListItemText
                    primary={t('settings.security.twoFactor.title')}
                    secondary={t('settings.security.twoFactor.description')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.twoFactorAuth}
                      onChange={handleChange}
                      name="twoFactorAuth"
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary={t('settings.security.dataSharing.title')}
                    secondary={t('settings.security.dataSharing.description')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.dataSharing}
                      onChange={handleChange}
                      name="dataSharing"
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText
                    primary={t('settings.security.activityLog.title')}
                    secondary={t('settings.security.activityLog.description')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.activityLog}
                      onChange={handleChange}
                      name="activityLog"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={saving}
          >
            {saving ? t('settings.buttons.saving') : t('settings.buttons.save')}
          </Button>
        </Box>

        <Snackbar
          open={showSuccessAlert}
          autoHideDuration={3000}
          onClose={() => setShowSuccessAlert(false)}
        >
          <Alert
            onClose={() => setShowSuccessAlert(false)}
            severity="success"
            sx={{ width: '100%' }}
          >
            {t('settings.savedSuccessfully')}
          </Alert>
        </Snackbar>

        <Snackbar
          open={showErrorAlert}
          autoHideDuration={3000}
          onClose={() => setShowErrorAlert(false)}
        >
          <Alert
            onClose={() => setShowErrorAlert(false)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {t('settings.failedToSave')}
          </Alert>
        </Snackbar>
      </Container>
    </PageWrapper>
  );
};

export default Settings;
