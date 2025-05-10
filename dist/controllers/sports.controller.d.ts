import { Request, Response } from 'express';
/**
 * Tüm sporları getir
 */
export declare const getAllSports: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * ID'ye göre spor getir
 */
export declare const getSportById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Yeni spor oluştur
 */
export declare const createSport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Spor güncelle
 */
export declare const updateSport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Spor sil
 */
export declare const deleteSport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
