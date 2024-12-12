import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './theme/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { TimezoneProvider } from './contexts/TimezoneContext';
import { BillingProvider } from './contexts/BillingContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ErrorProvider } from './contexts/ErrorContext';

// Page imports
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import DataPage from './pages/DataPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Theme
import getTheme from './theme';

// i18n
import './i18n';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/dashboard" replace />;
};

// Inner App Component that uses theme
const AppWithTheme = () => {
  const { mode } = useTheme();
  const theme = getTheme(mode);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <TimezoneProvider>
          <BillingProvider>
            <ProfileProvider>
              <ErrorProvider>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                    <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                    <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                    <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                    <Route path="/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
                    <Route path="/data" element={<PrivateRoute><DataPage /></PrivateRoute>} />
                    <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
                    <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                    <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />

                    {/* Catch all route */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </LocalizationProvider>
              </ErrorProvider>
            </ProfileProvider>
          </BillingProvider>
        </TimezoneProvider>
      </LanguageProvider>
    </MuiThemeProvider>
  );
};

// App Component with Theme Providers
const App = () => {
  return (
    <Router>
      <CustomThemeProvider>
        <AuthProvider>
          <AppWithTheme />
        </AuthProvider>
      </CustomThemeProvider>
    </Router>
  );
};

export { 
  App, 
  AppWithTheme, 
  PrivateRoute, 
  PublicRoute 
};

export default App;
