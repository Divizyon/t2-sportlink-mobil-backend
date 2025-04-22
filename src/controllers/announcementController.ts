import { Request, Response } from 'express';
import { Announcement } from '../models/Announcement';
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

/**
 * Duyuruları listeler
 */
export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const includeUnpublished = (req.query.includeUnpublished === 'true');
    
    // Admin kullanıcılar yayınlanmamış duyuruları da görebilir
    const isAdmin = req.user?.role === 'admin';
    
    // Parametreler
    const params = {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' as const },
      includeUnpublished: isAdmin && includeUnpublished
    };

    // Duyuruları getir
    const announcements = await Announcement.findMany(params);
    
    // Toplam duyuru sayısını hesapla
    const whereClause = !isAdmin || !includeUnpublished ? 
      {
        published: true,
        OR: [
          { start_date: null },
          { start_date: { lte: new Date() } }
        ],
        AND: [
          {
            OR: [
              { end_date: null },
              { end_date: { gte: new Date() } }
            ]
          }
        ]
      } : undefined;
    
    const total = await prisma.announcement.count({ where: whereClause });
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data: {
        announcements,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    });
  } catch (error: any) {
    console.error('Duyuru listeleme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Duyurular getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Aktif duyuruları listeler
 */
export const getActiveAnnouncements = async (req: Request, res: Response) => {
  try {
    // Aktif duyuruları getir
    const announcements = await Announcement.findActive();
    
    return res.status(200).json({
      success: true,
      data: {
        announcements,
        count: announcements.length
      }
    });
  } catch (error: any) {
    console.error('Aktif duyuru listeleme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Aktif duyurular getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Duyuru detayını görüntüler
 */
export const getAnnouncementById = async (req: Request, res: Response) => {
  try {
    const { announcementId } = req.params;

    const announcement = await Announcement.findUnique({ id: announcementId });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Duyuru bulunamadı'
      });
    }

    // Duyuru yayınlanmamışsa sadece admin kullanıcılar görebilir
    if (!announcement.published && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu duyuruyu görüntüleme yetkiniz yok'
      });
    }

    // Duyuru tarihi kontrolü
    const now = new Date();
    
    if (announcement.published && 
        ((announcement.start_date && announcement.start_date > now) || 
         (announcement.end_date && announcement.end_date < now)) && 
        req.user?.role !== 'admin') {
      return res.status(404).json({
        success: false,
        message: 'Duyuru bulunamadı veya aktif değil'
      });
    }

    return res.status(200).json({
      success: true,
      data: { announcement }
    });
  } catch (error: any) {
    console.error('Duyuru detayı getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Duyuru detayı getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Duyuru detayını slug ile görüntüler
 */
export const getAnnouncementBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const announcement = await Announcement.findBySlug(slug);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Duyuru bulunamadı'
      });
    }

    // Duyuru yayınlanmamışsa sadece admin kullanıcılar görebilir
    if (!announcement.published && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu duyuruyu görüntüleme yetkiniz yok'
      });
    }

    // Duyuru tarihi kontrolü
    const now = new Date();
    
    if (announcement.published && 
        ((announcement.start_date && announcement.start_date > now) || 
         (announcement.end_date && announcement.end_date < now)) && 
        req.user?.role !== 'admin') {
      return res.status(404).json({
        success: false,
        message: 'Duyuru bulunamadı veya aktif değil'
      });
    }

    return res.status(200).json({
      success: true,
      data: { announcement }
    });
  } catch (error: any) {
    console.error('Duyuru detayı getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Duyuru detayı getirilirken bir hata oluştu',
      error: error.message
    });
  }
}; 