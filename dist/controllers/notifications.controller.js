"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotificationById = exports.getUserNotifications = void 0;
const notifications_service_1 = require("../services/notifications.service");
/**
 * Kullanıcının bildirimlerini getirir
 */
const getUserNotifications = async (req, res) => {
    try {
        const userId = BigInt(req.params.userId);
        const { limit, offset, read_status, notification_type } = req.query;
        const params = {
            user_id: userId,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
            read_status: read_status !== undefined ? read_status === 'true' : undefined,
            notification_type: notification_type
        };
        const notifications = await notifications_service_1.notificationsService.findAll(params);
        return res.status(200).json({
            success: true,
            message: 'Bildirimler başarıyla getirildi.',
            data: notifications
        });
    }
    catch (error) {
        console.error('Bildirim getirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası.'
        });
    }
};
exports.getUserNotifications = getUserNotifications;
/**
 * Belirli bir bildirimi getirir
 */
const getNotificationById = async (req, res) => {
    try {
        const notificationId = BigInt(req.params.id);
        const notification = await notifications_service_1.notificationsService.findById(notificationId);
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
    }
    catch (error) {
        console.error('Bildirim getirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası.'
        });
    }
};
exports.getNotificationById = getNotificationById;
/**
 * Bir bildirimi okundu olarak işaretler
 */
const markAsRead = async (req, res) => {
    try {
        const notificationId = BigInt(req.params.id);
        // Bildirimin var olduğunu kontrol et
        const notification = await notifications_service_1.notificationsService.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Bildirim bulunamadı.'
            });
        }
        await notifications_service_1.notificationsService.markAsRead(notificationId);
        return res.status(200).json({
            success: true,
            message: 'Bildirim okundu olarak işaretlendi.'
        });
    }
    catch (error) {
        console.error('Bildirim okuma hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası.'
        });
    }
};
exports.markAsRead = markAsRead;
/**
 * Kullanıcının tüm bildirimlerini okundu olarak işaretler
 */
const markAllAsRead = async (req, res) => {
    try {
        const userId = BigInt(req.params.userId);
        await notifications_service_1.notificationsService.markAllAsRead(userId);
        return res.status(200).json({
            success: true,
            message: 'Tüm bildirimler okundu olarak işaretlendi.'
        });
    }
    catch (error) {
        console.error('Bildirimleri okuma hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası.'
        });
    }
};
exports.markAllAsRead = markAllAsRead;
/**
 * Bir bildirimi siler
 */
const deleteNotification = async (req, res) => {
    try {
        const notificationId = BigInt(req.params.id);
        // Bildirimin var olduğunu kontrol et
        const notification = await notifications_service_1.notificationsService.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Bildirim bulunamadı.'
            });
        }
        await notifications_service_1.notificationsService.delete(notificationId);
        return res.status(200).json({
            success: true,
            message: 'Bildirim başarıyla silindi.'
        });
    }
    catch (error) {
        console.error('Bildirim silme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası.'
        });
    }
};
exports.deleteNotification = deleteNotification;
/**
 * Kullanıcının okunmamış bildirim sayısını getirir
 */
const getUnreadCount = async (req, res) => {
    try {
        const userId = BigInt(req.params.userId);
        const count = await notifications_service_1.notificationsService.getUnreadCount(userId);
        return res.status(200).json({
            success: true,
            message: 'Okunmamış bildirim sayısı başarıyla getirildi.',
            data: { count }
        });
    }
    catch (error) {
        console.error('Bildirim sayısı getirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası.'
        });
    }
};
exports.getUnreadCount = getUnreadCount;
//# sourceMappingURL=notifications.controller.js.map