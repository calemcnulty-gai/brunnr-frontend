/**
 * @fileoverview ProjectCard component for displaying project summaries
 * @module components/projects/ProjectCard
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Clock, AlertCircle, CheckCircle, Loader2, MoreVertical, Trash2, Play, Edit } from 'lucide-react'
import type { Project, ProjectStatus, WorkflowType } from '@/types/database'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  onDelete?: (id: string) => void
  className?: string
}

const statusConfig: Record<ProjectStatus, { label: string; icon: React.ReactNode; color: string }> = {
  created: { label: 'Created', icon: <Clock className="h-4 w-4" />, color: 'text-gray-500' },
  in_progress: { label: 'In Progress', icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-blue-500' },
  generating: { label: 'Generating', icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-purple-500' },
  completed: { label: 'Completed', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-500' },
  failed: { label: 'Failed', icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-500' },
}

const workflowLabels: Record<WorkflowType, string> = {
  'quick': 'Quick Generation',
  'step-by-step': 'Step-by-Step',
  'manifest': 'From Manifest',
  'lesson': 'Lesson-based',
}

export function ProjectCard({ project, onDelete, className }: ProjectCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  
  const status = statusConfig[project.status]
  const isComplete = project.status === 'completed'
  const canContinue = ['created', 'in_progress', 'failed'].includes(project.status)
  
  const handleContinue = () => {
    if (isComplete && project.video_url) {
      router.push(`/project/${project.id}/video`)
    } else {
      router.push(`/project/${project.id}`)
    }
  }
  
  const handleDelete = async () => {
    if (!onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete(project.id)
    } catch (error) {
      console.error('Failed to delete project:', error)
      setIsDeleting(false)
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    )
  }
  
  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span className="text-xs">{workflowLabels[project.workflow_type]}</span>
              <span>•</span>
              <span className="text-xs">{formatDate(project.updated_at)}</span>
            </CardDescription>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-10 w-48 rounded-md border bg-white shadow-md">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete Project
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {project.data.question && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.data.question}
            </p>
          )}
          
          <div className={cn('flex items-center gap-2 text-sm', status.color)}>
            {status.icon}
            <span>{status.label}</span>
            {project.current_step && (
              <>
                <span>•</span>
                <span className="capitalize">{project.current_step}</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="gap-2">
        {isComplete ? (
          <>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handleContinue}
            >
              <Play className="mr-2 h-4 w-4" />
              Watch Video
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/project/${project.id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </>
        ) : canContinue ? (
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={handleContinue}
          >
            Continue Project
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
