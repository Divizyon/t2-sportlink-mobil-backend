import { supabaseClient } from '../config/supabase';
import { RegisterUserDTO, LoginUserDTO } from '../models/user';

// Kullanıcı kaydı
export const registerUser = async (userData: RegisterUserDTO): Promise<{ success: boolean; message: string; error?: any }> => {
  try {
    // Supabase Auth kullanarak kayıt işlemi
    const { error } = await supabaseClient.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          profile_image: userData.profile_image,
          interests: userData.interests,
        }
      }
    });

    if (error) {
      console.error('Kayıt hatası:', error);
      return { 
        success: false, 
        message: 'Kullanıcı kaydedilemedi.', 
        error 
      };
    }

    return { 
      success: true, 
      message: 'Kullanıcı kaydedildi. Lütfen e-postanızı kontrol edin ve hesabınızı doğrulayın.' 
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

// Kullanıcı girişi
export const loginUser = async (loginData: LoginUserDTO): Promise<{ success: boolean; message: string; data?: { user: any; token: string }; error?: any }> => {
  try {
    // Önce e-posta adresini bulmak için kullanıcı adını kontrol et
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('email')
      .eq('username', loginData.username)
      .single();
    
    if (userError || !userData) {
      return { 
        success: false, 
        message: 'Geçersiz kullanıcı adı.', 
        error: userError 
      };
    }

    // Supabase Auth ile e-posta ve şifre kullanarak giriş
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: userData.email,
      password: loginData.password,
    });

    if (error) {
      console.error('Giriş hatası:', error);
      return { 
        success: false, 
        message: 'Geçersiz kullanıcı adı veya şifre.', 
        error 
      };
    }

    return {
      success: true,
      message: 'Giriş başarılı.',
      data: {
        user: data.user,
        token: data.session.access_token
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