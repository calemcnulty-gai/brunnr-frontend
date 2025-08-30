/**
 * @fileoverview Step-by-Step workflow component
 * @module components/projects/StepByStepWorkflow
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check, Layers, Loader2 } from 'lucide-react'
import { useUpdateProject } from '@/hooks/use-projects'
import { useProjectStore } from '@/stores/project-store'
import { QuestionStep } from './steps/QuestionStep'
import { ExplanationStep } from './steps/ExplanationStep'
import { ScreenplayStep } from './steps/ScreenplayStep'
import { ManifestStep } from './steps/ManifestStep'
import { VideoStep } from './steps/VideoStep'
import type { Project, StepType } from '@/types/database'
import { cn } from '@/lib/utils'

interface StepByStepWorkflowProps {
  project: Project
}

interface WorkflowStep {
  id: StepType
  title: string
  description: string
}

const workflowSteps: WorkflowStep[] = [
  { id: 'question', title: 'Question', description: 'Enter your educational question' },
  { id: 'explanation', title: 'Explanation', description: 'Review and edit the explanation' },
  { id: 'screenplay', title: 'Screenplay', description: 'Review the video script' },
  { id: 'manifest', title: 'Manifest', description: 'Customize animations' },
  { id: 'video', title: 'Video', description: 'Generate and download' }
]

export function StepByStepWorkflow({ project }: StepByStepWorkflowProps) {
  const router = useRouter()
  const updateProject = useUpdateProject()
  const { setCurrentProject, currentProject, updateDraftData } = useProjectStore()
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<StepType>>(new Set())
  
  // Initialize project store
  useEffect(() => {
    setCurrentProject(project)
    
    // Determine current step from project
    if (project.current_step) {
      const stepIndex = workflowSteps.findIndex(s => s.id === project.current_step)
      if (stepIndex !== -1) {
        setCurrentStepIndex(stepIndex)
        
              // Mark previous steps as completed
      const completed = new Set<StepType>()
      for (let i = 0; i < stepIndex; i++) {
        const step = workflowSteps[i]
        if (step) {
          completed.add(step.id)
        }
      }
      setCompletedSteps(completed)
      }
    }
  }, [project, setCurrentProject])
  
  // Redirect to video page if complete
  useEffect(() => {
    if (project.status === 'completed' && project.video_url) {
      router.push(`/project/${project.id}/video`)
    }
  }, [project, router])
  
  const currentStep = workflowSteps[currentStepIndex]
  
  const handleStepComplete = (stepId: StepType) => {
    setCompletedSteps(prev => new Set([...Array.from(prev), stepId]))
    
    // Move to next step if not at the end
    if (currentStepIndex < workflowSteps.length - 1) {
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)
      
      // Update project current step
      const nextStep = workflowSteps[nextIndex]
      if (nextStep) {
        updateProject.mutate({
          projectId: project.id,
          updates: {
            current_step: nextStep.id
          }
        })
      }
    }
  }
  
  const handleStepClick = (index: number) => {
    // Can only go to completed steps or the next step
    if (index <= completedSteps.size) {
      setCurrentStepIndex(index)
      
      // Update project current step
      const targetStep = workflowSteps[index]
      if (targetStep) {
        updateProject.mutate({
          projectId: project.id,
          updates: {
            current_step: targetStep.id
          }
        })
      }
    }
  }
  
  const renderStepContent = () => {
    if (!currentStep) return null
    
    switch (currentStep.id) {
      case 'question':
        return <QuestionStep project={currentProject || project} onComplete={() => handleStepComplete('question')} />
      case 'explanation':
        return <ExplanationStep project={currentProject || project} onComplete={() => handleStepComplete('explanation')} />
      case 'screenplay':
        return <ScreenplayStep project={currentProject || project} onComplete={() => handleStepComplete('screenplay')} />
      case 'manifest':
        return <ManifestStep project={currentProject || project} onComplete={() => handleStepComplete('manifest')} />
      case 'video':
        return <VideoStep project={currentProject || project} onComplete={() => handleStepComplete('video')} />
      default:
        return null
    }
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
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
        <p className="text-gray-600">Step-by-step video generation pipeline</p>
      </div>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {workflowSteps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id)
            const isCurrent = index === currentStepIndex
            const isClickable = index <= completedSteps.size
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    "flex flex-col items-center group",
                    isClickable && "cursor-pointer",
                    !isClickable && "cursor-not-allowed opacity-50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isCompleted && "bg-green-600 text-white",
                    isCurrent && !isCompleted && "bg-purple-600 text-white",
                    !isCompleted && !isCurrent && "bg-gray-200 text-gray-500"
                  )}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "mt-2 text-sm font-medium transition-colors",
                    (isCompleted || isCurrent) && "text-gray-900",
                    !isCompleted && !isCurrent && "text-gray-500"
                  )}>
                    {step.title}
                  </span>
                </button>
                
                {index < workflowSteps.length - 1 && (() => {
                  const nextStep = workflowSteps[index + 1]
                  if (!nextStep) return null
                  return (
                    <div className={cn(
                      "flex-1 h-0.5 mx-4 transition-colors",
                      completedSteps.has(nextStep.id) ? "bg-green-600" : "bg-gray-200"
                    )} />
                  )
                })()}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600" />
            {currentStep.title}
          </CardTitle>
          <CardDescription>
            {currentStep.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  )
}
