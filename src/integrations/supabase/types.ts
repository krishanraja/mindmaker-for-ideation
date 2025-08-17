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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          ai_model: string | null
          created_at: string
          id: string
          insights_generated: string[] | null
          led_to_qualification: boolean | null
          quality_score: number | null
          question: string
          response: string
          response_time_ms: number | null
          session_id: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          ai_model?: string | null
          created_at?: string
          id?: string
          insights_generated?: string[] | null
          led_to_qualification?: boolean | null
          quality_score?: number | null
          question: string
          response: string
          response_time_ms?: number | null
          session_id: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          ai_model?: string | null
          created_at?: string
          id?: string
          insights_generated?: string[] | null
          led_to_qualification?: boolean | null
          quality_score?: number | null
          question?: string
          response?: string
          response_time_ms?: number | null
          session_id?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "conversation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string | null
          metadata: Json | null
          processing_time_ms: number | null
          role: string
          session_id: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          processing_time_ms?: number | null
          role: string
          session_id: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          processing_time_ms?: number | null
          role?: string
          session_id?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "conversation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_sessions: {
        Row: {
          created_at: string
          engagement_score: number | null
          id: string
          key_insights: string[] | null
          lead_qualified: boolean | null
          next_steps: string[] | null
          session_type: string | null
          status: string | null
          summary: string | null
          title: string
          total_messages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          engagement_score?: number | null
          id?: string
          key_insights?: string[] | null
          lead_qualified?: boolean | null
          next_steps?: string[] | null
          session_type?: string | null
          status?: string | null
          summary?: string | null
          title?: string
          total_messages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          engagement_score?: number | null
          id?: string
          key_insights?: string[] | null
          lead_qualified?: boolean | null
          next_steps?: string[] | null
          session_type?: string | null
          status?: string | null
          summary?: string | null
          title?: string
          total_messages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      engagement_analytics: {
        Row: {
          created_at: string
          engagement_duration_seconds: number | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          engagement_duration_seconds?: number | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          engagement_duration_seconds?: number | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_analytics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "conversation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      google_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_sheets_sync_log: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          lead_qualification_id: string | null
          processing_time_ms: number | null
          retry_count: number | null
          sheet_row_number: number | null
          status: string
          sync_data: Json | null
          sync_type: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          lead_qualification_id?: string | null
          processing_time_ms?: number | null
          retry_count?: number | null
          sheet_row_number?: number | null
          status?: string
          sync_data?: Json | null
          sync_type: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          lead_qualification_id?: string | null
          processing_time_ms?: number | null
          retry_count?: number | null
          sheet_row_number?: number | null
          status?: string
          sync_data?: Json | null
          sync_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_sheets_sync_log_lead_qualification_id_fkey"
            columns: ["lead_qualification_id"]
            isOneToOne: false
            referencedRelation: "lead_qualification_data"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_qualification_data: {
        Row: {
          authority_level: number | null
          budget_qualified: boolean | null
          conversion_probability: number | null
          created_at: string
          fit_score: number | null
          follow_up_date: string | null
          id: string
          need_urgency: number | null
          next_action: string | null
          notes: string | null
          pain_point_severity: number | null
          qualification_criteria: Json
          recommended_service: string | null
          session_id: string | null
          timeline_qualified: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          authority_level?: number | null
          budget_qualified?: boolean | null
          conversion_probability?: number | null
          created_at?: string
          fit_score?: number | null
          follow_up_date?: string | null
          id?: string
          need_urgency?: number | null
          next_action?: string | null
          notes?: string | null
          pain_point_severity?: number | null
          qualification_criteria?: Json
          recommended_service?: string | null
          session_id?: string | null
          timeline_qualified?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          authority_level?: number | null
          budget_qualified?: boolean | null
          conversion_probability?: number | null
          created_at?: string
          fit_score?: number | null
          follow_up_date?: string | null
          id?: string
          need_urgency?: number | null
          next_action?: string | null
          notes?: string | null
          pain_point_severity?: number | null
          qualification_criteria?: Json
          recommended_service?: string | null
          session_id?: string | null
          timeline_qualified?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_qualification_data_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "conversation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          resource: string
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          resource: string
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          resource?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_business_context: {
        Row: {
          confidence_score: number | null
          context_key: string
          context_type: string
          context_value: string
          created_at: string
          id: string
          source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          context_key: string
          context_type: string
          context_value: string
          created_at?: string
          id?: string
          source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          context_key?: string
          context_type?: string
          context_value?: string
          created_at?: string
          id?: string
          source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          budget_range: string | null
          business_type: string | null
          company_size: string | null
          created_at: string
          email: string | null
          goals: string[] | null
          id: string
          industry: string | null
          lead_score: number | null
          name: string | null
          pain_points: string[] | null
          qualification_status: string | null
          timeline: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_range?: string | null
          business_type?: string | null
          company_size?: string | null
          created_at?: string
          email?: string | null
          goals?: string[] | null
          id?: string
          industry?: string | null
          lead_score?: number | null
          name?: string | null
          pain_points?: string[] | null
          qualification_status?: string | null
          timeline?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_range?: string | null
          business_type?: string | null
          company_size?: string | null
          created_at?: string
          email?: string | null
          goals?: string[] | null
          id?: string
          industry?: string | null
          lead_score?: number | null
          name?: string | null
          pain_points?: string[] | null
          qualification_status?: string | null
          timeline?: string | null
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
