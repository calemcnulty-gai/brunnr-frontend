/**
 * @fileoverview Video player page for completed projects
 * @module app/project/[id]/video
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useProject } from '@/hooks/use-projects'
import { VideoPlayer } from '@/components/projects/VideoPlayer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Loader2 } from 'lucide-react'
import { getVideoUrl } from '@/lib/supabase/queries'
import { useEffect, useState } from 'react'

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { data: project, isLoading, error } = useProject(projectId)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchVideoUrl() {
      if (project?.video_storage_path) {
        try {
          const url = await getVideoUrl(project.video_storage_path)
          setVideoUrl(url)
        } catch (err) {
          console.error('Failed to get video URL:', err)
          setUrlError('Failed to load video')
          // Fallback to API URL if storage fails
          if (project.video_url) {
            setVideoUrl(project.video_url)
            setUrlError(null)
          }
        }
      } else if (project?.video_url) {
        // Use API URL directly if no storage path
        setVideoUrl(project.video_url)
      }
    }
    
    fetchVideoUrl()
  }, [project])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }
  
  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
        <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    )
  }
  
  if (!videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Video Not Available</h1>
        <p className="text-gray-600 mb-4">
          {urlError || 'This project doesn\'t have a completed video yet.'}
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/project/${projectId}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Continue Project
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
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
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600">
              Generated on {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/project/${projectId}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Project
          </Button>
        </div>
      </div>
      
      <VideoPlayer
        videoUrl={videoUrl}
        projectName={project.name}
        projectData={project.data}
      />
    </div>
  )
}
