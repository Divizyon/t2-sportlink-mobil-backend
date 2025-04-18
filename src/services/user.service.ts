import { supabaseClient } from '../config/supabase';
import { User, RegisterUserDTO, LoginUserDTO } from '../models/user';
import { sendVerificationEmail } from './email.service';
import { generateRandomCode } from '../utils/random';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Şifre hashleme fonksiyonu
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Doğrulama kodu oluşturma
export const createVerificationCode = async (email: string): Promise<string> => {
  try {
    // Eski kodları temizle
    await supabaseClient
      .from('verification_codes')
      .delete()
      .eq('email', email);

    // 6 haneli rastgele kod oluştur
    const code = generateRandomCode(6);
    
    // 15 dakika geçerli olacak şekilde bitiş zamanı belirle
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    // Veritabanına kaydet
    await supabaseClient
      .from('verification_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
      });
    
    return code;
  } catch (error) {
    console.error('Doğrulama kodu oluşturma hatası:', error);
    throw new Error('Doğrulama kodu oluşturulamadı');
  }
};

// Geçici kullanıcı kaydetme
export const createTemporaryUser = async (userData: RegisterUserDTO): Promise<void> => {
  try {
    // Şifreyi hashle
    const hashedPassword = await hashPassword(userData.password);
    
    // Geçici kullanıcıyı kaydet
    await supabaseClient
      .from('temporary_users')
      .upsert({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        profile_image: userData.profile_image,
        interests: userData.interests,
        created_at: new Date().toISOString()
      });
      
  } catch (error) {
    console.error('Geçici kullanıcı oluşturma hatası:', error);
    throw new Error('Geçici kullanıcı oluşturulamadı');
  }
};

// Doğrulama kodunu kontrol et ve kullanıcıyı aktifleştir
export const verifyEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    // Doğrulama kodunu kontrol et
    const { data: verificationData, error: verificationError } = await supabaseClient
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (verificationError || !verificationData) {
      return false;
    }
    
    // Geçici kullanıcı verisini al
    const { data: tempUserData, error: tempUserError } = await supabaseClient
      .from('temporary_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (tempUserError || !tempUserData) {
      return false;
    }
    
    // Kalıcı kullanıcı tablosuna ekle
    const { error: insertError } = await supabaseClient
      .from('users')
      .insert({
        username: tempUserData.username,
        email: tempUserData.email,
        password: tempUserData.password,
        profile_image: tempUserData.profile_image,
        interests: tempUserData.interests,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      return false;
    }
    
    // Geçici kullanıcı ve doğrulama kodlarını temizle
    await supabaseClient
      .from('temporary_users')
      .delete()
      .eq('email', email);
      
    await supabaseClient
      .from('verification_codes')
      .delete()
      .eq('email', email);
    
    return true;
  } catch (error) {
    console.error('E-posta doğrulama hatası:', error);
    return false;
  }
};

// Kullanıcı girişi
export const loginUser = async (loginData: LoginUserDTO): Promise<{ user: Partial<User>; token: string } | null> => {
  try {
    // Kullanıcıyı username ile bul
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('username', loginData.username)
      .single();
    
    if (userError || !userData) {
      return null;
    }
    
    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(loginData.password, userData.password);
    if (!isPasswordValid) {
      return null;
    }
    
    // JWT token oluştur
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const payload = { id: userData.id, email: userData.email, username: userData.username };
    
    // Tip uyumsuzluğunu gidermek için "any" tipini kullanıyoruz
    // @ts-ignore
    const token = jwt.sign(payload, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    
    // Kullanıcı bilgilerini döndür (şifre hariç)
    const { password, ...userWithoutPassword } = userData;
    
    return {
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('Giriş hatası:', error);
    return null;
  }
};

// Kullanıcı kaydı ve e-posta doğrulama
export const registerUser = async (userData: RegisterUserDTO): Promise<boolean> => {
  try {
    // Kullanıcıyı geçici olarak kaydet
    await createTemporaryUser(userData);
    
    // Doğrulama kodu oluştur
    const verificationCode = await createVerificationCode(userData.email);
    
    // Geliştirme ortamında doğrulama kodunu göster
    if (process.env.NODE_ENV === 'development') {
      console.log('====== DOĞRULAMA KODU ======');
      console.log(`E-posta: ${userData.email}, Kod: ${verificationCode}`);
      console.log('============================');
    }
    
    // E-posta gönder
    return await sendVerificationEmail(userData.email, verificationCode);
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return false;
  }
}; 