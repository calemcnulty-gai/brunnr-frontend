/**
 * @fileoverview API types for Brunnr service integration
 * @module types/api
 */

// Common response types
export interface ApiMetadata {
  request_id: string
  timestamp: string
  client_ip?: string
  processing_time: number
  log_file_path?: string
}

export interface LLMProvider {
  provider: string
  model: string
  api_version: string
}

// Content Generation Types
export interface QuestionToExplanationRequest {
  text: string
  context?: string
}

export interface QuestionToExplanationResponse {
  status: 'completed' | 'failed'
  message: string
  metadata: ApiMetadata
  explanation: string
  content_metrics: {
    word_count: number
    character_count: number
    line_count: number
    estimated_reading_time_seconds: number
  }
  llm_provider: LLMProvider
}

export interface ExplanationToScreenplayRequest {
  text: string
}

export interface ScreenplayShot {
  description: string
  voiceover: string
}

export interface ScreenplayShotGroup {
  description: string
  shots: ScreenplayShot[]
}

export interface Screenplay {
  shotgroups: ScreenplayShotGroup[]
}

export interface ExplanationToScreenplayResponse {
  status: 'completed' | 'failed'
  message: string
  metadata: ApiMetadata
  screenplay: Screenplay
  structure_stats: {
    scene_count: number
    shot_count: number
    total_voiceover_words: number
  }
  llm_provider: LLMProvider
}

export interface ScreenplayToManifestRequest extends Screenplay {}

export interface ManifestTemplate {
  id: string
  type: string
  content: string
  labels?: string[]
}

export interface ManifestAction {
  [actionType: string]: any
}

export interface ManifestShot {
  voiceover: string
  actions: ManifestAction[]
  duration?: number
  allow_bleed_over?: boolean
  contained?: boolean
}

export interface Manifest {
  video_id: string
  templates: ManifestTemplate[]
  shots: ManifestShot[]
}

export interface ScreenplayToManifestResponse {
  status: 'completed' | 'failed'
  message: string
  metadata: ApiMetadata
  manifest: Manifest
  manifest_stats: {
    template_count: number
    shot_count: number
    total_duration?: number
  }
  llm_provider: LLMProvider
}

// Media Production Types
export interface QuestionToVideoRequest {
  text: string
  context?: string
}

export interface ProcessingPhase {
  phase_name: string
  duration_seconds: number
  status: string
}

export interface QuestionToVideoResponse {
  status: 'completed' | 'failed'
  message: string
  metadata: ApiMetadata
  video_path: string
  download_url: string
  video_id: string
  processing_phases: ProcessingPhase[]
  total_processing_time: number
}

export interface ManifestToVideoRequest extends Manifest {}

export interface ManifestToVideoResponse {
  status: 'completed' | 'failed'
  video_path: string
  download_url: string
  message: string
  metadata: ApiMetadata
}

// Complete pipeline types
export interface QuestionToManifestRequest {
  text: string
  context?: string
}

export interface QuestionToManifestResponse {
  status: 'completed' | 'failed'
  message: string
  metadata: ApiMetadata
  manifest: Manifest
  phase_results: {
    explanation: string
    explanation_metrics: QuestionToExplanationResponse['content_metrics']
    screenplay: string
    screenplay_metrics: ExplanationToScreenplayResponse['structure_stats']
    manifest: Manifest
    manifest_stats: ScreenplayToManifestResponse['manifest_stats']
  }
}

// Analytics Types
export interface AudioTimingAnalysisRequest extends Manifest {}

export interface AudioTimingShot {
  shot_index: number
  voiceover: string
  word_count: number
  has_timing: boolean
  start_time: number
  end_time: number
  duration: number
  is_silent: boolean
  can_bleed_over: boolean
}

export interface AudioTimingAnalysisResponse {
  total_duration: number
  total_words: number
  shot_count: number
  splice_points: Array<{
    time: number
    type: string
    shot_index: number
  }>
  shots: AudioTimingShot[]
  warnings: string[]
  recommendations: string[]
}

// Error type
export interface ApiErrorResponse {
  detail: string
}
