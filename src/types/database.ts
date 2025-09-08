/**
 * @fileoverview Database types for Brunnr projects
 * @module types/database
 */

export type WorkflowType = 'quick' | 'step-by-step' | 'manifest'
export type ProjectStatus = 'created' | 'in_progress' | 'generating' | 'completed' | 'failed'
export type StepType = 'question' | 'explanation' | 'screenplay' | 'manifest' | 'video'

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          workflow_type: WorkflowType
          status: ProjectStatus
          current_step: string | null
          data: ProjectData
          video_url: string | null
          video_storage_path: string | null
          manifest: any | null
          api_responses: any
          template_images: any[]
          shotgroups: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          workflow_type: WorkflowType
          status?: ProjectStatus
          current_step?: string | null
          data?: ProjectData
          video_url?: string | null
          video_storage_path?: string | null
          manifest?: any | null
          api_responses?: any
          template_images?: any[]
          shotgroups?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          workflow_type?: WorkflowType
          status?: ProjectStatus
          current_step?: string | null
          data?: ProjectData
          video_url?: string | null
          video_storage_path?: string | null
          manifest?: any | null
          api_responses?: any
          template_images?: any[]
          shotgroups?: any[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      workflow_type: WorkflowType
      project_status: ProjectStatus
    }
  }
}

// Project data stored in JSONB
export interface ProjectData {
  // Common fields
  question?: string
  context?: string
  
  // Pipeline step data
  explanation?: string
  explanationMetrics?: {
    word_count: number
    character_count: number
    line_count: number
    estimated_reading_time_seconds: number
  }
  
  screenplay?: any // Screenplay JSON structure
  screenplayMetrics?: {
    scene_count: number
    shot_count: number
    total_voiceover_words: number
  }
  
  manifest?: any // Manifest JSON structure
  manifestStats?: {
    template_count: number
    shot_count: number
    total_duration?: number
  }
  
  // API response data
  requestId?: string
  processingTime?: number
  processingPhases?: Array<{
    phase_name: string
    duration_seconds: number
    status: string
  }>
  
  // Error tracking
  lastError?: {
    message: string
    detail?: string
    timestamp: string
  }
}

// Type helpers
export type Project = Database['public']['Tables']['projects']['Row']
export type NewProject = Database['public']['Tables']['projects']['Insert']
export type UpdateProject = Database['public']['Tables']['projects']['Update']
