/**
 * @fileoverview Video analytics tracking utilities
 * @module utils/video-analytics
 */

import { createClient } from '@/lib/supabase/client'

interface VideoViewEvent {
  video_url: string
  user_id?: string
  session_id?: string
  watch_duration_seconds?: number
  video_duration_seconds?: number
  event_type: 'view_start' | 'view_update' | 'view_end'
}

class VideoAnalytics {
  private supabase = createClient()
  private sessionId: string
  private viewStartTime: number = 0
  private lastProgressTime: number = 0
  private updateInterval: number | null = null

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  /**
   * Track when a video starts playing
   */
  async trackViewStart(videoUrl: string, videoDuration: number) {
    this.viewStartTime = Date.now()
    this.lastProgressTime = 0

    try {
      const response = await fetch('/api/video-view-tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await this.supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          video_url: videoUrl,
          session_id: this.sessionId,
          video_duration_seconds: videoDuration,
          event_type: 'view_start'
        })
      })

      if (!response.ok) {
        console.warn('Failed to track view start:', await response.text())
      }

      // Start periodic updates every 10 seconds
      this.startPeriodicUpdates(videoUrl, videoDuration)
    } catch (error) {
      console.warn('Error tracking view start:', error)
    }
  }

  /**
   * Track video progress updates
   */
  async trackViewUpdate(videoUrl: string, currentTime: number, videoDuration: number) {
    this.lastProgressTime = Math.max(this.lastProgressTime, currentTime)

    try {
      await fetch('/api/video-view-tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await this.supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          video_url: videoUrl,
          session_id: this.sessionId,
          watch_duration_seconds: this.lastProgressTime,
          video_duration_seconds: videoDuration,
          event_type: 'view_update'
        })
      })
    } catch (error) {
      console.warn('Error tracking view update:', error)
    }
  }

  /**
   * Track when video viewing ends
   */
  async trackViewEnd(videoUrl: string, currentTime: number, videoDuration: number) {
    this.stopPeriodicUpdates()
    this.lastProgressTime = Math.max(this.lastProgressTime, currentTime)

    try {
      await fetch('/api/video-view-tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await this.supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          video_url: videoUrl,
          session_id: this.sessionId,
          watch_duration_seconds: this.lastProgressTime,
          video_duration_seconds: videoDuration,
          event_type: 'view_end'
        })
      })
    } catch (error) {
      console.warn('Error tracking view end:', error)
    }
  }

  /**
   * Start periodic updates every 10 seconds while video is playing
   */
  private startPeriodicUpdates(videoUrl: string, videoDuration: number) {
    this.stopPeriodicUpdates() // Clear any existing interval
    
    this.updateInterval = window.setInterval(() => {
      // This will be called every 10 seconds - the video player should call trackViewUpdate
      // when the video is actually playing
    }, 10000)
  }

  /**
   * Stop periodic updates
   */
  private stopPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance
export const videoAnalytics = new VideoAnalytics()

/**
 * Hook up video analytics to a video element
 */
export function setupVideoAnalytics(videoElement: HTMLVideoElement, videoUrl: string) {
  let hasStarted = false

  const handlePlay = () => {
    if (!hasStarted) {
      videoAnalytics.trackViewStart(videoUrl, videoElement.duration)
      hasStarted = true
    }
  }

  const handleTimeUpdate = () => {
    if (hasStarted) {
      videoAnalytics.trackViewUpdate(videoUrl, videoElement.currentTime, videoElement.duration)
    }
  }

  const handleEnded = () => {
    videoAnalytics.trackViewEnd(videoUrl, videoElement.currentTime, videoElement.duration)
  }

  const handlePause = () => {
    if (hasStarted) {
      videoAnalytics.trackViewUpdate(videoUrl, videoElement.currentTime, videoElement.duration)
    }
  }

  // Add event listeners
  videoElement.addEventListener('play', handlePlay)
  videoElement.addEventListener('timeupdate', handleTimeUpdate)
  videoElement.addEventListener('ended', handleEnded)
  videoElement.addEventListener('pause', handlePause)

  // Cleanup function
  return () => {
    videoElement.removeEventListener('play', handlePlay)
    videoElement.removeEventListener('timeupdate', handleTimeUpdate)
    videoElement.removeEventListener('ended', handleEnded)
    videoElement.removeEventListener('pause', handlePause)
  }
}
