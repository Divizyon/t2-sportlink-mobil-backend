import { Request, Response } from 'express';
import { notificationsService } from '../services/notifications.service';

/**
 * Kullanıcının bildirimlerini getirir
 */
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = BigInt(req.params.userId);
    const { limit, offset, read_status, notification_type } = req.query;
    
    const params = {
      user_id: userId,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      read_status: read_status !== undefined ? read_status === 'true' : undefined,
      notification_type: notification_type as string | undefined
    };
    
    const notifications = await notificationsService.findAll(params);
    
    return res.status(200).json({
      success: true,
      message: 'Bildirimler başarıyla getirildi.',
      data: notifications
    });
  } catch (error) {
    console.error('Bildirim getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Belirli bir bildirimi getirir
 */
export const getNotificationById = async (req: Request, res: Response) => {
  try {
    const notificationId = BigInt(req.params.id);
    
    const notification = await notificationsService.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı.'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Bildirim başarıyla getirildi.',
      data: notification
    });
  } catch (error) {
    console.error('Bildirim getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Bir bildirimi okundu olarak işaretler
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notificationId = BigInt(req.params.id);
    
    // Bildirimin var olduğunu kontrol et
    const notification = await notificationsService.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı.'
      });
    }
    
    await notificationsService.markAsRead(notificationId);
    
    return res.status(200).json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi.'
    });
  } catch (error) {
    console.error('Bildirim okuma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Kullanıcının tüm bildirimlerini okundu olarak işaretler
 */
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = BigInt(req.params.userId);
    
    await notificationsService.markAllAsRead(userId);
    
    return res.status(200).json({
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi.'
    });
  } catch (error) {
    console.error('Bildirimleri okuma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Bir bildirimi siler
 */
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const notificationId = BigInt(req.params.id);
    
    // Bildirimin var olduğunu kontrol et
    const notification = await notificationsService.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Bildirim bulunamadı.'
      });
    }
    
    await notificationsService.delete(notificationId);
    
    return res.status(200).json({
      success: true,
      message: 'Bildirim başarıyla silindi.'
    });
  } catch (error) {
    console.error('Bildirim silme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Kullanıcının okunmamış bildirim sayısını getirir
 */
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = BigInt(req.params.userId);
    
    const count = await notificationsService.getUnreadCount(userId);
    
    return res.status(200).json({
      success: true,
      message: 'Okunmamış bildirim sayısı başarıyla getirildi.',
      data: { count }
    });
  } catch (error) {
    console.error('Bildirim sayısı getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
}; 