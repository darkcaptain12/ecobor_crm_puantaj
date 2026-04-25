-- =============================================
-- ECOBOR CRM — Ek Demo Verisi (seed_demo.sql'den sonra çalıştır)
-- Her sayfa için veri doldurur
-- =============================================

-- =============================================
-- EK MÜŞTERİLER — Tüm bölgeler için
-- =============================================
INSERT INTO customers (id, name, phone, region, crop_type, planting_date, status, assigned_to, notes)
VALUES
  ('bb000008-0000-0000-0000-000000000008', 'Ahmet Yıldırım', '05381234571', 'Ege', 'Zeytin',
   CURRENT_DATE - 45,  -- 45 gün önce ekildi → aktif dönem tetiklemek için
   'active', 'aa000001-0000-0000-0000-000000000001', 'İzmir Tire, zeytin — çiçeklenme öncesi dönemde'),
  ('bb000009-0000-0000-0000-000000000009', 'Kemal Aksoy', '05391234572', 'Marmara', 'Üzüm',
   CURRENT_DATE - 62,  -- 62 gün → üzüm çiçeklenme dönemi
   'active', 'aa000002-0000-0000-0000-000000000002', 'Tekirdağ Şarköy, bağ'),
  ('bb000010-0000-0000-0000-000000000010', 'Hatice Polat', '05401234573', 'İç Anadolu', 'Buğday',
   CURRENT_DATE - 50,  -- 50 gün → buğday kardeşlenme kritik
   'active', 'aa000001-0000-0000-0000-000000000001', 'Konya Karatay, 300 dönüm'),
  ('bb000011-0000-0000-0000-000000000011', 'Recep Bozkurt', '05411234574', 'Akdeniz', 'Pamuk',
   CURRENT_DATE - 48,  -- 48 gün → pamuk çiçeklenme öncesi
   'new', 'aa000002-0000-0000-0000-000000000002', 'Mersin Tarsus, yeni müşteri'),
  ('bb000012-0000-0000-0000-000000000012', 'Sevgi Tekin', '05421234575', 'Karadeniz', 'Fındık',
   CURRENT_DATE - 70,  -- 70 gün → fındık iç dolumu dönemi
   'active', 'aa000001-0000-0000-0000-000000000001', 'Giresun Bulancak, 60 dönüm fındık'),
  ('bb000013-0000-0000-0000-000000000013', 'Orhan Çınar', '05431234576', 'Ege', 'Domates',
   CURRENT_DATE - 35,  -- 35 gün → domates çiçeklenme dönemi
   'active', 'aa000002-0000-0000-0000-000000000002', 'İzmir Seferihisar, sera domatesi'),
  ('bb000014-0000-0000-0000-000000000014', 'Leyla Karaman', '05441234577', 'Marmara', 'Çilek',
   CURRENT_DATE - 12,  -- 12 gün → çilek tutma dönemi
   'new', 'aa000001-0000-0000-0000-000000000001', 'Bursa Karacabey, çilek sera')
ON CONFLICT (phone) DO NOTHING;

-- =============================================
-- EK SİPARİŞLER
-- =============================================
INSERT INTO orders (id, order_number, customer_id, engineer_id, status,
  tracking_code, shipment_company, total_amount, total_points, is_field_sale, created_at)
VALUES
  ('cc000008-0000-0000-0000-000000000008', 'ECB-2025-0008',
   'bb000008-0000-0000-0000-000000000008', 'aa000001-0000-0000-0000-000000000001',
   'DELIVERED', 'MNG111222333', 'MNG Kargo', 300.00, 100, false, now() - interval '20 days'),
  ('cc000009-0000-0000-0000-000000000009', 'ECB-2025-0009',
   'bb000009-0000-0000-0000-000000000009', 'aa000002-0000-0000-0000-000000000002',
   'DELIVERED', 'PTT444555666', 'PTT Kargo', 560.00, 200, false, now() - interval '35 days'),
  ('cc000010-0000-0000-0000-000000000010', 'ECB-2025-0010',
   'bb000010-0000-0000-0000-000000000010', 'aa000001-0000-0000-0000-000000000001',
   'SHIPPED', 'ARAS789012345', 'Aras Kargo', 450.00, 170, false, now() - interval '3 days'),
  ('cc000011-0000-0000-0000-000000000011', 'ECB-2025-0011',
   'bb000012-0000-0000-0000-000000000012', 'aa000001-0000-0000-0000-000000000001',
   'PREPARING', NULL, NULL, 650.00, 250, false, now() - interval '1 day'),
  ('cc000012-0000-0000-0000-000000000012', 'ECB-2025-0012',
   'bb000013-0000-0000-0000-000000000013', 'aa000002-0000-0000-0000-000000000002',
   'NEW', NULL, NULL, 235.00, 80, true, now()),
  -- Geçmiş siparişler (grafik için)
  ('cc000013-0000-0000-0000-000000000013', 'ECB-2024-0050',
   'bb000003-0000-0000-0000-000000000003', 'aa000001-0000-0000-0000-000000000001',
   'DELIVERED', 'PTT000111222', 'PTT Kargo', 1950.00, 750, false, now() - interval '90 days'),
  ('cc000014-0000-0000-0000-000000000014', 'ECB-2024-0049',
   'bb000005-0000-0000-0000-000000000005', 'aa000002-0000-0000-0000-000000000002',
   'DELIVERED', 'MNG333444555', 'MNG Kargo', 780.00, 300, false, now() - interval '75 days'),
  ('cc000015-0000-0000-0000-000000000015', 'ECB-2024-0048',
   'bb000001-0000-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000001',
   'DELIVERED', 'YURT666777888', 'Yurtiçi Kargo', 430.00, 150, false, now() - interval '60 days');

-- Sipariş kalemleri
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000008-0000-0000-0000-000000000008', id, 1, 280.00, 100 FROM products WHERE name = 'EC BOR 2 LT';

INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000009-0000-0000-0000-000000000009', id, 1, 280.00, 100 FROM products WHERE name = 'EC BOR 2 LT';
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000009-0000-0000-0000-000000000009', id, 1, 280.00, 100 FROM products WHERE name = 'EC BOR 2 LT';

INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000010-0000-0000-0000-000000000010', id, 1, 390.00, 150 FROM products WHERE name = 'Yaprak Gübre 5 LT';
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000010-0000-0000-0000-000000000010', id, 1, 65.00, 20 FROM products WHERE name = 'Kök Geliştirici 500ML';

INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000011-0000-0000-0000-000000000011', id, 1, 650.00, 250 FROM products WHERE name = 'EC BOR 5 LT';

INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000012-0000-0000-0000-000000000012', id, 1, 150.00, 50 FROM products WHERE name = 'EC BOR 1 LT';
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000012-0000-0000-0000-000000000012', id, 1, 85.00, 30 FROM products WHERE name = 'Yaprak Gübre 1 LT';

INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000013-0000-0000-0000-000000000013', id, 3, 650.00, 750 FROM products WHERE name = 'EC BOR 5 LT';

INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000014-0000-0000-0000-000000000014', id, 2, 390.00, 300 FROM products WHERE name = 'Yaprak Gübre 5 LT';

INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000015-0000-0000-0000-000000000015', id, 1, 280.00, 100 FROM products WHERE name = 'EC BOR 2 LT';
INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
SELECT 'cc000015-0000-0000-0000-000000000015', id, 1, 150.00, 50 FROM products WHERE name = 'EC BOR 1 LT';

-- =============================================
-- EK ETKİLEŞİMLER
-- =============================================
INSERT INTO interactions (customer_id, engineer_id, date, type, note, next_followup) VALUES
  ('bb000008-0000-0000-0000-000000000008', 'aa000001-0000-0000-0000-000000000001',
   now() - interval '22 days', 'visit',
   'Zeytin bahçesi ilk ziyaret. Bor eksikliği belirtileri var. EC BOR 2LT önerildi.',
   now() + interval '8 days'),
  ('bb000009-0000-0000-0000-000000000009', 'aa000002-0000-0000-0000-000000000002',
   now() - interval '40 days', 'visit',
   'Üzüm bağı ziyareti. Salkım tutumu için EC BOR kritik dönemde.',
   now() + interval '3 days'),
  ('bb000010-0000-0000-0000-000000000010', 'aa000001-0000-0000-0000-000000000001',
   now() - interval '8 days', 'call',
   'Buğday kardeşlenme dönemi bilgilendirme. EC BOR + Yaprak Gübre sipariş alındı.',
   now() + interval '15 days'),
  ('bb000011-0000-0000-0000-000000000011', 'aa000002-0000-0000-0000-000000000002',
   now() - interval '3 days', 'visit',
   'Pamuk ilk ziyaret. Çiçeklenme öncesi dönem. Ürün tavsiyesi yapıldı.',
   now() + interval '10 days'),
  ('bb000012-0000-0000-0000-000000000012', 'aa000001-0000-0000-0000-000000000001',
   now() - interval '15 days', 'visit',
   'Fındık iç dolumu kritik dönem. EC BOR 5LT hemen uygulanmalı.',
   now() + interval '5 days'),
  ('bb000013-0000-0000-0000-000000000013', 'aa000002-0000-0000-0000-000000000002',
   now() - interval '6 days', 'visit',
   'Sera domates çiçeklenme kontrolü. Saha satış 1LT + Yaprak Gübre yapıldı.',
   now() + interval '7 days'),
  ('bb000014-0000-0000-0000-000000000014', 'aa000001-0000-0000-0000-000000000001',
   now() - interval '1 day', 'visit',
   'Çilek fide tutma dönemi. Kök Geliştirici uygulaması başlatıldı.',
   now() + interval '7 days');

-- =============================================
-- EK REÇETELER
-- =============================================
INSERT INTO prescriptions (id, customer_id, engineer_id, date, diagnosis, usage_days, notes)
VALUES
  ('dd000005-0000-0000-0000-000000000005',
   'bb000008-0000-0000-0000-000000000008', 'aa000001-0000-0000-0000-000000000001',
   CURRENT_DATE - 20, 'Zeytin çiçeklenme öncesi bor takviyesi', 21,
   'Sabah erken uygulama, 100L suya 200ml EC BOR.'),
  ('dd000006-0000-0000-0000-000000000006',
   'bb000012-0000-0000-0000-000000000012', 'aa000001-0000-0000-0000-000000000001',
   CURRENT_DATE - 12, 'Fındık iç dolumu — kritik bor dönemi', 30,
   'Haftada 2 uygulama. 300L suya 1LT EC BOR.'),
  ('dd000007-0000-0000-0000-000000000007',
   'bb000013-0000-0000-0000-000000000013', 'aa000002-0000-0000-0000-000000000002',
   CURRENT_DATE - 5, 'Domates çiçeklenme dönemi — meyve tutumu', 14,
   'Damla sulama ile EC BOR + Yaprak Gübre kombinasyonu.'),
  ('dd000008-0000-0000-0000-000000000008',
   'bb000014-0000-0000-0000-000000000014', 'aa000001-0000-0000-0000-000000000001',
   CURRENT_DATE - 1, 'Çilek fide tutma — kök gelişimi', 10,
   'Kök Geliştirici direkt kök bölgesine. EC BOR yapraktan.');

INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
SELECT 'dd000005-0000-0000-0000-000000000005', id, 2, 'LT',
       '100L suya 200ml karıştır, yapraktan uygula', CURRENT_DATE - 20
FROM products WHERE name = 'EC BOR 2 LT';

INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
SELECT 'dd000006-0000-0000-0000-000000000006', id, 1, 'LT',
       '300L suya 1LT EC BOR, haftada 2 kez', CURRENT_DATE - 12
FROM products WHERE name = 'EC BOR 5 LT';

INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
SELECT 'dd000007-0000-0000-0000-000000000007', id, 1, 'LT',
       'Damla sulama ile sabah ver', CURRENT_DATE - 5
FROM products WHERE name = 'EC BOR 1 LT';
INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
SELECT 'dd000007-0000-0000-0000-000000000007', id, 1, 'LT',
       'Yapraktan sprey uygulama', CURRENT_DATE - 5
FROM products WHERE name = 'Yaprak Gübre 1 LT';

INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
SELECT 'dd000008-0000-0000-0000-000000000008', id, 2, 'ML',
       'Kök bölgesine damlatma, günde 1 kez', CURRENT_DATE - 1
FROM products WHERE name = 'Kök Geliştirici 500ML';
INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
SELECT 'dd000008-0000-0000-0000-000000000008', id, 1, 'LT',
       '50L suya 100ml, haftada 2 kez yapraktan', CURRENT_DATE - 1
FROM products WHERE name = 'EC BOR 1 LT';

-- =============================================
-- EK GÖREVLER
-- =============================================
INSERT INTO tasks (assigned_to, assigned_by, customer_id, title, description, type, status, due_date)
VALUES
  ('aa000001-0000-0000-0000-000000000001',
   (SELECT id FROM users WHERE phone = '05001234567'),
   'bb000012-0000-0000-0000-000000000012',
   'Sevgi Tekin — Fındık kritik dönem ziyareti',
   'İç dolum dönemi başladı. EC BOR 5LT mutlaka uygulanmalı.',
   'visit', 'in_progress', CURRENT_DATE + 1),
  ('aa000001-0000-0000-0000-000000000001',
   (SELECT id FROM users WHERE phone = '05001234567'),
   'bb000010-0000-0000-0000-000000000010',
   'Hatice Polat — Buğday reçete kontrolü',
   'Kardeşlenme dönemi reçetesi 10. günü kontrol.',
   'visit', 'pending', CURRENT_DATE + 4),
  ('aa000002-0000-0000-0000-000000000002',
   (SELECT id FROM users WHERE phone = '05001234567'),
   'bb000011-0000-0000-0000-000000000011',
   'Recep Bozkurt — Pamuk teklif görüşmesi',
   'Yeni müşteri. Çiçeklenme öncesi EC BOR paketi sun.',
   'visit', 'pending', CURRENT_DATE + 3),
  ('aa000002-0000-0000-0000-000000000002',
   (SELECT id FROM users WHERE phone = '05001234567'),
   'bb000009-0000-0000-0000-000000000009',
   'Kemal Aksoy — Üzüm çiçeklenme takibi',
   'Salkım tutumu kritik dönem. EC BOR uygulamasını kontrol et.',
   'visit', 'in_progress', CURRENT_DATE),
  ('aa000001-0000-0000-0000-000000000001',
   (SELECT id FROM users WHERE phone = '05001234567'),
   NULL,
   'Aylık satış raporu gönder',
   'Nisan ayı satış özeti admin panelinden çıkar ve e-posta gönder.',
   'note', 'pending', CURRENT_DATE + 5),
  ('aa000002-0000-0000-0000-000000000002',
   (SELECT id FROM users WHERE phone = '05001234567'),
   'bb000013-0000-0000-0000-000000000013',
   'Orhan Çınar — Saha satış tamamlandı',
   'ECB-2025-0012 saha satışı yapıldı. Teslim onayı alındı.',
   'visit', 'done', CURRENT_DATE - 1);

-- =============================================
-- EK BİLDİRİMLER
-- =============================================
INSERT INTO notifications (user_id, customer_id, type, title, body, is_read, trigger_date)
VALUES
  -- Mühendis alarmları
  ('aa000001-0000-0000-0000-000000000001',
   'bb000012-0000-0000-0000-000000000012',
   'crop_season', 'Kritik Dönem: Sevgi Tekin Fındık',
   'Fındık iç dolumu kritik dönemde (gün 70). EC BOR 5LT hemen uygulanmalı.',
   false, CURRENT_DATE),
  ('aa000001-0000-0000-0000-000000000001',
   'bb000010-0000-0000-0000-000000000010',
   'crop_season', 'Buğday Kardeşlenme: Hatice Polat',
   'Buğday ekiminin 50. günü — kardeşlenme dönemi başladı. EC BOR uygulaması önerilir.',
   false, CURRENT_DATE),
  ('aa000002-0000-0000-0000-000000000002',
   'bb000009-0000-0000-0000-000000000009',
   'crop_season', 'Üzüm Çiçeklenme: Kemal Aksoy',
   'Üzüm ekiminin 62. günü — salkım tutumu için EC BOR kritik.',
   false, CURRENT_DATE),
  -- Admin bildirimleri
  ((SELECT id FROM users WHERE phone = '05001234567'), NULL,
   'general', 'Yeni Saha Satışı Oluşturuldu',
   'Ali Demir ECB-2025-0012 saha satışını tamamladı. Komisyon onayı bekliyor.',
   false, CURRENT_DATE),
  ((SELECT id FROM users WHERE phone = '05001234567'), NULL,
   'general', 'Sipariş Kargo: ECB-2025-0010',
   'Hatice Polat siparişi Aras Kargo ile gönderildi.',
   true, CURRENT_DATE - 3);

-- =============================================
-- EK PUAN KAYITLARI
-- =============================================
INSERT INTO reward_logs (customer_id, order_id, type, points, description)
VALUES
  ('bb000008-0000-0000-0000-000000000008',
   'cc000008-0000-0000-0000-000000000008',
   'earn', 100, 'ECB-2025-0008 siparişi — EC BOR 2LT'),
  ('bb000009-0000-0000-0000-000000000009',
   'cc000009-0000-0000-0000-000000000009',
   'earn', 200, 'ECB-2025-0009 siparişi — EC BOR 2LT x2'),
  ('bb000003-0000-0000-0000-000000000003',
   'cc000013-0000-0000-0000-000000000013',
   'earn', 750, 'ECB-2024-0050 siparişi — EC BOR 5LT x3'),
  -- Ödül kullanımı (Fatma Arslan Bronz ödül)
  ('bb000003-0000-0000-0000-000000000003', NULL,
   'redeem', -1000,
   'Bronz Ödül kullanıldı — 1LT EC BOR ödülü alındı');

-- =============================================
-- EK KOMİSYONLAR
-- =============================================
INSERT INTO commissions (agent_id, order_id, amount, rate, status)
VALUES
  ('aa000002-0000-0000-0000-000000000002',
   'cc000009-0000-0000-0000-000000000009',
   28.00, 5.00, 'approved'),
  ('aa000002-0000-0000-0000-000000000002',
   'cc000012-0000-0000-0000-000000000012',
   11.75, 5.00, 'pending'),
  ('aa000001-0000-0000-0000-000000000001',
   'cc000010-0000-0000-0000-000000000010',
   22.50, 5.00, 'pending'),
  ('aa000001-0000-0000-0000-000000000001',
   'cc000008-0000-0000-0000-000000000008',
   15.00, 5.00, 'approved');

-- =============================================
-- ÖZET
-- =============================================
-- Dönemsel alarm tetikleyen müşteriler (bugün aktif):
-- Ahmet Yıldırım (Zeytin, 45g) → Çiçeklenme Öncesi dönemi [kritik]
-- Kemal Aksoy    (Üzüm, 62g)  → Çiçeklenme dönemi [kritik]
-- Hatice Polat   (Buğday,50g) → Kardeşlenme dönemi [kritik]
-- Recep Bozkurt  (Pamuk, 48g) → Çiçeklenme Öncesi dönemi [kritik]
-- Sevgi Tekin    (Fındık,70g) → İç Dolumu dönemi [kritik]
-- Orhan Çınar    (Domates,35g)→ Çiçeklenme dönemi [kritik]
-- Leyla Karaman  (Çilek,12g)  → Tutma Dönemi [kritik]
