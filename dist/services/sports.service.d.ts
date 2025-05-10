import { PrismaService } from './prisma.service';
/**
 * Spor servisi için arayüz
 */
export interface CreateSportDTO {
    name: string;
    description: string;
    icon: string;
}
export interface UpdateSportDTO {
    name?: string;
    description?: string;
    icon?: string;
}
/**
 * Spor servisi
 */
export declare class SportsService extends PrismaService {
    /**
     * Tüm sporları getirir
     */
    findAll(): Promise<{
        name: string;
        id: bigint;
        description: string;
        icon: string;
    }[]>;
    /**
     * ID'ye göre spor getirir
     */
    findById(id: BigInt): Promise<{
        name: string;
        id: bigint;
        description: string;
        icon: string;
    } | null>;
    /**
     * İsme göre spor getirir
     */
    findByName(name: string): Promise<{
        name: string;
        id: bigint;
        description: string;
        icon: string;
    } | null>;
    /**
     * Yeni spor oluşturur
     */
    create(sportData: CreateSportDTO): Promise<{
        name: string;
        id: bigint;
        description: string;
        icon: string;
    }>;
    /**
     * Spor günceller
     */
    update(id: BigInt, sportData: UpdateSportDTO): Promise<{
        name: string;
        id: bigint;
        description: string;
        icon: string;
    }>;
    /**
     * Spor siler
     */
    delete(id: BigInt): Promise<{
        name: string;
        id: bigint;
        description: string;
        icon: string;
    }>;
    /**
     * Kullanıcının ilgilendiği sporları getirir
     */
    getUserSports(userId: BigInt): Promise<({
        sport: {
            name: string;
            id: bigint;
            description: string;
            icon: string;
        };
    } & {
        user_id: bigint;
        sport_id: bigint;
        skill_level: string;
    })[]>;
    /**
     * Kullanıcıya spor ekler
     */
    addUserSport(userId: BigInt, sportId: BigInt, skillLevel: string): Promise<{
        user_id: bigint;
        sport_id: bigint;
        skill_level: string;
    }>;
    /**
     * Kullanıcıdan spor çıkarır
     */
    removeUserSport(userId: BigInt, sportId: BigInt): Promise<{
        user_id: bigint;
        sport_id: bigint;
        skill_level: string;
    }>;
}
export declare const sportsService: SportsService;
