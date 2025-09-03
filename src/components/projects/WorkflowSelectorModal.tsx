/**
 * @fileoverview WorkflowSelectorModal component for choosing project workflow type
 * @module components/projects/WorkflowSelectorModal
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Video, Layers, FileText, ArrowRight, Loader2 } from 'lucide-react'
import { useCreateProject } from '@/hooks/use-projects'
import type { WorkflowType } from '@/types/database'

interface WorkflowSelectorModalProps {
  open: boolean
  onClose: () => void
}

interface WorkflowOption {
  type: WorkflowType
  title: string
  description: string
  icon: React.ReactNode
  color: string
  features: string[]
}

const workflowOptions: WorkflowOption[] = [
  {
    type: 'quick',
    title: 'Quick Demo',
    description: 'Experience video generation with a pre-built DeMorgan\'s Laws example',
    icon: <Video className="h-8 w-8" />,
    color: 'text-purple-600 bg-purple-50',
    features: [
      'Pre-built manifest example',
      'Shows generation pipeline',
      'DeMorgan\'s Laws demo',
      'Learn how it works'
    ]
  },
  {
    type: 'step-by-step',
    title: 'Step-by-Step Pipeline',
    description: 'Full control over each phase of video generation',
    icon: <Layers className="h-8 w-8" />,
    color: 'text-purple-600 bg-purple-50',
    features: [
      'Edit explanation',
      'Review screenplay',
      'Customize manifest',
      'Perfect for complex topics'
    ]
  },
  {
    type: 'manifest',
    title: 'From Manifest',
    description: 'Start with a custom manifest for full creative control',
    icon: <FileText className="h-8 w-8" />,
    color: 'text-green-600 bg-green-50',
    features: [
      'Import existing manifest',
      'Direct manifest editing',
      'Skip content generation',
      'For advanced users'
    ]
  }
]

export function WorkflowSelectorModal({ open, onClose }: WorkflowSelectorModalProps) {
  const router = useRouter()
  const createProject = useCreateProject()
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>('quick') // Default to Quick Demo
  const [projectName, setProjectName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleCreateProject = async () => {
    if (!selectedWorkflow || !projectName.trim()) {
      setError('Please select a workflow and enter a project name')
      return
    }
    
    setIsCreating(true)
    setError(null)
    
    try {
      const project = await createProject.mutateAsync({
        name: projectName.trim(),
        workflow_type: selectedWorkflow,
        data: {}
      })
      
      // Navigate to the project page
      router.push(`/project/${project.id}`)
      onClose()
    } catch (err) {
      setError('Failed to create project. Please try again.')
      setIsCreating(false)
    }
  }
  
  const handleWorkflowSelect = (type: WorkflowType) => {
    setSelectedWorkflow(type)
    setError(null)
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Choose a workflow that best fits your needs
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Workflow Selection */}
          <div className="grid gap-4">
            {workflowOptions.map((option) => (
              <Card
                key={option.type}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedWorkflow === option.type ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleWorkflowSelect(option.type)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-3 ${option.color}`}>
                        {option.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{option.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {option.description}
                        </CardDescription>
                      </div>
                    </div>
                    {selectedWorkflow === option.type && (
                      <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                {selectedWorkflow === option.type && (
                  <CardContent>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          
          {/* Project Name Input */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="Enter a name for your project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && projectName.trim()) {
                  handleCreateProject()
                }
              }}
            />
          </div>
          
          {/* Error Display */}
          {error && (
            <p className="text-sm text-red-600 animate-in slide-in-from-bottom-2">
              {error}
            </p>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!selectedWorkflow || !projectName.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
