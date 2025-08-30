/**
 * @fileoverview Main project workflow page
 * @module app/project/[id]
 */

'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProject } from '@/hooks/use-projects'
import { QuickGenerationWorkflow } from '@/components/projects/QuickGenerationWorkflow'
import { StepByStepWorkflow } from '@/components/projects/StepByStepWorkflow'
import { ManifestWorkflow } from '@/components/projects/ManifestWorkflow'
import { Loader2 } from 'lucide-react'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { data: project, isLoading, error } = useProject(projectId)
  
  useEffect(() => {
    // Redirect to video page if project is complete
    if (project?.status === 'completed' && project.video_url) {
      router.push(`/project/${projectId}/video`)
    }
  }, [project, projectId, router])
  
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
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:text-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }
  
  // Render appropriate workflow based on project type
  switch (project.workflow_type) {
    case 'quick':
      return <QuickGenerationWorkflow project={project} />
    case 'step-by-step':
      return <StepByStepWorkflow project={project} />
    case 'manifest':
      return <ManifestWorkflow project={project} />
    default:
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Unknown workflow type</p>
        </div>
      )
  }
}
