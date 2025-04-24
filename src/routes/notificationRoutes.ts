import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, sendTestNotification, getUnreadCount } from '../controllers/notificationController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Bildirim listeleme, işaretleme ve test için rotalar
router.get('/', authenticate, getNotifications);
router.get('/unread/count', authenticate, getUnreadCount);
router.patch('/:notificationId/read', authenticate, markAsRead);
router.patch('/read-all', authenticate, markAllAsRead);
router.post('/test', authenticate, sendTestNotification);

export default router;