-- 008_booking_event_log.sql
-- Audit log for booking state changes

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
