import { usersService } from './users.service';
import { RegisterUserDTO, LoginUserDTO } from '../models/user';
import { supabaseClient } from '../config/supabase';

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

    // Konum bilgilerinin sayısal olduğunu kontrol et
    if (isNaN(userData.default_location_latitude) || isNaN(userData.default_location_longitude)) {
      return {
        success: false,
        message: 'Konum bilgileri geçerli sayısal değerler olmalıdır.'
      };
    }

    // Önce Supabase Auth'a kaydet
    const { data: __supabaseData, error: supabaseError } = await supabaseClient.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          default_location_latitude: userData.default_location_latitude,
          default_location_longitude: userData.default_location_longitude,
          role: userData.role || 'user'
        },
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`
      }
    });

    if (supabaseError) {
      console.error('Supabase Auth hatası:', supabaseError);
      return { 
        success: false, 
        message: 'Supabase Auth hatası: ' + supabaseError.message, 
        error: supabaseError 
      };
    }

    // Sonra veritabanına kaydet
    try {
      await usersService.create(userData);
    } catch (dbError) {
      console.error('Veritabanı kayıt hatası:', dbError);
      return {
        success: false,
        message: 'Veritabanı kayıt hatası: ' + (dbError instanceof Error ? dbError.message : String(dbError)),
        error: dbError
      };
    }

    return { 
      success: true, 
      message: 'Kullanıcı başarıyla kaydedildi. Lütfen e-posta adresinizi doğrulayın.' 
    };
  } catch (error) {
    console.error('Kayıt işlemi sırasında hata:', error);
    return { 
      success: false, 
      message: 'Sunucu hatası: ' + (error instanceof Error ? error.message : String(error)), 
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
  data?: { user: any; token: string; supabaseSession?: any }; 
  error?: any 
}> => {
  try {
    console.log('Login işlemi başlatılıyor:', loginData.username);

    // Supabase Auth ile giriş dene
    try {
      console.log('Supabase Auth ile giriş deneniyor...');
      // E-posta olarak kullanıcı adını kullanmayı dene (eğer kullanıcı adı bir e-posta ise)
      const { data: supabaseData, error: supabaseError } = await supabaseClient.auth.signInWithPassword({
        email: loginData.username, // email olarak kullanıcı adını dene
        password: loginData.password
      });

      if (supabaseError) {
        console.log('Supabase Auth giriş hatası:', supabaseError.message);
      } else if (supabaseData.session) {
        console.log('Supabase Auth giriş başarılı');
        
        // Veritabanından kullanıcıyı bul
        const user = await usersService.findByEmail(supabaseData.user?.email || '');
        
        if (!user) {
          console.log('Kullanıcı veritabanında bulunamadı:', supabaseData.user?.email);
          return {
            success: false,
            message: 'Kullanıcı veritabanında bulunamadı.'
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
            token,
            supabaseSession: supabaseData.session
          }
        };
      }
    } catch (supabaseAuthError) {
      console.error('Supabase Auth giriş işlemi sırasında beklenmeyen hata:', supabaseAuthError);
    }

    // Supabase Auth başarısız olduysa, normal veritabanı girişi dene
    console.log('Normal veritabanı girişi deneniyor...');
    const user = await usersService.findByUsername(loginData.username);
    
    if (!user) {
      return { 
        success: false, 
        message: 'Geçersiz kullanıcı adı veya şifre.' 
      };
    }

    // Şifre kontrolü
    try {
      const isValidPassword = await usersService.verifyPassword(loginData.password, user.password);
      
      if (!isValidPassword) {
        return { 
          success: false, 
          message: 'Geçersiz kullanıcı adı veya şifre.' 
        };
      }
    } catch (passwordError) {
      console.error('Şifre doğrulama hatası:', passwordError);
      return {
        success: false,
        message: 'Şifre doğrulama sırasında hata: ' + (passwordError instanceof Error ? passwordError.message : String(passwordError)),
        error: passwordError
      };
    }

    // JWT token oluştur
    try {
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
    } catch (tokenError) {
      console.error('Token oluşturma hatası:', tokenError);
      return {
        success: false,
        message: 'Token oluşturma sırasında hata: ' + (tokenError instanceof Error ? tokenError.message : String(tokenError)),
        error: tokenError
      };
    }
  } catch (error) {
    console.error('Giriş işlemi sırasında hata:', error);
    return { 
      success: false, 
      message: 'Sunucu hatası: ' + (error instanceof Error ? error.message : String(error)), 
      error 
    };
  }
}; 