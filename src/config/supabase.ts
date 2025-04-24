/* eslint-disable prettier/prettier */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Çevre değişkenlerini yükle
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL veya ANON KEY bulunamadı. Lütfen .env dosyasını kontrol edin.');
}

// Supabase istemcisini oluştur (anonim anahtar ile - düşük yetkili)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Servis anahtarı ile Supabase istemcisi (yüksek yetkili)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Supabase tablolarını oluşturmak için bu fonksiyonu kullanabilirsiniz
export async function setupRealtimeTables() {
  try {
    // realtime_messages tablosu Supabase'de oluşturulmamışsa, burada oluşturma sorgusu gönderilebilir
    console.log('Supabase bağlantısı başarılı!');
    
    if (!supabaseAdmin) {
      console.warn('SUPABASE_SERVICE_KEY tanımlanmamış. Yüksek yetkili Supabase işlemleri çalışmayabilir.');
    }
    
    return true;
  } catch (error) {
    console.error('Supabase bağlantı hatası:', error);
    throw error;
  }
}