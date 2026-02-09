-- 010_rls_policies.sql
-- Row Level Security policies

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
