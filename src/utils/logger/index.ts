import winstonLogger from './winston';
import pinoLogger from './pino';
import fs from 'fs';
import path from 'path';
import { Middleware } from '../../types/middleware';

// Log dizini kontrolü ve oluşturma
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Basit bir loglayıcı arayüzü
interface Logger {
  error(message: string | object, ...meta: any[]): void;
  warn(message: string | object, ...meta: any[]): void;
  info(message: string | object, ...meta: any[]): void;
  http(message: string | object, ...meta: any[]): void;
  debug(message: string | object, ...meta: any[]): void;
}

// Winston adapter
const winstonAdapter: Logger = {
  error: (message, ...meta) => winstonLogger.error(formatLogMessage(message, meta)),
  warn: (message, ...meta) => winstonLogger.warn(formatLogMessage(message, meta)),
  info: (message, ...meta) => winstonLogger.info(formatLogMessage(message, meta)),
  http: (message, ...meta) => winstonLogger.http(formatLogMessage(message, meta)),
  debug: (message, ...meta) => winstonLogger.debug(formatLogMessage(message, meta)),
};

// Pino adapter
const pinoAdapter: Logger = {
  error: (message, ...meta) => pinoLogger.error(prepareLogObject(message, meta)),
  warn: (message, ...meta) => pinoLogger.warn(prepareLogObject(message, meta)),
  info: (message, ...meta) => pinoLogger.info(prepareLogObject(message, meta)),
  http: (message, ...meta) => pinoLogger.info(prepareLogObject(message, meta)), // pino'da http seviyesi yok
  debug: (message, ...meta) => pinoLogger.debug(prepareLogObject(message, meta)),
};

// Mesajın formatlanması (Winston için)
function formatLogMessage(message: string | object, meta: any[]): string {
  if (typeof message === 'object') {
    return `${JSON.stringify(message)}${meta.length ? ' ' + JSON.stringify(meta) : ''}`;
  }
  return `${message}${meta.length ? ' ' + JSON.stringify(meta) : ''}`;
}

// Nesne formatı (Pino için)
function prepareLogObject(message: string | object, meta: any[]): object {
  if (typeof message === 'object') {
    return {
      msg: JSON.stringify(message),
      ...message,
      ...(meta.length && { meta }),
    };
  }
  return {
    msg: message,
    ...(meta.length && { meta }),
  };
}

// İstek ID'si için yardımcı fonksiyon
export const generateRequestId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// HTTP istekleri için loglama middleware'i
export const httpLogger: Middleware = (req, res, next) => {
  // İstek ID'si ekleme
  req.id = generateRequestId();
  
  // İstek başlangıç zamanı
  const start = Date.now();
  
  // İstek bilgilerini loglama
  logger.http({
    method: req.method,
    url: req.url,
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  
  // Yanıt tamamlandığında detayları loglama
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http({
      method: req.method,
      url: req.url,
      requestId: req.id,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  
  next();
};

// Hangi loglayıcıyı kullanacağımızı belirleyen ortam değişkeni
// LOGGER_TYPE=pino veya LOGGER_TYPE=winston (varsayılan winston)
const loggerType = process.env.LOGGER_TYPE || 'winston';

// Varsayılan loglayıcıyı seç
const logger: Logger = loggerType === 'pino' ? pinoAdapter : winstonAdapter;

// Her iki loglayıcıyı da dışa aktar
export { winstonAdapter as winstonLogger, pinoAdapter as pinoLogger };

export default logger; 