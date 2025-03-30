const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Melodies API Documentation',
      version: '1.0.0',
      description: 'API documentation for Melodies music application',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'http://localhost:8000',
        description: 'Alternative development server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: [path.resolve(__dirname, '../routes/*.js')], // Absolute path to the API routes
};

const specs = swaggerJsdoc(options);
module.exports = specs; 