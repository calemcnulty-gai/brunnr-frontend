/**
 * @fileoverview Metrics grid component for analytics dashboard
 * @module components/analytics/MetricsGrid
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Film, 
  Mic, 
  Zap, 
  AlertCircle,
  TrendingUp,
  Volume2,
  Layers
} from 'lucide-react'

interface MetricsGridProps {
  metrics: {
    totalDuration: number
    shotCount: number
    avgShotDuration: number
    wordsPerMinute: number
    silentShots: number
    actionCount: number
    warningCount: number
    recommendationCount: number
  }
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const getPaceQuality = (wpm: number) => {
    if (wpm < 120) return { label: 'Slow', color: 'text-blue-600' }
    if (wpm < 150) return { label: 'Good', color: 'text-green-600' }
    if (wpm < 180) return { label: 'Fast', color: 'text-yellow-600' }
    return { label: 'Very Fast', color: 'text-red-600' }
  }
  
  const paceQuality = getPaceQuality(metrics.wordsPerMinute)
  
  const metricCards = [
    {
      title: 'Total Duration',
      value: formatDuration(metrics.totalDuration),
      subtitle: `${metrics.totalDuration.toFixed(1)} seconds`,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Shots',
      value: metrics.shotCount.toString(),
      subtitle: `${metrics.silentShots} silent`,
      icon: Film,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Avg Shot Duration',
      value: `${metrics.avgShotDuration.toFixed(1)}s`,
      subtitle: 'Per shot',
      icon: Layers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Speaking Pace',
      value: `${Math.round(metrics.wordsPerMinute)}`,
      subtitle: 'Words per minute',
      icon: Mic,
      color: paceQuality.color,
      bgColor: 'bg-gray-50',
      badge: paceQuality.label
    },
    {
      title: 'Total Actions',
      value: metrics.actionCount.toString(),
      subtitle: 'Animations',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Issues Found',
      value: (metrics.warningCount + metrics.recommendationCount).toString(),
      subtitle: `${metrics.warningCount} warnings`,
      icon: AlertCircle,
      color: metrics.warningCount > 0 ? 'text-orange-600' : 'text-green-600',
      bgColor: metrics.warningCount > 0 ? 'bg-orange-50' : 'bg-green-50'
    }
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
                {metric.badge && (
                  <Badge variant="outline" className={`text-xs ${metric.color}`}>
                    {metric.badge}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  {metric.title}
                </p>
                <p className="text-xs text-gray-400">
                  {metric.subtitle}
                </p>
              </div>
              
              {/* Decorative gradient */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{
                  background: `linear-gradient(to right, ${metric.bgColor}, transparent)`
                }}
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
