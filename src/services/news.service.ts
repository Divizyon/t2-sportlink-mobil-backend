import { PrismaService } from './prisma.service';
import { NewsFilters } from '../models/news';

export class NewsService extends PrismaService {
  /**
   * Tüm haberleri getirir
   */
  async findAll(filters?: NewsFilters) {
    try {
      const where: any = {};
      
      // Filtreleri uygula
      if (filters?.sport_id) {
        where.sport_id = filters.sport_id;
      }
      
      return this.prismaClient.news.findMany({
        where,
        orderBy: {
          published_date: 'desc'
        },
        take: filters?.limit || 20,
        skip: filters?.offset || 0,
        include: {
          sport: true
        }
      });
    } catch (error) {
      console.error('Haberleri getirme hatası:', error);
      throw error;
    }
  }

  /**
   * ID ile haber getirir
   */
  async findById(id: bigint) {
    try {
      // ID kontrol
      if (id <= BigInt(0)) {
        throw new Error('Geçersiz ID: 0 veya negatif değer olamaz');
      }
      
      return this.prismaClient.news.findUnique({
        where: { id },
        include: {
          sport: true
        }
      });
    } catch (error) {
      console.error('Haber getirme hatası (ID):', error);
      throw error;
    }
  }

  /**
   * Spor ID'sine göre haberleri getirir
   */
  async findBySportId(sportId: bigint, limit: number = 10) {
    try {
      return this.prismaClient.news.findMany({
        where: { sport_id: sportId },
        orderBy: {
          published_date: 'desc'
        },
        take: limit,
        include: {
          sport: true
        }
      });
    } catch (error) {
      console.error('Spor haberlerini getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Son haberleri getirir
   */
  async getLatestNews(limit: number = 10) {
    try {
      return this.prismaClient.news.findMany({
        orderBy: {
          published_date: 'desc'
        },
        take: limit,
        include: {
          sport: true
        }
      });
    } catch (error) {
      console.error('Son haberleri getirme hatası:', error);
      throw error;
    }
  }
}

// Singleton instance
export const newsService = new NewsService(); 