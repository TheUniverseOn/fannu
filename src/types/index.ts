/**
 * FanNu Platform Type Definitions
 *
 * This file contains all TypeScript types that mirror the database schema
 * for the FanNu creator platform.
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Status of a creator account
 */
export type CreatorStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED';

/**
 * Type of drop (exclusive offering)
 */
export type DropType = 'EVENT' | 'MERCH' | 'CONTENT' | 'CUSTOM';

/**
 * Status of a drop
 */
export type DropStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';

/**
 * Communication channel for VIP subscriptions
 */
export type VIPChannel = 'TELEGRAM' | 'WHATSAPP' | 'SMS';

/**
 * Source where a VIP subscription originated
 */
export type VIPSource = 'DROP_PAGE' | 'CREATOR_PROFILE' | 'DIRECT_LINK';

/**
 * Status of a VIP subscription
 */
export type VIPStatus = 'ACTIVE' | 'UNSUBSCRIBED';

/**
 * Status of a payment transaction
 */
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

/**
 * Type of booking request
 */
export type BookingType = 'LIVE_PERFORMANCE' | 'MC_HOSTING' | 'BRAND_CONTENT' | 'CUSTOM';

/**
 * Status of a booking through its lifecycle
 */
export type BookingStatus =
  | 'REQUESTED'
  | 'QUOTED'
  | 'DEPOSIT_PENDING'
  | 'DEPOSIT_PAID'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

/**
 * Status of a booking quote
 */
export type QuoteStatus = 'ACTIVE' | 'EXPIRED' | 'SUPERSEDED';

/**
 * Type of payment in a booking (deposit or remainder)
 */
export type BookingPaymentType = 'DEPOSIT' | 'REMAINDER';

/**
 * Type of actor performing an action in the system
 */
export type ActorType = 'BOOKER' | 'CREATOR' | 'ADMIN' | 'SYSTEM';

/**
 * Target segment for a broadcast message
 */
export type BroadcastSegment = 'ALL' | 'VIP_ONLY' | 'PURCHASERS';

/**
 * Status of a broadcast message
 */
export type BroadcastStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';

// ============================================================================
// ENTITY INTERFACES
// ============================================================================

/**
 * Creator profile entity
 * Represents a creator on the FanNu platform
 */
export interface Creator {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  phone: string;
  email: string;
  booking_enabled: boolean;
  booking_approved: boolean;
  default_deposit_percent: number;
  default_deposit_refundable: boolean;
  default_additional_terms: string | null;
  status: CreatorStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Drop entity
 * Represents an exclusive offering (event, merch, content, etc.) from a creator
 */
export interface Drop {
  id: string;
  creator_id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  type: DropType;
  status: DropStatus;
  scheduled_at: string | null;
  ends_at: string | null;
  price: number;
  currency: string;
  total_slots: number | null;
  slots_remaining: number | null;
  vip_required: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * VIP Subscription entity
 * Represents a fan's VIP subscription to a creator
 */
export interface VIPSubscription {
  id: string;
  creator_id: string;
  fan_phone: string;
  fan_name: string | null;
  channel: VIPChannel;
  channel_id: string | null;
  source: VIPSource;
  source_ref: string | null;
  status: VIPStatus;
  joined_at: string;
}

/**
 * Purchase entity
 * Represents a fan's purchase of a drop
 */
export interface Purchase {
  id: string;
  drop_id: string;
  fan_phone: string;
  fan_name: string | null;
  quantity: number;
  amount: number;
  currency: string;
  psp_ref: string | null;
  payment_status: PaymentStatus;
  receipt_id: string | null;
  created_at: string;
  paid_at: string | null;
}

/**
 * Booking entity
 * Represents a booking request for a creator's services
 */
export interface Booking {
  id: string;
  creator_id: string;
  booker_name: string;
  booker_phone: string;
  booker_email: string | null;
  type: BookingType;
  start_at: string;
  end_at: string | null;
  location_city: string | null;
  location_venue: string | null;
  budget_min: number | null;
  budget_max: number | null;
  notes: string | null;
  attachments: string[] | null;
  status: BookingStatus;
  reference_code: string;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Booking Quote entity
 * Represents a price quote from a creator for a booking
 */
export interface BookingQuote {
  id: string;
  booking_id: string;
  total_amount: number;
  deposit_percent: number;
  deposit_amount: number;
  currency: string;
  deposit_refundable: boolean;
  expires_at: string;
  terms_text: string | null;
  status: QuoteStatus;
  created_at: string;
}

/**
 * Booking Payment entity
 * Represents a payment made for a booking (deposit or remainder)
 */
export interface BookingPayment {
  id: string;
  booking_id: string;
  quote_id: string;
  psp_ref: string | null;
  amount: number;
  currency: string;
  type: BookingPaymentType;
  status: PaymentStatus;
  receipt_id: string | null;
  created_at: string;
  paid_at: string | null;
}

/**
 * Booking Event Log entity
 * Represents an event in the booking lifecycle for audit purposes
 */
export interface BookingEventLog {
  id: string;
  booking_id: string;
  event_type: string;
  actor_type: ActorType;
  actor_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Broadcast entity
 * Represents a message broadcast from a creator to their fans
 */
export interface Broadcast {
  id: string;
  creator_id: string;
  drop_id: string | null;
  message_text: string;
  media_url: string | null;
  segment: BroadcastSegment;
  channels: VIPChannel[];
  status: BroadcastStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  recipients_count: number;
  delivered_count: number;
  created_at: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for creating a new entity (omits auto-generated fields)
 */
export type CreateCreator = Omit<Creator, 'id' | 'created_at' | 'updated_at'>;
export type CreateDrop = Omit<Drop, 'id' | 'created_at' | 'updated_at'>;
export type CreateVIPSubscription = Omit<VIPSubscription, 'id' | 'joined_at'>;
export type CreatePurchase = Omit<Purchase, 'id' | 'created_at' | 'paid_at'>;
export type CreateBooking = Omit<Booking, 'id' | 'reference_code' | 'created_at' | 'updated_at'>;
export type CreateBookingQuote = Omit<BookingQuote, 'id' | 'created_at'>;
export type CreateBookingPayment = Omit<BookingPayment, 'id' | 'created_at' | 'paid_at'>;
export type CreateBookingEventLog = Omit<BookingEventLog, 'id' | 'created_at'>;
export type CreateBroadcast = Omit<Broadcast, 'id' | 'created_at' | 'sent_at' | 'recipients_count' | 'delivered_count'>;

/**
 * Type for updating an entity (all fields optional except id)
 */
export type UpdateCreator = Partial<Omit<Creator, 'id' | 'user_id' | 'created_at'>> & { id: string };
export type UpdateDrop = Partial<Omit<Drop, 'id' | 'creator_id' | 'created_at'>> & { id: string };
export type UpdateVIPSubscription = Partial<Omit<VIPSubscription, 'id' | 'creator_id' | 'joined_at'>> & { id: string };
export type UpdatePurchase = Partial<Omit<Purchase, 'id' | 'drop_id' | 'created_at'>> & { id: string };
export type UpdateBooking = Partial<Omit<Booking, 'id' | 'creator_id' | 'reference_code' | 'created_at'>> & { id: string };
export type UpdateBookingQuote = Partial<Omit<BookingQuote, 'id' | 'booking_id' | 'created_at'>> & { id: string };
export type UpdateBookingPayment = Partial<Omit<BookingPayment, 'id' | 'booking_id' | 'quote_id' | 'created_at'>> & { id: string };
export type UpdateBroadcast = Partial<Omit<Broadcast, 'id' | 'creator_id' | 'created_at'>> & { id: string };

/**
 * Type for entities with their related data
 */
export interface DropWithCreator extends Drop {
  creator: Creator;
}

export interface BookingWithQuotes extends Booking {
  quotes: BookingQuote[];
}

export interface BookingWithPayments extends Booking {
  payments: BookingPayment[];
}

export interface BookingFull extends Booking {
  creator: Creator;
  quotes: BookingQuote[];
  payments: BookingPayment[];
  event_logs: BookingEventLog[];
}

export interface BroadcastWithDrop extends Broadcast {
  drop: Drop | null;
}

export interface CreatorWithDrops extends Creator {
  drops: Drop[];
}

export interface CreatorWithVIPs extends Creator {
  vip_subscriptions: VIPSubscription[];
}

export interface CreatorFull extends Creator {
  drops: Drop[];
  vip_subscriptions: VIPSubscription[];
  bookings: Booking[];
  broadcasts: Broadcast[];
}
