/**
 * @fileoverview React Query hooks for project management
 * @module hooks/use-projects
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './use-auth'
import * as queries from '@/lib/supabase/queries'
import type { Project, NewProject, UpdateProject, ProjectStatus } from '@/types/database'

// Query keys
const projectKeys = {
  all: (userId: string) => ['projects', userId] as const,
  byId: (projectId: string) => ['projects', 'detail', projectId] as const,
  byStatus: (userId: string, status: ProjectStatus) => ['projects', userId, { status }] as const,
}

/**
 * Hook to fetch all projects for the current user
 */
export function useProjects() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: projectKeys.all(user?.id ?? ''),
    queryFn: () => queries.getProjects(user!.id),
    enabled: !!user,
  })
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(projectId: string) {
  return useQuery({
    queryKey: projectKeys.byId(projectId),
    queryFn: () => queries.getProject(projectId),
    enabled: !!projectId,
  })
}

/**
 * Hook to fetch projects by status
 */
export function useProjectsByStatus(status: ProjectStatus) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: projectKeys.byStatus(user?.id ?? '', status),
    queryFn: () => queries.getProjectsByStatus(user!.id, status),
    enabled: !!user,
  })
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: (project: Omit<NewProject, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated')
      return queries.createProject({ ...project, user_id: user.id })
    },
    onSuccess: (newProject) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.all(user!.id) })
      
      // Add the new project to the cache
      queryClient.setQueryData(projectKeys.byId(newProject.id), newProject)
    },
  })
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: UpdateProject }) => 
      queries.updateProject(projectId, updates),
    onSuccess: (updatedProject) => {
      // Update the project in cache
      queryClient.setQueryData(projectKeys.byId(updatedProject.id), updatedProject)
      
      // Invalidate projects list to reflect changes
      if (user) {
        queryClient.invalidateQueries({ queryKey: projectKeys.all(user.id) })
      }
    },
  })
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: queries.deleteProject,
    onSuccess: (_, projectId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: projectKeys.byId(projectId) })
      
      // Invalidate projects list
      if (user) {
        queryClient.invalidateQueries({ queryKey: projectKeys.all(user.id) })
      }
    },
  })
}

/**
 * Hook to upload and associate video with project
 */
export function useUploadProjectVideo() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const updateProject = useUpdateProject()
  
  return useMutation({
    mutationFn: async ({ 
      projectId, 
      videoBlob, 
      videoUrl 
    }: { 
      projectId: string
      videoBlob: Blob
      videoUrl: string 
    }) => {
      if (!user) throw new Error('User not authenticated')
      
      // Upload to storage
      const storagePath = await queries.uploadVideo(user.id, projectId, videoBlob)
      
      // Update project with storage path and API URL
      const updated = await updateProject.mutateAsync({
        projectId,
        updates: {
          video_storage_path: storagePath,
          video_url: videoUrl,
          status: 'completed'
        }
      })
      
      return updated
    },
  })
}
