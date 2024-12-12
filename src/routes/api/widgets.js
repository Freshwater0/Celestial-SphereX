const express = require('express');
const router = express.Router();
const widgetController = require('../../controllers/widgetController');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

// Get all widgets
router.get('/', widgetController.getWidgets);

// Create a new widget
router.post('/', widgetController.createWidget);

// Update a widget
router.put('/:id', widgetController.updateWidget);

// Delete a widget
router.delete('/:id', widgetController.deleteWidget);

// Update widget positions
router.put('/positions/bulk', widgetController.updateWidgetPositions);

// Toggle widget active status
router.put('/:id/toggle', widgetController.toggleWidgetActive);

module.exports = router;
