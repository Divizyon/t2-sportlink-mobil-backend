import { createClient } from '@supabase/supabase-js';
// dotenv gerektirmeden direkt çevre değişkenlerini kullan

// Supabase URL ve anonim anahtar kontrolü
const supabaseUrl: string = process.env.SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('HATA: Supabase URL veya anonim anahtar bulunamadı. .env dosyasını kontrol edin.');
  console.error('SUPABASE_URL ve SUPABASE_ANON_KEY değerlerinin doğru ayarlandığından emin olun.');
  process.exit(1); // Kritik hata, uygulamayı sonlandır
}

console.log('Supabase bağlantısı başlatılıyor:', supabaseUrl);

// Anonim kullanıcılar için Supabase istemcisi (normal kullanıcı işlemleri için)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabaseClient;