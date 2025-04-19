import prisma from '../config/prisma';

/**
 * Temel Prisma servis sınıfı
 * Tüm model-spesifik servisler bu sınıfı kullanır
 */
export class PrismaService {
  protected prismaClient = prisma;
}

/**
 * Singleton kalıbı ile bir Prisma Service örneği döndürür
 */
export const getPrismaService = (() => {
  let instance: PrismaService;
  
  return () => {
    if (!instance) {
      instance = new PrismaService();
    }
    return instance;
  };
})(); 