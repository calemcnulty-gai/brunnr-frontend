/**
 * @fileoverview Explanation step component for Step-by-Step workflow
 * @module components/projects/steps/ExplanationStep
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { AlertCircle, ArrowRight, Loader2, RefreshCw, FileText } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUpdateProject } from '@/hooks/use-projects'
import { questionToExplanation } from '@/lib/api/endpoints'
import type { Project } from '@/types/database'
import { ApiError } from '@/lib/api/types'

interface ExplanationStepProps {
  project: Project
  onComplete: () => void
}

export function ExplanationStep({ project, onComplete }: ExplanationStepProps) {
  const { updateDraftData, draftData } = useProjectStore()
  const updateProject = useUpdateProject()
  
  const [explanation, setExplanation] = useState(project.data.explanation || draftData.explanation || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Load explanation on mount if not present
  useEffect(() => {
    if (!explanation && project.data.question) {
      handleGenerate()
    }
  }, [])
  
  useEffect(() => {
    // Update draft data when explanation changes
    if (explanation) {
      updateDraftData({ explanation })
    }
  }, [explanation, updateDraftData])
  
  const handleGenerate = async () => {
    const question = project.data.question || draftData.question
    if (!question) {
      setError('No question found. Please go back and enter a question.')
      return
    }
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await questionToExplanation({
        text: question,
        context: project.data.context || draftData.context
      })
      
      setExplanation(response.explanation)
      
      // Save to project
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: {
          data: {
            ...project.data,
            explanation: response.explanation,
            explanationMetrics: response.content_metrics
          }
        }
      })
    } catch (err) {
      console.error('Failed to generate explanation:', err)
      if (err instanceof ApiError) {
        setError(`API Error: ${err.message}${err.detail ? `\n\nDetails: ${err.detail}` : ''}`)
      } else {
        setError('Failed to generate explanation. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleContinue = () => {
    if (!explanation.trim()) {
      setError('Please generate or enter an explanation')
      return
    }
    
    onComplete()
  }
  
  const metrics = project.data.explanationMetrics || draftData.explanationMetrics
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="explanation">Generated Explanation</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </>
            )}
          </Button>
        </div>
        
        <Textarea
          id="explanation"
          placeholder="The explanation will appear here..."
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
          disabled={isGenerating}
        />
        
        {metrics && (
          <div className="flex gap-4 text-sm text-gray-500">
            <span>Words: {metrics.word_count}</span>
            <span>•</span>
            <span>Characters: {metrics.character_count}</span>
            <span>•</span>
            <span>Reading time: {Math.round(metrics.estimated_reading_time_seconds)}s</span>
          </div>
        )}
      </div>
      
      {project.data.question && (
        <Card className="p-4 bg-gray-50">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Original Question</p>
              <p className="text-sm text-gray-600 mt-1">{project.data.question}</p>
              {project.data.context && (
                <p className="text-sm text-gray-500 mt-1">Context: {project.data.context}</p>
              )}
            </div>
          </div>
        </Card>
      )}
      
      {error && (
        <div className="rounded-lg bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={!explanation.trim() || isGenerating}
        >
          Continue to Screenplay
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
