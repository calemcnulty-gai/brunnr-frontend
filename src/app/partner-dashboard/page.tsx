/**
 * @fileoverview Main partner dashboard page with role-based access
 * @module app/partner-dashboard/page
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/hooks/use-user-role'
import { AdminDashboard } from '@/components/partner/AdminDashboard'
import { PartnerDashboard } from '@/components/partner/PartnerDashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, ShieldOff } from 'lucide-react'

export default function PartnerDashboardPage() {
  const router = useRouter()
  const { role, isLoading, error, partnerCode } = useUserRole()

  useEffect(() => {
    // Redirect if user doesn't have access
    if (!isLoading && !role) {
      router.push('/dashboard')
    }
  }, [isLoading, role, router])

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <Alert variant="destructive">
          <ShieldOff className="h-4 w-4" />
          <AlertTitle>Access Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!role || role === 'user') {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <Alert>
          <ShieldOff className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access the partner dashboard. 
            Please contact your administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Render appropriate dashboard based on role
  return (
    <div className="min-h-screen bg-gray-50">
      {role === 'admin' ? (
        <AdminDashboard />
      ) : role === 'partner' ? (
        <PartnerDashboard partnerCode={partnerCode} />
      ) : null}
    </div>
  )
}
