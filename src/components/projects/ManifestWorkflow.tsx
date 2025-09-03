/**
 * @fileoverview Manifest workflow component with full editor
 * @module components/projects/ManifestWorkflow
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileJson, Sparkles, BookOpen, Loader2 } from 'lucide-react'
import { ManifestEditor } from '@/components/forms/ManifestEditor'
import { TemplateLibrary } from '@/components/templates/TemplateLibrary'
import { useUpdateProject, useUploadProjectVideo } from '@/hooks/use-projects'
import { manifestToVideo, downloadVideo, extractRequestId, extractVideoFilename, buildVideoUrl } from '@/lib/api/endpoints'
import type { Project } from '@/types/database'
import type { Manifest } from '@/lib/validation/manifest'
import { ApiError, type ManifestToVideoRequest } from '@/lib/api/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface ManifestWorkflowProps {
  project: Project
}

export function ManifestWorkflow({ project }: ManifestWorkflowProps) {
  const router = useRouter()
  const updateProject = useUpdateProject()
  const uploadVideo = useUploadProjectVideo()
  
  const [manifest, setManifest] = useState<Manifest | undefined>(
    project.data?.manifest as Manifest | undefined
  )
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')
  
  // Handle manifest save
  const handleSaveManifest = async (newManifest: Manifest) => {
    try {
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: {
          data: {
            ...project.data,
            manifest: newManifest
          }
        }
      })
      setManifest(newManifest)
    } catch (err) {
      console.error('Failed to save manifest:', err)
      throw err
    }
  }
  
  // Handle template selection
  const handleSelectTemplate = (templateManifest: Manifest) => {
    setManifest(templateManifest)
    setShowTemplateLibrary(false)
  }
  
  // Generate video from manifest
  const handleGenerateVideo = async () => {
    if (!manifest) {
      setError('Please create or load a manifest first')
      return
    }
    
    setIsGenerating(true)
    setError(null)
    setProgress('Validating manifest...')
    
    try {
      // Save manifest first
      setProgress('Saving manifest...')
      await handleSaveManifest(manifest)
      
      // Update project status
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: {
          status: 'generating',
          data: {
            ...project.data,
            manifest
          }
        }
      })
      
      // Generate video from manifest
      setProgress('Generating video from manifest...')
      // Convert our Manifest type to the API's ManifestToVideoRequest type
      const apiManifest: ManifestToVideoRequest = {
        video_id: manifest.video_id,
        templates: manifest.templates.map(t => ({
          id: t.id,
          type: t.type,
          content: typeof t.content === 'string' ? t.content : undefined,
          style: t.style
        })),
        shots: manifest.shots.map(s => ({
          voiceover: s.voiceover,
          actions: s.actions,
          duration: s.duration,
          allow_bleed_over: s.allow_bleed_over
        }))
      }
      const response = await manifestToVideo(apiManifest)
      
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
        setError(`API Error: ${err.message}${err.detail ? `\n\nDetails: ${err.detail}` : ''}`)
      } else {
        setError('Failed to generate video from manifest. Please check your manifest and try again.')
      }
    } finally {
      setIsGenerating(false)
      setProgress('')
    }
  }
  
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
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
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600">Create video from custom manifest</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTemplateLibrary(true)}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Template Library
            </Button>
            
            <Button
              onClick={handleGenerateVideo}
              disabled={!manifest || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Video
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Generation Failed</AlertTitle>
          <AlertDescription>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Progress Alert */}
      {isGenerating && progress && (
        <Alert className="mb-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Generating Video</AlertTitle>
          <AlertDescription>{progress}</AlertDescription>
        </Alert>
      )}
      
      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Template Library</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplateLibrary(false)}
                >
                  ✕
                </Button>
              </div>
              <CardDescription>
                Choose a template to get started quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateLibrary
                onSelectTemplate={handleSelectTemplate}
                onClose={() => setShowTemplateLibrary(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Manifest Editor */}
      <ManifestEditor
        initialManifest={manifest}
        onChange={setManifest}
        onSave={handleSaveManifest}
      />
      
      {/* Instructions Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-green-600" />
            How to Use the Manifest Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Visual Builder</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Drag and drop to reorder shots</li>
                <li>• Add templates with various types (Text, Math, Shapes)</li>
                <li>• Define actions like FadeIn, Transform, and more</li>
                <li>• Set voiceover text for each shot</li>
                <li>• Configure timing and duration</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">JSON Editor</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Full control over manifest structure</li>
                <li>• Syntax highlighting and validation</li>
                <li>• Import/export JSON files</li>
                <li>• Copy manifest to clipboard</li>
                <li>• Real-time error checking</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Start with a template from the library, then customize it using either the visual builder or JSON editor. Your changes are validated in real-time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}