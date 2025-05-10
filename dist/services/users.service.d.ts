import { PrismaService } from './prisma.service';
import { User, RegisterUserDTO, UpdateUserDTO } from '../models/user';
export declare class UsersService extends PrismaService {
    /**
     * Kullanıcı adıyla kullanıcıyı bulur
     */
    findByUsername(username: string): Promise<{
        id: bigint;
        username: string;
        password: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: string;
        profile_picture: string;
        default_location_latitude: number;
        default_location_longitude: number;
        role: string;
        created_at: Date;
        updated_at: Date;
    } | null>;
    /**
     * E-posta ile kullanıcıyı bulur
     */
    findByEmail(email: string): Promise<{
        id: bigint;
        username: string;
        password: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: string;
        profile_picture: string;
        default_location_latitude: number;
        default_location_longitude: number;
        role: string;
        created_at: Date;
        updated_at: Date;
    } | null>;
    /**
     * ID ile kullanıcıyı bulur
     */
    findById(id: bigint): Promise<{
        id: bigint;
        username: string;
        password: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: string;
        profile_picture: string;
        default_location_latitude: number;
        default_location_longitude: number;
        role: string;
        created_at: Date;
        updated_at: Date;
    } | null>;
    /**
     * Kullanıcı oluşturur
     */
    create(userData: RegisterUserDTO): Promise<{
        id: bigint;
        username: string;
        password: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: string;
        profile_picture: string;
        default_location_latitude: number;
        default_location_longitude: number;
        role: string;
        created_at: Date;
        updated_at: Date;
    }>;
    /**
     * Kullanıcı bilgilerini günceller
     */
    update(id: bigint, userData: UpdateUserDTO): Promise<{
        id: bigint;
        username: string;
        password: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: string;
        profile_picture: string;
        default_location_latitude: number;
        default_location_longitude: number;
        role: string;
        created_at: Date;
        updated_at: Date;
    }>;
    /**
     * Kullanıcı şifresini günceller
     */
    updatePassword(id: bigint, newPassword: string): Promise<{
        id: bigint;
        username: string;
        password: string;
        email: string;
        first_name: string;
        last_name: string;
        phone: string;
        profile_picture: string;
        default_location_latitude: number;
        default_location_longitude: number;
        role: string;
        created_at: Date;
        updated_at: Date;
    }>;
    /**
     * Şifre hashleme yardımcı metodu
     */
    private hashPassword;
    /**
     * Şifre doğrulama
     */
    verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    /**
     * JWT token oluşturma
     */
    generateToken(user: User): string;
}
export declare const usersService: UsersService;
