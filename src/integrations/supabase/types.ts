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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
          status: "active" | "suspended"
          suspension_reason: string | null
          can_chat: boolean
          preferred_currency: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          status?: "active" | "suspended"
          suspension_reason?: string | null
          can_chat?: boolean
          preferred_currency?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          status?: "active" | "suspended"
          suspension_reason?: string | null
          can_chat?: boolean
          preferred_currency?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          deal_title: string
          deal_description: string | null
          amount: number
          currency: string
          product_type: Database["public"]["Enums"]["product_type"]
          status: Database["public"]["Enums"]["transaction_status"]
          buyer_id: string | null
          buyer_email: string
          seller_email: string | null
          seller_phone: string | null
          seller_id: string | null
          payment_reference: string | null
          proof_url: string | null
          proof_description: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
          paid_at: string | null
          delivered_at: string | null
          confirmed_at: string | null
          released_at: string | null
          muted_ids: string[] | null
          invite_token: string | null
        }
        Insert: {
          id?: string
          deal_title: string
          deal_description?: string | null
          amount: number
          currency?: string
          product_type: Database["public"]["Enums"]["product_type"]
          status?: Database["public"]["Enums"]["transaction_status"]
          buyer_id?: string | null
          buyer_email: string
          seller_email?: string | null
          seller_phone?: string | null
          seller_id?: string | null
          payment_reference?: string | null
          proof_url?: string | null
          proof_description?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
          delivered_at?: string | null
          confirmed_at?: string | null
          released_at?: string | null
          muted_ids?: string[] | null
          invite_token?: string | null
        }
        Update: {
          id?: string
          deal_title?: string
          deal_description?: string | null
          amount?: number
          currency?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          status?: Database["public"]["Enums"]["transaction_status"]
          buyer_id?: string | null
          buyer_email?: string
          seller_email?: string | null
          seller_phone?: string | null
          seller_id?: string | null
          payment_reference?: string | null
          proof_url?: string | null
          proof_description?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
          paid_at?: string | null
          delivered_at?: string | null
          confirmed_at?: string | null
          released_at?: string | null
          muted_ids?: string[] | null
          invite_token?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          transaction_id: string
          sender_id: string
          sender_email: string
          sender_role: string
          content: string
          created_at: string
          is_deleted: boolean
        }
        Insert: {
          id?: string
          transaction_id: string
          sender_id: string
          sender_email: string
          sender_role: string
          content: string
          created_at?: string
          is_deleted?: boolean
        }
        Update: {
          id?: string
          transaction_id?: string
          sender_id?: string
          sender_email?: string
          sender_role?: string
          content?: string
          created_at?: string
          is_deleted?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "messages_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: "info" | "success" | "warning" | "error"
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: "info" | "success" | "warning" | "error"
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: "info" | "success" | "warning" | "error"
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      invite_links: {
        Row: {
          id: string
          transaction_id: string
          token: string
          created_by: string
          expires_at: string
          used_by: string | null
          used_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          token: string
          created_by: string
          expires_at?: string
          used_by?: string | null
          used_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          token?: string
          created_by?: string
          expires_at?: string
          used_by?: string | null
          used_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_links_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          }
        ]
      }
      site_settings: {
        Row: {
          key: string
          value: string
          updated_at: string | null
        }
        Insert: {
          key: string
          value: string
          updated_at?: string | null
        }
        Update: {
          key?: string
          value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payout_accounts: {
        Row: {
          id: string
          user_id: string
          payout_type: string
          bank_name: string | null
          account_number: string | null
          account_name: string | null
          crypto_currency: string | null
          wallet_address: string | null
          network: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          payout_type: string
          bank_name?: string | null
          account_number?: string | null
          account_name?: string | null
          crypto_currency?: string | null
          wallet_address?: string | null
          network?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          payout_type?: string
          bank_name?: string | null
          account_number?: string | null
          account_name?: string | null
          crypto_currency?: string | null
          wallet_address?: string | null
          network?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          id: string
          transaction_id: string
          user_id: string
          user_email: string
          role: string
          message: string
          attachment_url: string | null
          resolved: boolean
          admin_response: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          user_id: string
          user_email: string
          role: string
          message: string
          attachment_url?: string | null
          resolved?: boolean
          admin_response?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          user_id?: string
          user_email?: string
          role?: string
          message?: string
          attachment_url?: string | null
          resolved?: boolean
          admin_response?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          }
        ]
      }
      transaction_history: {
        Row: {
          id: string
          transaction_id: string
          actor_id: string | null
          action_type: string
          description: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          actor_id?: string | null
          action_type: string
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          actor_id?: string | null
          action_type?: string
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_history_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "buyer" | "seller"
      product_type: "physical_product" | "digital_product" | "service"
      transaction_status:
      | "pending_payment"
      | "seller_joined"
      | "held"
      | "pending_delivery"
      | "pending_confirmation"
      | "pending_release"
      | "released"
      | "disputed"
      | "refund_requested"
      | "cancelled"
      | "expired"
      notification_type: "info" | "success" | "warning" | "error"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never
