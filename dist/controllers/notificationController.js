"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestNotification = exports.markAllAsRead = exports.markAsRead = exports.getUnreadCount = exports.getNotifications = void 0;
const notificationService_1 = require("../services/notificationService");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
// Bildirimleri listeleme
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '20');
        const result = await notificationService_1.NotificationService.getUserNotifications(userId, page, limit);
        return res.status(200).json(result);
    }
    catch (error) {
        logger_1.logger.error('Error fetching notifications:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            code: 'NOTIFICATION_FETCH_ERROR'
        });
    }
};
exports.getNotifications = getNotifications;
// Okunmamış bildirim sayısını getirme
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await notificationService_1.NotificationService.getUnreadCount(userId);
        return res.status(200).json({
            success: true,
            count
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching unread count:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching unread notification count',
            code: 'NOTIFICATION_COUNT_ERROR'
        });
    }
};
exports.getUnreadCount = getUnreadCount;
// Bildirimi okundu olarak işaretleme
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notificationId } = req.params;
        await notificationService_1.NotificationService.markAsRead(notificationId, userId);
        return res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    }
    catch (error) {
        logger_1.logger.error('Error marking notification as read:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating notification',
            code: 'NOTIFICATION_UPDATE_ERROR'
        });
    }
};
exports.markAsRead = markAsRead;
// Tüm bildirimleri okundu olarak işaretleme
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await notificationService_1.NotificationService.markAllAsRead(userId);
        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            count
        });
    }
    catch (error) {
        logger_1.logger.error('Error marking all notifications as read:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating notifications',
            code: 'NOTIFICATION_UPDATE_ALL_ERROR'
        });
    }
};
exports.markAllAsRead = markAllAsRead;
// Test amaçlı bildirim gönderme
const sendTestNotification = async (req, res) => {
    try {
        const schema = zod_1.z.object({
            userId: zod_1.z.string().uuid().optional(),
            title: zod_1.z.string(),
            body: zod_1.z.string(),
            type: zod_1.z.enum(['event', 'news', 'friend_request', 'message', 'system', 'announcement']),
            data: zod_1.z.record(zod_1.z.any()).optional(),
            redirectUrl: zod_1.z.string().optional(),
        });
        const { userId, ...payload } = schema.parse(req.body);
        let result;
        if (userId) {
            // Admin veya test için belirli bir kullanıcıya gönder
            result = await notificationService_1.NotificationService.sendToUser(userId, payload);
            logger_1.logger.info(`Test notification sent to specific user ${userId}`);
        }
        else {
            // Mevcut kullanıcıya gönder
            const currentUserId = req.user.id;
            result = await notificationService_1.NotificationService.sendToUser(currentUserId, payload);
            logger_1.logger.info(`Test notification sent to current user ${currentUserId}`);
        }
        return res.status(200).json({
            success: true,
            message: 'Test notification sent successfully',
            notificationId: result
        });
    }
    catch (error) {
        logger_1.logger.error('Error sending test notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Error sending notification',
            error: error instanceof Error ? error.message : String(error),
            code: 'NOTIFICATION_SEND_ERROR'
        });
    }
};
exports.sendTestNotification = sendTestNotification;
//# sourceMappingURL=notificationController.js.map