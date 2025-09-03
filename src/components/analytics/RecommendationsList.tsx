/**
 * @fileoverview Recommendations list component for analytics dashboard
 * @module components/analytics/RecommendationsList
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Lightbulb,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

interface RecommendationsListProps {
  warnings: string[]
  recommendations: string[]
  optimizations: string[]
}

export function RecommendationsList({ 
  warnings, 
  recommendations, 
  optimizations 
}: RecommendationsListProps) {
  
  const totalIssues = warnings.length + recommendations.length + optimizations.length
  
  if (totalIssues === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Excellent! No Issues Found
          </h3>
          <p className="text-gray-500">
            Your manifest is well-optimized with good timing and pacing.
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
          <CardDescription>
            Found {totalIssues} potential improvement{totalIssues !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {warnings.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{warnings.length} Warning{warnings.length !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-500">Should be addressed</p>
                </div>
              </div>
            )}
            
            {recommendations.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{recommendations.length} Suggestion{recommendations.length !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-500">For better quality</p>
                </div>
              </div>
            )}
            
            {optimizations.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{optimizations.length} Optimization{optimizations.length !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-gray-500">Performance improvements</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Warnings
            </CardTitle>
            <CardDescription>
              Issues that may affect video quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {warnings.map((warning, index) => (
                <Alert key={index} className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm">
                    {warning}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Lightbulb className="h-5 w-5" />
              Recommendations
            </CardTitle>
            <CardDescription>
              Suggestions to improve your video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                >
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-900">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Optimizations */}
      {optimizations.length > 0 && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="h-5 w-5" />
              Optimization Opportunities
            </CardTitle>
            <CardDescription>
              Ways to enhance performance and efficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optimizations.map((opt, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-green-900">{opt}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Steps to address these findings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {warnings.length > 0 && (
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <label className="text-sm">
                  Review and fix {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
                </label>
              </div>
            )}
            
            {recommendations.length > 0 && (
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <label className="text-sm">
                  Consider {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''}
                </label>
              </div>
            )}
            
            {optimizations.length > 0 && (
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <label className="text-sm">
                  Apply {optimizations.length} optimization{optimizations.length !== 1 ? 's' : ''}
                </label>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <label className="text-sm">
                Re-run analysis after changes
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
