"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.News = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
/**
 * Haber modeli
 */
class News {
    /**
     * Yeni bir haber oluşturur
     */
    static async create(data) {
        return prisma_1.default.news.create({
            data,
        });
    }
    /**
     * Haber bilgilerini günceller
     */
    static async update(where, data) {
        return prisma_1.default.news.update({
            where,
            data,
        });
    }
    /**
     * Haberi siler
     */
    static async delete(where) {
        return prisma_1.default.news.delete({
            where,
        });
    }
    /**
     * Belirli bir haberi getirir
     */
    static async findUnique(where) {
        return prisma_1.default.news.findUnique({
            where,
            include: {
                sport: true,
            },
        });
    }
    /**
     * Belirli bir koşula göre ilk haberi getirir
     */
    static async findFirst(where) {
        return prisma_1.default.news.findFirst({
            where,
        });
    }
    /**
     * Tüm haberleri getirir
     */
    static async findMany(params) {
        const { skip, take, where, orderBy } = params || {};
        return prisma_1.default.news.findMany({
            skip,
            take,
            where,
            orderBy,
            include: {
                sport: true,
            },
        });
    }
    /**
     * Spor dalına göre haberleri getirir
     */
    static async findBySport(sportId, params) {
        const { skip, take, orderBy } = params || {};
        return prisma_1.default.news.findMany({
            where: {
                sport_id: sportId,
            },
            skip,
            take,
            orderBy: orderBy || { published_date: 'desc' },
            include: {
                sport: true,
            },
        });
    }
    /**
     * En son haberleri getirir
     */
    static async findLatest(limit = 10) {
        return prisma_1.default.news.findMany({
            take: limit,
            orderBy: {
                published_date: 'desc',
            },
            include: {
                sport: true,
            },
        });
    }
    /**
     * Anahtar kelimeye göre haberleri arar
     */
    static async search(keyword, params) {
        const { skip, take } = params || {};
        return prisma_1.default.news.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: keyword,
                            mode: 'insensitive',
                        },
                    },
                    {
                        content: {
                            contains: keyword,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            skip,
            take,
            orderBy: {
                published_date: 'desc',
            },
            include: {
                sport: true,
            },
        });
    }
}
exports.News = News;
//# sourceMappingURL=news.js.map