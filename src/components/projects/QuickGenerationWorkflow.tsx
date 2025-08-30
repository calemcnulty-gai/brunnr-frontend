/**
 * @fileoverview Quick Generation workflow component
 * @module components/projects/QuickGenerationWorkflow
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Video, Sparkles, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { useUpdateProject, useUploadProjectVideo } from '@/hooks/use-projects'
import { questionToVideo, downloadVideo, extractRequestId, extractVideoFilename, buildVideoUrl } from '@/lib/api/endpoints'
import type { Project } from '@/types/database'
import { ApiError } from '@/lib/api/types'

interface QuickGenerationWorkflowProps {
  project: Project
}

export function QuickGenerationWorkflow({ project }: QuickGenerationWorkflowProps) {
  const router = useRouter()
  const updateProject = useUpdateProject()
  const uploadVideo = useUploadProjectVideo()
  
  const [question, setQuestion] = useState(project.data.question || '')
  const [context, setContext] = useState(project.data.context || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('Waiting to start...')
  
  const handleGenerate = async () => {
    if (!question.trim()) {
      setError('Please enter a question')
      return
    }
    
    setIsGenerating(true)
    setError(null)
    
    try {
      // Update project with question data and status
      setProgress('Saving question...')
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: {
          status: 'generating',
          data: { 
            ...project.data,
            question: question.trim(),
            context: context.trim() || undefined
          }
        }
      })
      
      // Call API to generate video
      setProgress('Generating explanation...')
      const response = await questionToVideo({
        text: question.trim(),
        context: context.trim() || undefined
      })
      
      // Update progress based on processing phases
      if (response.processing_phases) {
        for (const phase of response.processing_phases) {
          if (phase.phase_name === 'content_generation') {
            setProgress('Creating screenplay...')
          } else if (phase.phase_name === 'audio_generation') {
            setProgress('Generating voiceover...')
          } else if (phase.phase_name === 'video_rendering') {
            setProgress('Rendering video...')
          }
        }
      }
      
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
      
      // Navigate to video page
      router.push(`/project/${project.id}/video`)
      
    } catch (err) {
      console.error('Generation error:', err)
      
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
        // Handle specific API errors with user-friendly messages
        if (err.detail?.includes('No voiceover text found')) {
          setError(
            'The AI was unable to generate content for your question. This can happen if:\n\n' +
            '• The question is too vague or short\n' +
            '• The topic is not well-suited for educational video\n' +
            '• There was a temporary issue with content generation\n\n' +
            'Try rephrasing your question with more detail, or add context to guide the explanation.'
          )
        } else {
          setError(`API Error: ${err.message}${err.detail ? `\n\nDetails: ${err.detail}` : ''}`)
        }
      } else {
        setError('Failed to generate video. Please try again.')
      }
      
      setIsGenerating(false)
    }
  }
  
  const canGenerate = question.trim() && !isGenerating
  
  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
        <p className="text-gray-600">Quick video generation from a single question</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-600" />
            Quick Generation
          </CardTitle>
          <CardDescription>
            Enter your question and we'll create an educational video automatically
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question">Your Question *</Label>
            <Textarea
              id="question"
              placeholder="e.g., What is the Pythagorean theorem?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isGenerating}
              className="min-h-[100px]"
            />
            <p className="text-sm text-gray-500">
              Ask any educational question you'd like explained in a video
            </p>
            <details className="text-sm text-gray-500 mt-2">
              <summary className="cursor-pointer hover:text-gray-700">See example questions</summary>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• What is the Pythagorean theorem and how do you use it?</li>
                <li>• How does photosynthesis work in plants?</li>
                <li>• What is the difference between velocity and acceleration?</li>
                <li>• How do you calculate the area of a circle?</li>
                <li>• What causes the seasons on Earth?</li>
              </ul>
            </details>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="context">Context (Optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g., Explain for high school geometry students"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              disabled={isGenerating}
              className="min-h-[80px]"
            />
            <p className="text-sm text-gray-500">
              Provide additional context to tailor the explanation
            </p>
          </div>
          
          {error && (
            <div className="rounded-lg bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">Generation Failed</h4>
                <pre className="mt-1 text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
              </div>
            </div>
          )}
          
          {isGenerating && (
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">{progress}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    This may take up to 5 minutes for complex topics
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {project.data.lastError && !isGenerating && (
        <Card className="mt-4 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 text-base">Previous Attempt Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700">
              {project.data.lastError.message}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              {new Date(project.data.lastError.timestamp).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
