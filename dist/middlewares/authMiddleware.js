"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromToken = exports.isResourceOwner = exports.isSuperAdmin = exports.isAdmin = exports.isUser = exports.authorize = exports.authenticate = void 0;
const supabase_1 = require("../config/supabase");
const prisma_1 = __importDefault(require("../config/prisma"));
/**
 * JWT token'ı doğrulayan ve kullanıcı bilgilerini ekleyen middleware
 */
const authenticate = async (req, res, next) => {
    try {
        // Authorization header'dan token'ı al
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Erişim yetkisi reddedildi. Giriş yapmanız gerekiyor.',
                code: 'UNAUTHORIZED'
            });
        }
        // Token'ı çıkar
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token formatı.',
                code: 'INVALID_TOKEN_FORMAT'
            });
        }
        // Token'ı doğrula
        const { data: { user: supabaseUser }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !supabaseUser) {
            return res.status(401).json({
                success: false,
                message: 'Oturum süresi dolmuş veya geçersiz. Lütfen tekrar giriş yapın.',
                code: 'INVALID_TOKEN'
            });
        }
        // Kullanıcıyı veritabanından al
        const user = await prisma_1.default.user.findUnique({
            where: { email: supabaseUser.email }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı.',
                code: 'USER_NOT_FOUND'
            });
        }
        // Kullanıcı bilgilerini request'e ekle
        req.user = user;
        req.token = token;
        return next();
    }
    catch (error) {
        console.error('Auth Middleware Hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Kimlik doğrulama sırasında bir hata oluştu.',
            code: 'AUTH_ERROR'
        });
    }
};
exports.authenticate = authenticate;
/**
 * Kullanıcının belirli bir role sahip olup olmadığını kontrol eden middleware fabrikası
 * @param {string[]} roles - İzin verilen roller
 * @returns Middleware fonksiyonu
 */
const authorize = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Erişim yetkisi reddedildi. Giriş yapmanız gerekiyor.',
                    code: 'UNAUTHORIZED'
                });
            }
            // Kullanıcının rolünü kontrol et
            const hasPermission = roles.includes(req.user.role);
            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'Bu işlemi gerçekleştirmek için gerekli yetkiye sahip değilsiniz.',
                    code: 'FORBIDDEN'
                });
            }
            return next();
        }
        catch (error) {
            console.error('Yetkilendirme Hatası:', error);
            return res.status(500).json({
                success: false,
                message: 'Yetkilendirme sırasında bir hata oluştu.',
                code: 'AUTHORIZATION_ERROR'
            });
        }
    };
};
exports.authorize = authorize;
// Hazır rol kontrol middleware'leri
exports.isUser = (0, exports.authorize)(['user', 'admin', 'superadmin']);
exports.isAdmin = (0, exports.authorize)(['admin', 'superadmin']);
exports.isSuperAdmin = (0, exports.authorize)(['superadmin']);
/**
 * Kullanıcının kendine ait kaynağa eriştiğini kontrol eden middleware
 * @param {string} paramName - URL parametresindeki ID'nin adı (ör: "userId")
 * @returns Middleware fonksiyonu
 */
const isResourceOwner = (paramName = 'userId') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Erişim yetkisi reddedildi. Giriş yapmanız gerekiyor.',
                    code: 'UNAUTHORIZED'
                });
            }
            const resourceId = req.params[paramName];
            // Eğer kullanıcı admin veya superadmin ise, her kaynağa erişebilir
            if (['admin', 'superadmin'].includes(req.user.role)) {
                return next();
            }
            // Kaynak ID'si, kullanıcı ID'si ile eşleşiyor mu?
            if (resourceId !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Bu kaynağa erişmek için gerekli yetkiye sahip değilsiniz.',
                    code: 'FORBIDDEN'
                });
            }
            return next();
        }
        catch (error) {
            console.error('Kaynak Erişim Hatası:', error);
            return res.status(500).json({
                success: false,
                message: 'Kaynak erişimi sırasında bir hata oluştu.',
                code: 'RESOURCE_ACCESS_ERROR'
            });
        }
    };
};
exports.isResourceOwner = isResourceOwner;
/**
 * Aktif bir kullanıcıyı kontrol eden yardımcı fonksiyon
 */
const getUserFromToken = async (token) => {
    try {
        const { data: { user: supabaseUser }, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !supabaseUser) {
            return null;
        }
        const user = await prisma_1.default.user.findUnique({
            where: { email: supabaseUser.email }
        });
        return user;
    }
    catch (error) {
        console.error('Token doğrulama hatası:', error);
        return null;
    }
};
exports.getUserFromToken = getUserFromToken;
//# sourceMappingURL=authMiddleware.js.map