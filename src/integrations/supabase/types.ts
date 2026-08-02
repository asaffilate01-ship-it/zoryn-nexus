export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      api_rate_limits: {
        Row: {
          bucket: string
          count: number
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          window_start?: string
        }
        Update: {
          bucket?: string
          count?: number
          window_start?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          is_demo: boolean
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          updated_at: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          updated_at?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          account_id: string
          card_type: string
          created_at: string
          id: string
          is_demo: boolean
          last_four: string
          monthly_limit: number
          name: string
          provider: string
          provider_reference: string | null
          spent: number
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          card_type: string
          created_at?: string
          id?: string
          is_demo?: boolean
          last_four: string
          monthly_limit?: number
          name: string
          provider?: string
          provider_reference?: string | null
          spent?: number
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          card_type?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          last_four?: string
          monthly_limit?: number
          name?: string
          provider?: string
          provider_reference?: string | null
          spent?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_baseline: {
        Row: {
          created_at: string
          data: Json
          id: string
          row_id: string
          table_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          row_id: string
          table_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          row_id?: string
          table_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_accounts: {
        Row: {
          account_name: string
          available_balance: number
          balance: number
          created_at: string
          currency: string
          iban: string | null
          id: string
          is_demo: boolean
          organisation_id: string | null
          owner_user_id: string | null
          provider: string
          provider_reference: string | null
          status: Database["public"]["Enums"]["resource_status"]
          updated_at: string
        }
        Insert: {
          account_name: string
          available_balance?: number
          balance?: number
          created_at?: string
          currency?: string
          iban?: string | null
          id?: string
          is_demo?: boolean
          organisation_id?: string | null
          owner_user_id?: string | null
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["resource_status"]
          updated_at?: string
        }
        Update: {
          account_name?: string
          available_balance?: number
          balance?: number
          created_at?: string
          currency?: string
          iban?: string | null
          id?: string
          is_demo?: boolean
          organisation_id?: string | null
          owner_user_id?: string | null
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["resource_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_accounts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_transfers: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          from_pot_id: string | null
          id: string
          to_pot_id: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          from_pot_id?: string | null
          id?: string
          to_pot_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          from_pot_id?: string | null
          id?: string
          to_pot_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_transfers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_transfers_from_pot_id_fkey"
            columns: ["from_pot_id"]
            isOneToOne: false
            referencedRelation: "pots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_transfers_to_pot_id_fkey"
            columns: ["to_pot_id"]
            isOneToOne: false
            referencedRelation: "pots"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_accounts: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          organisation_id: string | null
          owner_user_id: string | null
          points: number
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          organisation_id?: string | null
          owner_user_id?: string | null
          points?: number
          tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          organisation_id?: string | null
          owner_user_id?: string | null
          points?: number
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_accounts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_entries: {
        Row: {
          created_at: string
          description: string
          id: string
          idempotency_key: string | null
          is_demo: boolean
          loyalty_account_id: string
          points: number
          source: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          idempotency_key?: string | null
          is_demo?: boolean
          loyalty_account_id: string
          points: number
          source?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          idempotency_key?: string | null
          is_demo?: boolean
          loyalty_account_id?: string
          points?: number
          source?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_entries_loyalty_account_id_fkey"
            columns: ["loyalty_account_id"]
            isOneToOne: false
            referencedRelation: "loyalty_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          organisation_id: string
          pending_settlement: number
          provider: string
          provider_reference: string | null
          status: Database["public"]["Enums"]["resource_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          organisation_id: string
          pending_settlement?: number
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["resource_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          organisation_id?: string
          pending_settlement?: number
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["resource_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchants_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_actions: {
        Row: {
          action_type: string
          created_at: string
          description: string
          due_at: string | null
          id: string
          is_demo: boolean
          sort_order: number
          state: string
          subject_kind: string
          subject_reference: string
          title: string
          updated_at: string
        }
        Insert: {
          action_type?: string
          created_at?: string
          description: string
          due_at?: string | null
          id?: string
          is_demo?: boolean
          sort_order?: number
          state: string
          subject_kind?: string
          subject_reference: string
          title: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          due_at?: string | null
          id?: string
          is_demo?: boolean
          sort_order?: number
          state?: string
          subject_kind?: string
          subject_reference?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      organisation_members: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_demo: boolean
          monthly_limit: number
          organisation_id: string
          role: string
          spent: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_demo?: boolean
          monthly_limit?: number
          organisation_id: string
          role: string
          spent?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_demo?: boolean
          monthly_limit?: number
          organisation_id?: string
          role?: string
          spent?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organisation_members_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          country: string
          created_at: string
          id: string
          is_demo: boolean
          kind: string
          legal_name: string | null
          name: string
          status: Database["public"]["Enums"]["resource_status"]
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          kind: string
          legal_name?: string | null
          name: string
          status?: Database["public"]["Enums"]["resource_status"]
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          is_demo?: boolean
          kind?: string
          legal_name?: string | null
          name?: string
          status?: Database["public"]["Enums"]["resource_status"]
          updated_at?: string
        }
        Relationships: []
      }
      payment_links: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          is_demo: boolean
          label: string
          merchant_id: string
          provider_reference: string | null
          status: string
          updated_at: string
          url: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          is_demo?: boolean
          label: string
          merchant_id: string
          provider_reference?: string | null
          status?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          is_demo?: boolean
          label?: string
          merchant_id?: string
          provider_reference?: string | null
          status?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_accounts: {
        Row: {
          account_type: string
          available_balance_minor: number
          bic: string | null
          booked_balance_minor: number
          created_at: string
          currency: string
          customer_id: string | null
          iban: string | null
          id: string
          organisation_id: string | null
          owner_user_id: string | null
          provider: string | null
          provider_external_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_type: string
          available_balance_minor?: number
          bic?: string | null
          booked_balance_minor?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          iban?: string | null
          id?: string
          organisation_id?: string | null
          owner_user_id?: string | null
          provider?: string | null
          provider_external_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_type?: string
          available_balance_minor?: number
          bic?: string | null
          booked_balance_minor?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          iban?: string | null
          id?: string
          organisation_id?: string | null
          owner_user_id?: string | null
          provider?: string | null
          provider_external_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_accounts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "platform_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_accounts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "platform_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_audit_events: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json
          organisation_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json
          organisation_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json
          organisation_id?: string | null
        }
        Relationships: []
      }
      platform_beneficiaries: {
        Row: {
          bic: string | null
          created_at: string
          customer_id: string | null
          iban: string
          id: string
          name: string
          organisation_id: string | null
          owner_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          bic?: string | null
          created_at?: string
          customer_id?: string | null
          iban: string
          id?: string
          name: string
          organisation_id?: string | null
          owner_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          bic?: string | null
          created_at?: string
          customer_id?: string | null
          iban?: string
          id?: string
          name?: string
          organisation_id?: string | null
          owner_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_beneficiaries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "platform_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_beneficiaries_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "platform_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_cards: {
        Row: {
          account_id: string
          atm_enabled: boolean
          card_type: string
          cardholder_user_id: string | null
          contactless_enabled: boolean
          created_at: string
          id: string
          international_enabled: boolean
          last_four: string | null
          online_enabled: boolean
          provider_external_id: string | null
          spending_limit_minor: number | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          atm_enabled?: boolean
          card_type: string
          cardholder_user_id?: string | null
          contactless_enabled?: boolean
          created_at?: string
          id?: string
          international_enabled?: boolean
          last_four?: string | null
          online_enabled?: boolean
          provider_external_id?: string | null
          spending_limit_minor?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          atm_enabled?: boolean
          card_type?: string
          cardholder_user_id?: string | null
          contactless_enabled?: boolean
          created_at?: string
          id?: string
          international_enabled?: boolean
          last_four?: string | null
          online_enabled?: boolean
          provider_external_id?: string | null
          spending_limit_minor?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "platform_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_customers: {
        Row: {
          created_at: string
          customer_type: string
          id: string
          provider: string | null
          provider_external_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_type: string
          id?: string
          provider?: string | null
          provider_external_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_type?: string
          id?: string
          provider?: string | null
          provider_external_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_incidents: {
        Row: {
          id: string
          metadata: Json
          provider: string | null
          resolved_at: string | null
          severity: string
          started_at: string
          status: string
          summary: string | null
          title: string
        }
        Insert: {
          id?: string
          metadata?: Json
          provider?: string | null
          resolved_at?: string | null
          severity: string
          started_at?: string
          status?: string
          summary?: string | null
          title: string
        }
        Update: {
          id?: string
          metadata?: Json
          provider?: string | null
          resolved_at?: string | null
          severity?: string
          started_at?: string
          status?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      platform_merchants: {
        Row: {
          created_at: string
          display_name: string
          id: string
          organisation_id: string
          provider_external_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          organisation_id: string
          provider_external_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          organisation_id?: string
          provider_external_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_merchants_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "platform_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_notification_outbox: {
        Row: {
          attempt_count: number
          channel: string
          created_at: string
          id: string
          last_error: string | null
          next_attempt_at: string | null
          organisation_id: string | null
          payload: Json
          sent_at: string | null
          status: string
          template_key: string
          user_id: string | null
        }
        Insert: {
          attempt_count?: number
          channel: string
          created_at?: string
          id?: string
          last_error?: string | null
          next_attempt_at?: string | null
          organisation_id?: string | null
          payload?: Json
          sent_at?: string | null
          status?: string
          template_key: string
          user_id?: string | null
        }
        Update: {
          attempt_count?: number
          channel?: string
          created_at?: string
          id?: string
          last_error?: string | null
          next_attempt_at?: string | null
          organisation_id?: string | null
          payload?: Json
          sent_at?: string | null
          status?: string
          template_key?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_notification_outbox_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "platform_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_onboarding_actions: {
        Row: {
          action_type: string
          completed_at: string | null
          created_at: string
          due_at: string | null
          id: string
          onboarding_case_id: string
          payload: Json
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          action_type: string
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          onboarding_case_id: string
          payload?: Json
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          action_type?: string
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          onboarding_case_id?: string
          payload?: Json
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_onboarding_actions_onboarding_case_id_fkey"
            columns: ["onboarding_case_id"]
            isOneToOne: false
            referencedRelation: "platform_onboarding_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_onboarding_cases: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          last_synced_at: string | null
          onboarding_type: string
          organisation_id: string | null
          provider: string
          required_actions: Json
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          last_synced_at?: string | null
          onboarding_type: string
          organisation_id?: string | null
          provider: string
          required_actions?: Json
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          last_synced_at?: string | null
          onboarding_type?: string
          organisation_id?: string | null
          provider?: string
          required_actions?: Json
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      platform_organisation_members: {
        Row: {
          created_at: string
          organisation_id: string
          payment_limit_minor: number | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          organisation_id: string
          payment_limit_minor?: number | null
          role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          organisation_id?: string
          payment_limit_minor?: number | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_organisation_members_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "platform_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_organisations: {
        Row: {
          created_at: string
          id: string
          legal_form: string | null
          legal_name: string | null
          name: string
          registration_number: string | null
          status: string
          trading_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          legal_form?: string | null
          legal_name?: string | null
          name: string
          registration_number?: string | null
          status?: string
          trading_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          legal_form?: string | null
          legal_name?: string | null
          name?: string
          registration_number?: string | null
          status?: string
          trading_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      platform_payments: {
        Row: {
          amount_minor: number
          created_at: string
          currency: string
          id: string
          merchant_id: string
          provider_external_id: string | null
          reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          currency?: string
          id?: string
          merchant_id: string
          provider_external_id?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency?: string
          id?: string
          merchant_id?: string
          provider_external_id?: string | null
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_payments_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "platform_merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_pots: {
        Row: {
          account_id: string
          balance_minor: number
          created_at: string
          id: string
          name: string
          target_date: string | null
          target_minor: number | null
          updated_at: string
        }
        Insert: {
          account_id: string
          balance_minor?: number
          created_at?: string
          id?: string
          name: string
          target_date?: string | null
          target_minor?: number | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          balance_minor?: number
          created_at?: string
          id?: string
          name?: string
          target_date?: string | null
          target_minor?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_pots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "platform_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          locale: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          locale?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          locale?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      platform_provider_alerts: {
        Row: {
          alert_type: string
          created_at: string
          details: Json
          id: string
          provider: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          details?: Json
          id?: string
          provider?: string | null
          resolved_at?: string | null
          severity: string
          status?: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          details?: Json
          id?: string
          provider?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      platform_provider_commands: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          attempt_count: number
          command_type: string
          created_at: string
          created_by: string | null
          id: string
          idempotency_key: string
          last_error: string | null
          next_attempt_at: string | null
          payload: Json
          processed_at: string | null
          provider: string
          status: string
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          attempt_count?: number
          command_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          idempotency_key: string
          last_error?: string | null
          next_attempt_at?: string | null
          payload?: Json
          processed_at?: string | null
          provider: string
          status?: string
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          attempt_count?: number
          command_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          idempotency_key?: string
          last_error?: string | null
          next_attempt_at?: string | null
          payload?: Json
          processed_at?: string | null
          provider?: string
          status?: string
        }
        Relationships: []
      }
      platform_provider_connections: {
        Row: {
          configuration: Json
          created_at: string
          id: string
          last_checked_at: string
          mode: string
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          id?: string
          last_checked_at?: string
          mode?: string
          provider: string
          status?: string
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          id?: string
          last_checked_at?: string
          mode?: string
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_provider_events: {
        Row: {
          attempt_count: number
          event_id: string
          event_type: string
          id: string
          last_error: string | null
          occurred_at: string | null
          payload: Json
          payload_hash: string
          processed_at: string | null
          processing_status: string
          provider: string
          received_at: string
        }
        Insert: {
          attempt_count?: number
          event_id: string
          event_type: string
          id?: string
          last_error?: string | null
          occurred_at?: string | null
          payload: Json
          payload_hash: string
          processed_at?: string | null
          processing_status?: string
          provider: string
          received_at?: string
        }
        Update: {
          attempt_count?: number
          event_id?: string
          event_type?: string
          id?: string
          last_error?: string | null
          occurred_at?: string | null
          payload?: Json
          payload_hash?: string
          processed_at?: string | null
          processing_status?: string
          provider?: string
          received_at?: string
        }
        Relationships: []
      }
      platform_provider_resources: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          created_at: string
          external_id: string
          external_status: string | null
          id: string
          last_synced_at: string
          metadata: Json
          provider: string
          resource_type: string
          updated_at: string
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          created_at?: string
          external_id: string
          external_status?: string | null
          id?: string
          last_synced_at?: string
          metadata?: Json
          provider: string
          resource_type: string
          updated_at?: string
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          created_at?: string
          external_id?: string
          external_status?: string | null
          id?: string
          last_synced_at?: string
          metadata?: Json
          provider?: string
          resource_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_provider_runtime_logs: {
        Row: {
          correlation_id: string
          created_at: string
          direction: string
          duration_ms: number | null
          entity_id: string | null
          error_message: string | null
          id: string
          metadata: Json
          operation: string
          provider: string
          status: string
        }
        Insert: {
          correlation_id: string
          created_at?: string
          direction: string
          duration_ms?: number | null
          entity_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json
          operation: string
          provider: string
          status: string
        }
        Update: {
          correlation_id?: string
          created_at?: string
          direction?: string
          duration_ms?: number | null
          entity_id?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json
          operation?: string
          provider?: string
          status?: string
        }
        Relationships: []
      }
      platform_provider_worker_locks: {
        Row: {
          command_id: string
          expires_at: string
          locked_at: string
          locked_by: string
        }
        Insert: {
          command_id: string
          expires_at: string
          locked_at?: string
          locked_by: string
        }
        Update: {
          command_id?: string
          expires_at?: string
          locked_at?: string
          locked_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_provider_worker_locks_command_id_fkey"
            columns: ["command_id"]
            isOneToOne: true
            referencedRelation: "platform_provider_commands"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_reconciliation_runs: {
        Row: {
          actual_minor: number
          completed_at: string | null
          details: Json
          difference_minor: number | null
          expected_minor: number
          id: string
          run_type: string
          started_at: string
          status: string
        }
        Insert: {
          actual_minor?: number
          completed_at?: string | null
          details?: Json
          difference_minor?: number | null
          expected_minor?: number
          id?: string
          run_type: string
          started_at?: string
          status: string
        }
        Update: {
          actual_minor?: number
          completed_at?: string | null
          details?: Json
          difference_minor?: number | null
          expected_minor?: number
          id?: string
          run_type?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      platform_settlements: {
        Row: {
          created_at: string
          expected_at: string | null
          fees_minor: number
          gross_minor: number
          id: string
          merchant_id: string
          net_minor: number
          paid_at: string | null
          provider_external_id: string | null
          refunds_minor: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected_at?: string | null
          fees_minor?: number
          gross_minor?: number
          id?: string
          merchant_id: string
          net_minor?: number
          paid_at?: string | null
          provider_external_id?: string | null
          refunds_minor?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected_at?: string | null
          fees_minor?: number
          gross_minor?: number
          id?: string
          merchant_id?: string
          net_minor?: number
          paid_at?: string | null
          provider_external_id?: string | null
          refunds_minor?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_settlements_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "platform_merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_support_cases: {
        Row: {
          assigned_to: string | null
          case_type: string
          created_at: string
          description: string | null
          due_at: string | null
          id: string
          organisation_id: string | null
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          case_type: string
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          organisation_id?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          case_type?: string
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          organisation_id?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_support_cases_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "platform_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_transactions: {
        Row: {
          account_id: string
          amount_minor: number
          booked_at: string | null
          counterparty_name: string | null
          created_at: string
          currency: string
          direction: string
          id: string
          merchant_name: string | null
          provider: string | null
          provider_external_id: string | null
          reference: string | null
          status: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          account_id: string
          amount_minor: number
          booked_at?: string | null
          counterparty_name?: string | null
          created_at?: string
          currency?: string
          direction: string
          id?: string
          merchant_name?: string | null
          provider?: string | null
          provider_external_id?: string | null
          reference?: string | null
          status?: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount_minor?: number
          booked_at?: string | null
          counterparty_name?: string | null
          created_at?: string
          currency?: string
          direction?: string
          id?: string
          merchant_name?: string | null
          provider?: string | null
          provider_external_id?: string | null
          reference?: string | null
          status?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "platform_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_transfers: {
        Row: {
          account_id: string
          amount_minor: number
          beneficiary_id: string | null
          consent_status: string
          created_at: string
          created_by: string | null
          currency: string
          id: string
          idempotency_key: string
          provider_external_id: string | null
          reference: string | null
          scheduled_for: string | null
          status: string
          transfer_type: string
          updated_at: string
        }
        Insert: {
          account_id: string
          amount_minor: number
          beneficiary_id?: string | null
          consent_status?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          idempotency_key: string
          provider_external_id?: string | null
          reference?: string | null
          scheduled_for?: string | null
          status?: string
          transfer_type?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount_minor?: number
          beneficiary_id?: string | null
          consent_status?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          idempotency_key?: string
          provider_external_id?: string | null
          reference?: string | null
          scheduled_for?: string | null
          status?: string
          transfer_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_transfers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "platform_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_transfers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "platform_beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      pots: {
        Row: {
          account_id: string
          balance: number
          created_at: string
          emoji: string | null
          id: string
          is_demo: boolean
          name: string
          target: number | null
          updated_at: string
        }
        Insert: {
          account_id: string
          balance?: number
          created_at?: string
          emoji?: string | null
          id?: string
          is_demo?: boolean
          name: string
          target?: number | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          balance?: number
          created_at?: string
          emoji?: string | null
          id?: string
          is_demo?: boolean
          name?: string
          target?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pots_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["zoryn_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["zoryn_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["zoryn_role"]
          updated_at?: string
        }
        Relationships: []
      }
      provider_events: {
        Row: {
          attempts: number
          created_at: string
          error: string | null
          event_id: string
          event_type: string
          id: string
          is_demo: boolean
          next_attempt_at: string | null
          occurred_at: string
          payload: Json
          processed_at: string | null
          provider: string
          resource_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error?: string | null
          event_id: string
          event_type: string
          id?: string
          is_demo?: boolean
          next_attempt_at?: string | null
          occurred_at?: string
          payload?: Json
          processed_at?: string | null
          provider: string
          resource_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error?: string | null
          event_id?: string
          event_type?: string
          id?: string
          is_demo?: boolean
          next_attempt_at?: string | null
          occurred_at?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
          resource_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      provider_health: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          last_event_at: string | null
          latency_ms: number
          message: string
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          last_event_at?: string | null
          latency_ms?: number
          message?: string
          provider: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          last_event_at?: string | null
          latency_ms?: number
          message?: string
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      provider_resources: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          last_synced_at: string
          metadata: Json
          provider: string
          provider_id: string
          resource_type: string
          updated_at: string
          zoryn_id: string | null
          zoryn_reference: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          last_synced_at?: string
          metadata?: Json
          provider: string
          provider_id: string
          resource_type: string
          updated_at?: string
          zoryn_id?: string | null
          zoryn_reference?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          last_synced_at?: string
          metadata?: Json
          provider?: string
          provider_id?: string
          resource_type?: string
          updated_at?: string
          zoryn_id?: string | null
          zoryn_reference?: string | null
        }
        Relationships: []
      }
      provider_scenarios: {
        Row: {
          created_at: string
          description: string
          group_key: string
          id: string
          is_demo: boolean
          severity: string
          sort_order: number
          state: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          group_key: string
          id?: string
          is_demo?: boolean
          severity?: string
          sort_order?: number
          state: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          group_key?: string
          id?: string
          is_demo?: boolean
          severity?: string
          sort_order?: number
          state?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      rewards_outbox: {
        Row: {
          amount_cents: number
          attempts: number
          created_at: string
          currency: string
          delivered_at: string | null
          error: string | null
          event_type: string
          id: string
          is_demo: boolean
          loyalty_account_id: string | null
          next_attempt_at: string
          payload: Json
          platform_user_id: string | null
          points: number
          provider: string
          provider_reference: string
          status: string
          tenant_slug: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          attempts?: number
          created_at?: string
          currency?: string
          delivered_at?: string | null
          error?: string | null
          event_type: string
          id?: string
          is_demo?: boolean
          loyalty_account_id?: string | null
          next_attempt_at?: string
          payload?: Json
          platform_user_id?: string | null
          points?: number
          provider?: string
          provider_reference: string
          status?: string
          tenant_slug?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          attempts?: number
          created_at?: string
          currency?: string
          delivered_at?: string | null
          error?: string | null
          event_type?: string
          id?: string
          is_demo?: boolean
          loyalty_account_id?: string | null
          next_attempt_at?: string
          payload?: Json
          platform_user_id?: string | null
          points?: number
          provider?: string
          provider_reference?: string
          status?: string
          tenant_slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_outbox_loyalty_account_id_fkey"
            columns: ["loyalty_account_id"]
            isOneToOne: false
            referencedRelation: "loyalty_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      support_cases: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          organisation_id: string | null
          owner_user_id: string | null
          priority: string
          reference: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          organisation_id?: string | null
          owner_user_id?: string | null
          priority?: string
          reference: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          organisation_id?: string | null
          owner_user_id?: string | null
          priority?: string
          reference?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_cases_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      terminals: {
        Row: {
          battery: number
          created_at: string
          id: string
          is_demo: boolean
          last_seen_at: string
          merchant_id: string
          name: string
          provider: string
          provider_reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          battery?: number
          created_at?: string
          id?: string
          is_demo?: boolean
          last_seen_at?: string
          merchant_id: string
          name: string
          provider?: string
          provider_reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          battery?: number
          created_at?: string
          id?: string
          is_demo?: boolean
          last_seen_at?: string
          merchant_id?: string
          name?: string
          provider?: string
          provider_reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "terminals_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string
          currency: string
          id: string
          is_demo: boolean
          kind: string
          metadata: Json
          occurred_at: string
          provider: string
          provider_reference: string | null
          status: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string
          currency?: string
          id?: string
          is_demo?: boolean
          kind: string
          metadata?: Json
          occurred_at?: string
          provider?: string
          provider_reference?: string | null
          status?: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          is_demo?: boolean
          kind?: string
          metadata?: Json
          occurred_at?: string
          provider?: string
          provider_reference?: string | null
          status?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["zoryn_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["zoryn_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["zoryn_role"]
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
      can_access_account: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_loyalty: {
        Args: { _loyalty_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_merchant: {
        Args: { _merchant_id: string; _user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: { _bucket: string; _limit: number; _window_seconds: number }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["zoryn_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      platform_can_access_account: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
      platform_can_access_merchant: {
        Args: { _merchant_id: string; _user_id: string }
        Returns: boolean
      }
      platform_claim_provider_commands: {
        Args: { p_limit?: number; p_worker_id: string }
        Returns: {
          aggregate_id: string
          aggregate_type: string
          attempt_count: number
          command_type: string
          created_at: string
          created_by: string | null
          id: string
          idempotency_key: string
          last_error: string | null
          next_attempt_at: string | null
          payload: Json
          processed_at: string | null
          provider: string
          status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "platform_provider_commands"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      platform_claim_provider_events: {
        Args: { p_limit?: number }
        Returns: {
          attempt_count: number
          event_id: string
          event_type: string
          id: string
          last_error: string | null
          occurred_at: string | null
          payload: Json
          payload_hash: string
          processed_at: string | null
          processing_status: string
          provider: string
          received_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "platform_provider_events"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      platform_complete_provider_command: {
        Args: { p_command_id: string; p_error?: string; p_status: string }
        Returns: undefined
      }
      platform_is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      platform_owns_account: {
        Args: { _account_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      resource_status:
        | "draft"
        | "in_review"
        | "action_required"
        | "approved"
        | "restricted"
        | "suspended"
        | "closed"
      zoryn_role: "personal" | "business" | "merchant" | "admin" | "staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      resource_status: [
        "draft",
        "in_review",
        "action_required",
        "approved",
        "restricted",
        "suspended",
        "closed",
      ],
      zoryn_role: ["personal", "business", "merchant", "admin", "staff"],
    },
  },
} as const
