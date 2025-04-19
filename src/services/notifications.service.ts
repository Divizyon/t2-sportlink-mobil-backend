import { PrismaService } from './prisma.service';

interface CreateNotificationDTO {
  user_id: bigint;
  notification_type: string; // 'event_invitation', 'event_update', 'user_message', etc.
  content: string;
  read_status?: boolean;
  event_id: bigint;
}

interface UpdateNotificationDTO {
  read_status?: boolean;
  content?: string;
}

interface NotificationQueryParams {
  user_id?: bigint;
  notification_type?: string;
  read_status?: boolean;
  limit?: number;
  offset?: number;
}

class NotificationsService extends PrismaService {
  
  /**
   * Kullanıcının tüm bildirimlerini getirir
   */
  async findAll(params?: NotificationQueryParams) {
    const { user_id, notification_type, read_status, limit = 20, offset = 0 } = params || {};
    
    const whereConditions: any = {};
    
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
  async findById(id: bigint) {
    return this.prismaClient.notifications.findUnique({
      where: { id }
    });
  }
  
  /**
   * Yeni bir bildirim oluşturur
   */
  async create(notificationData: CreateNotificationDTO) {
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
  async update(id: bigint, notificationData: UpdateNotificationDTO) {
    return this.prismaClient.notifications.update({
      where: { id },
      data: notificationData
    });
  }
  
  /**
   * Bir bildirimi okundu olarak işaretler
   */
  async markAsRead(id: bigint) {
    return this.prismaClient.notifications.update({
      where: { id },
      data: { read_status: true }
    });
  }
  
  /**
   * Kullanıcının tüm bildirimlerini okundu olarak işaretler
   */
  async markAllAsRead(user_id: bigint) {
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
  async delete(id: bigint) {
    return this.prismaClient.notifications.delete({
      where: { id }
    });
  }
  
  /**
   * Kullanıcının tüm bildirimlerini siler
   */
  async deleteAllForUser(user_id: bigint) {
    return this.prismaClient.notifications.deleteMany({
      where: { user_id }
    });
  }
  
  /**
   * Etkinlik davetiyesi bildirimi oluşturur
   */
  async createEventInvitation(user_id: bigint, event_id: bigint, event_title: string, sender_name: string) {
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
  async createEventUpdate(event_id: bigint, event_title: string) {
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
  async getUnreadCount(user_id: bigint) {
    return this.prismaClient.notifications.count({
      where: {
        user_id,
        read_status: false
      }
    });
  }
}

// Singleton instance
export const notificationsService = new NotificationsService(); 