-- FanNu Complete Database Migration
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 001: CREATORS
-- ============================================================================
CREATE TYPE creator_status AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED');

CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  booking_enabled BOOLEAN NOT NULL DEFAULT false,
  booking_approved BOOLEAN NOT NULL DEFAULT false,
  default_deposit_percent INTEGER NOT NULL DEFAULT 30 CHECK (default_deposit_percent BETWEEN 10 AND 100),
  default_deposit_refundable BOOLEAN NOT NULL DEFAULT true,
  default_additional_terms TEXT,
  status creator_status NOT NULL DEFAULT 'PENDING_APPROVAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_creators_slug ON creators(slug);
CREATE INDEX idx_creators_user_id ON creators(user_id);
CREATE INDEX idx_creators_status ON creators(status);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_creators_updated_at
  BEFORE UPDATE ON creators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 002: DROPS
-- ============================================================================
CREATE TYPE drop_type AS ENUM ('EVENT', 'MERCH', 'CONTENT', 'CUSTOM');
CREATE TYPE drop_status AS ENUM ('DRAFT', 'SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED');

CREATE TABLE drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  type drop_type NOT NULL,
  status drop_status NOT NULL DEFAULT 'DRAFT',
  scheduled_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  price INTEGER,
  currency TEXT NOT NULL DEFAULT 'ETB',
  total_slots INTEGER,
  slots_remaining INTEGER,
  vip_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_drops_creator ON drops(creator_id);
CREATE INDEX idx_drops_slug ON drops(slug);
CREATE INDEX idx_drops_status ON drops(status);

CREATE TRIGGER update_drops_updated_at
  BEFORE UPDATE ON drops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 003: VIP SUBSCRIPTIONS
-- ============================================================================
CREATE TYPE vip_channel AS ENUM ('TELEGRAM', 'WHATSAPP', 'SMS');
CREATE TYPE vip_source AS ENUM ('DROP_PAGE', 'CREATOR_PROFILE', 'DIRECT_LINK');
CREATE TYPE vip_status AS ENUM ('ACTIVE', 'UNSUBSCRIBED');

CREATE TABLE vip_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  fan_phone TEXT NOT NULL,
  fan_name TEXT,
  channel vip_channel NOT NULL,
  channel_id TEXT,
  source vip_source NOT NULL,
  source_ref TEXT,
  status vip_status NOT NULL DEFAULT 'ACTIVE',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(creator_id, fan_phone)
);

CREATE INDEX idx_vip_creator ON vip_subscriptions(creator_id);
CREATE INDEX idx_vip_status ON vip_subscriptions(status);
CREATE INDEX idx_vip_channel ON vip_subscriptions(channel);

-- ============================================================================
-- 004: PURCHASES
-- ============================================================================
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

-- ============================================================================
-- 005: BOOKINGS
-- ============================================================================
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

-- ============================================================================
-- 006: BOOKING QUOTES
-- ============================================================================
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

-- ============================================================================
-- 007: BOOKING PAYMENTS
-- ============================================================================
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

-- ============================================================================
-- 008: BOOKING EVENT LOG
-- ============================================================================
CREATE TYPE actor_type AS ENUM ('BOOKER', 'CREATOR', 'ADMIN', 'SYSTEM');

CREATE TABLE booking_event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_type actor_type NOT NULL,
  actor_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_booking ON booking_event_log(booking_id);
CREATE INDEX idx_blog_created ON booking_event_log(created_at);

-- ============================================================================
-- 009: BROADCASTS
-- ============================================================================
CREATE TYPE broadcast_segment AS ENUM ('ALL', 'VIP_ONLY', 'PURCHASERS');
CREATE TYPE broadcast_status AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED');

CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  drop_id UUID REFERENCES drops(id),
  message_text TEXT NOT NULL,
  media_url TEXT,
  segment broadcast_segment NOT NULL DEFAULT 'ALL',
  channels vip_channel[] NOT NULL DEFAULT '{TELEGRAM}',
  status broadcast_status NOT NULL DEFAULT 'DRAFT',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipients_count INTEGER,
  delivered_count INTEGER,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_broadcasts_creator ON broadcasts(creator_id);
CREATE INDEX idx_broadcasts_status ON broadcasts(status);

-- ============================================================================
-- 010: ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view active creators" ON creators FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Public can view published drops" ON drops FOR SELECT USING (status IN ('LIVE', 'SCHEDULED', 'ENDED'));

-- Creator policies
CREATE POLICY "Creators manage own profile" ON creators FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Creators manage own drops" ON drops FOR ALL USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));
CREATE POLICY "Creators view own bookings" ON bookings FOR SELECT USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));
CREATE POLICY "Creators update own bookings" ON bookings FOR UPDATE USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));
CREATE POLICY "Creators view own VIPs" ON vip_subscriptions FOR SELECT USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));
CREATE POLICY "Creators manage own broadcasts" ON broadcasts FOR ALL USING (creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));

-- Public write policies
CREATE POLICY "Anyone can submit booking" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can join VIP" ON vip_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can purchase" ON purchases FOR INSERT WITH CHECK (true);

-- Public read by ID (secured by UUID)
CREATE POLICY "Public can view booking by ID" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public can view quotes" ON booking_quotes FOR SELECT USING (true);
CREATE POLICY "Public can view booking payments" ON booking_payments FOR SELECT USING (true);
CREATE POLICY "Public can view purchases" ON purchases FOR SELECT USING (true);
