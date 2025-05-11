/* eslint-disable prettier/prettier */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';
import friendRoutes from './routes/friendRoutes';
import messageRoutes from './routes/messageRoutes';
import sportRoutes from './routes/sportRoutes';
import newsRoutes from './routes/newsRoutes';
import announcementRoutes from './routes/announcementRoutes';
import notificationRoutes from './routes/notificationRoutes';
import deviceRoutes from './routes/deviceRoutes';
import mapsRoutes from './routes/mapsRoutes';
import { setupRealtimeTables, supabase } from './config/supabase';
import { userService } from './services/userService';
import { logger } from './utils/logger';
import { NotificationService } from './services/notificationService';



// Çevre değişkenlerini yükle
dotenv.config();

// Express uygulamasını oluştur
const app = express();

// Temel Middleware
app.use(cors());
app.use(helmet());
// TypeScript hatası nedeniyle compression fonksiyonunu bu şekilde uyguluyoruz
app.use((compression() as unknown) as express.RequestHandler);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  limit: 1000, // IP başına istek limiti - artırıldı
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

// Ana rota
app.get('/', (_: Request, res: Response) => {
  
  res.json({
    success: true,
    message: 'SportLink API çalışıyor!',
    version: '1.0.0'
  });
});

// API rotalarını bağla
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/maps', mapsRoutes);

// Supabase bildirim trigger kurulumu
setupNotificationTriggers();

// 404 handler
app.use((_: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint bulunamadı',
    code: 'NOT_FOUND'
  });
});

// Hata işleyici
//a 
app.use((err: any, _: Request, res: Response, __: NextFunction) => {
  console.error('Sunucu hatası:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Sunucu hatası oluştu',
    code: err.code || 'SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3000;

// Zamanlanmış görevler
// Süresi geçmiş etkinlikleri otomatik güncelleme görevi
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 saat (milisaniye cinsinden)
setInterval(async () => {
  try {
    await userService.updateExpiredEvents();
  } catch (error) {
    // Hata durumunda sadece hata mesajını logla
    console.error('Etkinlik güncelleme görevi hatası:', error);
  }
}, UPDATE_INTERVAL);

// Uygulama başlatıldığında ilk kez etkinlikleri güncelle
(async () => {
  try {
    await userService.updateExpiredEvents();
  } catch (error) {
    // Hata durumunda sadece hata mesajını logla
    console.error('İlk etkinlik güncellemesi hatası:', error);
  }
})();

export const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  setupRealtimeTables()
    .then(() => logger.info('Supabase Realtime tables setup completed'))
    .catch(error => logger.error('Supabase setup error:', error));
});

/**
 * Veritabanı bildirim triggerları için Supabase bağlantısı kurar
 */
function setupNotificationTriggers() {
  try {
    // Notification tablosundaki eklemeleri dinle
    const notificationChannel = supabase
      .channel('db-notification-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification',
        },
        async (payload) => {
          logger.info(`Yeni bildirim algılandı! ID: ${payload.new.id}`);
          // Yeni bildirim eklendiğinde push notification gönder
          await NotificationService.handleNewNotification(payload.new);
        }
      )
      .subscribe((status) => {
        logger.info(`Bildirim trigger durumu: ${status}`);
      });

    // Uygulama kapanırken subscription'ı temizle
    process.on('SIGINT', () => {
      logger.info('Notification trigger subscription cleaning up...');
      supabase.removeChannel(notificationChannel);
    });

    logger.info('Notification trigger system initialized');
  } catch (error) {
    logger.error('Error setting up notification triggers:', error);
  }
}

export default app;
