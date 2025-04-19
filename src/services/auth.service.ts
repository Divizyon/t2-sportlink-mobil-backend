import { usersService } from './users.service';
import { RegisterUserDTO, LoginUserDTO } from '../models/user';

/**
 * Kullanıcı kaydı servisi
 */
export const registerUser = async (userData: RegisterUserDTO): Promise<{ success: boolean; message: string; error?: any }> => {
  try {
    // E-posta ve kullanıcı adı kontrolü
    const existingUserByEmail = await usersService.findByEmail(userData.email);
    if (existingUserByEmail) {
      return { 
        success: false, 
        message: 'Bu e-posta adresi zaten kullanılmaktadır.' 
      };
    }

    const existingUserByUsername = await usersService.findByUsername(userData.username);
    if (existingUserByUsername) {
      return { 
        success: false, 
        message: 'Bu kullanıcı adı zaten kullanılmaktadır.' 
      };
    }

    // Şifre kontrolü
    if (userData.password !== userData.confirm_password) {
      return { 
        success: false, 
        message: 'Şifreler eşleşmiyor.' 
      };
    }

    // Kullanıcıyı oluştur
    await usersService.create(userData);

    return { 
      success: true, 
      message: 'Kullanıcı başarıyla kaydedildi.' 
    };
  } catch (error) {
    console.error('Kayıt işlemi sırasında hata:', error);
    return { 
      success: false, 
      message: 'Sunucu hatası.', 
      error 
    };
  }
};

/**
 * Kullanıcı girişi servisi
 */
export const loginUser = async (loginData: LoginUserDTO): Promise<{ 
  success: boolean; 
  message: string; 
  data?: { user: any; token: string }; 
  error?: any 
}> => {
  try {
    // Kullanıcı adıyla kullanıcıyı bul
    const user = await usersService.findByUsername(loginData.username);
    
    if (!user) {
      return { 
        success: false, 
        message: 'Geçersiz kullanıcı adı veya şifre.' 
      };
    }

    // Şifre kontrolü
    const isValidPassword = await usersService.verifyPassword(loginData.password, user.password);
    
    if (!isValidPassword) {
      return { 
        success: false, 
        message: 'Geçersiz kullanıcı adı veya şifre.' 
      };
    }

    // JWT token oluştur
    const token = usersService.generateToken(user);
    
    // Kullanıcı şifresini çıkar
    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Giriş başarılı.',
      data: {
        user: userWithoutPassword,
        token
      }
    };
  } catch (error) {
    console.error('Giriş işlemi sırasında hata:', error);
    return { 
      success: false, 
      message: 'Sunucu hatası.', 
      error 
    };
  }
}; 