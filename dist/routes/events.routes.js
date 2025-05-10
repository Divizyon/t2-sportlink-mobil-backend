"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const events_controller_1 = require("../controllers/events.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * /events:
 *   get:
 *     summary: Tüm etkinlikleri getirir (Filtreleme desteği ile)
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: sport_id
 *         schema:
 *           type: integer
 *         description: Spor ID'sine göre filtrele
 *       - in: query
 *         name: creator_id
 *         schema:
 *           type: integer
 *         description: Oluşturan kullanıcı ID'sine göre filtrele
 *       - in: query
 *         name: location_name
 *         schema:
 *           type: string
 *         description: Konum adına göre filtrele
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, cancelled, completed]
 *         description: Etkinlik durumuna göre filtrele
 *       - in: query
 *         name: min_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Minimum etkinlik tarihi
 *       - in: query
 *         name: max_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Maksimum etkinlik tarihi
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Konum enlem (latitude)
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Konum boylam (longitude)
 *       - in: query
 *         name: distance
 *         schema:
 *           type: number
 *         description: Mesafe (km cinsinden)
 *     responses:
 *       200:
 *         description: Etkinlikler başarıyla getirildi
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', events_controller_1.getAllEvents);
/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: ID'ye göre etkinlik getirir
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Etkinlik ID
 *     responses:
 *       200:
 *         description: Etkinlik başarıyla getirildi
 *       404:
 *         description: Etkinlik bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:id', events_controller_1.getEventById);
/**
 * @swagger
 * /events:
 *   post:
 *     summary: Yeni etkinlik oluşturur
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - creator_id
 *               - sport_id
 *               - title
 *               - description
 *               - event_date
 *               - start_time
 *               - end_time
 *               - location_name
 *               - location_latitude
 *               - location_longitude
 *               - max_participants
 *               - status
 *             properties:
 *               creator_id:
 *                 type: integer
 *               sport_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               event_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               location_name:
 *                 type: string
 *               location_latitude:
 *                 type: number
 *               location_longitude:
 *                 type: number
 *               max_participants:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, cancelled, completed]
 *     responses:
 *       201:
 *         description: Etkinlik başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       500:
 *         description: Sunucu hatası
 */
router.post('/', auth_middleware_1.isAuthenticated, events_controller_1.createEvent);
/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Etkinlik günceller
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Etkinlik ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               event_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               location_name:
 *                 type: string
 *               location_latitude:
 *                 type: number
 *               location_longitude:
 *                 type: number
 *               max_participants:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, cancelled, completed]
 *     responses:
 *       200:
 *         description: Etkinlik başarıyla güncellendi
 *       404:
 *         description: Etkinlik bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:id', auth_middleware_1.isAuthenticated, events_controller_1.updateEvent);
/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Etkinlik siler
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Etkinlik ID
 *     responses:
 *       200:
 *         description: Etkinlik başarıyla silindi
 *       404:
 *         description: Etkinlik bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/:id', auth_middleware_1.isAuthenticated, events_controller_1.deleteEvent);
/**
 * @swagger
 * /events/{id}/join:
 *   post:
 *     summary: Etkinliğe katılma
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Etkinlik ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Etkinliğe başarıyla katılım sağlandı
 *       400:
 *         description: Geçersiz istek veya etkinlik dolu
 *       404:
 *         description: Etkinlik bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post('/:id/join', auth_middleware_1.isAuthenticated, events_controller_1.joinEvent);
/**
 * @swagger
 * /events/{id}/leave:
 *   post:
 *     summary: Etkinlikten ayrılma
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Etkinlik ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Etkinlikten başarıyla ayrıldınız
 *       400:
 *         description: Geçersiz istek veya organizatör ayrılamaz
 *       404:
 *         description: Etkinlik bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post('/:id/leave', auth_middleware_1.isAuthenticated, events_controller_1.leaveEvent);
/**
 * @swagger
 * /events/{id}/rate:
 *   post:
 *     summary: Etkinliğe değerlendirme ekleme
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Etkinlik ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - rating
 *               - review
 *             properties:
 *               user_id:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *     responses:
 *       201:
 *         description: Değerlendirmeniz başarıyla eklendi
 *       400:
 *         description: Geçersiz istek veya sadece katılımcılar değerlendirme yapabilir
 *       404:
 *         description: Etkinlik bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post('/:id/rate', auth_middleware_1.isAuthenticated, events_controller_1.rateEvent);
exports.default = router;
//# sourceMappingURL=events.routes.js.map