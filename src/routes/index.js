import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Page imports
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import Billing from '../pages/Billing';
import Reports from '../pages/Reports';
import Notifications from '../pages/Notifications';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifyEmail from '../pages/VerifyEmail';
import DataPage from '../pages/DataPage';
import AnalyticsPage from '../pages/AnalyticsPage';

// Route configurations
const publicRoutes = [
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/reset-password', component: ResetPassword },
  { path: '/verify-email', component: VerifyEmail },
];

const privateRoutes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/profile', component: Profile },
  { path: '/settings', component: Settings },
  { path: '/billing', component: Billing },
  { path: '/data', component: DataPage },
  { path: '/reports', component: Reports },
  { path: '/notifications', component: Notifications },
  { path: '/analytics', component: AnalyticsPage },
];

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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      {publicRoutes.map(({ path, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={<PublicRoute><Component /></PublicRoute>}
        />
      ))}

      {/* Protected Routes */}
      {privateRoutes.map(({ path, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={<PrivateRoute><Component /></PrivateRoute>}
        />
      ))}

      {/* Catch all route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
