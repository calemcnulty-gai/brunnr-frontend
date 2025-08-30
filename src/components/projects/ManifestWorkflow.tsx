/**
 * @fileoverview Manifest workflow component (placeholder)
 * @module components/projects/ManifestWorkflow
 */

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import type { Project } from '@/types/database'

interface ManifestWorkflowProps {
  project: Project
}

export function ManifestWorkflow({ project }: ManifestWorkflowProps) {
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
        <p className="text-gray-600">Create video from custom manifest</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Manifest Editor
          </CardTitle>
          <CardDescription>
            This workflow is coming soon! For now, please use Quick Generation.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600">
            The manifest editor will allow you to:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Import existing manifest JSON files</li>
            <li>• Create custom animations and templates</li>
            <li>• Define shot sequences and timing</li>
            <li>• Preview individual shots</li>
            <li>• Generate videos directly from manifest</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
