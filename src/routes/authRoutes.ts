import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Kullanıcı kaydı
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Kullanıcı girişi
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/verify-email
 * @desc    E-posta doğrulama
 * @access  Public
 */
router.get('/verify-email', authController.verifyEmail);

/**
 * @route   POST /api/auth/logout
 * @desc    Kullanıcı çıkışı
 * @access  Private
 */
router.post('/logout', authController.logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Şifre sıfırlama isteği
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Access token'ı yenilemek için refresh token kullanır
 * @access  Public
 */
router.post('/refresh-token', authController.refreshToken);

export default router; 