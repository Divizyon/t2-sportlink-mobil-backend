import { PrismaService } from './prisma.service';
/**
 * Etkinlik servisi için arayüzler
 */
export interface CreateEventDTO {
    creator_id: BigInt;
    sport_id: BigInt;
    title: string;
    description: string;
    event_date: Date;
    start_time: Date;
    end_time: Date;
    location_name: string;
    location_latitude: number;
    location_longitude: number;
    max_participants: number;
    status: string;
}
export interface UpdateEventDTO {
    title?: string;
    description?: string;
    event_date?: Date;
    start_time?: Date;
    end_time?: Date;
    location_name?: string;
    location_latitude?: number;
    location_longitude?: number;
    max_participants?: number;
    status?: string;
}
export interface EventQueryParams {
    sport_id?: BigInt;
    creator_id?: BigInt;
    location_name?: string;
    status?: string;
    min_date?: Date;
    max_date?: Date;
    latitude?: number;
    longitude?: number;
    distance?: number;
}
/**
 * Etkinlik servisi
 */
export declare class EventsService extends PrismaService {
    /**
     * Tüm etkinlikleri getirir
     */
    findAll(params?: EventQueryParams): Promise<({
        sport: {
            name: string;
            id: bigint;
            description: string;
            icon: string;
        };
        creator: {
            id: bigint;
            username: string;
            first_name: string;
            last_name: string;
            profile_picture: string;
        };
        participants: ({
            user: {
                id: bigint;
                username: string;
                profile_picture: string;
            };
        } & {
            role: string;
            user_id: bigint;
            event_id: bigint;
            joined_at: Date;
        })[];
    } & {
        id: bigint;
        created_at: Date;
        updated_at: Date;
        description: string;
        sport_id: bigint;
        creator_id: bigint;
        location_name: string;
        status: string;
        title: string;
        event_date: Date;
        start_time: Date;
        end_time: Date;
        location_latitude: number;
        location_longitude: number;
        max_participants: number;
    })[]>;
    /**
     * ID'ye göre etkinlik getirir
     */
    findById(id: BigInt): Promise<({
        sport: {
            name: string;
            id: bigint;
            description: string;
            icon: string;
        };
        creator: {
            id: bigint;
            username: string;
            first_name: string;
            last_name: string;
            profile_picture: string;
        };
        participants: ({
            user: {
                id: bigint;
                username: string;
                profile_picture: string;
            };
        } & {
            role: string;
            user_id: bigint;
            event_id: bigint;
            joined_at: Date;
        })[];
        ratings: ({
            user: {
                id: bigint;
                username: string;
                profile_picture: string;
            };
        } & {
            id: bigint;
            created_at: Date;
            user_id: bigint;
            event_id: bigint;
            rating: number;
            review: string;
        })[];
    } & {
        id: bigint;
        created_at: Date;
        updated_at: Date;
        description: string;
        sport_id: bigint;
        creator_id: bigint;
        location_name: string;
        status: string;
        title: string;
        event_date: Date;
        start_time: Date;
        end_time: Date;
        location_latitude: number;
        location_longitude: number;
        max_participants: number;
    }) | null>;
    /**
     * Yeni etkinlik oluşturur
     */
    create(eventData: CreateEventDTO): Promise<{
        id: bigint;
        created_at: Date;
        updated_at: Date;
        description: string;
        sport_id: bigint;
        creator_id: bigint;
        location_name: string;
        status: string;
        title: string;
        event_date: Date;
        start_time: Date;
        end_time: Date;
        location_latitude: number;
        location_longitude: number;
        max_participants: number;
    }>;
    /**
     * Etkinlik günceller
     */
    update(id: BigInt, eventData: UpdateEventDTO): Promise<{
        id: bigint;
        created_at: Date;
        updated_at: Date;
        description: string;
        sport_id: bigint;
        creator_id: bigint;
        location_name: string;
        status: string;
        title: string;
        event_date: Date;
        start_time: Date;
        end_time: Date;
        location_latitude: number;
        location_longitude: number;
        max_participants: number;
    }>;
    /**
     * Etkinlik siler
     */
    delete(id: BigInt): Promise<{
        id: bigint;
        created_at: Date;
        updated_at: Date;
        description: string;
        sport_id: bigint;
        creator_id: bigint;
        location_name: string;
        status: string;
        title: string;
        event_date: Date;
        start_time: Date;
        end_time: Date;
        location_latitude: number;
        location_longitude: number;
        max_participants: number;
    }>;
    /**
     * Etkinliğe katılımcı ekler
     */
    addParticipant(eventId: BigInt, userId: BigInt, role?: string): Promise<{
        role: string;
        user_id: bigint;
        event_id: bigint;
        joined_at: Date;
    }>;
    /**
     * Etkinlikten katılımcı çıkarır
     */
    removeParticipant(eventId: BigInt, userId: BigInt): Promise<{
        role: string;
        user_id: bigint;
        event_id: bigint;
        joined_at: Date;
    }>;
    /**
     * Etkinliğe değerlendirme ekler
     */
    addRating(eventId: BigInt, userId: BigInt, rating: number, review: string): Promise<{
        id: bigint;
        created_at: Date;
        user_id: bigint;
        event_id: bigint;
        rating: number;
        review: string;
    }>;
    /**
     * Kullanıcının katıldığı etkinlikleri getirir
     */
    getUserEvents(userId: BigInt): Promise<({
        event: {
            sport: {
                name: string;
                id: bigint;
                description: string;
                icon: string;
            };
            creator: {
                id: bigint;
                username: string;
                profile_picture: string;
            };
        } & {
            id: bigint;
            created_at: Date;
            updated_at: Date;
            description: string;
            sport_id: bigint;
            creator_id: bigint;
            location_name: string;
            status: string;
            title: string;
            event_date: Date;
            start_time: Date;
            end_time: Date;
            location_latitude: number;
            location_longitude: number;
            max_participants: number;
        };
    } & {
        role: string;
        user_id: bigint;
        event_id: bigint;
        joined_at: Date;
    })[]>;
}
export declare const eventsService: EventsService;
