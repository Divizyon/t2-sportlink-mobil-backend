"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sportController = void 0;
const sportService_1 = require("../services/sportService");
const zod_1 = require("zod");
// ID parametresi doğrulama şeması
const idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Geçerli bir UUID formatı olmalıdır'),
});
exports.sportController = {
    /**
     * Tüm spor dallarını listele
     */
    async getAllSports(_req, res, next) {
        try {
            const result = await sportService_1.sportService.getAllSports();
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
     * Spor dalı detayını getir
     */
    async getSportById(req, res, next) {
        try {
            const { id } = req.params;
            // ID parametresini doğrula
            const validationResult = idParamSchema.safeParse({ id });
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz ID formatı',
                    errors: validationResult.error.errors,
                });
            }
            const result = await sportService_1.sportService.getSportById(id);
            if (!result.success) {
                return res.status(404).json(result);
            }
            return res.json(result);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=sportController.js.map