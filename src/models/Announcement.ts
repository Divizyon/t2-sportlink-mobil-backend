import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export type AnnouncementCreateInput = Prisma.announcementCreateInput;
export type AnnouncementUpdateInput = Prisma.announcementUpdateInput;
export type AnnouncementWhereUniqueInput = Prisma.announcementWhereUniqueInput;
export type AnnouncementWhereInput = Prisma.announcementWhereInput;

/**
 * Duyuru modeli
 */
export class Announcement {
  /**
   * Yeni bir duyuru oluşturur
   */
  static async create(data: AnnouncementCreateInput) {
    return prisma.announcement.create({
      data,
    });
  }

  /**
   * Duyuru bilgilerini günceller
   */
  static async update(where: AnnouncementWhereUniqueInput, data: AnnouncementUpdateInput) {
    return prisma.announcement.update({
      where,
      data,
    });
  }

  /**
   * Duyuruyu siler
   */
  static async delete(where: AnnouncementWhereUniqueInput) {
    return prisma.announcement.delete({
      where,
    });
  }

  /**
   * Belirli bir duyuruyu getirir
   */
  static async findUnique(where: AnnouncementWhereUniqueInput) {
    return prisma.announcement.findUnique({
      where,
      include: {
        creator: true,
      },
    });
  }

  /**
   * Belirli bir slug'a göre duyuru getirir
   */
  static async findBySlug(slug: string) {
    return prisma.announcement.findUnique({
      where: { slug },
      include: {
        creator: true,
      },
    });
  }

  /**
   * Tüm duyuruları getirir
   */
  static async findMany(params?: {
    skip?: number;
    take?: number;
    where?: AnnouncementWhereInput;
    orderBy?: Prisma.announcementOrderByWithRelationInput;
    includeUnpublished?: boolean;
  }) {
    const { skip, take, where, orderBy, includeUnpublished = false } = params || {};
    return prisma.announcement.findMany({
      skip,
      take,
      where: {
        ...where,
        ...(includeUnpublished ? {} : { published: true }),
        ...(includeUnpublished ? {} : { 
          OR: [
            { start_date: null },
            { start_date: { lte: new Date() } }
          ]
        }),
        ...(includeUnpublished ? {} : { 
          OR: [
            { end_date: null },
            { end_date: { gte: new Date() } }
          ]
        }),
      },
      orderBy: orderBy || { created_at: 'desc' },
      include: {
        creator: true,
      },
    });
  }

  /**
   * Aktif duyuruları getirir (yayınlanmış ve tarih aralığında olan)
   */
  static async findActive() {
    const now = new Date();
    
    return prisma.announcement.findMany({
      where: {
        published: true,
        AND: [
          {
            OR: [
              { start_date: null },
              { start_date: { lte: now } }
            ]
          },
          {
            OR: [
              { end_date: null },
              { end_date: { gte: now } }
            ]
          }
        ]
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        creator: true,
      },
    });
  }

  /**
   * Duyuruyu yayınlar
   */
  static async publish(id: string) {
    return prisma.announcement.update({
      where: { id },
      data: { published: true },
    });
  }

  /**
   * Duyuruyu yayından kaldırır
   */
  static async unpublish(id: string) {
    return prisma.announcement.update({
      where: { id },
      data: { published: false },
    });
  }

  /**
   * Duyuru için benzersiz bir slug oluşturur
   */
  static async generateUniqueSlug(title: string): Promise<string> {
    // Türkçe karakterleri ve diğer özel karakterleri temizleme
    let slug = title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
      
    // Slug'ın benzersiz olup olmadığını kontrol et
    let isUnique = false;
    let counter = 0;
    let uniqueSlug = slug;
    
    while (!isUnique) {
      const existing = await prisma.announcement.findUnique({
        where: { slug: uniqueSlug },
      });
      
      if (!existing) {
        isUnique = true;
      } else {
        counter++;
        uniqueSlug = `${slug}-${counter}`;
      }
    }
    
    return uniqueSlug;
  }
} 