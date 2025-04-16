import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Yetkilendirme token\'ı bulunamadı'
    });
    return;
  }

  try {
    // Supabase token doğrulama
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(403).json({
        success: false,
        message: 'Geçersiz token'
      });
      return;
    }

    // User bilgisini request'e ekle
    req.user = { id: data.user.id };
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Geçersiz token'
    });
    return;
  }
}; 