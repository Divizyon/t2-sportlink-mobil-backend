import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const sportService = {
  /**
   * Tüm spor dallarını listele
   */
  async getAllSports() {
    try {
      const sports = await prisma.sport.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      return {
        success: true,
        data: sports,
      };
    } catch (error) {
      console.error('Spor dalları listelenirken hata oluştu:', error);
      
      // Prisma hata kontrolü
      if (error instanceof Prisma.PrismaClientKnownRequestError || 
          error instanceof Prisma.PrismaClientValidationError) {
        return {
          success: false,
          message: 'Veritabanı hatası',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
      }

      return {
        success: false,
        message: 'Spor dalları listelenirken bir hata oluştu',
      };
    }
  },

  /**
   * Spor dalı detayını getir
   */
  async getSportById(id: string) {
    try {
      const sport = await prisma.sport.findUnique({
        where: { id },
        include: {
          events: {
            take: 5,
            orderBy: {
              created_at: 'desc',
            },
          },
        },
      });

      if (!sport) {
        return {
          success: false,
          message: 'Spor dalı bulunamadı',
        };
      }

      return {
        success: true,
        data: sport,
      };
    } catch (error) {
      console.error('Spor dalı detayı getirilirken hata oluştu:', error);
      
      // Prisma hata kontrolü
      if (error instanceof Prisma.PrismaClientKnownRequestError || 
          error instanceof Prisma.PrismaClientValidationError) {
        return {
          success: false,
          message: 'Veritabanı hatası',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
      }

      return {
        success: false,
        message: 'Spor dalı detayı getirilirken bir hata oluştu',
      };
    }
  },
}; 