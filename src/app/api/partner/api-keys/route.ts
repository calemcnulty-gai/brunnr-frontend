/**
 * @fileoverview API endpoint for managing partner API keys
 * @module app/api/partner/api-keys/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

/**
 * GET /api/partner/api-keys
 * Get API keys for the authenticated partner
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

    // Get user role and partner
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

    let apiKeys = []

    if (userRole.role === 'admin') {
      // Admin can see all API keys
      const partnerCode = request.nextUrl.searchParams.get('partner_code')
      
      if (partnerCode) {
        const { data: partner } = await supabase
          .from('partners')
          .select('id')
          .eq('partner_code', partnerCode)
          .single()
        
        if (partner) {
          const { data } = await supabase
            .from('api_keys')
            .select('*')
            .eq('partner_id', partner.id)
            .order('created_at', { ascending: false })
          
          apiKeys = data || []
        }
      } else {
        const { data } = await supabase
          .from('api_keys')
          .select('*')
          .order('created_at', { ascending: false })
        
        apiKeys = data || []
      }
    } else if (userRole.role === 'partner' && userRole.partner_id) {
      // Partner can only see their own API keys
      const { data } = await supabase
        .from('api_keys')
        .select('*')
        .eq('partner_id', userRole.partner_id)
        .order('created_at', { ascending: false })
      
      apiKeys = data || []
    }

    // Don't send the actual key hash, just metadata
    const sanitizedKeys = apiKeys.map(key => ({
      id: key.id,
      partner_id: key.partner_id,
      key_prefix: key.key_prefix,
      seat_name: key.seat_name,
      environment: key.environment,
      is_active: key.is_active,
      last_used_at: key.last_used_at,
      request_count: key.request_count,
      created_at: key.created_at,
      expires_at: key.expires_at
    }))

    return NextResponse.json({ keys: sanitizedKeys })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/partner/api-keys
 * Create a new API key (admin or partner with permission)
 */
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { partner_id, seat_name, environment } = body

    // Get user role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role, partner_id, permissions')
      .eq('user_id', user.id)
      .single()

    if (!userRole) {
      return NextResponse.json(
        { error: 'No role assigned' },
        { status: 403 }
      )
    }

    // Check permissions
    let targetPartnerId = partner_id
    
    if (userRole.role === 'partner') {
      // Partners can only create keys for their own organization
      if (partner_id && partner_id !== userRole.partner_id) {
        return NextResponse.json(
          { error: 'Cannot create keys for other partners' },
          { status: 403 }
        )
      }
      targetPartnerId = userRole.partner_id
      
      // Check if partner has permission to manage API keys
      const permissions = userRole.permissions as string[] || []
      if (!permissions.includes('manage_own_api_keys')) {
        return NextResponse.json(
          { error: 'No permission to manage API keys' },
          { status: 403 }
        )
      }
    } else if (userRole.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    if (!targetPartnerId) {
      return NextResponse.json(
        { error: 'Partner ID required' },
        { status: 400 }
      )
    }

    // Generate API key
    const apiKey = `${environment === 'production' ? 'pk' : 'sk'}_${crypto.randomBytes(32).toString('hex')}`
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
    const keyPrefix = apiKey.substring(0, 8)

    // Create the API key
    const { data: newKey, error } = await supabase
      .from('api_keys')
      .insert({
        partner_id: targetPartnerId,
        user_id: user.id,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        seat_name: seat_name || `Seat ${Date.now()}`,
        environment: environment || 'sandbox',
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    // Log the action
    await supabase
      .from('partner_audit_log')
      .insert({
        partner_id: targetPartnerId,
        user_id: user.id,
        action: 'api_key_created',
        entity_type: 'api_key',
        entity_id: newKey.id,
        metadata: { seat_name, environment }
      })

    return NextResponse.json({
      success: true,
      key: {
        id: newKey.id,
        api_key: apiKey, // Only return the full key on creation
        key_prefix: keyPrefix,
        seat_name: newKey.seat_name,
        environment: newKey.environment
      }
    })
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/partner/api-keys/[id]
 * Deactivate an API key
 */
export async function DELETE(request: NextRequest) {
  try {
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

    const keyId = request.nextUrl.pathname.split('/').pop()
    
    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID required' },
        { status: 400 }
      )
    }

    // Get the API key
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('partner_id')
      .eq('id', keyId)
      .single()

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role, partner_id')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role === 'partner' && userRole.partner_id !== apiKey.partner_id) {
      return NextResponse.json(
        { error: 'Cannot delete keys from other partners' },
        { status: 403 }
      )
    } else if (userRole?.role !== 'admin' && userRole?.role !== 'partner') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Deactivate the key
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)

    if (error) throw error

    // Log the action
    await supabase
      .from('partner_audit_log')
      .insert({
        partner_id: apiKey.partner_id,
        user_id: user.id,
        action: 'api_key_deactivated',
        entity_type: 'api_key',
        entity_id: keyId
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deactivating API key:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate API key' },
      { status: 500 }
    )
  }
}
