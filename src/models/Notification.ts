import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export type NotificationCreateInput = Prisma.notificationCreateInput;
export type NotificationUpdateInput = Prisma.notificationUpdateInput;
export type NotificationWhereUniqueInput = Prisma.notificationWhereUniqueInput;
export type NotificationWhereInput = Prisma.notificationWhereInput;

/**
 * Bildirim modeli
 */
export class Notification {
  /**
   * Yeni bir bildirim oluşturur
   */
  static async create(data: NotificationCreateInput) {
    return prisma.notification.create({
      data,
    });
  }

  /**
   * Bildirim bilgilerini günceller
   */
  static async update(where: NotificationWhereUniqueInput, data: NotificationUpdateInput) {
    return prisma.notification.update({
      where,
      data,
    });
  }

  /**
   * Bildirimi siler
   */
  static async delete(where: NotificationWhereUniqueInput) {
    return prisma.notification.delete({
      where,
    });
  }

  /**
   * Belirli bir bildirimi getirir
   */
  static async findUnique(where: NotificationWhereUniqueInput) {
    return prisma.notification.findUnique({
      where,
      include: {
        user: true,
        event: true,
      },
    });
  }

  /**
   * Kullanıcının bildirimlerini getirir
   */
  static async findByUser(userId: string, params?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.notificationOrderByWithRelationInput;
    includeRead?: boolean;
  }) {
    const { skip, take, orderBy, includeRead = false } = params || {};
    return prisma.notification.findMany({
      where: {
        user_id: userId,
        ...(includeRead ? {} : { read_status: false }),
      },
      skip,
      take,
      orderBy: orderBy || { created_at: 'desc' },
      include: {
        event: true,
      },
    });
  }

  /**
   * Bildirimi okundu olarak işaretler
   */
  static async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read_status: true },
    });
  }

  /**
   * Kullanıcının tüm bildirimlerini okundu olarak işaretler
   */
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        user_id: userId,
        read_status: false,
      },
      data: {
        read_status: true,
      },
    });
  }

  /**
   * Okunmamış bildirim sayısını getirir
   */
  static async countUnread(userId: string) {
    return prisma.notification.count({
      where: {
        user_id: userId,
        read_status: false,
      },
    });
  }

  /**
   * Etkinlik katılımcılarına bildirim gönderir
   */
  static async sendToEventParticipants(eventId: string, content: string, notificationType: string) {
    const participants = await prisma.event_participant.findMany({
      where: {
        event_id: eventId,
      },
      select: {
        user_id: true,
      },
    });

    const notifications = participants.map((participant) => ({
      user_id: participant.user_id,
      event_id: eventId,
      content,
      notification_type: notificationType,
    }));

    return prisma.notification.createMany({
      data: notifications,
    });
  }
} 