"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sport = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
/**
 * Spor dalı modeli
 */
class Sport {
    /**
     * Yeni bir spor dalı oluşturur
     */
    static async create(data) {
        return prisma_1.default.sport.create({
            data,
        });
    }
    /**
     * Spor dalı bilgilerini günceller
     */
    static async update(where, data) {
        return prisma_1.default.sport.update({
            where,
            data,
        });
    }
    /**
     * Spor dalını siler
     */
    static async delete(where) {
        return prisma_1.default.sport.delete({
            where,
        });
    }
    /**
     * Belirli bir spor dalını getirir
     */
    static async findUnique(where) {
        return prisma_1.default.sport.findUnique({
            where,
        });
    }
    /**
     * Belirli bir koşula göre ilk spor dalını getirir
     */
    static async findFirst(where) {
        return prisma_1.default.sport.findFirst({
            where,
        });
    }
    /**
     * Tüm spor dallarını getirir
     */
    static async findMany(params) {
        const { skip, take, where, orderBy } = params || {};
        return prisma_1.default.sport.findMany({
            skip,
            take,
            where,
            orderBy,
        });
    }
    /**
     * İsme göre spor dalı bulur
     */
    static async findByName(name) {
        return prisma_1.default.sport.findUnique({
            where: { name },
        });
    }
    /**
     * Bu spor dalına sahip kullanıcıları getirir
     */
    static async getUsers(sportId) {
        return prisma_1.default.user_sport.findMany({
            where: {
                sport_id: sportId,
            },
            include: {
                user: true,
            },
        });
    }
    /**
     * Bu spor dalına ait etkinlikleri getirir
     */
    static async getEvents(sportId) {
        return prisma_1.default.event.findMany({
            where: {
                sport_id: sportId,
            },
        });
    }
    /**
     * Bu spor dalına ait haberleri getirir
     */
    static async getNews(sportId) {
        return prisma_1.default.news.findMany({
            where: {
                sport_id: sportId,
            },
        });
    }
}
exports.Sport = Sport;
//# sourceMappingURL=Sport.js.map