"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Announcement = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
/**
 * Duyuru modeli
 */
class Announcement {
    /**
     * Yeni bir duyuru oluşturur
     */
    static async create(data) {
        return prisma_1.default.announcement.create({
            data,
        });
    }
    /**
     * Duyuru bilgilerini günceller
     */
    static async update(where, data) {
        return prisma_1.default.announcement.update({
            where,
            data,
        });
    }
    /**
     * Duyuruyu siler
     */
    static async delete(where) {
        return prisma_1.default.announcement.delete({
            where,
        });
    }
    /**
     * Belirli bir duyuruyu getirir
     */
    static async findUnique(where) {
        return prisma_1.default.announcement.findUnique({
            where,
            include: {
                creator: true,
            },
        });
    }
    /**
     * Belirli bir slug'a göre duyuru getirir
     */
    static async findBySlug(slug) {
        return prisma_1.default.announcement.findUnique({
            where: { slug },
            include: {
                creator: true,
            },
        });
    }
    /**
     * Tüm duyuruları getirir
     */
    static async findMany(params) {
        const { skip, take, where, orderBy, includeUnpublished = false } = params || {};
        return prisma_1.default.announcement.findMany({
            skip,
            take,
            where: {
                ...where,
                ...(includeUnpublished ? {} : { published: true }),
                ...(includeUnpublished ? {} : {
                    OR: [
                        { start_date: null },
                        { start_date: { lte: new Date() } }
                    ]
                }),
                ...(includeUnpublished ? {} : {
                    OR: [
                        { end_date: null },
                        { end_date: { gte: new Date() } }
                    ]
                }),
            },
            orderBy: orderBy || { created_at: 'desc' },
            include: {
                creator: true,
            },
        });
    }
    /**
     * Aktif duyuruları getirir (yayınlanmış ve tarih aralığında olan)
     */
    static async findActive() {
        const now = new Date();
        return prisma_1.default.announcement.findMany({
            where: {
                published: true,
                AND: [
                    {
                        OR: [
                            { start_date: null },
                            { start_date: { lte: now } }
                        ]
                    },
                    {
                        OR: [
                            { end_date: null },
                            { end_date: { gte: now } }
                        ]
                    }
                ]
            },
            orderBy: {
                created_at: 'desc',
            },
            include: {
                creator: true,
            },
        });
    }
    /**
     * Duyuruyu yayınlar
     */
    static async publish(id) {
        return prisma_1.default.announcement.update({
            where: { id },
            data: { published: true },
        });
    }
    /**
     * Duyuruyu yayından kaldırır
     */
    static async unpublish(id) {
        return prisma_1.default.announcement.update({
            where: { id },
            data: { published: false },
        });
    }
    /**
     * Duyuru için benzersiz bir slug oluşturur
     */
    static async generateUniqueSlug(title) {
        // Türkçe karakterleri ve diğer özel karakterleri temizleme
        let slug = title
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        // Slug'ın benzersiz olup olmadığını kontrol et
        let isUnique = false;
        let counter = 0;
        let uniqueSlug = slug;
        while (!isUnique) {
            const existing = await prisma_1.default.announcement.findUnique({
                where: { slug: uniqueSlug },
            });
            if (!existing) {
                isUnique = true;
            }
            else {
                counter++;
                uniqueSlug = `${slug}-${counter}`;
            }
        }
        return uniqueSlug;
    }
}
exports.Announcement = Announcement;
//# sourceMappingURL=Announcement.js.map