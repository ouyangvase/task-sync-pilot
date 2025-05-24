export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          points_required: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          points_required: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          points_required?: number
          title?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          new_values: Json | null
          old_values: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      birthday_gifts: {
        Row: {
          claimed: boolean
          created_at: string
          expires_at: string
          gift_type: string
          id: string
          user_id: string
          value: number
          year: number
        }
        Insert: {
          claimed?: boolean
          created_at?: string
          expires_at: string
          gift_type: string
          id?: string
          user_id: string
          value: number
          year: number
        }
        Update: {
          claimed?: boolean
          created_at?: string
          expires_at?: string
          gift_type?: string
          id?: string
          user_id?: string
          value?: number
          year?: number
        }
        Relationships: []
      }
      city_statistics: {
        Row: {
          available_properties: number
          average_price: number
          city: string
          created_at: string | null
          id: string
          last_updated: string | null
          market_trend: string
          price_change_percentage: number
          total_properties: number
          updated_at: string | null
        }
        Insert: {
          available_properties: number
          average_price: number
          city: string
          created_at?: string | null
          id?: string
          last_updated?: string | null
          market_trend: string
          price_change_percentage: number
          total_properties: number
          updated_at?: string | null
        }
        Update: {
          available_properties?: number
          average_price?: number
          city?: string
          created_at?: string | null
          id?: string
          last_updated?: string | null
          market_trend?: string
          price_change_percentage?: number
          total_properties?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          check_in_date: string
          created_at: string
          id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          check_in_date?: string
          created_at?: string
          id?: string
          points_awarded?: number
          user_id: string
        }
        Update: {
          check_in_date?: string
          created_at?: string
          id?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          content_text: string | null
          created_at: string
          description: string | null
          document_type: string
          extracted_data: Json | null
          file_url: string
          id: string
          lease_id: string | null
          processing_status: string | null
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          description?: string | null
          document_type: string
          extracted_data?: Json | null
          file_url: string
          id?: string
          lease_id?: string | null
          processing_status?: string | null
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          content_text?: string | null
          created_at?: string
          description?: string | null
          document_type?: string
          extracted_data?: Json | null
          file_url?: string
          id?: string
          lease_id?: string | null
          processing_status?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_items: {
        Row: {
          can_harvest: boolean
          coins_reward: number
          created_at: string
          growth_stage: number
          id: string
          image_url: string
          last_harvested: string | null
          max_growth_stage: number
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_harvest?: boolean
          coins_reward: number
          created_at?: string
          growth_stage?: number
          id?: string
          image_url: string
          last_harvested?: string | null
          max_growth_stage: number
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_harvest?: boolean
          coins_reward?: number
          created_at?: string
          growth_stage?: number
          id?: string
          image_url?: string
          last_harvested?: string | null
          max_growth_stage?: number
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      farm_items_templates: {
        Row: {
          coins_reward: number
          cost_coins: number
          created_at: string
          description: string | null
          growth_time_hours: number
          id: string
          image_url: string
          is_active: boolean
          name: string
          type: string
          unlock_level: number
          updated_at: string
        }
        Insert: {
          coins_reward: number
          cost_coins?: number
          created_at?: string
          description?: string | null
          growth_time_hours: number
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          type: string
          unlock_level?: number
          updated_at?: string
        }
        Update: {
          coins_reward?: number
          cost_coins?: number
          created_at?: string
          description?: string | null
          growth_time_hours?: number
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          type?: string
          unlock_level?: number
          updated_at?: string
        }
        Relationships: []
      }
      leases: {
        Row: {
          agreement_access_ids: string[] | null
          created_at: string
          document_url: string | null
          end_date: string
          id: string
          rent_amount: number
          rental_agreement_uploaded_at: string | null
          rental_agreement_url: string | null
          security_deposit: number
          start_date: string
          status: string
          tenant_id: string
          unit_number: string
          updated_at: string
        }
        Insert: {
          agreement_access_ids?: string[] | null
          created_at?: string
          document_url?: string | null
          end_date: string
          id?: string
          rent_amount: number
          rental_agreement_uploaded_at?: string | null
          rental_agreement_url?: string | null
          security_deposit: number
          start_date: string
          status?: string
          tenant_id: string
          unit_number: string
          updated_at?: string
        }
        Update: {
          agreement_access_ids?: string[] | null
          created_at?: string
          document_url?: string | null
          end_date?: string
          id?: string
          rent_amount?: number
          rental_agreement_uploaded_at?: string | null
          rental_agreement_url?: string | null
          security_deposit?: number
          start_date?: string
          status?: string
          tenant_id?: string
          unit_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          created_at: string
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          tenant_id: string
          title: string
          unit_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          tenant_id: string
          title: string
          unit_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          tenant_id?: string
          title?: string
          unit_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_profiles: {
        Row: {
          business_address: string | null
          business_category: string
          business_documents: Json | null
          business_license_url: string | null
          business_registration_number: string | null
          city: string | null
          company_name: string
          contact_email: string
          contact_phone: string | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          postcode: string | null
          state: string | null
          tax_id: string | null
          updated_at: string
          verification_notes: string | null
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          business_address?: string | null
          business_category: string
          business_documents?: Json | null
          business_license_url?: string | null
          business_registration_number?: string | null
          city?: string | null
          company_name: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          id: string
          latitude?: number | null
          longitude?: number | null
          postcode?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          business_address?: string | null
          business_category?: string
          business_documents?: Json | null
          business_license_url?: string | null
          business_registration_number?: string | null
          city?: string | null
          company_name?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          postcode?: string | null
          state?: string | null
          tax_id?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      merchant_reviews: {
        Row: {
          created_at: string
          id: string
          merchant_id: string
          merchant_response: string | null
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          merchant_id: string
          merchant_response?: string | null
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          merchant_id?: string
          merchant_response?: string | null
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_reviews_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_scans: {
        Row: {
          id: string
          location: string | null
          merchant_id: string
          qr_code_id: string
          scanned_at: string | null
          status: string
        }
        Insert: {
          id?: string
          location?: string | null
          merchant_id: string
          qr_code_id: string
          scanned_at?: string | null
          status?: string
        }
        Update: {
          id?: string
          location?: string | null
          merchant_id?: string
          qr_code_id?: string
          scanned_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_scans_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_scans_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "reward_qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_support_tickets: {
        Row: {
          created_at: string
          description: string
          id: string
          merchant_id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          merchant_id: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          merchant_id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_support_tickets_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          created_at: string
          description: string
          expires_at: string | null
          id: string
          reward_amount: number
          reward_type: string
          target: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          reward_amount: number
          reward_type: string
          target: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          reward_amount?: number
          reward_type?: string
          target?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_disputes: {
        Row: {
          created_at: string | null
          description: string
          dispute_type: string
          id: string
          landlord_id: string
          payment_id: string | null
          resolution: string | null
          resolved_at: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          dispute_type: string
          id?: string
          landlord_id: string
          payment_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          dispute_type?: string
          id?: string
          landlord_id?: string
          payment_id?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_disputes_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_method_benefits: {
        Row: {
          created_at: string
          description: string
          id: string
          method_type: Database["public"]["Enums"]["payment_method_type"]
          min_points_required: number | null
          points_discount: number | null
          points_multiplier: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          method_type: Database["public"]["Enums"]["payment_method_type"]
          min_points_required?: number | null
          points_discount?: number | null
          points_multiplier?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          method_type?: Database["public"]["Enums"]["payment_method_type"]
          min_points_required?: number | null
          points_discount?: number | null
          points_multiplier?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_number: string | null
          created_at: string
          id: string
          is_default: boolean | null
          method_type: string
          routing_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          method_type: string
          routing_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          method_type?: string
          routing_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_provider_benefits: {
        Row: {
          created_at: string
          description: string
          end_date: string
          id: string
          is_active: boolean | null
          minimum_spend: number | null
          points_multiplier: number | null
          provider_id: string
          start_date: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date: string
          id?: string
          is_active?: boolean | null
          minimum_spend?: number | null
          points_multiplier?: number | null
          provider_id: string
          start_date: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          minimum_spend?: number | null
          points_multiplier?: number | null
          provider_id?: string
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_provider_benefits_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "payment_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_providers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          points_multiplier: number | null
          processing_fee: number | null
          provider_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          points_multiplier?: number | null
          processing_fee?: number | null
          provider_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          points_multiplier?: number | null
          processing_fee?: number | null
          provider_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_reminder_settings: {
        Row: {
          created_at: string | null
          email_reminders: boolean | null
          id: string
          push_reminders: boolean | null
          reminder_days: number[] | null
          sms_reminders: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_reminders?: boolean | null
          id?: string
          push_reminders?: boolean | null
          reminder_days?: number[] | null
          sms_reminders?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_reminders?: boolean | null
          id?: string
          push_reminders?: boolean | null
          reminder_days?: number[] | null
          sms_reminders?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_reminders: {
        Row: {
          due_date: string
          id: string
          payment_id: string
          reminder_content: Json | null
          reminder_type: string
          sent_at: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          due_date: string
          id?: string
          payment_id: string
          reminder_content?: Json | null
          reminder_type: string
          sent_at?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          due_date?: string
          id?: string
          payment_id?: string
          reminder_content?: Json | null
          reminder_type?: string
          sent_at?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          escrow_status: string | null
          escrow_verified_at: string | null
          id: string
          lease_id: string | null
          paid_date: string | null
          payment_method: string
          payment_type: string | null
          recurring_payment_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          escrow_status?: string | null
          escrow_verified_at?: string | null
          id?: string
          lease_id?: string | null
          paid_date?: string | null
          payment_method: string
          payment_type?: string | null
          recurring_payment_id?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          escrow_status?: string | null
          escrow_verified_at?: string | null
          id?: string
          lease_id?: string | null
          paid_date?: string | null
          payment_method?: string
          payment_type?: string | null
          recurring_payment_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_recurring_payment_id_fkey"
            columns: ["recurring_payment_id"]
            isOneToOne: false
            referencedRelation: "recurring_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          elite_status: Database["public"]["Enums"]["elite_status"] | null
          elite_status_expiry: string | null
          email: string | null
          full_name: string | null
          id: string
          is_approved: boolean | null
          points: number | null
          role: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          elite_status?: Database["public"]["Enums"]["elite_status"] | null
          elite_status_expiry?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_approved?: boolean | null
          points?: number | null
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          elite_status?: Database["public"]["Enums"]["elite_status"] | null
          elite_status_expiry?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_approved?: boolean | null
          points?: number | null
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      promotional_events: {
        Row: {
          created_at: string
          description: string
          end_date: string
          id: string
          is_active: boolean
          merchant_id: string
          points_multiplier: number
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date: string
          id?: string
          is_active?: boolean
          merchant_id: string
          points_multiplier?: number
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean
          merchant_id?: string
          points_multiplier?: number
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotional_events_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_listings: {
        Row: {
          agent_id: string | null
          bathrooms: number
          bedrooms: number
          city: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          location: string
          monthly_payment: number
          points_reward: number
          price: number
          property_type: string
          size_sqft: number
          state: string
          title: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          bathrooms: number
          bedrooms: number
          city: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location: string
          monthly_payment: number
          points_reward: number
          price: number
          property_type: string
          size_sqft: number
          state: string
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          bathrooms?: number
          bedrooms?: number
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string
          monthly_payment?: number
          points_reward?: number
          price?: number
          property_type?: string
          size_sqft?: number
          state?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_listings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_search_preferences: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          id: string
          max_budget: number | null
          max_size_sqft: number | null
          min_budget: number | null
          min_size_sqft: number | null
          preferred_locations: string[] | null
          property_types: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          id?: string
          max_budget?: number | null
          max_size_sqft?: number | null
          min_budget?: number | null
          min_size_sqft?: number | null
          preferred_locations?: string[] | null
          property_types?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          id?: string
          max_budget?: number | null
          max_size_sqft?: number | null
          min_budget?: number | null
          min_size_sqft?: number | null
          preferred_locations?: string[] | null
          property_types?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_payments: {
        Row: {
          amount: number
          created_at: string | null
          end_date: string | null
          frequency: string | null
          id: string
          lease_id: string
          next_payment_date: string
          payment_method_id: string
          start_date: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          lease_id: string
          next_payment_date: string
          payment_method_id: string
          start_date: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          lease_id?: string
          next_payment_date?: string
          payment_method_id?: string
          start_date?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_catalog: {
        Row: {
          active: boolean | null
          available_quantity: number | null
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          points_cost: number
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          available_quantity?: number | null
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          name: string
          points_cost: number
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          available_quantity?: number | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          points_cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      reward_qr_codes: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          qr_code: string
          redemption_id: string
          status: string
          updated_at: string | null
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          qr_code: string
          redemption_id: string
          status?: string
          updated_at?: string | null
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          qr_code?: string
          redemption_id?: string
          status?: string
          updated_at?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_qr_codes_redemption_id_fkey"
            columns: ["redemption_id"]
            isOneToOne: false
            referencedRelation: "reward_redemptions"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_redemptions: {
        Row: {
          created_at: string
          id: string
          points_spent: number
          reward_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_spent: number
          reward_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_spent?: number
          reward_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "reward_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_rules: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          max_redemptions: number | null
          merchant_id: string
          name: string
          points_required: number
          redemptions_count: number | null
          reward_type: string
          reward_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          merchant_id: string
          name: string
          points_required: number
          redemptions_count?: number | null
          reward_type: string
          reward_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          merchant_id?: string
          name?: string
          points_required?: number
          redemptions_count?: number | null
          reward_type?: string
          reward_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_rules_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string
          description: string
          expiration_date: string | null
          id: string
          points: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          expiration_date?: string | null
          id?: string
          points?: number
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          expiration_date?: string | null
          id?: string
          points?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_by: string | null
          assigned_to: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          points: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_to: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          points?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          points?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_credit_scores: {
        Row: {
          created_at: string | null
          dispute_history_score: number | null
          id: string
          last_calculated_at: string | null
          lease_compliance_score: number | null
          payment_history_score: number | null
          score: number
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dispute_history_score?: number | null
          id?: string
          last_calculated_at?: string | null
          lease_compliance_score?: number | null
          payment_history_score?: number | null
          score: number
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dispute_history_score?: number | null
          id?: string
          last_calculated_at?: string | null
          lease_compliance_score?: number | null
          payment_history_score?: number | null
          score?: number
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tenant_invitations: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          landlord_id: string | null
          phone: string | null
          status: Database["public"]["Enums"]["invitation_status"] | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          landlord_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["invitation_status"] | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          landlord_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["invitation_status"] | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invitations_landlord_id_fkey"
            columns: ["landlord_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_invitations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          floor_plan: string | null
          id: string
          owner_id: string
          square_feet: number | null
          status: string
          unit_number: string
          updated_at: string
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          floor_plan?: string | null
          id?: string
          owner_id: string
          square_feet?: number | null
          status?: string
          unit_number: string
          updated_at?: string
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          floor_plan?: string | null
          id?: string
          owner_id?: string
          square_feet?: number | null
          status?: string
          unit_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achieved_at: string
          achievement_id: string
          id: string
          user_id: string
        }
        Insert: {
          achieved_at?: string
          achievement_id: string
          id?: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          achievement_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          address_alias: string | null
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          id: string
          is_default: boolean | null
          landmark: string | null
          phone_number: string | null
          postcode: string
          recipient_name: string
          state: Database["public"]["Enums"]["malaysian_state"]
          street_address: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_alias?: string | null
          address_line_2?: string | null
          city: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          landmark?: string | null
          phone_number?: string | null
          postcode: string
          recipient_name: string
          state: Database["public"]["Enums"]["malaysian_state"]
          street_address: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_alias?: string | null
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          landmark?: string | null
          phone_number?: string | null
          postcode?: string
          recipient_name?: string
          state?: Database["public"]["Enums"]["malaysian_state"]
          street_address?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_custom_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_custom_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_merchants: {
        Row: {
          created_at: string
          id: string
          merchant_id: string | null
          user_preference_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          merchant_id?: string | null
          user_preference_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          merchant_id?: string | null
          user_preference_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_merchants_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorite_merchants_user_preference_id_fkey"
            columns: ["user_preference_id"]
            isOneToOne: false
            referencedRelation: "user_preferences"
            referencedColumns: ["id"]
          },
        ]
      }
      user_missions: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          mission_id: string
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id: string
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id?: string
          progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          target_user_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          target_user_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          target_user_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          last_activity_date: string | null
          location_preferences: Json | null
          preferred_categories: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_activity_date?: string | null
          location_preferences?: Json | null
          preferred_categories?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_activity_date?: string | null
          location_preferences?: Json | null
          preferred_categories?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          created_at: string
          id: string
          pending_referrals: number
          referral_code: string
          total_points_earned: number
          total_referrals: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pending_referrals?: number
          referral_code: string
          total_points_earned?: number
          total_referrals?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pending_referrals?: number
          referral_code?: string
          total_points_earned?: number
          total_referrals?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          coins: number
          created_at: string
          id: string
          points: number
          points_expiring_soon: number | null
          points_expiry_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coins?: number
          created_at?: string
          id?: string
          points?: number
          points_expiring_soon?: number | null
          points_expiry_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coins?: number
          created_at?: string
          id?: string
          points?: number
          points_expiring_soon?: number | null
          points_expiry_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_late_payments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_payment_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      expire_points: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      expire_qr_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      fix_role_update_recursion: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      notify_late_payments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      notify_lease_expiration: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_role_safe: {
        Args: { target_user_id: string; new_role: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "tenant" | "landlord" | "merchant" | "admin"
      elite_status: "none" | "silver" | "gold" | "platinum"
      invitation_status: "pending" | "accepted" | "rejected"
      malaysian_state:
        | "Johor"
        | "Kedah"
        | "Kelantan"
        | "Melaka"
        | "Negeri Sembilan"
        | "Pahang"
        | "Perak"
        | "Perlis"
        | "Pulau Pinang"
        | "Sabah"
        | "Sarawak"
        | "Selangor"
        | "Terengganu"
        | "Kuala Lumpur"
        | "Labuan"
        | "Putrajaya"
      payment_method_type:
        | "bank_account"
        | "credit_card"
        | "debit_card"
        | "check"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["tenant", "landlord", "merchant", "admin"],
      elite_status: ["none", "silver", "gold", "platinum"],
      invitation_status: ["pending", "accepted", "rejected"],
      malaysian_state: [
        "Johor",
        "Kedah",
        "Kelantan",
        "Melaka",
        "Negeri Sembilan",
        "Pahang",
        "Perak",
        "Perlis",
        "Pulau Pinang",
        "Sabah",
        "Sarawak",
        "Selangor",
        "Terengganu",
        "Kuala Lumpur",
        "Labuan",
        "Putrajaya",
      ],
      payment_method_type: [
        "bank_account",
        "credit_card",
        "debit_card",
        "check",
      ],
    },
  },
} as const
