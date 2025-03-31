import dotenv from 'dotenv';
// Çevre değişkenlerini en başta yükle
dotenv.config();

import express, { ErrorRequestHandler } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import passport from './config/passport';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/error.middleware';
import { configureSecurityMiddleware } from './middlewares/security.middleware';
import { config } from './config/config';

// Express uygulamasını oluştur
const app = express();

// Güvenlik middleware'lerini yapılandır
configureSecurityMiddleware(app);

// JSON ve URL-encoded parser middleware'leri
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport middleware'ini ekle
app.use(passport.initialize());

// Swagger UI'ı sadece geliştirme ortamında aktif et
if (config.nodeEnv === 'development') {
  // API dokümantasyonu endpoint'i
  app.use('/api-docs', swaggerUi.serve);
  app.get(
    '/api-docs',
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'SportLink API Dokümantasyonu',
    })
  );

  // API dokümantasyonu JSON endpoint'i
  app.get('/api-docs.json', (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// Ana API rotaları için prefix
const apiRouter = express.Router();
app.use(config.apiPrefix, apiRouter);

// Auth rotalarını ekle
apiRouter.use('/auth', authRoutes);

// Örnek endpoint
apiRouter.get('/', (_, res) => {
  res.json({
    message: 'SportLink API V1',
    environment: config.nodeEnv,
  });
});

// Kök yolu endpoint'i
app.get('/', (_, res) => {
  if (config.nodeEnv === 'development') {
    res.redirect('/api-docs');
  } else {
    res.json({ message: 'SportLink API' });
  }
});

// Global error handler
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  errorHandler(err, req, res, next);
};
app.use(globalErrorHandler);

app.listen(config.port, () => {
  console.log(`Server is running in ${config.nodeEnv} mode on port ${config.port}`);
  console.log(`API Dokümantasyonu: ${config.baseUrl}/api-docs`);
});

export default app;
