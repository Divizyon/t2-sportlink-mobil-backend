import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export type SportCreateInput = Prisma.sportCreateInput;
export type SportUpdateInput = Prisma.sportUpdateInput;
export type SportWhereUniqueInput = Prisma.sportWhereUniqueInput;
export type SportWhereInput = Prisma.sportWhereInput;

/**
 * Spor dalı modeli
 */
export class Sport {
  /**
   * Yeni bir spor dalı oluşturur
   */
  static async create(data: SportCreateInput) {
    return prisma.sport.create({
      data,
    });
  }

  /**
   * Spor dalı bilgilerini günceller
   */
  static async update(where: SportWhereUniqueInput, data: SportUpdateInput) {
    return prisma.sport.update({
      where,
      data,
    });
  }

  /**
   * Spor dalını siler
   */
  static async delete(where: SportWhereUniqueInput) {
    return prisma.sport.delete({
      where,
    });
  }

  /**
   * Belirli bir spor dalını getirir
   */
  static async findUnique(where: SportWhereUniqueInput) {
    return prisma.sport.findUnique({
      where,
    });
  }

  /**
   * Belirli bir koşula göre ilk spor dalını getirir
   */
  static async findFirst(where: SportWhereInput) {
    return prisma.sport.findFirst({
      where,
    });
  }

  /**
   * Tüm spor dallarını getirir
   */
  static async findMany(params?: {
    skip?: number;
    take?: number;
    where?: SportWhereInput;
    orderBy?: Prisma.sportOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params || {};
    return prisma.sport.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  /**
   * İsme göre spor dalı bulur
   */
  static async findByName(name: string) {
    return prisma.sport.findUnique({
      where: { name },
    });
  }

  /**
   * Bu spor dalına sahip kullanıcıları getirir
   */
  static async getUsers(sportId: string) {
    return prisma.user_sport.findMany({
      where: {
        sport_id: sportId,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Bu spor dalına ait etkinlikleri getirir
   */
  static async getEvents(sportId: string) {
    return prisma.event.findMany({
      where: {
        sport_id: sportId,
      },
    });
  }

  /**
   * Bu spor dalına ait haberleri getirir
   */
  static async getNews(sportId: string) {
    return prisma.news.findMany({
      where: {
        sport_id: sportId,
      },
    });
  }
} 