/**
 * @fileoverview Incept September 2025 Goals Dashboard
 * @module components/partner/InceptDashboard
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Clock,
  Activity,
  FileText,
  School,
  Target,
  Calendar
} from 'lucide-react'
import type { InceptGoalProgress, InceptSeptemberMetrics, ActiveSeat } from '@/types/partner'

interface InceptDashboardProps {
  className?: string
}

export function InceptDashboard({ className }: InceptDashboardProps) {
  const [progress, setProgress] = useState<InceptGoalProgress | null>(null)
  const [metrics, setMetrics] = useState<InceptSeptemberMetrics | null>(null)
  const [activeSeats, setActiveSeats] = useState<ActiveSeat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/partner/report?partner_code=INCEPT&type=incept_september')
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const data = await response.json()
      setProgress(data.data.progress)
      setMetrics(data.data.metrics)
      setActiveSeats(data.data.active_seats || [])
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
  
  const exportReport = async () => {
    try {
      const response = await fetch('/api/partner/report?partner_code=INCEPT&type=csv_export&start_date=2025-09-01&end_date=2025-09-30')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `incept-september-2025-report.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  if (!progress || !metrics) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>No data available for September 2025</AlertDescription>
      </Alert>
    )
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-600 bg-green-50 border-green-200'
      case 'on_track': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'at_risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'behind': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }
  
  const MetricCard = ({ 
    title, 
    current, 
    target, 
    unit = '', 
    icon: Icon,
    inverse = false // For metrics where lower is better
  }: any) => {
    const percentage = inverse 
      ? Math.max(0, Math.min(100, (target / current) * 100))
      : Math.max(0, Math.min(100, (current / target) * 100))
    const isComplete = inverse ? current <= target : current >= target
    
    return (
      <Card className={isComplete ? 'border-green-200' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Icon className="h-4 w-4 text-gray-600" />
            </div>
            {isComplete && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </div>
          
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold">
            {current}{unit}
            <span className="text-sm font-normal text-gray-500"> / {target}{unit}</span>
          </p>
          
          <Progress value={percentage} className="mt-3" />
          <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}% complete</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Incept Integration Dashboard</h1>
          <p className="text-gray-600">September 2025 Goals Progress</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor(progress.status)}>
            {progress.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
      
      {/* Overall Progress */}
      <Card className={getStatusColor(progress.status)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Progress</span>
            <span className="text-3xl">{progress.overall_progress.toFixed(0)}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress.overall_progress} className="h-3" />
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-gray-600">Target Date</p>
              <p className="font-medium">September 30, 2025</p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated</p>
              <p className="font-medium">{new Date(progress.last_updated).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Published Videos"
          current={progress.published_videos.count}
          target={progress.published_videos.target}
          icon={FileText}
        />
        
        <MetricCard
          title="Successful Renders"
          current={progress.production_usage.successful_renders}
          target={progress.production_usage.target_renders}
          icon={Activity}
        />
        
        <MetricCard
          title="Active Seats"
          current={progress.production_usage.active_seats}
          target={progress.production_usage.target_seats}
          icon={Users}
        />
        
        <MetricCard
          title="p95 Processing Time"
          current={progress.reliability.p95_manifest_to_mp4}
          target={progress.reliability.target_p95}
          unit="m"
          icon={Clock}
          inverse={true}
        />
      </div>
      
      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integration & Publishing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Integration & Publishing
            </CardTitle>
            <CardDescription>Target: 5+ 4th-grade math videos by Sep 14</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">4th Grade Math Videos</span>
                <Badge variant={progress.published_videos.fourth_grade_math >= 5 ? 'default' : 'outline'}>
                  {progress.published_videos.fourth_grade_math} / 5
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Available to Students</span>
                {progress.published_videos.available_to_students ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Partner Acceptance</span>
                {progress.enrollment.acceptance_received ? (
                  <Badge variant="default">
                    Received {progress.enrollment.acceptance_date}
                  </Badge>
                ) : (
                  <Badge variant="outline">Pending (by Sep 24)</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Production Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Production Usage
            </CardTitle>
            <CardDescription>Sep 1-30 Window</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Success Rate</span>
                <div className="flex items-center gap-2">
                  <Progress value={progress.production_usage.success_rate} className="w-20" />
                  <Badge variant={progress.production_usage.success_rate >= 95 ? 'default' : 'outline'}>
                    {progress.production_usage.success_rate.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">24h SLA Compliance</span>
                <div className="flex items-center gap-2">
                  <Progress value={progress.reliability.jobs_within_24h_rate} className="w-20" />
                  <Badge variant={progress.reliability.jobs_within_24h_rate >= 90 ? 'default' : 'outline'}>
                    {progress.reliability.jobs_within_24h_rate.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Unique Requests</span>
                <Badge>{metrics.unique_requests}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Active Seats */}
      {activeSeats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Seats
            </CardTitle>
            <CardDescription>API keys with activity in September</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeSeats.map((seat) => (
                <div key={seat.api_key_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{seat.seat_name || 'Unnamed Seat'}</p>
                    <p className="text-xs text-gray-500">ID: {seat.api_key_id.substring(0, 8)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{seat.request_count} requests</p>
                    <p className="text-xs text-gray-500">
                      Last: {new Date(seat.last_activity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Enrollment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Enrollment Enablement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">LMS Roster</span>
                <Badge variant={progress.enrollment.roster_count >= 200 ? 'default' : 'outline'}>
                  {progress.enrollment.roster_count} students
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Go-Live Announcement</span>
                {progress.enrollment.announcement_posted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Target Roster</span>
                <Badge>≥200 students</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Acceptance Deadline</span>
                <Badge variant="outline">Sep 24</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            September 2025 Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: 'Sep 6', task: 'Provision prod/sandbox keys + seat tracking', done: false },
              { date: 'Sep 10', task: 'E2E sandbox and SLA path verified', done: false },
              { date: 'Sep 12', task: 'Preload 5 manifests/scripts', done: false },
              { date: 'Sep 14', task: 'Publish 5+ 4th-grade math videos', done: progress.published_videos.count >= 5 },
              { date: 'Sep 18', task: 'UAT complete', done: false },
              { date: 'Sep 20', task: 'Go live in production', done: false },
              { date: 'Sep 24', task: 'Partner acceptance', done: progress.enrollment.acceptance_received },
              { date: 'Sep 30', task: 'Complete all goals', done: progress.overall_progress >= 100 }
            ].map((item) => (
              <div key={item.date} className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.task}</p>
                  <p className="text-xs text-gray-500">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
