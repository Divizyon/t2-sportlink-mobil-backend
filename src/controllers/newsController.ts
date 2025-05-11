import { Request, Response } from 'express';
import { News } from '../models/news';
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

/**
 * Tüm haberleri listeler
 */
export const getAllNews = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sportId = req.query.sportId as string;

    const skip = (page - 1) * limit;

    // Sport ID'ye göre filtrelenecekse sorguya ekle
    const whereCondition = sportId ? { sport_id: sportId } : {};

    // Toplam kayıt sayısını hesapla
    const totalCount = await prisma.news.count({
      where: whereCondition
    });

    // Haberleri getir
    const news = await prisma.news.findMany({
      skip,
      take: limit,
      where: whereCondition,
      orderBy: {
        created_at: 'desc' as Prisma.SortOrder
      },
      include: {
        sport: true
      }
    });

    // Meta bilgileri oluştur
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      status: true,
      data: news,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Haberler alınırken hata oluştu:', error);
    return res.status(500).json({
      status: false,
      message: 'Haberler alınırken bir hata oluştu.'
    });
  }
};

/**
 * Haber detayını görüntüler
 */
export const getNewsById = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;

    const news = await News.findUnique({ id: newsId });

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Haber bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      data: { news }
    });
  } catch (error: any) {
    console.error('Haber detayı getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Haber detayı getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Haber arama işlemi yapar
 */
export const searchNews = async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Arama yapmak için bir anahtar kelime girin'
      });
    }

    const news = await News.search(keyword, {
      skip: (page - 1) * limit,
      take: limit
    });

    // Tüm eşleşen haberlerin sayısını getirmek için
    const allMatches = await prisma.news.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { content: { contains: keyword, mode: 'insensitive' } }
        ]
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        news,
        pagination: {
          page,
          limit,
          total: allMatches.length,
          totalPages: Math.ceil(allMatches.length / limit)
        },
        keyword
      }
    });
  } catch (error: any) {
    console.error('Haber arama hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Haberler aranırken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Spor dalına göre haberleri listeler
 */
export const getNewsBySport = async (req: Request, res: Response) => {
  try {
    const { sportId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Spor dalının varlığını kontrol et
    const sport = await prisma.sport.findUnique({
      where: { id: sportId }
    });

    if (!sport) {
      return res.status(404).json({
        success: false,
        message: 'Spor dalı bulunamadı'
      });
    }

    // Spor dalına ait haberleri getir
    const news = await News.findBySport(sportId, {
      skip: (page - 1) * limit,
      take: limit
    });

    // Toplam haber sayısını bul
    const total = await prisma.news.count({
      where: { sport_id: sportId }
    });

    return res.status(200).json({
      success: true,
      data: {
        news,
        sport,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    console.error('Spor dalına göre haber listeleme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Spor dalına ait haberler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * En son haberleri listeler
 */
export const getLatestNews = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const news = await News.findLatest(limit);

    return res.status(200).json({
      success: true,
      data: { news }
    });
  } catch (error: any) {
    console.error('En son haberler hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'En son haberler getirilirken bir hata oluştu',
      error: error.message
    });
  }
}; 