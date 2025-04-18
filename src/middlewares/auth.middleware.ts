import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseClient } from '../config/supabase';

// JWT ile doğrulanmış kullanıcı bilgilerini içeren arayüz
export interface DecodedToken {
  id: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

// Express Request nesnesini genişleten arayüz
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    username: string;
    email: string;
    profile_image?: string;
    interests?: string[];
    email_verified: boolean;
    created_at: string;
    updated_at: string;
  };
}

// JWT token'ını doğrulayan middleware
export const authenticate = async (
  req: AuthenticatedRequest,
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
    const { data: user, error } = await supabaseClient
      .from('users')
      .select('id, username, email, profile_image, interests, email_verified, created_at, updated_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token. Kullanıcı bulunamadı.'
      });
    }

    // Kullanıcıyı request nesnesine ekle
    req.user = user;
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