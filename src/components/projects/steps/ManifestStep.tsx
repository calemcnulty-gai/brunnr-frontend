/**
 * @fileoverview Manifest step component for Step-by-Step workflow
 * @module components/projects/steps/ManifestStep
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowRight, Loader2, RefreshCw, Code2, Eye } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUpdateProject } from '@/hooks/use-projects'
import { screenplayToManifest } from '@/lib/api/endpoints'
import type { Project } from '@/types/database'
import type { Manifest } from '@/types/api'
import { ApiError } from '@/lib/api/types'

interface ManifestStepProps {
  project: Project
  onComplete: () => void
}

export function ManifestStep({ project, onComplete }: ManifestStepProps) {
  const { updateDraftData, draftData } = useProjectStore()
  const updateProject = useUpdateProject()
  
  const [manifest, setManifest] = useState<Manifest | null>(
    project.data.manifest || draftData.manifest || null
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual')
  
  // Load manifest on mount if not present
  useEffect(() => {
    if (!manifest && (project.data.screenplay || draftData.screenplay)) {
      handleGenerate()
    }
  }, [])
  
  useEffect(() => {
    // Update draft data when manifest changes
    if (manifest) {
      updateDraftData({ manifest })
    }
  }, [manifest, updateDraftData])
  
  const handleGenerate = async () => {
    const screenplay = project.data.screenplay || draftData.screenplay
    if (!screenplay) {
      setError('No screenplay found. Please go back and generate a screenplay.')
      return
    }
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await screenplayToManifest(screenplay)
      
      setManifest(response.manifest)
      
      // Save to project
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: {
          data: {
            ...project.data,
            manifest: response.manifest,
            manifestStats: response.manifest_stats
          }
        }
      })
    } catch (err) {
      console.error('Failed to generate manifest:', err)
      if (err instanceof ApiError) {
        setError(`API Error: ${err.message}${err.detail ? `\n\nDetails: ${err.detail}` : ''}`)
      } else {
        setError('Failed to generate manifest. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleContinue = () => {
    if (!manifest) {
      setError('Please generate a manifest first')
      return
    }
    
    onComplete()
  }
  
  const stats = project.data.manifestStats || draftData.manifestStats
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Generated Manifest</h3>
          {stats && (
            <p className="text-sm text-gray-500">
              {stats.template_count} templates • {stats.shot_count} shots
              {stats.total_duration && ` • ${Math.round(stats.total_duration)}s duration`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'visual' ? 'json' : 'visual')}
          >
            {viewMode === 'visual' ? (
              <>
                <Code2 className="mr-2 h-4 w-4" />
                View JSON
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Visual View
              </>
            )}
          </Button>
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
      </div>
      
      {manifest ? (
        viewMode === 'visual' ? (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Templates</CardTitle>
                <CardDescription>Reusable visual elements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {manifest.templates.map((template) => (
                  <div key={template.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded">{template.type}</code>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{template.id}</p>
                      <p className="text-sm text-gray-600">{template.content}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Shots */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Shots</CardTitle>
                <CardDescription>Animation sequences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {manifest.shots.map((shot, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <p className="text-sm font-medium text-gray-700">Shot {index + 1}</p>
                    {shot.voiceover && (
                      <p className="text-sm text-gray-800 italic mt-1">"{shot.voiceover}"</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {shot.actions.map((action, actionIndex) => (
                        <div key={actionIndex} className="text-xs text-gray-600">
                          • {Object.keys(action)[0]} action
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <pre className="p-4 text-xs overflow-auto max-h-[500px] bg-gray-50">
                {JSON.stringify(manifest, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            <Code2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No manifest generated yet</p>
            <p className="text-sm mt-1">Click "Generate" to create a manifest from the screenplay</p>
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
          disabled={!manifest || isGenerating}
        >
          Continue to Generate Video
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
