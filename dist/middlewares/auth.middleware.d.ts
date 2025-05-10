import { Request, Response, NextFunction } from 'express';
export interface DecodedToken {
    id: string;
    email: string;
    username: string;
    role: string;
    iat: number;
    exp: number;
}
export interface AuthenticatedRequest extends Request {
    user?: {
        id: BigInt;
        username: string;
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
    };
}
export declare const isAuthenticated: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>;
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>;
