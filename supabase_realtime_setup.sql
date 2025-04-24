-- Supabase için realtime_messages tablosunu oluşturma
create table if not exists realtime_messages (
  id uuid not null primary key,
  conversation_id uuid not null,
  sender_id uuid not null,
  content text not null,
  media_url text,
  created_at timestamp with time zone default now()
);

-- Realtime yayınlarını etkinleştirmek için
alter table realtime_messages enable row level security;

-- Herkesin mesajları görüntülemesine izin veren politika
create policy "Herkes mesajları görüntüleyebilir"
  on realtime_messages for select
  to authenticated
  using (true);

-- Kimliği doğrulanmış kullanıcıların mesaj eklemesine izin veren politika
-- NOT: sender_id'nin UUID olduğundan emin olun
create policy "Kimliği doğrulanmış kullanıcılar mesaj ekleyebilir"
  on realtime_messages for insert
  to authenticated
  with check (true); -- Şimdilik tüm authenticated kullanıcıların insert yapmasına izin verelim

-- Broadcast politikasını da ekleyelim
alter publication supabase_realtime add table realtime_messages;