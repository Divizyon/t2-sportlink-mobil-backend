"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsService = exports.EventsService = void 0;
const prisma_service_1 = require("./prisma.service");
/**
 * Etkinlik servisi
 */
class EventsService extends prisma_service_1.PrismaService {
    /**
     * Tüm etkinlikleri getirir
     */
    async findAll(params) {
        // Filtreleme için where koşulunu oluştur
        let where = {};
        if (params) {
            if (params.sport_id)
                where.sport_id = Number(params.sport_id);
            if (params.creator_id)
                where.creator_id = Number(params.creator_id);
            if (params.location_name)
                where.location_name = { contains: params.location_name };
            if (params.status)
                where.status = params.status;
            // Tarih aralığı filtresi
            if (params.min_date || params.max_date) {
                where.event_date = {};
                if (params.min_date)
                    where.event_date.gte = params.min_date;
                if (params.max_date)
                    where.event_date.lte = params.max_date;
            }
            // Konum filtresi (basit yaklaşım, tam hesaplama için postgis kullanılmalı)
            // Bu kısım sadece yaklaşık bir hesaplama yapar
            if (params.latitude && params.longitude && params.distance) {
                // Bu kısımda manuel olarak yaklaşık konumları filtrele
                // Gerçek uygulamada bu hesaplama veritabanı seviyesinde yapılmalıdır
            }
        }
        return this.prismaClient.events.findMany({
            where,
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                        profile_picture: true
                    }
                },
                sport: true,
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profile_picture: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                event_date: 'asc'
            }
        });
    }
    /**
     * ID'ye göre etkinlik getirir
     */
    async findById(id) {
        return this.prismaClient.events.findUnique({
            where: { id: Number(id) },
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                        profile_picture: true
                    }
                },
                sport: true,
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profile_picture: true
                            }
                        }
                    }
                },
                ratings: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profile_picture: true
                            }
                        }
                    }
                }
            }
        });
    }
    /**
     * Yeni etkinlik oluşturur
     */
    async create(eventData) {
        const data = {
            ...eventData,
            creator_id: Number(eventData.creator_id),
            sport_id: Number(eventData.sport_id)
        };
        return this.prismaClient.events.create({
            data
        });
    }
    /**
     * Etkinlik günceller
     */
    async update(id, eventData) {
        return this.prismaClient.events.update({
            where: { id: Number(id) },
            data: eventData
        });
    }
    /**
     * Etkinlik siler
     */
    async delete(id) {
        return this.prismaClient.events.delete({
            where: { id: Number(id) }
        });
    }
    /**
     * Etkinliğe katılımcı ekler
     */
    async addParticipant(eventId, userId, role = 'participant') {
        return this.prismaClient.event_Participants.create({
            data: {
                event_id: Number(eventId),
                user_id: Number(userId),
                role
            }
        });
    }
    /**
     * Etkinlikten katılımcı çıkarır
     */
    async removeParticipant(eventId, userId) {
        return this.prismaClient.event_Participants.delete({
            where: {
                event_id_user_id: {
                    event_id: Number(eventId),
                    user_id: Number(userId)
                }
            }
        });
    }
    /**
     * Etkinliğe değerlendirme ekler
     */
    async addRating(eventId, userId, rating, review) {
        return this.prismaClient.event_Ratings.create({
            data: {
                event_id: Number(eventId),
                user_id: Number(userId),
                rating,
                review
            }
        });
    }
    /**
     * Kullanıcının katıldığı etkinlikleri getirir
     */
    async getUserEvents(userId) {
        return this.prismaClient.event_Participants.findMany({
            where: { user_id: Number(userId) },
            include: {
                event: {
                    include: {
                        sport: true,
                        creator: {
                            select: {
                                id: true,
                                username: true,
                                profile_picture: true
                            }
                        }
                    }
                }
            }
        });
    }
}
exports.EventsService = EventsService;
// Singleton instance
exports.eventsService = new EventsService();
//# sourceMappingURL=events.service.js.map