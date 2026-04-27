-- =====================================================
-- Buse Mühendisi + 25 Demo Müşteri
-- Supabase SQL Editor'da çalıştırın
-- ⚠️ Gerçek Excel verisi bu dosyada YOKTUR
-- migration_buse_import.sql'i önce çalıştırın
-- =====================================================

DO $$
DECLARE
  buse_id UUID;
BEGIN
  -- Buse kullanıcısı var mı kontrol et
  SELECT id INTO buse_id FROM users WHERE phone = '05539456267';

  IF buse_id IS NULL THEN
    RAISE EXCEPTION 'Buse kullanıcısı bulunamadı. Önce admin panelinden Buse''yi ekleyin (telefon: 05539456267, şifre: ecobor2026, rol: Mühendis).';
  END IF;

  -- Mevcut demo müşterileri temizle (yeniden çalıştırma güvenliği)
  DELETE FROM customers WHERE assigned_to = buse_id;

  -- 25 demo müşteri ekle
  INSERT INTO customers (name, phone, region, crop_type, status, source, sales_status, previous_sales_amount, notes, assigned_to, total_points, created_at) VALUES

  -- YENİ MÜŞTERİLER (7)
  ('Mehmet Yılmaz',     '05411134035', 'İzmir',    'Zeytin, Domates',     'yeni',       'Reklam',          'fiyat bilgisi verildi',  NULL,    'Genel bilgilendirme yapıldı', buse_id, 500, '2025-02-10'),
  ('Fatma Kaya',        '05322847561', 'Manisa',   'Üzüm',                'yeni',       'Tavsiye',         'almayı düşünüyor',       NULL,    'Arkadaş tavsiyesiyle aradı',  buse_id, 500, '2025-03-05'),
  ('Ali Demir',         '05533791737', 'Mersin',   'Armut, Narenciye',    'yeni',       'Reklam',          'ürün bilgisi verildi',   NULL,    NULL,                          buse_id, 500, '2025-03-18'),
  ('Zeynep Arslan',     '05458923614', 'Antalya',  'Domates, Biber',      'yeni',       'Doğrudan/Saha',   'tekrar aranacak',        NULL,    'Sahada tanışıldı',            buse_id, 500, '2025-04-01'),
  ('Hasan Çelik',       '05374512896', 'Balıkesir','Zeytin',              'yeni',       'Reklam',          'açmadı',                 NULL,    NULL,                          buse_id, 500, '2025-04-10'),
  ('Emine Şahin',       '05063284751', 'Aydın',    'Pamuk, Domates',      'yeni',       'Tavsiye',         'fiyat bilgisi verildi',  NULL,    'Komşunun tavsiyesiyle',       buse_id, 500, '2025-04-15'),
  ('Murat Özdemir',     '05512367498', 'İstanbul', 'Bahçe Bitkileri',     'yeni',       'Reklam',          'almayı düşünüyor',       NULL,    NULL,                          buse_id, 500, '2025-05-02'),

  -- ESKİ MÜŞTERİLER (6)
  ('Ayşe Doğan',        '05423187546', 'Bursa',    'Buğday, Mısır',       'eski',       'Tavsiye',         'satın aldı',             1250.00, 'Geçen sezon alım yaptı',      buse_id, 500, '2024-06-12'),
  ('İbrahim Yıldız',    '05316748923', 'Konya',    'Buğday, Arpa',        'eski',       'Doğrudan/Saha',   'satın aldı',             3400.00, NULL,                          buse_id, 500, '2024-07-08'),
  ('Gülşen Aydın',      '05547892134', 'Çanakkale','Zeytin, Üzüm',        'eski',       'Reklam',          'elinde mevcut',          890.00,  'Her sezon alıyor',            buse_id, 500, '2024-08-20'),
  ('Serkan Koçak',      '05234678912', 'Afyon',    'Haşhaş, Buğday',      'eski',       'Tavsiye',         'satın aldı',             2100.00, NULL,                          buse_id, 500, '2024-09-03'),
  ('Nuray Güneş',       '05678234519', 'Manisa',   'Üzüm, Zeytin',        'eski',       'Reklam',          'elinde mevcut',          1680.00, 'Düzenli müşteri',             buse_id, 500, '2024-10-14'),
  ('Kemal Korkmaz',     '05345612871', 'İzmir',    'Domates, Çilek',      'eski',       'Doğrudan/Saha',   'tekrar aranacak',        NULL,    NULL,                          buse_id, 500, '2024-11-22'),

  -- ÖNEMLİ MÜŞTERİLER (6)
  ('Mustafa Kaplan',    '05412987634', 'Ankara',   'Elma, Armut',         'onemli',     'Tavsiye',         'satın aldı',             5800.00, 'Büyük bahçe, düzenli alıcı',  buse_id, 500, '2024-05-17'),
  ('Seda Çiftçi',       '05567348912', 'Antalya',  'Narenciye, Limon',    'onemli',     'Reklam',          'satın aldı',             4200.00, 'Toplu sipariş veriyor',       buse_id, 500, '2024-06-29'),
  ('Hüseyin Karabıyık', '05298347651', 'Adana',    'Pamuk, Mısır',        'onemli',     'Doğrudan/Saha',   'satın alacak',           7500.00, '500 dönüm arazi',             buse_id, 500, '2024-07-15'),
  ('Leyla Arslan',      '05134892745', 'İzmir',    'Zeytin, Üzüm',        'onemli',     'Tavsiye',         'satın aldı',             3100.00, NULL,                          buse_id, 500, '2024-08-04'),
  ('Ahmet Demirci',     '05612389457', 'Balıkesir','Zeytin',               'onemli',     'Reklam',          'saha ziyareti',          2900.00, 'Zeytinlik sahibi, büyük',     buse_id, 500, '2024-09-11'),
  ('Özlem Yıldırım',    '05489123756', 'Bursa',    'Şeftali, Kiraz',      'onemli',     'Tavsiye',         'satın aldı',             1950.00, 'Referans müşteri',            buse_id, 500, '2024-10-07'),

  -- POTANSİYEL MÜŞTERİLER (6)
  ('Cemil Toprak',      '05523467819', 'Gaziantep','Antep Fıstığı, Zeytin','potansiyel', 'Reklam',          'almayı düşünüyor',       NULL,    'Fiyat araştırıyor',           buse_id, 500, '2025-01-08'),
  ('Hatice Güler',      '05678912345', 'Denizli',  'Üzüm, İncir',         'potansiyel', 'Tavsiye',         'fiyat bilgisi verildi',  NULL,    NULL,                          buse_id, 500, '2025-01-19'),
  ('Ramazan Bozkurt',   '05334521896', 'Kayseri',  'Elma, Patates',       'potansiyel', 'Reklam',          'ilgilenmiyor',           NULL,    'Şimdilik ilgilenmiyor',       buse_id, 500, '2025-02-03'),
  ('Pınar Aksoy',       '05412345678', 'Samsun',   'Fındık, Mısır',       'potansiyel', 'Doğrudan/Saha',   'tekrar aranacak',        NULL,    'Sahada görüşüldü',            buse_id, 500, '2025-02-25'),
  ('Orhan Kılıç',       '05567891234', 'Trabzon',  'Çay, Fındık',         'potansiyel', 'Reklam',          'ürün bilgisi verildi',   NULL,    NULL,                          buse_id, 500, '2025-03-10'),
  ('Melek Yavuz',       '05298123456', 'Eskişehir','Buğday, Şeker Pancarı','potansiyel', 'Tavsiye',         'bayilik için arandı',    NULL,    'Bayi olmak istiyor',          buse_id, 500, '2025-04-22');

  RAISE NOTICE '25 demo müşteri başarıyla eklendi. Buse ID: %', buse_id;
END;
$$;
