import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { z } from 'zod';

// Profil güncelleme için validasyon şeması
const profileUpdateSchema = z.object({
  first_name: z.string().min(2, 'Ad en az 2 karakter olmalıdır').optional(),
  last_name: z.string().min(2, 'Soyad en az 2 karakter olmalıdır').optional(),
  phone: z.string().nullable().optional(),
  default_location_latitude: z.number().optional(),
  default_location_longitude: z.number().optional(),
});

// Spor dalları güncelleme için validasyon şeması
const sportsUpdateSchema = z.array(
  z.object({
    sportId: z.string().uuid('Geçerli bir spor ID\'si giriniz'),
    skillLevel: z.string().min(1, 'Yetenek seviyesi boş olamaz'),
  })
);

export const userController = {
  /**
   * Kullanıcı profil bilgilerini getir
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await userService.getProfile(userId);
      
      if (!result.success) {
        res.status(404).json(result);
        return;
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Profili güncelle
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      
      // Veri doğrulama
      const validationResult = profileUpdateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Doğrulama hatası',
          errors: validationResult.error.errors,
          code: 'VALIDATION_ERROR'
        });
        return;
      }
      
      const result = await userService.updateProfile(userId, validationResult.data);
      
      if (!result.success) {
        const status = result.code === 'USER_NOT_FOUND' ? 404 : 400;
        res.status(status).json(result);
        return;
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Profil fotoğrafını güncelle
   */
  async updateProfilePicture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Profil fotoğrafı yüklenmedi',
          code: 'NO_FILE_UPLOADED'
        });
        return;
      }
      
      const result = await userService.updateProfilePicture(userId, req.file);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Spor dallarını güncelle
   */
  async updateSports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      
      // Veri doğrulama
      const validationResult = sportsUpdateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Doğrulama hatası',
          errors: validationResult.error.errors,
          code: 'VALIDATION_ERROR'
        });
        return;
      }
      
      const result = await userService.updateSports(userId, validationResult.data);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Başka bir kullanıcının profilini görüntüle
   */
  async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      
      const result = await userService.getUserProfile(userId);
      
      if (!result.success) {
        res.status(404).json(result);
        return;
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}; 