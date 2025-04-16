import { supabase } from '../config/supabase';
import { USER_LOGIN_TABLE } from '../models/UserLogin';

async function createUserLoginTable() {
  console.log('UserLogin tablosu oluşturuluyor...');

  try {
    // Önce tablonun var olup olmadığını kontrol et
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', USER_LOGIN_TABLE);

    if (tablesError) {
      console.error('Tablo kontrolü sırasında hata:', tablesError.message);
      return;
    }

    const tableExists = tablesData && tablesData.length > 0;

    if (tableExists) {
      console.log(`${USER_LOGIN_TABLE} tablosu zaten mevcut.`);
    } else {
      console.log(`${USER_LOGIN_TABLE} tablosu oluşturuluyor...`);
      
      // SQL sorgusu ile tablo oluştur - supabase.rpc kullanarak
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE ${USER_LOGIN_TABLE} (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id),
            login_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            ip_address TEXT NOT NULL,
            device_info TEXT NOT NULL, 
            status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
            location TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- RLS Policies (Güvenlik)
          ALTER TABLE ${USER_LOGIN_TABLE} ENABLE ROW LEVEL SECURITY;
          
          -- Kullanıcılar sadece kendi giriş kayıtlarını görebilir
          CREATE POLICY "Users can view own login history" 
            ON ${USER_LOGIN_TABLE} FOR SELECT 
            USING (auth.uid() = user_id);
          
          -- Sadece yetkilendirilmiş kullanıcılar giriş kaydı oluşturabilir
          CREATE POLICY "Only authorized can insert login records" 
            ON ${USER_LOGIN_TABLE} FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
        `
      });

      if (createError) {
        if (createError.message.includes('relation "public.exec_sql" does not exist')) {
          console.error('exec_sql fonksiyonu bulunamadı. Supabase SQL Editor kullanarak tablo oluşturmanız gerekecek.');
          console.log('SQL Editor\'da çalıştırmanız gereken SQL sorgusu:');
          console.log(`
            CREATE TABLE ${USER_LOGIN_TABLE} (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID NOT NULL REFERENCES auth.users(id),
              login_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              ip_address TEXT NOT NULL,
              device_info TEXT NOT NULL, 
              status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
              location TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            -- RLS Policies (Güvenlik)
            ALTER TABLE ${USER_LOGIN_TABLE} ENABLE ROW LEVEL SECURITY;
            
            -- Kullanıcılar sadece kendi giriş kayıtlarını görebilir
            CREATE POLICY "Users can view own login history" 
              ON ${USER_LOGIN_TABLE} FOR SELECT 
              USING (auth.uid() = user_id);
            
            -- Sadece yetkilendirilmiş kullanıcılar giriş kaydı oluşturabilir
            CREATE POLICY "Only authorized can insert login records" 
              ON ${USER_LOGIN_TABLE} FOR INSERT 
              WITH CHECK (auth.uid() = user_id);
          `);
        } else {
          console.error('Tablo oluşturulurken hata:', createError.message);
        }
      } else {
        console.log(`${USER_LOGIN_TABLE} tablosu başarıyla oluşturuldu!`);
      }
    }
  } catch (error) {
    console.error('İşlem sırasında hata:', error);
  } finally {
    console.log('İşlem tamamlandı!');
    process.exit(0);
  }
}

// İşlemi çalıştır
createUserLoginTable(); 