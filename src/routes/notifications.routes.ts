import { Router } from 'express';
import {
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} from '../controllers/notifications.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = Router();

// Kullanıcı bildirimlerini getir (kimlik doğrulama gerekli)
router.get('/user/:userId', isAuthenticated, getUserNotifications);

// Okunmamış bildirim sayısını getir (kimlik doğrulama gerekli)
router.get('/user/:userId/unread-count', isAuthenticated, getUnreadCount);

// Tüm bildirimleri okundu olarak işaretle (kimlik doğrulama gerekli)
router.put('/user/:userId/mark-all-as-read', isAuthenticated, markAllAsRead);

// Bildirimi okundu olarak işaretle (kimlik doğrulama gerekli)
router.put('/:id/mark-as-read', isAuthenticated, markAsRead);

// Belirli bir bildirimi getir (kimlik doğrulama gerekli)
router.get('/:id', isAuthenticated, getNotificationById);

// Bildirimi sil (kimlik doğrulama gerekli)
router.delete('/:id', isAuthenticated, deleteNotification);

export default router; 