import winston from 'winston';
import path from 'path';

// Loglama seviyeleri
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Geliştirme ortamına göre log seviyesini belirleme
const level = () => {
  const logLevel = process.env.LOG_LEVEL;
  const env = process.env.NODE_ENV || 'development';
  
  // Eğer LOG_LEVEL tanımlanmışsa onu kullan
  if (logLevel && levels[logLevel as keyof typeof levels] !== undefined) {
    return logLevel;
  }
  
  // Değilse ortama göre varsayılan değeri döndür
  return env === 'development' ? 'debug' : 'info';
};

// Log formatını belirleme
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level.toUpperCase()} ${info.message}`
  )
);

// Log dosyalarının konumları
const logDir = path.join(process.cwd(), 'logs');
const transports = [
  // Konsola loglama
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      format
    ),
  }),
  // Hata logları için dosya
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
  }),
  // Tüm loglar için dosya
  new winston.transports.File({
    filename: path.join(logDir, 'all.log'),
  }),
];

// Winston logger oluşturma
const winstonLogger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Hata fırlatıldığında logu sonlandırma (varsayılan davranış)
  exitOnError: false,
});

export default winstonLogger; 