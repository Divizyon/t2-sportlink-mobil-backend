"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyDeviceTokens = exports.getUserDeviceTokens = exports.unregisterDeviceToken = exports.registerDeviceToken = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
// Cihaz token validasyonu için şema
const deviceTokenSchema = zod_1.z.object({
    token: zod_1.z.string().min(10),
    platform: zod_1.z.enum(['ios', 'android', 'expo']),
});
/**
 * Cihaz token kaydı
 */
const registerDeviceToken = async (req, res) => {
    try {
        const userId = req.user.id; // JWT middleware'den gelen kullanıcı ID'si
        const input = deviceTokenSchema.parse(req.body);
        // Varsa güncelle, yoksa ekle
        await prisma.deviceToken.upsert({
            where: { token: input.token },
            update: { user_id: userId, platform: input.platform },
            create: { token: input.token, platform: input.platform, user_id: userId },
        });
        logger_1.logger.info(`Device token registered for user ${userId}`);
        return res.status(200).json({
            success: true,
            message: 'Device token registered successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error registering device token:', error);
        return res.status(400).json({
            success: false,
            message: 'Invalid input data',
            error: error instanceof Error ? error.message : String(error),
            code: 'DEVICE_TOKEN_VALIDATION_ERROR'
        });
    }
};
exports.registerDeviceToken = registerDeviceToken;
/**
 * Cihaz token silme
 */
const unregisterDeviceToken = async (req, res) => {
    try {
        const { token } = zod_1.z.object({ token: zod_1.z.string() }).parse(req.body);
        const deleteResult = await prisma.deviceToken.deleteMany({
            where: { token },
        });
        logger_1.logger.info(`Device token unregistered: ${token}, deleted count: ${deleteResult.count}`);
        return res.status(200).json({
            success: true,
            message: 'Device token unregistered successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error unregistering device token:', error);
        return res.status(400).json({
            success: false,
            message: 'Invalid input data',
            error: error instanceof Error ? error.message : String(error),
            code: 'DEVICE_TOKEN_VALIDATION_ERROR'
        });
    }
};
exports.unregisterDeviceToken = unregisterDeviceToken;
/**
 * Kullanıcının cihaz tokenlarını getir (admin endpoint)
 */
const getUserDeviceTokens = async (req, res) => {
    try {
        // Admin kontrolü yapılmalı
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access',
                code: 'UNAUTHORIZED_ACCESS'
            });
        }
        const { userId } = req.params;
        const tokens = await prisma.deviceToken.findMany({
            where: { user_id: userId },
        });
        return res.status(200).json({
            success: true,
            tokens
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching user device tokens:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching device tokens',
            code: 'DEVICE_TOKEN_FETCH_ERROR'
        });
    }
};
exports.getUserDeviceTokens = getUserDeviceTokens;
/**
 * Kullanıcının kendi cihaz tokenlarını getir
 * Bu endpoint kullanıcının kaç farklı cihazda oturum açtığını ve ne zaman hesap açtığını gösterir
 */
const getMyDeviceTokens = async (req, res) => {
    try {
        const userId = req.user.id;
        const tokens = await prisma.deviceToken.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });
        // Kullanıcı hesap bilgilerini getir
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                created_at: true,
                updated_at: true,
                username: true,
                first_name: true,
                last_name: true
            }
        });
        return res.status(200).json({
            success: true,
            data: {
                user: user,
                deviceCount: tokens.length,
                devices: tokens.map(token => ({
                    id: token.id,
                    platform: token.platform,
                    created_at: token.created_at,
                    updated_at: token.updated_at
                }))
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching my device tokens:', error);
        return res.status(500).json({
            success: false,
            message: 'Cihaz tokenları alınırken bir hata oluştu',
            code: 'DEVICE_TOKEN_FETCH_ERROR'
        });
    }
};
exports.getMyDeviceTokens = getMyDeviceTokens;
//# sourceMappingURL=deviceController.js.map