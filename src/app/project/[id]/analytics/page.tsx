/**
 * @fileoverview Analytics Dashboard page for project timing analysis
 * @module app/project/[id]/analytics/page
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  BarChart3, 
  Clock, 
  AlertCircle, 
  Download,
  RefreshCw,
  Mic,
  Video,
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { useProject } from '@/hooks/use-projects'
import { TimingChart } from '@/components/analytics/TimingChart'
import { MetricsGrid } from '@/components/analytics/MetricsGrid'
import { RecommendationsList } from '@/components/analytics/RecommendationsList'
import { apiClient } from '@/lib/api/client'
import type { Manifest } from '@/lib/validation/manifest'

interface AnalyticsPageProps {
  params: {
    id: string
  }
}

interface AudioTimingData {
  total_duration: number
  total_words: number
  shot_count: number
  splice_points: Array<{
    time: number
    type: string
    shot_index: number
  }>
  shots: Array<{
    shot_index: number
    voiceover: string
    word_count: number
    has_timing: boolean
    start_time: number
    end_time: number
    duration: number
    is_silent: boolean
    can_bleed_over: boolean
  }>
  warnings: string[]
  recommendations: string[]
}

interface VideoTimingData {
  total_duration: number
  shot_adjustments: Array<{
    shot_index: number
    original_duration: number
    adjusted_duration: number
    reason: string
  }>
  optimization_suggestions: string[]
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const router = useRouter()
  const { data: project, isLoading: projectLoading } = useProject(params.id)
  
  const [audioTiming, setAudioTiming] = useState<AudioTimingData | null>(null)
  const [videoTiming, setVideoTiming] = useState<VideoTimingData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'audio' | 'video' | 'recommendations'>('overview')
  
  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!project?.data?.manifest) {
      setError('No manifest found for this project')
      return
    }
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const manifest = project.data.manifest as Manifest
      
      // Fetch audio timing analysis
      const audioResponse = await apiClient.post('/api/brunnr/analytics/audio-timing', manifest) as { data: AudioTimingData }
      setAudioTiming(audioResponse.data)
      
      // Fetch video timing analysis
      const videoResponse = await apiClient.post('/api/brunnr/analytics/video-timing', manifest) as { data: VideoTimingData }
      setVideoTiming(videoResponse.data)
      
    } catch (err) {
      console.error('Analytics error:', err)
      setError('Failed to fetch analytics data')
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  useEffect(() => {
    if (project?.data?.manifest) {
      fetchAnalytics()
    }
  }, [project])
  
  // Calculate metrics
  const getMetrics = () => {
    if (!audioTiming) return null
    
    const avgShotDuration = audioTiming.total_duration / audioTiming.shot_count
    const wordsPerMinute = (audioTiming.total_words / audioTiming.total_duration) * 60
    const silentShots = audioTiming.shots.filter(s => s.is_silent).length
    const actionCount = audioTiming.shots.reduce((sum, shot) => {
      const manifest = project?.data?.manifest as Manifest
      const shotData = manifest?.shots?.[shot.shot_index]
      return sum + (shotData?.actions?.length || 0)
    }, 0)
    
    return {
      totalDuration: audioTiming.total_duration,
      shotCount: audioTiming.shot_count,
      avgShotDuration,
      wordsPerMinute,
      silentShots,
      actionCount,
      warningCount: audioTiming.warnings.length,
      recommendationCount: audioTiming.recommendations.length
    }
  }
  
  const metrics = getMetrics()
  
  // Export analytics data
  const handleExport = () => {
    const data = {
      project: {
        id: project?.id,
        name: project?.name,
        created_at: project?.created_at
      },
      audioTiming,
      videoTiming,
      metrics,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${project?.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  if (projectLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Loading project...</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!project) {
    return (
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Project not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/project/${params.id}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">{project.name}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              disabled={isAnalyzing}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isAnalyzing && "animate-spin")} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!audioTiming || isAnalyzing}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* No Data State */}
      {!audioTiming && !isAnalyzing && !error && (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No analytics data available</p>
            <Button onClick={fetchAnalytics}>
              Analyze Manifest
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Analytics Content */}
      {audioTiming && metrics && (
        <div className="space-y-6">
          {/* Metrics Overview */}
          <MetricsGrid metrics={metrics} />
          
          {/* Detailed Analytics Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="audio">Audio Timing</TabsTrigger>
              <TabsTrigger value="video">Video Timing</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Timing Overview</CardTitle>
                  <CardDescription>
                    Visual representation of shot timing and pacing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TimingChart 
                    audioTiming={audioTiming}
                    videoTiming={videoTiming}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="audio">
              <Card>
                <CardHeader>
                  <CardTitle>Audio Analysis</CardTitle>
                  <CardDescription>
                    Detailed breakdown of voiceover timing and pacing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Shot Details */}
                    <div className="space-y-2">
                      {audioTiming.shots.map((shot, index) => (
                        <div 
                          key={index}
                          className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Shot {shot.shot_index + 1}</span>
                              {shot.is_silent ? (
                                <Badge variant="outline" className="text-gray-600">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Silent
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-blue-600">
                                  <Mic className="mr-1 h-3 w-3" />
                                  {shot.word_count} words
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-500">
                              {shot.start_time.toFixed(2)}s - {shot.end_time.toFixed(2)}s
                              ({shot.duration.toFixed(2)}s)
                            </div>
                          </div>
                          
                          {shot.voiceover && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {shot.voiceover}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Splice Points */}
                    {audioTiming.splice_points.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Audio Splice Points</h4>
                        <div className="space-y-1">
                          {audioTiming.splice_points.map((point, index) => (
                            <div 
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Badge variant="outline" className="text-xs">
                                {point.time.toFixed(2)}s
                              </Badge>
                              <span className="text-gray-600">
                                {point.type} at shot {point.shot_index + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="video">
              <Card>
                <CardHeader>
                  <CardTitle>Video Timing</CardTitle>
                  <CardDescription>
                    Shot duration adjustments and optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {videoTiming ? (
                    <div className="space-y-4">
                      {/* Adjustments */}
                      {videoTiming.shot_adjustments && videoTiming.shot_adjustments.length > 0 && (
                        <div className="space-y-2">
                          {videoTiming.shot_adjustments.map((adjustment, index) => (
                            <div 
                              key={index}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">
                                  Shot {adjustment.shot_index + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                  {adjustment.adjusted_duration > adjustment.original_duration ? (
                                    <TrendingUp className="h-4 w-4 text-orange-500" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4 text-green-500" />
                                  )}
                                  <span className="text-sm">
                                    {adjustment.original_duration.toFixed(2)}s → {adjustment.adjusted_duration.toFixed(2)}s
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{adjustment.reason}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Optimization Suggestions */}
                      {videoTiming.optimization_suggestions && videoTiming.optimization_suggestions.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Optimization Suggestions</h4>
                          <ul className="space-y-1">
                            {videoTiming.optimization_suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No video timing data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommendations">
              <RecommendationsList 
                warnings={audioTiming.warnings}
                recommendations={audioTiming.recommendations}
                optimizations={videoTiming?.optimization_suggestions || []}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
