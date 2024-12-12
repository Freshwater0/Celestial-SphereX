import { createTheme } from '@mui/material/styles';

/**
 * Create a theme with optional mode
 * @param {import('@mui/material').PaletteMode} [mode='light'] - The color mode for the theme
 * @returns {import('@mui/material/styles').Theme} The created theme
 */
const createAppTheme = (mode = 'light') => {
  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: mode === 'dark' ? '#90caf9' : '#1976d2', // Adjust colors for dark/light modes
      },
      secondary: {
        main: mode === 'dark' ? '#f48fb1' : '#dc004e',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f4f4f4',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff'
      }
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif'
      ].join(','),
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderWidth: 0,
            backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff'
          }
        }
      }
    }
  });
};

// Alias for backward compatibility
const getTheme = createAppTheme;

export default createAppTheme;
export { getTheme };
