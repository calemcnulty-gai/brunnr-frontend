/**
 * @fileoverview API endpoint for listing partners
 * @module app/api/partner/list/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * GET /api/partner/list
 * Get list of partners (filtered based on user role)
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

    const { data: { user }, error: authError } = await supabase.auth.getUser(token.value)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role, partner_id')
      .eq('user_id', user.id)
      .single()

    if (!userRole) {
      return NextResponse.json(
        { error: 'No role assigned' },
        { status: 403 }
      )
    }

    let partners = []

    if (userRole.role === 'admin') {
      // Admin can see all partners
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('name')
      
      if (error) throw error
      partners = data || []
    } else if (userRole.role === 'partner' && userRole.partner_id) {
      // Partner can only see their own organization
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', userRole.partner_id)
        .single()
      
      if (error) throw error
      partners = data ? [data] : []
    } else {
      // Regular users don't see any partners
      partners = []
    }

    return NextResponse.json({ partners })
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}
