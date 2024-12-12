import { createTheme } from '@mui/material/styles';

console.log('Theme module is being imported');

function createAppTheme(mode = 'light') {
  console.log('Theme Creator Called with mode:', mode);
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#2196F3',
      },
      secondary: {
        main: '#21CBF3',
      },
    },
  });
}

// Explicitly set module properties
createAppTheme.$$typeof = Symbol.for('react.module');
createAppTheme[Symbol.toStringTag] = 'Module';

export default createAppTheme;
