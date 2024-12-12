import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

const LoadingState = ({ type = 'default', count = 1 }) => {
  const renderDefaultLoading = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
      }}
    >
      <CircularProgress size={40} sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        Loading data...
      </Typography>
    </Box>
  );

  const renderCardLoading = () => (
    <Grid container spacing={2}>
      {Array.from(new Array(count)).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="80%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderChartLoading = () => (
    <Box sx={{ width: '100%', p: 2 }}>
      <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={300} />
    </Box>
  );

  const renderTableLoading = () => (
    <Box sx={{ width: '100%' }}>
      <Skeleton variant="rectangular" height={56} sx={{ mb: 1 }} />
      {Array.from(new Array(count)).map((_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          height={52}
          sx={{ mb: 1 }}
        />
      ))}
    </Box>
  );

  switch (type) {
    case 'card':
      return renderCardLoading();
    case 'chart':
      return renderChartLoading();
    case 'table':
      return renderTableLoading();
    default:
      return renderDefaultLoading();
  }
};

LoadingState.propTypes = {
  type: PropTypes.oneOf(['default', 'card', 'chart', 'table']),
  count: PropTypes.number,
};

LoadingState.defaultProps = {
  type: 'default',
  count: 1,
};

export default LoadingState;
