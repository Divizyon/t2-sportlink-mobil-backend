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
  sportInterest?: SportUpdateData;
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

      // Oluşturulan etkinlik sayısını al
      const createdEventsCount = await prisma.event.count({
        where: { creator_id: userId }
      });

      // Katılınan etkinlik sayısını al
      const participatedEventsCount = await prisma.event_participant.count({
        where: { user_id: userId }
      });

      // Kullanıcının katıldığı aktif etkinlikleri al
      const participatedEvents = await prisma.event_participant.findMany({
        where: { 
          user_id: userId,
          // Tüm durumları getirelim, sonra filtreleme yapacağız
          event: {
            status: {
              in: ['active', 'draft', 'completed'] // 'passive' durumunu çıkardık, çünkü kendimiz belirleyeceğiz
            }
          }
        },
        include: {
          event: {
            include: {
              sport: true,
              creator: {
                select: {
                  id: true,
                  username: true,
                  first_name: true,
                  last_name: true,
                  profile_picture: true
                }
              },
              _count: {
                select: {
                  participants: true
                }
              }
            }
          }
        },
        orderBy: {
          event: {
            event_date: 'asc' // Yakın zamandaki etkinlikler önce gösterilsin
          }
        },
        take: 20 // Etkinlik sayısını artırıyoruz
      });

      // İki farklı kategoride etkinlikleri ayıralım: Gelecek ve Geçmiş
      const now = new Date();
      
      // Formatlarken kategorilere ayıralım
      const upcomingEvents: any[] = [];
      const pastEvents: any[] = []; 

      participatedEvents.forEach(participation => {
        const { event } = participation;
        
        // Etkinliğin bitiş tarihini kontrol edelim
        const endDateTime = new Date(event.end_time);
        
        // Eğer bitiş tarihi geçmişse ve durumu 'active' ise, durumu 'passive' olarak güncelleyelim
        let currentStatus = event.status;
        if (endDateTime < now && currentStatus === 'active') {
          currentStatus = 'passive';
          
          // Durumu veritabanında da güncelleyelim (asenkron olarak)
          prisma.event.update({
            where: { id: event.id },
            data: { status: 'passive' }
          }).catch(err => console.error(`Etkinlik durumu güncellenirken hata: ${err.message}`));
        }
        
        const formattedEvent = {
          id: event.id,
          title: event.title,
          description: event.description,
          event_date: event.event_date,
          start_time: event.start_time,
          end_time: event.end_time,
          location_name: event.location_name,
          location_latitude: event.location_latitude,
          location_longitude: event.location_longitude,
          is_private: event.is_private,
          status: currentStatus, // Güncellenmiş durumu kullan
          sport: {
            id: event.sport.id,
            name: event.sport.name,
            icon: event.sport.icon
          },
          creator: event.creator,
          participant_count: event._count.participants,
          max_participants: event.max_participants,
          isCreator: event.creator.id === userId, // Kullanıcının oluşturduğu bir etkinlik mi?
          isParticipant: true // Kullanıcı katılımcı olarak eklenmiş
        };

        // Tarih kontrolü yaparak ilgili listeye ekle - Düzeltilmiş versiyon
        const eventDate = new Date(event.event_date);
        // Sadece yıl, ay ve gün kısmıyla karşılaştırma yapalım
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Etkinliğin durumunu kontrol edelim
        if (eventDateOnly >= nowDateOnly && currentStatus !== 'passive') {
          upcomingEvents.push(formattedEvent);
        } else {
          pastEvents.push(formattedEvent);
        }
      });
      
      // Şimdi de kullanıcının oluşturduğu ama henüz katılımcı olmadığı etkinlikleri alalım
      const createdButNotParticipatedEvents = await prisma.event.findMany({
        where: {
          creator_id: userId,
          status: {
            in: ['active', 'draft', 'completed'] // 'passive' durumunu çıkardık
          },
          // Katıldığı etkinliklerde olmayanları getirelim
          NOT: {
            participants: {
              some: {
                user_id: userId
              }
            }
          }
        },
        include: {
          sport: true,
          creator: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              profile_picture: true
            }
          },
          _count: {
            select: {
              participants: true
            }
          }
        },
        orderBy: {
          event_date: 'asc'
        }
      });
      
      // Oluşturduğu ama katılmadığı etkinlikleri işleyelim
      createdButNotParticipatedEvents.forEach(event => {
        // Etkinliğin bitiş tarihini kontrol edelim
        const endDateTime = new Date(event.end_time);
        
        // Eğer bitiş tarihi geçmişse ve durumu 'active' ise, durumu 'passive' olarak güncelleyelim
        let currentStatus = event.status;
        if (endDateTime < now && currentStatus === 'active') {
          currentStatus = 'passive';
          
          // Durumu veritabanında da güncelleyelim (asenkron olarak)
          prisma.event.update({
            where: { id: event.id },
            data: { status: 'passive' }
          }).catch(err => console.error(`Etkinlik durumu güncellenirken hata: ${err.message}`));
        }
        
        const formattedEvent = {
          id: event.id,
          title: event.title,
          description: event.description,
          event_date: event.event_date,
          start_time: event.start_time,
          end_time: event.end_time,
          location_name: event.location_name,
          location_latitude: event.location_latitude,
          location_longitude: event.location_longitude,
          is_private: event.is_private,
          status: currentStatus, // Güncellenmiş durumu kullan
          sport: {
            id: event.sport.id,
            name: event.sport.name,
            icon: event.sport.icon
          },
          creator: event.creator,
          participant_count: event._count.participants,
          max_participants: event.max_participants,
          isCreator: true, // Kullanıcının oluşturduğu bir etkinlik
          isParticipant: false // Kullanıcı katılımcı olarak eklenmemiş
        };
        
        // Tarih kontrolü yaparak ilgili listeye ekle
        const eventDate = new Date(event.event_date);
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Etkinliğin durumunu kontrol edelim
        if (eventDateOnly >= nowDateOnly && currentStatus !== 'passive') {
          upcomingEvents.push(formattedEvent);
        } else {
          pastEvents.push(formattedEvent);
        }
      });
      
      // Tarihe göre sırala
      upcomingEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
      pastEvents.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

      // Kullanıcının aldığı derecelendirmeleri al (ortalama puan için)
      const userRatings = await prisma.user_rating.findMany({
        where: { rated_user_id: userId },
        select: { rating_value: true }
      });

      // Ortalama puanı hesapla
      let averageRating = 0;
      if (userRatings.length > 0) {
        const totalRating = userRatings.reduce((sum, rating) => sum + rating.rating_value, 0);
        averageRating = parseFloat((totalRating / userRatings.length).toFixed(1));
      }

      // Arkadaş sayısını al
      const friendsCount = await prisma.friend.count({
        where: {
          OR: [
            { user_id1: userId },
            { user_id2: userId }
          ]
        }
      });

      // Arkadaş listesini al
      const friendships = await prisma.friend.findMany({
        where: {
          OR: [
            { user_id1: userId },
            { user_id2: userId }
          ]
        },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              profile_picture: true
            }
          },
          user2: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              profile_picture: true
            }
          }
        }
      });

      // Arkadaş listesini düzenle (userId'ye göre diğer kullanıcıyı göster)
      const friends = friendships.map(friendship => {
        return friendship.user_id1 === userId ? friendship.user2 : friendship.user1;
      });

      return {
        success: true,
        data: {
          ...user,
          stats: {
            createdEventsCount,
            participatedEventsCount,
            averageRating,
            friendsCount
          },
          friends, // Arkadaş listesini ekle
          upcomingEvents, // Gelecek etkinlikleri ekle
          pastEvents // Geçmiş etkinlikleri ekle
        }
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
      // Önce kullanıcı bilgilerini güncelle
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

      let sportResult = null;
      
      // Spor dalı eklemek için veri geldiyse, işlemi gerçekleştir
      if (data.sportInterest) {
        sportResult = await this.addSportInterest(userId, data.sportInterest);
        
        if (!sportResult.success) {
          return {
            success: false,
            message: 'Profil güncellendi fakat spor dalı eklenirken hata oluştu',
            code: 'SPORT_UPDATE_ERROR',
            details: sportResult.message,
            data: updatedUser
          };
        }
      }

      return {
        success: true,
        message: data.sportInterest ? 'Profil bilgileri ve spor dalı başarıyla güncellendi' : 'Profil başarıyla güncellendi',
        data: {
          ...updatedUser,
          sports: data.sportInterest ? sportResult?.data?.sports : undefined
        }
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

      // Oluşturulan etkinlik sayısını al
      const createdEventsCount = await prisma.event.count({
        where: { creator_id: userId }
      });

      // Katılınan etkinlik sayısını al
      const participatedEventsCount = await prisma.event_participant.count({
        where: { user_id: userId }
      });

      // Kullanıcının katıldığı aktif etkinlikleri al
      const participatedEvents = await prisma.event_participant.findMany({
        where: { 
          user_id: userId,
          // Tüm durumları getirelim, sonra filtreleme yapacağız
          event: {
            status: {
              in: ['active', 'draft', 'completed'] // 'passive' durumunu çıkardık, çünkü kendimiz belirleyeceğiz
            }
          }
        },
        include: {
          event: {
            include: {
              sport: true,
              creator: {
                select: {
                  id: true,
                  username: true,
                  first_name: true,
                  last_name: true,
                  profile_picture: true
                }
              },
              _count: {
                select: {
                  participants: true
                }
              }
            }
          }
        },
        orderBy: {
          event: {
            event_date: 'asc' // Yakın zamandaki etkinlikler önce gösterilsin
          }
        },
        take: 20 // Etkinlik sayısını artırıyoruz
      });

      // İki farklı kategoride etkinlikleri ayıralım: Gelecek ve Geçmiş
      const now = new Date();
      
      // Formatlarken kategorilere ayıralım
      const upcomingEvents: any[] = [];
      const pastEvents: any[] = []; 

      participatedEvents.forEach(participation => {
        const { event } = participation;
        
        // Etkinliğin bitiş tarihini kontrol edelim
        const endDateTime = new Date(event.end_time);
        
        // Eğer bitiş tarihi geçmişse ve durumu 'active' ise, durumu 'passive' olarak güncelleyelim
        let currentStatus = event.status;
        if (endDateTime < now && currentStatus === 'active') {
          currentStatus = 'passive';
          
          // Durumu veritabanında da güncelleyelim (asenkron olarak)
          prisma.event.update({
            where: { id: event.id },
            data: { status: 'passive' }
          }).catch(err => console.error(`Etkinlik durumu güncellenirken hata: ${err.message}`));
        }
        
        const formattedEvent = {
          id: event.id,
          title: event.title,
          description: event.description,
          event_date: event.event_date,
          start_time: event.start_time,
          end_time: event.end_time,
          location_name: event.location_name,
          location_latitude: event.location_latitude,
          location_longitude: event.location_longitude,
          is_private: event.is_private,
          status: currentStatus, // Güncellenmiş durumu kullan
          sport: {
            id: event.sport.id,
            name: event.sport.name,
            icon: event.sport.icon
          },
          creator: event.creator,
          participant_count: event._count.participants,
          max_participants: event.max_participants,
          isCreator: event.creator.id === userId, // Kullanıcının oluşturduğu bir etkinlik mi?
          isParticipant: true // Kullanıcı katılımcı olarak eklenmiş
        };

        // Tarih kontrolü yaparak ilgili listeye ekle - Düzeltilmiş versiyon
        const eventDate = new Date(event.event_date);
        // Sadece yıl, ay ve gün kısmıyla karşılaştırma yapalım
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Etkinliğin durumunu kontrol edelim
        if (eventDateOnly >= nowDateOnly && currentStatus !== 'passive') {
          upcomingEvents.push(formattedEvent);
        } else {
          pastEvents.push(formattedEvent);
        }
      });
      
      // Şimdi de kullanıcının oluşturduğu ama henüz katılımcı olmadığı etkinlikleri alalım
      const createdButNotParticipatedEvents = await prisma.event.findMany({
        where: {
          creator_id: userId,
          status: {
            in: ['active', 'draft', 'completed'] // 'passive' durumunu çıkardık
          },
          // Katıldığı etkinliklerde olmayanları getirelim
          NOT: {
            participants: {
              some: {
                user_id: userId
              }
            }
          }
        },
        include: {
          sport: true,
          creator: {
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              profile_picture: true
            }
          },
          _count: {
            select: {
              participants: true
            }
          }
        },
        orderBy: {
          event_date: 'asc'
        }
      });
      
      // Oluşturduğu ama katılmadığı etkinlikleri işleyelim
      createdButNotParticipatedEvents.forEach(event => {
        // Etkinliğin bitiş tarihini kontrol edelim
        const endDateTime = new Date(event.end_time);
        
        // Eğer bitiş tarihi geçmişse ve durumu 'active' ise, durumu 'passive' olarak güncelleyelim
        let currentStatus = event.status;
        if (endDateTime < now && currentStatus === 'active') {
          currentStatus = 'passive';
          
          // Durumu veritabanında da güncelleyelim (asenkron olarak)
          prisma.event.update({
            where: { id: event.id },
            data: { status: 'passive' }
          }).catch(err => console.error(`Etkinlik durumu güncellenirken hata: ${err.message}`));
        }
        
        const formattedEvent = {
          id: event.id,
          title: event.title,
          description: event.description,
          event_date: event.event_date,
          start_time: event.start_time,
          end_time: event.end_time,
          location_name: event.location_name,
          location_latitude: event.location_latitude,
          location_longitude: event.location_longitude,
          is_private: event.is_private,
          status: currentStatus, // Güncellenmiş durumu kullan
          sport: {
            id: event.sport.id,
            name: event.sport.name,
            icon: event.sport.icon
          },
          creator: event.creator,
          participant_count: event._count.participants,
          max_participants: event.max_participants,
          isCreator: true, // Kullanıcının oluşturduğu bir etkinlik
          isParticipant: false // Kullanıcı katılımcı olarak eklenmemiş
        };
        
        // Tarih kontrolü yaparak ilgili listeye ekle
        const eventDate = new Date(event.event_date);
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Etkinliğin durumunu kontrol edelim
        if (eventDateOnly >= nowDateOnly && currentStatus !== 'passive') {
          upcomingEvents.push(formattedEvent);
        } else {
          pastEvents.push(formattedEvent);
        }
      });
      
      // Tarihe göre sırala
      upcomingEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
      pastEvents.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

      // Kullanıcının aldığı derecelendirmeleri al (ortalama puan için)
      const userRatings = await prisma.user_rating.findMany({
        where: { rated_user_id: userId },
        select: { rating_value: true }
      });

      // Ortalama puanı hesapla
      let averageRating = 0;
      if (userRatings.length > 0) {
        const totalRating = userRatings.reduce((sum, rating) => sum + rating.rating_value, 0);
        averageRating = parseFloat((totalRating / userRatings.length).toFixed(1));
      }

      // Kullanıcının spor dallarını standart formata dönüştür
      const sports = user.user_sports.map((userSport) => ({
        id: userSport.sport.id,
        name: userSport.sport.name,
        icon: userSport.sport.icon,
        description: userSport.sport.description,
        skillLevel: userSport.skill_level
      }));

      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          profile_picture: user.profile_picture,
          sports,
          stats: {
            createdEventsCount,
            participatedEventsCount,
            averageRating
          },
          upcomingEvents, // Gelecek etkinlikleri ekle
          pastEvents // Geçmiş etkinlikleri ekle
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Kullanıcı profili alınırken bir hata oluştu',
        code: 'PROFILE_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  },

  /**
   * Kullanıcının ilgilendiği spor dallarını seçer
   * Bu metot spor dallarının varlığını kontrol eder ve sadece kayıtlı spor dallarını ekler
   */
  async selectSportInterests(userId: string, sports: SportUpdateData[]) {
    try {
      // Kullanıcının varlığını kontrol et
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          message: 'Kullanıcı bulunamadı',
          code: 'USER_NOT_FOUND'
        };
      }

      // Tüm spor ID'lerini tek sorguda doğrula
      const sportIds = sports.map(s => s.sportId);
      const existingSports = await prisma.sport.findMany({
        where: {
          id: {
            in: sportIds
          }
        },
        select: {
          id: true
        }
      });

      // Bulunan spor ID'lerini diziye dönüştür
      const validSportIds = existingSports.map(s => s.id);

      // Geçersiz spor ID'lerini bul
      const invalidSportIds = sportIds.filter(id => !validSportIds.includes(id));

      if (invalidSportIds.length > 0) {
        return {
          success: false,
          message: 'Bir veya daha fazla geçersiz spor dalı ID\'si',
          code: 'INVALID_SPORT_IDS',
          details: {
            invalidSportIds
          }
        };
      }

      // Önce kullanıcının mevcut spor dallarını temizle
      await prisma.user_sport.deleteMany({
        where: { user_id: userId }
      });

      // Doğrulanmış spor dallarını ekle
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
        message: 'İlgilenilen spor dalları başarıyla kaydedildi',
        data: {
          sports: updatedUserSports.map(us => ({
            id: us.sport.id,
            name: us.sport.name,
            icon: us.sport.icon,
            skillLevel: us.skill_level
          }))
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Spor dalları kaydedilirken bir hata oluştu',
        code: 'SELECT_SPORTS_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  },

  /**
   * Kullanıcının ilgi alanına yeni bir spor dalı ekler
   * Mevcut ilgi alanları korunur
   */
  async addSportInterest(userId: string, sportData: SportUpdateData) {
    try {
      // Kullanıcının varlığını kontrol et
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return {
          success: false,
          message: 'Kullanıcı bulunamadı',
          code: 'USER_NOT_FOUND'
        };
      }

      // Spor dalı ID'sinin geçerliliğini kontrol et
      const sportExists = await prisma.sport.findUnique({
        where: {
          id: sportData.sportId
        }
      });

      if (!sportExists) {
        return {
          success: false,
          message: 'Geçersiz spor dalı ID\'si',
          code: 'INVALID_SPORT_ID'
        };
      }

      // Kullanıcının bu spor dalıyla zaten ilgilenip ilgilenmediğini kontrol et
      const existingUserSport = await prisma.user_sport.findUnique({
        where: {
          user_id_sport_id: {
            user_id: userId,
            sport_id: sportData.sportId
          }
        }
      });

      if (existingUserSport) {
        // Spor dalı zaten eklenmiş, sadece yetenek seviyesini güncelle
        await prisma.user_sport.update({
          where: {
            user_id_sport_id: {
              user_id: userId,
              sport_id: sportData.sportId
            }
          },
          data: {
            skill_level: sportData.skillLevel
          }
        });
      } else {
        // Yeni spor dalını ekle
        await prisma.user_sport.create({
          data: {
            user: {
              connect: { id: userId }
            },
            sport: {
              connect: { id: sportData.sportId }
            },
            skill_level: sportData.skillLevel
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
        message: existingUserSport ? 'Spor dalı yetenek seviyesi güncellendi' : 'Spor dalı ilgi alanlarına eklendi',
        data: {
          sports: updatedUserSports.map(us => ({
            id: us.sport.id,
            name: us.sport.name,
            icon: us.sport.icon,
            skillLevel: us.skill_level
          }))
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Spor dalı eklenirken bir hata oluştu',
        code: 'ADD_SPORT_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  },

  /**
   * Bitiş tarihi geçmiş etkinlikleri passive durumuna günceller
   */
  async updateExpiredEvents() {
    try {
      const now = new Date();
      
      // Bitiş zamanı geçmiş ve hala 'active' durumunda olan etkinlikleri bul
      const expiredEvents = await prisma.event.findMany({
        where: {
          status: 'active',
          end_time: {
            lt: now // end_time < now
          }
        },
        select: {
          id: true,
          title: true
        }
      });
      
      if (expiredEvents.length === 0) {
        return {
          success: true,
          count: 0
        };
      }
      
      // Tüm süresi dolmuş etkinlikleri toplu olarak güncelle
      const updateResult = await prisma.event.updateMany({
        where: {
          id: {
            in: expiredEvents.map(event => event.id)
          }
        },
        data: {
          status: 'passive'
        }
      });
      
      return {
        success: true,
        count: updateResult.count
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}; 