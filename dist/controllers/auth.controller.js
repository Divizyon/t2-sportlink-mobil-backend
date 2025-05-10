"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
// Kullanıcı kayıt kontrolcüsü
const register = async (req, res) => {
    try {
        const userData = req.body;
        // Gerekli alanları kontrol et
        if (!userData.username || !userData.email || !userData.password ||
            !userData.first_name || !userData.last_name || !userData.phone) {
            return res.status(400).json({
                success: false,
                message: 'Kullanıcı adı, e-posta, şifre, ad, soyad ve telefon alanları zorunludur.'
            });
        }
        // Şifre kontrolü
        if (userData.password !== userData.confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'Şifreler eşleşmiyor.'
            });
        }
        // Kullanıcıyı kaydet ve Supabase Auth üzerinden doğrulama e-postası gönder
        const result = await (0, auth_service_1.registerUser)(userData);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
        return res.status(201).json({
            success: true,
            message: result.message
        });
    }
    catch (error) {
        console.error('Kayıt hatası:', error);
        // Prisma hata kontrolü
        if (error.name === 'PrismaClientValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz veri formatı. Lütfen tüm zorunlu alanları doğru formatta doldurun.',
                error: {
                    name: error.name,
                    details: 'Veri formatı hatası'
                }
            });
        }
        // Supabase Auth hatası
        if (error.name === 'AuthApiError') {
            return res.status(400).json({
                success: false,
                message: 'Kullanıcı oluşturma hatası: ' + error.message,
                error: {
                    name: error.name,
                    message: error.message
                }
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası.',
            error: {
                name: error.name,
                message: error.message
            }
        });
    }
};
exports.register = register;
// Kullanıcı giriş kontrolcüsü
const login = async (req, res) => {
    try {
        const loginData = req.body;
        // Supabase Auth üzerinden kullanıcı girişi
        const result = await (0, auth_service_1.loginUser)(loginData);
        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
        // Kullanıcı bilgilerini ve token'ı döndür
        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });
    }
    catch (error) {
        console.error('Giriş hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası.'
        });
    }
};
exports.login = login;
//# sourceMappingURL=auth.controller.js.map