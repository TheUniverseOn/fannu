/**
 * FanNu Application Constants
 */

// Badge variant types
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

// Booking Status Configuration
export const BOOKING_STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: { label: 'Draft', variant: 'secondary' },
  pending: { label: 'Pending', variant: 'warning' },
  quoted: { label: 'Quoted', variant: 'default' },
  accepted: { label: 'Accepted', variant: 'success' },
  deposit_paid: { label: 'Deposit Paid', variant: 'success' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  expired: { label: 'Expired', variant: 'outline' },
} as const;

// Drop Status Configuration
export const DROP_STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: { label: 'Draft', variant: 'secondary' },
  scheduled: { label: 'Scheduled', variant: 'warning' },
  live: { label: 'Live', variant: 'success' },
  ended: { label: 'Ended', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
} as const;

// Payment Status Configuration
export const PAYMENT_STATUS_CONFIG: Record<string, StatusConfig> = {
  pending: { label: 'Pending', variant: 'warning' },
  processing: { label: 'Processing', variant: 'default' },
  completed: { label: 'Completed', variant: 'success' },
  failed: { label: 'Failed', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
} as const;

// Combined STATUS_CONFIG for convenience
export const STATUS_CONFIG = {
  booking: BOOKING_STATUS_CONFIG,
  drop: DROP_STATUS_CONFIG,
  payment: PAYMENT_STATUS_CONFIG,
} as const;

// Booking Type Labels
export const BOOKING_TYPE_LABELS: Record<string, string> = {
  performance: 'Performance',
  appearance: 'Appearance',
  private_event: 'Private Event',
  corporate: 'Corporate Event',
  wedding: 'Wedding',
  birthday: 'Birthday Party',
  concert: 'Concert',
  festival: 'Festival',
  club: 'Club Night',
  virtual: 'Virtual Event',
  other: 'Other',
} as const;

// Drop Type Labels
export const DROP_TYPE_LABELS: Record<string, string> = {
  merch: 'Merchandise',
  ticket: 'Ticket',
  experience: 'Experience',
  content: 'Exclusive Content',
  meet_greet: 'Meet & Greet',
  shoutout: 'Shoutout',
  video_message: 'Video Message',
  other: 'Other',
} as const;

// VIP Channel Labels
export const VIP_CHANNEL_LABELS: Record<string, string> = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  email: 'Email',
} as const;

// Valid Booking State Transitions
export const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['pending', 'cancelled'],
  pending: ['quoted', 'rejected', 'cancelled'],
  quoted: ['accepted', 'rejected', 'expired', 'cancelled'],
  accepted: ['deposit_paid', 'cancelled'],
  deposit_paid: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  rejected: [],
  expired: ['pending'], // Can resubmit
} as const;

// Support Contact
export const SUPPORT_WHATSAPP = '+251900000000'; // TODO: Replace with actual support number
