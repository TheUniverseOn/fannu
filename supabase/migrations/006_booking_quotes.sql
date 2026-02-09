-- 006_booking_quotes.sql
-- Quotes sent by creators for bookings

CREATE TYPE quote_status AS ENUM ('ACTIVE', 'EXPIRED', 'SUPERSEDED', 'ACCEPTED', 'DECLINED');

CREATE TABLE booking_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  total_amount INTEGER NOT NULL CHECK (total_amount > 0),
  deposit_percent INTEGER NOT NULL CHECK (deposit_percent BETWEEN 1 AND 100),
  deposit_amount INTEGER NOT NULL CHECK (deposit_amount > 0),
  currency TEXT NOT NULL DEFAULT 'ETB',
  deposit_refundable BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  terms_text TEXT NOT NULL,
  status quote_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quotes_booking ON booking_quotes(booking_id);
CREATE INDEX idx_quotes_status ON booking_quotes(status);
