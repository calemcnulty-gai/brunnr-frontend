/**
 * @fileoverview Shotgroup types for video generation
 * @module types/shotgroup
 */

export interface Shotgroup {
  shotgroup_index: number
  shot_indices: number[]
  video_path: string
  download_url: string
  duration_seconds: number
  shot_count: number
  voiceover_preview: string
  has_audio: boolean
}

export interface ProcessingPhase {
  phase_name: string
  start_time: string
  end_time: string
  duration_seconds: number
  status: string
  output_files?: string[]
}

export interface ShotgroupResponse {
  status: string
  message: string
  error: string | null
  metadata: {
    request_id: string
    timestamp: string
    client_ip: string
    processing_time: number
    log_file_path: string
  }
  shotgroups: Shotgroup[]
  manifest: any // This will be the full manifest object
  total_shotgroups: number
  total_shots: number
  processing_phases?: ProcessingPhase[]
  total_processing_time?: number
  render_mode?: string
  video_id?: string
}
