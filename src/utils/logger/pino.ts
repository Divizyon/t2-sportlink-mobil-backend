import pino from 'pino';
import fs from 'fs';
import path from 'path';

// Log dizini kontrolü ve oluşturma
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Geliştirme ortamına göre farklı konfigürasyon
const isProduction = process.env.NODE_ENV === 'production';

// Log seviyesini belirle
const determineLogLevel = () => {
  // Geçerli log seviyeleri
  const validLevels = ['error', 'warn', 'info', 'debug', 'trace'];
  const logLevel = process.env.LOG_LEVEL;
  
  // Eğer LOG_LEVEL tanımlanmışsa ve geçerliyse onu kullan
  if (logLevel && validLevels.includes(logLevel)) {
    return logLevel;
  }
  
  // Değilse ortama göre varsayılan değeri döndür
  return isProduction ? 'info' : 'debug';
};

// Pino logger oluşturma
const pinoLogger = pino({
  level: determineLogLevel(),
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    targets: [
      // Tüm loglar için dosya hedefi
      {
        target: 'pino/file',
        options: { destination: path.join(logDir, 'all.log') },
        level: 'debug',
      },
      // Sadece hata logları için dosya hedefi
      {
        target: 'pino/file',
        options: { destination: path.join(logDir, 'error.log') },
        level: 'error',
      },
      // Konsol çıktısı - geliştirme ortamında renkli ve formatlı
      isProduction
        ? {
            target: 'pino/file',
            options: { destination: process.stdout.fd },
            level: 'info',
          }
        : {
            target: 'pino-pretty',
            options: {
              destination: process.stdout.fd,
              colorize: true,
              translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
              ignore: 'pid,hostname',
              messageFormat: '{msg}', // İki nokta üst üste eklemez
              levelFirst: true,       // Seviye ilk olarak gösterilir
              customLevels: {         // Özel seviye adları
                error: 'ERROR',
                warn: 'WARN',
                info: 'INFO', 
                debug: 'DEBUG',
                trace: 'TRACE'
              },
            },
            level: 'debug',
          },
    ].filter(Boolean), // undefined değerleri filtrele
  },
});

export default pinoLogger; 