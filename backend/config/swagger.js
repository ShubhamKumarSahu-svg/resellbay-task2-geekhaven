const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ResellBay API Documentation',
      version: '1.0.0',
      description:
        'Professional API documentation for ResellBay e-commerce platform.',
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:5000',
        description: 'Development Server',
      },
      {
        url: process.env.PROD_SERVER_URL || 'https://api.resellbay.com',
        description: 'Production Server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            isVerified: { type: 'boolean' },
            accountStatus: { type: 'string' },
            rating: {
              type: 'object',
              properties: {
                average: { type: 'number', example: 4.5 },
                count: { type: 'integer', example: 12 },
              },
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            originalPrice: { type: 'number' },
            category: { type: 'string' },
            condition: { type: 'string' },
            stock: { type: 'integer' },
            images: {
              type: 'array',
              items: { type: 'string', format: 'url' },
            },
            rating: {
              type: 'object',
              properties: {
                average: { type: 'number', example: 4.2 },
                count: { type: 'integer', example: 20 },
              },
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            products: {
              type: 'array',
              items: { $ref: '#/components/schemas/Product' },
            },
            totalAmount: { type: 'number' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            author: { $ref: '#/components/schemas/User' },
            subject: { type: 'string' },
            reviewType: { type: 'string', enum: ['User', 'Product'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );
  console.log('Swagger docs available at /api-docs');
};

module.exports = { setupSwagger };
