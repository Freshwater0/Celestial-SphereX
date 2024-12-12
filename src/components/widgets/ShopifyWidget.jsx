import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Grid,
    IconButton,
    Tooltip,
    Alert,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    Store as StoreIcon,
    ShoppingCart as CartIcon,
    AttachMoney as SalesIcon,
    People as CustomersIcon
} from '@mui/icons-material';
import BaseWidget from './BaseWidget';
import { apiKeyService } from '../../services/apiKeyService';

const ShopifyWidget = ({ onRemove, onSettingsChange, settings }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [storeUrl, setStoreUrl] = useState(settings?.storeUrl || '');
    const [apiKey, setApiKey] = useState('');
    const [accessToken, setAccessToken] = useState('');

    const hasCredentials = settings?.storeUrl && settings?.apiKey && settings?.accessToken;

    const fetchData = async () => {
        if (!hasCredentials) return;
        
        setLoading(true);
        setError(null);
        try {
            // Shopify Admin API endpoint
            const baseUrl = `https://${settings.storeUrl}/admin/api/2023-04`;
            const headers = {
                'X-Shopify-Access-Token': settings.accessToken,
                'Content-Type': 'application/json'
            };

            // Fetch multiple metrics in parallel
            const [orders, products, customers] = await Promise.all([
                fetch(`${baseUrl}/orders/count.json`, { headers }),
                fetch(`${baseUrl}/products/count.json`, { headers }),
                fetch(`${baseUrl}/customers/count.json`, { headers })
            ]);

            // Get recent orders for sales data
            const recentOrders = await fetch(
                `${baseUrl}/orders.json?status=any&limit=50`,
                { headers }
            );

            const ordersData = await recentOrders.json();
            const totalSales = ordersData.orders.reduce(
                (sum, order) => sum + parseFloat(order.total_price),
                0
            );

            setData({
                orders: await orders.json(),
                products: await products.json(),
                customers: await customers.json(),
                totalSales,
                recentOrders: ordersData.orders
            });
            
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching Shopify data:', error);
            setError('Failed to fetch store data. Please check your credentials.');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (hasCredentials) {
            fetchData();
            // Refresh every 5 minutes
            const interval = setInterval(fetchData, 300000);
            return () => clearInterval(interval);
        }
    }, [hasCredentials]);

    const handleSaveSettings = () => {
        onSettingsChange({
            ...settings,
            storeUrl,
            apiKey,
            accessToken
        });
        setShowSettings(false);
        fetchData();
    };

    const renderSettings = () => (
        <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Shopify Store Settings</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Store URL"
                        placeholder="your-store.myshopify.com"
                        value={storeUrl}
                        onChange={(e) => setStoreUrl(e.target.value)}
                        helperText="Enter your Shopify store URL"
                    />
                    <TextField
                        fullWidth
                        label="API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        type="password"
                        helperText="Enter your Shopify Admin API key"
                    />
                    <TextField
                        fullWidth
                        label="Access Token"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        type="password"
                        helperText="Enter your Shopify Admin API access token"
                    />
                    <Typography variant="body2" color="text.secondary">
                        To get your API credentials:
                        <ol>
                            <li>Go to your Shopify admin panel</li>
                            <li>Navigate to Apps → App and Sales Channel Settings</li>
                            <li>Click "Develop apps"</li>
                            <li>Create a new app or select an existing one</li>
                            <li>Under "Admin API", configure the required scopes</li>
                            <li>Install the app in your store</li>
                            <li>Copy the API key and Access token</li>
                        </ol>
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setShowSettings(false)}>Cancel</Button>
                <Button 
                    onClick={handleSaveSettings}
                    variant="contained"
                    disabled={!storeUrl || !apiKey || !accessToken}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );

    const renderNoCredentials = () => (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2,
            p: 3
        }}>
            <StoreIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography variant="body1" textAlign="center" color="text.secondary">
                Connect your Shopify store to view analytics
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => setShowSettings(true)}
                startIcon={<SettingsIcon />}
            >
                Connect Store
            </Button>
        </Box>
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const renderContent = () => {
        if (!hasCredentials) return renderNoCredentials();

        if (loading && !data) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (error) {
            return (
                <Alert 
                    severity="error" 
                    action={
                        <Button color="inherit" size="small" onClick={fetchData}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            );
        }

        if (!data) return null;

        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
                {/* Store Stats */}
                <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <SalesIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {formatCurrency(data.totalSales)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Sales
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <CartIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {data.orders.count}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Orders
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <CustomersIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {data.customers.count}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Customers
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <StoreIcon sx={{ color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">
                                {data.products.count}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Products
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Recent Orders */}
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Recent Orders
                </Typography>
                <Box sx={{ 
                    flex: 1,
                    overflowY: 'auto',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    p: 2
                }}>
                    {data.recentOrders.slice(0, 5).map((order) => (
                        <Box
                            key={order.id}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                py: 1,
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Typography variant="body2">
                                #{order.order_number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {formatCurrency(order.total_price)}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Last Updated */}
                <Box sx={{ 
                    mt: 'auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="caption" color="text.secondary">
                        Last updated: {lastUpdated?.toLocaleTimeString()}
                    </Typography>
                    <Box>
                        <Tooltip title="Settings">
                            <IconButton size="small" onClick={() => setShowSettings(true)} sx={{ mr: 1 }}>
                                <SettingsIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Refresh">
                            <IconButton size="small" onClick={fetchData}>
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>
        );
    };

    return (
        <>
            <BaseWidget
                title="Shopify Store"
                onRemove={onRemove}
                onSettingsChange={onSettingsChange}
                settings={settings}
            >
                {renderContent()}
            </BaseWidget>
            {renderSettings()}
        </>
    );
};

export default ShopifyWidget;
