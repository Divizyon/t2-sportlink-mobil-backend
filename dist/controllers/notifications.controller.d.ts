import { Request, Response } from 'express';
/**
 * Kullanıcının bildirimlerini getirir
 */
export declare const getUserNotifications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Belirli bir bildirimi getirir
 */
export declare const getNotificationById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Bir bildirimi okundu olarak işaretler
 */
export declare const markAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Kullanıcının tüm bildirimlerini okundu olarak işaretler
 */
export declare const markAllAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Bir bildirimi siler
 */
export declare const deleteNotification: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Kullanıcının okunmamış bildirim sayısını getirir
 */
export declare const getUnreadCount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
