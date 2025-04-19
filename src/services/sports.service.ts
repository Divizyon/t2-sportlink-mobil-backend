import { PrismaService } from './prisma.service';

/**
 * Spor servisi için arayüz
 */
export interface CreateSportDTO {
  name: string;
  description: string;
  icon: string;
}

export interface UpdateSportDTO {
  name?: string;
  description?: string;
  icon?: string;
}

/**
 * Spor servisi
 */
export class SportsService extends PrismaService {
  /**
   * Tüm sporları getirir
   */
  async findAll() {
    return this.prismaClient.sports.findMany();
  }

  /**
   * ID'ye göre spor getirir
   */
  async findById(id: BigInt) {
    return this.prismaClient.sports.findUnique({
      where: { id: Number(id) }
    });
  }

  /**
   * İsme göre spor getirir
   */
  async findByName(name: string) {
    return this.prismaClient.sports.findFirst({
      where: { name }
    });
  }

  /**
   * Yeni spor oluşturur
   */
  async create(sportData: CreateSportDTO) {
    return this.prismaClient.sports.create({
      data: sportData
    });
  }

  /**
   * Spor günceller
   */
  async update(id: BigInt, sportData: UpdateSportDTO) {
    return this.prismaClient.sports.update({
      where: { id: Number(id) },
      data: sportData
    });
  }

  /**
   * Spor siler
   */
  async delete(id: BigInt) {
    return this.prismaClient.sports.delete({
      where: { id: Number(id) }
    });
  }

  /**
   * Kullanıcının ilgilendiği sporları getirir
   */
  async getUserSports(userId: BigInt) {
    return this.prismaClient.user_Sports.findMany({
      where: { user_id: Number(userId) },
      include: { sport: true }
    });
  }

  /**
   * Kullanıcıya spor ekler
   */
  async addUserSport(userId: BigInt, sportId: BigInt, skillLevel: string) {
    return this.prismaClient.user_Sports.create({
      data: {
        user_id: Number(userId),
        sport_id: Number(sportId),
        skill_level: skillLevel
      }
    });
  }

  /**
   * Kullanıcıdan spor çıkarır
   */
  async removeUserSport(userId: BigInt, sportId: BigInt) {
    return this.prismaClient.user_Sports.delete({
      where: {
        user_id_sport_id: {
          user_id: Number(userId),
          sport_id: Number(sportId)
        }
      }
    });
  }
}

// Singleton instance
export const sportsService = new SportsService(); 