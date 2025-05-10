import { RegisterUserDTO, LoginUserDTO } from '../models/user';
/**
 * Kullanıcı kaydı servisi
 */
export declare const registerUser: (userData: RegisterUserDTO) => Promise<{
    success: boolean;
    message: string;
    error?: any;
}>;
/**
 * Kullanıcı girişi servisi
 */
export declare const loginUser: (loginData: LoginUserDTO) => Promise<{
    success: boolean;
    message: string;
    data?: {
        user: any;
        token: string;
    };
    error?: any;
}>;
