-- 009_broadcasts.sql
-- Broadcast messages to VIP lists

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
