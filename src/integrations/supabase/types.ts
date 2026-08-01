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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
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
      financial_accounts: {
        Row: {
          account_name: string
          available_balance: number
          balance: number
          created_at: string
          currency: string
          iban: string | null
          id: string
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
          organisation_id: string | null
          owner_user_id: string | null
          points: number
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organisation_id?: string | null
          owner_user_id?: string | null
          points?: number
          tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
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
          loyalty_account_id: string
          points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          loyalty_account_id: string
          points: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          loyalty_account_id?: string
          points?: number
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
        ]
      }
      merchants: {
        Row: {
          created_at: string
          id: string
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
      organisation_members: {
        Row: {
          created_at: string
          display_name: string
          id: string
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
      pots: {
        Row: {
          account_id: string
          balance: number
          created_at: string
          emoji: string | null
          id: string
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
          created_at: string
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          provider: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          payload?: Json
          processed_at?: string | null
          provider: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_cases: {
        Row: {
          created_at: string
          id: string
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
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
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
