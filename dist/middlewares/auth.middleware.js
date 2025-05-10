"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_service_1 = require("../services/users.service");
// JWT token'ını doğrulayan middleware
const isAuthenticated = async (req, res, next) => {
    try {
        // Authorization header'ından token'ı al
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Erişim reddedildi. Yetkilendirme gerekli.'
            });
        }
        const token = authHeader.split(' ')[1];
        // JWT secret değerini kontrol et
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET çevre değişkeni tanımlanmamış!');
            return res.status(500).json({
                success: false,
                message: 'Sunucu yapılandırma hatası.'
            });
        }
        // Token'ı doğrula
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // Token süresi kontrolü
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
            return res.status(401).json({
                success: false,
                message: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.'
            });
        }
        // Kullanıcının veritabanında var olup olmadığını kontrol et
        const user = await users_service_1.usersService.findById(BigInt(decoded.id));
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token. Kullanıcı bulunamadı.'
            });
        }
        // Kullanıcıyı request nesnesine ekle
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Token doğrulama hatası:', error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token formatı veya imzası.'
            });
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Token süresi dolmuş.'
            });
        }
        else {
            return res.status(401).json({
                success: false,
                message: 'Doğrulama işlemi başarısız oldu.'
            });
        }
    }
};
exports.isAuthenticated = isAuthenticated;
// Backward compatibility için authenticate alias'ı
exports.authenticate = exports.isAuthenticated;
//# sourceMappingURL=auth.middleware.js.map