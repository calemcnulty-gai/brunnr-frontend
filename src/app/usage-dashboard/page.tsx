/**
 * @fileoverview Usage dashboard page showing metrics based on user role
 * @module app/usage-dashboard/page
 * 
 * Note: Supabase RLS policies determine what data each user sees
 */

'use client'

import { useUserRole } from '@/hooks/use-user-role'
import { AdminDashboard } from '@/components/partner/AdminDashboard'
import { PartnerDashboard } from '@/components/partner/PartnerDashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Info } from 'lucide-react'

export default function UsageDashboardPage() {
  const { role, isLoading, error, partnerCode } = useUserRole()

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
          <Info className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Render appropriate dashboard based on role
  // Regular users will see PartnerDashboard but RLS will limit data to their own usage
  return (
    <div className="min-h-screen bg-gray-50">
      {role === 'admin' ? (
        <AdminDashboard />
      ) : (
        <PartnerDashboard partnerCode={partnerCode} />
      )}
    </div>
  )
}
