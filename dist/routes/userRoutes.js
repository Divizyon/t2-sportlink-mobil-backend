"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const userController_1 = require("../controllers/userController");
const multer_1 = __importDefault(require("multer"));
// Multer ayarları - geçici olarak bellek depolaması kullanıyoruz
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
    },
    fileFilter: (_req, file, cb) => {
        // Sadece resim dosyalarını kabul et
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Sadece resim dosyaları yüklenebilir!'));
        }
    }
});
const router = (0, express_1.Router)();
/**
 * Kullanıcı profil yönetimi
 */
// Kendi profilini görüntüle
router.get('/profile', authMiddleware_1.authenticate, authMiddleware_1.isUser, userController_1.userController.getProfile);
// Profili güncelle
router.put('/profile', authMiddleware_1.authenticate, authMiddleware_1.isUser, userController_1.userController.updateProfile);
// Profil fotoğrafı güncelle
// TypeScript hatası için middleware'i unknown olarak dönüştürüyoruz
router.put('/profile/avatar', authMiddleware_1.authenticate, authMiddleware_1.isUser, upload.single('avatar'), userController_1.userController.updateProfilePicture);
// Kullanıcı konum bilgisini güncelle
router.put('/profile/location', authMiddleware_1.authenticate, authMiddleware_1.isUser, userController_1.userController.updateLocation);
// İlgilenilen spor dallarını güncelle
router.put('/profile/sports', authMiddleware_1.authenticate, authMiddleware_1.isUser, userController_1.userController.updateSports);
// İlgilenilen spor dallarını seç (sadece var olan spor dallarından)
router.post('/profile/sport-interests', authMiddleware_1.authenticate, authMiddleware_1.isUser, userController_1.userController.selectSportInterests);
// İlgilenilen spor dallarına yeni bir tane ekle
router.post('/profile/sport-interest', authMiddleware_1.authenticate, authMiddleware_1.isUser, userController_1.userController.addSportInterest);
// Başka bir kullanıcının profilini görüntüle
router.get('/:userId', authMiddleware_1.authenticate, authMiddleware_1.isUser, userController_1.userController.getUserProfile);
/**
 * Kullanıcı yönetim endpointleri (Admin ve Superadmin erişimi)
 * Admin ve superadmin rolündeki kullanıcılar erişebilir
 */
// Tüm kullanıcıları listeleme (sadece admin ve superadmin)
router.get('/admin/users', authMiddleware_1.authenticate, authMiddleware_1.isAdmin, (req, res) => {
    // Admin tüm kullanıcıları listeliyor
    // Controller fonksiyonu burada çağrılacak
    return res.json({
        success: true,
        message: 'Tüm kullanıcıları listeleme endpointi (Admin erişimi)'
    });
});
// Belirli bir kullanıcıyı görüntüleme (sadece admin ve superadmin)
router.get('/admin/users/:userId', authMiddleware_1.authenticate, authMiddleware_1.isAdmin, (req, res) => {
    // Admin belirli bir kullanıcıyı görüntülüyor
    // Controller fonksiyonu burada çağrılacak
    return res.json({
        success: true,
        message: `${req.params.userId} ID'li kullanıcıyı görüntüleme endpointi (Admin erişimi)`
    });
});
// Bir kullanıcının rolünü değiştirme (sadece admin ve superadmin)
router.put('/admin/users/:userId/role', authMiddleware_1.authenticate, authMiddleware_1.isAdmin, (req, res) => {
    // Admin bir kullanıcının rolünü değiştiriyor
    // Controller fonksiyonu burada çağrılacak
    return res.json({
        success: true,
        message: `${req.params.userId} ID'li kullanıcının rolünü değiştirme endpointi (Admin erişimi)`
    });
});
/**
 * SuperAdmin özel işlemleri
 * Sadece superadmin rolündeki kullanıcılar erişebilir
 */
// Admin kullanıcıları yönetme (sadece superadmin)
router.get('/superadmin/admins', authMiddleware_1.authenticate, authMiddleware_1.isSuperAdmin, (req, res) => {
    // SuperAdmin tüm admin kullanıcılarını listeliyor
    // Controller fonksiyonu burada çağrılacak
    return res.json({
        success: true,
        message: 'Tüm admin kullanıcılarını listeleme endpointi (SuperAdmin erişimi)'
    });
});
// Sistem ayarlarını değiştirme (sadece superadmin)
router.put('/superadmin/settings', authMiddleware_1.authenticate, authMiddleware_1.isSuperAdmin, (req, res) => {
    // SuperAdmin sistem ayarlarını değiştiriyor
    // Controller fonksiyonu burada çağrılacak
    return res.json({
        success: true,
        message: 'Sistem ayarlarını değiştirme endpointi (SuperAdmin erişimi)'
    });
});
/**
 * Resource Owner örneği
 * Kullanıcılar sadece kendi kaynakları üzerinde işlem yapabilir
 * Admin ve superadmin tüm kaynaklara erişebilir
 */
router.get('/users/:userId/details', authMiddleware_1.authenticate, (0, authMiddleware_1.isResourceOwner)('userId'), (req, res) => {
    // Kullanıcı kendi detaylarına erişiyor veya admin/superadmin herhangi bir kullanıcının detaylarına erişiyor
    return res.json({
        success: true,
        message: `${req.params.userId} ID'li kullanıcı detayları (Kaynak sahibi veya admin erişimi)`
    });
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map