/**
 * @fileoverview Screenplay step component for Step-by-Step workflow
 * @module components/projects/steps/ScreenplayStep
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowRight, Loader2, RefreshCw, Film } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUpdateProject } from '@/hooks/use-projects'
import { explanationToScreenplay } from '@/lib/api/endpoints'
import type { Project } from '@/types/database'
import type { Screenplay } from '@/types/api'
import { ApiError } from '@/lib/api/types'

interface ScreenplayStepProps {
  project: Project
  onComplete: () => void
}

export function ScreenplayStep({ project, onComplete }: ScreenplayStepProps) {
  const { updateDraftData, draftData } = useProjectStore()
  const updateProject = useUpdateProject()
  
  const [screenplay, setScreenplay] = useState<Screenplay | null>(
    project.data.screenplay || draftData.screenplay || null
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Load screenplay on mount if not present
  useEffect(() => {
    if (!screenplay && (project.data.explanation || draftData.explanation)) {
      handleGenerate()
    }
  }, [])
  
  useEffect(() => {
    // Update draft data when screenplay changes
    if (screenplay) {
      updateDraftData({ screenplay })
    }
  }, [screenplay, updateDraftData])
  
  const handleGenerate = async () => {
    const explanation = project.data.explanation || draftData.explanation
    if (!explanation) {
      setError('No explanation found. Please go back and generate an explanation.')
      return
    }
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await explanationToScreenplay({
        text: explanation
      })
      
      setScreenplay(response.screenplay)
      
      // Save to project
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: {
          data: {
            ...project.data,
            screenplay: response.screenplay,
            screenplayMetrics: response.structure_stats
          }
        }
      })
    } catch (err) {
      console.error('Failed to generate screenplay:', err)
      if (err instanceof ApiError) {
        setError(`API Error: ${err.message}${err.detail ? `\n\nDetails: ${err.detail}` : ''}`)
      } else {
        setError('Failed to generate screenplay. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleContinue = () => {
    if (!screenplay) {
      setError('Please generate a screenplay first')
      return
    }
    
    onComplete()
  }
  
  const metrics = project.data.screenplayMetrics || draftData.screenplayMetrics
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Generated Screenplay</h3>
          {metrics && (
            <p className="text-sm text-gray-500">
              {metrics.scene_count} scenes • {metrics.shot_count} shots • {metrics.total_voiceover_words} words
            </p>
          )}
        </div>
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
      
      {screenplay ? (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {screenplay.shotgroups.map((group, groupIndex) => (
            <Card key={groupIndex}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  Scene {groupIndex + 1}
                </CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.shots.map((shot, shotIndex) => (
                  <div key={shotIndex} className="border-l-2 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-700">
                      Shot {groupIndex + 1}.{shotIndex + 1}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{shot.description}</p>
                    {shot.voiceover && (
                      <p className="text-sm text-gray-800 mt-2 italic">
                        "{shot.voiceover}"
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            <Film className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No screenplay generated yet</p>
            <p className="text-sm mt-1">Click "Generate" to create a screenplay from the explanation</p>
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
          disabled={!screenplay || isGenerating}
        >
          Continue to Manifest
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
