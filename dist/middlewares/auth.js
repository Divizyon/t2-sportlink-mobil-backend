"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
/**
 * JWT token doğrulaması yapan middleware
 * Authorization header'ından token alır ve doğrular
 */
const authenticate = async (req, res, next) => {
    try {
        // Authorization header'ını kontrol et
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Erişim reddedildi. Token bulunamadı.' });
        }
        // Token'ı ayıkla
        const token = authHeader.split(' ')[1];
        // Token'ı doğrula
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Erişim reddedildi. Geçersiz token.' });
        }
        // Kullanıcıyı kontrol et
        const user = await user_1.User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Erişim reddedildi. Kullanıcı bulunamadı.' });
        }
        // Kullanıcı bilgisini request nesnesine ekle
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role
        };
        next();
    }
    catch (error) {
        console.error('Kimlik doğrulama hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};
exports.authenticate = authenticate;
/**
 * Sadece admin kullanıcılarına izin veren middleware
 * authenticate middleware'inden sonra kullanılmalıdır
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Bu işlem için yetkiniz bulunmamaktadır.' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map