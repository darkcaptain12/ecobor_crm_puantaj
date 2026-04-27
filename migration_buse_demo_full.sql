-- =====================================================================
-- Buse Mühendisi — Kapsamlı Demo Veri Migrasyonu
-- Supabase SQL Editor'da çalıştırın
-- Önce migration_buse_demo_customers.sql çalıştırılmış olmalı!
-- =====================================================================
-- Tablolar: interactions, orders, order_items, shipments, tasks,
--           notifications, prescriptions, prescription_items,
--           engineer_inventory, reward_logs
-- =====================================================================

DO $$
DECLARE
  -- Kullanıcı ID'leri
  buse_id    UUID;
  admin_id   UUID;

  -- Ürün ID'leri
  p_ecbor1   UUID;  -- EC BOR 1 LT
  p_ecbor2   UUID;  -- EC BOR 2 LT
  p_ecbor5   UUID;  -- EC BOR 5 LT
  p_yaprak1  UUID;  -- Yaprak Gübre 1 LT
  p_yaprak5  UUID;  -- Yaprak Gübre 5 LT
  p_kok      UUID;  -- Kök Geliştirici 500ML

  -- Müşteri ID'leri
  c_mehmet   UUID;  -- Mehmet Yılmaz
  c_fatma    UUID;  -- Fatma Kaya
  c_ali      UUID;  -- Ali Demir
  c_zeynep   UUID;  -- Zeynep Arslan
  c_murat    UUID;  -- Murat Özdemir (yeni)
  c_ayse     UUID;  -- Ayşe Doğan
  c_ibrahim  UUID;  -- İbrahim Yıldız
  c_gulsen   UUID;  -- Gülşen Aydın
  c_serkan   UUID;  -- Serkan Koçak
  c_mustafa  UUID;  -- Mustafa Kaplan
  c_seda     UUID;  -- Seda Çiftçi
  c_huseyin  UUID;  -- Hüseyin Karabıyık
  c_leyla    UUID;  -- Leyla Arslan
  c_ahmet    UUID;  -- Ahmet Demirci
  c_ozlem    UUID;  -- Özlem Yıldırım (onemli)
  c_cemil    UUID;  -- Cemil Toprak
  c_hatice   UUID;  -- Hatice Güler
  c_pinar    UUID;  -- Pınar Aksoy
  c_melek    UUID;  -- Melek Yavuz (potansiyel)

  -- Sipariş ID'leri
  o_del1     UUID;
  o_del2     UUID;
  o_ship     UUID;
  o_prep     UUID;
  o_new      UUID;

  -- Reçete ID'leri
  rx_mustafa UUID;
  rx_ozlem   UUID;

BEGIN

  -- ==================================================================
  -- 1. KULLANICI ID'LERİNİ BUL
  -- ==================================================================
  SELECT id INTO buse_id  FROM users WHERE phone = '05539456267';
  SELECT id INTO admin_id FROM users WHERE role = 'ADMIN' LIMIT 1;

  IF buse_id IS NULL THEN
    RAISE EXCEPTION '❌ Buse kullanıcısı bulunamadı (telefon: 05539456267). Önce kullanıcıyı oluşturun.';
  END IF;

  IF admin_id IS NULL THEN
    RAISE EXCEPTION '❌ Sistemde hiç ADMIN kullanıcısı bulunamadı. Önce bir admin ekleyin.';
  END IF;

  RAISE NOTICE 'Buse ID: %', buse_id;
  RAISE NOTICE 'Admin ID: %', admin_id;

  -- ==================================================================
  -- 2. ÜRÜN ID'LERİNİ BUL
  -- ==================================================================
  SELECT id INTO p_ecbor1  FROM products WHERE name = 'EC BOR 1 LT';
  SELECT id INTO p_ecbor2  FROM products WHERE name = 'EC BOR 2 LT';
  SELECT id INTO p_ecbor5  FROM products WHERE name = 'EC BOR 5 LT';
  SELECT id INTO p_yaprak1 FROM products WHERE name = 'Yaprak Gübre 1 LT';
  SELECT id INTO p_yaprak5 FROM products WHERE name = 'Yaprak Gübre 5 LT';
  SELECT id INTO p_kok     FROM products WHERE name = 'Kök Geliştirici 500ML';

  -- ==================================================================
  -- 3. MÜŞTERİ ID'LERİNİ BUL (sadece Buse'ye atanmış olanlar)
  -- ==================================================================
  SELECT id INTO c_mehmet  FROM customers WHERE name = 'Mehmet Yılmaz'    AND assigned_to = buse_id;
  SELECT id INTO c_fatma   FROM customers WHERE name = 'Fatma Kaya'        AND assigned_to = buse_id;
  SELECT id INTO c_ali     FROM customers WHERE name = 'Ali Demir'         AND assigned_to = buse_id;
  SELECT id INTO c_zeynep  FROM customers WHERE name = 'Zeynep Arslan'     AND assigned_to = buse_id;
  SELECT id INTO c_murat   FROM customers WHERE name = 'Murat Özdemir'     AND assigned_to = buse_id;
  SELECT id INTO c_ayse    FROM customers WHERE name = 'Ayşe Doğan'        AND assigned_to = buse_id;
  SELECT id INTO c_ibrahim FROM customers WHERE name = 'İbrahim Yıldız'    AND assigned_to = buse_id;
  SELECT id INTO c_gulsen  FROM customers WHERE name = 'Gülşen Aydın'      AND assigned_to = buse_id;
  SELECT id INTO c_serkan  FROM customers WHERE name = 'Serkan Koçak'      AND assigned_to = buse_id;
  SELECT id INTO c_mustafa FROM customers WHERE name = 'Mustafa Kaplan'    AND assigned_to = buse_id;
  SELECT id INTO c_seda    FROM customers WHERE name = 'Seda Çiftçi'       AND assigned_to = buse_id;
  SELECT id INTO c_huseyin FROM customers WHERE name = 'Hüseyin Karabıyık' AND assigned_to = buse_id;
  SELECT id INTO c_leyla   FROM customers WHERE name = 'Leyla Arslan'      AND assigned_to = buse_id;
  SELECT id INTO c_ahmet   FROM customers WHERE name = 'Ahmet Demirci'     AND assigned_to = buse_id;
  SELECT id INTO c_ozlem   FROM customers WHERE name = 'Özlem Yıldırım'    AND assigned_to = buse_id;
  SELECT id INTO c_cemil   FROM customers WHERE name = 'Cemil Toprak'      AND assigned_to = buse_id;
  SELECT id INTO c_hatice  FROM customers WHERE name = 'Hatice Güler'      AND assigned_to = buse_id;
  SELECT id INTO c_pinar   FROM customers WHERE name = 'Pınar Aksoy'       AND assigned_to = buse_id;
  SELECT id INTO c_melek   FROM customers WHERE name = 'Melek Yavuz'       AND assigned_to = buse_id;

  -- ==================================================================
  -- 4. ETKİLEŞİMLER (10 kayıt)
  -- ==================================================================
  RAISE NOTICE '→ Etkileşimler ekleniyor...';

  -- [1] Mustafa Kaplan — elma bahçesi saha ziyareti (eski, tamamlandı)
  IF c_mustafa IS NOT NULL THEN
    INSERT INTO interactions (customer_id, engineer_id, date, type, note, next_followup)
    VALUES (
      c_mustafa, buse_id,
      '2024-09-12 10:30:00+03',
      'visit',
      'Ankara — elma ve armut bahçesi ilk ziyaret. 3 hektarlık bahçede bor eksikliği belirtileri gözlemlendi: meyve tutumunda düşüş, yapraklarda sararma. EC BOR 5LT önerildi, numune bırakıldı. Üretici çok ilgili, hemen deneme yapacak.',
      '2024-10-01 10:00:00+03'
    );
  END IF;

  -- [2] Mustafa Kaplan — takip araması
  IF c_mustafa IS NOT NULL THEN
    INSERT INTO interactions (customer_id, engineer_id, date, type, note, next_followup)
    VALUES (
      c_mustafa, buse_id,
      '2024-10-03 15:00:00+03',
      'call',
      'Deneme uygulamasının sonuçları çok iyi. Meyve tutumu belirgin şekilde arttı. Toplu sipariş vermek istiyor — 5LT x4 adet talep edildi. Sipariş oluşturuldu.',
      NULL
    );
  END IF;

  -- [3] Seda Çiftçi — narenciye bahçesi ziyareti
  IF c_seda IS NOT NULL THEN
    INSERT INTO interactions (customer_id, engineer_id, date, type, note, next_followup)
    VALUES (
      c_seda, buse_id,
      '2024-11-20 09:00:00+03',
      'visit',
      'Antalya narenciye bahçesi ziyareti. Limon ağaçlarında çiçeklenme dönemi geride kaldı, meyve irileşme başlangıcı. EC BOR + Yaprak Gübre kombinasyonu önerildi. Seda Hanım düzenli müşteri, toplu sipariş alındı.',
      '2024-12-10 09:00:00+03'
    );
  END IF;

  -- [4] Hüseyin Karabıyık — pamuk tarlası, büyük çiftçi
  IF c_huseyin IS NOT NULL THEN
    INSERT INTO interactions (customer_id, engineer_id, date, type, note, next_followup)
    VALUES (
      c_huseyin, buse_id,
      '2024-12-05 11:00:00+03',
      'visit',
      'Adana — 500 dönümlük pamuk tarlası ziyareti. Dekar başına verim geçen yıla göre %15 düştüğünü belirtti. Toprak analiz sonuçlarına göre bor ve çinko eksikliği tespit edildi. EC BOR 5LT + Yaprak Gübre 5LT kombinasyon reçetesi hazırlandı. Büyük hacimli sipariş potansiyeli mevcut.',
      '2025-01-15 10:00:00+03'
    );
  END IF;

  -- [5] Özlem Yıldırım — şeftali-kiraz, referans müşteri
  IF c_ozlem IS NOT NULL THEN
    INSERT INTO interactions (customer_id, engineer_id, date, type, note, next_followup)
    VALUES (
      c_ozlem, buse_id,
      '2025-01-10 14:00:00+03',
      'call',
      'Özlem Hanım memnuniyetini iletti — geçen sezon şeftali hasadında %20 artış gözlemlemiş. Çevresindeki çiftçilere de önereceğini söyledi. Bu sezon için erken sipariş vermek istiyor. Nisan başı teslimat için sipariş alındı.',
      '2025-03-15 10:00:00+03'
    );
  END IF;

  -- [6] İbrahim Yıldız — buğday/arpa, saha ziyareti
  IF c_ibrahim IS NOT NULL THEN
    INSERT INTO interactions (customer_id, engineer_id, date, type, note, next_followup)
    VALUES (
      c_ibrahim, buse_id,
      '2025-02-14 10:00:00+03',
      'visit',
      'Konya — buğday ve arpa tarlası saha ziyareti. Kardeşlenme dönemi başlangıcında. EC BOR uygulamasının sapa kalkma öncesinde yapılması kritik. Yaprak Gübre ile kombinasyon önerildi. Saha satışı gerçekleştirildi: EC BOR 2LT x2.',
      '2025-03-10 10:00:00+03'
    );
  END IF;

  -- [7] Ahmet Demirci — zeytinlik, büyük üretici (not)
  IF c_ahmet IS NOT NULL THEN
    INSERT INTO interactions (customer_id, engineer_id, date, type, note, next_followup)
    VALUES (
      c_ahmet, buse_id,
      '2025-02-28 16:00:00+03',
      'note',
      'Balıkesir zeytinlik sahibi. Ahmet Bey ile telefon görüşmesi yapıldı. Nisan-Mayıs zeytin çiçeklenme sezonu öncesinde ziyaret planlandı. EC BOR 5LT ve Yaprak Gübre 5LT için ön talep var. Ziyaret öncesi teknik broşür gönderildi.',
      '2025-04-20 09:00:00+03'
    );
  END IF;

  -- [8] Gülşen Aydın — zeytin-üzüm, her sezon alıyor
  IF c_gulsen IS NOT NULL THEN
    INSERT INTO interactions (customer_id, engineer_id, date, type, note, next_followup)
    VALUES (
      c_gulsen, buse_id,
      '2025-03-05 10:30:00+03',
      'visit',
      'Çanakkale — zeytin ve üzüm bahçeleri ziyareti. Gülşen Hanım her sezon düzenli alım yapıyor. Bu yıl elinde stok az kalmış, ilkbahar uygulamaları için yeni sipariş oluşturuldu. Kök Geliştirici de reçeteye eklendi.',
      '2025-04-05 10:00:00+03'
    );
  END IF;

  -- [9] Cemil Toprak — antep fıstığı, ilk görüşme (potansiyel)
  IF c_cemil IS NOT NULL THEN
    INSERT INTO interactions (customer_id, engineer_id, date, type, note, next_followup)
    VALUES (
      c_cemil, buse_id,
      '2025-03-20 13:00:00+03',
      'call',
      'Gaziantep — antep fıstığı üreticisi. Fiyat araştırıyor. EC BOR 5LT için litre başına fiyat sordu. Rakip ürünle karşılaştırma yapıyor. Referans müşterilerden Mustafa Kaplan''ın iletişim bilgisi paylaşıldı. 2 hafta içinde geri dönecek.',
      '2025-04-05 10:00:00+03'
    );
  END IF;

  -- [10] Melek Yavuz — bayilik için arama, potansiyel bayi
  IF c_melek IS NOT NULL THEN
    INSERT INTO interactions (customer_id, engineer_id, date, type, note, next_followup)
    VALUES (
      c_melek, buse_id,
      '2025-04-22 11:00:00+03',
      'call',
      'Eskişehir — buğday ve şeker pancarı üreticisi. Bayi olmak istiyor, bölgede 15-20 çiftçiye ulaşabileceğini belirtti. Bayilik koşulları ve minimum alım miktarları hakkında bilgi verildi. Admin ile görüşülmesi gerekiyor. Admin bilgilendirilecek.',
      '2025-05-10 10:00:00+03'
    );
  END IF;

  -- ==================================================================
  -- 5. SİPARİŞLER (5 sipariş)
  -- ==================================================================
  RAISE NOTICE '→ Siparişler ekleniyor...';

  -- Sipariş ID'leri için sabit UUID'ler atayalım
  o_del1 := gen_random_uuid();
  o_del2 := gen_random_uuid();
  o_ship := gen_random_uuid();
  o_prep := gen_random_uuid();
  o_new  := gen_random_uuid();

  -- [SİPARİŞ 1] DELIVERED — Mustafa Kaplan, EC BOR 5LT x2 + Yaprak Gübre 5LT
  IF c_mustafa IS NOT NULL THEN
    INSERT INTO orders (
      id, order_number, customer_id, engineer_id,
      status, tracking_code, shipment_company,
      total_amount, total_points, is_field_sale,
      notes, created_at
    ) VALUES (
      o_del1,
      'ECB-2025-0031',
      c_mustafa, buse_id,
      'DELIVERED',
      'YK2025031547',
      'Yurtiçi Kargo',
      1690.00,   -- 650*2 + 390
      650,       -- 250*2 + 150
      false,
      'Mustafa Kaplan elma/armut bahçesi — toplu sipariş. Önceden deneme sonucu olumlu.',
      '2025-02-05 09:00:00+03'
    );
  END IF;

  -- [SİPARİŞ 2] DELIVERED — Seda Çiftçi, EC BOR 2LT + Yaprak Gübre 1LT x2 (saha satışı)
  IF c_seda IS NOT NULL THEN
    INSERT INTO orders (
      id, order_number, customer_id, engineer_id,
      status, tracking_code, shipment_company,
      total_amount, total_points, is_field_sale,
      notes, created_at
    ) VALUES (
      o_del2,
      'ECB-2025-0032',
      c_seda, buse_id,
      'DELIVERED',
      'AR2025021893',
      'Aras Kargo',
      450.00,    -- 280 + 85*2
      160,       -- 100 + 30*2
      true,
      'Seda Çiftçi narenciye bahçesi — saha ziyaretinde sipariş alındı.',
      '2025-02-18 11:00:00+03'
    );
  END IF;

  -- [SİPARİŞ 3] SHIPPED — Hüseyin Karabıyık, EC BOR 5LT + Yaprak Gübre 5LT
  IF c_huseyin IS NOT NULL THEN
    INSERT INTO orders (
      id, order_number, customer_id, engineer_id,
      status, tracking_code, shipment_company,
      total_amount, total_points, is_field_sale,
      notes, created_at
    ) VALUES (
      o_ship,
      'ECB-2025-0041',
      c_huseyin, buse_id,
      'SHIPPED',
      'MNG2025041276',
      'MNG Kargo',
      1040.00,   -- 650 + 390
      400,       -- 250 + 150
      false,
      'Hüseyin Karabıyık pamuk tarlası — 500 dönüm uygulama paketi.',
      '2025-04-10 10:00:00+03'
    );
  END IF;

  -- [SİPARİŞ 4] PREPARING — Özlem Yıldırım, EC BOR 2LT x2 + Kök Geliştirici
  IF c_ozlem IS NOT NULL THEN
    INSERT INTO orders (
      id, order_number, customer_id, engineer_id,
      status, tracking_code, shipment_company,
      total_amount, total_points, is_field_sale,
      notes, created_at
    ) VALUES (
      o_prep,
      'ECB-2025-0048',
      c_ozlem, buse_id,
      'PREPARING',
      NULL,
      'Yurtiçi Kargo',
      625.00,    -- 280*2 + 65
      220,       -- 100*2 + 20
      false,
      'Özlem Yıldırım şeftali/kiraz bahçesi — nisan uygulaması için erken sipariş.',
      '2025-04-20 14:00:00+03'
    );
  END IF;

  -- [SİPARİŞ 5] NEW — Gülşen Aydın, EC BOR 1LT + Yaprak Gübre 1LT
  IF c_gulsen IS NOT NULL THEN
    INSERT INTO orders (
      id, order_number, customer_id, engineer_id,
      status, tracking_code, shipment_company,
      total_amount, total_points, is_field_sale,
      notes, created_at
    ) VALUES (
      o_new,
      'ECB-2025-0052',
      c_gulsen, buse_id,
      'NEW',
      NULL,
      NULL,
      235.00,    -- 150 + 85
      80,        -- 50 + 30
      false,
      'Gülşen Aydın zeytin/üzüm bahçesi — bahar sezonu başlangıç siparişi.',
      now()
    );
  END IF;

  -- ==================================================================
  -- 6. SİPARİŞ KALEMLERİ
  -- ==================================================================
  RAISE NOTICE '→ Sipariş kalemleri ekleniyor...';

  -- Sipariş 1 (o_del1) — Mustafa Kaplan
  IF c_mustafa IS NOT NULL AND p_ecbor5 IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
    VALUES (o_del1, p_ecbor5, 2, 650.00, 500);
  END IF;
  IF c_mustafa IS NOT NULL AND p_yaprak5 IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
    VALUES (o_del1, p_yaprak5, 1, 390.00, 150);
  END IF;

  -- Sipariş 2 (o_del2) — Seda Çiftçi
  IF c_seda IS NOT NULL AND p_ecbor2 IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
    VALUES (o_del2, p_ecbor2, 1, 280.00, 100);
  END IF;
  IF c_seda IS NOT NULL AND p_yaprak1 IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
    VALUES (o_del2, p_yaprak1, 2, 85.00, 60);
  END IF;

  -- Sipariş 3 (o_ship) — Hüseyin Karabıyık
  IF c_huseyin IS NOT NULL AND p_ecbor5 IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
    VALUES (o_ship, p_ecbor5, 1, 650.00, 250);
  END IF;
  IF c_huseyin IS NOT NULL AND p_yaprak5 IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
    VALUES (o_ship, p_yaprak5, 1, 390.00, 150);
  END IF;

  -- Sipariş 4 (o_prep) — Özlem Yıldırım
  IF c_ozlem IS NOT NULL AND p_ecbor2 IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
    VALUES (o_prep, p_ecbor2, 2, 280.00, 200);
  END IF;
  IF c_ozlem IS NOT NULL AND p_kok IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
    VALUES (o_prep, p_kok, 1, 65.00, 20);
  END IF;

  -- Sipariş 5 (o_new) — Gülşen Aydın
  IF c_gulsen IS NOT NULL AND p_ecbor1 IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
    VALUES (o_new, p_ecbor1, 1, 150.00, 50);
  END IF;
  IF c_gulsen IS NOT NULL AND p_yaprak1 IS NOT NULL THEN
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, points)
    VALUES (o_new, p_yaprak1, 1, 85.00, 30);
  END IF;

  -- ==================================================================
  -- 7. KARGO TAKİBİ (shipments — 3 kayıt: 2 DELIVERED + 1 SHIPPED)
  -- ==================================================================
  RAISE NOTICE '→ Kargo kayıtları ekleniyor...';

  -- Sipariş 1 (DELIVERED) — Yurtiçi Kargo
  IF c_mustafa IS NOT NULL THEN
    INSERT INTO shipments (order_id, tracking_number, carrier, status, notes)
    VALUES (
      o_del1,
      'YK2025031547',
      'Yurtiçi Kargo',
      'delivered',
      'Mustafa Kaplan elden teslim alındı. 05.03.2025 tarihinde teslim edildi.'
    );
  END IF;

  -- Sipariş 2 (DELIVERED) — Aras Kargo
  IF c_seda IS NOT NULL THEN
    INSERT INTO shipments (order_id, tracking_number, carrier, status, notes)
    VALUES (
      o_del2,
      'AR2025021893',
      'Aras Kargo',
      'delivered',
      'Seda Çiftçi imzalı teslim alındı. 22.02.2025 tarihinde teslim edildi.'
    );
  END IF;

  -- Sipariş 3 (SHIPPED) — MNG Kargo
  IF c_huseyin IS NOT NULL THEN
    INSERT INTO shipments (order_id, tracking_number, carrier, status, notes)
    VALUES (
      o_ship,
      'MNG2025041276',
      'MNG Kargo',
      'in_transit',
      'Adana deposunda, tahmini teslimat 2-3 iş günü.'
    );
  END IF;

  -- Sipariş 4 (PREPARING) — Yurtiçi Kargo
  IF c_ozlem IS NOT NULL THEN
    INSERT INTO shipments (order_id, tracking_number, carrier, status, notes)
    VALUES (
      o_prep,
      NULL,
      'Yurtiçi Kargo',
      'preparing',
      'Depodan hazırlanıyor. Kargo kodu kısa süre içinde atanacak.'
    );
  END IF;

  -- ==================================================================
  -- 8. GÖREVLER (6 kayıt)
  -- ==================================================================
  RAISE NOTICE '→ Görevler ekleniyor...';

  -- [DONE 1] Geçmiş — Mustafa Kaplan ziyareti tamamlandı
  IF c_mustafa IS NOT NULL THEN
    INSERT INTO tasks (
      assigned_to, assigned_by, customer_id,
      title, description, type, status,
      due_date, completed_at
    ) VALUES (
      buse_id, admin_id, c_mustafa,
      'Mustafa Kaplan ziyaret — zeytin bahçesi kontrolü',
      'Ankara elma ve armut bahçesi ilk saha ziyareti. Bor eksikliği tespiti ve EC BOR numune bırakma.',
      'visit', 'done',
      '2024-09-12',
      '2024-09-12 12:30:00+03'
    );
  END IF;

  -- [DONE 2] Geçmiş — Seda Çiftçi sipariş teslim takibi
  IF c_seda IS NOT NULL THEN
    INSERT INTO tasks (
      assigned_to, assigned_by, customer_id,
      title, description, type, status,
      due_date, completed_at
    ) VALUES (
      buse_id, admin_id, c_seda,
      'Seda Çiftçi — ECB-2025-0032 kargo teslim onayı',
      'Aras Kargo ile gönderilen sipariş teslim edildi mi doğrula, müşteriyi ara.',
      'call', 'done',
      '2025-02-25',
      '2025-02-25 14:00:00+03'
    );
  END IF;

  -- [IN_PROGRESS 1] Hüseyin Karabıyık — kargo takibi
  IF c_huseyin IS NOT NULL THEN
    INSERT INTO tasks (
      assigned_to, assigned_by, customer_id,
      title, description, type, status,
      due_date
    ) VALUES (
      buse_id, admin_id, c_huseyin,
      'Hüseyin Karabıyık — MNG kargo takibi ve teslim onayı',
      'ECB-2025-0041 siparişi yolda. Teslimatta Hüseyin Bey''i ara, uygulama talimatlarını ver.',
      'call', 'in_progress',
      CURRENT_DATE + 2
    );
  END IF;

  -- [IN_PROGRESS 2] Ahmet Demirci — zeytin çiçeklenme ziyareti
  IF c_ahmet IS NOT NULL THEN
    INSERT INTO tasks (
      assigned_to, assigned_by, customer_id,
      title, description, type, status,
      due_date
    ) VALUES (
      buse_id, admin_id, c_ahmet,
      'Ahmet Demirci — zeytin çiçeklenme sezonu öncesi saha ziyareti',
      'Balıkesir zeytinlik. Nisan-Mayıs çiçeklenme öncesi EC BOR 5LT uygulaması için teknik destek ziyareti.',
      'visit', 'in_progress',
      CURRENT_DATE + 5
    );
  END IF;

  -- [PENDING 1] BUGÜN — Cemil Toprak takip araması (ACİL)
  IF c_cemil IS NOT NULL THEN
    INSERT INTO tasks (
      assigned_to, assigned_by, customer_id,
      title, description, type, status,
      due_date
    ) VALUES (
      buse_id, admin_id, c_cemil,
      'Cemil Toprak — antep fıstığı teklif takip araması ⚡',
      'Gaziantep potansiyel müşteri. 2 hafta önce fiyat araştırıyordu. Bugün geri dön, karar aşamasında.',
      'call', 'pending',
      CURRENT_DATE
    );
  END IF;

  -- [PENDING 2] Gelecek — Melek Yavuz bayilik görüşmesi
  IF c_melek IS NOT NULL THEN
    INSERT INTO tasks (
      assigned_to, assigned_by, customer_id,
      title, description, type, status,
      due_date
    ) VALUES (
      buse_id, admin_id, c_melek,
      'Melek Yavuz — bayilik koşulları görüşmesi',
      'Eskişehir — bölgede bayi olmak istiyor. Admin onayı alındıktan sonra resmi teklif sunulacak.',
      'visit', 'pending',
      CURRENT_DATE + 13
    );
  END IF;

  -- ==================================================================
  -- 9. BİLDİRİMLER (5 kayıt — 3 okunmamış, 2 okunmuş)
  -- ==================================================================
  RAISE NOTICE '→ Bildirimler ekleniyor...';

  -- [UNREAD 1] Kritik mahsul dönemi — zeytin çiçeklenme
  INSERT INTO notifications (
    user_id, customer_id, type,
    title, body, is_read, trigger_date
  ) VALUES (
    buse_id, c_ahmet,
    'crop_season',
    '⚠️ Kritik Dönem: Zeytin çiçeklenme sezonu başlıyor',
    'Ahmet Demirci''nin zeytinliğinde çiçeklenme kritik dönemi başladı. EC BOR 5LT uygulaması en geç bu hafta yapılmalı. Ziyaret planla!',
    false,
    CURRENT_DATE
  );

  -- [UNREAD 2] Takip hatırlatıcı — Cemil Toprak
  INSERT INTO notifications (
    user_id, customer_id, type,
    title, body, is_read, trigger_date
  ) VALUES (
    buse_id, c_cemil,
    'followup',
    'Takip Hatırlatıcı: Cemil Toprak — 2 haftadır bekliyor',
    'Gaziantep antep fıstığı üreticisi Cemil Toprak''tan haber yok. Teklif kararı için bugün ara.',
    false,
    CURRENT_DATE
  );

  -- [UNREAD 3] Görev bildirimi — Hüseyin Karabıyık kargo
  INSERT INTO notifications (
    user_id, customer_id, type,
    title, body, is_read, trigger_date
  ) VALUES (
    buse_id, c_huseyin,
    'task',
    'Görev: Hüseyin Karabıyık siparişi yolda',
    'ECB-2025-0041 MNG Kargo ile yola çıktı. Teslimatta müşteriyi bilgilendir ve uygulama talimatlarını ilet.',
    false,
    CURRENT_DATE
  );

  -- [READ 1] Geçmiş — Mustafa Kaplan siparişi teslim edildi
  INSERT INTO notifications (
    user_id, customer_id, type,
    title, body, is_read, trigger_date
  ) VALUES (
    buse_id, c_mustafa,
    'general',
    'Sipariş Teslim Edildi: ECB-2025-0031',
    'Mustafa Kaplan''a ait ECB-2025-0031 numaralı sipariş Yurtiçi Kargo tarafından teslim edildi. 650 puan kazanıldı.',
    true,
    CURRENT_DATE - 50
  );

  -- [READ 2] Geçmiş — Seda Çiftçi saha satışı tamamlandı
  INSERT INTO notifications (
    user_id, customer_id, type,
    title, body, is_read, trigger_date
  ) VALUES (
    buse_id, c_seda,
    'task',
    'Saha Satışı Tamamlandı: ECB-2025-0032',
    'Seda Çiftçi ziyaretinde saha satışı gerçekleştirildi. Sipariş sisteme kaydedildi ve kargoya verildi.',
    true,
    CURRENT_DATE - 65
  );

  -- ==================================================================
  -- 10. REÇETELER (2 reçete, her biri 2 kalemle)
  -- ==================================================================
  RAISE NOTICE '→ Reçeteler ekleniyor...';

  rx_mustafa := gen_random_uuid();
  rx_ozlem   := gen_random_uuid();

  -- Reçete 1 — Mustafa Kaplan (elma/armut bor eksikliği)
  IF c_mustafa IS NOT NULL THEN
    INSERT INTO prescriptions (id, customer_id, engineer_id, date, diagnosis, usage_days, notes)
    VALUES (
      rx_mustafa,
      c_mustafa, buse_id,
      '2024-09-12',
      'Bor eksikliği — verim düşüklüğü ve meyve tutum sorunu',
      21,
      'Çiçeklenme öncesi ve meyve tutum döneminde olmak üzere 2 uygulama. 300 litre suya 1LT EC BOR. Sabah erken ya da akşam serinliğinde yapraktan uygulama yapılmalı. Uygulama sonrası 2 saat yağmur beklenmemeli.'
    );

    -- Reçete 1 — Kalem 1: EC BOR 5LT
    IF p_ecbor5 IS NOT NULL THEN
      INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
      VALUES (
        rx_mustafa, p_ecbor5,
        2, 'LT',
        '300 litre suya 1 LT EC BOR karıştır. Yapraktan sprey uygulama. 7 günde bir tekrar et.',
        '2024-09-12'
      );
    END IF;

    -- Reçete 1 — Kalem 2: Yaprak Gübre 5LT
    IF p_yaprak5 IS NOT NULL THEN
      INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
      VALUES (
        rx_mustafa, p_yaprak5,
        1, 'LT',
        'EC BOR ile aynı anda karıştırılabilir. 300 litre suya 500 ml Yaprak Gübre ekle.',
        '2024-09-19'
      );
    END IF;
  END IF;

  -- Reçete 2 — Özlem Yıldırım (şeftali/kiraz kök gelişimi)
  IF c_ozlem IS NOT NULL THEN
    INSERT INTO prescriptions (id, customer_id, engineer_id, date, diagnosis, usage_days, notes)
    VALUES (
      rx_ozlem,
      c_ozlem, buse_id,
      '2025-04-01',
      'Çiçeklenme sonrası meyve irileşme dönemi — bor ve kök desteği',
      14,
      'Şeftali ve kiraz ağaçları için çiçeklenme bittikten hemen sonra uygulama başlatılmalı. Kök Geliştirici toprak sulama yoluyla, EC BOR yapraktan uygulanır. Kombine uygulama etkiyi artırır.'
    );

    -- Reçete 2 — Kalem 1: EC BOR 2LT
    IF p_ecbor2 IS NOT NULL THEN
      INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
      VALUES (
        rx_ozlem, p_ecbor2,
        2, 'LT',
        '200 litre suya 1 LT EC BOR. Yapraktan sprey uygulama, haftada 2 kez.',
        '2025-04-01'
      );
    END IF;

    -- Reçete 2 — Kalem 2: Kök Geliştirici 500ML
    IF p_kok IS NOT NULL THEN
      INSERT INTO prescription_items (prescription_id, product_id, quantity, unit, usage_instruction, start_date)
      VALUES (
        rx_ozlem, p_kok,
        1, 'ML',
        '100 litre suya 50 ml Kök Geliştirici. Damla sulama ya da kök dibi ıslatma ile uygula. Haftada 1 kez.',
        '2025-04-01'
      );
    END IF;
  END IF;

  -- ==================================================================
  -- 11. MÜHENDİS ARAÇ STOĞU (engineer_inventory)
  -- ==================================================================
  RAISE NOTICE '→ Mühendis araç stoğu ekleniyor...';

  IF p_ecbor1 IS NOT NULL THEN
    INSERT INTO engineer_inventory (engineer_id, product_id, quantity)
    VALUES (buse_id, p_ecbor1, 24)
    ON CONFLICT (engineer_id, product_id)
    DO UPDATE SET quantity = 24, updated_at = now();
  END IF;

  IF p_ecbor2 IS NOT NULL THEN
    INSERT INTO engineer_inventory (engineer_id, product_id, quantity)
    VALUES (buse_id, p_ecbor2, 12)
    ON CONFLICT (engineer_id, product_id)
    DO UPDATE SET quantity = 12, updated_at = now();
  END IF;

  IF p_ecbor5 IS NOT NULL THEN
    INSERT INTO engineer_inventory (engineer_id, product_id, quantity)
    VALUES (buse_id, p_ecbor5, 6)
    ON CONFLICT (engineer_id, product_id)
    DO UPDATE SET quantity = 6, updated_at = now();
  END IF;

  -- DÜŞÜK STOK — Yaprak Gübre 1 LT (min_stock sınırı altında uyarı bekleniyor)
  IF p_yaprak1 IS NOT NULL THEN
    INSERT INTO engineer_inventory (engineer_id, product_id, quantity)
    VALUES (buse_id, p_yaprak1, 18)
    ON CONFLICT (engineer_id, product_id)
    DO UPDATE SET quantity = 18, updated_at = now();
  END IF;

  IF p_kok IS NOT NULL THEN
    INSERT INTO engineer_inventory (engineer_id, product_id, quantity)
    VALUES (buse_id, p_kok, 8)
    ON CONFLICT (engineer_id, product_id)
    DO UPDATE SET quantity = 8, updated_at = now();
  END IF;

  -- ==================================================================
  -- 12. PUAN KAYITLARI — Teslim edilen siparişler için (reward_logs)
  -- ==================================================================
  RAISE NOTICE '→ Puan kayıtları ekleniyor...';

  -- Sipariş 1 teslim — Mustafa Kaplan: 650 puan
  IF c_mustafa IS NOT NULL THEN
    INSERT INTO reward_logs (customer_id, order_id, type, points, description)
    VALUES (
      c_mustafa, o_del1,
      'earn',
      650,
      'ECB-2025-0031 siparişi teslim edildi — EC BOR 5LT x2 + Yaprak Gübre 5LT'
    );
  END IF;

  -- Sipariş 2 teslim — Seda Çiftçi: 160 puan
  IF c_seda IS NOT NULL THEN
    INSERT INTO reward_logs (customer_id, order_id, type, points, description)
    VALUES (
      c_seda, o_del2,
      'earn',
      160,
      'ECB-2025-0032 saha satışı teslim edildi — EC BOR 2LT + Yaprak Gübre 1LT x2'
    );
  END IF;

  -- ==================================================================
  -- TAMAMLANDI
  -- ==================================================================
  RAISE NOTICE '✅ Buse demo verileri eklendi';
  RAISE NOTICE '   → 10 etkileşim';
  RAISE NOTICE '   → 5 sipariş (2 DELIVERED, 1 SHIPPED, 1 PREPARING, 1 NEW)';
  RAISE NOTICE '   → 10 sipariş kalemi';
  RAISE NOTICE '   → 4 kargo kaydı (2 delivered, 1 in_transit, 1 preparing)';
  RAISE NOTICE '   → 6 görev (2 done, 2 in_progress, 2 pending)';
  RAISE NOTICE '   → 5 bildirim (3 okunmamış, 2 okunmuş)';
  RAISE NOTICE '   → 2 reçete + 4 reçete kalemi';
  RAISE NOTICE '   → 5 araç stoğu kaydı';
  RAISE NOTICE '   → 2 puan kaydı';

END;
$$;
