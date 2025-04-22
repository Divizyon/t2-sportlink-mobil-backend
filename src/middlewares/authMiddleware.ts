import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import prisma from '../config/prisma';

// Özel bir Request tipi tanımlayalım, kullanıcı bilgisini tutacak
declare global {
  namespace Express {
    interface Request {
      user?: any; // Kullanıcı bilgileri
      token?: string; // JWT token
    }
  }
}

/**
 * JWT token'ı doğrulayan ve kullanıcı bilgilerini ekleyen middleware
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Authorization header'dan token'ı al
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Erişim yetkisi reddedildi. Giriş yapmanız gerekiyor.',
        code: 'UNAUTHORIZED'
      });
    }

    // Token'ı çıkar
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token formatı.',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Token'ı doğrula
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      return res.status(401).json({
        success: false,
        message: 'Oturum süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapın.',
        code: 'INVALID_TOKEN'
      });
    }

    // Kullanıcıyı veritabanından al
    const user = await prisma.user.findUnique({
      where: { email: supabaseUser.email as string }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Kullanıcı bilgilerini request'e ekle
    req.user = user;
    req.token = token;

    return next();
  } catch (error: any) {
    console.error('Auth Middleware Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Kimlik doğrulama sırasında bir hata oluştu.',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Kullanıcının belirli bir role sahip olup olmadığını kontrol eden middleware fabrikası
 * @param {string[]} roles - İzin verilen roller
 * @returns Middleware fonksiyonu
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Erişim yetkisi reddedildi. Giriş yapmanız gerekiyor.',
          code: 'UNAUTHORIZED'
        });
      }

      // Kullanıcının rolünü kontrol et
      const hasPermission = roles.includes(req.user.role);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Bu işlemi gerçekleştirmek için gerekli yetkiye sahip değilsiniz.',
          code: 'FORBIDDEN'
        });
      }

      return next();
    } catch (error) {
      console.error('Yetkilendirme Hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Yetkilendirme sırasında bir hata oluştu.',
        code: 'AUTHORIZATION_ERROR'
      });
    }
  };
};

// Hazır rol kontrol middleware'leri
export const isUser = authorize(['user', 'admin', 'superadmin']);
export const isAdmin = authorize(['admin', 'superadmin']);
export const isSuperAdmin = authorize(['superadmin']);

/**
 * Kullanıcının kendine ait kaynağa eriştiğini kontrol eden middleware
 * @param {string} paramName - URL parametresindeki ID'nin adı (ör: "userId")
 * @returns Middleware fonksiyonu
 */
export const isResourceOwner = (paramName: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Erişim yetkisi reddedildi. Giriş yapmanız gerekiyor.',
          code: 'UNAUTHORIZED'
        });
      }

      const resourceId = req.params[paramName];
      
      // Eğer kullanıcı admin veya superadmin ise, her kaynağa erişebilir
      if (['admin', 'superadmin'].includes(req.user.role)) {
        return next();
      }

      // Kaynak ID'si, kullanıcı ID'si ile eşleşiyor mu?
      if (resourceId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Bu kaynağa erişmek için gerekli yetkiye sahip değilsiniz.',
          code: 'FORBIDDEN'
        });
      }

      return next();
    } catch (error) {
      console.error('Kaynak Erişim Hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Kaynak erişimi sırasında bir hata oluştu.',
        code: 'RESOURCE_ACCESS_ERROR'
      });
    }
  };
};

/**
 * Aktif bir kullanıcıyı kontrol eden yardımcı fonksiyon
 */
export const getUserFromToken = async (token: string) => {
  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: supabaseUser.email as string }
    });

    return user;
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    return null;
  }
}; 