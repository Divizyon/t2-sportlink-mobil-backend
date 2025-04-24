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
    console.log('Supabase bağlantısı başarılı!');
    
    if (!supabaseAdmin) {
      console.warn('SUPABASE_SERVICE_KEY tanımlanmamış. Yüksek yetkili Supabase işlemleri çalışmayabilir.');
      return true;
    }
    
    // realtime_notifications tablosunun varlığını kontrol et
    const { data: existingTables, error: tableError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'realtime_notifications');
    
    if (tableError) {
      console.error('Tablo kontrolünde hata:', tableError);
      throw tableError;
    }
    
    // Tablo yoksa oluştur
    if (!existingTables || existingTables.length === 0) {
      console.log('realtime_notifications tablosu oluşturuluyor...');
      
      const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS realtime_notifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id TEXT NOT NULL,
            notification_id TEXT NOT NULL,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            data JSONB,
            type TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
          );
          
          -- Realtime özelliğini etkinleştir
          ALTER TABLE realtime_notifications REPLICA IDENTITY FULL;
          
          -- RLS politikaları
          CREATE POLICY "Users can see their own notifications" 
          ON realtime_notifications FOR SELECT 
          USING (auth.uid()::text = user_id);
          
          -- Insert için politika
          CREATE POLICY "Service can insert notifications" 
          ON realtime_notifications FOR INSERT 
          TO authenticated
          WITH CHECK (true);
        `
      });
      
      if (createError) {
        console.error('Tablo oluşturma hatası:', createError);
        throw createError;
      }
      
      console.log('realtime_notifications tablosu başarıyla oluşturuldu!');
    } else {
      console.log('realtime_notifications tablosu zaten mevcut.');
    }
    
    // Supabase'in Realtime özelliğini etkinleştir
    const { error: realtimeError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        BEGIN;
        -- Realtime publish yapılabilecek tabloyu belirt
        CALL supabase_functions.notify_functions('realtime_notifications_change', 
        ARRAY['realtime_notifications'], 'public', '{"event":"*","schema":"public","table":"realtime_notifications","columns":"*"}');
        COMMIT;
      `
    });
    
    if (realtimeError) {
      console.error('Realtime ayarlama hatası:', realtimeError);
      throw realtimeError;
    }
    
    console.log('Realtime ayarları başarıyla yapılandırıldı!');
    return true;
  } catch (error) {
    console.error('Supabase bağlantı hatası:', error);
    throw error;
  }
}