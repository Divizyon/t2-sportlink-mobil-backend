"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = exports.supabase = void 0;
exports.setupRealtimeTables = setupRealtimeTables;
/* eslint-disable prettier/prettier */
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
// Çevre değişkenlerini yükle
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL veya ANON KEY bulunamadı. Lütfen .env dosyasını kontrol edin.');
}
// Supabase istemcisini oluştur (anonim anahtar ile - düşük yetkili)
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
// Servis anahtarı ile Supabase istemcisi (yüksek yetkili)
exports.supabaseAdmin = supabaseServiceKey
    ? (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;
// Supabase tablolarını oluşturmak için bu fonksiyonu kullanabilirsiniz
async function setupRealtimeTables() {
    try {
        console.log('Supabase bağlantısı başarılı!');
        if (!exports.supabaseAdmin) {
            console.warn('SUPABASE_SERVICE_KEY tanımlanmamış. Yüksek yetkili Supabase işlemleri çalışmayabilir.');
            return true;
        }
        // realtime_notifications tablosunun varlığını kontrol et
        const { data: existingTables, error: tableError } = await exports.supabaseAdmin
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
            const { error: createError } = await exports.supabaseAdmin.rpc('exec_sql', {
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
        }
        else {
            console.log('realtime_notifications tablosu zaten mevcut.');
        }
        // Supabase'in Realtime özelliğini etkinleştir
        const { error: realtimeError } = await exports.supabaseAdmin.rpc('exec_sql', {
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
    }
    catch (error) {
        console.error('Supabase bağlantı hatası:', error);
        throw error;
    }
}
//# sourceMappingURL=supabase.js.map