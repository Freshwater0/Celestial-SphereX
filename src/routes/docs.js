const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

const router = express.Router();

// Serve Swagger documentation
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec));

// Endpoint to get Swagger JSON
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

module.exports = router;
