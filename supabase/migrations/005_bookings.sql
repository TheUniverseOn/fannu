-- 005_bookings.sql
-- Booking requests

CREATE TYPE booking_type AS ENUM ('LIVE_PERFORMANCE', 'MC_HOSTING', 'BRAND_CONTENT', 'CUSTOM');
CREATE TYPE booking_status AS ENUM (
  'REQUESTED', 'QUOTED', 'DEPOSIT_PENDING', 'DEPOSIT_PAID',
  'CONFIRMED', 'COMPLETED', 'CANCELLED', 'DECLINED', 'DISPUTED'
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  booker_name TEXT NOT NULL,
  booker_phone TEXT NOT NULL,
  booker_email TEXT,
  type booking_type NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  location_city TEXT NOT NULL,
  location_venue TEXT,
  budget_min INTEGER NOT NULL CHECK (budget_min > 0),
  budget_max INTEGER NOT NULL CHECK (budget_max > 0),
  notes TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  status booking_status NOT NULL DEFAULT 'REQUESTED',
  reference_code TEXT NOT NULL UNIQUE,
  decline_reason TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_at > start_at),
  CHECK (budget_max >= budget_min)
);

CREATE INDEX idx_bookings_creator ON bookings(creator_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_ref ON bookings(reference_code);

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
