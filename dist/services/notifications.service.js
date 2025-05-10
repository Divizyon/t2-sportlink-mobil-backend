"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsService = void 0;
const prisma_service_1 = require("./prisma.service");
class NotificationsService extends prisma_service_1.PrismaService {
    /**
     * Kullanıcının tüm bildirimlerini getirir
     */
    async findAll(params) {
        const { user_id, notification_type, read_status, limit = 20, offset = 0 } = params || {};
        const whereConditions = {};
        if (user_id !== undefined) {
            whereConditions.user_id = user_id;
        }
        if (notification_type !== undefined) {
            whereConditions.notification_type = notification_type;
        }
        if (read_status !== undefined) {
            whereConditions.read_status = read_status;
        }
        return this.prismaClient.notifications.findMany({
            where: whereConditions,
            orderBy: {
                created_at: 'desc'
            },
            take: limit,
            skip: offset
        });
    }
    /**
     * Belirli bir bildirimi ID'ye göre getirir
     */
    async findById(id) {
        return this.prismaClient.notifications.findUnique({
            where: { id }
        });
    }
    /**
     * Yeni bir bildirim oluşturur
     */
    async create(notificationData) {
        return this.prismaClient.notifications.create({
            data: {
                ...notificationData,
                read_status: notificationData.read_status ?? false,
                created_at: new Date()
            }
        });
    }
    /**
     * Bir bildirimi günceller
     */
    async update(id, notificationData) {
        return this.prismaClient.notifications.update({
            where: { id },
            data: notificationData
        });
    }
    /**
     * Bir bildirimi okundu olarak işaretler
     */
    async markAsRead(id) {
        return this.prismaClient.notifications.update({
            where: { id },
            data: { read_status: true }
        });
    }
    /**
     * Kullanıcının tüm bildirimlerini okundu olarak işaretler
     */
    async markAllAsRead(user_id) {
        return this.prismaClient.notifications.updateMany({
            where: {
                user_id,
                read_status: false
            },
            data: { read_status: true }
        });
    }
    /**
     * Bir bildirimi siler
     */
    async delete(id) {
        return this.prismaClient.notifications.delete({
            where: { id }
        });
    }
    /**
     * Kullanıcının tüm bildirimlerini siler
     */
    async deleteAllForUser(user_id) {
        return this.prismaClient.notifications.deleteMany({
            where: { user_id }
        });
    }
    /**
     * Etkinlik davetiyesi bildirimi oluşturur
     */
    async createEventInvitation(user_id, event_id, event_title, sender_name) {
        return this.create({
            user_id,
            notification_type: 'event_invitation',
            content: `${sender_name} sizi "${event_title}" etkinliğine davet etti.`,
            event_id
        });
    }
    /**
     * Etkinlik güncelleme bildirimi oluşturur
     */
    async createEventUpdate(event_id, event_title) {
        // Önce etkinliğe katılan tüm kullanıcıları bul
        const participants = await this.prismaClient.event_Participants.findMany({
            where: { event_id },
            select: { user_id: true }
        });
        // Her katılımcı için bildirim oluştur
        const notifications = [];
        for (const participant of participants) {
            const notification = await this.create({
                user_id: participant.user_id,
                notification_type: 'event_update',
                content: `"${event_title}" etkinliği güncellendi. Detayları kontrol edin.`,
                event_id
            });
            notifications.push(notification);
        }
        return notifications;
    }
    /**
     * Kullanıcının okunmamış bildirim sayısını getirir
     */
    async getUnreadCount(user_id) {
        return this.prismaClient.notifications.count({
            where: {
                user_id,
                read_status: false
            }
        });
    }
}
// Singleton instance
exports.notificationsService = new NotificationsService();
//# sourceMappingURL=notifications.service.js.map