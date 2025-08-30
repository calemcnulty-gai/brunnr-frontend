"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Video, Layers, FileText, Loader2 } from 'lucide-react';
import { useProjects, useDeleteProject } from '@/hooks/use-projects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { WorkflowSelectorModal } from '@/components/projects/WorkflowSelectorModal';

export default function DashboardPage() {
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  
  const recentProjects = projects?.slice(0, 6) || [];
  
  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject.mutateAsync(projectId);
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
        <Button onClick={() => setShowWorkflowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowWorkflowModal(true)}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600" />
              <CardTitle>Quick Generate</CardTitle>
            </div>
            <CardDescription>
              Create a video from a question in one click
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Start Generating
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowWorkflowModal(true)}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-600" />
              <CardTitle>Step-by-Step</CardTitle>
            </div>
            <CardDescription>
              Full control over the generation pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Advanced Mode
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowWorkflowModal(true)}>
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
            <Button variant="outline" className="w-full">
              Upload Manifest
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
              <Button className="mt-4" onClick={() => setShowWorkflowModal(true)}>
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
      
      {showWorkflowModal && (
        <WorkflowSelectorModal
          open={showWorkflowModal}
          onClose={() => setShowWorkflowModal(false)}
        />
      )}
    </div>
  );
}
