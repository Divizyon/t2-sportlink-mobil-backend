import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { RegisterUserDTO, LoginUserDTO } from '../models/user';


// Kullanıcı kayıt kontrolcüsü
export const register = async (req: Request, res: Response) => {
  try {
    const userData: RegisterUserDTO = req.body;

    // Şifre kontrolü
    if (userData.password !== userData.confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Şifreler eşleşmiyor.'
      });
    }

    // Kullanıcıyı kaydet ve Supabase Auth üzerinden doğrulama e-postası gönder
    const result = await registerUser(userData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
    
    return res.status(201).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

// Kullanıcı giriş kontrolcüsü
export const login = async (req: Request, res: Response) => {
  try {
    const loginData: LoginUserDTO = req.body;
    
    // Supabase Auth üzerinden kullanıcı girişi
    const result = await loginUser(loginData);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
    
    // Kullanıcı bilgilerini ve token'ı döndür
    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
}; 