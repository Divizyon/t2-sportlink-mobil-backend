import { PrismaClient } from '@prisma/client';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { logger } from '../utils/logger';
import { supabase } from '../config/supabase';
import { NotificationPayload, NotificationResponse, NotificationType } from '../models/Notification';

const prisma = new PrismaClient();
const expo = new Expo();

export class NotificationService {
  /**
   * Tek bir kullanıcıya bildirim gönder
   */
  static async sendToUser(userId: string, payload: NotificationPayload): Promise<string | null> {
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
          ...(payload.data?.eventId ? { event_id: payload.data.eventId } : {})
        },
      });

      // 2. Kullanıcının cihaz tokenlarını al
      const deviceTokens = await prisma.deviceToken.findMany({
        where: { user_id: userId },
        select: { token: true, platform: true },
      });

      if (deviceTokens.length === 0) {
        logger.info(`User ${userId} has no device tokens registered.`);
        return notification.id;
      }

      // 3. Expo Push Notifications API kullanarak bildirim gönder
      const messages: ExpoPushMessage[] = [];

      for (const { token } of deviceTokens) {
        // Expo token geçerlilik kontrolü
        if (!Expo.isExpoPushToken(token)) {
          logger.warn(`Push token ${token} is not a valid Expo push token`);
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
            logger.info(`Push notification sent to user ${userId}`);
            
            // Geçersiz tokenları kontrol et
            ticketChunk.forEach((ticket, index) => {
              if (ticket.status === 'error') {
                const token = chunk[index].to as string;
                logger.error(`Error sending notification to token: ${token}`, ticket.details);
                
                if (ticket.details?.error === 'DeviceNotRegistered') {
                  // Geçersiz token'ı veritabanından sil
                  prisma.deviceToken.deleteMany({
                    where: { token },
                  }).catch(error => logger.error('Error deleting invalid token:', error));
                }
              }
            });
          } catch (error) {
            logger.error('Error sending push notification chunk:', error);
          }
        }
      }

      // 4. Supabase Realtime ile bildirim değişikliğini yayınla
      try {
        await supabase
          .from('realtime_notifications')
          .insert({
            user_id: userId,
            notification_id: notification.id,
            title: payload.title,
            body: payload.body,
            data: payload.data || {},
            type: payload.type,
          });
        logger.info(`Realtime notification published for user ${userId}`);
      } catch (error) {
        logger.error('Error publishing realtime notification:', error);
      }

      return notification.id;
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Birden fazla kullanıcıya bildirim gönder
   */
  static async sendToUsers(userIds: string[], payload: NotificationPayload): Promise<string[]> {
    const notificationIds: string[] = [];
    
    for (const userId of userIds) {
      try {
        const id = await this.sendToUser(userId, payload);
        if (id) notificationIds.push(id);
      } catch (error) {
        logger.error(`Error sending notification to user ${userId}:`, error);
      }
    }
    
    return notificationIds;
  }

  /**
   * Belirli bir etkinlik için katılımcılara bildirim gönder
   */
  static async sendEventNotification(eventId: string, payload: NotificationPayload): Promise<string[]> {
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
      const enhancedPayload: NotificationPayload = {
        ...payload,
        data: { 
          ...(payload.data || {}),
          eventId,
          eventTitle: event.title
        }
      };
      
      return this.sendToUsers(userIds, enhancedPayload);
    } catch (error) {
      logger.error('Error sending event notification:', error);
      throw error;
    }
  }

  /**
   * Tüm kullanıcılara bildirim gönder (haberler, duyurular için)
   * Büyük sistemlerde batch işlem yaparak gönderim yapılmalı
   */
  static async sendToAll(payload: NotificationPayload, batchSize = 100): Promise<number> {
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
        
        if (users.length === 0) break;
        
        const userIds = users.map(user => user.id);
        await this.sendToUsers(userIds, payload);
        
        totalCount += users.length;
        skip += batchSize;
        
        logger.info(`Sent notifications to ${totalCount} users so far`);
      }
      
      return totalCount;
    } catch (error) {
      logger.error('Error sending notification to all users:', error);
      throw error;
    }
  }

  /**
   * Okunmamış bildirimleri getir
   */
  static async getUserNotifications(userId: string, page = 1, limit = 20): Promise<NotificationResponse> {
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
    } catch (error) {
      logger.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  /**
   * Okunmamış bildirim sayısını getir
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: {
          user_id: userId,
          is_read: false,
        },
      });
    } catch (error) {
      logger.error('Error counting unread notifications:', error);
      throw error;
    }
  }

  /**
   * Bildirimi okundu olarak işaretle
   */
  static async markAsRead(notificationId: string, userId: string): Promise<void> {
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
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Tüm bildirimleri okundu olarak işaretle
   */
  static async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: { 
          user_id: userId,
          is_read: false
        },
        data: { is_read: true },
      });
      
      return result.count;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}