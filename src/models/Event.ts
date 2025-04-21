import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export type EventCreateInput = Prisma.eventCreateInput;
export type EventUpdateInput = Prisma.eventUpdateInput;
export type EventWhereUniqueInput = Prisma.eventWhereUniqueInput;
export type EventWhereInput = Prisma.eventWhereInput;

/**
 * Etkinlik modeli
 */
export class Event {
  /**
   * Yeni bir etkinlik oluşturur
   */
  static async create(data: EventCreateInput) {
    return prisma.event.create({
      data,
    });
  }

  /**
   * Etkinlik bilgilerini günceller
   */
  static async update(where: EventWhereUniqueInput, data: EventUpdateInput) {
    return prisma.event.update({
      where,
      data,
    });
  }

  /**
   * Etkinliği siler
   */
  static async delete(where: EventWhereUniqueInput) {
    return prisma.event.delete({
      where,
    });
  }

  /**
   * Belirli bir etkinliği getirir
   */
  static async findUnique(where: EventWhereUniqueInput) {
    return prisma.event.findUnique({
      where,
      include: {
        creator: true,
        sport: true,
      },
    });
  }

  /**
   * Belirli bir koşula göre ilk etkinliği getirir
   */
  static async findFirst(where: EventWhereInput) {
    return prisma.event.findFirst({
      where,
    });
  }

  /**
   * Tüm etkinlikleri getirir
   */
  static async findMany(params?: {
    skip?: number;
    take?: number;
    where?: EventWhereInput;
    orderBy?: Prisma.eventOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params || {};
    return prisma.event.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            profile_picture: true,
          },
        },
        sport: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
                profile_picture: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            ratings: true,
          },
        },
      },
    });
  }

  /**
   * Etkinlik katılımcılarını getirir
   */
  static async getParticipants(eventId: string) {
    return prisma.event_participant.findMany({
      where: {
        event_id: eventId,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Etkinlik değerlendirmelerini getirir
   */
  static async getRatings(eventId: string) {
    return prisma.event_rating.findMany({
      where: {
        event_id: eventId,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Etkinliğe katılımcı ekler
   */
  static async addParticipant(eventId: string, userId: string, role: string = 'participant') {
    return prisma.event_participant.create({
      data: {
        event_id: eventId,
        user_id: userId,
        role,
      },
    });
  }

  /**
   * Etkinlikten katılımcı çıkarır
   */
  static async removeParticipant(eventId: string, userId: string) {
    return prisma.event_participant.delete({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
    });
  }

  /**
   * Etkinlik için değerlendirme ekler
   */
  static async addRating(eventId: string, userId: string, rating: number, review: string) {
    return prisma.event_rating.create({
      data: {
        event_id: eventId,
        user_id: userId,
        rating,
        review,
      },
    });
  }

  /**
   * Etkinlik için değerlendirme günceller
   */
  static async updateRating(id: string, rating: number, review: string) {
    return prisma.event_rating.update({
      where: { id },
      data: {
        rating,
        review,
      },
    });
  }

  /**
   * Etkinlik için değerlendirme siler
   */
  static async removeRating(id: string) {
    return prisma.event_rating.delete({
      where: { id },
    });
  }

  /**
   * Kullanıcının etkinlik için değerlendirmesini getirir
   */
  static async getUserRating(eventId: string, userId: string) {
    return prisma.event_rating.findFirst({
      where: {
        event_id: eventId,
        user_id: userId,
      },
    });
  }

  /**
   * Etkinliğin ortalama puanını hesaplar
   */
  static async getAverageRating(eventId: string) {
    const result = await prisma.event_rating.aggregate({
      where: {
        event_id: eventId,
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return {
      average: result._avg.rating || 0,
      count: result._count.rating || 0,
    };
  }

  /**
   * Belirli bir konuma yakın etkinlikleri getirir
   */
  static async findNearby(latitude: number, longitude: number, radiusKm: number = 10) {
    // PostgreSQL'in coğrafi sorgu özelliklerini kullanmak için özel sorgu
    // 1 derece yaklaşık olarak 111 km'ye eşittir
    const latDiff = radiusKm / 111;
    const lonDiff = radiusKm / (111 * Math.cos(latitude * (Math.PI / 180)));

    return prisma.event.findMany({
      where: {
        location_latitude: {
          gte: latitude - latDiff,
          lte: latitude + latDiff,
        },
        location_longitude: {
          gte: longitude - lonDiff,
          lte: longitude + lonDiff,
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
        sport: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });
  }

  /**
   * Gelecek etkinlikleri getirir
   */
  static async findUpcoming() {
    return prisma.event.findMany({
      where: {
        event_date: {
          gte: new Date(),
        },
        status: 'active',
      },
      orderBy: {
        event_date: 'asc',
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
          },
        },
        sport: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });
  }
} 