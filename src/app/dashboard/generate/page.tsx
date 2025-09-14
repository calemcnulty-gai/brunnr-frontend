"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, FileText, BookOpen, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useCreateProject } from '@/hooks/use-projects';
import type { WorkflowType } from '@/types/database';

interface WorkflowOption {
  type: WorkflowType;
  title: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  recommended?: boolean;
}

const workflowOptions: WorkflowOption[] = [
  {
    type: 'quick',
    title: 'Quick Demo',
    description: 'Experience video generation with a pre-built example',
    longDescription: 'Perfect for first-time users who want to see how the video generation pipeline works. Uses a pre-built DeMorgan\'s Laws example to demonstrate the full process.',
    icon: <Video className="h-8 w-8" />,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    features: [
      'Pre-built manifest example',
      'Shows complete generation pipeline',
      'DeMorgan\'s Laws educational demo',
      'Perfect for learning the system'
    ],
    recommended: true
  },
  {
    type: 'lesson',
    title: 'Lesson to Video',
    description: 'Convert educational lessons directly into videos',
    longDescription: 'Transform structured educational content from our lesson library into engaging videos. Great for educators working with curriculum-based content.',
    icon: <BookOpen className="h-8 w-8" />,
    color: 'text-green-600 bg-green-50 border-green-200',
    features: [
      'Select from curated lesson library',
      'HTML content rendering',
      'Direct video generation',
      'Educational content focus'
    ]
  },
  {
    type: 'manifest',
    title: 'From Manifest',
    description: 'Start with a custom manifest for full creative control',
    longDescription: 'Advanced users can import or create custom manifests directly. Skip the content generation phase and jump straight to video rendering with your own specifications.',
    icon: <FileText className="h-8 w-8" />,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    features: [
      'Import existing manifests',
      'Direct manifest editing',
      'Skip content generation phase',
      'For advanced users'
    ]
  }
];

export default function GeneratePage() {
  const router = useRouter();
  const createProject = useCreateProject();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  
  const handleQuickWorkflow = async (workflowType: WorkflowType, baseProjectName: string) => {
    if (isCreatingProject) return;
    
    setIsCreatingProject(true);
    try {
      // Add timestamp to make project names unique
      const timestamp = new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const projectName = `${baseProjectName} - ${timestamp}`;
      
      const project = await createProject.mutateAsync({
        name: projectName,
        workflow_type: workflowType,
        data: {}
      });
      
      // Navigate to the project page
      router.push(`/project/${project.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      // Fallback to showing the modal if there's an error
      // setShowWorkflowModal(true);
    } finally {
      setIsCreatingProject(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generate Video</h1>
          <p className="mt-2 text-gray-600">
            Choose a workflow to start creating your educational video
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/projects')}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          View Projects
        </Button>
      </div>

      {/* Workflow Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {workflowOptions.map((option) => (
          <Card 
            key={option.type} 
            className={`relative hover:shadow-lg transition-all duration-200 border-2 ${option.color}`}
          >
            {option.recommended && (
              <div className="absolute -top-3 left-4">
                <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Recommended
                </span>
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`rounded-xl p-3 ${option.color}`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{option.title}</CardTitle>
                  <CardDescription className="text-base">
                    {option.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                {option.longDescription}
              </p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Key Features:</h4>
                <ul className="space-y-1">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button
                onClick={() => handleQuickWorkflow(option.type, option.title)}
                disabled={isCreatingProject}
                className="w-full mt-4"
                variant={option.recommended ? "default" : "outline"}
              >
                {isCreatingProject ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    Start {option.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-100 p-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">New to video generation?</h3>
              <p className="text-gray-600 mb-3">
                Start with the <strong>Quick Demo</strong> to see how the system works, then explore other workflows as you become more comfortable with the platform.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickWorkflow('quick', 'Quick Demo')}
                disabled={isCreatingProject}
              >
                Try Quick Demo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
