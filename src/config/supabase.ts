import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL veya Key bulunamadı. Lütfen .env dosyasını kontrol edin.');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey); 