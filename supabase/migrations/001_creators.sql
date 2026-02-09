-- 001_creators.sql
-- Creator profiles and settings

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

-- Trigger to auto-update updated_at
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
