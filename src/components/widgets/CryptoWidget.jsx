import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    IconButton,
    TextField,
    Autocomplete,
    Paper,
    Tooltip,
    Alert,
    Fade
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import BaseWidget from './BaseWidget';
import { cryptoService } from '../../services/cryptoService';

const CryptoWidget = ({ onRemove, onSettingsChange, settings }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchOptions, setSearchOptions] = useState([]);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [coinData, setCoinData] = useState(null);
    const [priceHistory, setPriceHistory] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [priceFlash, setPriceFlash] = useState(false);
    const [priceDirection, setPriceDirection] = useState(null);
    const previousPrice = useRef(null);

    // Fetch coin data
    const fetchCoinData = async (coinId) => {
        if (!coinId) return;
        
        setLoading(true);
        setError(null);
        try {
            const [coin, history] = await Promise.all([
                cryptoService.getCoinData(coinId),
                cryptoService.getPriceHistory(coinId)
            ]);

            // Check if price has changed
            const newPrice = coin.market_data.current_price.usd;
            if (previousPrice.current !== null && newPrice !== previousPrice.current) {
                setPriceDirection(newPrice > previousPrice.current ? 'up' : 'down');
                setPriceFlash(true);
                setTimeout(() => setPriceFlash(false), 1000);
            }
            previousPrice.current = newPrice;

            setCoinData(coin);
            setPriceHistory(history);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching coin data:', error);
            setError(error.message);
        }
        setLoading(false);
    };

    // Search for coins
    const searchCoins = async (query) => {
        if (!query) {
            setSearchOptions([]);
            return;
        }

        try {
            const results = await cryptoService.searchCoins(query);
            setSearchOptions(results);
        } catch (error) {
            console.error('Error searching coins:', error);
        }
    };

    // Handle coin selection
    const handleCoinSelect = (event, coin) => {
        if (coin) {
            setSelectedCoin(coin);
            previousPrice.current = null; // Reset price reference on new coin selection
            fetchCoinData(coin.id);
        }
    };

    // Auto-refresh every 15 seconds for more frequent price updates
    useEffect(() => {
        if (selectedCoin) {
            fetchCoinData(selectedCoin.id);
            const interval = setInterval(() => {
                fetchCoinData(selectedCoin.id);
            }, 15000); // Update every 15 seconds
            return () => clearInterval(interval);
        }
    }, [selectedCoin]);

    const getPriceColor = () => {
        if (priceFlash) {
            return priceDirection === 'up' ? 'success.main' : 'error.main';
        }
        return 'text.primary';
    };

    const renderContent = () => {
        if (loading && !coinData) {
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
                        <IconButton
                            color="inherit"
                            size="small"
                            onClick={() => selectedCoin && fetchCoinData(selectedCoin.id)}
                        >
                            <RefreshIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    {error}
                </Alert>
            );
        }

        return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
                {/* Search Bar */}
                <Autocomplete
                    freeSolo
                    options={searchOptions}
                    getOptionLabel={(option) => option.name || ''}
                    renderOption={(props, option) => (
                        <Box component="li" {...props}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <img 
                                    src={option.thumb} 
                                    alt={option.name}
                                    style={{ width: 20, height: 20 }}
                                />
                                <Typography>{option.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ({option.symbol.toUpperCase()})
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            size="small"
                            placeholder="Search cryptocurrency..."
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                            }}
                        />
                    )}
                    onChange={handleCoinSelect}
                    onInputChange={(event, value) => {
                        setSearchInput(value);
                        searchCoins(value);
                    }}
                    value={selectedCoin}
                    loading={loading}
                />

                {/* Coin Data */}
                {coinData && (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <img
                                src={coinData.image.small}
                                alt={coinData.name}
                                style={{ width: 24, height: 24 }}
                            />
                            <Typography variant="h6">
                                {coinData.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                ({coinData.symbol.toUpperCase()})
                            </Typography>
                        </Box>

                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            transition: 'color 0.3s ease'
                        }}>
                            <Fade in={true} timeout={500}>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        color: getPriceColor(),
                                        transition: 'color 0.3s ease',
                                        fontWeight: priceFlash ? 'bold' : 'normal'
                                    }}
                                >
                                    {cryptoService.formatPrice(coinData.market_data.current_price.usd)}
                                </Typography>
                            </Fade>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {coinData.market_data.price_change_percentage_24h > 0 ? (
                                    <TrendingUpIcon color="success" />
                                ) : (
                                    <TrendingDownIcon color="error" />
                                )}
                                <Typography
                                    color={coinData.market_data.price_change_percentage_24h > 0 ? 'success.main' : 'error.main'}
                                >
                                    {cryptoService.formatPercentage(coinData.market_data.price_change_percentage_24h)}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                                Market Cap:
                            </Typography>
                            <Typography variant="body2">
                                {cryptoService.formatPrice(coinData.market_data.market_cap.usd)}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                                24h Volume:
                            </Typography>
                            <Typography variant="body2">
                                {cryptoService.formatPrice(coinData.market_data.total_volume.usd)}
                            </Typography>
                        </Box>

                        {/* Live Price Indicator */}
                        <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                        }}>
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: 'success.main',
                                    animation: 'pulse 2s infinite'
                                }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                Live Price Updates
                            </Typography>
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
                            <Tooltip title="Refresh">
                                <IconButton 
                                    size="small" 
                                    onClick={() => fetchCoinData(selectedCoin.id)}
                                    disabled={loading}
                                >
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </>
                )}
            </Box>
        );
    };

    return (
        <BaseWidget
            title="Cryptocurrency"
            onRemove={onRemove}
            onSettingsChange={onSettingsChange}
            settings={settings}
        >
            {renderContent()}
        </BaseWidget>
    );
};

export default CryptoWidget;
