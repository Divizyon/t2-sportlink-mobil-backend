"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaService = exports.PrismaService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
/**
 * Temel Prisma servis sınıfı
 * Tüm model-spesifik servisler bu sınıfı kullanır
 */
class PrismaService {
    constructor() {
        this.prismaClient = prisma_1.default;
    }
}
exports.PrismaService = PrismaService;
/**
 * Singleton kalıbı ile bir Prisma Service örneği döndürür
 */
exports.getPrismaService = (() => {
    let instance;
    return () => {
        if (!instance) {
            instance = new PrismaService();
        }
        return instance;
    };
})();
//# sourceMappingURL=prisma.service.js.map