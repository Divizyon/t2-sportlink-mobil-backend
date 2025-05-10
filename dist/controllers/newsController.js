"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestNews = exports.getNewsBySport = exports.searchNews = exports.getNewsById = exports.getAllNews = void 0;
const news_1 = require("../models/news");
const prisma_1 = __importDefault(require("../config/prisma"));
/**
 * Tüm haberleri listeler
 */
const getAllNews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sportId = req.query.sportId;
        const skip = (page - 1) * limit;
        // Sport ID'ye göre filtrelenecekse sorguya ekle
        const whereCondition = sportId ? { sport_id: sportId } : {};
        // Toplam kayıt sayısını hesapla
        const totalCount = await prisma_1.default.news.count({
            where: whereCondition
        });
        // Haberleri getir
        const news = await prisma_1.default.news.findMany({
            skip,
            take: limit,
            where: whereCondition,
            orderBy: {
                created_at: 'desc'
            },
            include: {
                sport: true
            }
        });
        // Meta bilgileri oluştur
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        return res.status(200).json({
            status: true,
            data: news,
            meta: {
                total: totalCount,
                page,
                limit,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        });
    }
    catch (error) {
        console.error('Haberler alınırken hata oluştu:', error);
        return res.status(500).json({
            status: false,
            message: 'Haberler alınırken bir hata oluştu.'
        });
    }
};
exports.getAllNews = getAllNews;
/**
 * Haber detayını görüntüler
 */
const getNewsById = async (req, res) => {
    try {
        const { newsId } = req.params;
        const news = await news_1.News.findUnique({ id: newsId });
        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Haber bulunamadı'
            });
        }
        return res.status(200).json({
            success: true,
            data: { news }
        });
    }
    catch (error) {
        console.error('Haber detayı getirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Haber detayı getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getNewsById = getNewsById;
/**
 * Haber arama işlemi yapar
 */
const searchNews = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: 'Arama yapmak için bir anahtar kelime girin'
            });
        }
        const news = await news_1.News.search(keyword, {
            skip: (page - 1) * limit,
            take: limit
        });
        // Tüm eşleşen haberlerin sayısını getirmek için
        const allMatches = await prisma_1.default.news.findMany({
            where: {
                OR: [
                    { title: { contains: keyword, mode: 'insensitive' } },
                    { content: { contains: keyword, mode: 'insensitive' } }
                ]
            }
        });
        return res.status(200).json({
            success: true,
            data: {
                news,
                pagination: {
                    page,
                    limit,
                    total: allMatches.length,
                    totalPages: Math.ceil(allMatches.length / limit)
                },
                keyword
            }
        });
    }
    catch (error) {
        console.error('Haber arama hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Haberler aranırken bir hata oluştu',
            error: error.message
        });
    }
};
exports.searchNews = searchNews;
/**
 * Spor dalına göre haberleri listeler
 */
const getNewsBySport = async (req, res) => {
    try {
        const { sportId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // Spor dalının varlığını kontrol et
        const sport = await prisma_1.default.sport.findUnique({
            where: { id: sportId }
        });
        if (!sport) {
            return res.status(404).json({
                success: false,
                message: 'Spor dalı bulunamadı'
            });
        }
        // Spor dalına ait haberleri getir
        const news = await news_1.News.findBySport(sportId, {
            skip: (page - 1) * limit,
            take: limit
        });
        // Toplam haber sayısını bul
        const total = await prisma_1.default.news.count({
            where: { sport_id: sportId }
        });
        return res.status(200).json({
            success: true,
            data: {
                news,
                sport,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        console.error('Spor dalına göre haber listeleme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Spor dalına ait haberler getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getNewsBySport = getNewsBySport;
/**
 * En son haberleri listeler
 */
const getLatestNews = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const news = await news_1.News.findLatest(limit);
        return res.status(200).json({
            success: true,
            data: { news }
        });
    }
    catch (error) {
        console.error('En son haberler hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'En son haberler getirilirken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getLatestNews = getLatestNews;
//# sourceMappingURL=newsController.js.map