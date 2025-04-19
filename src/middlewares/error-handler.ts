import { NextFunction, Response } from 'express';
import logger from '../utils/logger';
import { Request, ErrorRequestHandler } from '../types/middleware';

interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

// Operasyonel hata oluşturma sınıfı
export class ApiError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global hata işleyici
export const errorHandler: ErrorRequestHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Varsayılan değerler
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Hata bilgilerini logla
  logger.error('Hata yakalandı', {
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      requestId: req.id,
      path: req.originalUrl,
      method: req.method,
    },
  });
  
  // Geliştirme ortamında detaylı hata bilgileri
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      requestId: req.id,
    });
  }
  
  // Üretim ortamında daha az detaylı yanıt
  // Operasyonel hatalar için gerçek mesajı göster
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      requestId: req.id,
    });
  }
  
  // Programlama hatası veya bilinmeyen hata için genel mesaj
  return res.status(500).json({
    status: 'error',
    message: 'Bir şeyler yanlış gitti',
    requestId: req.id,
  });
};

// 404 Hatası için middleware
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = new ApiError(`${req.originalUrl} bulunamadı`, 404);
  next(error);
}; 