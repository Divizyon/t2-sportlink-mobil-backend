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
import { setupRealtimeTables } from './config/supabase';



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

// Supabase realtime özelliklerini başlat
setupRealtimeTables()
  .then(() => console.log('Supabase realtime yapılandırması başarıyla tamamlandı'))
  .catch((err) => console.error('Supabase realtime yapılandırması başarısız:', err));

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} adresinde çalışıyor`);
});

export default app;
