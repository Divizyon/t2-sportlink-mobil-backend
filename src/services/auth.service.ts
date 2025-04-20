import { usersService } from './users.service';
import { RegisterUserDTO, LoginUserDTO } from '../models/user';
import supabaseClient from '../config/supabase';

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

    // Önce Supabase Auth ile kullanıcı oluştur
    const { error: authError } = await supabaseClient.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          profile_picture: userData.profile_picture || '',
          default_location_latitude: userData.default_location_latitude || 0,
          default_location_longitude: userData.default_location_longitude || 0,
          role: userData.role || 'user'
        }
      }
    });

    if (authError) {
      console.error('Supabase Auth kayıt hatası:', authError);
      return {
        success: false,
        message: 'Doğrulama e-postası gönderilemedi: ' + authError.message,
        error: authError
      };
    }
    
    // Veritabanına kullanıcıyı oluştur
    await usersService.create(userData);

    return { 
      success: true, 
      message: 'Kullanıcı başarıyla kaydedildi. Lütfen e-posta adresinizi kontrol edin ve hesabınızı doğrulayın.' 
    };
  } catch (error: any) {
    console.error('Kayıt işlemi sırasında hata:', error);
    
    // Prisma hatalarını ele al
    if (error.name === 'PrismaClientValidationError') {
      return {
        success: false,
        message: 'Geçersiz veri formatı. Lütfen tüm zorunlu alanları doğru formatta doldurun.',
        error
      };
    }
    
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

    // Supabase Auth ile e-posta ve şifreyle giriş yap
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: user.email,  // Kullanıcı adından bulduğumuz kullanıcının e-postasını kullan
      password: loginData.password
    });

    if (authError) {
      console.error('Supabase Auth giriş hatası:', authError);
      
      // Özel olarak hatalı şifre kontrolü
      if (authError.message.includes('Invalid login credentials')) {
        return { 
          success: false, 
          message: 'Geçersiz kullanıcı adı veya şifre.' 
        };
      }
      
      // E-posta doğrulaması yapılmadıysa
      if (authError.message.includes('Email not confirmed')) {
        return { 
          success: false, 
          message: 'E-posta adresiniz henüz doğrulanmamış. Lütfen e-posta adresinizi kontrol edin.' 
        };
      }
      
      return { 
        success: false, 
        message: 'Giriş yapılamadı: ' + authError.message,
        error: authError
      };
    }

    // Supabase Auth'dan token al
    const token = authData.session?.access_token || '';
    
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
  } catch (error: any) {
    console.error('Giriş işlemi sırasında hata:', error);
    return { 
      success: false, 
      message: 'Sunucu hatası.', 
      error 
    };
  }
}; 