import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { NotificationType } from '../models/Notification';

// Bildirimleri listeleme
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '20');

    const result = await NotificationService.getUserNotifications(userId, page, limit);
    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error fetching notifications',
      code: 'NOTIFICATION_FETCH_ERROR'
    });
  }
};

// Okunmamış bildirim sayısını getirme
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const count = await NotificationService.getUnreadCount(userId);
    
    return res.status(200).json({ 
      success: true,
      count 
    });
  } catch (error) {
    logger.error('Error fetching unread count:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error fetching unread notification count',
      code: 'NOTIFICATION_COUNT_ERROR'
    });
  }
};

// Bildirimi okundu olarak işaretleme
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    await NotificationService.markAsRead(notificationId, userId);
    return res.status(200).json({ 
      success: true,
      message: 'Notification marked as read' 
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error updating notification',
      code: 'NOTIFICATION_UPDATE_ERROR'
    });
  }
};

// Tüm bildirimleri okundu olarak işaretleme
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const count = await NotificationService.markAllAsRead(userId);
    return res.status(200).json({ 
      success: true,
      message: 'All notifications marked as read',
      count
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error updating notifications',
      code: 'NOTIFICATION_UPDATE_ALL_ERROR'
    });
  }
};

// Test amaçlı bildirim gönderme
export const sendTestNotification = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      userId: z.string().uuid().optional(),
      title: z.string(),
      body: z.string(),
      type: z.enum(['event', 'news', 'friend_request', 'message', 'system', 'announcement'] as [NotificationType, ...NotificationType[]]),
      data: z.record(z.any()).optional(),
      redirectUrl: z.string().optional(),
    });

    const { userId, ...payload } = schema.parse(req.body);
    let result;
    
    if (userId) {
      // Admin veya test için belirli bir kullanıcıya gönder
      result = await NotificationService.sendToUser(userId, payload);
      logger.info(`Test notification sent to specific user ${userId}`);
    } else {
      // Mevcut kullanıcıya gönder
      const currentUserId = req.user.id;
      result = await NotificationService.sendToUser(currentUserId, payload);
      logger.info(`Test notification sent to current user ${currentUserId}`);
    }

    return res.status(200).json({ 
      success: true,
      message: 'Test notification sent successfully',
      notificationId: result
    });
  } catch (error) {
    logger.error('Error sending test notification:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error sending notification', 
      error: error instanceof Error ? error.message : String(error),
      code: 'NOTIFICATION_SEND_ERROR'
    });
  }
};