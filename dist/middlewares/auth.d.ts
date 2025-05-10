import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role?: string;
    };
}
/**
 * JWT token doğrulaması yapan middleware
 * Authorization header'ından token alır ve doğrular
 */
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Sadece admin kullanıcılarına izin veren middleware
 * authenticate middleware'inden sonra kullanılmalıdır
 */
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
