import express, { Request as ExpressRequest } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import logger, { httpLogger } from "./utils/logger";
import path from "path";
import fs from "fs";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import { startPeriodicMetricsLogging } from "./utils/logger/helpers";
import exampleRoutes from "./routes/example";

// Request interface'ini genişleterek id özelliğini ekle
interface Request extends ExpressRequest {
  id?: string;
}

// Uygulamayı oluştur
const app = express();

// Ortam değişkenlerini yükle
const PORT = 3021;
const NODE_ENV = process.env.NODE_ENV || "development";
const API_PREFIX = process.env.API_PREFIX || "/api/v1";

// Güvenlik, sıkıştırma ve CORS middleware'lerini uygula
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP istekleri için loglama middleware'ini uygula
app.use(httpLogger);

// Log dizini kontrolü
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  logger.info(`Log dizini oluşturuldu: ${logDir}`);
}

// Ana rota
app.get("/", (_, res) => {
  logger.info("Ana sayfa ziyaret edildi");
  res.send("Hello World");
});

// Örnek hata rotası
app.get("/error", (_, res) => {
  try {
    throw new Error("Test hatası");
  } catch (error) {
    logger.error("Bir hata oluştu", { error: (error as Error).message });
    res.status(500).send("Sunucu hatası");
  }
});

// API rotaları
app.use(`${API_PREFIX}/examples`, exampleRoutes);

// API test rotası
app.get("/api/test", (req: Request, res, next) => {
  try {
    logger.info("API test rotası çağrıldı", { requestId: req.id });
    res.json({
      success: true,
      message: "API çalışıyor",
      requestId: req.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 404 yakalayıcıyı tüm rotalardan sonra ekle
app.use(notFoundHandler);

// Global hata işleyiciyi en son middleware olarak ekle
app.use(errorHandler);

// Periyodik sistem metrikleri loglaması başlat (dakikada bir)
const stopMetricsLogging = startPeriodicMetricsLogging(60000);

// Sunucuyu başlat
const server = app.listen(PORT, () => {
  console.log(`Server ${NODE_ENV} modunda çalışıyor`);
  console.log(`http://localhost:${PORT} adresinde dinleniyor`);
  console.log(`API endpoint: ${API_PREFIX}`);
  
  // Test log mesajları
  logger.info("Test info log mesajı");
  logger.warn("Test warning log mesajı");
  logger.error("Test error log mesajı");
});

// Temiz kapatma işlemleri
const gracefulShutdown = () => {
  logger.info("Uygulama kapatılıyor...");
  
  // Metrik loglamasını durdur
  stopMetricsLogging();
  
  // HTTP sunucusunu kapat
  server.close(() => {
    logger.info("HTTP sunucusu kapatıldı");
    process.exit(0);
  });
  
  // Eğer 10 saniye içinde kapatma işlemi tamamlanmazsa zorla kapat
  setTimeout(() => {
    logger.error("Kapatma işlemi zaman aşımına uğradı, zorla kapatılıyor");
    process.exit(1);
  }, 10000);
};

// Kapatma sinyallerini yakala
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// İşlenmeyen hataları yakala
process.on("uncaughtException", (error) => {
  logger.error("İşlenmeyen hata", { error: error.message, stack: error.stack });
  gracefulShutdown();
});

process.on("unhandledRejection", (reason) => {
  logger.error("İşlenmeyen Promise hatası", { reason });
  gracefulShutdown();
});

export default app;
