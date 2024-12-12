import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Link,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import {
  ShoppingBag as ShopifyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { WIDGET_TYPES, WIDGET_NAMES } from '../widgets/WidgetTypes';

const ShopifyConfigSteps = {
  STORE_DETAILS: 0,
  API_ACCESS: 1,
  CONFIRMATION: 2,
};

const WidgetSelector = ({ open, onClose, onAdd }) => {
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [configStep, setConfigStep] = useState(ShopifyConfigSteps.STORE_DETAILS);
  const [showTokens, setShowTokens] = useState(false);
  const [shopifyConfig, setShopifyConfig] = useState({
    storeName: '',
    apiKey: '',
    apiSecretKey: '',
    accessToken: '',
    shopDomain: '',
  });
  const [configError, setConfigError] = useState('');

  const handleWidgetSelect = (widget) => {
    setSelectedWidget(widget);
    if (widget.type === 'shopify') {
      setConfigStep(ShopifyConfigSteps.STORE_DETAILS);
    } else {
      // For non-Shopify widgets, add them immediately
      onAdd(widget.type, widget.defaultConfig || {});
      handleClose();
    }
  };

  const validateStoreDetails = () => {
    if (!shopifyConfig.storeName.trim()) {
      setConfigError('Store name is required');
      return false;
    }
    if (!shopifyConfig.shopDomain.trim()) {
      setConfigError('Shop domain is required');
      return false;
    }
    if (!shopifyConfig.shopDomain.includes('.myshopify.com')) {
      setConfigError('Shop domain must be a valid Shopify domain (ending with .myshopify.com)');
      return false;
    }
    return true;
  };

  const validateApiAccess = () => {
    if (!shopifyConfig.apiKey.trim()) {
      setConfigError('API key is required');
      return false;
    }
    if (!shopifyConfig.apiSecretKey.trim()) {
      setConfigError('API secret key is required');
      return false;
    }
    if (!shopifyConfig.accessToken.trim()) {
      setConfigError('Access token is required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setConfigError('');
    if (configStep === ShopifyConfigSteps.STORE_DETAILS && validateStoreDetails()) {
      setConfigStep(ShopifyConfigSteps.API_ACCESS);
    } else if (configStep === ShopifyConfigSteps.API_ACCESS && validateApiAccess()) {
      setConfigStep(ShopifyConfigSteps.CONFIRMATION);
    }
  };

  const handleBack = () => {
    setConfigError('');
    setConfigStep((prev) => prev - 1);
  };

  const handleAddShopify = () => {
    if (validateStoreDetails() && validateApiAccess()) {
      const config = {
        storeName: shopifyConfig.storeName.trim(),
        shopDomain: shopifyConfig.shopDomain.trim(),
        apiKey: shopifyConfig.apiKey.trim(),
        apiSecretKey: shopifyConfig.apiSecretKey.trim(),
        accessToken: shopifyConfig.accessToken.trim()
      };
      
      // Call the parent's onAdd with the widget type and config
      onAdd(WIDGET_TYPES.shopify.type, config);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedWidget(null);
    setConfigStep(ShopifyConfigSteps.STORE_DETAILS);
    setShopifyConfig({
      storeName: '',
      apiKey: '',
      apiSecretKey: '',
      accessToken: '',
      shopDomain: '',
    });
    setConfigError('');
    onClose();
  };

  const renderStoreDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Store Details
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter your Shopify store information to get started.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Store Name"
            value={shopifyConfig.storeName}
            onChange={(e) => setShopifyConfig(prev => ({ ...prev, storeName: e.target.value }))}
            helperText="The name of your Shopify store"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Shop Domain"
            value={shopifyConfig.shopDomain}
            onChange={(e) => setShopifyConfig(prev => ({ ...prev, shopDomain: e.target.value }))}
            helperText="Example: your-store.myshopify.com"
            required
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderApiAccess = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        API Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter your Shopify API credentials. You can find these in your Shopify Admin under Apps &gt; Develop apps.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="API Key"
            value={shopifyConfig.apiKey}
            onChange={(e) => setShopifyConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            type={showTokens ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowTokens(!showTokens)} edge="end">
                    {showTokens ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="API Secret Key"
            value={shopifyConfig.apiSecretKey}
            onChange={(e) => setShopifyConfig(prev => ({ ...prev, apiSecretKey: e.target.value }))}
            type={showTokens ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowTokens(!showTokens)} edge="end">
                    {showTokens ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Access Token"
            value={shopifyConfig.accessToken}
            onChange={(e) => setShopifyConfig(prev => ({ ...prev, accessToken: e.target.value }))}
            type={showTokens ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowTokens(!showTokens)} edge="end">
                    {showTokens ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            required
          />
        </Grid>
      </Grid>
      <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.lighter' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="info" />
          How to get your API credentials:
        </Typography>
        <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Go to your Shopify Admin</li>
          <li>Navigate to Apps &gt; Develop apps</li>
          <li>Click "Create an app"</li>
          <li>Give your app a name (e.g., "Store Dashboard")</li>
          <li>Under "Admin API access", click "Configure"</li>
          <li>Select these permissions:
            <ul>
              <li>read_orders</li>
              <li>read_products</li>
              <li>read_customers</li>
              <li>read_analytics</li>
            </ul>
          </li>
          <li>Click "Save" and install the app in your store</li>
          <li>Copy the API key, Secret key, and Access token</li>
        </ol>
        <Link
          href="https://shopify.dev/docs/apps/auth/admin-app-access-tokens"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: 'block', mt: 1 }}
        >
          Learn more about Shopify API access
        </Link>
      </Paper>
    </Box>
  );

  const renderConfirmation = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Confirm Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review your Shopify store configuration before adding the widget.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Store Information
            </Typography>
            <Typography variant="body2">
              Store Name: {shopifyConfig.storeName}
              <br />
              Shop Domain: {shopifyConfig.shopDomain}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              API Configuration
            </Typography>
            <Typography variant="body2">
              API credentials have been securely saved
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderShopifyConfig = () => (
    <>
      <DialogTitle>Configure Shopify Store</DialogTitle>
      <DialogContent>
        {configError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {configError}
          </Alert>
        )}
        <Stepper activeStep={configStep} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Store Details</StepLabel>
          </Step>
          <Step>
            <StepLabel>API Access</StepLabel>
          </Step>
          <Step>
            <StepLabel>Confirmation</StepLabel>
          </Step>
        </Stepper>
        {configStep === ShopifyConfigSteps.STORE_DETAILS && renderStoreDetails()}
        {configStep === ShopifyConfigSteps.API_ACCESS && renderApiAccess()}
        {configStep === ShopifyConfigSteps.CONFIRMATION && renderConfirmation()}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {configStep > ShopifyConfigSteps.STORE_DETAILS && (
          <Button onClick={handleBack}>Back</Button>
        )}
        {configStep < ShopifyConfigSteps.CONFIRMATION ? (
          <Button onClick={handleNext} variant="contained">
            Next
          </Button>
        ) : (
          <Button onClick={handleAddShopify} variant="contained" color="primary">
            Add Widget
          </Button>
        )}
      </DialogActions>
    </>
  );

  const renderWidgetList = () => (
    <>
      <DialogTitle>Add Widget</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {Object.values(WIDGET_TYPES).map((widget) => (
            <Grid item xs={12} sm={6} md={4} key={widget.type}>
              <Card
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => handleWidgetSelect(widget)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {widget.icon && <widget.icon />}
                    <Typography variant="h6">{widget.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {widget.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={selectedWidget?.type === 'shopify' ? 'md' : 'lg'}
      fullWidth
    >
      {selectedWidget?.type === 'shopify' ? renderShopifyConfig() : renderWidgetList()}
    </Dialog>
  );
};

export default WidgetSelector;
