const express = require('express');
const router = express.Router();
const cryptoController = require('../../controllers/cryptoController');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

// Get current price and 24h stats for a symbol
router.get('/price/:symbol', cryptoController.getPrice);

// Get market overview (top 10 currencies by volume)
router.get('/market/overview', cryptoController.getMarketOverview);

// Get historical data for a symbol
router.get('/historical/:symbol/:interval/:limit', cryptoController.getHistoricalData);

// Search for symbols
router.get('/search', cryptoController.searchSymbols);

module.exports = router;
