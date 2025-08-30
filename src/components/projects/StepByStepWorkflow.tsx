/**
 * @fileoverview Step-by-Step workflow component (placeholder)
 * @module components/projects/StepByStepWorkflow
 */

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Layers } from 'lucide-react'
import type { Project } from '@/types/database'

interface StepByStepWorkflowProps {
  project: Project
}

export function StepByStepWorkflow({ project }: StepByStepWorkflowProps) {
  const router = useRouter()
  
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
        <p className="text-gray-600">Step-by-step video generation pipeline</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600" />
            Step-by-Step Pipeline
          </CardTitle>
          <CardDescription>
            This workflow is coming soon! For now, please use Quick Generation.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600">
            The step-by-step pipeline will allow you to:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Enter your question and generate an explanation</li>
            <li>• Edit and refine the explanation</li>
            <li>• Review and modify the screenplay</li>
            <li>• Customize the manifest with animations</li>
            <li>• Generate the final video with full control</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
