import express from 'express';
import * as newsController from '../controllers/news.controller';

const router = express.Router();

/**
 * @swagger
 * /api/v1/news:
 *   get:
 *     tags: [Haberler]
 *     summary: Tüm haberleri getirir
 *     description: Tüm haberleri filtreleme seçenekleriyle birlikte getirir
 *     parameters:
 *       - in: query
 *         name: sport_id
 *         schema:
 *           type: integer
 *         description: Spor ID'sine göre filtrele
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Sayfa başına haber sayısı
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Atlama sayısı (sayfalama için)
 *     responses:
 *       200:
 *         description: Başarılı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', newsController.getAllNews);

/**
 * @swagger
 * /api/v1/news/latest:
 *   get:
 *     tags: [Haberler]
 *     summary: Son haberleri getirir
 *     description: Belirtilen sayıda son haberi getirir
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Getirilecek haber sayısı
 *     responses:
 *       200:
 *         description: Başarılı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/latest', newsController.getLatestNews);

/**
 * @swagger
 * /api/v1/news/sport/{sportId}:
 *   get:
 *     tags: [Haberler]
 *     summary: Spor ID'sine göre haberleri getirir
 *     description: Belirtilen spor ID'sine sahip haberleri getirir
 *     parameters:
 *       - in: path
 *         name: sportId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Spor ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Getirilecek haber sayısı
 *     responses:
 *       200:
 *         description: Başarılı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/sport/:sportId', newsController.getNewsBySportId);

/**
 * @swagger
 * /api/v1/news/{id}:
 *   get:
 *     tags: [Haberler]
 *     summary: ID ile haber getirir
 *     description: Belirtilen ID'ye sahip haberi getirir
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Haber ID
 *     responses:
 *       200:
 *         description: Başarılı
 *       404:
 *         description: Haber bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:id', newsController.getNewsById);

export default router; 