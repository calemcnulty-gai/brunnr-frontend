/**
 * @fileoverview Question step component for Step-by-Step workflow
 * @module components/projects/steps/QuestionStep
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import type { Project } from '@/types/database'

interface QuestionStepProps {
  project: Project
  onComplete: () => void
}

export function QuestionStep({ project, onComplete }: QuestionStepProps) {
  const { updateDraftData, draftData } = useProjectStore()
  
  const [question, setQuestion] = useState(project.data.question || draftData.question || '')
  const [context, setContext] = useState(project.data.context || draftData.context || '')
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Update draft data when inputs change
    updateDraftData({ question, context })
  }, [question, context, updateDraftData])
  
  const handleContinue = () => {
    if (!question.trim()) {
      setError('Please enter a question')
      return
    }
    
    setError(null)
    onComplete()
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question">Your Question *</Label>
        <Textarea
          id="question"
          placeholder="e.g., What is the Pythagorean theorem?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-h-[120px]"
        />
        <p className="text-sm text-gray-500">
          Ask any educational question you'd like explained in a video
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="context">Context (Optional)</Label>
        <Textarea
          id="context"
          placeholder="e.g., Explain for high school geometry students"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="min-h-[100px]"
        />
        <p className="text-sm text-gray-500">
          Provide additional context to tailor the explanation
        </p>
      </div>
      
      {error && (
        <div className="rounded-lg bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button onClick={handleContinue} disabled={!question.trim()}>
          Continue to Explanation
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
