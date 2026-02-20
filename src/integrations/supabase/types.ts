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
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          status: "active" | "suspended"
          suspension_reason: string | null
          can_chat: boolean
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          status?: "active" | "suspended"
          suspension_reason?: string | null
          can_chat?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          status?: "active" | "suspended"
          suspension_reason?: string | null
          can_chat?: boolean
        }
        Relationships: []
      }
      transactions: {
        Row: {
          admin_notes: string | null
          amount: number
          buyer_email: string
          buyer_id: string | null
          confirmed_at: string | null
          created_at: string
          deal_description: string | null
          deal_title: string
          delivered_at: string | null
          id: string
          paid_at: string | null
          payment_reference: string | null
          product_type: Database["public"]["Enums"]["product_type"]
          proof_description: string | null
          proof_url: string | null
          released_at: string | null
          seller_email: string
          seller_phone: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          updated_at: string
          muted_ids: string[] | null
          invite_token: string | null
          seller_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          buyer_email: string
          buyer_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          deal_description?: string | null
          deal_title: string
          delivered_at?: string | null
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          product_type: Database["public"]["Enums"]["product_type"]
          proof_description?: string | null
          proof_url?: string | null
          released_at?: string | null
          seller_email: string
          seller_phone?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
          muted_ids?: string[] | null
          invite_token?: string | null
          seller_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          buyer_email?: string
          buyer_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          deal_description?: string | null
          deal_title?: string
          delivered_at?: string | null
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          product_type?: Database["public"]["Enums"]["product_type"]
          proof_description?: string | null
          proof_url?: string | null
          released_at?: string | null
          seller_email?: string
          seller_phone?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
          muted_ids?: string[] | null
          invite_token?: string | null
          seller_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_email: string
          sender_id: string
          sender_role: string
          transaction_id: string
          is_deleted: boolean
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_email: string
          sender_id: string
          sender_role: string
          transaction_id: string
          is_deleted?: boolean
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_email?: string
          sender_id?: string
          sender_role?: string
          transaction_id?: string
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
          read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: "info" | "success" | "warning" | "error"
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: "info" | "success" | "warning" | "error"
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users" // This is typically 'auth.users' but for types generation usually points to public tables or ignored. Supabase types gen often puts 'users' here if there is a wrapper. I will assume 'users' is the intended relation name for foreign keys if it exists in public schema, or it might be a dangling reference. Given the previous code, I'll keep it as is or change to 'profiles' if 'users' doesn't exist in public. Wait, previous code had referencedRelation: "users". I'll keep it to avoid breaking changes, but usually it should be profiles if it's a public table.
            // Actually, `notifications.user_id` probably references `auth.users`. In generated types, relationships to auth schema are often included.
            // However, to be safe and consistent with previous file, I will keep it matching what I saw.
            // The previous file had referencedRelation: "users".
          }
        ]
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
