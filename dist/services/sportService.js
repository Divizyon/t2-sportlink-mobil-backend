"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sportService = void 0;
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.sportService = {
    /**
     * Tüm spor dallarını listele
     */
    async getAllSports() {
        try {
            const sports = await prisma.sport.findMany({
                orderBy: {
                    name: 'asc',
                },
            });
            return {
                success: true,
                data: sports,
            };
        }
        catch (error) {
            console.error('Spor dalları listelenirken hata oluştu:', error);
            // Prisma hata kontrolü
            if (error instanceof client_2.Prisma.PrismaClientKnownRequestError ||
                error instanceof client_2.Prisma.PrismaClientValidationError) {
                return {
                    success: false,
                    message: 'Veritabanı hatası',
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                };
            }
            return {
                success: false,
                message: 'Spor dalları listelenirken bir hata oluştu',
            };
        }
    },
    /**
     * Spor dalı detayını getir
     */
    async getSportById(id) {
        try {
            const sport = await prisma.sport.findUnique({
                where: { id },
                include: {
                    events: {
                        take: 5,
                        orderBy: {
                            created_at: 'desc',
                        },
                    },
                },
            });
            if (!sport) {
                return {
                    success: false,
                    message: 'Spor dalı bulunamadı',
                };
            }
            return {
                success: true,
                data: sport,
            };
        }
        catch (error) {
            console.error('Spor dalı detayı getirilirken hata oluştu:', error);
            // Prisma hata kontrolü
            if (error instanceof client_2.Prisma.PrismaClientKnownRequestError ||
                error instanceof client_2.Prisma.PrismaClientValidationError) {
                return {
                    success: false,
                    message: 'Veritabanı hatası',
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                };
            }
            return {
                success: false,
                message: 'Spor dalı detayı getirilirken bir hata oluştu',
            };
        }
    },
};
//# sourceMappingURL=sportService.js.map