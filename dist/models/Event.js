"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
/**
 * Etkinlik modeli
 */
class Event {
    /**
     * Yeni bir etkinlik oluşturur
     */
    static async create(data) {
        return prisma_1.default.event.create({
            data,
        });
    }
    /**
     * Etkinlik bilgilerini günceller
     */
    static async update(where, data) {
        return prisma_1.default.event.update({
            where,
            data,
        });
    }
    /**
     * Etkinliği siler
     */
    static async delete(where) {
        return prisma_1.default.event.delete({
            where,
        });
    }
    /**
     * Belirli bir etkinliği getirir
     */
    static async findUnique(where) {
        return prisma_1.default.event.findUnique({
            where,
            include: {
                creator: true,
                sport: true,
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                first_name: true,
                                last_name: true,
                                profile_picture: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        participants: true,
                        ratings: true,
                    },
                },
            },
        });
    }
    /**
     * Belirli bir koşula göre ilk etkinliği getirir
     */
    static async findFirst(where) {
        return prisma_1.default.event.findFirst({
            where,
        });
    }
    /**
     * Tüm etkinlikleri getirir
     */
    static async findMany(params) {
        const { skip, take, where, orderBy } = params || {};
        return prisma_1.default.event.findMany({
            skip,
            take,
            where,
            orderBy,
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                        profile_picture: true,
                    },
                },
                sport: true,
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                first_name: true,
                                last_name: true,
                                profile_picture: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        participants: true,
                        ratings: true,
                    },
                },
            },
        });
    }
    /**
     * Etkinlik katılımcılarını getirir
     */
    static async getParticipants(eventId) {
        return prisma_1.default.event_participant.findMany({
            where: {
                event_id: eventId,
            },
            include: {
                user: true,
            },
        });
    }
    /**
     * Etkinlik değerlendirmelerini getirir
     */
    static async getRatings(eventId) {
        return prisma_1.default.event_rating.findMany({
            where: {
                event_id: eventId,
            },
            include: {
                user: true,
            },
        });
    }
    /**
     * Etkinliğe katılımcı ekler
     */
    static async addParticipant(eventId, userId, role = 'participant') {
        return prisma_1.default.event_participant.create({
            data: {
                event_id: eventId,
                user_id: userId,
                role,
            },
        });
    }
    /**
     * Etkinlikten katılımcı çıkarır
     */
    static async removeParticipant(eventId, userId) {
        return prisma_1.default.event_participant.delete({
            where: {
                event_id_user_id: {
                    event_id: eventId,
                    user_id: userId,
                },
            },
        });
    }
    /**
     * Etkinlik için değerlendirme ekler
     */
    static async addRating(eventId, userId, rating, review) {
        return prisma_1.default.event_rating.create({
            data: {
                event_id: eventId,
                user_id: userId,
                rating,
                review,
            },
        });
    }
    /**
     * Etkinlik için değerlendirme günceller
     */
    static async updateRating(id, rating, review) {
        return prisma_1.default.event_rating.update({
            where: { id },
            data: {
                rating,
                review,
            },
        });
    }
    /**
     * Etkinlik için değerlendirme siler
     */
    static async removeRating(id) {
        return prisma_1.default.event_rating.delete({
            where: { id },
        });
    }
    /**
     * Kullanıcının etkinlik için değerlendirmesini getirir
     */
    static async getUserRating(eventId, userId) {
        return prisma_1.default.event_rating.findFirst({
            where: {
                event_id: eventId,
                user_id: userId,
            },
        });
    }
    /**
     * Etkinliğin ortalama puanını hesaplar
     */
    static async getAverageRating(eventId) {
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
    }
    /**
     * Belirli bir konuma yakın etkinlikleri getirir
     */
    static async findNearby(latitude, longitude, radiusKm = 10) {
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
    }
    /**
     * Gelecek etkinlikleri getirir
     */
    static async findUpcoming() {
        return prisma_1.default.event.findMany({
            where: {
                event_date: {
                    gte: new Date(),
                },
                status: 'active',
            },
            orderBy: {
                event_date: 'asc',
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
    }
}
exports.Event = Event;
//# sourceMappingURL=Event.js.map