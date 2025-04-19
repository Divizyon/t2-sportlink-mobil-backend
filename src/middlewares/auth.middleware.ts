import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { usersService } from '../services/users.service';

// JWT ile doğrulanmış kullanıcı bilgilerini içeren arayüz
export interface DecodedToken {
  id: string;
  email: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

// Express Request nesnesini genişleten arayüz
export interface AuthenticatedRequest extends Request {
  user?: {
    id: BigInt;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    profile_picture: string;
    default_location_latitude: number;
    default_location_longitude: number;
    role: string;
    created_at: Date;
    updated_at: Date;
  };
}

// JWT token'ını doğrulayan middleware
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Authorization header'ından token'ı al
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Erişim reddedildi. Yetkilendirme gerekli.'
      });
    }

    const token = authHeader.split(' ')[1];

    // JWT secret değerini kontrol et
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET çevre değişkeni tanımlanmamış!');
      return res.status(500).json({
        success: false,
        message: 'Sunucu yapılandırma hatası.'
      });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;

    // Token süresi kontrolü
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return res.status(401).json({
        success: false,
        message: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.'
      });
    }

    // Kullanıcının veritabanında var olup olmadığını kontrol et
    const user = await usersService.findById(BigInt(decoded.id));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token. Kullanıcı bulunamadı.'
      });
    }

    // Kullanıcıyı request nesnesine ekle
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token formatı veya imzası.'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş.'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Doğrulama işlemi başarısız oldu.'
      });
    }
  }
};

// Backward compatibility için authenticate alias'ı
export const authenticate = isAuthenticated; 