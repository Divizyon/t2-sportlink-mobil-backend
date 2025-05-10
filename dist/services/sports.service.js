"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sportsService = exports.SportsService = void 0;
const prisma_service_1 = require("./prisma.service");
/**
 * Spor servisi
 */
class SportsService extends prisma_service_1.PrismaService {
    /**
     * Tüm sporları getirir
     */
    async findAll() {
        return this.prismaClient.sports.findMany();
    }
    /**
     * ID'ye göre spor getirir
     */
    async findById(id) {
        return this.prismaClient.sports.findUnique({
            where: { id: Number(id) }
        });
    }
    /**
     * İsme göre spor getirir
     */
    async findByName(name) {
        return this.prismaClient.sports.findFirst({
            where: { name }
        });
    }
    /**
     * Yeni spor oluşturur
     */
    async create(sportData) {
        return this.prismaClient.sports.create({
            data: sportData
        });
    }
    /**
     * Spor günceller
     */
    async update(id, sportData) {
        return this.prismaClient.sports.update({
            where: { id: Number(id) },
            data: sportData
        });
    }
    /**
     * Spor siler
     */
    async delete(id) {
        return this.prismaClient.sports.delete({
            where: { id: Number(id) }
        });
    }
    /**
     * Kullanıcının ilgilendiği sporları getirir
     */
    async getUserSports(userId) {
        return this.prismaClient.user_Sports.findMany({
            where: { user_id: Number(userId) },
            include: { sport: true }
        });
    }
    /**
     * Kullanıcıya spor ekler
     */
    async addUserSport(userId, sportId, skillLevel) {
        return this.prismaClient.user_Sports.create({
            data: {
                user_id: Number(userId),
                sport_id: Number(sportId),
                skill_level: skillLevel
            }
        });
    }
    /**
     * Kullanıcıdan spor çıkarır
     */
    async removeUserSport(userId, sportId) {
        return this.prismaClient.user_Sports.delete({
            where: {
                user_id_sport_id: {
                    user_id: Number(userId),
                    sport_id: Number(sportId)
                }
            }
        });
    }
}
exports.SportsService = SportsService;
// Singleton instance
exports.sportsService = new SportsService();
//# sourceMappingURL=sports.service.js.map