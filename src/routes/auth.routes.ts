import express from 'express';
import { register, login } from '../controllers/auth.controller';

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - confirm_password
 *               - first_name
 *               - last_name
 *               - phone
 *             properties:
 *               username:
 *                 type: string
 *                 description: Kullanıcı adı
 *               email:
 *                 type: string
 *                 format: email
 *                 description: E-posta adresi
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Şifre
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 description: Şifre tekrarı
 *               first_name:
 *                 type: string
 *                 description: Ad
 *               last_name:
 *                 type: string
 *                 description: Soyad
 *               phone:
 *                 type: string
 *                 description: Telefon numarası
 *               profile_picture:
 *                 type: string
 *                 description: Profil resmi URL'si
 *               default_location_latitude:
 *                 type: number
 *                 format: float
 *                 description: Varsayılan konum enlem
 *               default_location_longitude:
 *                 type: number
 *                 format: float
 *                 description: Varsayılan konum boylam
 *     responses:
 *       201:
 *         description: Kullanıcı kaydedildi
 *       400:
 *         description: Geçersiz istek
 *       500:
 *         description: Sunucu hatası
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/login', login);

export default router; 