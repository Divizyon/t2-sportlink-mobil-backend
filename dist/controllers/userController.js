"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const userService_1 = require("../services/userService");
const zod_1 = require("zod");
// Profil güncelleme için validasyon şeması
const profileUpdateSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(2, 'Ad en az 2 karakter olmalıdır').optional(),
    last_name: zod_1.z.string().min(2, 'Soyad en az 2 karakter olmalıdır').optional(),
    phone: zod_1.z.string().nullable().optional(),
    default_location_latitude: zod_1.z.number().optional(),
    default_location_longitude: zod_1.z.number().optional(),
    // İlgilenilen yeni spor dalını eklemek için
    sportInterest: zod_1.z.object({
        sportId: zod_1.z.string().uuid('Geçerli bir spor ID\'si giriniz'),
        skillLevel: zod_1.z.string().min(1, 'Yetenek seviyesi boş olamaz')
    }).optional(),
});
// Konum güncelleme için validasyon şeması
const locationUpdateSchema = zod_1.z.object({
    latitude: zod_1.z.number({
        required_error: "Enlem (latitude) zorunludur",
        invalid_type_error: "Enlem sayısal bir değer olmalıdır"
    }),
    longitude: zod_1.z.number({
        required_error: "Boylam (longitude) zorunludur",
        invalid_type_error: "Boylam sayısal bir değer olmalıdır"
    }),
    locationName: zod_1.z.string().optional(),
});
// Spor dalları güncelleme için validasyon şeması
const sportsUpdateSchema = zod_1.z.array(zod_1.z.object({
    sportId: zod_1.z.string().uuid('Geçerli bir spor ID\'si giriniz'),
    skillLevel: zod_1.z.string().min(1, 'Yetenek seviyesi boş olamaz'),
}));
// Tekil spor dalı ekleme/güncelleme için validasyon şeması
const sportInterestSchema = zod_1.z.object({
    sportId: zod_1.z.string().uuid('Geçerli bir spor ID\'si giriniz'),
    skillLevel: zod_1.z.string().min(1, 'Yetenek seviyesi boş olamaz'),
});
exports.userController = {
    /**
     * Kullanıcı profil bilgilerini getir
     */
    async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await userService_1.userService.getProfile(userId);
            if (!result.success) {
                res.status(404).json(result);
                return;
            }
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Profili güncelle
     */
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            // Veri doğrulama
            const validationResult = profileUpdateSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Doğrulama hatası',
                    errors: validationResult.error.errors,
                    code: 'VALIDATION_ERROR'
                });
                return;
            }
            const result = await userService_1.userService.updateProfile(userId, validationResult.data);
            if (!result.success) {
                const status = result.code === 'USER_NOT_FOUND' ? 404 : 400;
                res.status(status).json(result);
                return;
            }
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Konum bilgisini güncelle
     */
    async updateLocation(req, res, next) {
        try {
            const userId = req.user.id;
            // Veri doğrulama
            const validationResult = locationUpdateSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Doğrulama hatası',
                    errors: validationResult.error.errors,
                    code: 'VALIDATION_ERROR'
                });
                return;
            }
            // userService.updateProfile fonksiyonunu kullanarak konum bilgisini güncelle
            const result = await userService_1.userService.updateProfile(userId, {
                default_location_latitude: validationResult.data.latitude,
                default_location_longitude: validationResult.data.longitude,
            });
            if (!result.success) {
                const status = result.code === 'USER_NOT_FOUND' ? 404 : 400;
                res.status(status).json(result);
                return;
            }
            // Başarılı sonucu özelleştirilmiş bir formatta döndür
            res.json({
                success: true,
                message: 'Konum bilgisi başarıyla güncellendi',
                data: {
                    defaultLocation: {
                        latitude: validationResult.data.latitude,
                        longitude: validationResult.data.longitude,
                        locationName: validationResult.data.locationName || 'Kullanıcı Konumu'
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Profil fotoğrafını güncelle
     */
    async updateProfilePicture(req, res, next) {
        try {
            const userId = req.user.id;
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: 'Profil fotoğrafı yüklenmedi',
                    code: 'NO_FILE_UPLOADED'
                });
                return;
            }
            const result = await userService_1.userService.updateProfilePicture(userId, req.file);
            if (!result.success) {
                res.status(400).json(result);
                return;
            }
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Spor dallarını güncelle
     */
    async updateSports(req, res, next) {
        try {
            const userId = req.user.id;
            // Veri doğrulama
            const validationResult = sportsUpdateSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Doğrulama hatası',
                    errors: validationResult.error.errors,
                    code: 'VALIDATION_ERROR'
                });
                return;
            }
            const result = await userService_1.userService.updateSports(userId, validationResult.data);
            if (!result.success) {
                res.status(400).json(result);
                return;
            }
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Başka bir kullanıcının profilini görüntüle
     */
    async getUserProfile(req, res, next) {
        try {
            const { userId } = req.params;
            const result = await userService_1.userService.getUserProfile(userId);
            if (!result.success) {
                res.status(404).json(result);
                return;
            }
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Kullanıcının ilgilendiği spor dallarını seçer
     * Bu endpoint ile kullanıcılar sadece sistemde kayıtlı spor dallarını seçebilir
     */
    async selectSportInterests(req, res, next) {
        try {
            const userId = req.user.id;
            // Veri doğrulama
            const validationResult = sportsUpdateSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Doğrulama hatası',
                    errors: validationResult.error.errors,
                    code: 'VALIDATION_ERROR'
                });
                return;
            }
            const result = await userService_1.userService.selectSportInterests(userId, validationResult.data);
            if (!result.success) {
                res.status(400).json(result);
                return;
            }
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * Kullanıcının ilgi alanına yeni bir spor dalı ekler
     * Diğer ilgi alanları korunur
     */
    async addSportInterest(req, res, next) {
        try {
            const userId = req.user.id;
            // Veri doğrulama
            const validationResult = sportInterestSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    success: false,
                    message: 'Doğrulama hatası',
                    errors: validationResult.error.errors,
                    code: 'VALIDATION_ERROR'
                });
                return;
            }
            const result = await userService_1.userService.addSportInterest(userId, validationResult.data);
            if (!result.success) {
                res.status(400).json(result);
                return;
            }
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=userController.js.map