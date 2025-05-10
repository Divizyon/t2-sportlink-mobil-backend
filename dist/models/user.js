"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
/**
 * Kullanıcı modeli
 */
class User {
    /**
     * Yeni bir kullanıcı oluşturur
     */
    static async create(data) {
        return prisma_1.default.user.create({
            data,
        });
    }
    /**
     * Kullanıcı bilgilerini günceller
     */
    static async update(where, data) {
        return prisma_1.default.user.update({
            where,
            data,
        });
    }
    /**
     * Kullanıcıyı siler
     */
    static async delete(where) {
        return prisma_1.default.user.delete({
            where,
        });
    }
    /**
     * Belirli bir kullanıcıyı getirir
     */
    static async findUnique(where) {
        return prisma_1.default.user.findUnique({
            where,
        });
    }
    /**
     * Belirli bir koşula göre ilk kullanıcıyı getirir
     */
    static async findFirst(where) {
        return prisma_1.default.user.findFirst({
            where,
        });
    }
    /**
     * Tüm kullanıcıları getirir
     */
    static async findMany(params) {
        const { skip, take, where, orderBy } = params || {};
        return prisma_1.default.user.findMany({
            skip,
            take,
            where,
            orderBy,
        });
    }
    /**
     * E-posta adresine göre kullanıcı bulur
     */
    static async findByEmail(email) {
        return prisma_1.default.user.findUnique({
            where: { email },
        });
    }
    /**
     * Kullanıcı adına göre kullanıcı bulur
     */
    static async findByUsername(username) {
        return prisma_1.default.user.findUnique({
            where: { username },
        });
    }
    /**
     * Doğrulama token'ına göre kullanıcı bulur
     */
    static async findByVerificationToken(token) {
        return prisma_1.default.user.findFirst({
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
    static async getParticipatedEvents(userId) {
        return prisma_1.default.event_participant.findMany({
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
    static async getCreatedEvents(userId) {
        return prisma_1.default.event.findMany({
            where: {
                creator_id: userId,
            },
        });
    }
    /**
     * Kullanıcının spor dallarını getirir
     */
    static async getSports(userId) {
        return prisma_1.default.user_sport.findMany({
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
    static async addSport(userId, sportId, skillLevel) {
        return prisma_1.default.user_sport.create({
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
    static async removeSport(userId, sportId) {
        return prisma_1.default.user_sport.delete({
            where: {
                user_id_sport_id: {
                    user_id: userId,
                    sport_id: sportId,
                },
            },
        });
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map