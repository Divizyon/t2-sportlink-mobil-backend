import express from 'express';
import { getAllSports, getSportById, createSport, updateSport, deleteSport } from '../controllers/sports.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /sports:
 *   get:
 *     summary: Tüm sporları getirir
 *     tags: [Sports]
 *     responses:
 *       200:
 *         description: Sporlar başarıyla getirildi
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', getAllSports);

/**
 * @swagger
 * /sports/{id}:
 *   get:
 *     summary: ID'ye göre spor getirir
 *     tags: [Sports]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Spor ID
 *     responses:
 *       200:
 *         description: Spor başarıyla getirildi
 *       404:
 *         description: Spor bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:id', getSportById);

/**
 * @swagger
 * /sports:
 *   post:
 *     summary: Yeni spor oluşturur (Kimliği doğrulanmış kullanıcı)
 *     tags: [Sports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - icon
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Spor başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek
 *       409:
 *         description: Bu isimde bir spor zaten mevcut
 *       500:
 *         description: Sunucu hatası
 */
router.post('/', isAuthenticated, createSport);

/**
 * @swagger
 * /sports/{id}:
 *   put:
 *     summary: Spor günceller (Kimliği doğrulanmış kullanıcı)
 *     tags: [Sports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Spor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       200:
 *         description: Spor başarıyla güncellendi
 *       404:
 *         description: Spor bulunamadı
 *       409:
 *         description: Bu isimde bir spor zaten mevcut
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:id', isAuthenticated, updateSport);

/**
 * @swagger
 * /sports/{id}:
 *   delete:
 *     summary: Spor siler (Kimliği doğrulanmış kullanıcı)
 *     tags: [Sports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Spor ID
 *     responses:
 *       200:
 *         description: Spor başarıyla silindi
 *       404:
 *         description: Spor bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/:id', isAuthenticated, deleteSport);

export default router; 