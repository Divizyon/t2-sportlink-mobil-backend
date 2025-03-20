import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';


const API_PREFIX = process.env.API_PREFIX || '/api/v1';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SportLink API Dokümantasyonu',
      version: '1.0.0',
      description: 'SportLink mobil uygulaması için RESTful API dokümantasyonu',
      contact: {
        name: 'SportLink Ekibi'
      },
    },
    servers: [
      {
        url: `${BASE_URL}${API_PREFIX}`,
        description: 'Geliştirme Sunucusu',
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
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../models/*.ts'),
    path.join(__dirname, '../controllers/*.ts'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 