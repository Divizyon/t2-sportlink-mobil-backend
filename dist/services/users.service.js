"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = exports.UsersService = void 0;
const prisma_service_1 = require("./prisma.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UsersService extends prisma_service_1.PrismaService {
    /**
     * Kullanıcı adıyla kullanıcıyı bulur
     */
    async findByUsername(username) {
        return this.prismaClient.users.findFirst({
            where: { username }
        });
    }
    /**
     * E-posta ile kullanıcıyı bulur
     */
    async findByEmail(email) {
        return this.prismaClient.users.findFirst({
            where: { email }
        });
    }
    /**
     * ID ile kullanıcıyı bulur
     */
    async findById(id) {
        try {
            return this.prismaClient.users.findUnique({
                where: { id }
            });
        }
        catch (error) {
            console.error('Kullanıcı bulma hatası (ID):', error);
            throw error;
        }
    }
    /**
     * Kullanıcı oluşturur
     */
    async create(userData) {
        try {
            // Şifreyi hashle
            const hashedPassword = await this.hashPassword(userData.password);
            const now = new Date();
            // Kullanıcı verilerini hazırla ve eksik alanlar için varsayılan değerler ata
            const userDataToCreate = {
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                phone: userData.phone || '',
                profile_picture: userData.profile_picture || '',
                default_location_latitude: Number(userData.default_location_latitude || 0),
                default_location_longitude: Number(userData.default_location_longitude || 0),
                role: userData.role || 'user',
                created_at: now,
                updated_at: now
            };
            // Verileri doğrula
            if (!userDataToCreate.username || !userDataToCreate.email || !userDataToCreate.password) {
                throw new Error('Zorunlu alanlar eksik: username, email veya password');
            }
            return this.prismaClient.users.create({
                data: userDataToCreate
            });
        }
        catch (error) {
            console.error('Kullanıcı oluşturma hatası:', error);
            throw error;
        }
    }
    /**
     * Kullanıcı bilgilerini günceller
     */
    async update(id, userData) {
        try {
            return this.prismaClient.users.update({
                where: { id },
                data: userData
            });
        }
        catch (error) {
            console.error('Kullanıcı güncelleme hatası:', error);
            throw error;
        }
    }
    /**
     * Kullanıcı şifresini günceller
     */
    async updatePassword(id, newPassword) {
        try {
            // Şifreyi hashle
            const hashedPassword = await this.hashPassword(newPassword);
            return this.prismaClient.users.update({
                where: { id },
                data: { password: hashedPassword }
            });
        }
        catch (error) {
            console.error('Şifre güncelleme hatası:', error);
            throw error;
        }
    }
    /**
     * Şifre hashleme yardımcı metodu
     */
    async hashPassword(password) {
        const salt = await bcrypt_1.default.genSalt(10);
        return await bcrypt_1.default.hash(password, salt);
    }
    /**
     * Şifre doğrulama
     */
    async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt_1.default.compare(plainPassword, hashedPassword);
    }
    /**
     * JWT token oluşturma
     */
    generateToken(user) {
        const jwtSecret = process.env.JWT_SECRET || 'default_secret';
        const payload = {
            id: user.id.toString(),
            email: user.email,
            username: user.username,
            role: user.role
        };
        // @ts-ignore - TypeScript ve jsonwebtoken arasındaki tip uyumsuzluğunu gidermek için
        return jsonwebtoken_1.default.sign(payload, jwtSecret, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        });
    }
}
exports.UsersService = UsersService;
// Singleton instance
exports.usersService = new UsersService();
//# sourceMappingURL=users.service.js.map