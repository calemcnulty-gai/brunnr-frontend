/**
 * @fileoverview API endpoint for tracking partner video generation events
 * @module app/api/partner/track/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  trackVideoGeneration,
  updateVideoGeneration,
  trackApiRequest,
  trackLmsPublication,
  logPartnerAudit
} from '@/lib/supabase/partner-queries'
import type { 
  VideoGenerationRequest, 
  TrackingEvent,
  VideoGeneration,
  ApiRequest
} from '@/types/partner'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * POST /api/partner/track
 * Track video generation and API events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, request_id, data } = body
    
    // Get API key from headers
    const apiKey = request.headers.get('x-api-key')
    let apiKeyData = null
    let partnerId = null
    
    if (apiKey) {
      // Look up API key to get partner and seat info
      const { data: keyData } = await supabase
        .from('api_keys')
        .select('*, partners!inner(*)')
        .eq('key_prefix', apiKey.substring(0, 8))
        .eq('is_active', true)
        .single()
      
      if (keyData) {
        apiKeyData = keyData
        partnerId = keyData.partner_id
      }
    }
    
    // Track based on event type
    switch (event_type) {
      case 'generation_start': {
        // Track new video generation request
        const genRequest = data as VideoGenerationRequest
        
        // Track API request
        const apiRequest: Partial<ApiRequest> = {
          request_id: genRequest.request_id,
          partner_id: partnerId,
          api_key_id: apiKeyData?.id,
          endpoint: '/api/video/generate',
          method: 'POST',
          requested_at: new Date().toISOString(),
          request_payload: {
            manifest: genRequest.manifest,
            script: genRequest.script,
            grade_level: genRequest.grade_level,
            subject: genRequest.subject
          },
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
          user_agent: request.headers.get('user-agent') || undefined
        }
        
        await trackApiRequest(apiRequest)
        
        // Track video generation
        const generation: Partial<VideoGeneration> = {
          request_id: genRequest.request_id,
          partner_id: partnerId,
          api_key_id: apiKeyData?.id,
          manifest: genRequest.manifest,
          script_text: genRequest.script,
          grade_level: genRequest.grade_level,
          subject: genRequest.subject,
          status: 'pending',
          created_at: new Date().toISOString(),
          script_received_at: genRequest.script ? new Date().toISOString() : undefined
        }
        
        const result = await trackVideoGeneration(generation)
        
        // Log audit
        if (partnerId) {
          await logPartnerAudit(
            partnerId,
            apiKeyData?.user_id || 'system',
            'video_generation_started',
            { request_id: genRequest.request_id }
          )
        }
        
        return NextResponse.json({
          success: true,
          data: {
            generation_id: result.id,
            request_id: genRequest.request_id,
            status: 'tracking_started'
          }
        })
      }
      
      case 'generation_processing': {
        // Update generation status to processing
        await updateVideoGeneration(request_id, {
          status: 'processing',
          processing_started_at: new Date().toISOString()
        })
        
        return NextResponse.json({
          success: true,
          data: { status: 'processing_tracked' }
        })
      }
      
      case 'generation_complete': {
        // Update generation with completion data
        const completionData = data as {
          video_url: string
          video_duration_seconds: number
          file_size_mb?: number
          quality_score?: number
        }
        
        const completedAt = new Date().toISOString()
        
        await updateVideoGeneration(request_id, {
          status: 'completed',
          processing_completed_at: completedAt,
          video_url: completionData.video_url,
          video_duration_seconds: completionData.video_duration_seconds,
          file_size_mb: completionData.file_size_mb,
          quality_score: completionData.quality_score,
          render_success: true
        })
        
        // Update API request
        await supabase
          .from('api_requests')
          .update({
            completed_at: completedAt,
            status_code: 200,
            response_payload: { 
              video_url: completionData.video_url,
              duration: completionData.video_duration_seconds
            }
          })
          .eq('request_id', request_id)
        
        // Log audit
        if (partnerId) {
          await logPartnerAudit(
            partnerId,
            apiKeyData?.user_id || 'system',
            'video_generation_completed',
            { 
              request_id, 
              duration_seconds: completionData.video_duration_seconds 
            }
          )
        }
        
        return NextResponse.json({
          success: true,
          data: { status: 'completion_tracked' }
        })
      }
      
      case 'generation_failed': {
        // Track generation failure
        const errorData = data as {
          error_message: string
          error_details?: any
          retry_count?: number
        }
        
        await updateVideoGeneration(request_id, {
          status: 'failed',
          processing_completed_at: new Date().toISOString(),
          render_success: false,
          error_details: errorData.error_details || { message: errorData.error_message },
          retry_count: errorData.retry_count || 0
        })
        
        // Update API request
        await supabase
          .from('api_requests')
          .update({
            completed_at: new Date().toISOString(),
            status_code: 500,
            error_message: errorData.error_message
          })
          .eq('request_id', request_id)
        
        return NextResponse.json({
          success: true,
          data: { status: 'failure_tracked' }
        })
      }
      
      case 'lms_publish': {
        // Track LMS publication
        const publishData = data as {
          video_generation_id: string
          lms_platform: string
          course_id?: string
          module_id?: string
          available_to_students: boolean
          student_roster_count?: number
        }
        
        await trackLmsPublication({
          partner_id: partnerId,
          video_generation_id: publishData.video_generation_id,
          lms_platform: publishData.lms_platform,
          course_id: publishData.course_id,
          module_id: publishData.module_id,
          published_at: new Date().toISOString(),
          available_to_students: publishData.available_to_students,
          student_roster_count: publishData.student_roster_count
        })
        
        // Log audit
        if (partnerId) {
          await logPartnerAudit(
            partnerId,
            apiKeyData?.user_id || 'system',
            'lms_video_published',
            publishData
          )
        }
        
        return NextResponse.json({
          success: true,
          data: { status: 'publication_tracked' }
        })
      }
      
      default:
        return NextResponse.json(
          { error: `Unknown event type: ${event_type}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error tracking partner event:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to track event' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/partner/track
 * Get tracking status for a request
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const requestId = searchParams.get('request_id')
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }
    
    // Get generation status
    const { data: generation, error } = await supabase
      .from('video_generations')
      .select(`
        *,
        lms_publications(*)
      `)
      .eq('request_id', requestId)
      .single()
    
    if (error || !generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }
    
    // Calculate metrics
    const processingTime = generation.processing_completed_at && generation.processing_started_at
      ? (new Date(generation.processing_completed_at).getTime() - 
         new Date(generation.processing_started_at).getTime()) / 1000
      : null
    
    const totalTime = generation.processing_completed_at && generation.created_at
      ? (new Date(generation.processing_completed_at).getTime() - 
         new Date(generation.created_at).getTime()) / 1000
      : null
    
    return NextResponse.json({
      success: true,
      data: {
        request_id: generation.request_id,
        status: generation.status,
        created_at: generation.created_at,
        processing_started_at: generation.processing_started_at,
        processing_completed_at: generation.processing_completed_at,
        processing_time_seconds: processingTime,
        total_time_seconds: totalTime,
        manifest_to_mp4_minutes: generation.manifest_to_mp4_minutes,
        script_to_completion_hours: generation.script_to_completion_hours,
        video_url: generation.video_url,
        video_duration_seconds: generation.video_duration_seconds,
        render_success: generation.render_success,
        error_details: generation.error_details,
        lms_published: generation.lms_publications?.length > 0,
        lms_publications: generation.lms_publications
      }
    })
  } catch (error) {
    console.error('Error getting tracking status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get status' 
      },
      { status: 500 }
    )
  }
}
