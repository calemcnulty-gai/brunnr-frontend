/**
 * @fileoverview API endpoint for partner reporting and metrics
 * @module app/api/partner/report/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  getPartner,
  getPartnerSlaMetrics,
  getActiveSeats,
  getVideoGenerations,
  getInceptSeptemberMetrics,
  getInceptGoalProgress,
  exportPartnerDataCsv
} from '@/lib/supabase/partner-queries'
import type { PartnerReportRequest, GenerationReportResponse } from '@/types/partner'

/**
 * GET /api/partner/report
 * Fetch partner metrics and reporting data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const partnerCode = searchParams.get('partner_code')
    const reportType = searchParams.get('type') || 'summary'
    const startDate: string = searchParams.get('start_date') || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
    const endDate: string = searchParams.get('end_date') || new Date().toISOString()
    
    if (!partnerCode) {
      return NextResponse.json(
        { error: 'Partner code is required' },
        { status: 400 }
      )
    }
    
    // Get partner
    const partner = await getPartner(partnerCode)
    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }
    
    // Handle different report types
    switch (reportType) {
      case 'incept_september': {
        // Special report for Incept September 2025 goals
        const metrics = await getInceptSeptemberMetrics()
        const progress = await getInceptGoalProgress()
        const activeSeats = await getActiveSeats(
          partner.id,
          '2025-09-01T00:00:00Z',
          '2025-09-30T23:59:59Z'
        )
        
        return NextResponse.json({
          success: true,
          data: {
            metrics,
            progress,
            active_seats: activeSeats,
            partner: {
              id: partner.id,
              name: partner.name,
              code: partner.partner_code
            }
          }
        })
      }
      
      case 'sla': {
        // SLA metrics report
        const slaMetrics = await getPartnerSlaMetrics(
          partner.id,
          startDate.split('T')[0]!,
          endDate.split('T')[0]!
        )
        
        const activeSeats = await getActiveSeats(
          partner.id,
          startDate,
          endDate
        )
        
        return NextResponse.json({
          success: true,
          data: {
            partner_id: partner.id,
            partner_name: partner.name,
            period: { start: startDate, end: endDate },
            sla_metrics: slaMetrics,
            active_seats: activeSeats
          }
        })
      }
      
      case 'generations': {
        // Video generations detail report
        const generations = await getVideoGenerations(
          partner.id,
          startDate,
          endDate,
          100
        )
        
        return NextResponse.json({
          success: true,
          data: {
            partner_id: partner.id,
            partner_name: partner.name,
            period: { start: startDate, end: endDate },
            generations,
            total: generations.length
          }
        })
      }
      
      case 'csv_export': {
        // CSV export for the period
        const csvData = await exportPartnerDataCsv(
          partner.id,
          startDate,
          endDate
        )
        
        // Convert to CSV string
        const headers = Object.keys(csvData[0] || {}).join(',')
        const rows = csvData.map(row => 
          Object.values(row).map(v => 
            typeof v === 'string' && v.includes(',') ? `"${v}"` : v
          ).join(',')
        )
        const csv = [headers, ...rows].join('\n')
        
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="partner-report-${partnerCode}-${startDate.split('T')[0]}.csv"`
          }
        })
      }
      
      default: {
        // Summary report
        const slaMetrics = await getPartnerSlaMetrics(
          partner.id,
          startDate.split('T')[0]!,
          endDate.split('T')[0]!
        )
        
        const activeSeats = await getActiveSeats(
          partner.id,
          startDate,
          endDate
        )
        
        const recentGenerations = await getVideoGenerations(
          partner.id,
          startDate,
          endDate,
          10
        )
        
        // Calculate summary metrics
        const totalRequests = slaMetrics.reduce((sum, m) => sum + m.total_requests, 0)
        const successfulRenders = slaMetrics.reduce((sum, m) => sum + m.successful_renders, 0)
        const avgSuccessRate = totalRequests > 0 ? (successfulRenders / totalRequests) * 100 : 0
        
        const p95Times = slaMetrics
          .map(m => m.p95_manifest_to_mp4_minutes)
          .filter(t => t != null) as number[]
        const avgP95 = p95Times.length > 0 
          ? p95Times.reduce((a, b) => a + b, 0) / p95Times.length 
          : 0
        
        // Calculate additional metrics for InceptSeptemberMetrics
        const within24h = slaMetrics.filter(m => m.sla_24h_compliance_rate >= 90).length
        const slaCompliance = slaMetrics.length > 0 
          ? (within24h / slaMetrics.length) * 100 
          : 0
        
        return NextResponse.json({
          success: true,
          data: {
            summary: {
              unique_requests: totalRequests,
              successful_renders: successfulRenders,
              success_rate: avgSuccessRate,
              active_seats: activeSeats.length,
              p95_minutes: avgP95,
              within_24h_sla: within24h,
              sla_compliance_rate: slaCompliance,
              fourth_grade_math_videos: 0 // Will be tracked separately
            },
            daily_metrics: slaMetrics,
            active_seats: activeSeats,
            recent_generations: recentGenerations
          }
        } as GenerationReportResponse)
      }
    }
  } catch (error) {
    console.error('Error generating partner report:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate report' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/partner/report
 * Generate custom partner reports
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PartnerReportRequest
    const { partner_code, start_date, end_date, include_details } = body
    
    if (!partner_code || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }
    
    // Get partner
    const partner = await getPartner(partner_code)
    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }
    
    // Generate comprehensive report
    const [slaMetrics, activeSeats, generations] = await Promise.all([
      getPartnerSlaMetrics(partner.id, start_date, end_date),
      getActiveSeats(partner.id, `${start_date}T00:00:00Z`, `${end_date}T23:59:59Z`),
      include_details 
        ? getVideoGenerations(partner.id, `${start_date}T00:00:00Z`, `${end_date}T23:59:59Z`, 1000)
        : Promise.resolve([])
    ])
    
    // Special handling for Incept September report
    let inceptMetrics = null
    let inceptProgress = null
    if (partner_code === 'INCEPT' && 
        start_date >= '2025-09-01' && 
        end_date <= '2025-09-30') {
      [inceptMetrics, inceptProgress] = await Promise.all([
        getInceptSeptemberMetrics(),
        getInceptGoalProgress()
      ])
    }
    
    return NextResponse.json({
      success: true,
      data: {
        partner: {
          id: partner.id,
          name: partner.name,
          code: partner.partner_code,
          lms_enabled: partner.lms_integration_enabled,
          production_enabled: partner.production_enabled
        },
        period: { start: start_date, end: end_date },
        sla_metrics: slaMetrics,
        active_seats: activeSeats,
        generations: include_details ? generations : undefined,
        incept_september: inceptMetrics,
        incept_progress: inceptProgress
      }
    })
  } catch (error) {
    console.error('Error generating custom partner report:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate report' 
      },
      { status: 500 }
    )
  }
}
