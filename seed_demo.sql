-- =============================================
-- ECOBOR CRM — Demo Seed Verisi
-- Supabase Dashboard > SQL Editor'de çalıştır
-- Şifre tüm demo hesaplar için: demo2026
-- =============================================

-- bcrypt hash for 'demo2026'
-- (ecobor2026 hash'i zaten admin için kullanılıyor)

-- =============================================
-- 1. KULLANICILER
-- =============================================
INSERT INTO users (id, name, phone, password, role, region, is_active) VALUES
  -- Mühendis
  ('aa000001-0000-0000-0000-000000000001',
   'Mehmet Yılmaz',
   '05001234561',
   '$2b$10$w5XCzKT/Tp61VYyC4LhiiOc267rb2/gKgUTxzBskbuhUqF1A6Tvcu',
   'ENGINEER', 'Ege', true),
  -- Saha Temsilcisi
  ('aa000002-0000-0000-0000-000000000002',
   'Ali Demir',
   '05001234562',
   '$2b$10$w5XCzKT/Tp61VYyC4LhiiOc267rb2/gKgUTxzBskbuhUqF1A6Tvcu',
   'REMOTE_AGENT', 'Marmara', true),
  -- Müşteri 1 (giriş yapabilir)
  ('aa000003-0000-0000-0000-000000000003',
   'Ayşe Kaya',
   '05001234563',
   '$2b$10$w5XCzKT/Tp61VYyC4LhiiOc267rb2/gKgUTxzBskbuhUqF1A6Tvcu',
   'CUSTOMER', 'Ege', true),
  -- Müşteri 2 (giriş yapabilir)
  ('aa000004-0000-0000-0000-000000000004',
   'Hasan Çelik',
   '05001234564',
   '$2b$10$w5XCzKT/Tp61VYyC4LhiiOc267rb2/gKgUTxzBskbuhUqF1A6Tvcu',
   'CUSTOMER', 'Marmara', true),
  -- Müşteri 3 (giriş yapabilir)
  ('aa000005-0000-0000-0000-000000000005',
   'Fatma Arslan',
   '05001234565',
   '$2b$10$w5XCzKT/Tp61VYyC4LhiiOc267rb2/gKgUTxzBskbuhUqF1A6Tvcu',
   'CUSTOMER', 'İç Anadolu', true)
ON CONFLICT (phone) DO NOTHING;

-- =============================================
-- 2. MÜŞTERİLER (CRM)
-- =============================================
INSERT INTO customers (id, name, phone, region, crop_type, planting_date, status,
  assigned_to, user_id, notes) VALUES
  -- Ayşe Kaya — user hesabı var
  ('bb000001-0000-0000-0000-000000000001',
   'Ayşe Kaya', '05001234563', 'Ege', 'Zeytin', '2024-11-01', 'active',
   'aa000001-0000-0000-0000-000000000001',
   'aa000003-0000-0000-0000-000000000003',
   'İzmir Kemalpaşa bölgesi, 50 dönüm zeytin bahçesi'),
  -- Hasan Çelik — user hesabı var
  ('bb000002-0000-0000-0000-000000000002',
   'Hasan Çelik', '05001234564', 'Marmara', 'Domates', '2025-03-15', 'active',
   'aa000002-0000-0000-0000-000000000002',
   'aa000004-0000-0000-0000-000000000004',
   'Bursa İnegöl, sera domatesi, 8 dönüm'),
  -- Fatma Arslan — user hesabı var
  ('bb000003-0000-0000-0000-000000000003',
   'Fatma Arslan', '05001234565', 'İç Anadolu', 'Buğday', '2024-10-20', 'dealer',
   'aa000001-0000-0000-0000-000000000001',
   'aa000005-0000-0000-0000-000000000005',
   'Konya Çumra, bayi müşteri, 500 dönüm buğday'),
  -- Ek CRM müşterileri (user hesabı yok)
  ('bb000004-0000-0000-0000-000000000004',
   'Mustafa Öztürk', '05341234567', 'Ege', 'Üzüm', '2025-04-01', 'new',
   'aa000001-0000-0000-0000-000000000001',
   NULL,
   'Manisa Alaşehir, yeni lead, bağ alanı'),
  ('bb000005-0000-0000-0000-000000000005',
   'Zeynep Güler', '05351234568', 'Akdeniz', 'Pamuk', '2024-09-05', 'active',
   'aa000002-0000-0000-0000-000000000002',
   NULL,
   'Adana Ceyhan, pamuk üreticisi, 200 dönüm'),
  ('bb000006-0000-0000-0000-000000000006',
   'İbrahim Koç', '05361234569', 'Karadeniz', 'Fındık', '2024-08-10', 'active',
   'aa000001-0000-0000-0000-000000000001',
   NULL,
   'Ordu Fatsa, fındık bahçesi, 30 dönüm'),
  ('bb000007-0000-0000-0000-000000000007',
   'Elif Şahin', '05371234570', 'Marmara', 'Çilek', '2025-02-20', 'active',
   'aa000002-0000-0000-0000-000000000002',
   NULL,
   'Bursa Mustafakemalpaşa, çilek seracılığı')
ON CONFLICT (phone) DO NOTHING;

-- =============================================
-- 3. SİPARİŞLER
-- =============================================
INSERT INTO orders (id, order_number, customer_id, engineer_id, status,
  tracking_code, shipment_company, total_amount, total_points, is_field_sale, created_at) VALUES
  -- Teslim edilmiş
  ('cc000001-0000-0000-0000-000000000001',
   'ECB-2025-0001', 'bb000001-0000-0000-0000-000000000001',
   'aa000001-0000-0000-0000-000000000001', 'DELIVERED',
   'MNG123456789', 'MNG Kargo', 280.00, 100, false,
   now() - interval '30 days'),
  ('cc000002-0000-0000-0000-000000000002',
   'ECB-2025-0002', 'bb000001-0000-0000-0000-000000000001',
   'aa000001-0000-0000-0000-000000000001', 'DELIVERED',
   'PTT987654321', 'PTT Kargo', 650.00, 250, false,
   now() - interval '15 days'),
  ('cc000003-0000-0000-0000-000000000003',
   'ECB-2025-0003', 'bb000002-0000-0000-0000-000000000002',
   'aa000002-0000-0000-0000-000000000002', 'SHIPPED',
   'ARAS456789012', 'Aras Kargo', 430.00, 150, false,
   now() - interval '5 days'),
  ('cc000004-0000-0000-0000-000000000004',
   'ECB-2025-0004', 'bb000003-0000-0000-0000-000000000003',
   'aa000001-0000-0000-0000-000000000001', 'PREPARING',
   NULL, NULL, 1300.00, 500, false,
   now() - interval '2 days'),
  ('cc000005-0000-0000-0000-000000000005',
   'ECB-2025-0005', 'bb000004-0000-0000-0000-000000000004',
   'aa000002-0000-0000-0000-000000000002', 'NEW',
   NULL, NULL, 150.00, 50, true,
   now() - interval '1 day'),
  ('cc000006-0000-0000-0000-000000000006',
   'ECB-2025-0006', 'bb000005-0000-0000-0000-000000000005',
   'aa000002-0000-0000-0000-000000000002', 'DELIVERED',
   'YURT345678901', 'Yurtiçi Kargo', 390.00, 150, false,
   now() - interval '45 days'),
  ('cc000007-0000-0000-0000-000000000007',
   'ECB-2025-0007', 'bb000003-0000-0000-0000-000000000003',
   'aa000001-0000-0000-0000-000000000001', 'DELIVERED',
   'PTT111222333', 'PTT Kargo', 780.00, 300, false,
   now() - interval '60 days');

-- =============================================
-- 4. SİPARİŞ KALEMLERİ
-- =============================================
-- Order 1: ECB-2025-0001 (Ayşe Kaya — 2 LT)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000001-0000-0000-0000-000000000001', id, 1, 280.00, 100 FROM products WHERE name = 'EC BOR 2 LT';

-- Order 2: ECB-2025-0002 (Ayşe Kaya — 5 LT)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000002-0000-0000-0000-000000000002', id, 1, 650.00, 250 FROM products WHERE name = 'EC BOR 5 LT';

-- Order 3: ECB-2025-0003 (Hasan Çelik — 1LT + Yaprak Gübre 1LT x2)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000003-0000-0000-0000-000000000003', id, 2, 150.00, 100 FROM products WHERE name = 'EC BOR 1 LT';
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000003-0000-0000-0000-000000000003', id, 1, 85.00, 30 FROM products WHERE name = 'Yaprak Gübre 1 LT';

-- Order 4: ECB-2025-0004 (Fatma Arslan — 5LT x2)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000004-0000-0000-0000-000000000004', id, 2, 650.00, 500 FROM products WHERE name = 'EC BOR 5 LT';

-- Order 5: ECB-2025-0005 (Mustafa Öztürk — 1LT saha satış)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000005-0000-0000-0000-000000000005', id, 1, 150.00, 50 FROM products WHERE name = 'EC BOR 1 LT';

-- Order 6: ECB-2025-0006 (Zeynep Güler — Yaprak Gübre 5LT)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000006-0000-0000-0000-000000000006', id, 1, 390.00, 150 FROM products WHERE name = 'Yaprak Gübre 5 LT';

-- Order 7: ECB-2025-0007 (Fatma Arslan — 5LT + Kök Gel.)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000007-0000-0000-0000-000000000007', id, 1, 650.00, 250 FROM products WHERE name = 'EC BOR 5 LT';
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000007-0000-0000-0000-000000000007', id, 2, 65.00, 40 FROM products WHERE name = 'Kök Geliştirici 500ML';

-- =============================================
-- 5. ETKİLEŞİMLER (Zaman Çizelgesi)
-- =============================================
INSERT INTO interactions (customer_id, engineer_id, date, type, note, next_followup) VALUES
  -- Ayşe Kaya
  ('bb000001-0000-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000001',
   now() - interval '35 days', 'visit',
   'Zeytin bahçesi ziyareti yapıldı. Bor eksikliği belirtileri gözlemlendi. EC BOR 2LT önerildi.',
   now() - interval '21 days'),
  ('bb000001-0000-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000001',
   now() - interval '20 days', 'call',
   'Ürün siparişi verildi. Teslimat takibi yapıldı. Müşteri memnun.',
   now() + interval '14 days'),
  ('bb000001-0000-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000001',
   now() - interval '10 days', 'visit',
   'EC BOR 5LT uygulaması sonrası takip ziyareti. Yaprak rengi düzelmeye başladı. Olumlu sonuçlar.',
   now() + interval '20 days'),

  -- Hasan Çelik
  ('bb000002-0000-0000-0000-000000000002', 'aa000002-0000-0000-0000-000000000002',
   now() - interval '14 days', 'visit',
   'Sera domates kontrolü. Çiçeklenme dönemi iyi. Yaprak gübre + EC BOR kombinasyonu önerildi.',
   now() - interval '7 days'),
  ('bb000002-0000-0000-0000-000000000002', 'aa000002-0000-0000-0000-000000000002',
   now() - interval '7 days', 'call',
   'Sipariş durumu soruldu. Kargo yolda bilgisi verildi. 2-3 gün içinde teslim edilecek.',
   now() + interval '7 days'),

  -- Fatma Arslan
  ('bb000003-0000-0000-0000-000000000003', 'aa000001-0000-0000-0000-000000000001',
   now() - interval '65 days', 'visit',
   'Bayi ziyareti. Hasat sonrası bor takviyesi için 5LT x5 koli sipariş alındı.',
   now() - interval '45 days'),
  ('bb000003-0000-0000-0000-000000000003', 'aa000001-0000-0000-0000-000000000001',
   now() - interval '3 days', 'note',
   'Ekim sezonu öncesi büyük sipariş planlıyor. 5LT x10 koli için fiyat teklifi istedi.',
   now() + interval '5 days'),

  -- Mustafa Öztürk
  ('bb000004-0000-0000-0000-000000000004', 'aa000001-0000-0000-0000-000000000001',
   now() - interval '2 days', 'visit',
   'İlk ziyaret. Bağ alanında bor eksikliği şüphesi. Deneme amaçlı 1LT EC BOR alındı.',
   now() + interval '14 days'),

  -- Zeynep Güler
  ('bb000005-0000-0000-0000-000000000005', 'aa000002-0000-0000-0000-000000000002',
   now() - interval '50 days', 'call',
   'Pamuk döneminde yaprak gübre tavsiyesi. Büyük paket tercih etti.',
   now() - interval '35 days'),
  ('bb000005-0000-0000-0000-000000000005', 'aa000002-0000-0000-0000-000000000002',
   now() - interval '30 days', 'visit',
   'Yaprak gübre 5LT uygulaması takibi. Verim artışı gözlemleniyor. Tekrar sipariş planlanıyor.',
   now() + interval '30 days'),

  -- Elif Şahin
  ('bb000007-0000-0000-0000-000000000007', 'aa000002-0000-0000-0000-000000000002',
   now() - interval '5 days', 'visit',
   'Çilek seracılığı ziyareti. EC BOR ve Kök Geliştirici kombinasyonu için reçete yazıldı.',
   now() + interval '21 days');

-- =============================================
-- 6. REÇETELER
-- =============================================
INSERT INTO prescriptions (id, customer_id, engineer_id, date, diagnosis, usage_days, notes) VALUES
  ('dd000001-0000-0000-0000-000000000001',
   'bb000001-0000-0000-0000-000000000001',
   'aa000001-0000-0000-0000-000000000001',
   CURRENT_DATE - 35, 'Bor eksikliği (Boron Deficiency) — yaprak uçlarında yanma, meyvede kabuklaşma',
   21, 'Sabah erken saatlerde, yaprak ıslanmadan önce uygulayın. Rüzgarlı havada uygulamayın.'),
  ('dd000002-0000-0000-0000-000000000002',
   'bb000002-0000-0000-0000-000000000002',
   'aa000002-0000-0000-0000-000000000002',
   CURRENT_DATE - 14, 'Çiçeklenme dönemi besin desteği — meyve tutumunu artırmak için',
   14, 'Sabahları sulama ile birlikte verilmesi önerilir.'),
  ('dd000003-0000-0000-0000-000000000003',
   'bb000007-0000-0000-0000-000000000007',
   'aa000002-0000-0000-0000-000000000002',
   CURRENT_DATE - 5, 'Çilek meyvelenme dönemi — kök ve yaprak gelişimi desteği',
   14, 'EC BOR + Kök Geliştirici kombinasyonu. Haftada 2 uygulama.'),
  ('dd000004-0000-0000-0000-000000000004',
   'bb000006-0000-0000-0000-000000000006',
   'aa000001-0000-0000-0000-000000000001',
   CURRENT_DATE - 10, 'Fındık iç dolumu dönemi bor takviyesi',
   30, 'Ağustos ayı boyunca EC BOR 5LT ile yaprak gübrelemesi yapılacak.');

-- Reçete kalemleri
INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
SELECT 'dd000001-0000-0000-0000-000000000001', id, 2, 'LT',
       '100 lt suya 200ml karıştırarak yapraktan uygulayın', CURRENT_DATE - 35
FROM products WHERE name = 'EC BOR 2 LT';

INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
SELECT 'dd000002-0000-0000-0000-000000000002', id, 1, 'LT',
       '200 lt suya 1LT karıştırın, 7 günde bir uygulayın', CURRENT_DATE - 14
FROM products WHERE name = 'EC BOR 1 LT';

INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
SELECT 'dd000002-0000-0000-0000-000000000002', id, 1, 'LT',
       'Sabah sulama suyu ile verin, damla sulama sistemi', CURRENT_DATE - 14
FROM products WHERE name = 'Yaprak Gübre 1 LT';

INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
SELECT 'dd000003-0000-0000-0000-000000000003', id, 1, 'LT',
       '50 lt suya 100ml karıştır, haftada 2 kez uygula', CURRENT_DATE - 5
FROM products WHERE name = 'EC BOR 1 LT';

INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
SELECT 'dd000003-0000-0000-0000-000000000003', id, 2, 'ML',
       'Direk kök bölgesine damlatma ile ver', CURRENT_DATE - 5
FROM products WHERE name = 'Kök Geliştirici 500ML';

INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
SELECT 'dd000004-0000-0000-0000-000000000004', id, 1, 'LT',
       '300 lt suya 1LT, 10 günde bir yaprak uygulaması', CURRENT_DATE - 10
FROM products WHERE name = 'EC BOR 5 LT';

-- =============================================
-- 7. DEPO ENVANTERİ
-- =============================================
INSERT INTO inventory (product_id, quantity, min_stock)
SELECT id,
  CASE name
    WHEN 'EC BOR 1 LT'         THEN 150
    WHEN 'EC BOR 2 LT'         THEN 80
    WHEN 'EC BOR 5 LT'         THEN 45
    WHEN 'Yaprak Gübre 1 LT'   THEN 120
    WHEN 'Yaprak Gübre 5 LT'   THEN 35
    WHEN 'Kök Geliştirici 500ML' THEN 60
  END,
  CASE name
    WHEN 'EC BOR 1 LT'         THEN 20
    WHEN 'EC BOR 2 LT'         THEN 15
    WHEN 'EC BOR 5 LT'         THEN 10
    WHEN 'Yaprak Gübre 1 LT'   THEN 20
    WHEN 'Yaprak Gübre 5 LT'   THEN 8
    WHEN 'Kök Geliştirici 500ML' THEN 10
  END
FROM products
ON CONFLICT (product_id) DO UPDATE
  SET quantity = EXCLUDED.quantity, min_stock = EXCLUDED.min_stock;

-- =============================================
-- 8. MÜHENDİS ARAÇ STOĞU
-- =============================================
INSERT INTO engineer_inventory (engineer_id, product_id, quantity)
SELECT 'aa000001-0000-0000-0000-000000000001', id,
  CASE name
    WHEN 'EC BOR 1 LT'         THEN 12
    WHEN 'EC BOR 2 LT'         THEN 6
    WHEN 'EC BOR 5 LT'         THEN 4
    WHEN 'Yaprak Gübre 1 LT'   THEN 8
    WHEN 'Kök Geliştirici 500ML' THEN 5
    ELSE 0
  END
FROM products
ON CONFLICT (engineer_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

INSERT INTO engineer_inventory (engineer_id, product_id, quantity)
SELECT 'aa000002-0000-0000-0000-000000000002', id,
  CASE name
    WHEN 'EC BOR 1 LT'         THEN 8
    WHEN 'EC BOR 2 LT'         THEN 4
    WHEN 'EC BOR 5 LT'         THEN 2
    WHEN 'Yaprak Gübre 5 LT'   THEN 3
    WHEN 'Kök Geliştirici 500ML' THEN 4
    ELSE 0
  END
FROM products
ON CONFLICT (engineer_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

-- =============================================
-- 9. GÖREVLER
-- =============================================
INSERT INTO tasks (assigned_to, assigned_by, customer_id, title, description, type, status, due_date) VALUES
  -- Mehmet Yılmaz (mühendis) görevleri
  ('aa000001-0000-0000-0000-000000000001',
   (SELECT id FROM users WHERE phone = '05001234567'),
   'bb000001-0000-0000-0000-000000000001',
   'Ayşe Kaya — Hasat öncesi kontrol ziyareti',
   'Zeytin hasadından 3 hafta önce son EC BOR uygulaması. Yaprak örneği alınacak.',
   'visit', 'pending', CURRENT_DATE + 14),
  ('aa000001-0000-0000-0000-000000000001',
   (SELECT id FROM users WHERE phone = '05001234567'),
   'bb000004-0000-0000-0000-000000000004',
   'Mustafa Öztürk — Deneme ürün takibi',
   'EC BOR 1LT deneme uygulaması sonuçlarını değerlendir. Olumlu ise büyük sipariş alınacak.',
   'visit', 'pending', CURRENT_DATE + 7),
  ('aa000001-0000-0000-0000-000000000001',
   (SELECT id FROM users WHERE phone = '05001234567'),
   'bb000006-0000-0000-0000-000000000006',
   'İbrahim Koç — Fındık reçete takibi',
   'Reçete başlangıcından 10 gün sonra kontrol. Yaprak rengi ve gelişim gözlemlenecek.',
   'visit', 'in_progress', CURRENT_DATE + 3),
  -- Ali Demir (saha temsilcisi) görevleri
  ('aa000002-0000-0000-0000-000000000002',
   (SELECT id FROM users WHERE phone = '05001234567'),
   'bb000005-0000-0000-0000-000000000005',
   'Zeynep Güler — Yeni sezon teklifi',
   'Pamuk sezonu öncesi EC BOR + Yaprak Gübre kombo paketi sunulacak. Fiyat teklifi hazırlanacak.',
   'call', 'pending', CURRENT_DATE + 2),
  ('aa000002-0000-0000-0000-000000000002',
   (SELECT id FROM users WHERE phone = '05001234567'),
   'bb000007-0000-0000-0000-000000000007',
   'Elif Şahin — Reçete uygulaması kontrolü',
   'Çilek reçetesi 7. gün kontrolü. EC BOR + Kök Geliştirici etkisini gözlemle.',
   'visit', 'pending', CURRENT_DATE + 2),
  ('aa000002-0000-0000-0000-000000000002',
   (SELECT id FROM users WHERE phone = '05001234567'),
   'bb000002-0000-0000-0000-000000000002',
   'Hasan Çelik — Sipariş teslim takibi',
   'ECB-2025-0003 nolu sipariş teslim edildi mi kontrol et. Müşteri memnuniyetini sor.',
   'call', 'done', CURRENT_DATE - 1);

-- =============================================
-- 10. BİLDİRİMLER
-- =============================================
INSERT INTO notifications (user_id, customer_id, type, title, body, is_read, trigger_date) VALUES
  -- Mehmet Yılmaz bildirimleri
  ('aa000001-0000-0000-0000-000000000001',
   'bb000001-0000-0000-0000-000000000001',
   'followup', 'Takip Zamanı: Ayşe Kaya',
   'Ayşe Kaya için 14 günlük takip randevusu yaklaşıyor.',
   false, CURRENT_DATE + 14),
  ('aa000001-0000-0000-0000-000000000001',
   'bb000006-0000-0000-0000-000000000006',
   'crop_season', 'Fındık Hasat Dönemi Başlıyor',
   'İbrahim Koç fındık bahçesi için hasat öncesi bor takviyesi zamanı.',
   false, CURRENT_DATE + 5),
  ('aa000001-0000-0000-0000-000000000001', NULL,
   'general', 'Yeni Sipariş: ECB-2025-0004',
   'Fatma Arslan 1.300₺ tutarında yeni sipariş oluşturdu.',
   true, CURRENT_DATE - 2),
  -- Ali Demir bildirimleri
  ('aa000002-0000-0000-0000-000000000002',
   'bb000005-0000-0000-0000-000000000005',
   'crop_season', 'Pamuk Ekim Sezonu Yaklaşıyor',
   'Zeynep Güler için pamuk ekim öncesi yaprak gübre teklifi yapılmalı.',
   false, CURRENT_DATE + 2),
  ('aa000002-0000-0000-0000-000000000002', NULL,
   'task', 'Görev Hatırlatıcı: Elif Şahin Kontrolü',
   'Elif Şahin çilek reçetesi 7. gün kontrolü yarın yapılmalı.',
   false, CURRENT_DATE + 1),
  -- Admin bildirimleri
  ((SELECT id FROM users WHERE phone = '05001234567'), NULL,
   'general', 'Komisyon Onayı Bekliyor',
   '2 adet komisyon onayı bekliyor. Admin panelinden inceleyiniz.',
   false, CURRENT_DATE),
  ((SELECT id FROM users WHERE phone = '05001234567'), NULL,
   'product_expiry', 'Düşük Stok Uyarısı',
   'EC BOR 5 LT stoğu kritik seviyeye yaklaşıyor (45 adet). Sipariş verilmesi önerilir.',
   false, CURRENT_DATE);

-- =============================================
-- 11. PUAN KAYITLARI (reward_logs — trigger total_points günceller)
-- =============================================
-- Ayşe Kaya (bb000001): 100 + 250 = 350 puan
INSERT INTO reward_logs (customer_id, order_id, type, points, description) VALUES
  ('bb000001-0000-0000-0000-000000000001',
   'cc000001-0000-0000-0000-000000000001',
   'earn', 100, 'ECB-2025-0001 siparişi — EC BOR 2LT'),
  ('bb000001-0000-0000-0000-000000000001',
   'cc000002-0000-0000-0000-000000000002',
   'earn', 250, 'ECB-2025-0002 siparişi — EC BOR 5LT');

-- Hasan Çelik (bb000002): 130 puan
INSERT INTO reward_logs (customer_id, order_id, type, points, description) VALUES
  ('bb000002-0000-0000-0000-000000000002',
   'cc000003-0000-0000-0000-000000000003',
   'earn', 130, 'ECB-2025-0003 siparişi — EC BOR 1LT x2 + Yaprak Gübre 1LT');

-- Fatma Arslan (bb000003): 300 + 500 = 800 puan (bayi)
INSERT INTO reward_logs (customer_id, order_id, type, points, description) VALUES
  ('bb000003-0000-0000-0000-000000000003',
   'cc000007-0000-0000-0000-000000000007',
   'earn', 300, 'ECB-2025-0007 siparişi — EC BOR 5LT + Kök Geliştirici'),
  ('bb000003-0000-0000-0000-000000000003',
   'cc000004-0000-0000-0000-000000000004',
   'earn', 500, 'ECB-2025-0004 siparişi — EC BOR 5LT x2');

-- Zeynep Güler (bb000005): 150 puan
INSERT INTO reward_logs (customer_id, order_id, type, points, description) VALUES
  ('bb000005-0000-0000-0000-000000000005',
   'cc000006-0000-0000-0000-000000000006',
   'earn', 150, 'ECB-2025-0006 siparişi — Yaprak Gübre 5LT');

-- =============================================
-- 12. KOMİSYONLAR (Saha Temsilcisi)
-- =============================================
INSERT INTO commissions (agent_id, order_id, amount, rate, status) VALUES
  ('aa000002-0000-0000-0000-000000000002',
   'cc000003-0000-0000-0000-000000000003',
   21.50, 5.00, 'pending'),
  ('aa000002-0000-0000-0000-000000000002',
   'cc000005-0000-0000-0000-000000000005',
   7.50, 5.00, 'pending'),
  ('aa000002-0000-0000-0000-000000000002',
   'cc000006-0000-0000-0000-000000000006',
   19.50, 5.00, 'approved');

-- =============================================
-- ÖZET
-- =============================================
-- Demo Hesapları (şifre: demo2026)
-- CRM Girişi (/giris):   05001234561 (Mehmet Yılmaz — Mühendis)
--                        05001234562 (Ali Demir — Saha Temsilcisi)
-- Admin Girişi (/giris): 05001234567 (mevcut admin — ecobor2026)
-- Puan Paneli (/puan):   05001234563 (Ayşe Kaya — 350 puan)
--                        05001234564 (Hasan Çelik — 130 puan)
--                        05001234565 (Fatma Arslan — 800 puan)
