// Database types generated from schema
// These types mirror the Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      creators: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          display_name: string;
          bio: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          phone: string;
          email: string | null;
          booking_enabled: boolean;
          booking_approved: boolean;
          default_deposit_percent: number;
          default_deposit_refundable: boolean;
          default_additional_terms: string | null;
          status: "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          display_name: string;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          phone: string;
          email?: string | null;
          booking_enabled?: boolean;
          booking_approved?: boolean;
          default_deposit_percent?: number;
          default_deposit_refundable?: boolean;
          default_additional_terms?: string | null;
          status?: "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          slug?: string;
          display_name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          phone?: string;
          email?: string | null;
          booking_enabled?: boolean;
          booking_approved?: boolean;
          default_deposit_percent?: number;
          default_deposit_refundable?: boolean;
          default_additional_terms?: string | null;
          status?: "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      drops: {
        Row: {
          id: string;
          creator_id: string;
          slug: string;
          title: string;
          description: string;
          cover_image_url: string | null;
          type: "EVENT" | "MERCH" | "CONTENT" | "CUSTOM";
          status: "DRAFT" | "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
          scheduled_at: string | null;
          ends_at: string | null;
          price: number | null;
          currency: string;
          total_slots: number | null;
          slots_remaining: number | null;
          vip_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          slug: string;
          title: string;
          description: string;
          cover_image_url?: string | null;
          type: "EVENT" | "MERCH" | "CONTENT" | "CUSTOM";
          status?: "DRAFT" | "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
          scheduled_at?: string | null;
          ends_at?: string | null;
          price?: number | null;
          currency?: string;
          total_slots?: number | null;
          slots_remaining?: number | null;
          vip_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          slug?: string;
          title?: string;
          description?: string;
          cover_image_url?: string | null;
          type?: "EVENT" | "MERCH" | "CONTENT" | "CUSTOM";
          status?: "DRAFT" | "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
          scheduled_at?: string | null;
          ends_at?: string | null;
          price?: number | null;
          currency?: string;
          total_slots?: number | null;
          slots_remaining?: number | null;
          vip_required?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "drops_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "creators";
            referencedColumns: ["id"];
          }
        ];
      };
      vip_subscriptions: {
        Row: {
          id: string;
          creator_id: string;
          fan_phone: string;
          fan_name: string | null;
          channel: "TELEGRAM" | "WHATSAPP" | "SMS";
          channel_id: string | null;
          source: "DROP_PAGE" | "CREATOR_PROFILE" | "DIRECT_LINK";
          source_ref: string | null;
          status: "ACTIVE" | "UNSUBSCRIBED";
          joined_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          fan_phone: string;
          fan_name?: string | null;
          channel: "TELEGRAM" | "WHATSAPP" | "SMS";
          channel_id?: string | null;
          source: "DROP_PAGE" | "CREATOR_PROFILE" | "DIRECT_LINK";
          source_ref?: string | null;
          status?: "ACTIVE" | "UNSUBSCRIBED";
          joined_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          fan_phone?: string;
          fan_name?: string | null;
          channel?: "TELEGRAM" | "WHATSAPP" | "SMS";
          channel_id?: string | null;
          source?: "DROP_PAGE" | "CREATOR_PROFILE" | "DIRECT_LINK";
          source_ref?: string | null;
          status?: "ACTIVE" | "UNSUBSCRIBED";
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vip_subscriptions_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "creators";
            referencedColumns: ["id"];
          }
        ];
      };
      purchases: {
        Row: {
          id: string;
          drop_id: string;
          fan_phone: string;
          fan_name: string | null;
          quantity: number;
          amount: number;
          currency: string;
          psp_ref: string | null;
          payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
          receipt_id: string;
          created_at: string;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          drop_id: string;
          fan_phone: string;
          fan_name?: string | null;
          quantity?: number;
          amount: number;
          currency?: string;
          psp_ref?: string | null;
          payment_status?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
          receipt_id: string;
          created_at?: string;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          drop_id?: string;
          fan_phone?: string;
          fan_name?: string | null;
          quantity?: number;
          amount?: number;
          currency?: string;
          psp_ref?: string | null;
          payment_status?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
          receipt_id?: string;
          created_at?: string;
          paid_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "purchases_drop_id_fkey";
            columns: ["drop_id"];
            referencedRelation: "drops";
            referencedColumns: ["id"];
          }
        ];
      };
      bookings: {
        Row: {
          id: string;
          creator_id: string;
          booker_name: string;
          booker_phone: string;
          booker_email: string | null;
          type: "LIVE_PERFORMANCE" | "MC_HOSTING" | "BRAND_CONTENT" | "CUSTOM";
          start_at: string;
          end_at: string;
          location_city: string;
          location_venue: string | null;
          budget_min: number;
          budget_max: number;
          notes: string;
          attachments: string[];
          status: "REQUESTED" | "QUOTED" | "DEPOSIT_PENDING" | "DEPOSIT_PAID" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "DECLINED" | "DISPUTED";
          reference_code: string;
          decline_reason: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          booker_name: string;
          booker_phone: string;
          booker_email?: string | null;
          type: "LIVE_PERFORMANCE" | "MC_HOSTING" | "BRAND_CONTENT" | "CUSTOM";
          start_at: string;
          end_at: string;
          location_city: string;
          location_venue?: string | null;
          budget_min: number;
          budget_max: number;
          notes: string;
          attachments?: string[];
          status?: "REQUESTED" | "QUOTED" | "DEPOSIT_PENDING" | "DEPOSIT_PAID" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "DECLINED" | "DISPUTED";
          reference_code: string;
          decline_reason?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          booker_name?: string;
          booker_phone?: string;
          booker_email?: string | null;
          type?: "LIVE_PERFORMANCE" | "MC_HOSTING" | "BRAND_CONTENT" | "CUSTOM";
          start_at?: string;
          end_at?: string;
          location_city?: string;
          location_venue?: string | null;
          budget_min?: number;
          budget_max?: number;
          notes?: string;
          attachments?: string[];
          status?: "REQUESTED" | "QUOTED" | "DEPOSIT_PENDING" | "DEPOSIT_PAID" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "DECLINED" | "DISPUTED";
          reference_code?: string;
          decline_reason?: string | null;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "creators";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_quotes: {
        Row: {
          id: string;
          booking_id: string;
          total_amount: number;
          deposit_percent: number;
          deposit_amount: number;
          currency: string;
          deposit_refundable: boolean;
          expires_at: string;
          terms_text: string;
          status: "ACTIVE" | "EXPIRED" | "SUPERSEDED" | "ACCEPTED" | "DECLINED";
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          total_amount: number;
          deposit_percent: number;
          deposit_amount: number;
          currency?: string;
          deposit_refundable?: boolean;
          expires_at: string;
          terms_text: string;
          status?: "ACTIVE" | "EXPIRED" | "SUPERSEDED" | "ACCEPTED" | "DECLINED";
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          total_amount?: number;
          deposit_percent?: number;
          deposit_amount?: number;
          currency?: string;
          deposit_refundable?: boolean;
          expires_at?: string;
          terms_text?: string;
          status?: "ACTIVE" | "EXPIRED" | "SUPERSEDED" | "ACCEPTED" | "DECLINED";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_quotes_booking_id_fkey";
            columns: ["booking_id"];
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_payments: {
        Row: {
          id: string;
          booking_id: string;
          quote_id: string;
          psp_ref: string | null;
          amount: number;
          currency: string;
          type: "DEPOSIT" | "REMAINDER";
          status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
          receipt_id: string;
          created_at: string;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          booking_id: string;
          quote_id: string;
          psp_ref?: string | null;
          amount: number;
          currency?: string;
          type?: "DEPOSIT" | "REMAINDER";
          status?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
          receipt_id: string;
          created_at?: string;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string;
          quote_id?: string;
          psp_ref?: string | null;
          amount?: number;
          currency?: string;
          type?: "DEPOSIT" | "REMAINDER";
          status?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
          receipt_id?: string;
          created_at?: string;
          paid_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "booking_payments_booking_id_fkey";
            columns: ["booking_id"];
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_payments_quote_id_fkey";
            columns: ["quote_id"];
            referencedRelation: "booking_quotes";
            referencedColumns: ["id"];
          }
        ];
      };
      booking_event_log: {
        Row: {
          id: string;
          booking_id: string;
          event_type: string;
          actor_type: "BOOKER" | "CREATOR" | "ADMIN" | "SYSTEM";
          actor_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          event_type: string;
          actor_type: "BOOKER" | "CREATOR" | "ADMIN" | "SYSTEM";
          actor_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          event_type?: string;
          actor_type?: "BOOKER" | "CREATOR" | "ADMIN" | "SYSTEM";
          actor_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_event_log_booking_id_fkey";
            columns: ["booking_id"];
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          }
        ];
      };
      broadcasts: {
        Row: {
          id: string;
          creator_id: string;
          drop_id: string | null;
          message_text: string;
          media_url: string | null;
          segment: "ALL" | "VIP_ONLY" | "PURCHASERS";
          channels: ("TELEGRAM" | "WHATSAPP" | "SMS")[];
          status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
          scheduled_at: string | null;
          sent_at: string | null;
          recipients_count: number | null;
          delivered_count: number | null;
          failed_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          drop_id?: string | null;
          message_text: string;
          media_url?: string | null;
          segment?: "ALL" | "VIP_ONLY" | "PURCHASERS";
          channels?: ("TELEGRAM" | "WHATSAPP" | "SMS")[];
          status?: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
          scheduled_at?: string | null;
          sent_at?: string | null;
          recipients_count?: number | null;
          delivered_count?: number | null;
          failed_count?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          drop_id?: string | null;
          message_text?: string;
          media_url?: string | null;
          segment?: "ALL" | "VIP_ONLY" | "PURCHASERS";
          channels?: ("TELEGRAM" | "WHATSAPP" | "SMS")[];
          status?: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
          scheduled_at?: string | null;
          sent_at?: string | null;
          recipients_count?: number | null;
          delivered_count?: number | null;
          failed_count?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "broadcasts_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "creators";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "broadcasts_drop_id_fkey";
            columns: ["drop_id"];
            referencedRelation: "drops";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      creator_status: "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED";
      drop_type: "EVENT" | "MERCH" | "CONTENT" | "CUSTOM";
      drop_status: "DRAFT" | "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
      vip_channel: "TELEGRAM" | "WHATSAPP" | "SMS";
      vip_source: "DROP_PAGE" | "CREATOR_PROFILE" | "DIRECT_LINK";
      vip_status: "ACTIVE" | "UNSUBSCRIBED";
      payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
      booking_type: "LIVE_PERFORMANCE" | "MC_HOSTING" | "BRAND_CONTENT" | "CUSTOM";
      booking_status: "REQUESTED" | "QUOTED" | "DEPOSIT_PENDING" | "DEPOSIT_PAID" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "DECLINED" | "DISPUTED";
      quote_status: "ACTIVE" | "EXPIRED" | "SUPERSEDED" | "ACCEPTED" | "DECLINED";
      booking_payment_type: "DEPOSIT" | "REMAINDER";
      actor_type: "BOOKER" | "CREATOR" | "ADMIN" | "SYSTEM";
      broadcast_segment: "ALL" | "VIP_ONLY" | "PURCHASERS";
      broadcast_status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
    };
    CompositeTypes: Record<string, never>;
  };
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
