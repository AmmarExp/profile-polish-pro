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
      ai_recommendations: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_read: boolean
          priority: number
          title: string
          user_id: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          priority?: number
          title: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          priority?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_oauth_states: {
        Row: {
          created_at: string
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string
          state: string
          user_id: string
        }
        Update: {
          created_at?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          error_message: string | null
          hashtags: string[] | null
          id: string
          language: string
          linkedin_post_id: string | null
          published_at: string | null
          scheduled_at: string | null
          source: Database["public"]["Enums"]["post_source"]
          status: Database["public"]["Enums"]["post_status"]
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          language?: string
          linkedin_post_id?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          source?: Database["public"]["Enums"]["post_source"]
          status?: Database["public"]["Enums"]["post_status"]
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          language?: string
          linkedin_post_id?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          source?: Database["public"]["Enums"]["post_source"]
          status?: Database["public"]["Enums"]["post_status"]
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          goal: string | null
          headline: string | null
          id: string
          industry: string | null
          language: string
          linkedin_access_token: string | null
          linkedin_connected: boolean
          linkedin_email: string | null
          linkedin_expires_at: string | null
          linkedin_headline: string | null
          linkedin_name: string | null
          linkedin_picture: string | null
          linkedin_refresh_token: string | null
          linkedin_synced_at: string | null
          linkedin_urn: string | null
          onboarded: boolean
          specialty: string | null
          tone: Database["public"]["Enums"]["ai_tone"]
          trial_posts_limit: number
          trial_posts_used: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          goal?: string | null
          headline?: string | null
          id: string
          industry?: string | null
          language?: string
          linkedin_access_token?: string | null
          linkedin_connected?: boolean
          linkedin_email?: string | null
          linkedin_expires_at?: string | null
          linkedin_headline?: string | null
          linkedin_name?: string | null
          linkedin_picture?: string | null
          linkedin_refresh_token?: string | null
          linkedin_synced_at?: string | null
          linkedin_urn?: string | null
          onboarded?: boolean
          specialty?: string | null
          tone?: Database["public"]["Enums"]["ai_tone"]
          trial_posts_limit?: number
          trial_posts_used?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          goal?: string | null
          headline?: string | null
          id?: string
          industry?: string | null
          language?: string
          linkedin_access_token?: string | null
          linkedin_connected?: boolean
          linkedin_email?: string | null
          linkedin_expires_at?: string | null
          linkedin_headline?: string | null
          linkedin_name?: string | null
          linkedin_picture?: string | null
          linkedin_refresh_token?: string | null
          linkedin_synced_at?: string | null
          linkedin_urn?: string | null
          onboarded?: boolean
          specialty?: string | null
          tone?: Database["public"]["Enums"]["ai_tone"]
          trial_posts_limit?: number
          trial_posts_used?: number
          updated_at?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          language: string
          name: string
          system_prompt: string
          tone: Database["public"]["Enums"]["ai_tone"] | null
          updated_at: string
          user_prompt: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          language?: string
          name: string
          system_prompt: string
          tone?: Database["public"]["Enums"]["ai_tone"] | null
          updated_at?: string
          user_prompt: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          language?: string
          name?: string
          system_prompt?: string
          tone?: Database["public"]["Enums"]["ai_tone"] | null
          updated_at?: string
          user_prompt?: string
        }
        Relationships: []
      }
      schedule_settings: {
        Row: {
          active: boolean
          auto_generate: boolean
          posts_per_day: number
          publish_times: string[]
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          auto_generate?: boolean
          posts_per_day?: number
          publish_times?: string[]
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          auto_generate?: boolean
          posts_per_day?: number
          publish_times?: string[]
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          paddle_customer_id: string | null
          paddle_subscription_id: string | null
          plan: Database["public"]["Enums"]["sub_plan"]
          status: Database["public"]["Enums"]["sub_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan?: Database["public"]["Enums"]["sub_plan"]
          status?: Database["public"]["Enums"]["sub_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan?: Database["public"]["Enums"]["sub_plan"]
          status?: Database["public"]["Enums"]["sub_status"]
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
      ai_tone: "friendly" | "formal" | "inspiring" | "educational" | "witty"
      app_role: "admin" | "user"
      post_source: "ai" | "manual"
      post_status: "draft" | "scheduled" | "published" | "failed"
      sub_plan: "free" | "pro_monthly" | "pro_yearly"
      sub_status: "trial" | "active" | "past_due" | "canceled" | "expired"
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
      ai_tone: ["friendly", "formal", "inspiring", "educational", "witty"],
      app_role: ["admin", "user"],
      post_source: ["ai", "manual"],
      post_status: ["draft", "scheduled", "published", "failed"],
      sub_plan: ["free", "pro_monthly", "pro_yearly"],
      sub_status: ["trial", "active", "past_due", "canceled", "expired"],
    },
  },
} as const
