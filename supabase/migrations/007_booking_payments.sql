-- 007_booking_payments.sql
-- Payments for bookings

CREATE TYPE booking_payment_type AS ENUM ('DEPOSIT', 'REMAINDER');

CREATE TABLE booking_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES booking_quotes(id),
  psp_ref TEXT,
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'ETB',
  type booking_payment_type NOT NULL DEFAULT 'DEPOSIT',
  status payment_status NOT NULL DEFAULT 'PENDING',
  receipt_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_bpayments_booking ON booking_payments(booking_id);
CREATE INDEX idx_bpayments_receipt ON booking_payments(receipt_id);
