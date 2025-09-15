/**
 * @fileoverview API proxy route for Brunnr service with partner tracking
 * @module app/api/brunnr-tracked
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

// Allow functions to run for up to 5 minutes on Vercel
export const maxDuration = 300

const BRUNNR_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://brunnr-service-production.up.railway.app'
const BRUNNR_API_KEY = process.env.BRUNNR_API_KEY || ''

// Endpoints that should be tracked
const TRACKED_ENDPOINTS = [
  'media/manifest-to-video',
  'media/question-to-video',
  'media/manifest-to-shotgroup-videos',
  'media/manifest-to-silent-video',
  'content/lesson-to-video'
]

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PUT')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PATCH')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  const supabase = await createClient()
  const path = pathSegments.join('/')
  const isTrackedEndpoint = TRACKED_ENDPOINTS.includes(path)
  
  let requestId: string | null = null
  let requestBody: any = null
  const startTime = Date.now()
  
  try {
    // Get user info for tracking
    const { data: { user } } = await supabase.auth.getUser()
    
    // Parse request body if it's a tracked endpoint
    if (isTrackedEndpoint && method === 'POST' && request.body) {
      const bodyText = await request.text()
      requestBody = JSON.parse(bodyText)
      requestId = uuidv4()
      
      // Track the API request start
      if (user) {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('partner_id')
          .eq('user_id', user.id)
          .single()
        
        // Get partner_id if user has one, otherwise use null for regular users
        const partnerId = userRole?.partner_id || null
        
        // Check if user has an API key (for partner users)
        const apiKeyHeader = request.headers.get('x-api-key')
        let apiKeyId = null
        
        if (apiKeyHeader && partnerId) {
          const keyHash = crypto.createHash('sha256').update(apiKeyHeader).digest('hex')
          const { data: apiKey } = await supabase
            .from('api_keys')
            .select('id')
            .eq('key_hash', keyHash)
            .eq('is_active', true)
            .single()
          
          apiKeyId = apiKey?.id
        }
        
        // Insert API request tracking for ALL users (partner and regular)
        await supabase
          .from('api_requests')
          .insert({
            request_id: requestId,
            partner_id: partnerId,
            api_key_id: apiKeyId,
            user_id: user.id,
            endpoint: path,
            method: method,
            request_payload: requestBody,
            status_code: null, // Will be updated when response comes back
            requested_at: new Date().toISOString(),
            ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
            user_agent: request.headers.get('user-agent') || null
          })
        
        // If it's a video generation endpoint, also track in video_generations
        if (path.includes('video')) {
          await supabase
            .from('video_generations')
            .insert({
              request_id: requestId,
              partner_id: partnerId,
              api_key_id: apiKeyId,
              user_id: user.id,
              manifest: requestBody.manifest || requestBody,
              script_text: requestBody.script || null,
              grade_level: requestBody.grade_level || null,
              subject: requestBody.subject || null,
              video_type: requestBody.video_type || 'educational',
              status: 'pending',
              created_at: new Date().toISOString(),
              script_received_at: requestBody.script ? new Date().toISOString() : null
            })
        }
      }
    }
    
    // Construct the full URL
    const url = new URL(`${BRUNNR_API_URL}/${path}`)
    
    // Copy query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })
    
    // Prepare headers
    const headers: HeadersInit = {
      'X-API-Key': BRUNNR_API_KEY,
      'Content-Type': 'application/json',
    }
    
    // Add request ID to headers if tracking
    if (requestId) {
      headers['X-Request-ID'] = requestId
    }
    
    // Prepare options
    const options: RequestInit = {
      method,
      headers,
    }
    
    // Add body for non-GET requests
    if (method !== 'GET') {
      if (requestBody) {
        options.body = JSON.stringify(requestBody)
      } else if (request.body) {
        const body = await request.text()
        options.body = body
      }
    }
    
    // Make the request with 2 minute timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout
    
    const response = await fetch(url.toString(), {
      ...options,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const processingTime = Date.now() - startTime
    
    // Handle binary responses (like video files)
    const contentType = response.headers.get('content-type')
    let responseData: any = null
    
    if (contentType && (contentType.includes('video') || contentType.includes('octet-stream'))) {
      const blob = await response.blob()
      responseData = { type: 'binary', size: blob.size }
      
      // Update tracking for successful video generation
      if (requestId && response.ok) {
        await updateTracking(supabase, requestId, 'completed', responseData, processingTime)
      }
      
      return new NextResponse(blob, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': contentType,
          'Content-Length': response.headers.get('content-length') || '',
          'X-Request-ID': requestId || '',
        },
      })
    }
    
    // Handle text/JSON responses
    const responseText = await response.text()
    
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }
    
    // Update tracking based on response
    if (requestId) {
      const status = response.ok ? 'completed' : 'failed'
      await updateTracking(supabase, requestId, status, responseData, processingTime)
    }
    
    return new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'X-Request-ID': requestId || '',
      },
    })
  } catch (error: any) {
    console.error('Proxy error:', error)
    
    const errorDetail = error instanceof Error ? error.message : 'Unknown error'
    const isTimeout = error.name === 'AbortError'
    
    // Update tracking for errors
    if (requestId) {
      await updateTracking(
        supabase, 
        requestId, 
        'failed', 
        { 
          error: errorDetail,
          timeout: isTimeout 
        },
        Date.now() - startTime
      )
    }
    
    // Handle timeout specifically
    if (isTimeout) {
      return NextResponse.json(
        { 
          error: 'Request timeout', 
          detail: 'The request took longer than 2 minutes and was cancelled',
          request_id: requestId 
        },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Internal proxy error', 
        detail: errorDetail,
        request_id: requestId 
      },
      { status: 500 }
    )
  }
}

async function updateTracking(
  supabase: any,
  requestId: string,
  status: 'completed' | 'failed',
  responseData: any,
  processingTime: number
) {
  try {
    // Update API request
    await supabase
      .from('api_requests')
      .update({
        status_code: status === 'completed' ? 200 : 500,
        response_payload: responseData,
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('request_id', requestId)
    
    // Update video generation if applicable
    if (responseData?.download_url || responseData?.video_url) {
      await supabase
        .from('video_generations')
        .update({
          status,
          video_url: responseData.download_url || responseData.video_url,
          manifest_to_mp4_minutes: processingTime / (1000 * 60), // Convert ms to minutes
          processing_completed_at: status === 'completed' ? new Date().toISOString() : null,
          error_details: status === 'failed' ? responseData : null,
          render_success: status === 'completed'
        })
        .eq('request_id', requestId)
    } else if (status === 'failed') {
      await supabase
        .from('video_generations')
        .update({
          status: 'failed',
          error_details: responseData,
          processing_completed_at: new Date().toISOString(),
          render_success: false
        })
        .eq('request_id', requestId)
    }
    
    // Calculate and update SLA metrics
    await supabase.rpc('calculate_sla_metrics')
  } catch (error) {
    console.error('Failed to update tracking:', error)
  }
}
