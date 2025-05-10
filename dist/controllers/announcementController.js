"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnouncementBySlug = exports.getAnnouncementById = exports.getActiveAnnouncements = exports.getAllAnnouncements = void 0;
const Announcement_1 = require("../models/Announcement");
const prisma_1 = __importDefault(require("../config/prisma"));
/**
 * Duyuruları listeler
 */
const getAllAnnouncements = async (req, res) => {
    var _a;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const includeUnpublished = (req.query.includeUnpublished === 'true');
        // Admin kullanıcılar yayınlanmamış duyuruları da görebilir
        const isAdmin = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'admin';
        // Parametreler
        const params = {
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { created_at: 'desc' },
            includeUnpublished: isAdmin && includeUnpublished
        };
        // Duyuruları getir
        const announcements = await Announcement_1.Announcement.findMany(params);
        // Toplam duyuru sayısını hesapla
        const whereClause = !isAdmin || !includeUnpublished ?
            {
                published: true,
                OR: [
                    { start_date: null },
                    { start_date: { lte: new Date() } }
                ],
                AND: [
                    {
                        OR: [
                            { end_date: null },
                            { end_date: { gte: new Date() } }
                        ]
                    }
                ]
            } : undefined;
        const total = await prisma_1.default.announcement.count({ where: whereClause });
        const totalPages = Math.ceil(total / limit);
        return res.status(200).json({
            success: true,
            data: {
                announcements,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            }
        });
    }
    catch (error) {
        console.error('Duyuru listeleme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Duyurular getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getAllAnnouncements = getAllAnnouncements;
/**
 * Aktif duyuruları listeler
 */
const getActiveAnnouncements = async (req, res) => {
    try {
        // Aktif duyuruları getir
        const announcements = await Announcement_1.Announcement.findActive();
        return res.status(200).json({
            success: true,
            data: {
                announcements,
                count: announcements.length
            }
        });
    }
    catch (error) {
        console.error('Aktif duyuru listeleme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Aktif duyurular getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getActiveAnnouncements = getActiveAnnouncements;
/**
 * Duyuru detayını görüntüler
 */
const getAnnouncementById = async (req, res) => {
    var _a, _b;
    try {
        const { announcementId } = req.params;
        const announcement = await Announcement_1.Announcement.findUnique({ id: announcementId });
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Duyuru bulunamadı'
            });
        }
        // Duyuru yayınlanmamışsa sadece admin kullanıcılar görebilir
        if (!announcement.published && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bu duyuruyu görüntüleme yetkiniz yok'
            });
        }
        // Duyuru tarihi kontrolü
        const now = new Date();
        if (announcement.published &&
            ((announcement.start_date && announcement.start_date > now) ||
                (announcement.end_date && announcement.end_date < now)) &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            return res.status(404).json({
                success: false,
                message: 'Duyuru bulunamadı veya aktif değil'
            });
        }
        return res.status(200).json({
            success: true,
            data: { announcement }
        });
    }
    catch (error) {
        console.error('Duyuru detayı getirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Duyuru detayı getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getAnnouncementById = getAnnouncementById;
/**
 * Duyuru detayını slug ile görüntüler
 */
const getAnnouncementBySlug = async (req, res) => {
    var _a, _b;
    try {
        const { slug } = req.params;
        const announcement = await Announcement_1.Announcement.findBySlug(slug);
        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Duyuru bulunamadı'
            });
        }
        // Duyuru yayınlanmamışsa sadece admin kullanıcılar görebilir
        if (!announcement.published && ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bu duyuruyu görüntüleme yetkiniz yok'
            });
        }
        // Duyuru tarihi kontrolü
        const now = new Date();
        if (announcement.published &&
            ((announcement.start_date && announcement.start_date > now) ||
                (announcement.end_date && announcement.end_date < now)) &&
            ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
            return res.status(404).json({
                success: false,
                message: 'Duyuru bulunamadı veya aktif değil'
            });
        }
        return res.status(200).json({
            success: true,
            data: { announcement }
        });
    }
    catch (error) {
        console.error('Duyuru detayı getirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Duyuru detayı getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getAnnouncementBySlug = getAnnouncementBySlug;
//# sourceMappingURL=announcementController.js.map