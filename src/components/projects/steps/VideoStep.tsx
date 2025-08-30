/**
 * @fileoverview Video generation step component for Step-by-Step workflow
 * @module components/projects/steps/VideoStep
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, Loader2, Video, CheckCircle, Download } from 'lucide-react'
import { useUpdateProject, useUploadProjectVideo } from '@/hooks/use-projects'
import { manifestToVideo, downloadVideo, extractRequestId, extractVideoFilename, buildVideoUrl } from '@/lib/api/endpoints'
import type { Project } from '@/types/database'
import { ApiError } from '@/lib/api/types'

interface VideoStepProps {
  project: Project
  onComplete: () => void
}

export function VideoStep({ project, onComplete }: VideoStepProps) {
  const router = useRouter()
  const updateProject = useUpdateProject()
  const uploadVideo = useUploadProjectVideo()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('Ready to generate video')
  const [isComplete, setIsComplete] = useState(false)
  
  const handleGenerate = async () => {
    const manifest = project.data.manifest
    if (!manifest) {
      setError('No manifest found. Please go back and generate a manifest.')
      return
    }
    
    setIsGenerating(true)
    setError(null)
    setProgress('Starting video generation...')
    
    try {
      // Update project status
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: {
          status: 'generating'
        }
      })
      
      // Generate video
      setProgress('Rendering animations...')
      const response = await manifestToVideo(manifest)
      
      // Download the video
      setProgress('Downloading video...')
      const requestId = extractRequestId(response.download_url)
      const filename = extractVideoFilename(response.download_url)
      const videoBlob = await downloadVideo(requestId, filename)
      
      // Upload to Supabase storage
      setProgress('Saving video...')
      await uploadVideo.mutateAsync({
        projectId: project.id,
        videoBlob,
        videoUrl: buildVideoUrl(response.download_url)
      })
      
      setIsComplete(true)
      setProgress('Video generated successfully!')
      
      // Mark as complete
      onComplete()
      
      // Redirect to video page after a short delay
      setTimeout(() => {
        router.push(`/project/${project.id}/video`)
      }, 1500)
      
    } catch (err) {
      console.error('Failed to generate video:', err)
      
      // Update project status to failed
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: {
          status: 'failed',
          data: {
            ...project.data,
            lastError: {
              message: err instanceof Error ? err.message : 'Unknown error',
              detail: err instanceof ApiError ? err.detail : undefined,
              timestamp: new Date().toISOString()
            }
          }
        }
      })
      
      if (err instanceof ApiError) {
        setError(`API Error: ${err.message}${err.detail ? `\n\nDetails: ${err.detail}` : ''}`)
      } else {
        setError('Failed to generate video. Please try again.')
      }
      
      setIsGenerating(false)
    }
  }
  
  const canGenerate = project.data.manifest && !isGenerating && !isComplete
  
  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
            {isComplete ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <Video className="h-8 w-8 text-purple-600" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">
              {isComplete ? 'Video Generated!' : 'Ready to Generate Video'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isComplete 
                ? 'Your video has been generated and saved.'
                : 'Click the button below to generate your educational video from the manifest.'
              }
            </p>
          </div>
          
          {isGenerating && (
            <div className="space-y-2">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600" />
              <p className="text-sm text-gray-600">{progress}</p>
              <p className="text-xs text-gray-500">This may take up to 5 minutes...</p>
            </div>
          )}
        </div>
      </Card>
      
      {error && (
        <div className="rounded-lg bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800">Generation Failed</h4>
            <pre className="mt-1 text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
        </div>
      )}
      
      <div className="flex justify-center">
        {isComplete ? (
          <Button 
            onClick={() => router.push(`/project/${project.id}/video`)}
            size="lg"
          >
            <Video className="mr-2 h-4 w-4" />
            Watch Video
          </Button>
        ) : (
          <Button 
            onClick={handleGenerate} 
            disabled={!canGenerate}
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
