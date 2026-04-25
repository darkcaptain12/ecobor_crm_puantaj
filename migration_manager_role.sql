-- =============================================
-- MANAGER Rolü Ekleme
-- Supabase Dashboard > SQL Editor'de çalıştır
-- =============================================

-- user_role enum'una MANAGER değerini ekle
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'MANAGER';

-- Demo: Bir müdür kullanıcısı ekle (şifre: demo2026)
INSERT INTO users (id, name, phone, password, role, region, is_active)
VALUES (
  'aa000010-0000-0000-0000-000000000010',
  'Serkan Kılıç',
  '05001234560',
  '$2b$10$w5XCzKT/Tp61VYyC4LhiiOc267rb2/gKgUTxzBskbuhUqF1A6Tvcu',
  'MANAGER',
  NULL,
  true
)
ON CONFLICT (phone) DO NOTHING;

-- Kontrol
SELECT id, name, phone, role FROM users ORDER BY role, name;
