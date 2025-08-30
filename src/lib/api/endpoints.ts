/**
 * @fileoverview API endpoint functions for Brunnr service
 * @module api/endpoints
 */

import { apiClient } from './client'
import type {
  QuestionToExplanationRequest,
  QuestionToExplanationResponse,
  ExplanationToScreenplayRequest,
  ExplanationToScreenplayResponse,
  ScreenplayToManifestRequest,
  ScreenplayToManifestResponse,
  QuestionToManifestRequest,
  QuestionToManifestResponse,
  QuestionToVideoRequest,
  QuestionToVideoResponse,
  ManifestToVideoRequest,
  ManifestToVideoResponse,
  AudioTimingAnalysisRequest,
  AudioTimingAnalysisResponse,
} from '@/types/api'

// Content Generation Endpoints

/**
 * Generate an explanation from a question
 * @param request - Question and optional context
 * @returns Promise resolving to explanation response
 */
export async function questionToExplanation(
  request: QuestionToExplanationRequest
): Promise<QuestionToExplanationResponse> {
  return apiClient.post('/content/question-to-explanation', request, {
    signal: AbortSignal.timeout(300000), // 5 minute timeout
  })
}

/**
 * Convert explanation to screenplay
 * @param request - Explanation text
 * @returns Promise resolving to screenplay response
 */
export async function explanationToScreenplay(
  request: ExplanationToScreenplayRequest
): Promise<ExplanationToScreenplayResponse> {
  return apiClient.post('/content/explanation-to-screenplay', request, {
    signal: AbortSignal.timeout(300000),
  })
}

/**
 * Convert screenplay to manifest
 * @param request - Screenplay data
 * @returns Promise resolving to manifest response
 */
export async function screenplayToManifest(
  request: ScreenplayToManifestRequest
): Promise<ScreenplayToManifestResponse> {
  return apiClient.post('/content/screenplay-to-manifest', request, {
    signal: AbortSignal.timeout(300000),
  })
}

/**
 * Run complete content pipeline: question to manifest
 * @param request - Question and optional context
 * @returns Promise resolving to complete pipeline response
 */
export async function questionToManifest(
  request: QuestionToManifestRequest
): Promise<QuestionToManifestResponse> {
  return apiClient.post('/content/question-to-manifest', request, {
    signal: AbortSignal.timeout(300000),
  })
}

// Media Production Endpoints

/**
 * Generate complete video from question (one-click)
 * @param request - Question and optional context
 * @returns Promise resolving to video response
 */
export async function questionToVideo(
  request: QuestionToVideoRequest
): Promise<QuestionToVideoResponse> {
  return apiClient.post('/media/question-to-video', request, {
    signal: AbortSignal.timeout(300000),
  })
}

/**
 * Generate video from manifest
 * @param request - Manifest data
 * @returns Promise resolving to video response
 */
export async function manifestToVideo(
  request: ManifestToVideoRequest
): Promise<ManifestToVideoResponse> {
  return apiClient.post('/media/manifest-to-video', request, {
    signal: AbortSignal.timeout(300000),
  })
}

/**
 * Generate silent video from manifest (no audio)
 * @param request - Manifest data
 * @returns Promise resolving to video response
 */
export async function manifestToSilentVideo(
  request: ManifestToVideoRequest
): Promise<ManifestToVideoResponse> {
  return apiClient.post('/media/manifest-to-silent-video', request, {
    signal: AbortSignal.timeout(300000),
  })
}

/**
 * Download generated video file
 * @param requestId - The request ID from video generation
 * @param filename - The filename (usually ends with _final.mp4)
 * @returns Promise resolving to video blob
 */
export async function downloadVideo(
  requestId: string,
  filename: string
): Promise<Blob> {
  const response = await fetch(
    `/api/brunnr/media/videos/${requestId}/${filename}`
  )
  
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`)
  }
  
  return response.blob()
}

// Analytics Endpoints

/**
 * Analyze audio timing for a manifest
 * @param request - Manifest data
 * @returns Promise resolving to timing analysis
 */
export async function analyzeAudioTiming(
  request: AudioTimingAnalysisRequest
): Promise<AudioTimingAnalysisResponse> {
  return apiClient.post('/analytics/audio-timing', request)
}

// Utility Functions

/**
 * Extract video filename from download URL
 * @param downloadUrl - The download URL from API response
 * @returns The filename
 */
export function extractVideoFilename(downloadUrl: string): string {
  const parts = downloadUrl.split('/')
  return parts[parts.length - 1]
}

/**
 * Extract request ID from download URL
 * @param downloadUrl - The download URL from API response
 * @returns The request ID
 */
export function extractRequestId(downloadUrl: string): string {
  const parts = downloadUrl.split('/')
  return parts[parts.length - 2]
}

/**
 * Build full video URL from API response
 * @param downloadUrl - The relative download URL from API
 * @returns Full URL for downloading
 */
export function buildVideoUrl(downloadUrl: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  return `${baseUrl}${downloadUrl}`
}