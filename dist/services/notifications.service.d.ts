import { PrismaService } from './prisma.service';
interface CreateNotificationDTO {
    user_id: bigint;
    notification_type: string;
    content: string;
    read_status?: boolean;
    event_id: bigint;
}
interface UpdateNotificationDTO {
    read_status?: boolean;
    content?: string;
}
interface NotificationQueryParams {
    user_id?: bigint;
    notification_type?: string;
    read_status?: boolean;
    limit?: number;
    offset?: number;
}
declare class NotificationsService extends PrismaService {
    /**
     * Kullanıcının tüm bildirimlerini getirir
     */
    findAll(params?: NotificationQueryParams): Promise<{
        id: bigint;
        created_at: Date;
        user_id: bigint;
        event_id: bigint;
        notification_type: string;
        read_status: boolean;
        content: string;
    }[]>;
    /**
     * Belirli bir bildirimi ID'ye göre getirir
     */
    findById(id: bigint): Promise<{
        id: bigint;
        created_at: Date;
        user_id: bigint;
        event_id: bigint;
        notification_type: string;
        read_status: boolean;
        content: string;
    } | null>;
    /**
     * Yeni bir bildirim oluşturur
     */
    create(notificationData: CreateNotificationDTO): Promise<{
        id: bigint;
        created_at: Date;
        user_id: bigint;
        event_id: bigint;
        notification_type: string;
        read_status: boolean;
        content: string;
    }>;
    /**
     * Bir bildirimi günceller
     */
    update(id: bigint, notificationData: UpdateNotificationDTO): Promise<{
        id: bigint;
        created_at: Date;
        user_id: bigint;
        event_id: bigint;
        notification_type: string;
        read_status: boolean;
        content: string;
    }>;
    /**
     * Bir bildirimi okundu olarak işaretler
     */
    markAsRead(id: bigint): Promise<{
        id: bigint;
        created_at: Date;
        user_id: bigint;
        event_id: bigint;
        notification_type: string;
        read_status: boolean;
        content: string;
    }>;
    /**
     * Kullanıcının tüm bildirimlerini okundu olarak işaretler
     */
    markAllAsRead(user_id: bigint): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /**
     * Bir bildirimi siler
     */
    delete(id: bigint): Promise<{
        id: bigint;
        created_at: Date;
        user_id: bigint;
        event_id: bigint;
        notification_type: string;
        read_status: boolean;
        content: string;
    }>;
    /**
     * Kullanıcının tüm bildirimlerini siler
     */
    deleteAllForUser(user_id: bigint): Promise<import(".prisma/client").Prisma.BatchPayload>;
    /**
     * Etkinlik davetiyesi bildirimi oluşturur
     */
    createEventInvitation(user_id: bigint, event_id: bigint, event_title: string, sender_name: string): Promise<{
        id: bigint;
        created_at: Date;
        user_id: bigint;
        event_id: bigint;
        notification_type: string;
        read_status: boolean;
        content: string;
    }>;
    /**
     * Etkinlik güncelleme bildirimi oluşturur
     */
    createEventUpdate(event_id: bigint, event_title: string): Promise<{
        id: bigint;
        created_at: Date;
        user_id: bigint;
        event_id: bigint;
        notification_type: string;
        read_status: boolean;
        content: string;
    }[]>;
    /**
     * Kullanıcının okunmamış bildirim sayısını getirir
     */
    getUnreadCount(user_id: bigint): Promise<number>;
}
export declare const notificationsService: NotificationsService;
export {};
