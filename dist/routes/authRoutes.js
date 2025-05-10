"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/auth/register
 * @desc    Kullanıcı kaydı
 * @access  Public
 */
router.post('/register', authController_1.authController.register);
/**
 * @route   POST /api/auth/login
 * @desc    Kullanıcı girişi
 * @access  Public
 */
router.post('/login', authController_1.authController.login);
/**
 * @route   GET /api/auth/verify-email
 * @desc    E-posta doğrulama
 * @access  Public
 */
router.get('/verify-email', authController_1.authController.verifyEmail);
/**
 * @route   POST /api/auth/logout
 * @desc    Kullanıcı çıkışı
 * @access  Private
 */
router.post('/logout', authController_1.authController.logout);
/**
 * @route   POST /api/auth/forgot-password
 * @desc    Şifre sıfırlama isteği
 * @access  Public
 */
router.post('/forgot-password', authController_1.authController.forgotPassword);
/**
 * @route   POST /api/auth/refresh-token
 * @desc    Access token'ı yenilemek için refresh token kullanır
 * @access  Public
 */
router.post('/refresh-token', authController_1.authController.refreshToken);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map