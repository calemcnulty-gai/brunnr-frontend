/**
 * @fileoverview API types and error classes
 * @module api/types
 */

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Video generation request types
 */
export interface QuestionToVideoRequest {
  text: string;
  context?: string;
}

export interface VideoGenerationResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  question: string;
  context?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  error?: string;
}

export interface ExplanationResponse {
  explanation: string;
  key_concepts: string[];
  difficulty_level: string;
}

export interface ScreenplayResponse {
  screenplay: {
    title: string;
    scenes: Array<{
      scene_number: number;
      description: string;
      dialogue?: string;
      duration: number;
    }>;
  };
  total_duration: number;
}

export interface ManifestResponse {
  manifest: {
    version: string;
    metadata: {
      title: string;
      description: string;
      duration: number;
    };
    shots: Array<{
      id: string;
      type: string;
      duration: number;
      template: string;
      data: Record<string, any>;
    }>;
  };
}

export interface VideoResponse {
  video_id: string;
  status: "rendering" | "completed" | "failed";
  progress?: number;
  video_url?: string;
  download_url?: string;
  expires_at?: string;
}

/**
 * Project types
 */
export interface Project {
  id: string;
  user_id: string;
  question: string;
  context?: string;
  status: VideoGenerationResponse["status"];
  video_url?: string;
  manifest?: ManifestResponse["manifest"];
  created_at: string;
  updated_at: string;
}

/**
 * Analytics types
 */
export interface VideoAnalytics {
  project_id: string;
  total_duration: number;
  shot_count: number;
  audio_timing: Array<{
    shot_id: string;
    start_time: number;
    end_time: number;
    duration: number;
  }>;
  performance_score: number;
  recommendations: string[];
}
