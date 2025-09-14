"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Video, BookOpen, FileText, Loader2 } from 'lucide-react';
import { useProjects, useDeleteProject, useCreateProject } from '@/hooks/use-projects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import type { WorkflowType } from '@/types/database';

export default function DashboardPage() {
  const router = useRouter();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const createProject = useCreateProject();
  
  const recentProjects = projects?.slice(0, 6) || [];
  
  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject.mutateAsync(projectId);
    }
  };
  
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
        alert('Failed to create project. Please try again.');
      } finally {
        setIsCreatingProject(false);
      }
    };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Create a new video or manage your existing projects.
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/generate')}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600" />
              <CardTitle>Quick Demo</CardTitle>
            </div>
            <CardDescription>
              See how video generation works with a demo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => handleQuickWorkflow('quick', 'Quick Demo')}
              disabled={isCreatingProject}
            >
              {isCreatingProject ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Start Generating'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <CardTitle>From Lesson</CardTitle>
            </div>
            <CardDescription>
              Convert educational lessons into videos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleQuickWorkflow('lesson', 'From Lesson')}
              disabled={isCreatingProject}
            >
              {isCreatingProject ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Choose Lesson'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <CardTitle>From Manifest</CardTitle>
            </div>
            <CardDescription>
              Start with a custom manifest file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleQuickWorkflow('manifest', 'From Manifest')}
              disabled={isCreatingProject}
            >
              {isCreatingProject ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Upload Manifest'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>
            Your latest video generation projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Video className="h-12 w-12 mb-4 text-gray-300" />
              <p>No projects yet. Create your first video to get started!</p>
              <Button className="mt-4" onClick={() => router.push('/dashboard/generate')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
