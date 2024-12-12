const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Celestial Sphere API',
      version: '1.0.0',
      description: 'API documentation for the Celestial Sphere application',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        email: 'support@celestialsphere.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            status: {
              type: 'integer',
              description: 'HTTP status code',
            },
            stack: {
              type: 'string',
              description: 'Error stack trace (only in development)',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Profile ID',
            },
            user_id: {
              type: 'integer',
              description: 'Associated user ID',
            },
            avatar: {
              type: 'string',
              description: 'Avatar URL',
            },
            bio: {
              type: 'string',
              description: 'User biography',
            },
            location: {
              type: 'string',
              description: 'User location',
            },
            timezone: {
              type: 'string',
              description: 'User timezone',
            },
            language: {
              type: 'string',
              description: 'Preferred language',
            },
            theme: {
              type: 'string',
              description: 'UI theme preference',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/routes/api/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
