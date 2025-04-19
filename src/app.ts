import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import sportsRoutes from './routes/sports.routes';
import eventsRoutes from './routes/events.routes';
import notificationsRoutes from './routes/notifications.routes';

// Çevre değişkenlerini yükle
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const app = express();

// Güvenlik ve optimizasyon middleware'leri
app.use(helmet()); // Güvenlik başlıkları
app.use(cors()); // CORS desteği
app.use(compression()); // Yanıt sıkıştırma
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined')); // Loglama

// JSON ve URL-encoded parser middleware'leri
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI'ı sadece geliştirme ortamında aktif et
if (process.env.NODE_ENV === 'development') {
  // API dokümantasyonu endpoint'i
  app.use("/api-docs", swaggerUi.serve);
  app.get("/api-docs", swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "SportLink API Dokümantasyonu"
  }));

  // API dokümantasyonu JSON endpoint'i
  app.get("/api-docs.json", (_, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

// Ana API rotaları için prefix
const apiRouter = express.Router();
const API_PREFIX = process.env.API_PREFIX || '/api/v1';
app.use(API_PREFIX, apiRouter);

// Route'ları ekle
apiRouter.use('/auth', authRoutes);
apiRouter.use('/sports', sportsRoutes);
apiRouter.use('/events', eventsRoutes);
apiRouter.use('/notifications', notificationsRoutes);

// Örnek endpoint
apiRouter.get("/", (_, res) => {
  res.json({ 
    message: "SportLink API V1",
    environment: process.env.NODE_ENV
  });
});

// Kök yolu endpoint'i
app.get("/", (_, res) => {
  if (process.env.NODE_ENV === 'development') {
    res.redirect("/api-docs");
  } else {
    res.json({ message: "SportLink API" });
  }
});

// Global hata yakalama middleware'i
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server is running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`API Dokümantasyonu: ${BASE_URL}/api-docs`);
});

export default app;
