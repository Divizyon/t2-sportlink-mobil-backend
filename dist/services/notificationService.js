"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const expo_server_sdk_1 = require("expo-server-sdk");
const logger_1 = require("../utils/logger");
const supabase_1 = require("../config/supabase");
const prisma = new client_1.PrismaClient();
const expo = new expo_server_sdk_1.Expo();
class NotificationService {
    /**
     * Tek bir kullanıcıya bildirim gönder
     */
    static async sendToUser(userId, payload) {
        var _a;
        try {
            // 1. Veritabanına bildirimi kaydet
            const notification = await prisma.notification.create({
                data: {
                    user_id: userId,
                    title: payload.title,
                    body: payload.body,
                    data: payload.data || {},
                    type: payload.type,
                    redirect_url: payload.redirectUrl,
                    ...(((_a = payload.data) === null || _a === void 0 ? void 0 : _a.eventId) ? { event_id: payload.data.eventId } : {})
                },
            });
            // 2. Kullanıcının cihaz tokenlarını al
            const deviceTokens = await prisma.deviceToken.findMany({
                where: { user_id: userId },
                select: { token: true, platform: true },
            });
            if (deviceTokens.length === 0) {
                logger_1.logger.info(`User ${userId} has no device tokens registered.`);
                return notification.id;
            }
            // 3. Expo Push Notifications API kullanarak bildirim gönder
            const messages = [];
            for (const { token } of deviceTokens) {
                // Expo token geçerlilik kontrolü
                if (!expo_server_sdk_1.Expo.isExpoPushToken(token)) {
                    logger_1.logger.warn(`Push token ${token} is not a valid Expo push token`);
                    continue;
                }
                messages.push({
                    to: token,
                    sound: 'default',
                    title: payload.title,
                    body: payload.body,
                    data: {
                        ...(payload.data || {}),
                        type: payload.type,
                        redirectUrl: payload.redirectUrl || '',
                        notificationId: notification.id
                    },
                    priority: 'high',
                });
            }
            // Bildirimleri gruplar halinde gönder (Expo rate limit nedeniyle)
            if (messages.length > 0) {
                const chunks = expo.chunkPushNotifications(messages);
                for (const chunk of chunks) {
                    try {
                        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                        logger_1.logger.info(`Push notification sent to user ${userId}`);
                        // Geçersiz tokenları kontrol et
                        ticketChunk.forEach((ticket, index) => {
                            var _a;
                            if (ticket.status === 'error') {
                                const token = chunk[index].to;
                                logger_1.logger.error(`Error sending notification to token: ${token}`, ticket.details);
                                if (((_a = ticket.details) === null || _a === void 0 ? void 0 : _a.error) === 'DeviceNotRegistered') {
                                    // Geçersiz token'ı veritabanından sil
                                    prisma.deviceToken.deleteMany({
                                        where: { token },
                                    }).catch(error => logger_1.logger.error('Error deleting invalid token:', error));
                                }
                            }
                        });
                    }
                    catch (error) {
                        logger_1.logger.error('Error sending push notification chunk:', error);
                    }
                }
            }
            // 4. Supabase Realtime ile bildirim değişikliğini yayınla
            try {
                await supabase_1.supabase
                    .from('realtime_notifications')
                    .insert({
                    user_id: userId,
                    notification_id: notification.id,
                    title: payload.title,
                    body: payload.body,
                    data: payload.data || {},
                    type: payload.type,
                });
                logger_1.logger.info(`Realtime notification published for user ${userId}`);
            }
            catch (error) {
                logger_1.logger.error('Error publishing realtime notification:', error);
            }
            return notification.id;
        }
        catch (error) {
            logger_1.logger.error('Error sending notification:', error);
            throw error;
        }
    }
    /**
     * Birden fazla kullanıcıya bildirim gönder
     */
    static async sendToUsers(userIds, payload) {
        const notificationIds = [];
        for (const userId of userIds) {
            try {
                const id = await this.sendToUser(userId, payload);
                if (id)
                    notificationIds.push(id);
            }
            catch (error) {
                logger_1.logger.error(`Error sending notification to user ${userId}:`, error);
            }
        }
        return notificationIds;
    }
    /**
     * Belirli bir etkinlik için katılımcılara bildirim gönder
     */
    static async sendEventNotification(eventId, payload) {
        try {
            // Etkinliği al
            const event = await prisma.event.findUnique({
                where: { id: eventId },
                select: { title: true }
            });
            if (!event) {
                throw new Error(`Event with ID ${eventId} not found`);
            }
            // Etkinliğe katılan kullanıcıları bul
            const participants = await prisma.event_participant.findMany({
                where: { event_id: eventId },
                select: { user_id: true },
            });
            const userIds = participants.map(p => p.user_id);
            // Etkinlik başlığını ekle
            const enhancedPayload = {
                ...payload,
                data: {
                    ...(payload.data || {}),
                    eventId,
                    eventTitle: event.title
                }
            };
            return this.sendToUsers(userIds, enhancedPayload);
        }
        catch (error) {
            logger_1.logger.error('Error sending event notification:', error);
            throw error;
        }
    }
    /**
     * Tüm kullanıcılara bildirim gönder (haberler, duyurular için)
     * Büyük sistemlerde batch işlem yaparak gönderim yapılmalı
     */
    static async sendToAll(payload, batchSize = 100) {
        try {
            let totalCount = 0;
            let skip = 0;
            // Kullanıcıları sayfalar halinde al ve bildirim gönder
            while (true) {
                const users = await prisma.user.findMany({
                    select: { id: true },
                    take: batchSize,
                    skip: skip,
                });
                if (users.length === 0)
                    break;
                const userIds = users.map(user => user.id);
                await this.sendToUsers(userIds, payload);
                totalCount += users.length;
                skip += batchSize;
                logger_1.logger.info(`Sent notifications to ${totalCount} users so far`);
            }
            return totalCount;
        }
        catch (error) {
            logger_1.logger.error('Error sending notification to all users:', error);
            throw error;
        }
    }
    /**
     * Okunmamış bildirimleri getir
     */
    static async getUserNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        try {
            const [notifications, total] = await Promise.all([
                prisma.notification.findMany({
                    where: { user_id: userId },
                    orderBy: { created_at: 'desc' },
                    skip,
                    take: limit,
                    include: {
                        event: {
                            select: {
                                id: true,
                                title: true,
                                event_date: true
                            }
                        }
                    }
                }),
                prisma.notification.count({
                    where: { user_id: userId },
                }),
            ]);
            return {
                notifications,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Error fetching user notifications:', error);
            throw error;
        }
    }
    /**
     * Okunmamış bildirim sayısını getir
     */
    static async getUnreadCount(userId) {
        try {
            return await prisma.notification.count({
                where: {
                    user_id: userId,
                    is_read: false,
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Error counting unread notifications:', error);
            throw error;
        }
    }
    /**
     * Bildirimi okundu olarak işaretle
     */
    static async markAsRead(notificationId, userId) {
        try {
            await prisma.notification.updateMany({
                where: {
                    id: notificationId,
                    user_id: userId,
                },
                data: {
                    is_read: true,
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Error marking notification as read:', error);
            throw error;
        }
    }
    /**
     * Tüm bildirimleri okundu olarak işaretle
     */
    static async markAllAsRead(userId) {
        try {
            const result = await prisma.notification.updateMany({
                where: {
                    user_id: userId,
                    is_read: false
                },
                data: { is_read: true },
            });
            return result.count;
        }
        catch (error) {
            logger_1.logger.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notificationService.js.map