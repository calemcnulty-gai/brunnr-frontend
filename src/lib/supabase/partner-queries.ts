/**
 * @fileoverview Supabase queries for partner integration tracking and reporting
 * @module lib/supabase/partner-queries
 */

import { createClient } from '@supabase/supabase-js'
import type { 
  Partner, 
  ApiKey, 
  VideoGeneration, 
  SlaMetrics,
  InceptSeptemberMetrics,
  ActiveSeat,
  PartnerDashboard,
  InceptGoalProgress,
  ApiRequest,
  LmsPublication,
  CsvExportRow
} from '@/types/partner'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ============================================
// PARTNER MANAGEMENT
// ============================================

export async function getPartner(partnerCode: string): Promise<Partner | null> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('partner_code', partnerCode)
    .single()
  
  if (error) {
    console.error('Error fetching partner:', error)
    return null
  }
  
  return data
}

export async function getPartnerApiKeys(partnerId: string): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('partner_id', partnerId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching API keys:', error)
    return []
  }
  
  return data || []
}

// ============================================
// VIDEO GENERATION TRACKING
// ============================================

export async function trackVideoGeneration(generation: Partial<VideoGeneration>) {
  const { data, error } = await supabase
    .from('video_generations')
    .insert(generation)
    .select()
    .single()
  
  if (error) {
    console.error('Error tracking video generation:', error)
    throw error
  }
  
  return data
}

export async function updateVideoGeneration(
  requestId: string, 
  updates: Partial<VideoGeneration>
) {
  const { data, error } = await supabase
    .from('video_generations')
    .update(updates)
    .eq('request_id', requestId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating video generation:', error)
    throw error
  }
  
  return data
}

// ============================================
// API REQUEST TRACKING
// ============================================

export async function trackApiRequest(request: Partial<ApiRequest>) {
  const { data, error } = await supabase
    .from('api_requests')
    .insert(request)
    .select()
    .single()
  
  if (error) {
    console.error('Error tracking API request:', error)
    throw error
  }
  
  return data
}

// ============================================
// SLA METRICS & REPORTING
// ============================================

export async function getPartnerSlaMetrics(
  partnerId: string,
  startDate: string,
  endDate: string
): Promise<SlaMetrics[]> {
  const { data, error } = await supabase
    .from('sla_metrics')
    .select('*')
    .eq('partner_id', partnerId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching SLA metrics:', error)
    return []
  }
  
  return data || []
}

export async function calculateSlaMetrics(
  partnerId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .rpc('calculate_sla_metrics', {
      p_partner_id: partnerId,
      p_start_date: startDate,
      p_end_date: endDate
    })
  
  if (error) {
    console.error('Error calculating SLA metrics:', error)
    return []
  }
  
  return data || []
}

// ============================================
// ACTIVE SEATS TRACKING
// ============================================

export async function getActiveSeats(
  partnerId: string,
  startDate: string,
  endDate: string
): Promise<ActiveSeat[]> {
  const { data, error } = await supabase
    .rpc('get_active_seats', {
      p_partner_id: partnerId,
      p_start_date: startDate,
      p_end_date: endDate
    })
  
  if (error) {
    console.error('Error fetching active seats:', error)
    return []
  }
  
  return data || []
}

// ============================================
// INCEPT SEPTEMBER METRICS
// ============================================

export async function getInceptSeptemberMetrics(): Promise<InceptSeptemberMetrics | null> {
  const { data, error } = await supabase
    .from('incept_september_metrics')
    .select('*')
    .single()
  
  if (error) {
    console.error('Error fetching Incept September metrics:', error)
    return null
  }
  
  return data
}

export async function getInceptGoalProgress(): Promise<InceptGoalProgress> {
  // Get Incept partner
  const partner = await getPartner('INCEPT')
  if (!partner) {
    throw new Error('Incept partner not found')
  }
  
  // Get September metrics
  const metrics = await getInceptSeptemberMetrics()
  
  // Get published videos
  const { data: publications } = await supabase
    .from('lms_publications')
    .select('*, video_generations!inner(*)')
    .eq('partner_id', partner.id)
    .eq('available_to_students', true)
    .gte('published_at', '2025-09-01')
    .lt('published_at', '2025-10-01')
  
  const fourthGradeMathCount = publications?.filter(
    pub => pub.video_generations?.grade_level === '4th' && 
           pub.video_generations?.subject === 'math'
  ).length || 0
  
  // Calculate progress
  const progress: InceptGoalProgress = {
    published_videos: {
      count: publications?.length || 0,
      target: 5,
      fourth_grade_math: fourthGradeMathCount,
      available_to_students: (publications?.length || 0) > 0
    },
    production_usage: {
      successful_renders: metrics?.successful_renders || 0,
      target_renders: 40,
      success_rate: metrics?.success_rate || 0,
      target_success_rate: 95,
      active_seats: metrics?.active_seats || 0,
      target_seats: 2
    },
    reliability: {
      p95_manifest_to_mp4: metrics?.p95_minutes || 0,
      target_p95: 15,
      jobs_within_24h_rate: metrics?.sla_compliance_rate || 0,
      target_24h_rate: 90
    },
    enrollment: {
      roster_count: partner.metadata?.roster_size || 0,
      target_roster: 200,
      announcement_posted: false, // This would need to be tracked separately
      acceptance_received: false,
      acceptance_date: undefined
    },
    overall_progress: 0,
    status: 'on_track',
    last_updated: new Date().toISOString()
  }
  
  // Calculate overall progress
  const progressItems = [
    progress.published_videos.count >= progress.published_videos.target ? 1 : 0,
    progress.production_usage.successful_renders >= progress.production_usage.target_renders ? 1 : 0,
    progress.production_usage.success_rate >= progress.production_usage.target_success_rate ? 1 : 0,
    progress.production_usage.active_seats >= progress.production_usage.target_seats ? 1 : 0,
    progress.reliability.p95_manifest_to_mp4 <= progress.reliability.target_p95 ? 1 : 0,
    progress.reliability.jobs_within_24h_rate >= progress.reliability.target_24h_rate ? 1 : 0,
    progress.enrollment.roster_count >= progress.enrollment.target_roster ? 1 : 0
  ]
  
  progress.overall_progress = (progressItems.reduce((a, b) => a + b, 0) / progressItems.length) * 100
  
  // Determine status
  if (progress.overall_progress >= 90) {
    progress.status = 'complete'
  } else if (progress.overall_progress >= 70) {
    progress.status = 'on_track'
  } else if (progress.overall_progress >= 50) {
    progress.status = 'at_risk'
  } else {
    progress.status = 'behind'
  }
  
  return progress
}

// ============================================
// PARTNER DASHBOARD
// ============================================

export async function getPartnerDashboard(partnerId: string): Promise<PartnerDashboard | null> {
  const { data, error } = await supabase
    .from('partner_dashboard')
    .select('*')
    .eq('partner_id', partnerId)
    .single()
  
  if (error) {
    console.error('Error fetching partner dashboard:', error)
    return null
  }
  
  return data
}

// ============================================
// VIDEO GENERATIONS REPORT
// ============================================

export async function getVideoGenerations(
  partnerId: string,
  startDate: string,
  endDate: string,
  limit = 100
): Promise<VideoGeneration[]> {
  const { data, error } = await supabase
    .from('video_generations')
    .select('*')
    .eq('partner_id', partnerId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching video generations:', error)
    return []
  }
  
  return data || []
}

// ============================================
// LMS PUBLICATIONS
// ============================================

export async function trackLmsPublication(publication: Partial<LmsPublication>) {
  const { data, error } = await supabase
    .from('lms_publications')
    .insert(publication)
    .select()
    .single()
  
  if (error) {
    console.error('Error tracking LMS publication:', error)
    throw error
  }
  
  return data
}

export async function getLmsPublications(
  partnerId: string,
  availableToStudents = true
): Promise<LmsPublication[]> {
  const { data, error } = await supabase
    .from('lms_publications')
    .select('*')
    .eq('partner_id', partnerId)
    .eq('available_to_students', availableToStudents)
    .order('published_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching LMS publications:', error)
    return []
  }
  
  return data || []
}

// ============================================
// CSV EXPORT
// ============================================

export async function exportPartnerDataCsv(
  partnerId: string,
  startDate: string,
  endDate: string
): Promise<CsvExportRow[]> {
  // Fetch video generations with related data
  const { data: generations, error } = await supabase
    .from('video_generations')
    .select(`
      request_id,
      partner_id,
      status,
      manifest_to_mp4_minutes,
      script_to_completion_hours,
      created_at,
      api_keys!inner(id, seat_name)
    `)
    .eq('partner_id', partnerId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error exporting partner data:', error)
    return []
  }
  
  // Calculate p50 and p95 for the period
  const times = generations
    ?.map(g => g.manifest_to_mp4_minutes)
    .filter(t => t != null)
    .sort((a, b) => a - b) || []
  
  const p50 = times[Math.floor(times.length * 0.5)] || 0
  const p95 = times[Math.floor(times.length * 0.95)] || 0
  
  // Format as CSV rows
  return generations?.map(gen => ({
    request_id: gen.request_id || '',
    partner_id: gen.partner_id || '',
    status: gen.status || '',
    processing_time_p50: p50,
    processing_time_p95: p95,
    within_24h_sla: (gen.script_to_completion_hours || 0) <= 24,
    seat_id: Array.isArray(gen.api_keys) ? gen.api_keys[0]?.id || '' : (gen.api_keys as any)?.id || '',
    seat_name: Array.isArray(gen.api_keys) ? gen.api_keys[0]?.seat_name || '' : '',
    timestamp: gen.created_at || ''
  })) || []
}

// ============================================
// AUDIT LOGGING
// ============================================

export async function logPartnerAudit(
  partnerId: string,
  userId: string,
  action: string,
  details?: any
) {
  const { error } = await supabase
    .from('partner_audit_log')
    .insert({
      partner_id: partnerId,
      user_id: userId,
      action,
      changes: details,
      metadata: {
        timestamp: new Date().toISOString(),
        ip: typeof window !== 'undefined' ? window.location.hostname : 'server'
      }
    })
  
  if (error) {
    console.error('Error logging partner audit:', error)
  }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export function subscribeToPartnerMetrics(
  partnerId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`partner-metrics-${partnerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'video_generations',
        filter: `partner_id=eq.${partnerId}`
      },
      callback
    )
    .subscribe()
}

export function subscribeToSlaAlerts(
  partnerId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`sla-alerts-${partnerId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sla_metrics',
        filter: `partner_id=eq.${partnerId}`
      },
      (payload) => {
        // Check for SLA violations
        const metrics = payload.new as SlaMetrics
        if (metrics.success_rate < 95 || (metrics.p95_manifest_to_mp4_minutes && metrics.p95_manifest_to_mp4_minutes > 15)) {
          callback({
            type: 'sla_violation',
            metrics
          })
        }
      }
    )
    .subscribe()
}
