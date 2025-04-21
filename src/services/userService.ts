import prisma from '../config/prisma';
import { supabase } from '../config/supabase';
import { Prisma } from '@prisma/client';
import { Express } from 'express';

interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  default_location_latitude?: number;
  default_location_longitude?: number;
}

interface SportUpdateData {
  sportId: string;
  skillLevel: string;
}

export const userService = {
  /**
   * Kullanıcı profil bilgilerini getirir
   */
  async getProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
          profile_picture: true,
          default_location_latitude: true,
          default_location_longitude: true,
          role: true,
          created_at: true,
          user_sports: {
            include: {
              sport: true
            }
          }
        }
      });

      if (!user) {
        return {
          success: false,
          message: 'Kullanıcı bulunamadı',
          code: 'USER_NOT_FOUND'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Profil bilgileri alınırken bir hata oluştu',
        code: 'PROFILE_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  },

  /**
   * Kullanıcı profil bilgilerini günceller
   */
  async updateProfile(userId: string, data: ProfileUpdateData) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          default_location_latitude: data.default_location_latitude,
          default_location_longitude: data.default_location_longitude,
        },
        select: {
          id: true,
          username: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
          profile_picture: true,
          default_location_latitude: true,
          default_location_longitude: true,
        }
      });

      return {
        success: true,
        message: 'Profil başarıyla güncellendi',
        data: updatedUser
      };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2025 kodu, kayıt bulunamadı hatası
        if (error.code === 'P2025') {
          return {
            success: false,
            message: 'Kullanıcı bulunamadı',
            code: 'USER_NOT_FOUND'
          };
        }
      }
      
      return {
        success: false,
        message: 'Profil güncellenirken bir hata oluştu',
        code: 'UPDATE_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  },

  /**
   * Kullanıcı profil fotoğrafını günceller
   */
  async updateProfilePicture(userId: string, file: Express.Multer.File) {
    try {
      // Eski profil resmi varsa sil
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profile_picture: true }
      });

      if (user?.profile_picture) {
        // Supabase'den eski dosyayı sil
        const oldFilePath = user.profile_picture.split('/').pop();
        if (oldFilePath) {
          await supabase.storage.from('profile-pictures').remove([oldFilePath]);
        }
      }

      // Yeni dosya adını oluştur
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      // Supabase'e yükle
      const { error: uploadError, data } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Dosya yükleme hatası: ${uploadError.message}`);
      }

      // Dosya URL'ini al
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Veritabanında profil resmini güncelle
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          profile_picture: urlData.publicUrl
        },
        select: {
          id: true,
          profile_picture: true
        }
      });

      return {
        success: true,
        message: 'Profil fotoğrafı başarıyla güncellendi',
        data: updatedUser
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Profil fotoğrafı güncellenirken bir hata oluştu',
        code: 'UPLOAD_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  },

  /**
   * Kullanıcının spor dallarını günceller
   */
  async updateSports(userId: string, sports: SportUpdateData[]) {
    try {
      // Önce kullanıcının mevcut spor dallarını temizle
      await prisma.user_sport.deleteMany({
        where: { user_id: userId }
      });

      // Yeni spor dallarını ekle
      for (const sport of sports) {
        await prisma.user_sport.create({
          data: {
            user: {
              connect: { id: userId }
            },
            sport: {
              connect: { id: sport.sportId }
            },
            skill_level: sport.skillLevel
          }
        });
      }

      // Güncel kullanıcı spor dallarını getir
      const updatedUserSports = await prisma.user_sport.findMany({
        where: { user_id: userId },
        include: { sport: true }
      });

      return {
        success: true,
        message: 'Spor dalları başarıyla güncellendi',
        data: updatedUserSports
      };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2003 kodu, foreign key constraint hatası
        if (error.code === 'P2003') {
          return {
            success: false,
            message: 'Geçersiz spor dalı ID\'si',
            code: 'INVALID_SPORT_ID'
          };
        }
      }
      
      return {
        success: false,
        message: 'Spor dalları güncellenirken bir hata oluştu',
        code: 'UPDATE_SPORTS_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  },

  /**
   * Başka bir kullanıcının profil bilgilerini getirir
   */
  async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          first_name: true,
          last_name: true,
          profile_picture: true,
          user_sports: {
            include: {
              sport: true
            }
          }
        }
      });

      if (!user) {
        return {
          success: false,
          message: 'Kullanıcı bulunamadı',
          code: 'USER_NOT_FOUND'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Kullanıcı bilgileri alınırken bir hata oluştu',
        code: 'GET_USER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }
}; 