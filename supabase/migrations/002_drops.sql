-- 002_drops.sql
-- Drops (timed releases, events, merch, content)

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
