"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventInvitationCode = exports.getEventRatings = exports.rateEvent = exports.getRecommendedEvents = exports.searchEvents = exports.getNearbyEvents = exports.getCreatedEvents = exports.getMyEvents = exports.leaveEvent = exports.joinEvent = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEventById = exports.getAllEvents = void 0;
const zod_1 = require("zod");
const Event_1 = require("../models/Event");
const prisma_1 = __importDefault(require("../config/prisma"));
const Friend_1 = require("../models/Friend");
// Event sınıfını genişletmek için tipini EventClass ile birleştir
const EventWithExtensions = Event_1.Event;
// Etkinlik oluşturma için schema
const createEventSchema = zod_1.z.object({
    sport_id: zod_1.z.string().uuid('Geçerli bir spor ID\'si giriniz'),
    title: zod_1.z.string().min(3, 'Başlık en az 3 karakter olmalıdır'),
    description: zod_1.z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
    event_date: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Geçerli bir tarih giriniz',
    }),
    start_time: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Geçerli bir başlangıç zamanı giriniz',
    }),
    end_time: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Geçerli bir bitiş zamanı giriniz',
    }),
    location_name: zod_1.z.string().min(3, 'Konum adı en az 3 karakter olmalıdır'),
    location_latitude: zod_1.z.number().min(-90).max(90),
    location_longitude: zod_1.z.number().min(-180).max(180),
    max_participants: zod_1.z.number().int().positive(),
    status: zod_1.z.enum(['active', 'canceled', 'completed', 'draft']),
    is_private: zod_1.z.boolean().default(false),
    invitation_code: zod_1.z.string().min(4).optional().nullable(),
});
// Etkinlik güncelleme için schema
const updateEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Başlık en az 3 karakter olmalıdır').optional(),
    description: zod_1.z.string().min(10, 'Açıklama en az 10 karakter olmalıdır').optional(),
    event_date: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Geçerli bir tarih giriniz',
    }).optional(),
    start_time: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Geçerli bir başlangıç zamanı giriniz',
    }).optional(),
    end_time: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Geçerli bir bitiş zamanı giriniz',
    }).optional(),
    location_name: zod_1.z.string().min(3, 'Konum adı en az 3 karakter olmalıdır').optional(),
    location_latitude: zod_1.z.number().min(-90).max(90).optional(),
    location_longitude: zod_1.z.number().min(-180).max(180).optional(),
    max_participants: zod_1.z.number().int().positive().optional(),
    status: zod_1.z.enum(['active', 'canceled', 'completed', 'draft']).optional(),
});
// Etkinlik değerlendirme için schema
const rateEventSchema = zod_1.z.object({
    rating: zod_1.z.number().int().min(1).max(5),
    review: zod_1.z.string().min(3, 'Yorum en az 3 karakter olmalıdır'),
});
// Tüm etkinlikleri getir
const getAllEvents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 200; // Varsayılan limit 10'dan 200'e çıkarıldı
        const skip = (page - 1) * limit;
        // Spor dalına göre filtreleme
        const sportId = req.query.sportId;
        let where = {};
        if (sportId) {
            where = { sport_id: sportId };
        }
        // Status filtreleme (varsayılan olarak aktif etkinlikler)
        const status = req.query.status || 'active';
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
    }
    catch (error) {
        console.error('Etkinlik listeleme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Etkinlikler getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getAllEvents = getAllEvents;
// Etkinlik detayını getir
const getEventById = async (req, res) => {
    var _a, _b;
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
        const participantCount = ((_a = event._count) === null || _a === void 0 ? void 0 : _a.participants) || 0;
        // Katılımcı listesi
        const participants = ((_b = event.participants) === null || _b === void 0 ? void 0 : _b.map((participant) => participant.user)) || [];
        return res.status(200).json({
            success: true,
            data: {
                event,
                participant_count: participantCount,
                participants
            }
        });
    }
    catch (error) {
        console.error('Etkinlik detayı getirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Etkinlik detayı getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getEventById = getEventById;
// Etkinlik oluştur
const createEvent = async (req, res) => {
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
    }
    catch (error) {
        console.error('Etkinlik oluşturma hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Etkinlik oluşturulurken bir hata oluştu',
            error: error.message
        });
    }
};
exports.createEvent = createEvent;
// Etkinlik güncelle
const updateEvent = async (req, res) => {
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
            updateData.event_date = new Date(updateData.event_date);
        }
        if (updateData.start_time) {
            updateData.start_time = new Date(updateData.start_time);
        }
        if (updateData.end_time) {
            updateData.end_time = new Date(updateData.end_time);
        }
        // Etkinliği güncelle
        const updatedEvent = await EventWithExtensions.update({ id: eventId }, updateData);
        return res.status(200).json({
            success: true,
            message: 'Etkinlik başarıyla güncellendi',
            data: { event: updatedEvent }
        });
    }
    catch (error) {
        console.error('Etkinlik güncelleme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Etkinlik güncellenirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.updateEvent = updateEvent;
// Etkinliği sil
const deleteEvent = async (req, res) => {
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
    }
    catch (error) {
        console.error('Etkinlik silme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Etkinlik silinirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.deleteEvent = deleteEvent;
// Etkinlik e katıl
const joinEvent = async (req, res) => {
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
    }
    catch (error) {
        console.error('Etkinliğe katılma hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Etkinliğe katılırken bir hata oluştu',
            error: error.message
        });
    }
};
exports.joinEvent = joinEvent;
// Etkinlikten ayrıl
const leaveEvent = async (req, res) => {
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
    }
    catch (error) {
        console.error('Etkinlikten ayrılma hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Etkinlikten ayrılırken bir hata oluştu',
            error: error.message
        });
    }
};
exports.leaveEvent = leaveEvent;
// Kullanıcının katıldığı etkinlikleri getir
const getMyEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
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
    }
    catch (error) {
        console.error('Katıldığım etkinlikler hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Katıldığınız etkinlikler getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getMyEvents = getMyEvents;
// Kullanıcının oluşturduğu etkinlikleri getir
const getCreatedEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
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
    }
    catch (error) {
        console.error('Oluşturduğum etkinlikler hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Oluşturduğunuz etkinlikler getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getCreatedEvents = getCreatedEvents;
// Yakındaki etkinlikleri getir
const getNearbyEvents = async (req, res) => {
    try {
        const latitude = parseFloat(req.query.latitude);
        const longitude = parseFloat(req.query.longitude);
        const radius = parseFloat(req.query.radius) || 10; // km cinsinden varsayılan 10km
        const useDistanceMatrix = req.query.useDistanceMatrix === 'true'; // Google Maps Distance Matrix API kullanımı için flag
        const limit = parseInt(req.query.limit) || 200; // Varsayılan limit 200 olarak ayarlandı
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
                const { calculateBulkDistances } = await Promise.resolve().then(() => __importStar(require('../utils/maps.util')));
                // Etkinliklerin konumlarını topla
                const destinations = events.map(event => ({
                    id: event.id,
                    lat: event.location_latitude,
                    lng: event.location_longitude
                }));
                // Bulk mesafe hesaplaması yap
                const distanceResults = await calculateBulkDistances({ lat: latitude, lng: longitude }, destinations);
                // Sonuçları etkinliklere ekle
                if (distanceResults.success) {
                    // Her etkinlik için mesafe bilgisini ekle
                    events = events.map(event => {
                        const distanceInfo = distanceResults.results.find(r => r.id === event.id);
                        if (!distanceInfo)
                            return event;
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
                    events.sort((a, b) => {
                        var _a, _b;
                        const distA = ((_a = a.distance_info) === null || _a === void 0 ? void 0 : _a.distance) || Infinity;
                        const distB = ((_b = b.distance_info) === null || _b === void 0 ? void 0 : _b.distance) || Infinity;
                        return distA - distB;
                    });
                    // Gerçek mesafeye göre filtrele (metre cinsinden)
                    events = events.filter((event) => !event.distance_info || event.distance_info.distance <= radius * 1000);
                }
            }
            catch (distanceError) {
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
    }
    catch (error) {
        console.error('Yakındaki etkinlikler hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Yakındaki etkinlikler getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getNearbyEvents = getNearbyEvents;
// Etkinlik ara
const searchEvents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 200; // Varsayılan limit 200 olarak ayarlandı
        const skip = (page - 1) * limit;
        const keyword = req.query.keyword;
        const sportId = req.query.sportId;
        const status = req.query.status || 'active';
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const minParticipants = parseInt(req.query.minParticipants);
        const maxParticipants = parseInt(req.query.maxParticipants);
        const locationName = req.query.locationName;
        // Arama kriterleri oluştur
        let where = {};
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
            }
            else {
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
    }
    catch (error) {
        console.error('Etkinlik arama hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Etkinlikler aranırken bir hata oluştu',
            error: error.message
        });
    }
};
exports.searchEvents = searchEvents;
// Kullanıcı için önerilen etkinlikleri getir
const getRecommendedEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 200; // Varsayılan limit 200 olarak ayarlandı
        const skip = (page - 1) * limit;
        const includeOnlyFriends = req.query.onlyFriends === 'true';
        const sportCategory = req.query.sportCategory; // Belirli bir spor kategorisi için filtreleme
        const minEventCount = parseInt(req.query.minEventCount) || 5; // Minimum etkinlik sayısı
        const includeBoth = req.query.includeBoth === 'true' || true; // Hem arkadaş hem spor tercihlerini içer (varsayılan true)
        // Kullanıcının spor tercihleri
        const userSports = await EventWithExtensions.getUserSportPreferences(userId);
        // Kullanıcının arkadaşlarını getir
        const friends = await Friend_1.Friend.getFriends(userId);
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
        let sportBasedEvents = [];
        let friendBasedEvents = [];
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
                        const sportPreferenceWhere = {
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
                }
                else {
                    console.log('Filtreye uygun spor tercihi bulunamadı');
                }
            }
            catch (error) {
                console.error('Spor bazlı etkinlikler getirilirken hata:', error);
            }
        }
        // Arkadaş katılımlarına göre etkinlikler
        if (friendIds.length > 0) {
            try {
                console.log(`Arkadaş ID'leri:`, friendIds);
                // Spor kategorisi filtrelemesi yapılacaksa
                const friendEventWhere = {
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
                const friendEvents = await prisma_1.default.event.findMany({
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
                let processedFriendEvents = [];
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
                        console.log(`Etkinlik "${event.title}" için katılan arkadaşlar:`, participantFriends.map(f => `${f.first_name || ''} ${f.last_name || ''} (${f.username})`).join(", "));
                        // Etkinlikten participants alanını çıkar (fazlalık olmaması için)
                        const { participants, ...eventWithoutParticipants } = event;
                        // Etkinlik ve arkadaş bilgilerini döndür
                        return {
                            ...eventWithoutParticipants,
                            recommendation_reason: {
                                type: 'friend_participation',
                                friend_count: participantFriends.length,
                                friends: participantFriends.slice(0, 3) // En fazla 3 arkadaş göster
                            }
                        };
                    });
                }
                friendBasedEvents = processedFriendEvents;
            }
            catch (error) {
                console.error('Arkadaş etkinlikleri getirilirken hata:', error);
            }
        }
        // Her etkinliğe neden önerildiğine dair bilgi ekle
        const processedSportEvents = sportBasedEvents.map(event => {
            var _a;
            // Kullanıcının tercih ettiği spor dalını bul
            const userSport = userSports.find(s => s.sport_id === event.sport_id);
            return {
                ...event,
                recommendation_reason: {
                    type: 'sport_preference',
                    sport_id: event.sport_id,
                    sport_name: ((_a = event.sport) === null || _a === void 0 ? void 0 : _a.name) || event.sport_id,
                    skill_level: (userSport === null || userSport === void 0 ? void 0 : userSport.skill_level) || 'intermediate'
                }
            };
        });
        // Sadece arkadaş etkinlikleri isteniyorsa, diğerlerini kullanma
        const allEvents = includeOnlyFriends ? [] : [...processedSportEvents];
        // Arkadaş bazlı etkinlikleri ekle ama aynı etkinliği tekrar ekleme
        friendBasedEvents.forEach(friendEvent => {
            if (includeOnlyFriends) {
                // Sadece arkadaş bazlı etkinlikler isteniyorsa direkt ekle
                allEvents.push(friendEvent);
            }
            else {
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
                        }
                    };
                }
                else {
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
            const additionalEventsWhere = {
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
            const upcomingEvents = await prisma_1.default.event.findMany({
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
            const processedUpcomingEvents = upcomingEvents.map(event => {
                var _a;
                return ({
                    ...event,
                    recommendation_reason: {
                        type: 'sport_preference',
                        sport_id: event.sport_id,
                        sport_name: ((_a = event.sport) === null || _a === void 0 ? void 0 : _a.name) || 'Diğer Etkinlik',
                        skill_level: 'beginner'
                    }
                });
            });
            // Ek etkinlikleri listeye ekle
            allEvents.push(...processedUpcomingEvents);
        }
        // Kullanıcının konumu varsa, etkinlikleri mesafeye göre sırala
        let sortedEvents = [...allEvents];
        // Konum tercihi kontrolü
        const userProfile = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                default_location_latitude: true,
                default_location_longitude: true
            }
        });
        if ((userProfile === null || userProfile === void 0 ? void 0 : userProfile.default_location_latitude) && (userProfile === null || userProfile === void 0 ? void 0 : userProfile.default_location_longitude)) {
            sortedEvents = allEvents.map(event => {
                const distance = calculateDistance(userProfile.default_location_latitude, userProfile.default_location_longitude, event.location_latitude, event.location_longitude);
                return { ...event, distance };
            }).sort((a, b) => a.distance - b.distance);
        }
        else {
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
                    hasLocationPreference: !!((userProfile === null || userProfile === void 0 ? void 0 : userProfile.default_location_latitude) && (userProfile === null || userProfile === void 0 ? void 0 : userProfile.default_location_longitude)),
                    hasFriends: friendIds.length > 0,
                    onlyFriends: includeOnlyFriends,
                    sportCategory: sportCategory || null
                }
            }
        });
    }
    catch (error) {
        console.error('Önerilen etkinlikler hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Önerilen etkinlikler getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getRecommendedEvents = getRecommendedEvents;
// Etkinlik değerlendir
const rateEvent = async (req, res) => {
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
        }
        else {
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
    }
    catch (error) {
        console.error('Etkinlik değerlendirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Etkinlik değerlendirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.rateEvent = rateEvent;
// Etkinlik değerlendirmelerini görüntüle
const getEventRatings = async (req, res) => {
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
    }
    catch (error) {
        console.error('Etkinlik değerlendirmeleri hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Etkinlik değerlendirmeleri getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getEventRatings = getEventRatings;
// İki konum arası mesafeyi hesapla (Haversine formülü)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Kilometre cinsinden mesafe
    return parseFloat(distance.toFixed(2));
}
// Derece cinsinden açıyı radyana çevir
function toRad(deg) {
    return deg * (Math.PI / 180);
}
// Event sınıfına eklenmesi gereken yardımcı metotlar
EventWithExtensions.count = async (where = {}) => {
    const count = await prisma_1.default.event.count({
        where
    });
    return count;
};
EventWithExtensions.getParticipantCount = async (eventId) => {
    const count = await prisma_1.default.event_participant.count({
        where: {
            event_id: eventId
        }
    });
    return count;
};
EventWithExtensions.getUserParticipation = async (eventId, userId) => {
    return prisma_1.default.event_participant.findUnique({
        where: {
            event_id_user_id: {
                event_id: eventId,
                user_id: userId
            }
        }
    });
};
EventWithExtensions.getUserEvents = async (userId, skip = 0, take = 10) => {
    return prisma_1.default.event_participant.findMany({
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
EventWithExtensions.countUserEvents = async (userId) => {
    return prisma_1.default.event_participant.count({
        where: {
            user_id: userId
        }
    });
};
EventWithExtensions.getUserSportPreferences = async (userId) => {
    return prisma_1.default.user_sport.findMany({
        where: {
            user_id: userId
        }
    });
};
EventWithExtensions.findNearby = async (latitude, longitude, radiusKm = 10) => {
    // PostgreSQL'in coğrafi sorgu özelliklerini kullanmak için özel sorgu
    // 1 derece yaklaşık olarak 111 km'ye eşittir
    const latDiff = radiusKm / 111;
    const lonDiff = radiusKm / (111 * Math.cos(latitude * (Math.PI / 180)));
    return prisma_1.default.event.findMany({
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
EventWithExtensions.addParticipant = async (eventId, userId, role = 'participant') => {
    return prisma_1.default.event_participant.create({
        data: {
            event_id: eventId,
            user_id: userId,
            role,
        },
    });
};
EventWithExtensions.removeParticipant = async (eventId, userId) => {
    return prisma_1.default.event_participant.delete({
        where: {
            event_id_user_id: {
                event_id: eventId,
                user_id: userId,
            },
        },
    });
};
EventWithExtensions.getRatings = async (eventId) => {
    return prisma_1.default.event_rating.findMany({
        where: {
            event_id: eventId,
        },
        include: {
            user: true,
        },
    });
};
EventWithExtensions.getUserRating = async (eventId, userId) => {
    return prisma_1.default.event_rating.findFirst({
        where: {
            event_id: eventId,
            user_id: userId,
        },
    });
};
EventWithExtensions.addRating = async (eventId, userId, rating, review) => {
    return prisma_1.default.event_rating.create({
        data: {
            event_id: eventId,
            user_id: userId,
            rating,
            review,
        },
    });
};
EventWithExtensions.updateRating = async (id, rating, review) => {
    return prisma_1.default.event_rating.update({
        where: { id },
        data: {
            rating,
            review,
        },
    });
};
EventWithExtensions.getAverageRating = async (eventId) => {
    const result = await prisma_1.default.event_rating.aggregate({
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
const getEventInvitationCode = async (req, res) => {
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
    }
    catch (error) {
        console.error('Etkinlik davet kodu getirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Etkinlik davet kodu getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getEventInvitationCode = getEventInvitationCode;
//# sourceMappingURL=eventController.js.map