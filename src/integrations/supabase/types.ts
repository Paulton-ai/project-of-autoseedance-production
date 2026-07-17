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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      generations: {
        Row: {
          id: string
          user_id: string
          tool_type: string
          prompt: string
          settings: Json
          result_url: string | null
          thumbnail_url: string | null
          status: string
          credits_used: number
          is_favorite: boolean
          error: string | null
          external_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tool_type: string
          prompt: string
          settings?: Json
          result_url?: string | null
          thumbnail_url?: string | null
          status?: string
          credits_used?: number
          is_favorite?: boolean
          error?: string | null
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tool_type?: string
          prompt?: string
          settings?: Json
          result_url?: string | null
          thumbnail_url?: string | null
          status?: string
          credits_used?: number
          is_favorite?: boolean
          error?: string | null
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_wallets: {
        Row: {
          user_id: string
          balance: number
          monthly_grant: number
          period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          balance?: number
          monthly_grant?: number
          period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          balance?: number
          monthly_grant?: number
          period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_ledger: {
        Row: {
          id: string
          user_id: string
          amount: number
          reason: string
          tool: string | null
          generation_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          reason: string
          tool?: string | null
          generation_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          reason?: string
          tool?: string | null
          generation_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      credits_transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type: string
          reason: string
          amount: number
          balance_before: number
          balance_after: number
          reference_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type: string
          reason: string
          amount: number
          balance_before: number
          balance_after: number
          reference_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?: string
          reason?: string
          amount?: number
          balance_before?: number
          balance_after?: number
          reference_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          id: string
          name: string
          display_name: string | null
          monthly_credits: number
          price_monthly: number | null
          price_yearly: number | null
          features: string[]
          is_active: boolean
          sort_order: number | null
        }
        Insert: {
          id: string
          name: string
          display_name?: string | null
          monthly_credits: number
          price_monthly?: number | null
          price_yearly?: number | null
          features?: string[]
          is_active?: boolean
          sort_order?: number | null
        }
        Update: {
          id?: string
          name?: string
          display_name?: string | null
          monthly_credits?: number
          price_monthly?: number | null
          price_yearly?: number | null
          features?: string[]
          is_active?: boolean
          sort_order?: number | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          id: string
          subject: string
          body_html: string
          recipient_type: string
          recipient_count: number
          sent_by: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          subject: string
          body_html: string
          recipient_type: string
          recipient_count?: number
          sent_by?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          subject?: string
          body_html?: string
          recipient_type?: string
          recipient_count?: number
          sent_by?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: number
          site_name: string
          support_email: string
          free_signup_credits: number
          max_images_per_day: number
          max_videos_per_day: number
          maintenance_mode: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          site_name?: string
          support_email?: string
          free_signup_credits?: number
          max_images_per_day?: number
          max_videos_per_day?: number
          maintenance_mode?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          site_name?: string
          support_email?: string
          free_signup_credits?: number
          max_images_per_day?: number
          max_videos_per_day?: number
          maintenance_mode?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      generated_files: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          job_id: string | null
          platform: Database["public"]["Enums"]["platform"] | null
          prompt_text: string | null
          thumbnail_url: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          job_id?: string | null
          platform?: Database["public"]["Enums"]["platform"] | null
          prompt_text?: string | null
          thumbnail_url?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          job_id?: string | null
          platform?: Database["public"]["Enums"]["platform"] | null
          prompt_text?: string | null
          thumbnail_url?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_files_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "queue_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_logs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          level: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          level?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          level?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "queue_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          extension_connected: boolean
          extension_last_seen: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          extension_connected?: boolean
          extension_last_seen?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          extension_connected?: boolean
          extension_last_seen?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          created_at: string
          id: string
          platform: Database["public"]["Enums"]["platform"] | null
          tags: string[] | null
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["platform"] | null
          tags?: string[] | null
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["platform"] | null
          tags?: string[] | null
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      queue_jobs: {
        Row: {
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          ingredients: Json | null
          media_urls: string[]
          mode: string
          output_url: string | null
          platform: Database["public"]["Enums"]["platform"]
          position: number
          progress: number
          prompt_text: string
          settings: Json
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          ingredients?: Json | null
          media_urls?: string[]
          mode?: string
          output_url?: string | null
          platform?: Database["public"]["Enums"]["platform"]
          position?: number
          progress?: number
          prompt_text: string
          settings?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          ingredients?: Json | null
          media_urls?: string[]
          mode?: string
          output_url?: string | null
          platform?: Database["public"]["Enums"]["platform"]
          position?: number
          progress?: number
          prompt_text?: string
          settings?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_tier"]
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          day: string
          id: string
          prompts_used: number
          user_id: string
        }
        Insert: {
          day?: string
          id?: string
          prompts_used?: number
          user_id: string
        }
        Update: {
          day?: string
          id?: string
          prompts_used?: number
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
          role?: Database["public"]["Enums"]["app_role"]
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
      user_settings: {
        Row: {
          auto_download: boolean
          automation_speed: string
          default_platform: Database["public"]["Enums"]["platform"]
          delay_ms: number
          download_path: string | null
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_download?: boolean
          automation_speed?: string
          default_platform?: Database["public"]["Enums"]["platform"]
          delay_ms?: number
          download_path?: string | null
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_download?: boolean
          automation_speed?: string
          default_platform?: Database["public"]["Enums"]["platform"]
          delay_ms?: number
          download_path?: string | null
          theme?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      consume_credits: {
        Args: {
          _tool: string
          _amount: number
        }
        Returns: Json
      }
      grant_credits: {
        Args: {
          _user_id: string
          _amount: number
          _reason: string
        }
        Returns: Json
      }
      add_credits: {
        Args: {
          _user_id: string
          _amount: number
          _reason: string
          _reference_id?: string | null
          _metadata?: Json | null
        }
        Returns: Json
      }
      deduct_credits: {
        Args: {
          _user_id: string
          _amount: number
          _reason: string
          _reference_id?: string | null
          _metadata?: Json | null
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
      job_status: "pending" | "running" | "done" | "failed" | "cancelled"
      plan_tier: "free" | "basic" | "premium"
      platform: "seedance" | "dreamina" | "jimeng"
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
      app_role: ["admin", "user"],
      job_status: ["pending", "running", "done", "failed", "cancelled"],
      plan_tier: ["free", "basic", "premium"],
      platform: ["seedance", "dreamina", "jimeng"],
    },
  },
} as const
