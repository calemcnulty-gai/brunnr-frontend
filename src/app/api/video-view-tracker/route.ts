/**
 * @fileoverview API route to track video views via Supabase edge function
 * @module app/api/video-view-tracker/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user info
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await request.json()
    const { video_url, watch_duration_seconds, video_duration_seconds, event_type } = body

    if (!video_url || !event_type) {
      return NextResponse.json(
        { error: 'video_url and event_type are required' },
        { status: 400 }
      )
    }

    // Extract video info
    const videoId = extractVideoIdFromUrl(video_url)
    const requestId = extractRequestIdFromUrl(video_url)

    // Get IP and user agent
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      null
    const user_agent = request.headers.get('user-agent') || null

    // Generate session ID if not provided
    const session_id = body.session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Calculate completion percentage
    const completion_percentage = video_duration_seconds > 0 
      ? (watch_duration_seconds / video_duration_seconds) * 100 
      : 0

    if (event_type === 'view_start') {
      // Insert new view record
      const { data, error } = await (supabase as any)
        .from('video_views')
        .insert({
          video_url,
          video_id: videoId,
          request_id: requestId,
          user_id: user?.id || null,
          session_id,
          ip_address,
          user_agent,
          video_duration_seconds,
          view_started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error tracking view start:', error)
        return NextResponse.json(
          { error: 'Failed to track view start' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        view_id: data.id,
        session_id 
      })

    } else if (event_type === 'view_update' || event_type === 'view_end') {
      // Update existing view record
      const { error } = await (supabase as any)
        .from('video_views')
        .update({
          watch_duration_seconds,
          completion_percentage,
          is_complete_view: completion_percentage >= 90,
          max_progress_seconds: Math.max(watch_duration_seconds || 0, 0),
          view_ended_at: event_type === 'view_end' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('video_url', video_url)
        .eq('session_id', session_id)
        .order('view_started_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error updating view:', error)
        return NextResponse.json(
          { error: 'Failed to update view' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid event_type' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Video view tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function extractVideoIdFromUrl(url: string): string | null {
  // Extract video ID from URLs like: /media/videos/lesson_585/fraction-sub-same-den_number-line-walk_bb2dae_final.mp4
  const match = url.match(/\/([^\/]+)\.mp4$/)
  return match ? match[1] || null : null
}

function extractRequestIdFromUrl(url: string): string | null {
  // Extract request ID from URLs that contain timestamps or request identifiers
  const match = url.match(/\/(\d{8}_\d{6}_[^\/]+)\//)
  return match ? match[1] || null : null
}
