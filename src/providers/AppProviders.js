import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Context Providers
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from '../theme/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { TimezoneProvider } from '../contexts/TimezoneContext';
import { BillingProvider } from '../contexts/BillingContext';
import { ProfileProvider } from '../contexts/ProfileProvider';
import { ErrorProvider } from '../contexts/ErrorContext';

// Theme Configuration
import getTheme from '../theme';

const ProvidersComposer = ({ providers, children }) => {
  return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children);
};

const AppProviders = ({ children }) => {
  const { mode } = useTheme();
  const theme = React.useMemo(() => {
    const themeOptions = getTheme(mode);
    return createTheme(themeOptions);
  }, [mode]);

  const providers = [
    ({ children }) => <AuthProvider>{children}</AuthProvider>,
    ({ children }) => <CustomThemeProvider>{children}</CustomThemeProvider>,
    ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>,
    ({ children }) => <CssBaseline>{children}</CssBaseline>,
    ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
    ({ children }) => <TimezoneProvider>{children}</TimezoneProvider>,
    ({ children }) => <BillingProvider>{children}</BillingProvider>,
    ({ children }) => <ProfileProvider>{children}</ProfileProvider>,
    ({ children }) => <ErrorProvider>{children}</ErrorProvider>,
    ({ children }) => <LocalizationProvider dateAdapter={AdapterDateFns}>{children}</LocalizationProvider>,
    ({ children }) => <Router>{children}</Router>,
  ];

  return <ProvidersComposer providers={providers}>{children}</ProvidersComposer>;
};

export default AppProviders;
