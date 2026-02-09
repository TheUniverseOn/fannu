-- 004_purchases.sql
-- Drop purchases/sales

CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  fan_phone TEXT NOT NULL,
  fan_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'ETB',
  psp_ref TEXT,
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  receipt_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_purchases_drop ON purchases(drop_id);
CREATE INDEX idx_purchases_receipt ON purchases(receipt_id);
CREATE INDEX idx_purchases_status ON purchases(payment_status);
