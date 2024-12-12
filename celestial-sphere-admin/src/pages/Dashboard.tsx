import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button 
} from '@mui/material';
import { adminService } from '../services/api';

const Dashboard: React.FC = () => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    subscriptions: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        const userResponse = await adminService.getUsers(1, 10);
        const reportResponse = await adminService.generateReport('overview');

        setUserStats(reportResponse.data.stats);
        setRecentUsers(userResponse.data.users);
      } catch (error) {
        console.error('Dashboard fetch error', error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ my: 4 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{userStats.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Users</Typography>
              <Typography variant="h4">{userStats.activeUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Subscriptions</Typography>
              <Typography variant="h4">{userStats.subscriptions}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Button 
        variant="contained" 
        color="secondary" 
        onClick={handleLogout}
        sx={{ mt: 4 }}
      >
        Logout
      </Button>
    </Container>
  );
};

export default Dashboard;
