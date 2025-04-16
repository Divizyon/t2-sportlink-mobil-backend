export interface UserLogin {
  id?: string;
  user_id: string;
  login_date: Date;
  ip_address: string;
  device_info: string;
  status: 'success' | 'failed';
  location?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Supabase'deki tablo adı
export const USER_LOGIN_TABLE = 'user_logins'; 