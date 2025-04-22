import { Request, Response, NextFunction } from 'express';
import { sportService } from '../services/sportService';
import { z } from 'zod';

// ID parametresi doğrulama şeması
const idParamSchema = z.object({
  id: z.string().uuid('Geçerli bir UUID formatı olmalıdır'),
});

export const sportController = {
  /**
   * Tüm spor dallarını listele
   */
  async getAllSports(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = await sportService.getAllSports();
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.json(result);
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * Spor dalı detayını getir
   */
  async getSportById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      
      // ID parametresini doğrula
      const validationResult = idParamSchema.safeParse({ id });
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz ID formatı',
          errors: validationResult.error.errors,
        });
      }
      
      const result = await sportService.getSportById(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      return res.json(result);
    } catch (error: any) {
      next(error);
    }
  },
}; 