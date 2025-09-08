/**
 * @fileoverview Partner-specific dashboard for viewing own metrics
 * @module components/partner/PartnerDashboard
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Activity,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  FileText,
  Zap,
  Calendar,
  Key,
  Video,
  Target
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import type { 
  PartnerDashboard as PartnerDashboardData,
  SlaMetrics,
  VideoGeneration,
  ActiveSeat,
  ApiKey
} from '@/types/partner'
import { ApiKeyManager } from './ApiKeyManager'

interface PartnerDashboardProps {
  partnerCode?: string
}

export function PartnerDashboard({ partnerCode }: PartnerDashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]!,
    end: new Date().toISOString().split('T')[0]!
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])

  useEffect(() => {
    if (partnerCode) {
      fetchDashboardData()
      fetchApiKeys()
    }
  }, [partnerCode, dateRange])

  const fetchDashboardData = async () => {
    if (!partnerCode) return
    
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/partner/report?partner_code=${partnerCode}&start_date=${dateRange.start}&end_date=${dateRange.end}&include_details=true`,
        { method: 'POST', body: JSON.stringify({ partner_code: partnerCode, start_date: dateRange.start, end_date: dateRange.end, include_details: true }) }
      )
      const data = await response.json()
      setDashboardData(data.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchApiKeys = async () => {
    if (!partnerCode) return
    
    try {
      const response = await fetch(`/api/partner/api-keys`)
      const data = await response.json()
      setApiKeys(data.keys || [])
    } catch (error) {
      console.error('Error fetching API keys:', error)
    }
  }

  const exportData = async () => {
    if (!partnerCode) return
    
    try {
      const response = await fetch(
        `/api/partner/report?partner_code=${partnerCode}&type=csv_export&start_date=${dateRange.start}&end_date=${dateRange.end}`
      )
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${partnerCode}-report-${dateRange.start}-to-${dateRange.end}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            No data found for your organization. Please contact support if this is unexpected.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { partner, summary, sla_metrics, active_seats, generations } = dashboardData

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{partner?.name} Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your integration performance and usage</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              {partner?.code}
            </Badge>
            <Button variant="outline" onClick={fetchDashboardData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border rounded-lg"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Video className="h-5 w-5 text-blue-600" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{summary?.total_requests || 0}</p>
            <p className="text-sm text-gray-600">Total Requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <Badge variant="outline" className="text-green-600">
                {summary?.success_rate?.toFixed(1) || 0}%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{summary?.successful_renders || 0}</p>
            <p className="text-sm text-gray-600">Successful</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">{summary?.active_seats || 0}</p>
            <p className="text-sm text-gray-600">Active Seats</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold">{summary?.avg_p95_minutes?.toFixed(1) || 0}m</p>
            <p className="text-sm text-gray-600">p95 Time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-indigo-600" />
              <Badge 
                variant="outline" 
                className={
                  (sla_metrics?.[0]?.sla_24h_compliance_rate || 0) >= 90 
                    ? 'text-green-600 border-green-600' 
                    : 'text-yellow-600 border-yellow-600'
                }
              >
                {(sla_metrics?.[0]?.sla_24h_compliance_rate || 0).toFixed(1)}%
              </Badge>
            </div>
            <p className="text-2xl font-bold">24h SLA</p>
            <p className="text-sm text-gray-600">Compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="generations">Generations</TabsTrigger>
          <TabsTrigger value="billing">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Daily metrics for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sla_metrics || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="total_requests" 
                    stroke="#3B82F6" 
                    name="Requests"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="successful_renders" 
                    stroke="#10B981" 
                    name="Successful"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="success_rate" 
                    stroke="#F59E0B" 
                    name="Success Rate %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Active Seats */}
          {active_seats && active_seats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Seats</CardTitle>
                <CardDescription>API keys with activity in the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {active_seats.map((seat: ActiveSeat) => (
                    <div key={seat.api_key_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{seat.seat_name || 'Unnamed Seat'}</p>
                        <p className="text-xs text-gray-500">Key: ...{seat.api_key_id.slice(-8)}</p>
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
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Processing Times */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Time Distribution</CardTitle>
              <CardDescription>p50, p95 processing times by day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sla_metrics || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="p50_manifest_to_mp4_minutes" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="p50 (minutes)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="p95_manifest_to_mp4_minutes" 
                    stackId="1"
                    stroke="#F59E0B" 
                    fill="#F59E0B"
                    fillOpacity={0.6}
                    name="p95 (minutes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* SLA Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>24-Hour SLA Compliance</CardTitle>
              <CardDescription>Percentage of jobs completed within 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sla_metrics || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="sla_24h_compliance_rate" 
                    fill="#3B82F6"
                    name="24h Compliance %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          {/* API Keys Management */}
          <ApiKeyManager 
            partnerId={partner?.id || ''}
            partnerName={dashboardData?.partner?.name}
          />
        </TabsContent>

        <TabsContent value="generations" className="space-y-6">
          {/* Recent Generations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Generations</CardTitle>
              <CardDescription>Latest video generation requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Request ID</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Grade/Subject</th>
                      <th className="text-right p-2">Duration</th>
                      <th className="text-right p-2">Processing Time</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(generations || []).slice(0, 10).map((gen: VideoGeneration) => (
                      <tr key={gen.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <span className="font-mono text-xs">{gen.request_id?.slice(0, 8)}...</span>
                        </td>
                        <td className="p-2">
                          <Badge 
                            variant={
                              gen.status === 'completed' ? 'default' : 
                              gen.status === 'failed' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {gen.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {gen.grade_level && gen.subject ? (
                            <span className="text-sm">{gen.grade_level} {gen.subject}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="text-right p-2">
                          {gen.video_duration_seconds ? `${gen.video_duration_seconds}s` : '-'}
                        </td>
                        <td className="text-right p-2">
                          {gen.manifest_to_mp4_minutes ? `${gen.manifest_to_mp4_minutes.toFixed(1)}m` : '-'}
                        </td>
                        <td className="p-2">
                          <span className="text-sm">
                            {new Date(gen.created_at).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {(!generations || generations.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No generations found for the selected period.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Usage Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Summary</CardTitle>
              <CardDescription>Resource usage for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Video Generations</p>
                    <p className="text-sm text-gray-500">Total videos generated</p>
                  </div>
                  <p className="text-2xl font-bold">{summary?.total_requests || 0}</p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Processing Time</p>
                    <p className="text-sm text-gray-500">Total compute minutes</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {((summary?.total_requests || 0) * (summary?.avg_p95_minutes || 0)).toFixed(0)}m
                  </p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">API Calls</p>
                    <p className="text-sm text-gray-500">Total API requests</p>
                  </div>
                  <p className="text-2xl font-bold">{summary?.total_requests || 0}</p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Active Seats</p>
                    <p className="text-sm text-gray-500">Unique API keys used</p>
                  </div>
                  <p className="text-2xl font-bold">{summary?.active_seats || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
