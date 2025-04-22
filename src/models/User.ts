import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export type UserCreateInput = Prisma.userCreateInput;
export type UserUpdateInput = Prisma.userUpdateInput;
export type UserWhereUniqueInput = Prisma.userWhereUniqueInput;
export type UserWhereInput = Prisma.userWhereInput;

/**
 * Kullanıcı modeli
 */
export class User {
  /**
   * Yeni bir kullanıcı oluşturur
   */
  static async create(data: UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Kullanıcı bilgilerini günceller
   */
  static async update(where: UserWhereUniqueInput, data: UserUpdateInput) {
    return prisma.user.update({
      where,
      data,
    });
  }

  /**
   * Kullanıcıyı siler
   */
  static async delete(where: UserWhereUniqueInput) {
    return prisma.user.delete({
      where,
    });
  }

  /**
   * Belirli bir kullanıcıyı getirir
   */
  static async findUnique(where: UserWhereUniqueInput) {
    return prisma.user.findUnique({
      where,
    });
  }

  /**
   * Belirli bir koşula göre ilk kullanıcıyı getirir
   */
  static async findFirst(where: UserWhereInput) {
    return prisma.user.findFirst({
      where,
    });
  }

  /**
   * Tüm kullanıcıları getirir
   */
  static async findMany(params?: {
    skip?: number;
    take?: number;
    where?: UserWhereInput;
    orderBy?: Prisma.userOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params || {};
    return prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  /**
   * E-posta adresine göre kullanıcı bulur
   */
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Kullanıcı adına göre kullanıcı bulur
   */
  static async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Doğrulama token'ına göre kullanıcı bulur
   */
  static async findByVerificationToken(token: string) {
    return prisma.user.findFirst({
      where: {
        verification_token: token,
        verification_token_expires: {
          gt: new Date(),
        },
      },
    });
  }

  /**
   * Kullanıcının katıldığı etkinlikleri getirir
   */
  static async getParticipatedEvents(userId: string) {
    return prisma.event_participant.findMany({
      where: {
        user_id: userId,
      },
      include: {
        event: true,
      },
    });
  }

  /**
   * Kullanıcının oluşturduğu etkinlikleri getirir
   */
  static async getCreatedEvents(userId: string) {
    return prisma.event.findMany({
      where: {
        creator_id: userId,
      },
    });
  }

  /**
   * Kullanıcının spor dallarını getirir
   */
  static async getSports(userId: string) {
    return prisma.user_sport.findMany({
      where: {
        user_id: userId,
      },
      include: {
        sport: true,
      },
    });
  }

  /**
   * Kullanıcı için bir spor dalı ekler
   */
  static async addSport(userId: string, sportId: string, skillLevel: string) {
    return prisma.user_sport.create({
      data: {
        user_id: userId,
        sport_id: sportId,
        skill_level: skillLevel,
      },
    });
  }

  /**
   * Kullanıcı için bir spor dalını kaldırır
   */
  static async removeSport(userId: string, sportId: string) {
    return prisma.user_sport.delete({
      where: {
        user_id_sport_id: {
          user_id: userId,
          sport_id: sportId,
        },
      },
    });
  }
} 