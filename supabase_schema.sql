-- =============================================
-- ECOBOR CRM & PUANTAJ — Supabase SQL Şeması
-- Supabase Dashboard > SQL Editor'de çalıştır
-- =============================================

-- ENUM TÜRLERİ
CREATE TYPE user_role AS ENUM ('ADMIN', 'ENGINEER', 'REMOTE_AGENT', 'CUSTOMER');
CREATE TYPE customer_status AS ENUM ('new', 'active', 'dealer');
CREATE TYPE interaction_type AS ENUM ('call', 'visit', 'note');
CREATE TYPE order_status AS ENUM ('NEW', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'done');
CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE notification_type AS ENUM ('crop_season', 'product_expiry', 'followup', 'task', 'general');

-- =============================================
-- USERS
-- =============================================
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  phone      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  role       user_role NOT NULL DEFAULT 'CUSTOMER',
  region     TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_phone_idx ON users(phone);

-- =============================================
-- CUSTOMERS (CRM)
-- =============================================
CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  phone         TEXT UNIQUE NOT NULL,
  location_lat  NUMERIC(10,7),
  location_lng  NUMERIC(10,7),
  region        TEXT,
  crop_type     TEXT,
  planting_date DATE,
  status        customer_status NOT NULL DEFAULT 'new',
  assigned_to   UUID REFERENCES users(id),
  user_id       UUID REFERENCES users(id),
  total_points  INTEGER NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX customers_region_idx ON customers(region);
CREATE INDEX customers_crop_type_idx ON customers(crop_type);
CREATE INDEX customers_assigned_to_idx ON customers(assigned_to);

-- =============================================
-- INTERACTIONS (Etkileşim Timeline)
-- =============================================
CREATE TABLE interactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  engineer_id   UUID NOT NULL REFERENCES users(id),
  date          TIMESTAMPTZ NOT NULL DEFAULT now(),
  type          interaction_type NOT NULL DEFAULT 'call',
  note          TEXT,
  images        TEXT[] DEFAULT '{}',
  next_followup TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX interactions_customer_idx ON interactions(customer_id);
CREATE INDEX interactions_next_followup_idx ON interactions(next_followup);

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  unit        TEXT NOT NULL DEFAULT 'LT',
  point_value INTEGER NOT NULL DEFAULT 0,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PRESCRIPTIONS (Reçete)
-- =============================================
CREATE TABLE prescriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES users(id),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnosis   TEXT,
  usage_days  INTEGER NOT NULL DEFAULT 7,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prescription_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id   UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES products(id),
  quantity          NUMERIC(10,2) NOT NULL,
  unit              TEXT,
  usage_instruction TEXT,
  start_date        DATE DEFAULT CURRENT_DATE,
  expiry_date       DATE
);

-- Bitiş tarihi otomatik hesaplama trigger
CREATE OR REPLACE FUNCTION calc_prescription_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expiry_date := NEW.start_date + (
    SELECT usage_days FROM prescriptions WHERE id = NEW.prescription_id
  ) * INTERVAL '1 day';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prescription_expiry
BEFORE INSERT OR UPDATE ON prescription_items
FOR EACH ROW EXECUTE FUNCTION calc_prescription_expiry();

-- =============================================
-- INVENTORY (Ana Depo)
-- =============================================
CREATE TABLE inventory (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity   NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_stock  NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- =============================================
-- ENGINEER_INVENTORY (Mühendis Araç Stoğu)
-- =============================================
CREATE TABLE engineer_inventory (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID NOT NULL REFERENCES users(id),
  product_id  UUID NOT NULL REFERENCES products(id),
  quantity    NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(engineer_id, product_id)
);

-- =============================================
-- ORDERS (Sipariş & Lojistik)
-- =============================================
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT UNIQUE NOT NULL,
  customer_id      UUID NOT NULL REFERENCES customers(id),
  engineer_id      UUID REFERENCES users(id),
  status           order_status NOT NULL DEFAULT 'NEW',
  tracking_code    TEXT,
  shipment_company TEXT,
  notes            TEXT,
  total_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_points     INTEGER NOT NULL DEFAULT 0,
  is_field_sale    BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_customer_idx ON orders(customer_id);
CREATE INDEX orders_status_idx ON orders(status);

CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity   NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  points     INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- TASKS (Görev Atama)
-- =============================================
CREATE TABLE tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_to  UUID NOT NULL REFERENCES users(id),
  assigned_by  UUID NOT NULL REFERENCES users(id),
  customer_id  UUID REFERENCES customers(id),
  title        TEXT NOT NULL,
  description  TEXT,
  type         TEXT NOT NULL DEFAULT 'visit',
  status       task_status NOT NULL DEFAULT 'pending',
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX tasks_assigned_to_idx ON tasks(assigned_to);
CREATE INDEX tasks_due_date_idx ON tasks(due_date);

-- =============================================
-- NOTIFICATIONS
-- =============================================
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id),
  customer_id  UUID REFERENCES customers(id),
  type         notification_type NOT NULL,
  title        TEXT NOT NULL,
  body         TEXT,
  is_read      BOOLEAN NOT NULL DEFAULT false,
  trigger_date DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON notifications(user_id, is_read);

-- =============================================
-- REWARD_RULES (Ödül Kuralları)
-- =============================================
CREATE TABLE reward_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  reward_value    TEXT NOT NULL,
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Varsayılan ödül kuralları
INSERT INTO reward_rules (name, points_required, reward_value, description) VALUES
  ('Bronz Ödül', 1000, '1LT', '1.000 puana ulaşınca 1 LT ürün kazanırsınız'),
  ('Gümüş Ödül', 2000, '2LT', '2.000 puana ulaşınca 2 LT ürün kazanırsınız'),
  ('Altın Ödül', 3000, '5LT', '3.000 puana ulaşınca 5 LT ürün kazanırsınız');

-- =============================================
-- REWARD_LOGS (Puan & Ödül Geçmişi)
-- =============================================
CREATE TABLE reward_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_id       UUID REFERENCES orders(id),
  type           TEXT NOT NULL DEFAULT 'earn',
  points         INTEGER NOT NULL,
  description    TEXT,
  reward_rule_id UUID REFERENCES reward_rules(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reward_logs_customer_idx ON reward_logs(customer_id);

-- Puan toplamı otomatik güncelleme trigger
CREATE OR REPLACE FUNCTION update_customer_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers
  SET total_points = (
    SELECT COALESCE(SUM(points), 0) FROM reward_logs WHERE customer_id = NEW.customer_id
  )
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_points
AFTER INSERT OR UPDATE ON reward_logs
FOR EACH ROW EXECUTE FUNCTION update_customer_points();

-- =============================================
-- COMMISSIONS (Saha Temsilcisi Komisyon)
-- =============================================
CREATE TABLE commissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID NOT NULL REFERENCES users(id),
  order_id    UUID NOT NULL REFERENCES orders(id),
  amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  rate        NUMERIC(5,2) NOT NULL DEFAULT 0,
  status      commission_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX commissions_agent_idx ON commissions(agent_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Service role key tüm RLS'i bypass eder (API route'larda kullanılır)
-- Anon key frontend için; güvenlik NextAuth + requireRole() ile sağlanır

-- =============================================
-- ÖRNEK ÜRÜNLER
-- =============================================
INSERT INTO products (name, unit, point_value, price) VALUES
  ('EC BOR 1 LT', 'LT', 50, 150.00),
  ('EC BOR 2 LT', 'LT', 100, 280.00),
  ('EC BOR 5 LT', 'LT', 250, 650.00),
  ('Yaprak Gübre 1 LT', 'LT', 30, 85.00),
  ('Yaprak Gübre 5 LT', 'LT', 150, 390.00),
  ('Kök Geliştirici 500ML', 'ML', 20, 65.00);
