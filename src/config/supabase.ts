import { createClient } from '@supabase/supabase-js';
// dotenv gerektirmeden direkt çevre değişkenlerini kullan

// Supabase URL ve anonim anahtar kontrolü
const supabaseUrl: string = process.env.SUPABASE_URL || 'https://sfduvlrizkrkpiksqyqm.supabase.co';
const supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmZHV2bHJpemtya3Bpa3NxeXFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyOTk4OTksImV4cCI6MjA1Nzg3NTg5OX0.XHZ_R8KFGzESlommgDSiZn2ULnPN_s6kAvnLXWhgAzU';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL veya anonim anahtar bulunamadı. Varsayılan değerler kullanılacak.');
}

// Anonim kullanıcılar için Supabase istemcisi (normal kullanıcı işlemleri için)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabaseClient;