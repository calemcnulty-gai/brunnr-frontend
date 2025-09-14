/**
 * @fileoverview Hook for detecting and managing user roles
 * @module hooks/use-user-role
 */

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth-store'

export type UserRole = 'admin' | 'partner' | 'user' | null

export interface UserDashboardAccess {
  role: UserRole
  partnerId?: string
  partnerName?: string
  partnerCode?: string
  canViewAllPartners: boolean
  accessiblePartnerIds: string[]
  isLoading: boolean
  error?: string
}

export function useUserRole(): UserDashboardAccess {
  const { user } = useAuthStore()
  const [dashboardAccess, setDashboardAccess] = useState<UserDashboardAccess>({
    role: null,
    canViewAllPartners: false,
    accessiblePartnerIds: [],
    isLoading: true
  })
  
  // Memoize Supabase client to prevent constant recreation
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!user) {
      setDashboardAccess({
        role: null,
        canViewAllPartners: false,
        accessiblePartnerIds: [],
        isLoading: false
      })
      return
    }

    fetchUserRole()
  }, [user])

  const fetchUserRole = async () => {
    try {
      // Use memoized supabase client
      
      // First try without passing user_id (relies on auth context)
      let { data, error } = await supabase
        .rpc('get_user_dashboard_data')
        .single()
      
      // If that returns default user role and we have a user, try with explicit user_id
      if (!error && data && (data as any).role === 'user' && user?.id) {
        const explicitResult = await supabase
          .rpc('get_user_dashboard_data', { user_id_input: user.id } as any)
          .single()
        
        if (!explicitResult.error && explicitResult.data) {
          data = explicitResult.data
          error = explicitResult.error
        }
      }

      if (error) {
        console.error('Error fetching user role:', error)
        setDashboardAccess(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch user role'
        }))
        return
      }

      if (data) {
        const roleData = data as any
        setDashboardAccess({
          role: roleData.role as UserRole,
          partnerId: roleData.partner_id,
          partnerName: roleData.partner_name,
          partnerCode: roleData.partner_code,
          canViewAllPartners: roleData.can_view_all_partners,
          accessiblePartnerIds: roleData.accessible_partner_ids || [],
          isLoading: false
        })
      } else {
        // No role found, default to user
        setDashboardAccess({
          role: 'user',
          canViewAllPartners: false,
          accessiblePartnerIds: [],
          isLoading: false
        })
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error)
      setDashboardAccess(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch user role'
      }))
    }
  }

  return dashboardAccess
}

/**
 * Check if user has access to view a specific partner
 */
export function usePartnerAccess(partnerId: string): boolean {
  const { role, accessiblePartnerIds } = useUserRole()
  
  if (role === 'admin') return true
  if (role === 'partner' && accessiblePartnerIds.includes(partnerId)) return true
  
  return false
}

/**
 * Hook to ensure user has required role
 */
export function useRequireRole(requiredRole: 'admin' | 'partner'): {
  hasAccess: boolean
  isLoading: boolean
  role: UserRole
} {
  const { role, isLoading } = useUserRole()
  
  const hasAccess = (() => {
    if (!role) return false
    if (requiredRole === 'admin') return role === 'admin'
    if (requiredRole === 'partner') return role === 'admin' || role === 'partner'
    return false
  })()
  
  return { hasAccess, isLoading, role }
}
