import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export type NewsCreateInput = Prisma.newsCreateInput;
export type NewsUpdateInput = Prisma.newsUpdateInput;
export type NewsWhereUniqueInput = Prisma.newsWhereUniqueInput;
export type NewsWhereInput = Prisma.newsWhereInput;

/**
 * Haber modeli
 */
export class News {
  /**
   * Yeni bir haber oluşturur
   */
  static async create(data: NewsCreateInput) {
    return prisma.news.create({
      data,
    });
  }

  /**
   * Haber bilgilerini günceller
   */
  static async update(where: NewsWhereUniqueInput, data: NewsUpdateInput) {
    return prisma.news.update({
      where,
      data,
    });
  }

  /**
   * Haberi siler
   */
  static async delete(where: NewsWhereUniqueInput) {
    return prisma.news.delete({
      where,
    });
  }

  /**
   * Belirli bir haberi getirir
   */
  static async findUnique(where: NewsWhereUniqueInput) {
    return prisma.news.findUnique({
      where,
      include: {
        sport: true,
      },
    });
  }

  /**
   * Belirli bir koşula göre ilk haberi getirir
   */
  static async findFirst(where: NewsWhereInput) {
    return prisma.news.findFirst({
      where,
    });
  }

  /**
   * Tüm haberleri getirir
   */
  static async findMany(params?: {
    skip?: number;
    take?: number;
    where?: NewsWhereInput;
    orderBy?: Prisma.newsOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params || {};
    return prisma.news.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        sport: true,
      },
    });
  }

  /**
   * Spor dalına göre haberleri getirir
   */
  static async findBySport(sportId: string, params?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.newsOrderByWithRelationInput;
  }) {
    const { skip, take, orderBy } = params || {};
    return prisma.news.findMany({
      where: {
        sport_id: sportId,
      },
      skip,
      take,
      orderBy: orderBy || { published_date: 'desc' },
      include: {
        sport: true,
      },
    });
  }

  /**
   * En son haberleri getirir
   */
  static async findLatest(limit: number = 10) {
    return prisma.news.findMany({
      take: limit,
      orderBy: {
        published_date: 'desc',
      },
      include: {
        sport: true,
      },
    });
  }

  /**
   * Anahtar kelimeye göre haberleri arar
   */
  static async search(keyword: string, params?: {
    skip?: number;
    take?: number;
  }) {
    const { skip, take } = params || {};
    return prisma.news.findMany({
      where: {
        OR: [
          {
            title: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
        ],
      },
      skip,
      take,
      orderBy: {
        published_date: 'desc',
      },
      include: {
        sport: true,
      },
    });
  }
} 