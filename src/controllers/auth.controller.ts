import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { RegisterUserDTO, LoginUserDTO } from '../models/user';

// BigInt'leri stringe dönüştüren yardımcı fonksiyon
const serializeBigInt = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'bigint') {
    return data.toString();
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeBigInt(item));
  }

  if (typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      result[key] = serializeBigInt(data[key]);
    }
    return result;
  }

  return data;
};

// Kullanıcı kayıt kontrolcüsü
export const register = async (req: Request, res: Response) => {
  try {
    const userData: RegisterUserDTO = req.body;

    // Zorunlu alan kontrolü
    const requiredFields = [
      'username', 
      'email', 
      'password', 
      'confirm_password', 
      'first_name', 
      'last_name', 
      'phone',
      'default_location_latitude',
      'default_location_longitude'
    ];
    
    const missingFields = requiredFields.filter(field => !userData[field as keyof RegisterUserDTO]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Eksik alanlar: ${missingFields.join(', ')}`
      });
    }

    // Şifre kontrolü
    if (userData.password !== userData.confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Şifreler eşleşmiyor.'
      });
    }

    // Kullanıcıyı kaydet
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
    
    // Giriş alanları kontrolü
    if (!loginData.username || !loginData.password) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı ve şifre gereklidir.'
      });
    }
    
    // Kullanıcı girişi
    const result = await loginUser(loginData);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
    
    // Kullanıcı bilgilerini ve token'ı döndür (BigInt'leri string'e dönüştürerek)
    const serializedData = result.data ? serializeBigInt(result.data) : undefined;
    
    return res.status(200).json({
      success: true,
      message: result.message,
      data: serializedData
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
}; 