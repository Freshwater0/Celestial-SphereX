import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Divider, useTheme } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import StockWidget from '../Widgets/StockWidget';
import CryptoWidget from '../Widgets/CryptoWidget';
import SocialMediaWidget from '../Widgets/SocialMediaWidget';
import ShopifyWidget from '../Widgets/ShopifyWidget';
import AddWidgetDialog from './components/AddWidgetDialog';

const DashboardContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
}));

const TopBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const WidgetGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gridAutoRows: 'minmax(400px, auto)',
  overflow: 'auto',
  flexGrow: 1,
  alignContent: 'start',

  [theme.breakpoints.up('xl')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },

  '& > div': {
    height: '400px',
    transition: theme.transitions.create(['transform', 'box-shadow'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  },
}));

const DEFAULT_WIDGETS = [
  { id: 1, type: 'stock', symbol: 'AAPL' },
  { id: 2, type: 'stock', symbol: 'GOOGL' },
  { id: 3, type: 'crypto', symbol: 'BTC' },
  { id: 4, type: 'crypto', symbol: 'ETH' },
  { id: 5, type: 'social' },
  { id: 6, type: 'shopify' },
];

const AVAILABLE_WIDGETS = {
  stock: {
    name: 'Stock Widget',
    symbols: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'TSLA'],
  },
  crypto: {
    name: 'Crypto Widget',
    symbols: ['BTC', 'ETH', 'USDT', 'BNB', 'XRP', 'ADA'],
  },
  social: {
    name: 'Social Media Analytics',
  },
  shopify: {
    name: 'Shopify Analytics',
  },
};

const Dashboard = () => {
  const theme = useTheme();
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefreshAll = () => {
    setLastUpdate(new Date());
  };

  const handleAddWidget = (type, config = {}) => {
    const newWidget = {
      id: Date.now(),
      type,
      ...config,
    };
    setWidgets(prev => [...prev, newWidget]);
    setIsAddWidgetOpen(false);
  };

  const handleRemoveWidget = (id) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
  };

  const renderWidget = (widget) => {
    const commonProps = {
      key: widget.id,
      onRemove: () => handleRemoveWidget(widget.id),
      lastUpdate,
      enableRealtime: true,
    };

    switch (widget.type) {
      case 'stock':
        return (
          <StockWidget
            {...commonProps}
            symbol={widget.symbol}
          />
        );
      case 'crypto':
        return (
          <CryptoWidget
            {...commonProps}
            symbol={widget.symbol}
          />
        );
      case 'social':
        return (
          <SocialMediaWidget
            {...commonProps}
          />
        );
      case 'shopify':
        return (
          <ShopifyWidget
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardContainer>
      <TopBar>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Real-Time Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={handleRefreshAll}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            onClick={() => setIsAddWidgetOpen(true)}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </TopBar>

      <Divider />

      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50',
          '&::-webkit-scrollbar': {
            width: '12px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'background.paper',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'divider',
            borderRadius: '6px',
            border: '3px solid transparent',
            backgroundClip: 'padding-box',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'text.disabled',
          },
        }}
      >
        <WidgetGrid>
          {widgets.map(renderWidget)}
        </WidgetGrid>
      </Box>

      <AddWidgetDialog
        open={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
        onAdd={handleAddWidget}
        availableWidgets={AVAILABLE_WIDGETS}
      />
    </DashboardContainer>
  );
};

export default Dashboard;
