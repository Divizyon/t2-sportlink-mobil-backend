import { Request, Response } from 'express';
/**
 * Tüm etkinlikleri getir (filtreleme desteğiyle)
 */
export declare const getAllEvents: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * ID'ye göre etkinlik getir
 */
export declare const getEventById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Yeni etkinlik oluştur
 */
export declare const createEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Etkinlik güncelle
 */
export declare const updateEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Etkinlik sil
 */
export declare const deleteEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Etkinliğe katılımcı ekle
 */
export declare const joinEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Etkinlikten ayrıl
 */
export declare const leaveEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Etkinliğe değerlendirme ekle
 */
export declare const rateEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
