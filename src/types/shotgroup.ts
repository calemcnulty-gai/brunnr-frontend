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

export interface ShotgroupResponse {
  shotgroups: Shotgroup[]
  manifest: any // This will be the full manifest object
  total_shotgroups: number
  total_shots: number
}
