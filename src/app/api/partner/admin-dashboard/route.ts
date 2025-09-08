/**
 * @fileoverview Admin dashboard API endpoint with role-based access
 * @module app/api/partner/admin-dashboard/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service key for admin operations
)

/**
 * GET /api/partner/admin-dashboard
 * Admin-only endpoint for comprehensive dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const cookieStore = cookies()
    const token = cookieStore.get('supabase-auth-token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token.value)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!userRole || userRole.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('start_date') || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
    const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0]
    const partnerCode = searchParams.get('partner_code')

    // Fetch all partners
    const { data: partners } = await supabase
      .from('partners')
      .select('*')
      .order('name')

    // Fetch aggregated metrics for all partners
    let query = supabase
      .from('video_generations')
      .select('*, partners!inner(*), api_keys!inner(*)')
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`)

    if (partnerCode && partnerCode !== 'all') {
      const partner = partners?.find(p => p.partner_code === partnerCode)
      if (partner) {
        query = query.eq('partner_id', partner.id)
      }
    }

    const { data: generations } = await query

    // Calculate metrics for each partner
    const partnerMetrics = partners?.map(partner => {
      const partnerGens = generations?.filter(g => g.partner_id === partner.id) || []
      const successful = partnerGens.filter(g => g.render_success).length
      const total = partnerGens.length
      
      // Calculate p95
      const times = partnerGens
        .map(g => g.manifest_to_mp4_minutes)
        .filter(t => t != null)
        .sort((a, b) => a - b)
      const p95 = times[Math.floor(times.length * 0.95)] || 0
      
      // Calculate 24h SLA
      const within24h = partnerGens.filter(g => (g.script_to_completion_hours || 0) <= 24).length
      const sla24h = total > 0 ? (within24h / total) * 100 : 0
      
      // Get unique active seats
      const activeSeats = new Set(partnerGens.map(g => g.api_key_id)).size
      
      return {
        id: partner.id,
        name: partner.name,
        code: partner.partner_code,
        productionEnabled: partner.production_enabled,
        generations: total,
        successRate: total > 0 ? (successful / total) * 100 : 0,
        activeSeats,
        p95Time: p95,
        sla24h
      }
    }) || []

    // Calculate daily trends
    const dailyData: { [key: string]: any } = {}
    generations?.forEach(gen => {
      const dateStr = new Date(gen.created_at).toISOString().split('T')[0]
      if (dateStr && !dailyData[dateStr]) {
        dailyData[dateStr] = { date: dateStr, generations: 0, successful: 0 }
      }
      if (dateStr) {
        dailyData[dateStr].generations++
        if (gen.render_success) {
          dailyData[dateStr].successful++
        }
      }
    })
    const dailyTrends = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))

    // Calculate partner distribution
    const partnerDistribution = partnerMetrics
      .filter(p => p.generations > 0)
      .map(p => ({
        name: p.name,
        value: p.generations
      }))

    // Get top performing partners
    const topPartners = [...partnerMetrics]
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5)

    // Calculate performance trends
    const performanceData: { [key: string]: any } = {}
    generations?.forEach(gen => {
      if (gen.manifest_to_mp4_minutes != null) {
        const dateStr = new Date(gen.created_at).toISOString().split('T')[0]
        if (dateStr && !performanceData[dateStr]) {
          performanceData[dateStr] = { date: dateStr, times: [] }
        }
        if (dateStr) {
          performanceData[dateStr].times.push(gen.manifest_to_mp4_minutes)
        }
      }
    })
    
    const performanceTrends = Object.entries(performanceData).map(([date, data]) => {
      const times = data.times.sort((a: number, b: number) => a - b)
      return {
        date,
        p50: times[Math.floor(times.length * 0.5)] || 0,
        p95: times[Math.floor(times.length * 0.95)] || 0,
        p99: times[Math.floor(times.length * 0.99)] || 0
      }
    }).sort((a, b) => a.date.localeCompare(b.date))

    // SLA Compliance by partner
    const slaCompliance = partnerMetrics
      .filter(p => p.generations > 0)
      .map(p => ({
        partner: p.name,
        compliance: p.sla24h
      }))

    // Mock billing data (you can replace with actual billing logic)
    const billingData = partnerMetrics.map(p => ({
      id: p.id,
      name: p.name,
      plan: p.productionEnabled ? 'Production' : 'Sandbox',
      generations: p.generations,
      costPerGeneration: 0.50, // Example rate
      estimatedCost: p.generations * 0.50,
      storageGB: (p.generations * 0.1).toFixed(2), // Example calculation
      apiCalls: p.generations * 3 // Example multiplier
    }))

    const totalEstimatedCost = billingData.reduce((sum, p) => sum + p.estimatedCost, 0)

    // Summary statistics
    const totalGenerations = generations?.length || 0
    const successfulGenerations = generations?.filter(g => g.render_success).length || 0
    const avgSuccessRate = totalGenerations > 0 ? (successfulGenerations / totalGenerations) * 100 : 0
    const totalSeats = new Set(generations?.map(g => g.api_key_id)).size
    const activePartnerCount = partnerMetrics.filter(p => p.generations > 0).length
    
    const allTimes = generations
      ?.map(g => g.manifest_to_mp4_minutes)
      .filter(t => t != null)
      .sort((a, b) => a - b) || []
    const avgP95 = allTimes[Math.floor(allTimes.length * 0.95)] || 0

    return NextResponse.json({
      totalPartners: partners?.length || 0,
      activePartners: activePartnerCount,
      totalGenerations,
      totalSeats,
      activeSeats: totalSeats,
      avgSuccessRate,
      avgP95,
      partners: partnerMetrics,
      dailyTrends,
      partnerDistribution,
      topPartners,
      performanceTrends,
      slaCompliance,
      billingData,
      totalEstimatedCost
    })
  } catch (error) {
    console.error('Error in admin dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
