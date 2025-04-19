import { Request as ExpressRequest, Response, NextFunction } from 'express';

// Request interface'ini genişlet
export interface Request extends ExpressRequest {
  id?: string;
}

// Express middleware tipleri
export type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;
export type ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => void;

// Middleware tipi - kullanılmayan parametre uyarılarını önlemek için
export type Middleware = (req: Request, res: Response, next: NextFunction) => void; 