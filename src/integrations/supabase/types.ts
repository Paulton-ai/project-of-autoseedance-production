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
      ai_providers: {
        Row: {
          config: Json
          created_at: string
          display_name: string
          id: string
          is_enabled: boolean
          name: string
          supported_tools: string[]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          display_name: string
          id?: string
          is_enabled?: boolean
          name: string
          supported_tools?: string[]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          display_name?: string
          id?: string
          is_enabled?: boolean
          name?: string
          supported_tools?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      credit_ledger: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          generation_id: string | null
          id: string
          reason: string
          tool: string | null
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          generation_id?: string | null
          id?: string
          reason: string
          tool?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          generation_id?: string | null
          id?: string
          reason?: string
          tool?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          monthly_grant: number
          period_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          monthly_grant?: number
          period_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          monthly_grant?: number
          period_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          body_html: string
          created_at: string | null
          id: string
          recipient_count: number | null
          recipient_emails: string[] | null
          recipient_type: string
          sent_by: string | null
          status: string | null
          subject: string
        }
        Insert: {
          body_html: string
          created_at?: string | null
          id?: string
          recipient_count?: number | null
          recipient_emails?: string[] | null
          recipient_type: string
          sent_by?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          body_html?: string
          created_at?: string | null
          id?: string
          recipient_count?: number | null
          recipient_emails?: string[] | null
          recipient_type?: string
          sent_by?: string | null
          status?: string | null
          subject?: string
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
      generations: {
        Row: {
          created_at: string
          credits_used: number
          error: string | null
          id: string
          is_favorite: boolean
          prompt: string
          provider: string | null
          result_url: string | null
          settings: Json
          status: string
          thumbnail_url: string | null
          tool_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          error?: string | null
          id?: string
          is_favorite?: boolean
          prompt: string
          provider?: string | null
          result_url?: string | null
          settings?: Json
          status?: string
          thumbnail_url?: string | null
          tool_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          error?: string | null
          id?: string
          is_favorite?: boolean
          prompt?: string
          provider?: string | null
          result_url?: string | null
          settings?: Json
          status?: string
          thumbnail_url?: string | null
          tool_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          credits_granted: number
          currency: string
          id: string
          paypal_order_id: string | null
          paypal_subscription_id: string | null
          plan_name: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credits_granted?: number
          currency?: string
          id?: string
          paypal_order_id?: string | null
          paypal_subscription_id?: string | null
          plan_name?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credits_granted?: number
          currency?: string
          id?: string
          paypal_order_id?: string | null
          paypal_subscription_id?: string | null
          plan_name?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          display_name: string
          features: Json
          id: string
          is_active: boolean
          monthly_credits: number
          name: string
          price_monthly: number
          price_yearly: number
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          display_name: string
          features?: Json
          id?: string
          is_active?: boolean
          monthly_credits?: number
          name: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          display_name?: string
          features?: Json
          id?: string
          is_active?: boolean
          monthly_credits?: number
          name?: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
        }
        Relationships: []
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
      reel_generations: {
        Row: {
          aspect: string
          caption_style: string | null
          captions: boolean
          created_at: string
          credits_used: number
          error: string | null
          final_video_url: string | null
          id: string
          model: string | null
          music: boolean
          music_mood: string | null
          music_url: string | null
          niche: string | null
          quality: string
          reference_image_url: string | null
          scene_assets: Json | null
          script: Json | null
          status: string
          style: string | null
          topic: string
          updated_at: string
          user_id: string
          video_length: number
          voice: string | null
          voiceover: boolean
          voiceover_url: string | null
        }
        Insert: {
          aspect?: string
          caption_style?: string | null
          captions?: boolean
          created_at?: string
          credits_used?: number
          error?: string | null
          final_video_url?: string | null
          id?: string
          model?: string | null
          music?: boolean
          music_mood?: string | null
          music_url?: string | null
          niche?: string | null
          quality?: string
          reference_image_url?: string | null
          scene_assets?: Json | null
          script?: Json | null
          status?: string
          style?: string | null
          topic: string
          updated_at?: string
          user_id: string
          video_length?: number
          voice?: string | null
          voiceover?: boolean
          voiceover_url?: string | null
        }
        Update: {
          aspect?: string
          caption_style?: string | null
          captions?: boolean
          created_at?: string
          credits_used?: number
          error?: string | null
          final_video_url?: string | null
          id?: string
          model?: string | null
          music?: boolean
          music_mood?: string | null
          music_url?: string | null
          niche?: string | null
          quality?: string
          reference_image_url?: string | null
          scene_assets?: Json | null
          script?: Json | null
          status?: string
          style?: string | null
          topic?: string
          updated_at?: string
          user_id?: string
          video_length?: number
          voice?: string | null
          voiceover?: boolean
          voiceover_url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          paypal_customer_id: string | null
          paypal_subscription_id: string | null
          plan: Database["public"]["Enums"]["plan_tier"]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          paypal_customer_id?: string | null
          paypal_subscription_id?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          paypal_customer_id?: string | null
          paypal_subscription_id?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
          status?: string
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
      add_credits: {
        Args: { _amount: number; _reason: string; _user_id: string }
        Returns: Json
      }
      consume_credits: {
        Args: { _amount: number; _generation_id?: string; _tool: string }
        Returns: Json
      }
      ensure_user_bootstrap: { Args: never; Returns: undefined }
      ensure_user_records:
        | { Args: { _email?: string; _user_id: string }; Returns: undefined }
        | {
            Args: { _email?: string; _raw_meta?: Json; _user_id: string }
            Returns: undefined
          }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_user: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      job_status: "pending" | "running" | "done" | "failed" | "cancelled"
      plan_tier: "free" | "starter" | "pro" | "business"
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
      plan_tier: ["free", "starter", "pro", "business"],
      platform: ["seedance", "dreamina", "jimeng"],
    },
  },
} as const
