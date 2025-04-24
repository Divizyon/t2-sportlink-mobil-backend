-- Mevcut notification tablosunu güncelleyelim
-- 1. Önce tablo yapısını kontrol edelim
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Yeni alanları ekleyelim eğer yoksa
    -- type alanı ekleme
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notification'
        AND column_name = 'type'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE "notification" ADD COLUMN "type" TEXT;
        -- notification_type alanından verileri kopyala
        UPDATE "notification" SET "type" = "notification_type";
        -- type alanını NOT NULL yap
        ALTER TABLE "notification" ALTER COLUMN "type" SET NOT NULL;
    END IF;
    
    -- title alanı ekleme
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notification'
        AND column_name = 'title'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE "notification" ADD COLUMN "title" TEXT;
        -- notification_type alanından verileri kopyala (geçici)
        UPDATE "notification" SET "title" = "notification_type";
        -- title alanını NOT NULL yap
        ALTER TABLE "notification" ALTER COLUMN "title" SET NOT NULL;
    END IF;
    
    -- body alanı ekleme
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notification'
        AND column_name = 'body'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE "notification" ADD COLUMN "body" TEXT;
        -- content alanından verileri kopyala
        UPDATE "notification" SET "body" = "content";
        -- body alanını NOT NULL yap
        ALTER TABLE "notification" ALTER COLUMN "body" SET NOT NULL;
    END IF;
    
    -- is_read alanı ekleme
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notification'
        AND column_name = 'is_read'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE "notification" ADD COLUMN "is_read" BOOLEAN DEFAULT false;
        -- read_status alanından verileri kopyala 
        UPDATE "notification" SET "is_read" = "read_status";
        -- is_read alanını NOT NULL yap
        ALTER TABLE "notification" ALTER COLUMN "is_read" SET NOT NULL;
    END IF;
    
    -- data alanı ekleme
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notification'
        AND column_name = 'data'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE "notification" ADD COLUMN "data" JSONB;
    END IF;
    
    -- redirect_url alanı ekleme
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notification'
        AND column_name = 'redirect_url'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE "notification" ADD COLUMN "redirect_url" TEXT;
    END IF;
    
    -- expires_at alanı ekleme
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notification'
        AND column_name = 'expires_at'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE "notification" ADD COLUMN "expires_at" TIMESTAMP(3);
    END IF;
    
    -- event_id alanını NULL olarak izin ver
    BEGIN
        ALTER TABLE "notification" ALTER COLUMN "event_id" DROP NOT NULL;
    EXCEPTION
        WHEN others THEN
            -- Halihazırda NULL'a izin veriyorsa veya başka bir hata varsa
            NULL;
    END;
    
    -- event_id için ilişkiyi CASCADE yerine SET NULL olarak değiştir
    BEGIN
        -- Önce mevcut kısıtlamayı kaldır eğer varsa
        IF EXISTS (
            SELECT 1
            FROM   pg_constraint
            WHERE  conname = 'notification_event_id_fkey'
        ) THEN
            ALTER TABLE "notification" DROP CONSTRAINT "notification_event_id_fkey";
        END IF;
        
        -- Yeni kısıtlama ekle
        ALTER TABLE "notification" ADD CONSTRAINT "notification_event_id_fkey" 
        FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION
        WHEN others THEN
            -- İlişki zaten SET NULL olarak ayarlanmışsa
            NULL;
    END;
END $$;

-- CreateTable (DeviceToken)
CREATE TABLE IF NOT EXISTS "DeviceToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DeviceToken_token_key" ON "DeviceToken"("token");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DeviceToken_user_id_idx" ON "DeviceToken"("user_id");

-- Notification tablosu indexlerini kontrol edip ekleyelim
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_class c
        JOIN   pg_namespace n ON n.oid = c.relnamespace
        WHERE  c.relname = 'notification_user_id_idx'
        AND    n.nspname = 'public'
    ) THEN
        CREATE INDEX "notification_user_id_idx" ON "notification"("user_id");
    END IF;
    
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_class c
        JOIN   pg_namespace n ON n.oid = c.relnamespace
        WHERE  c.relname = 'notification_type_idx'
        AND    n.nspname = 'public'
    ) THEN
        CREATE INDEX "notification_type_idx" ON "notification"("type");
    END IF;
    
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_class c
        JOIN   pg_namespace n ON n.oid = c.relnamespace
        WHERE  c.relname = 'notification_event_id_idx'
        AND    n.nspname = 'public'
    ) THEN
        CREATE INDEX "notification_event_id_idx" ON "notification"("event_id");
    END IF;
END $$;

-- AddForeignKey - DeviceToken için foreign key ekleyelim
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_constraint
        WHERE  conname = 'DeviceToken_user_id_fkey'
    ) THEN
        ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey - notification tablosu için foreign key'leri kontrol edip ekleyelim
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_constraint
        WHERE  conname = 'notification_user_id_fkey'
    ) THEN
        ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;