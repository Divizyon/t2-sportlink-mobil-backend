"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
const options = {
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
        tags: [
            {
                name: 'Haberler',
                description: 'Haberlerle ilgili işlemler',
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
        path_1.default.join(__dirname, '../routes/*.ts'),
        path_1.default.join(__dirname, '../models/*.ts'),
        path_1.default.join(__dirname, '../controllers/*.ts'),
    ],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
//# sourceMappingURL=swagger.js.map