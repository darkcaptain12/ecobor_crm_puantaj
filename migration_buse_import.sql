-- =====================================================
-- Buse Import Migration
-- Supabase SQL Editor'da çalıştırın
-- =====================================================

-- 1. Yeni ENUM değerleri ekle (IF NOT EXISTS ile güvenli)
ALTER TYPE customer_status ADD VALUE IF NOT EXISTS 'yeni';
ALTER TYPE customer_status ADD VALUE IF NOT EXISTS 'eski';
ALTER TYPE customer_status ADD VALUE IF NOT EXISTS 'onemli';
ALTER TYPE customer_status ADD VALUE IF NOT EXISTS 'potansiyel';

-- 2. Yeni kolonlar ekle
ALTER TABLE customers ADD COLUMN IF NOT EXISTS sales_status TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS previous_sales_amount NUMERIC(12,2);

-- 3. Mevcut kayıtları yeni status değerlerine güncelle
-- (ENUM ADD VALUE bir transaction içinde kullanılamaz, bu yüzden ayrı çalıştırın)
UPDATE customers SET status = 'yeni'    WHERE status = 'new';
UPDATE customers SET status = 'onemli'  WHERE status = 'active';
UPDATE customers SET status = 'yeni'    WHERE status = 'dealer';
UPDATE customers SET status = 'yeni'    WHERE status IS NULL;
