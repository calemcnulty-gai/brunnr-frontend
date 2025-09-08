/**
 * @fileoverview Partner integration types for Incept and other partners
 * @module types/partner
 */

// ============================================
// CORE PARTNER TYPES
// ============================================

export interface Partner {
  id: string
  name: string
  partner_code: string // e.g., 'INCEPT'
  api_key_prefix?: string
  lms_integration_enabled: boolean
  sandbox_enabled: boolean
  production_enabled: boolean
  created_at: string
  updated_at: string
  metadata: {
    lms_platform?: string
    target_grades?: string[]
    subjects?: string[]
    roster_size?: number
    [key: string]: any
  }
}

export interface ApiKey {
  id: string
  partner_id: string
  user_id?: string
  key_prefix: string // First 8 chars for identification
  seat_name?: string
  environment: 'sandbox' | 'production'
  is_active: boolean
  last_used_at?: string
  request_count: number
  created_at: string
  expires_at?: string
  metadata?: Record<string, any>
}

// ============================================
// API REQUEST TRACKING
// ============================================

export interface ApiRequest {
  id: string
  request_id: string // External request ID
  partner_id?: string
  api_key_id?: string
  user_id?: string
  endpoint: string
  method: string
  status_code?: number
  requested_at: string
  completed_at?: string
  processing_time_ms?: number
  request_payload?: any
  response_payload?: any
  error_message?: string
  ip_address?: string
  user_agent?: string
}

// ============================================
// VIDEO GENERATION TRACKING
// ============================================

export interface VideoGeneration {
  id: string
  request_id?: string
  partner_id?: string
  api_key_id?: string
  user_id?: string
  project_id?: string
  
  // Generation details
  manifest: any
  script_text?: string
  grade_level?: string
  subject?: string
  video_type?: string
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  
  // Timing
  created_at: string
  script_received_at?: string
  processing_started_at?: string
  processing_completed_at?: string
  
  // Performance metrics
  total_duration_seconds?: number
  manifest_to_mp4_minutes?: number
  script_to_completion_hours?: number
  
  // Output
  video_url?: string
  video_duration_seconds?: number
  file_size_mb?: number
  
  // Quality
  render_success?: boolean
  quality_score?: number
  error_details?: any
  retry_count?: number
}

// ============================================
// LMS INTEGRATION
// ============================================

export interface LmsPublication {
  id: string
  partner_id?: string
  video_generation_id?: string
  lms_platform?: string
  course_id?: string
  module_id?: string
  published_at?: string
  available_to_students: boolean
  student_roster_count?: number
  view_count?: number
  unique_viewers?: number
  completion_rate?: number
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

// ============================================
// SLA METRICS
// ============================================

export interface SlaMetrics {
  id: string
  partner_id: string
  date: string
  
  // Daily metrics
  total_requests: number
  successful_renders: number
  failed_renders: number
  success_rate: number
  
  // Timing metrics
  p50_manifest_to_mp4_minutes?: number
  p95_manifest_to_mp4_minutes?: number
  p99_manifest_to_mp4_minutes?: number
  
  // 24h SLA
  jobs_within_24h: number
  jobs_beyond_24h: number
  sla_24h_compliance_rate: number
  
  // Seats
  active_seats: number
  unique_api_keys_used: number
  
  created_at: string
}

// ============================================
// REPORTING TYPES
// ============================================

export interface PartnerDashboard {
  partner_id: string
  partner_name: string
  partner_code: string
  total_generations: number
  successful_renders: number
  last_30_days: number
  active_seats_30d: number
  avg_processing_time?: number
  p95_processing_time?: number
}

export interface InceptSeptemberMetrics {
  unique_requests: number
  successful_renders: number
  success_rate: number
  active_seats: number
  p95_minutes?: number
  within_24h_sla: number
  sla_compliance_rate: number
  fourth_grade_math_videos: number
}

export interface ActiveSeat {
  api_key_id: string
  seat_name?: string
  request_count: number
  last_activity: string
}

// ============================================
// AUDIT LOG
// ============================================

export interface PartnerAuditLog {
  id: string
  partner_id?: string
  user_id?: string
  action: string
  entity_type?: string
  entity_id?: string
  changes?: any
  metadata?: any
  created_at: string
}

// ============================================
// API RESPONSES
// ============================================

export interface GenerationReportResponse {
  success: boolean
  data?: {
    summary: InceptSeptemberMetrics
    daily_metrics: SlaMetrics[]
    active_seats: ActiveSeat[]
    recent_generations: VideoGeneration[]
  }
  error?: string
}

export interface PartnerReportRequest {
  partner_code: string
  start_date: string // ISO date
  end_date: string // ISO date
  include_details?: boolean
}

export interface SlaReportResponse {
  partner_id: string
  partner_name: string
  period: {
    start: string
    end: string
  }
  metrics: {
    total_requests: number
    success_rate: number
    p50_minutes: number
    p95_minutes: number
    sla_24h_compliance: number
    active_seats: number
  }
  daily_breakdown?: SlaMetrics[]
  seat_activity?: ActiveSeat[]
}

// ============================================
// TRACKING HELPERS
// ============================================

export interface TrackingEvent {
  request_id: string
  partner_id?: string
  api_key_id?: string
  event_type: 'api_request' | 'video_start' | 'video_complete' | 'video_error' | 'lms_publish'
  timestamp: string
  metadata?: Record<string, any>
}

export interface VideoGenerationRequest {
  request_id: string
  manifest: any
  script?: string
  grade_level?: string
  subject?: string
  partner_code?: string
  api_key?: string
}

// ============================================
// SEPTEMBER 2025 GOALS SPECIFIC
// ============================================

export interface InceptGoalProgress {
  // Integration & Publishing (by Sep 14)
  published_videos: {
    count: number
    target: number // 5+
    fourth_grade_math: number
    available_to_students: boolean
  }
  
  // Production Usage (Sep 1-30)
  production_usage: {
    successful_renders: number
    target_renders: number // ≥40
    success_rate: number
    target_success_rate: number // ≥95%
    active_seats: number
    target_seats: number // ≥2
  }
  
  // Reliability (Sep 1-30)
  reliability: {
    p95_manifest_to_mp4: number // minutes
    target_p95: number // ≤15m
    jobs_within_24h_rate: number
    target_24h_rate: number // ≥90%
  }
  
  // Enrollment
  enrollment: {
    roster_count: number
    target_roster: number // ≥200
    announcement_posted: boolean
    acceptance_received: boolean
    acceptance_date?: string
  }
  
  // Overall
  overall_progress: number // percentage
  status: 'on_track' | 'at_risk' | 'behind' | 'complete'
  last_updated: string
}

// ============================================
// EXPORT FORMATS
// ============================================

export interface CsvExportRow {
  request_id: string
  partner_id: string
  status: string
  processing_time_p50?: number
  processing_time_p95?: number
  within_24h_sla: boolean
  seat_id: string
  seat_name?: string
  timestamp: string
}
