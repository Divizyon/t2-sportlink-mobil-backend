import { PrismaService } from './prisma.service';
import { User, RegisterUserDTO, UpdateUserDTO } from '../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UsersService extends PrismaService {
  /**
   * Kullanıcı adıyla kullanıcıyı bulur
   */
  async findByUsername(username: string) {
    return this.prismaClient.users.findFirst({
      where: { username }
    });
  }

  /**
   * E-posta ile kullanıcıyı bulur
   */
  async findByEmail(email: string) {
    return this.prismaClient.users.findFirst({
      where: { email }
    });
  }

  /**
   * ID ile kullanıcıyı bulur
   */
  async findById(id: BigInt) {
    return this.prismaClient.users.findUnique({
      where: { id: Number(id) }
    });
  }

  /**
   * Kullanıcı oluşturur
   */
  async create(userData: RegisterUserDTO) {
    // Şifreyi hashle
    const hashedPassword = await this.hashPassword(userData.password);
    
    // Şu andaki zamanı alarak updated_at değerini belirle
    const now = new Date();
    
    return this.prismaClient.users.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        profile_picture: userData.profile_picture || '',
        default_location_latitude: userData.default_location_latitude,
        default_location_longitude: userData.default_location_longitude,
        role: userData.role || 'user',
        updated_at: now
      }
    });
  }

  /**
   * Kullanıcı bilgilerini günceller
   */
  async update(id: BigInt, userData: UpdateUserDTO) {
    return this.prismaClient.users.update({
      where: { id: Number(id) },
      data: {
        ...userData,
        updated_at: new Date()
      }
    });
  }

  /**
   * Kullanıcı şifresini günceller
   */
  async updatePassword(id: BigInt, newPassword: string) {
    // Şifreyi hashle
    const hashedPassword = await this.hashPassword(newPassword);
    
    return this.prismaClient.users.update({
      where: { id: Number(id) },
      data: { 
        password: hashedPassword,
        updated_at: new Date()
      }
    });
  }

  /**
   * Şifre hashleme yardımcı metodu
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Şifre doğrulama
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * JWT token oluşturma
   */
  generateToken(user: User): string {
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const payload = { 
      id: user.id.toString(), 
      email: user.email, 
      username: user.username,
      role: user.role 
    };
    
    // @ts-ignore - TypeScript ve jsonwebtoken arasındaki tip uyumsuzluğunu gidermek için
    return jwt.sign(payload, jwtSecret, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '1d' 
    });
  }
}

// Singleton instance
export const usersService = new UsersService(); 