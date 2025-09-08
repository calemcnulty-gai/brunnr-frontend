/**
 * @fileoverview Timing visualization chart component using Recharts
 * @module components/analytics/TimingChart
 */

'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts'
import { Card } from '@/components/ui/card'

interface TimingChartProps {
  audioTiming: {
    shots: Array<{
      shot_index: number
      duration: number
      word_count: number
      is_silent: boolean
    }>
    total_duration: number
  }
  videoTiming?: {
    shot_adjustments?: Array<{
      shot_index: number
      original_duration: number
      adjusted_duration: number
    }>
  } | null
}

export function TimingChart({ audioTiming, videoTiming }: TimingChartProps) {
  const chartData = useMemo(() => {
    return audioTiming.shots.map(shot => {
      const adjustment = videoTiming?.shot_adjustments?.find(
        adj => adj.shot_index === shot.shot_index
      )
      
      return {
        name: `Shot ${shot.shot_index + 1}`,
        duration: shot.duration,
        adjustedDuration: adjustment?.adjusted_duration || shot.duration,
        wordCount: shot.word_count,
        wordsPerSecond: shot.word_count / shot.duration,
        isSilent: shot.is_silent
      }
    })
  }, [audioTiming, videoTiming])
  
  const maxDuration = Math.max(...chartData.map(d => Math.max(d.duration, d.adjustedDuration)))
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="mt-1 space-y-1 text-sm">
            <p>Duration: {data.duration.toFixed(2)}s</p>
            {data.adjustedDuration !== data.duration && (
              <p className="text-orange-600">
                Adjusted: {data.adjustedDuration.toFixed(2)}s
              </p>
            )}
            {!data.isSilent && (
              <>
                <p>Words: {data.wordCount}</p>
                <p>Pace: {data.wordsPerSecond.toFixed(1)} w/s</p>
              </>
            )}
            {data.isSilent && (
              <p className="text-gray-500">Silent shot</p>
            )}
          </div>
        </div>
      )
    }
    return null
  }
  
  // Bar colors based on shot type
  const getBarColor = (isSilent: boolean) => {
    return isSilent ? '#9CA3AF' : '#60A5FA'
  }
  
  return (
    <div className="space-y-6">
      {/* Shot Duration Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Shot Durations</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Duration (seconds)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
              domain={[0, Math.ceil(maxDuration * 1.1)]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Bar 
              dataKey="duration" 
              name="Original Duration"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.isSilent)} />
              ))}
            </Bar>
            
            {videoTiming?.shot_adjustments && videoTiming.shot_adjustments.length > 0 && (
              <Bar 
                dataKey="adjustedDuration" 
                name="Adjusted Duration"
                fill="#FB923C"
                radius={[4, 4, 0, 0]}
                opacity={0.7}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Words Per Second Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Speaking Pace</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData.filter(d => !d.isSilent)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Words/Second', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip />
            
            <defs>
              <linearGradient id="colorPace" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <Area 
              type="monotone" 
              dataKey="wordsPerSecond" 
              stroke="#60A5FA"
              fill="url(#colorPace)"
              strokeWidth={2}
            />
            
            {/* Ideal pace reference line */}
            <Line 
              type="monotone" 
              dataKey={() => 2.5} 
              stroke="#10B981"
              strokeDasharray="5 5"
              strokeWidth={1}
              name="Ideal Pace"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Ideal pace: 2.5 words/second</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-400 rounded-full" />
            <span>Actual pace</span>
          </div>
        </div>
      </div>
      
      {/* Timeline View */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Timeline View</h4>
        <div className="relative">
          <div className="h-20 bg-gray-50 rounded-lg p-2">
            <div className="relative h-full">
              {(() => {
                let cumulativeTime = 0
                return audioTiming.shots.map((shot, index) => {
                  const startPercent = (cumulativeTime / audioTiming.total_duration) * 100
                  const widthPercent = (shot.duration / audioTiming.total_duration) * 100
                  cumulativeTime += shot.duration
                  
                  return (
                    <div
                      key={index}
                      className="absolute h-full rounded transition-all hover:opacity-80"
                      style={{
                        left: `${startPercent}%`,
                        width: `${widthPercent}%`,
                        backgroundColor: shot.is_silent ? '#E5E7EB' : '#60A5FA'
                      }}
                      title={`Shot ${index + 1}: ${shot.duration.toFixed(2)}s`}
                    >
                      <div className="p-1 text-xs text-white font-medium">
                        {index + 1}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
          
          {/* Time markers */}
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0s</span>
            <span>{(audioTiming.total_duration / 2).toFixed(1)}s</span>
            <span>{audioTiming.total_duration.toFixed(1)}s</span>
          </div>
        </div>
      </div>
    </div>
  )
}
