import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Box,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  CurrencyBitcoin as CryptoIcon,
  WbSunny as WeatherIcon,
  CalendarToday as CalendarIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  MusicNote as TikTokIcon,
  ShoppingCart as ShopifyIcon,
  ShowChart as GraphIcon,
  Timeline as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { WIDGET_TYPES, WIDGET_NAMES } from '../../widgets/WidgetTypes';

const widgetIcons = {
  [WIDGET_TYPES.CRYPTO]: CryptoIcon,
  [WIDGET_TYPES.WEATHER]: WeatherIcon,
  [WIDGET_TYPES.CALENDAR]: CalendarIcon,
  [WIDGET_TYPES.INSTAGRAM]: InstagramIcon,
  [WIDGET_TYPES.YOUTUBE]: YouTubeIcon,
  [WIDGET_TYPES.TIKTOK]: TikTokIcon,
  [WIDGET_TYPES.SHOPIFY]: ShopifyIcon,
  [WIDGET_TYPES.GRAPH]: GraphIcon,
  [WIDGET_TYPES.LINE_CHART]: LineChartIcon,
  [WIDGET_TYPES.PIE_CHART]: PieChartIcon,
  [WIDGET_TYPES.BAR_CHART]: BarChartIcon
};

const AddWidgetDialog = ({ open, onClose, onAddWidget }) => {
  const theme = useTheme();

  const handleWidgetSelect = (widgetType) => {
    onAddWidget(widgetType);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          Add Widget
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {Object.entries(WIDGET_NAMES).map(([type, name]) => {
            const Icon = widgetIcons[type];
            return (
              <ListItem key={type} disablePadding>
                <ListItemButton
                  onClick={() => handleWidgetSelect(type)}
                  sx={{
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={name}
                    secondary={`Add a ${name.toLowerCase()} widget to your dashboard`}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default AddWidgetDialog;
