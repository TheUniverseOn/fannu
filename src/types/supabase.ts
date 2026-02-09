// Database types for Supabase client
// This is a placeholder that will be replaced with auto-generated types from Supabase CLI
// Run: npx supabase gen types typescript --local > src/types/supabase.ts

export type Database = {
  public: {
    Tables: {
      creators: {
        Row: {
          id: string
          user_id: string
          slug: string
          display_name: string
          bio: string | null
          avatar_url: string | null
          cover_url: string | null
          phone: string
          email: string | null
          booking_enabled: boolean
          booking_approved: boolean
          default_deposit_percent: number
          default_deposit_refundable: boolean
          default_additional_terms: string | null
          status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['creators']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['creators']['Insert']>
      }
      drops: {
        Row: {
          id: string
          creator_id: string
          slug: string
          title: string
          description: string
          cover_image_url: string | null
          type: 'EVENT' | 'MERCH' | 'CONTENT' | 'CUSTOM'
          status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
          scheduled_at: string | null
          ends_at: string | null
          price: number | null
          currency: string
          total_slots: number | null
          slots_remaining: number | null
          vip_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['drops']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['drops']['Insert']>
      }
      vip_subscriptions: {
        Row: {
          id: string
          creator_id: string
          fan_phone: string
          fan_name: string | null
          channel: 'TELEGRAM' | 'WHATSAPP' | 'SMS'
          channel_id: string | null
          source: 'DROP_PAGE' | 'CREATOR_PROFILE' | 'DIRECT_LINK'
          source_ref: string | null
          status: 'ACTIVE' | 'UNSUBSCRIBED'
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['vip_subscriptions']['Row'], 'id' | 'joined_at'>
        Update: Partial<Database['public']['Tables']['vip_subscriptions']['Insert']>
      }
      purchases: {
        Row: {
          id: string
          drop_id: string
          fan_phone: string
          fan_name: string | null
          quantity: number
          amount: number
          currency: string
          psp_ref: string | null
          payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
          receipt_id: string
          created_at: string
          paid_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['purchases']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['purchases']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          creator_id: string
          booker_name: string
          booker_phone: string
          booker_email: string | null
          type: 'LIVE_PERFORMANCE' | 'MC_HOSTING' | 'BRAND_CONTENT' | 'CUSTOM'
          start_at: string
          end_at: string
          location_city: string
          location_venue: string | null
          budget_min: number
          budget_max: number
          notes: string
          attachments: string[]
          status: 'REQUESTED' | 'QUOTED' | 'DEPOSIT_PENDING' | 'DEPOSIT_PAID' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED'
          reference_code: string
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      booking_quotes: {
        Row: {
          id: string
          booking_id: string
          total_amount: number
          deposit_percent: number
          deposit_amount: number
          currency: string
          deposit_refundable: boolean
          expires_at: string
          terms_text: string
          status: 'ACTIVE' | 'EXPIRED' | 'SUPERSEDED'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['booking_quotes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['booking_quotes']['Insert']>
      }
      booking_payments: {
        Row: {
          id: string
          booking_id: string
          quote_id: string
          psp_ref: string | null
          amount: number
          currency: string
          type: 'DEPOSIT' | 'REMAINDER'
          status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
          receipt_id: string
          created_at: string
          paid_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['booking_payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['booking_payments']['Insert']>
      }
      booking_event_log: {
        Row: {
          id: string
          booking_id: string
          event_type: string
          actor_type: 'BOOKER' | 'CREATOR' | 'ADMIN' | 'SYSTEM'
          actor_id: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['booking_event_log']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['booking_event_log']['Insert']>
      }
      broadcasts: {
        Row: {
          id: string
          creator_id: string
          drop_id: string | null
          message_text: string
          media_url: string | null
          segment: 'ALL' | 'VIP_ONLY' | 'PURCHASERS'
          channels: ('TELEGRAM' | 'WHATSAPP' | 'SMS')[]
          status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED'
          scheduled_at: string | null
          sent_at: string | null
          recipients_count: number | null
          delivered_count: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['broadcasts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['broadcasts']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
