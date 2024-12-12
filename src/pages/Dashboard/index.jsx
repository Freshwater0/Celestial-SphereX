import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  Badge,
  Collapse,
  Tooltip,
  Container,
  Grid,
  Menu,
  MenuItem,
  Button,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  NotificationsNone as NotificationsIcon,
  Logout as LogoutIcon,
  CreditCard as BillingIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Analytics as AnalyticsIcon,
  Assessment as ReportIcon,
  TableChart as TableChartIcon,
  Widgets as WidgetsIcon,
  Add as AddIcon
} from '@mui/icons-material';

import WeatherWidget from '../../components/widgets/WeatherWidget';
import CryptoWidget from '../../components/widgets/CryptoWidget';
import CalendarWidget from '../../components/widgets/CalendarWidget';
import InstagramWidget from '../../components/widgets/InstagramWidget';
import YouTubeWidget from '../../components/widgets/YouTubeWidget';
import TikTokWidget from '../../components/widgets/TikTokWidget';
import ShopifyWidget from '../../components/widgets/ShopifyWidget';
import { WIDGET_TYPES } from '../../components/widgets/WidgetTypes';
import AddWidgetDialog from '../../components/Dashboard/components/AddWidgetDialog';

import BackButton from '../../components/common/BackButton';
import WidgetSelector from '../../components/Dashboard/WidgetSelector';
import PageWrapper from '../../components/common/PageWrapper';
import ProfileDialog from '../../components/Profile/ProfileDialog';

import logo from '../../assets/images/logo.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [widgets, setWidgets] = useState([]);
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState({});
  const [open, setOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [widgetMenuAnchor, setWidgetMenuAnchor] = useState(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [userKey, setUserKey] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [selectedWidget, setSelectedWidget] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const userEmail = user?.email;
    if (userEmail && widgets) {
      localStorage.setItem(`widgets_${userEmail}`, JSON.stringify(widgets));
    }
  }, [widgets, user?.email]);

  useEffect(() => {
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgets));
  }, [widgets]);

  const handleDrawerToggle = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const handleLogout = useCallback(() => {
    const userEmail = user?.email;
    if (userEmail) {
      localStorage.setItem(`widgets_${userEmail}`, JSON.stringify(widgets));
      localStorage.setItem(`settings_${userEmail}`, JSON.stringify({
        theme: theme.palette.mode,
        drawerOpen: open
      }));
    }
    navigate('/');
  }, [navigate, user?.email, widgets, theme.palette.mode, open]);

  const handleAddWidget = useCallback((widgetType) => {
    const newWidget = {
      id: Date.now(),
      type: widgetType,
      settings: {} // Default settings for the widget
    };
    setWidgets(prevWidgets => [...prevWidgets, newWidget]);
  }, []);

  const handleRemoveWidget = useCallback((widgetId) => {
    setWidgets(prevWidgets => prevWidgets.filter(widget => widget.id !== widgetId));
  }, []);

  const handleWidgetSettingsChange = useCallback((widgetId, newSettings) => {
    setWidgets(prevWidgets => prevWidgets.map(widget => {
      if (widget.id === widgetId) {
        return {
          ...widget,
          settings: {
            ...widget.settings,
            ...newSettings
          }
        };
      }
      return widget;
    }));
  }, []);

  const renderWidget = useCallback((widget) => {
    const commonProps = {
      key: widget.id,
      onRemove: () => handleRemoveWidget(widget.id),
      onSettingsChange: (settings) => handleWidgetSettingsChange(widget.id, settings),
      settings: widget.settings
    };

    switch (widget.type) {
      case WIDGET_TYPES.CRYPTO:
        return <CryptoWidget {...commonProps} />;
      case WIDGET_TYPES.WEATHER:
        return <WeatherWidget {...commonProps} />;
      case WIDGET_TYPES.CALENDAR:
        return <CalendarWidget {...commonProps} />;
      case WIDGET_TYPES.INSTAGRAM:
        return <InstagramWidget {...commonProps} />;
      case WIDGET_TYPES.YOUTUBE:
        return <YouTubeWidget {...commonProps} />;
      case WIDGET_TYPES.TIKTOK:
        return <TikTokWidget {...commonProps} />;
      case WIDGET_TYPES.SHOPIFY:
        return <ShopifyWidget {...commonProps} />;
      default:
        return null;
    }
  }, [handleRemoveWidget, handleWidgetSettingsChange]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageWrapper showBackButton={false}>
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${open ? 240 : 64}px)` },
            ml: { sm: `${open ? 240 : 64}px` },
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            backgroundColor: 'background.paper',
            color: 'text.primary',
            boxShadow: 1,
          }}
        >
          <Toolbar sx={{ minHeight: '48px !important' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" noWrap>
                Celestial Sphere
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddWidgetDialogOpen(true)}
                size="small"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Add Widget
              </Button>
            </Box>
            <IconButton color="inherit" onClick={() => navigate('/notifications')}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: open ? 240 : 64,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              boxSizing: 'border-box',
              overflowX: 'hidden',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    ...(location.pathname === '/dashboard' && {
                      backgroundColor: theme.palette.action.selected,
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: location.pathname === '/dashboard' 
                        ? theme.palette.primary.main 
                        : theme.palette.text.secondary,
                    }}
                  >
                    <DashboardIcon />
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary="Dashboard"
                      sx={{
                        color: location.pathname === '/dashboard' 
                          ? theme.palette.text.primary 
                          : theme.palette.text.secondary,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigate('/profile')}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    ...(location.pathname === '/profile' && {
                      backgroundColor: theme.palette.action.selected,
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: location.pathname === '/profile' 
                        ? theme.palette.primary.main 
                        : theme.palette.text.secondary,
                    }}
                  >
                    <ProfileIcon />
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary="Profile"
                      sx={{
                        color: location.pathname === '/profile' 
                          ? theme.palette.text.primary 
                          : theme.palette.text.secondary,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => setAnalyticsOpen(!analyticsOpen)}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    <AnalyticsIcon />
                  </ListItemIcon>
                  {open && (
                    <>
                      <ListItemText primary="Analytics" />
                      {analyticsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={analyticsOpen && open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItemButton
                    onClick={() => navigate('/reports')}
                    sx={{
                      pl: 4,
                      minHeight: 48,
                      ...(location.pathname === '/reports' && {
                        backgroundColor: theme.palette.action.selected,
                      }),
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: location.pathname === '/reports' 
                          ? theme.palette.primary.main 
                          : theme.palette.text.secondary 
                      }}
                    >
                      <ReportIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Reports"
                      sx={{
                        color: location.pathname === '/reports' 
                          ? theme.palette.text.primary 
                          : theme.palette.text.secondary,
                      }}
                    />
                  </ListItemButton>
                  <ListItemButton
                    onClick={() => navigate('/data')}
                    sx={{
                      pl: 4,
                      minHeight: 48,
                      ...(location.pathname === '/data' && {
                        backgroundColor: theme.palette.action.selected,
                      }),
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: location.pathname === '/data' 
                          ? theme.palette.primary.main 
                          : theme.palette.text.secondary 
                      }}
                    >
                      <TableChartIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Data"
                      sx={{
                        color: location.pathname === '/data' 
                          ? theme.palette.text.primary 
                          : theme.palette.text.secondary,
                      }}
                    />
                  </ListItemButton>
                </List>
              </Collapse>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigate('/notifications')}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    ...(location.pathname === '/notifications' && {
                      backgroundColor: theme.palette.action.selected,
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: location.pathname === '/notifications' 
                        ? theme.palette.primary.main 
                        : theme.palette.text.secondary,
                    }}
                  >
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary="Notifications"
                      sx={{
                        color: location.pathname === '/notifications' 
                          ? theme.palette.text.primary 
                          : theme.palette.text.secondary,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigate('/billing')}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    ...(location.pathname === '/billing' && {
                      backgroundColor: theme.palette.action.selected,
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: location.pathname === '/billing' 
                        ? theme.palette.primary.main 
                        : theme.palette.text.secondary,
                    }}
                  >
                    <BillingIcon />
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary="Billing"
                      sx={{
                        color: location.pathname === '/billing' 
                          ? theme.palette.text.primary 
                          : theme.palette.text.secondary,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigate('/settings')}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    ...(location.pathname === '/settings' && {
                      backgroundColor: theme.palette.action.selected,
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : 'auto',
                      justifyContent: 'center',
                      color: location.pathname === '/settings' 
                        ? theme.palette.primary.main 
                        : theme.palette.text.secondary,
                    }}
                  >
                    <SettingsIcon />
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary="Settings"
                      sx={{
                        color: location.pathname === '/settings' 
                          ? theme.palette.text.primary 
                          : theme.palette.text.secondary,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
            backgroundColor: theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column',
            width: { sm: `calc(100% - ${open ? 240 : 64}px)` },
            ml: { sm: `${open ? 240 : 64}px` },
          }}
        >
          <Toolbar sx={{ minHeight: '48px !important' }} />
          <Box
            sx={{
              width: '100%',
              height: '100%',
              overflow: 'auto',
              p: 3,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
              alignContent: 'start',
              '& > *': {
                minHeight: 300,
                width: '100%',
              }
            }}
          >
            {widgets.map(widget => (
              <Box key={widget.id} sx={{ width: '100%', height: '100%' }}>
                {renderWidget(widget)}
              </Box>
            ))}
            
            {widgets.length === 0 && (
              <Box
                onClick={() => setIsAddWidgetDialogOpen(true)}
                sx={{
                  gridColumn: {
                    xs: '1',
                    sm: '1 / span 2',
                    md: '1 / span 3',
                    lg: '1 / span 4'
                  },
                  height: 300,
                  border: `2px dashed ${theme.palette.divider}`,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <WidgetsIcon sx={{ fontSize: 48, color: theme.palette.text.secondary }} />
                <Typography variant="h6" color="text.secondary">
                  Add your first widget
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Add Widget
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        <WidgetSelector
          open={selectorOpen}
          onClose={() => setSelectorOpen(false)}
          onAdd={handleAddWidget}
        />
        <ProfileDialog
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={user}
        />
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
        />
        <AddWidgetDialog
          open={isAddWidgetDialogOpen}
          onClose={() => setIsAddWidgetDialogOpen(false)}
          onAddWidget={handleAddWidget}
        />
      </Box>
    </PageWrapper>
  );
};

export default Dashboard;
