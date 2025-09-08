/**
 * @fileoverview Hook for detecting and managing user roles
 * @module hooks/use-user-role
 */

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/auth-store'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
      // Get user's dashboard access data
      const { data, error } = await supabase
        .rpc('get_user_dashboard_data')
        .single()

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
