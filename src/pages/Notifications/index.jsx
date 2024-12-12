import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Button,
  Divider,
  Chip,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Badge,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import BackButton from '../../components/BackButton';

// Mock data for notifications
const mockNotifications = [
  {
    id: 1,
    type: 'alert',
    title: 'System Update',
    message: 'A new system update is available. Please review the changes.',
    timestamp: '2 hours ago',
    read: false,
    priority: 'high',
  },
  {
    id: 2,
    type: 'message',
    title: 'New Message',
    message: 'You have received a new message from the admin team.',
    timestamp: '3 hours ago',
    read: true,
    priority: 'medium',
  },
  {
    id: 3,
    type: 'security',
    title: 'Security Alert',
    message: 'Unusual login attempt detected from a new device.',
    timestamp: '5 hours ago',
    read: false,
    priority: 'high',
  },
  {
    id: 4,
    type: 'info',
    title: 'Profile Update',
    message: 'Your profile has been successfully updated.',
    timestamp: '1 day ago',
    read: true,
    priority: 'low',
  },
  {
    id: 5,
    type: 'alert',
    title: 'Payment Processed',
    message: 'Your recent payment has been successfully processed.',
    timestamp: '1 day ago',
    read: true,
    priority: 'medium',
  },
];

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'alert':
        return <WarningIcon color="warning" />;
      case 'security':
        return <InfoIcon color="error" />;
      case 'message':
        return <NotificationsIcon color="primary" />;
      default:
        return <CheckCircleIcon color="success" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <>
      <ListItem
        sx={{
          bgcolor: notification.read ? 'transparent' : 'action.hover',
          transition: 'background-color 0.3s',
          '&:hover': {
            bgcolor: 'action.selected',
          },
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: 'background.paper' }}>
            {getIcon(notification.type)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" component="span">
                {notification.title}
              </Typography>
              <Chip
                label={notification.priority}
                size="small"
                color={getPriorityColor(notification.priority)}
                sx={{ height: 20 }}
              />
            </Box>
          }
          secondary={
            <>
              <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {notification.timestamp}
              </Typography>
            </>
          }
        />
        <IconButton edge="end" onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </ListItem>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            onMarkRead(notification.id);
            handleMenuClose();
          }}
        >
          <DoneIcon sx={{ mr: 1 }} />
          Mark as {notification.read ? 'unread' : 'read'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete(notification.id);
            handleMenuClose();
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [currentTab, setCurrentTab] = useState(0);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id
        ? { ...notification, read: !notification.read }
        : notification
    ));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true,
    })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = () => {
    switch (currentTab) {
      case 1:
        return notifications.filter(n => !n.read);
      case 2:
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <BackButton />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Badge badgeContent={unreadCount} color="error" sx={{ mr: 2 }}>
                <NotificationsIcon color="primary" />
              </Badge>
              <Typography variant="h6">Notifications</Typography>
            </Box>
            <Button
              startIcon={<DoneIcon />}
              onClick={handleMarkAllRead}
              sx={{ mr: 1 }}
            >
              Mark All Read
            </Button>
            <Button
              startIcon={<ClearIcon />}
              onClick={handleClearAll}
              color="error"
            >
              Clear All
            </Button>
          </Box>

          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="All" />
            <Tab
              label={
                <Badge badgeContent={unreadCount} color="error">
                  <Box sx={{ mr: 2 }}>Unread</Box>
                </Badge>
              }
            />
            <Tab label="Read" />
          </Tabs>

          <List>
            {filteredNotifications().map((notification, index) => (
              <React.Fragment key={notification.id}>
                <NotificationItem
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
            {filteredNotifications().length === 0 && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: 'center', py: 4 }}
              >
                No notifications to display
              </Typography>
            )}
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default Notifications;
