-- 003_vip_subscriptions.sql
-- VIP list subscriptions

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
