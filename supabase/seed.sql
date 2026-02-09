-- seed.sql
-- Sample data for FanNu platform development and testing

-- ============================================
-- Sample Creator
-- ============================================

INSERT INTO creators (
    id,
    slug,
    display_name,
    bio,
    avatar_url,
    cover_url,
    phone,
    email,
    booking_enabled,
    booking_approved,
    default_deposit_percent,
    default_deposit_refundable,
    default_additional_terms,
    status
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'teddy-afro',
    'Teddy Afro',
    'Ethiopian singer-songwriter and one of the most popular artists in Ethiopia. Known for songs promoting unity and love.',
    'https://example.com/avatars/teddy-afro.jpg',
    'https://example.com/covers/teddy-afro-cover.jpg',
    '+251911234567',
    'contact@teddyafro.com',
    true,
    true,
    50,
    true,
    'All bookings are subject to availability. Travel and accommodation costs are additional.',
    'active'
);

-- ============================================
-- Sample Drops
-- ============================================

-- Drop 1: Concert Ticket
INSERT INTO drops (
    id,
    creator_id,
    slug,
    title,
    description,
    cover_image_url,
    type,
    status,
    scheduled_at,
    ends_at,
    price,
    currency,
    total_slots,
    slots_remaining,
    vip_required
) VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'ethiopia-unite-tour-2024',
    'Ethiopia Unite Tour 2024 - VIP Ticket',
    'Exclusive VIP access to the Ethiopia Unite Tour. Includes front row seating, meet and greet, and signed merchandise.',
    'https://example.com/drops/ethiopia-unite-tour.jpg',
    'ticket',
    'active',
    '2024-03-15 18:00:00+03',
    '2024-03-15 23:59:59+03',
    5000.00,
    'ETB',
    100,
    67,
    false
);

-- Drop 2: Limited Edition Merch
INSERT INTO drops (
    id,
    creator_id,
    slug,
    title,
    description,
    cover_image_url,
    type,
    status,
    scheduled_at,
    ends_at,
    price,
    currency,
    total_slots,
    slots_remaining,
    vip_required
) VALUES (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'tikur-sew-hoodie-limited',
    'Tikur Sew Limited Edition Hoodie',
    'Limited edition hoodie featuring artwork from the iconic Tikur Sew album. Only 50 available worldwide.',
    'https://example.com/drops/tikur-sew-hoodie.jpg',
    'merch',
    'active',
    NULL,
    NULL,
    2500.00,
    'ETB',
    50,
    23,
    true
);

-- ============================================
-- Sample VIP Subscriptions
-- ============================================

-- VIP Subscriber 1
INSERT INTO vip_subscriptions (
    id,
    creator_id,
    fan_phone,
    fan_name,
    fan_email,
    channel,
    source,
    status,
    started_at,
    expires_at,
    amount_paid,
    currency,
    transaction_ref
) VALUES (
    'd4e5f6a7-b8c9-0123-def0-234567890123',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '+251912345678',
    'Abebe Bikila',
    'abebe@example.com',
    'telegram',
    'chapa',
    'active',
    now() - interval '30 days',
    now() + interval '335 days',
    1200.00,
    'ETB',
    'CHAPA-TXN-001'
);

-- VIP Subscriber 2
INSERT INTO vip_subscriptions (
    id,
    creator_id,
    fan_phone,
    fan_name,
    fan_email,
    channel,
    source,
    status,
    started_at,
    expires_at,
    amount_paid,
    currency,
    transaction_ref
) VALUES (
    'e5f6a7b8-c9d0-1234-ef01-345678901234',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '+251923456789',
    'Sara Mengesha',
    'sara.m@example.com',
    'web',
    'telebirr',
    'active',
    now() - interval '15 days',
    now() + interval '350 days',
    1200.00,
    'ETB',
    'TELEBIRR-TXN-002'
);

-- VIP Subscriber 3
INSERT INTO vip_subscriptions (
    id,
    creator_id,
    fan_phone,
    fan_name,
    fan_email,
    channel,
    source,
    status,
    started_at,
    expires_at,
    amount_paid,
    currency,
    transaction_ref
) VALUES (
    'f6a7b8c9-d0e1-2345-f012-456789012345',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '+251934567890',
    'Dawit Tesfaye',
    NULL,
    'whatsapp',
    'cbe',
    'active',
    now() - interval '7 days',
    now() + interval '358 days',
    1200.00,
    'ETB',
    'CBE-TXN-003'
);

-- ============================================
-- Sample Booking
-- ============================================

INSERT INTO bookings (
    id,
    creator_id,
    reference_code,
    fan_phone,
    fan_name,
    fan_email,
    fan_organization,
    booking_type,
    title,
    description,
    event_date,
    event_time,
    event_duration_hours,
    event_location,
    event_city,
    attendee_count,
    proposed_budget,
    currency,
    deposit_percent,
    deposit_refundable,
    status,
    additional_terms
) VALUES (
    'a7b8c9d0-e1f2-3456-0123-567890123456',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'BK-SAMPLE01',
    '+251945678901',
    'Kidist Alemayehu',
    'kidist@corporateevent.com',
    'Ethiopian Airlines',
    'performance',
    'Ethiopian Airlines 80th Anniversary Gala',
    'We would like to invite you to perform at our 80th anniversary celebration. The event will be attended by 500 VIP guests including government officials and international partners. We are looking for a 45-minute performance of your greatest hits.',
    '2024-04-15',
    '20:00:00',
    1.5,
    'Skylight Hotel Grand Ballroom',
    'Addis Ababa',
    500,
    500000.00,
    'ETB',
    50,
    true,
    'pending',
    NULL
);

-- ============================================
-- Sample Booking Event Log Entry
-- ============================================

INSERT INTO booking_event_log (
    id,
    booking_id,
    actor_type,
    actor_id,
    actor_name,
    event_type,
    event_description,
    previous_status,
    new_status
) VALUES (
    'b8c9d0e1-f2a3-4567-1234-678901234567',
    'a7b8c9d0-e1f2-3456-0123-567890123456',
    'fan',
    '+251945678901',
    'Kidist Alemayehu',
    'booking_created',
    'New booking request submitted for Ethiopian Airlines 80th Anniversary Gala',
    NULL,
    'pending'
);

-- ============================================
-- Verification Queries (commented out)
-- ============================================

-- SELECT * FROM creators;
-- SELECT * FROM drops;
-- SELECT * FROM vip_subscriptions;
-- SELECT * FROM bookings;
-- SELECT * FROM booking_event_log;
