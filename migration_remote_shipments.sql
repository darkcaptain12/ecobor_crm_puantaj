-- =============================================
-- Migration: Remote Access + Shipments
-- Supabase Dashboard > SQL Editor'de çalıştır
-- =============================================

-- 1. users tablosuna remote access alanları ekle
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_remote_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS remote_expire_at TIMESTAMPTZ;

-- 2. shipments tablosu (kargo takibi)
CREATE TABLE IF NOT EXISTS shipments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL,
  carrier       TEXT NOT NULL DEFAULT 'Yurtiçi',
  status        TEXT NOT NULL DEFAULT 'preparing'
                  CHECK (status IN ('preparing', 'shipped', 'in_transit', 'delivered')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);

-- 3. Demo: Mevcut siparişlerden shipment kayıtları oluştur
INSERT INTO shipments (order_id, tracking_number, carrier, status)
SELECT
  id,
  COALESCE(tracking_code, 'TRK' || SUBSTRING(id::text, 1, 8)),
  COALESCE(shipment_company, 'Yurtiçi'),
  CASE
    WHEN status = 'DELIVERED' THEN 'delivered'
    WHEN status = 'SHIPPED' THEN 'in_transit'
    WHEN status = 'PREPARING' THEN 'shipped'
    ELSE 'preparing'
  END
FROM orders
WHERE status IN ('PREPARING', 'SHIPPED', 'DELIVERED')
ON CONFLICT DO NOTHING;

-- 4. Kontrol
SELECT
  u.name, u.role, u.is_remote_enabled, u.remote_expire_at
FROM users u
ORDER BY role, name;

SELECT COUNT(*) as shipment_count FROM shipments;
