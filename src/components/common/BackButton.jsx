import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ sx = {} }) => {
  const navigate = useNavigate();

  return (
    <Tooltip title="Go Back">
      <IconButton
        onClick={() => navigate(-1)}
        sx={{ 
          color: 'inherit',
          ...sx 
        }}
      >
        <ArrowBack />
      </IconButton>
    </Tooltip>
  );
};

export default BackButton;
