import React from 'react';
import { Box, useTheme } from '@mui/material';
import BackButton from './BackButton';

const PageWrapper = ({ children, showBackButton = true, sx = {} }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        ...sx
      }}
    >
      {showBackButton && (
        <Box
          sx={{
            position: 'absolute',
            top: theme.spacing(2),
            left: theme.spacing(2),
            zIndex: theme.zIndex.drawer + 2,
          }}
        >
          <BackButton />
        </Box>
      )}
      {children}
    </Box>
  );
};

export default PageWrapper;
