import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Tooltip title="Back to Dashboard">
      <IconButton
        onClick={() => navigate('/dashboard')}
        sx={{
          position: 'absolute',
          left: 24,
          top: 24,
          bgcolor: 'background.paper',
          boxShadow: 1,
          '&:hover': {
            bgcolor: 'grey.100',
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>
    </Tooltip>
  );
};

export default BackButton;
