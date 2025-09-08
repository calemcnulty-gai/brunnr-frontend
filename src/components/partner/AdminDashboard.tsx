/**
 * @fileoverview Admin dashboard for viewing all partner metrics
 * @module components/partner/AdminDashboard
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  Download,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  UserCog,
  DollarSign,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2
} from 'lucide-react'
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import type { Partner, PartnerDashboard, SlaMetrics } from '@/types/partner'

export function AdminDashboard() {
  const router = useRouter()
  const [partners, setPartners] = useState<Partner[]>([])
  const [selectedPartner, setSelectedPartner] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0] || '',
    end: new Date().toISOString().split('T')[0] || ''
  })
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchPartners()
    fetchDashboardData()
  }, [selectedPartner, dateRange])

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partner/list')
      const data = await response.json()
      setPartners(data.partners || [])
    } catch (error) {
      console.error('Error fetching partners:', error)
    }
  }

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end
      })
      
      if (selectedPartner !== 'all') {
        params.append('partner_code', selectedPartner)
      }

      const response = await fetch(`/api/partner/admin-dashboard?${params}`)
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportAllData = async () => {
    try {
      const response = await fetch(`/api/partner/export-all?start_date=${dateRange.start}&end_date=${dateRange.end}`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `all-partners-report-${dateRange.start}-to-${dateRange.end}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partner Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor all partner integrations and performance</p>
        </div>
        <Button
          onClick={() => router.push('/admin/users')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <UserCog className="h-4 w-4" />
          Manage Users
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={selectedPartner} onValueChange={setSelectedPartner}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Partners</SelectItem>
                {partners.map(partner => (
                  <SelectItem key={partner.id} value={partner.partner_code}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-[150px]"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-[150px]"
              />
            </div>

            <Button variant="outline" onClick={fetchDashboardData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            <Button variant="outline" onClick={exportAllData}>
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <Badge variant="outline">{dashboardData?.totalPartners || 0}</Badge>
                </div>
                <p className="text-2xl font-bold">{dashboardData?.activePartners || 0}</p>
                <p className="text-sm text-gray-600">Active Partners</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold">{dashboardData?.totalGenerations || 0}</p>
                <p className="text-sm text-gray-600">Total Generations</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <Badge variant="outline">{dashboardData?.totalSeats || 0}</Badge>
                </div>
                <p className="text-2xl font-bold">{dashboardData?.activeSeats || 0}</p>
                <p className="text-sm text-gray-600">Active Seats</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-green-600">
                    {dashboardData?.avgSuccessRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <p className="text-2xl font-bold">{dashboardData?.avgP95?.toFixed(1) || 0}m</p>
                <p className="text-sm text-gray-600">Avg p95 Time</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="partners">Partners</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Generation Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Generation Trends</CardTitle>
                  <CardDescription>Daily video generations across all partners</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData?.dailyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="generations" 
                        stroke="#3B82F6" 
                        name="Generations"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="successful" 
                        stroke="#10B981" 
                        name="Successful"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Partner Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Generation Distribution</CardTitle>
                    <CardDescription>By partner</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dashboardData?.partnerDistribution || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(dashboardData?.partnerDistribution || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Partners</CardTitle>
                    <CardDescription>By success rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(dashboardData?.topPartners || []).map((partner: any, index: number) => (
                        <div key={partner.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <span className="font-medium">{partner.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{partner.generations}</Badge>
                            <Badge 
                              variant={partner.successRate >= 95 ? 'default' : 'secondary'}
                            >
                              {partner.successRate.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="partners" className="space-y-6">
              {/* Partners Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Partner Details</CardTitle>
                  <CardDescription>Detailed metrics for each partner</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Partner</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-right p-2">Generations</th>
                          <th className="text-right p-2">Success Rate</th>
                          <th className="text-right p-2">Active Seats</th>
                          <th className="text-right p-2">p95 Time</th>
                          <th className="text-right p-2">24h SLA</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dashboardData?.partners || []).map((partner: any) => (
                          <tr key={partner.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <div>
                                <p className="font-medium">{partner.name}</p>
                                <p className="text-xs text-gray-500">{partner.code}</p>
                              </div>
                            </td>
                            <td className="p-2">
                              <Badge 
                                variant={partner.productionEnabled ? 'default' : 'secondary'}
                              >
                                {partner.productionEnabled ? 'Production' : 'Sandbox'}
                              </Badge>
                            </td>
                            <td className="text-right p-2">{partner.generations}</td>
                            <td className="text-right p-2">
                              <span className={partner.successRate >= 95 ? 'text-green-600' : 'text-yellow-600'}>
                                {partner.successRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="text-right p-2">{partner.activeSeats}</td>
                            <td className="text-right p-2">
                              <span className={partner.p95Time <= 15 ? 'text-green-600' : 'text-yellow-600'}>
                                {partner.p95Time.toFixed(1)}m
                              </span>
                            </td>
                            <td className="text-right p-2">
                              <span className={partner.sla24h >= 90 ? 'text-green-600' : 'text-yellow-600'}>
                                {partner.sla24h.toFixed(1)}%
                              </span>
                            </td>
                            <td className="p-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.location.href = `/usage-dashboard?partner=${partner.code}`}
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Times</CardTitle>
                    <CardDescription>p50, p95, p99 trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dashboardData?.performanceTrends || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="p50" stroke="#10B981" name="p50" />
                        <Line type="monotone" dataKey="p95" stroke="#F59E0B" name="p95" />
                        <Line type="monotone" dataKey="p99" stroke="#EF4444" name="p99" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SLA Compliance</CardTitle>
                    <CardDescription>24-hour completion rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboardData?.slaCompliance || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="partner" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="compliance" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current system status and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">API Status</span>
                      </div>
                      <p className="text-sm text-green-700">All systems operational</p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-900">Processing Queue</span>
                      </div>
                      <p className="text-sm text-yellow-700">12 jobs pending</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Avg Response Time</span>
                      </div>
                      <p className="text-sm text-blue-700">245ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              {/* Billing Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Overview</CardTitle>
                  <CardDescription>Usage-based billing for the period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(dashboardData?.billingData || []).map((partner: any) => (
                      <div key={partner.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{partner.name}</p>
                            <p className="text-sm text-gray-500">Plan: {partner.plan}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">${partner.estimatedCost.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Estimated</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-500">Generations</p>
                            <p className="font-medium">{partner.generations} @ ${partner.costPerGeneration}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Storage</p>
                            <p className="font-medium">{partner.storageGB} GB</p>
                          </div>
                          <div>
                            <p className="text-gray-500">API Calls</p>
                            <p className="font-medium">{partner.apiCalls.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium">Total Estimated</p>
                        <p className="text-2xl font-bold">
                          ${dashboardData?.totalEstimatedCost?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
