import { Request, Response, NextFunction } from 'express';
import { userLoginService } from '../services/userLoginService';

export const userLoginController = {
  async getUserLoginHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Kullanıcı kimliği bulunamadı'
        });
        return;
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await userLoginService.getUserLoginHistory(userId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async recordLoginSuccess(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const { ip_address, device_info, location } = req.body;
      
      const userId = req.user?.id;
      
      if (!userId) {
        console.error('Kullanıcı giriş kaydı oluşturulamadı: Kullanıcı kimliği bulunamadı');
        next();
        return;
      }
      
      await userLoginService.createLoginRecord({
        user_id: userId,
        ip_address,
        device_info,
        status: 'success',
        location
      });

      next();
    } catch (error) {
      console.error('Kullanıcı giriş kaydı oluşturulamadı:', error);
      next();
    }
  }
}; 