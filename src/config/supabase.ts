import { createClient } from '@supabase/supabase-js';
// dotenv gerektirmeden direkt çevre değişkenlerini kullan

// Supabase URL ve anonim anahtar kontrolü
const supabaseUrl: string = process.env.SUPABASE_URL || 'https://ugsxqddhaqgmilltglwy.supabase.co';
const supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnc3hxZGRoYXFnbWlsbHRnbHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MjYxMDAsImV4cCI6MjA2MDQwMjEwMH0.2uUmcLMn94vE1M9YEJ1kEi-eu--FeYGrQk2Bkh9eVzo';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL veya anonim anahtar bulunamadı. Varsayılan değerler kullanılacak.');
}

// Anonim kullanıcılar için Supabase istemcisi (normal kullanıcı işlemleri için)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabaseClient;