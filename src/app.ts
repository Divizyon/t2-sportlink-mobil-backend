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
import newsRoutes from './routes/news.routes';

// Çevre değişkenlerini yükle
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

const app = express();

// BigInt'leri string'e dönüştürmek için JSON.stringify'ı geçersiz kıl
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

// CORS yapılandırması - tüm kaynaklardan gelen isteklere izin ver
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || '*'] // Üretim ortamında sadece frontend URL'sine izin ver
    : '*', // Geliştirme ortamında tüm kaynaklara izin ver
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Güvenlik ve optimizasyon middleware'leri
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || '*'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', '*'],
      upgradeInsecureRequests: []
    }
  }
})); // Güvenlik başlıkları - özelleştirilmiş
app.use(cors(corsOptions)); // CORS desteği - genişletilmiş ayarlarla
app.use(compression()); // Yanıt sıkıştırma
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined')); // Loglama

// JSON ve URL-encoded parser middleware'leri
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS için OPTIONS isteklerine cevap veren middleware
app.options('*', cors(corsOptions));

// Tekrarlanan API_PREFIX'leri için düzeltme middleware'i - tamamen yeniden yazılmış
app.use((req, _res, next) => {
  // En yaygın URL formatı sorunları:
  // 1. /api/v1/api/v1/... şeklinde çift prefix
  // 2. localhost:3000/api/v1/... formatlama hatası (bu frontend tarafında çözülmeli)
  
  // Özel durum: doğrudan tam URL: http://localhost:3000/api/v1/api/v1/news/2
  if (req.url.includes('/api/v1/api/v1/')) {
    // Tamamen eşleşme için düzeltme
    const correctedUrl = req.url.replace('/api/v1/api/v1/', '/api/v1/');
    console.log(`[URL Düzeltme] Çift prefix tespit edildi: ${req.url} -> ${correctedUrl}`);
    
    // Seçenek 1: URL'yi değiştir ve istek devam etsin (sessizce düzelt)
    req.url = correctedUrl;
    return next();
    
    // Seçenek 2: Yeni URL'ye yönlendir (301 - kalıcı yönlendirme)
    // return res.redirect(301, correctedUrl);
    
    // Seçenek 3: Hata mesajı döndür (400 - geçersiz istek)
    // return res.status(400).json({
    //  success: false,
    //  message: 'Geçersiz URL formatı. Doğru URL: ' + correctedUrl
    // });
  }
  
  next();
});

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

// Debug middleware - gelen tüm istekleri logla
if (NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[DEBUG] Gelen istek: ${req.method} ${req.url}`);
    next();
  });
}

// Ana API rotaları için prefix
const apiRouter = express.Router();
app.use(API_PREFIX, apiRouter);

// Route'ları ekle - burada doğru prefix kullanılıyor, çünkü apiRouter zaten API_PREFIX altında
// Yani, '/api/v1' API_PREFIX'i altındaki apiRouter kullanıldığı için, route'lar sadece ilgili path'i belirtmeli
apiRouter.use('/auth', authRoutes);
apiRouter.use('/sports', sportsRoutes);
apiRouter.use('/events', eventsRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/news', newsRoutes);

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
