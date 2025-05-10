"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
const zod_1 = require("zod");
// Kayıt için doğrulama şeması
const registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalıdır'),
    email: zod_1.z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: zod_1.z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
    first_name: zod_1.z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    last_name: zod_1.z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
    phone: zod_1.z.string().optional(),
});
// Giriş için doğrulama şeması
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: zod_1.z.string().min(1, 'Şifre girmelisiniz'),
});
// Refresh token için doğrulama şeması
const refreshTokenSchema = zod_1.z.object({
    refresh_token: zod_1.z.string().min(1, 'Refresh token gereklidir'),
});
exports.authController = {
    /**
     * Kullanıcı kaydı
     */
    async register(req, res, next) {
        try {
            // Gelen verileri doğrula
            const validationResult = registerSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Doğrulama hatası',
                    errors: validationResult.error.errors,
                });
            }
            // Doğrulanmış verileri al
            const userData = validationResult.data;
            // Kayıt servisini çağır
            const result = await authService_1.authService.register(userData);
            if (!result.success) {
                return res.status(400).json(result);
            }
            return res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Kullanıcı girişi
     */
    async login(req, res, next) {
        try {
            // Gelen verileri doğrula
            const validationResult = loginSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Doğrulama hatası',
                    errors: validationResult.error.errors,
                });
            }
            // Doğrulanmış verileri al
            const loginData = validationResult.data;
            // Giriş servisini çağır
            const result = await authService_1.authService.login(loginData);
            if (!result.success) {
                return res.status(401).json(result);
            }
            // Oturum bilgilerini kaydet (refresh token, access token)
            // Gerçek projede bu kısım genellikle cookie ile yapılır
            return res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * E-posta doğrulama geri çağırma (callback)
     */
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.query;
            if (!token || typeof token !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz veya eksik token',
                });
            }
            const result = await authService_1.authService.handleEmailVerification(token);
            if (!result.success) {
                return res.status(400).json(result);
            }
            return res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Çıkış işlemi
     */
    async logout(_req, res, next) {
        try {
            const result = await authService_1.authService.logout();
            if (!result.success) {
                return res.status(400).json(result);
            }
            return res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Şifre sıfırlama isteği
     */
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            if (!email || typeof email !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Geçerli bir e-posta adresi giriniz',
                });
            }
            const result = await authService_1.authService.forgotPassword(email);
            return res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Access token'ı yenilemek için refresh token kullanır
     */
    async refreshToken(req, res, next) {
        try {
            // Gelen verileri doğrula
            const validationResult = refreshTokenSchema.safeParse(req.body);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Doğrulama hatası',
                    errors: validationResult.error.errors,
                });
            }
            // Doğrulanmış verileri al
            const refreshData = validationResult.data;
            // Token yenileme servisini çağır
            const result = await authService_1.authService.refreshToken(refreshData);
            if (!result.success) {
                return res.status(401).json(result);
            }
            return res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=authController.js.map