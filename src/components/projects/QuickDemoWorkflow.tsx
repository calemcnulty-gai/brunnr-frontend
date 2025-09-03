/**
 * @fileoverview Quick Demo workflow component - demonstrates video generation with a pre-built manifest
 * @module components/projects/QuickDemoWorkflow
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Sparkles, AlertCircle, Loader2, ArrowLeft, Eye, Code, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { useUpdateProject, useUploadProjectVideo } from '@/hooks/use-projects'
import { manifestToVideo, downloadVideo, extractRequestId, extractVideoFilename, buildVideoUrl } from '@/lib/api/endpoints'
import type { Project } from '@/types/database'
import { ApiError } from '@/lib/api/types'
import demoManifestData from '../../../demo-manifest.json'
import type { Manifest } from '@/types/api'

interface QuickDemoWorkflowProps {
  project: Project
}

interface ManifestSection {
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
}

export function QuickDemoWorkflow({ project }: QuickDemoWorkflowProps) {
  const router = useRouter()
  const updateProject = useUpdateProject()
  const uploadVideo = useUploadProjectVideo()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('Ready to demonstrate')
  const [expandedSection, setExpandedSection] = useState<string | null>('overview')
  
  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      // Update project status
      setProgress('Preparing demonstration...')
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: {
          status: 'generating',
          data: { 
            ...project.data,
            demoType: 'demorgan-laws',
            manifestFile: 'demo-manifest.json'
          } as any
        }
      })
      
      // Generate video from the demo manifest
      setProgress('Sending manifest to video renderer...')
      // Convert the demo manifest to the expected format
      const manifest: Manifest = {
        video_id: demoManifestData.video_id,
        templates: demoManifestData.templates.map(t => {
          const template: any = {
            id: t.id,
            type: t.type
          }
          
          // Handle content based on type
          if ('content' in t) {
            template.content = typeof t.content === 'string' ? t.content : JSON.stringify(t.content)
          }
          
          // Preserve parts field for MathTex_aligned
          if ('parts' in t) {
            template.parts = (t as any).parts
          }
          
          // Preserve style and other fields
          if ('style' in t) {
            template.style = (t as any).style
          }
          
          if ('labels' in t) {
            template.labels = (t as any).labels
          }
          
          return template
        }),
        shots: demoManifestData.shots as any
      }
      const response = await manifestToVideo(manifest)
      
      // Update progress based on response
      setProgress('Processing video generation...')
      // Since ManifestToVideoResponse doesn't have processing_phases,
      // we'll just show generic progress
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProgress('Rendering animations with Manim...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProgress('Generating voiceover and compositing...')
      
      // Download the video
      setProgress('Downloading completed video...')
      const requestId = extractRequestId(response.download_url)
      const filename = extractVideoFilename(response.download_url)
      const videoBlob = await downloadVideo(requestId, filename)
      
      // Upload to storage
      setProgress('Saving video to project...')
      await uploadVideo.mutateAsync({
        projectId: project.id,
        videoBlob,
        videoUrl: buildVideoUrl(response.download_url)
      })
      
      // Navigate to video page
      router.push(`/project/${project.id}/video`)
      
    } catch (err) {
      console.error('Demo generation error:', err)
      
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
      
      setError(err instanceof Error ? err.message : 'Failed to generate demo video')
      setIsGenerating(false)
    }
  }
  
  const manifestSections: ManifestSection[] = [
    {
      title: 'Overview',
      description: 'Understanding the manifest structure',
      icon: <Info className="h-4 w-4" />,
      content: (
        <div className="space-y-3 text-sm">
          <p className="text-gray-600">
            The manifest is a JSON document that describes every aspect of the video to be generated. 
            It contains two main sections:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li><strong>Templates:</strong> Reusable visual elements and styles</li>
            <li><strong>Shots:</strong> Sequential scenes with actions and voiceover</li>
          </ul>
          <p className="text-gray-600">
            This demo manifest creates an educational video about DeMorgan's Laws in set theory, 
            featuring animated mathematical visualizations.
          </p>
        </div>
      )
    },
    {
      title: 'Templates',
      description: `${demoManifestData.templates.length} reusable visual elements`,
      icon: <Code className="h-4 w-4" />,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Templates define reusable visual elements that can be instantiated multiple times in different shots:
          </p>
          <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
            <pre className="text-xs font-mono text-gray-700">
              {JSON.stringify(demoManifestData.templates.slice(0, 3), null, 2)}
            </pre>
          </div>
          <p className="text-xs text-gray-500">
            Showing first 3 of {demoManifestData.templates.length} templates
          </p>
        </div>
      )
    },
    {
      title: 'Shots',
      description: `${demoManifestData.shots.length} animated scenes`,
      icon: <Video className="h-4 w-4" />,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Each shot represents a scene in the video with specific actions and voiceover:
          </p>
          <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
            <pre className="text-xs font-mono text-gray-700">
              {JSON.stringify(demoManifestData.shots[0], null, 2)}
            </pre>
          </div>
          <p className="text-xs text-gray-500">
            Showing shot 1 of {demoManifestData.shots.length}. Each shot contains actions (animations) and voiceover text.
          </p>
        </div>
      )
    },
    {
      title: 'Generation Process',
      description: 'How the manifest becomes a video',
      icon: <Sparkles className="h-4 w-4" />,
      content: (
        <div className="space-y-3 text-sm">
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li><strong>Audio Generation:</strong> Voiceover text is converted to speech using AI</li>
            <li><strong>Animation Creation:</strong> Visual elements are animated using Manim (Mathematical Animation Engine)</li>
            <li><strong>Synchronization:</strong> Actions are timed to match the voiceover</li>
            <li><strong>Rendering:</strong> All elements are composited into the final MP4 video</li>
          </ol>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> This process typically takes 3-5 minutes depending on video complexity.
            </p>
          </div>
        </div>
      )
    }
  ]
  
  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title)
  }
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
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
        <p className="text-gray-600">Demo video generation with pre-built manifest</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            Quick Demo - DeMorgan's Laws
          </CardTitle>
          <CardDescription>
            This demonstration uses a pre-built manifest to showcase the complete video generation pipeline
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Manifest Sections */}
          <div className="space-y-2">
            {manifestSections.map((section) => (
              <div key={section.title} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <div className="text-left">
                      <div className="font-medium text-sm">{section.title}</div>
                      <div className="text-xs text-gray-500">{section.description}</div>
                    </div>
                  </div>
                  {expandedSection === section.title ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {expandedSection === section.title && (
                  <div className="px-4 py-3 border-t bg-white">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">Generation Failed</h4>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {/* Progress Display */}
          {isGenerating && (
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">{progress}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Generating educational video about DeMorgan's Laws...
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Demo Video...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Demo Video
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            This will generate a ~2 minute educational video demonstrating set theory concepts
          </p>
        </CardContent>
      </Card>
      
      {/* Additional Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 text-base">About This Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700">
            This demonstration showcases the full capabilities of the Brunnr video generation system. 
            The manifest describes complex mathematical animations that will be rendered using Manim, 
            synchronized with AI-generated voiceover to create an engaging educational video.
          </p>
          <p className="text-sm text-blue-700 mt-2">
            Once the API's manifest generation is fixed, you'll be able to create similar videos 
            from any educational question using the Quick Generate feature.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
