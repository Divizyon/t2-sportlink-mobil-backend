import { Request, Response } from 'express';
import { z } from 'zod';
import { Event } from '../models/Event';
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';
import { Friend } from '../models/Friend';

// Gerekli tip tanımlamaları
type EventWhereInput = Prisma.eventWhereInput;
type EventOrderByInput = Prisma.eventOrderByWithRelationInput;
type EventIncludeInput = Prisma.eventInclude;

// Event sınıfına eklenen statik metotlar için tip genişletmesi
interface EventClass {
  count(where?: EventWhereInput): Promise<number>;
  getParticipantCount(eventId: string): Promise<number>;
  getUserParticipation(eventId: string, userId: string): Promise<any>;
  getUserEvents(userId: string, skip?: number, take?: number): Promise<any[]>;
  countUserEvents(userId: string): Promise<number>;
  getUserSportPreferences(userId: string): Promise<any[]>;
  findNearby(latitude: number, longitude: number, radiusKm?: number): Promise<any[]>;
  addParticipant(eventId: string, userId: string, role?: string): Promise<any>;
  removeParticipant(eventId: string, userId: string): Promise<any>;
  getRatings(eventId: string): Promise<any[]>;
  getUserRating(eventId: string, userId: string): Promise<any>;
  addRating(eventId: string, userId: string, rating: number, review: string): Promise<any>;
  updateRating(id: string, rating: number, review: string): Promise<any>;
  getAverageRating(eventId: string): Promise<{ average: number; count: number }>;
  findMany(options: {
    skip?: number;
    take?: number;
    where?: EventWhereInput;
    orderBy?: EventOrderByInput;
    include?: EventIncludeInput;
  }): Promise<any[]>;
}

// Event sınıfını genişletmek için tipini EventClass ile birleştir
const EventWithExtensions = Event as unknown as typeof Event & EventClass;

// Etkinlik oluşturma için schema
const createEventSchema = z.object({
  sport_id: z.string().uuid('Geçerli bir spor ID\'si giriniz'),
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  event_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Geçerli bir tarih giriniz',
  }),
  start_time: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Geçerli bir başlangıç zamanı giriniz',
  }),
  end_time: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Geçerli bir bitiş zamanı giriniz',
  }),
  location_name: z.string().min(3, 'Konum adı en az 3 karakter olmalıdır'),
  location_latitude: z.number().min(-90).max(90),
  location_longitude: z.number().min(-180).max(180),
  max_participants: z.number().int().positive(),
  status: z.enum(['active', 'canceled', 'completed', 'draft']),
  is_private: z.boolean().default(false),
  invitation_code: z.string().min(4).optional().nullable(),
});

// Etkinlik güncelleme için schema
const updateEventSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır').optional(),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır').optional(),
  event_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Geçerli bir tarih giriniz',
  }).optional(),
  start_time: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Geçerli bir başlangıç zamanı giriniz',
  }).optional(),
  end_time: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Geçerli bir bitiş zamanı giriniz',
  }).optional(),
  location_name: z.string().min(3, 'Konum adı en az 3 karakter olmalıdır').optional(),
  location_latitude: z.number().min(-90).max(90).optional(),
  location_longitude: z.number().min(-180).max(180).optional(),
  max_participants: z.number().int().positive().optional(),
  status: z.enum(['active', 'canceled', 'completed', 'draft']).optional(),
});

// Etkinlik değerlendirme için schema
const rateEventSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().min(3, 'Yorum en az 3 karakter olmalıdır'),
});

// Öneri nedeni türleri
type RecommendationReason = {
  type: 'sport_preference' | 'friend_participation' | 'both';
  sport_id?: string;
  sport_name?: string;
  skill_level?: string;
  friend_count?: number;
  friends?: Array<{
    id: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
    profile_picture: string | null;
  }>;
  sport_preference?: RecommendationReason;
  friend_participation?: RecommendationReason;
};

// Tüm etkinlikleri getir
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 200; // Varsayılan limit 10'dan 200'e çıkarıldı
    const skip = (page - 1) * limit;

    // Spor dalına göre filtreleme
    const sportId = req.query.sportId as string;
    let where: EventWhereInput = {};
    if (sportId) {
      where = { sport_id: sportId };
    }

    // Status filtreleme (varsayılan olarak aktif etkinlikler)
    const status = req.query.status as string || 'active';
    if (status !== 'all') {
      where = { ...where };
    }

    const events = await EventWithExtensions.findMany({
      skip,
      take: limit,
      where,
      orderBy: { event_date: 'asc' }
    });

    const totalEvents = await EventWithExtensions.count(where);
    const totalPages = Math.ceil(totalEvents / limit);

    return res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total: totalEvents,
          totalPages
        }
      }
    });
  } catch (error: any) {
    console.error('Etkinlik listeleme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Etkinlikler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Etkinlik detayını getir
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const event = await EventWithExtensions.findUnique({
      id: eventId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    // Katılımcı sayısı
    const participantCount = event._count?.participants || 0;
    
    // Katılımcı listesi
    const participants = event.participants?.map((participant: any) => participant.user) || [];

    return res.status(200).json({
      success: true,
      data: {
        event,
        participant_count: participantCount,
        participants
      }
    });
  } catch (error: any) {
    console.error('Etkinlik detayı getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Etkinlik detayı getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Etkinlik oluştur
export const createEvent = async (req: Request, res: Response) => {
  try {
    // Body doğrulama
    const validationResult = createEventSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veri formatı',
        errors: validationResult.error.format()
      });
    }

    const data = validationResult.data;
    
    // Kullanıcı ID'sini ekle
    const userId = req.user.id;
    
    // Eğer etkinlik özel ise ve davet kodu yoksa otomatik oluştur
    let { invitation_code } = data;
    if (data.is_private && !invitation_code) {
      invitation_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const event = await EventWithExtensions.create({
      title: data.title,
      description: data.description,
      event_date: new Date(data.event_date),
      start_time: new Date(data.start_time),
      end_time: new Date(data.end_time),
      location_name: data.location_name,
      location_latitude: data.location_latitude,
      location_longitude: data.location_longitude,
      max_participants: data.max_participants,
      status: data.status,
      is_private: data.is_private,
      invitation_code,
      creator: { connect: { id: userId } },
      sport: { connect: { id: data.sport_id } }
    });

    return res.status(201).json({
      success: true,
      message: 'Etkinlik başarıyla oluşturuldu',
      data: { 
        event,
        invitation_code: data.is_private ? invitation_code : null
      }
    });
  } catch (error: any) {
    console.error('Etkinlik oluşturma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Etkinlik oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// Etkinlik güncelle
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Etkinliğin var olup olmadığını kontrol et
    const existingEvent = await EventWithExtensions.findUnique({
      id: eventId
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    // Etkinliğin sahibi olup olmadığını kontrol et
    if (existingEvent.creator_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bu etkinliği değiştirme yetkiniz yok'
      });
    }

    // Input doğrulama
    const validationResult = updateEventSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veri formatı',
        errors: validationResult.error.format()
      });
    }

    const data = validationResult.data;
    
    // Tarih alanlarını uygun formata dönüştür
    const updateData = {
      ...data
    };
    
    // Tarih formatı düzeltmesi - ISO String formatına dönüştür
    if (updateData.event_date) {
      updateData.event_date = new Date(updateData.event_date) as unknown as string;
    }
    
    if (updateData.start_time) {
      updateData.start_time = new Date(updateData.start_time) as unknown as string;
    }
    
    if (updateData.end_time) {
      updateData.end_time = new Date(updateData.end_time) as unknown as string;
    }

    // Etkinliği güncelle
    const updatedEvent = await EventWithExtensions.update(
      { id: eventId },
      updateData
    );

    return res.status(200).json({
      success: true,
      message: 'Etkinlik başarıyla güncellendi',
      data: { event: updatedEvent }
    });
  } catch (error: any) {
    console.error('Etkinlik güncelleme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Etkinlik güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// Etkinliği sil
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Etkinliğin var olup olmadığını kontrol et
    const existingEvent = await EventWithExtensions.findUnique({
      id: eventId
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    // Etkinliğin sahibi olup olmadığını kontrol et
    if (existingEvent.creator_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bu etkinliği silme yetkiniz yok'
      });
    }

    // Etkinliği sil
    await EventWithExtensions.delete({ id: eventId });

    return res.status(200).json({
      success: true,
      message: 'Etkinlik başarıyla silindi'
    });
  } catch (error: any) {
    console.error('Etkinlik silme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Etkinlik silinirken bir hata oluştu',
      error: error.message
    });
  }
};

// Etkinlik e katıl
export const joinEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const { invitation_code } = req.body;

    // Etkinliğin var olup olmadığını kontrol et
    const event = await EventWithExtensions.findUnique({
      id: eventId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }
    
    // Özel etkinlik ise davet kodunu kontrol et
    if (event.is_private) {
      if (!invitation_code) {
        return res.status(400).json({
          success: false,
          message: 'Bu özel bir etkinliktir, katılmak için davet kodu gereklidir'
        });
      }
      
      if (invitation_code !== event.invitation_code) {
        return res.status(403).json({
          success: false,
          message: 'Geçersiz davet kodu'
        });
      }
    }

    // Etkinlik katılımcı sayısını kontrol et
    const participantCount = await EventWithExtensions.getParticipantCount(eventId);
    if (participantCount >= event.max_participants) {
      return res.status(400).json({
        success: false,
        message: 'Etkinlik maksimum katılımcı sayısına ulaşmış'
      });
    }

    // Zaten katılımcı mı kontrol et
    const existingParticipant = await EventWithExtensions.getUserParticipation(eventId, userId);
    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Bu etkinliğe zaten katılmışsınız'
      });
    }

    // Etkinliğe katıl
    await EventWithExtensions.addParticipant(eventId, userId);

    return res.status(200).json({
      success: true,
      message: 'Etkinliğe başarıyla katıldınız'
    });
  } catch (error: any) {
    console.error('Etkinliğe katılma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Etkinliğe katılırken bir hata oluştu',
      error: error.message
    });
  }
};

// Etkinlikten ayrıl
export const leaveEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Etkinliğin var olup olmadığını kontrol et
    const event = await EventWithExtensions.findUnique({
      id: eventId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    // Katılımcı mı kontrol et
    const existingParticipant = await EventWithExtensions.getUserParticipation(eventId, userId);
    if (!existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Bu etkinliğe katılmış değilsiniz'
      });
    }

    // Etkinlikten ayrıl
    await EventWithExtensions.removeParticipant(eventId, userId);

    return res.status(200).json({
      success: true,
      message: 'Etkinlikten başarıyla ayrıldınız'
    });
  } catch (error: any) {
    console.error('Etkinlikten ayrılma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Etkinlikten ayrılırken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcının katıldığı etkinlikleri getir
export const getMyEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const participations = await EventWithExtensions.getUserEvents(userId, skip, limit);
    const totalEvents = await EventWithExtensions.countUserEvents(userId);
    const totalPages = Math.ceil(totalEvents / limit);

    return res.status(200).json({
      success: true,
      data: {
        events: participations,
        pagination: {
          page,
          limit,
          total: totalEvents,
          totalPages
        }
      }
    });
  } catch (error: any) {
    console.error('Katıldığım etkinlikler hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Katıldığınız etkinlikler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcının oluşturduğu etkinlikleri getir
export const getCreatedEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const events = await EventWithExtensions.findMany({
      skip,
      take: limit,
      where: { creator_id: userId },
      orderBy: { created_at: 'desc' }
    });

    const totalEvents = await EventWithExtensions.count({ creator_id: userId });
    const totalPages = Math.ceil(totalEvents / limit);

    return res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total: totalEvents,
          totalPages
        }
      }
    });
  } catch (error: any) {
    console.error('Oluşturduğum etkinlikler hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Oluşturduğunuz etkinlikler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Yakındaki etkinlikleri getir
export const getNearbyEvents = async (req: Request, res: Response) => {
  try {
    const latitude = parseFloat(req.query.latitude as string);
    const longitude = parseFloat(req.query.longitude as string);
    const radius = parseFloat(req.query.radius as string) || 10; // km cinsinden varsayılan 10km
    const useDistanceMatrix = req.query.useDistanceMatrix === 'true'; // Google Maps Distance Matrix API kullanımı için flag
    const limit = parseInt(req.query.limit as string) || 200; // Varsayılan limit 200 olarak ayarlandı

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir konum (latitude, longitude) girilmelidir'
      });
    }

    // Önce basit coğrafi sorgular ile yaklaşık etkinlikleri bul
    let events = await EventWithExtensions.findNearby(latitude, longitude, radius);

    // Eğer Distance Matrix API kullanımı isteniyorsa
    if (useDistanceMatrix && events.length > 0) {
      try {
        // İçe aktarma işlemini burada yap, böylece performans açısından
        // sadece ihtiyaç olduğunda yüklenir
        const { calculateBulkDistances } = await import('../utils/maps.util');
        
        // Etkinliklerin konumlarını topla
        const destinations = events.map(event => ({
          id: event.id,
          lat: event.location_latitude,
          lng: event.location_longitude
        }));
        
        // Bulk mesafe hesaplaması yap
        const distanceResults = await calculateBulkDistances(
          { lat: latitude, lng: longitude },
          destinations
        );
        
        // Sonuçları etkinliklere ekle
        if (distanceResults.success) {
          // Her etkinlik için mesafe bilgisini ekle
          events = events.map(event => {
            const distanceInfo = distanceResults.results.find(r => r.id === event.id);
            if (!distanceInfo) return event;
            
            // Prisma modeline yeni alan eklenemiyor, bu yüzden raw object olarak dönüştürüp
            // yeni alanları ekliyoruz (Prisma modelindeki type kontrolünü bu şekilde aşıyoruz)
            const eventWithDistance = {
              ...event,
              distance_info: {
                distance: distanceInfo.distance,
                duration: distanceInfo.duration,
                distance_text: distanceInfo.distanceText,
                duration_text: distanceInfo.durationText
              }
            };
            
            return eventWithDistance;
          });
          
          // Gerçek mesafeye göre sırala
          events.sort((a: any, b: any) => {
            const distA = a.distance_info?.distance || Infinity;
            const distB = b.distance_info?.distance || Infinity;
            return distA - distB;
          });
          
          // Gerçek mesafeye göre filtrele (metre cinsinden)
          events = events.filter((event: any) => 
            !event.distance_info || event.distance_info.distance <= radius * 1000
          );
        }
      } catch (distanceError) {
        console.error('Distance Matrix API hatası:', distanceError);
        // API hatası durumunda orijinal sorgu sonuçlarını kullan
      }
    }

    // Limit uygula
    if (events.length > limit) {
      events = events.slice(0, limit);
    }

    return res.status(200).json({
      success: true,
      data: {
        events,
        meta: {
          count: events.length,
          radius: radius,
          location: {
            latitude,
            longitude
          },
          useDistanceMatrix,
          limit
        }
      }
    });
  } catch (error: any) {
    console.error('Yakındaki etkinlikler hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Yakındaki etkinlikler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Etkinlik ara
export const searchEvents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 200; // Varsayılan limit 200 olarak ayarlandı
    const skip = (page - 1) * limit;

    const keyword = req.query.keyword as string;
    const sportId = req.query.sportId as string;
    const status = req.query.status as string || 'active';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const minParticipants = parseInt(req.query.minParticipants as string);
    const maxParticipants = parseInt(req.query.maxParticipants as string);
    const locationName = req.query.locationName as string;

    // Arama kriterleri oluştur
    let where: EventWhereInput = {};

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
        { location_name: { contains: keyword, mode: 'insensitive' } }
      ];
    }

    if (sportId) {
      where.sport_id = sportId;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    // Tarih filtresi
    if (startDate || endDate) {
      where.event_date = {};
      
      if (startDate) {
        where.event_date.gte = new Date(startDate);
      }
      
      if (endDate) {
        where.event_date.lte = new Date(endDate);
      }
    }

    // Katılımcı sayısı filtresi
    if (!isNaN(minParticipants)) {
      where.max_participants = {
        gte: minParticipants
      };
    }

    if (!isNaN(maxParticipants)) {
      if (where.max_participants) {
        // @ts-ignore - Prisma tipi
        where.max_participants.lte = maxParticipants;
      } else {
        where.max_participants = {
          lte: maxParticipants
        };
      }
    }

    // Konum adı filtresi
    if (locationName) {
      where.location_name = {
        contains: locationName,
        mode: 'insensitive'
      };
    }

    // Tüm filtrelere göre etkinlikleri getir
    const events = await EventWithExtensions.findMany({
      skip,
      take: limit,
      where,
      orderBy: { event_date: 'asc' }
    });

    // Toplam etkinlik sayısını getir
    const totalEvents = await EventWithExtensions.count(where);
    const totalPages = Math.ceil(totalEvents / limit);

    return res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total: totalEvents,
          totalPages
        },
        filters: {
          keyword,
          sportId,
          status,
          startDate,
          endDate,
          minParticipants,
          maxParticipants,
          locationName
        }
      }
    });
  } catch (error: any) {
    console.error('Etkinlik arama hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Etkinlikler aranırken bir hata oluştu',
      error: error.message
    });
  }
};

// Kullanıcı için önerilen etkinlikleri getir
export const getRecommendedEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 200; // Varsayılan limit 200 olarak ayarlandı
    const skip = (page - 1) * limit;
    const includeOnlyFriends = req.query.onlyFriends === 'true';
    const sportCategory = req.query.sportCategory as string; // Belirli bir spor kategorisi için filtreleme
    const minEventCount = parseInt(req.query.minEventCount as string) || 5; // Minimum etkinlik sayısı
    const includeBoth = req.query.includeBoth === 'true' || true; // Hem arkadaş hem spor tercihlerini içer (varsayılan true)


    // Kullanıcının spor tercihleri
    const userSports = await EventWithExtensions.getUserSportPreferences(userId);
    
    // Kullanıcının arkadaşlarını getir
    const friends = await Friend.getFriends(userId);
    const friendIds = friends.map(friend => friend.id);

    // Eğer kullanıcının spor tercihi ve arkadaşı yoksa uyarı dön
    if (!userSports.length && !friendIds.length) {
      return res.status(200).json({
        success: true,
        message: 'Öneri almak için spor tercihlerinizi ekleyin veya arkadaş edinin',
        data: { 
          events: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        }
      });
    }
    // Kullanıcının tercih ettiği sporlar için etkinlikleri getir
    const sportIds = userSports.map(sport => sport.sport_id);

    // Her iki tür etkinliği de getir (paralel olarak)
    let sportBasedEvents: any[] = [];
    let friendBasedEvents: any[] = [];

    // Spor tercihlerine göre etkinlikler - sadece arkadaş etkinlikleri istenmediyse
    if (sportIds.length > 0 && !includeOnlyFriends) {
      try {
        // Spor kategorisi filtrelemesi yapılacaksa
        const filteredSportIds = sportCategory 
          ? sportIds.filter(id => id === sportCategory)
          : sportIds;
        
        if (filteredSportIds.length > 0) {
          console.log(`Filtrelenmiş spor ID'leri: ${filteredSportIds.join(', ')}`);
          
          // Her bir spor tercihi için ayrı sorgu yap ve sonuçları birleştir
          const sportEventPromises = filteredSportIds.map(async (sportId) => {
            const sportPreferenceWhere: EventWhereInput = {
              sport_id: sportId,
              status: 'active',
              event_date: { gte: new Date() },
              creator_id: { not: userId }, // Kullanıcının oluşturduğu etkinlikleri dışla
              participants: {
                none: {
                  user_id: userId // Kullanıcının katıldığı etkinlikleri dışla
                }
              }
            };
        
            return EventWithExtensions.findMany({
              where: sportPreferenceWhere,
              orderBy: { event_date: 'asc' },
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
            });
          });
          
          // Tüm sorguları paralel olarak çalıştır
          const sportEventsArrays = await Promise.all(sportEventPromises);
          
          // Sonuçları birleştir ve tekrar eden etkinlikleri çıkar
          const combinedSportEvents = sportEventsArrays.flat();
          
          // Tekrar eden etkinlikleri çıkar (ID bazlı unique)
          const uniqueEventIds = new Set();
          sportBasedEvents = combinedSportEvents.filter(event => {
            if (uniqueEventIds.has(event.id)) {
              return false;
            }
            uniqueEventIds.add(event.id);
            return true;
          });
          
        } else {
          console.log('Filtreye uygun spor tercihi bulunamadı');
        }
      } catch (error) {
        console.error('Spor bazlı etkinlikler getirilirken hata:', error);
      }
    }

    // Arkadaş katılımlarına göre etkinlikler
    if (friendIds.length > 0) {
      try {
        console.log(`Arkadaş ID'leri:`, friendIds);
        
        // Spor kategorisi filtrelemesi yapılacaksa
        const friendEventWhere: any = {
          status: 'active',
          event_date: { gte: new Date() },
          creator_id: { not: userId }, // Kullanıcının oluşturduğu etkinlikleri dışla
          participants: {
            some: {
              user_id: {
                in: friendIds
              }
            },
            none: {
              user_id: userId // Kullanıcının katıldığı etkinlikleri dışla
            }
          }
        };
        
        // Eğer spor kategorisi filtresi varsa, bunu ekle
        if (sportCategory) {
          friendEventWhere.sport_id = sportCategory;
        }
        
        // Doğrudan arkadaşların katıldığı etkinlikleri al
        const friendEvents = await prisma.event.findMany({
          where: friendEventWhere,
          orderBy: { event_date: 'asc' },
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
            participants: {
              where: {
                user_id: {
                  in: friendIds
                }
              },
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    first_name: true,
                    last_name: true,
                    profile_picture: true
                  }
                }
              }
            },
            _count: {
              select: {
                participants: true
              }
            }
          }
        });
        
        
        // Açık olarak tip belirtiyoruz
        let processedFriendEvents: Array<any> = [];
        
        // Eğer arkadaş etkinlikleri varsa işle
        if (friendEvents.length > 0) {
          // Her etkinlik için arkadaş bilgileriyle zenginleştir
          processedFriendEvents = friendEvents.map(event => {
            // Katılan arkadaşların formatını düzenle
            const participantFriends = event.participants.map(p => ({
              id: p.user.id,
              username: p.user.username,
              first_name: p.user.first_name,
              last_name: p.user.last_name,
              profile_picture: p.user.profile_picture
            }));
            
            console.log(`Etkinlik "${event.title}" için katılan arkadaşlar:`, 
              participantFriends.map(f => `${f.first_name || ''} ${f.last_name || ''} (${f.username})`).join(", "));
            
            // Etkinlikten participants alanını çıkar (fazlalık olmaması için)
            const { participants, ...eventWithoutParticipants } = event;
            
            // Etkinlik ve arkadaş bilgilerini döndür
            return {
              ...eventWithoutParticipants,
              recommendation_reason: {
                type: 'friend_participation',
                friend_count: participantFriends.length,
                friends: participantFriends.slice(0, 3) // En fazla 3 arkadaş göster
              } as RecommendationReason
            };
          });
        } 
        
        friendBasedEvents = processedFriendEvents;
        
      } catch (error) {
        console.error('Arkadaş etkinlikleri getirilirken hata:', error);
      }
    }

    // Her etkinliğe neden önerildiğine dair bilgi ekle
    const processedSportEvents = sportBasedEvents.map(event => {
      // Kullanıcının tercih ettiği spor dalını bul
      const userSport = userSports.find(s => s.sport_id === event.sport_id);
      
      return {
        ...event,
        recommendation_reason: {
          type: 'sport_preference',
          sport_id: event.sport_id,
          sport_name: event.sport?.name || event.sport_id,
          skill_level: userSport?.skill_level || 'intermediate'
        } as RecommendationReason
      };
    });
    
    // Sadece arkadaş etkinlikleri isteniyorsa, diğerlerini kullanma
    const allEvents = includeOnlyFriends ? [] : [...processedSportEvents];
    
    // Arkadaş bazlı etkinlikleri ekle ama aynı etkinliği tekrar ekleme
    friendBasedEvents.forEach(friendEvent => {
      if (includeOnlyFriends) {
        // Sadece arkadaş bazlı etkinlikler isteniyorsa direkt ekle
        allEvents.push(friendEvent);
      } else {
        // Normal modda ise çakışma kontrolü yap
        const existingEventIndex = allEvents.findIndex(e => e.id === friendEvent.id);
        
        if (existingEventIndex !== -1) {
          // Bu etkinlik hem spor hem arkadaş bazlı, her iki nedeni de ekle
          allEvents[existingEventIndex] = {
            ...allEvents[existingEventIndex],
            recommendation_reason: {
              type: 'both',
              sport_preference: allEvents[existingEventIndex].recommendation_reason,
              friend_participation: friendEvent.recommendation_reason
            } as RecommendationReason
          };
        } else {
          // Sadece arkadaş bazlı etkinlik, ekle
          allEvents.push(friendEvent);
        }
      }
    });
    
    // Eğer minimum etkinlik sayısına ulaşılamadıysa ve sadece arkadaş etkinlikleri istenmiyorsa, genel etkinlikleri getir
    if (allEvents.length < minEventCount && !includeOnlyFriends) {
      
      // Zaten eklenen etkinliklerin ID'lerini topla
      const existingEventIds = new Set(allEvents.map(event => event.id));
      
      // Yaklaşan etkinlikleri getirmek için sorgu koşullarını hazırla
      const additionalEventsWhere: any = {
        status: 'active',
        event_date: { gte: new Date() },
        id: { notIn: Array.from(existingEventIds) }, // Zaten eklenmiş etkinlikleri dışla
        is_private: false, // Özel etkinlikleri dışla
        participants: {
          none: {
            user_id: userId // Kullanıcının katıldığı etkinlikleri dışla
          }
        }
      };
      
      // Eğer spor kategorisi filtresi varsa, bunu ekle
      if (sportCategory) {
        additionalEventsWhere.sport_id = sportCategory;
      }
      
      // Yaklaşan etkinlikleri getir
      const upcomingEvents = await prisma.event.findMany({
        where: additionalEventsWhere,
        orderBy: [
          { event_date: 'asc' }
        ],
        take: minEventCount - allEvents.length, // Sadece ihtiyaç duyulan kadar getir
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
      });
      
      
      // Bulunan etkinlikleri doğru formata dönüştür
      const processedUpcomingEvents = upcomingEvents.map(event => ({
        ...event,
        recommendation_reason: {
          type: 'sport_preference',
          sport_id: event.sport_id,
          sport_name: event.sport?.name || 'Diğer Etkinlik',
          skill_level: 'beginner'
        } as RecommendationReason
      }));
      
      // Ek etkinlikleri listeye ekle
      allEvents.push(...processedUpcomingEvents);
    }
    
    // Kullanıcının konumu varsa, etkinlikleri mesafeye göre sırala
    let sortedEvents = [...allEvents];

    // Konum tercihi kontrolü
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        default_location_latitude: true,
        default_location_longitude: true
      }
    });
    
    if (userProfile?.default_location_latitude && userProfile?.default_location_longitude) {
      sortedEvents = allEvents.map(event => {
        const distance = calculateDistance(
          userProfile.default_location_latitude!,
          userProfile.default_location_longitude!,
          event.location_latitude,
          event.location_longitude
        );
        return { ...event, distance };
      }).sort((a, b) => (a.distance as number) - (b.distance as number));
    } else {
      // Konumu yoksa tarihe göre sırala
      sortedEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    }
    
    console.log(`Toplam ${sortedEvents.length} etkinlik öneriliyor.`);
    
    // Sayfalama için etkinlikleri böl
    const paginatedEvents = sortedEvents.slice(skip, skip + limit);
    
    return res.status(200).json({
      success: true,
      data: {
        events: paginatedEvents,
        pagination: {
          page,
          limit,
          total: sortedEvents.length,
          totalPages: Math.ceil(sortedEvents.length / limit)
        },
        preferences: {
          sports: sportIds,
          hasLocationPreference: !!(userProfile?.default_location_latitude && userProfile?.default_location_longitude),
          hasFriends: friendIds.length > 0,
          onlyFriends: includeOnlyFriends,
          sportCategory: sportCategory || null
        }
      }
    });
  } catch (error: any) {
    console.error('Önerilen etkinlikler hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Önerilen etkinlikler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Etkinlik değerlendir
export const rateEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Etkinliğin var olup olmadığını kontrol et
    const event = await EventWithExtensions.findUnique({
      id: eventId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    // Kullanıcının etkinliğe katılıp katılmadığını kontrol et
    const participation = await EventWithExtensions.getUserParticipation(eventId, userId);
    if (!participation) {
      return res.status(403).json({
        success: false,
        message: 'Sadece etkinliğe katılan kullanıcılar değerlendirme yapabilir'
      });
    }

    // Input doğrulama
    const validationResult = rateEventSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veri formatı',
        errors: validationResult.error.format()
      });
    }

    const { rating, review } = validationResult.data;

    // Kullanıcının daha önce değerlendirme yapıp yapmadığını kontrol et
    const existingRating = await EventWithExtensions.getUserRating(eventId, userId);

    let ratingResult;
    if (existingRating) {
      // Mevcut değerlendirmeyi güncelle
      ratingResult = await EventWithExtensions.updateRating(existingRating.id, rating, review);
    } else {
      // Yeni değerlendirme ekle
      ratingResult = await EventWithExtensions.addRating(eventId, userId, rating, review);
    }

    // Etkinliğin ortalama puanını hesapla
    const averageRating = await EventWithExtensions.getAverageRating(eventId);

    return res.status(200).json({
      success: true,
      message: existingRating ? 'Değerlendirmeniz güncellendi' : 'Değerlendirmeniz kaydedildi',
      data: {
        rating: ratingResult,
        eventRating: averageRating
      }
    });
  } catch (error: any) {
    console.error('Etkinlik değerlendirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Etkinlik değerlendirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// Etkinlik değerlendirmelerini görüntüle
export const getEventRatings = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    // Etkinliğin var olup olmadığını kontrol et
    const event = await EventWithExtensions.findUnique({
      id: eventId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    // Değerlendirmeleri getir
    const ratings = await EventWithExtensions.getRatings(eventId);
    const averageRating = await EventWithExtensions.getAverageRating(eventId);

    return res.status(200).json({
      success: true,
      data: {
        ratings,
        stats: averageRating
      }
    });
  } catch (error: any) {
    console.error('Etkinlik değerlendirmeleri hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Etkinlik değerlendirmeleri getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// İki konum arası mesafeyi hesapla (Haversine formülü)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Kilometre cinsinden mesafe
  return parseFloat(distance.toFixed(2));
}

// Derece cinsinden açıyı radyana çevir
function toRad(deg: number): number {
  return deg * (Math.PI/180);
}

// Event sınıfına eklenmesi gereken yardımcı metotlar
EventWithExtensions.count = async (where: EventWhereInput = {}) => {
  const count = await prisma.event.count({
    where
  });
  return count;
};

EventWithExtensions.getParticipantCount = async (eventId: string) => {
  const count = await prisma.event_participant.count({
    where: {
      event_id: eventId
    }
  });
  return count;
};

EventWithExtensions.getUserParticipation = async (eventId: string, userId: string) => {
  return prisma.event_participant.findUnique({
    where: {
      event_id_user_id: {
        event_id: eventId,
        user_id: userId
      }
    }
  });
};

EventWithExtensions.getUserEvents = async (userId: string, skip: number = 0, take: number = 10) => {
  return prisma.event_participant.findMany({
    skip,
    take,
    where: {
      user_id: userId
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
              last_name: true
            }
          }
        }
      }
    },
    orderBy: {
      event: {
        event_date: 'asc'
      }
    }
  });
};

EventWithExtensions.countUserEvents = async (userId: string) => {
  return prisma.event_participant.count({
    where: {
      user_id: userId
    }
  });
};

EventWithExtensions.getUserSportPreferences = async (userId: string) => {
  return prisma.user_sport.findMany({
    where: {
      user_id: userId
    }
  });
};

EventWithExtensions.findNearby = async (latitude: number, longitude: number, radiusKm: number = 10) => {
  // PostgreSQL'in coğrafi sorgu özelliklerini kullanmak için özel sorgu
  // 1 derece yaklaşık olarak 111 km'ye eşittir
  const latDiff = radiusKm / 111;
  const lonDiff = radiusKm / (111 * Math.cos(latitude * (Math.PI / 180)));

  return prisma.event.findMany({
    where: {
      location_latitude: {
        gte: latitude - latDiff,
        lte: latitude + latDiff,
      },
      location_longitude: {
        gte: longitude - lonDiff,
        lte: longitude + lonDiff,
      },
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          first_name: true,
          last_name: true,
        },
      },
      sport: true,
      _count: {
        select: {
          participants: true,
        },
      },
    },
  });
};

EventWithExtensions.addParticipant = async (eventId: string, userId: string, role: string = 'participant') => {
  return prisma.event_participant.create({
    data: {
      event_id: eventId,
      user_id: userId,
      role,
    },
  });
};

EventWithExtensions.removeParticipant = async (eventId: string, userId: string) => {
  return prisma.event_participant.delete({
    where: {
      event_id_user_id: {
        event_id: eventId,
        user_id: userId,
      },
    },
  });
};

EventWithExtensions.getRatings = async (eventId: string) => {
  return prisma.event_rating.findMany({
    where: {
      event_id: eventId,
    },
    include: {
      user: true,
    },
  });
};

EventWithExtensions.getUserRating = async (eventId: string, userId: string) => {
  return prisma.event_rating.findFirst({
    where: {
      event_id: eventId,
      user_id: userId,
    },
  });
};

EventWithExtensions.addRating = async (eventId: string, userId: string, rating: number, review: string) => {
  return prisma.event_rating.create({
    data: {
      event_id: eventId,
      user_id: userId,
      rating,
      review,
    },
  });
};

EventWithExtensions.updateRating = async (id: string, rating: number, review: string) => {
  return prisma.event_rating.update({
    where: { id },
    data: {
      rating,
      review,
    },
  });
};

EventWithExtensions.getAverageRating = async (eventId: string) => {
  const result = await prisma.event_rating.aggregate({
    where: {
      event_id: eventId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  return {
    average: result._avg.rating || 0,
    count: result._count.rating || 0,
  };
};

// Etkinlik davet kodunu getir (sadece etkinlik sahibi)
export const getEventInvitationCode = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Etkinliğin var olup olmadığını kontrol et
    const event = await EventWithExtensions.findUnique({
      id: eventId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    // Etkinliğin sahibi olup olmadığını kontrol et
    if (event.creator_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bu etkinliğin davet kodunu görme yetkiniz yok'
      });
    }

    // Etkinlik özel değilse hata döndür
    if (!event.is_private) {
      return res.status(400).json({
        success: false,
        message: 'Bu etkinlik özel değil, davet kodu bulunmamaktadır'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        invitation_code: event.invitation_code
      }
    });
  } catch (error: any) {
    console.error('Etkinlik davet kodu getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Etkinlik davet kodu getirilirken bir hata oluştu',
      error: error.message
    });
  }
}; 