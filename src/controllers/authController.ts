import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { z } from 'zod';

// Kayıt için doğrulama şeması
const registerSchema = z.object({
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  first_name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  last_name: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  phone: z.string().optional(),
});

// Giriş için doğrulama şeması
const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre girmelisiniz'),
});

export const authController = {
  /**
   * Kullanıcı kaydı
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Gelen verileri doğrula
      const validationResult = registerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Doğrulama hatası',
          errors: validationResult.error.errors,
        });
      }

      // Doğrulanmış verileri al
      const userData = validationResult.data;
      
      // Kayıt servisini çağır
      const result = await authService.register(userData);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.status(201).json(result);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * Kullanıcı girişi
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Gelen verileri doğrula
      const validationResult = loginSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Doğrulama hatası',
          errors: validationResult.error.errors,
        });
      }

      // Doğrulanmış verileri al
      const loginData = validationResult.data;
      
      // Giriş servisini çağır
      const result = await authService.login(loginData);
      
      if (!result.success) {
        return res.status(401).json(result);
      }
      
      // Oturum bilgilerini kaydet (refresh token, access token)
      // Gerçek projede bu kısım genellikle cookie ile yapılır
      
      return res.json(result);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * E-posta doğrulama geri çağırma (callback)
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz veya eksik token',
        });
      }
      
      const result = await authService.handleEmailVerification(token);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.json(result);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * Çıkış işlemi
   */
  async logout(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = await authService.logout();
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.json(result);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * Şifre sıfırlama isteği
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Geçerli bir e-posta adresi giriniz',
        });
      }
      
      const result = await authService.forgotPassword(email);
      
      return res.json(result);
    } catch (error: any) {
      next(error);
    }
  },
}; 