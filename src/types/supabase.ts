export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          query?: string
          extensions?: Json
          operationName?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          environment: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          metadata: Json | null
          partner_id: string | null
          request_count: number | null
          seat_name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          metadata?: Json | null
          partner_id?: string | null
          request_count?: number | null
          seat_name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          metadata?: Json | null
          partner_id?: string | null
          request_count?: number | null
          seat_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_dashboard"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "api_keys_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_access"
            referencedColumns: ["user_id"]
          },
        ]
      }
      api_requests: {
        Row: {
          api_key_id: string | null
          completed_at: string | null
          endpoint: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          method: string
          partner_id: string | null
          processing_time_ms: number | null
          request_id: string
          request_payload: Json | null
          requested_at: string | null
          response_payload: Json | null
          status_code: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          completed_at?: string | null
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          method: string
          partner_id?: string | null
          processing_time_ms?: number | null
          request_id: string
          request_payload?: Json | null
          requested_at?: string | null
          response_payload?: Json | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          completed_at?: string | null
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          method?: string
          partner_id?: string | null
          processing_time_ms?: number | null
          request_id?: string
          request_payload?: Json | null
          requested_at?: string | null
          response_payload?: Json | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_requests_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_dashboard"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "api_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_access"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lms_publications: {
        Row: {
          available_to_students: boolean | null
          completion_rate: number | null
          course_id: string | null
          created_at: string | null
          id: string
          lms_platform: string | null
          metadata: Json | null
          module_id: string | null
          partner_id: string | null
          published_at: string | null
          student_roster_count: number | null
          unique_viewers: number | null
          updated_at: string | null
          video_generation_id: string | null
          view_count: number | null
        }
        Insert: {
          available_to_students?: boolean | null
          completion_rate?: number | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          lms_platform?: string | null
          metadata?: Json | null
          module_id?: string | null
          partner_id?: string | null
          published_at?: string | null
          student_roster_count?: number | null
          unique_viewers?: number | null
          updated_at?: string | null
          video_generation_id?: string | null
          view_count?: number | null
        }
        Update: {
          available_to_students?: boolean | null
          completion_rate?: number | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          lms_platform?: string | null
          metadata?: Json | null
          module_id?: string | null
          partner_id?: string | null
          published_at?: string | null
          student_roster_count?: number | null
          unique_viewers?: number | null
          updated_at?: string | null
          video_generation_id?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lms_publications_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_dashboard"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "lms_publications_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_publications_video_generation_id_fkey"
            columns: ["video_generation_id"]
            isOneToOne: false
            referencedRelation: "video_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_audit_log: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          partner_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          partner_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          partner_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_audit_log_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_dashboard"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_audit_log_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_access"
            referencedColumns: ["user_id"]
          },
        ]
      }
      partners: {
        Row: {
          api_key_prefix: string | null
          created_at: string | null
          id: string
          lms_integration_enabled: boolean | null
          metadata: Json | null
          name: string
          partner_code: string
          production_enabled: boolean | null
          sandbox_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          api_key_prefix?: string | null
          created_at?: string | null
          id?: string
          lms_integration_enabled?: boolean | null
          metadata?: Json | null
          name: string
          partner_code: string
          production_enabled?: boolean | null
          sandbox_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          api_key_prefix?: string | null
          created_at?: string | null
          id?: string
          lms_integration_enabled?: boolean | null
          metadata?: Json | null
          name?: string
          partner_code?: string
          production_enabled?: boolean | null
          sandbox_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          current_step: string | null
          data: Json
          id: string
          name: string
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string | null
          user_id: string
          video_storage_path: string | null
          video_url: string | null
          workflow_type: Database["public"]["Enums"]["workflow_type"]
        }
        Insert: {
          created_at?: string | null
          current_step?: string | null
          data?: Json
          id?: string
          name: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string | null
          user_id: string
          video_storage_path?: string | null
          video_url?: string | null
          workflow_type: Database["public"]["Enums"]["workflow_type"]
        }
        Update: {
          created_at?: string | null
          current_step?: string | null
          data?: Json
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string | null
          user_id?: string
          video_storage_path?: string | null
          video_url?: string | null
          workflow_type?: Database["public"]["Enums"]["workflow_type"]
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_access"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sla_metrics: {
        Row: {
          active_seats: number | null
          created_at: string | null
          date: string
          failed_renders: number | null
          id: string
          jobs_beyond_24h: number | null
          jobs_within_24h: number | null
          p50_manifest_to_mp4_minutes: number | null
          p95_manifest_to_mp4_minutes: number | null
          p99_manifest_to_mp4_minutes: number | null
          partner_id: string | null
          sla_24h_compliance_rate: number | null
          success_rate: number | null
          successful_renders: number | null
          total_requests: number | null
          unique_api_keys_used: number | null
        }
        Insert: {
          active_seats?: number | null
          created_at?: string | null
          date: string
          failed_renders?: number | null
          id?: string
          jobs_beyond_24h?: number | null
          jobs_within_24h?: number | null
          p50_manifest_to_mp4_minutes?: number | null
          p95_manifest_to_mp4_minutes?: number | null
          p99_manifest_to_mp4_minutes?: number | null
          partner_id?: string | null
          sla_24h_compliance_rate?: number | null
          success_rate?: number | null
          successful_renders?: number | null
          total_requests?: number | null
          unique_api_keys_used?: number | null
        }
        Update: {
          active_seats?: number | null
          created_at?: string | null
          date?: string
          failed_renders?: number | null
          id?: string
          jobs_beyond_24h?: number | null
          jobs_within_24h?: number | null
          p50_manifest_to_mp4_minutes?: number | null
          p95_manifest_to_mp4_minutes?: number | null
          p99_manifest_to_mp4_minutes?: number | null
          partner_id?: string | null
          sla_24h_compliance_rate?: number | null
          success_rate?: number | null
          successful_renders?: number | null
          total_requests?: number | null
          unique_api_keys_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_metrics_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_dashboard"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "sla_metrics_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          partner_id: string | null
          permissions: Json | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          partner_id?: string | null
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          partner_id?: string | null
          permissions?: Json | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_dashboard"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "user_roles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_dashboard_access"
            referencedColumns: ["user_id"]
          },
        ]
      }
      video_generations: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          error_details: Json | null
          file_size_mb: number | null
          grade_level: string | null
          id: string
          manifest: Json
          manifest_to_mp4_minutes: number | null
          partner_id: string | null
          processing_completed_at: string | null
          processing_started_at: string | null
          project_id: string | null
          quality_score: number | null
          render_success: boolean | null
          request_id: string | null
          retry_count: number | null
          script_received_at: string | null
          script_text: string | null
          script_to_completion_hours: number | null
          status: string | null
          subject: string | null
          total_duration_seconds: number | null
          user_id: string | null
          video_duration_seconds: number | null
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          error_details?: Json | null
          file_size_mb?: number | null
          grade_level?: string | null
          id?: string
          manifest: Json
          manifest_to_mp4_minutes?: number | null
          partner_id?: string | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          project_id?: string | null
          quality_score?: number | null
          render_success?: boolean | null
          request_id?: string | null
          retry_count?: number | null
          script_received_at?: string | null
          script_text?: string | null
          script_to_completion_hours?: number | null
          status?: string | null
          subject?: string | null
          total_duration_seconds?: number | null
          user_id?: string | null
          video_duration_seconds?: number | null
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          error_details?: Json | null
          file_size_mb?: number | null
          grade_level?: string | null
          id?: string
          manifest?: Json
          manifest_to_mp4_minutes?: number | null
          partner_id?: string | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          project_id?: string | null
          quality_score?: number | null
          render_success?: boolean | null
          request_id?: string | null
          retry_count?: number | null
          script_received_at?: string | null
          script_text?: string | null
          script_to_completion_hours?: number | null
          status?: string | null
          subject?: string | null
          total_duration_seconds?: number | null
          user_id?: string | null
          video_duration_seconds?: number | null
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_generations_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_generations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_dashboard"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "video_generations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_generations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_generations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "api_requests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "video_generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_access"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      incept_september_metrics: {
        Row: {
          active_seats: number | null
          fourth_grade_math_videos: number | null
          p95_minutes: number | null
          sla_compliance_rate: number | null
          success_rate: number | null
          successful_renders: number | null
          unique_requests: number | null
          within_24h_sla: number | null
        }
        Relationships: []
      }
      partner_dashboard: {
        Row: {
          active_seats_30d: number | null
          avg_processing_time: number | null
          last_30_days: number | null
          p95_processing_time: number | null
          partner_code: string | null
          partner_id: string | null
          partner_name: string | null
          successful_renders: number | null
          total_generations: number | null
        }
        Relationships: []
      }
      user_dashboard_access: {
        Row: {
          access_level: string | null
          email: string | null
          partner_code: string | null
          partner_id: string | null
          partner_name: string | null
          role: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_dashboard"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "user_roles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_user_role: {
        Args: { p_partner_id?: string; p_role: string; p_user_id: string }
        Returns: undefined
      }
      calculate_sla_metrics: {
        Args: { p_partner_id: string; p_start_date: string; p_end_date: string }
        Returns: {
          sla_24h_rate: number
          date: string
          total_requests: number
          successful_renders: number
          success_rate: number
          p50_minutes: number
          within_24h_count: number
          p95_minutes: number
          active_seats: number
        }[]
      }
      get_active_seats: {
        Args: { p_partner_id: string; p_start_date: string; p_end_date: string }
        Returns: {
          last_activity: string
          api_key_id: string
          seat_name: string
          request_count: number
        }[]
      }
      get_user_dashboard_data: {
        Args: { user_id_input?: string }
        Returns: Json
      }
      get_user_partner_id: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_partner: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      project_status:
        | "created"
        | "in_progress"
        | "generating"
        | "completed"
        | "failed"
      workflow_type: "quick" | "step-by-step" | "manifest"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      project_status: [
        "created",
        "in_progress",
        "generating",
        "completed",
        "failed",
      ],
      workflow_type: ["quick", "step-by-step", "manifest"],
    },
  },
} as const

