// Bu dosya artık kullanılmıyor.
// Doğrudan Supabase SDK kullanılıyor.

// Supabase doğrudan kullanımı için boş export yapısı
export const query = async (_text: string, _params?: any[]) => {
  throw new Error('Direkt database sorgusu kullanım dışı. Supabase SDK kullanın.');
};




export const pool = {
  query: () => {
    throw new Error('Direkt pool kullanımı kullanım dışı. Supabase SDK kullanın.');
  }
};


// Bu modül artık kullanılmıyor, yerine Supabase SDK kullanılıyor. 