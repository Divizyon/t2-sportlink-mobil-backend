import { Request, Response } from 'express';
import { newsService } from '../services/news.service';

/**
 * Tüm haberleri getir
 */
export const getAllNews = async (req: Request, res: Response) => {
  try {
    const { 
      sport_id, 
      limit = '20', 
      offset = '0' 
    } = req.query;

    const filters = {
      sport_id: sport_id ? BigInt(sport_id as string) : undefined,
      limit: limit ? parseInt(limit as string) : 20,
      offset: offset ? parseInt(offset as string) : 0,
    };

    const news = await newsService.findAll(filters);
    
    return res.status(200).json({
      success: true,
      data: news,
      count: news.length,
      limit: filters.limit,
      offset: filters.offset
    });
  } catch (error: any) {
    console.error('Haberleri getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Haberler getirilirken bir hata oluştu.',
      error: error.message
    });
  }
};

/**
 * ID ile haber getir
 */
export const getNewsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Haber ID\'si gereklidir.'
      });
    }
    
    // Numeric ID kontrolü
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ID formatı. ID bir sayı olmalıdır.'
      });
    }
    
    try {
      const newsId = BigInt(id);
      const news = await newsService.findById(newsId);
      
      if (!news) {
        return res.status(404).json({
          success: false,
          message: 'Haber bulunamadı.'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: news
      });
    } catch (conversionError) {
      console.error('ID dönüştürme hatası:', conversionError);
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ID formatı.'
      });
    }
  } catch (error: any) {
    console.error('Haber getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Haber getirilirken bir hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Spor ID'sine göre haberleri getir
 */
export const getNewsBySportId = async (req: Request, res: Response) => {
  try {
    const { sportId } = req.params;
    const { limit = '10' } = req.query;
    
    if (!sportId) {
      return res.status(400).json({
        success: false,
        message: 'Spor ID\'si gereklidir.'
      });
    }
    
    const news = await newsService.findBySportId(
      BigInt(sportId), 
      parseInt(limit as string)
    );
    
    return res.status(200).json({
      success: true,
      data: news,
      count: news.length
    });
  } catch (error: any) {
    console.error('Spor haberlerini getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Spor haberleri getirilirken bir hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Son haberleri getir
 */
export const getLatestNews = async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    
    const news = await newsService.getLatestNews(parseInt(limit as string));
    
    return res.status(200).json({
      success: true,
      data: news,
      count: news.length
    });
  } catch (error: any) {
    console.error('Son haberleri getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Son haberler getirilirken bir hata oluştu.',
      error: error.message
    });
  }
}; 