import { supabase } from '../config/supabase';
import { UserLogin, USER_LOGIN_TABLE } from '../models/UserLogin';

interface CreateLoginRecordParams {
  user_id: string;
  ip_address: string;
  device_info: string;
  status: 'success' | 'failed';
  location?: string;
}

interface LoginHistoryResponse {
  loginHistory: UserLogin[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const userLoginService = {
  async createLoginRecord(params: CreateLoginRecordParams): Promise<UserLogin> {
    const loginRecord = {
      ...params,
      login_date: new Date(),
    };

    const { data, error } = await supabase
      .from(USER_LOGIN_TABLE)
      .insert(loginRecord)
      .select()
      .single();

    if (error) {
      throw new Error(`Giriş kaydı oluşturulurken hata: ${error.message}`);
    }

    return data;
  },

  async getUserLoginHistory(
    userId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<LoginHistoryResponse> {
    const offset = (page - 1) * limit;
    
    // Toplam kayıt sayısını al
    const { count, error: countError } = await supabase
      .from(USER_LOGIN_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      throw new Error(`Giriş kayıtları sayısı alınırken hata: ${countError.message}`);
    }

    // Sayfalanmış kayıtları al
    const { data, error } = await supabase
      .from(USER_LOGIN_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('login_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Giriş kayıtları alınırken hata: ${error.message}`);
    }

    const total = count || 0;

    return {
      loginHistory: data || [],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}; 