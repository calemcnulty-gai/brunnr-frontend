/**
 * @fileoverview Supabase database queries for projects
 * @module supabase/queries
 */

import { createClient } from './client'
import type { Database, Project, NewProject, UpdateProject, WorkflowType, ProjectStatus } from '@/types/database'

/**
 * Get all projects for the current user
 * @param userId - The user's ID
 * @returns Promise resolving to array of projects
 */
export async function getProjects(userId: string): Promise<Project[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

/**
 * Get a single project by ID
 * @param projectId - The project ID
 * @returns Promise resolving to project or null
 */
export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  
  return data
}

/**
 * Create a new project
 * @param project - The project data
 * @returns Promise resolving to created project
 */
export async function createProject(project: NewProject): Promise<Project> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Update an existing project
 * @param projectId - The project ID
 * @param updates - The updates to apply
 * @returns Promise resolving to updated project
 */
export async function updateProject(
  projectId: string, 
  updates: UpdateProject
): Promise<Project> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Delete a project
 * @param projectId - The project ID
 * @returns Promise resolving when deleted
 */
export async function deleteProject(projectId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
  
  if (error) throw error
}

/**
 * Get projects by status
 * @param userId - The user's ID
 * @param status - The project status to filter by
 * @returns Promise resolving to array of projects
 */
export async function getProjectsByStatus(
  userId: string, 
  status: ProjectStatus
): Promise<Project[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

/**
 * Upload video to Supabase storage
 * @param userId - The user's ID
 * @param projectId - The project ID
 * @param videoBlob - The video file blob
 * @returns Promise resolving to storage path
 */
export async function uploadVideo(
  userId: string,
  projectId: string,
  videoBlob: Blob
): Promise<string> {
  const supabase = createClient()
  const fileName = `${userId}/${projectId}/video.mp4`
  
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(fileName, videoBlob, {
      contentType: 'video/mp4',
      upsert: true
    })
  
  if (error) throw error
  return data.path
}

/**
 * Get video URL from storage
 * @param storagePath - The storage path
 * @returns Promise resolving to signed URL
 */
export async function getVideoUrl(storagePath: string): Promise<string> {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUrl(storagePath, 3600) // 1 hour expiry
  
  if (error) throw error
  return data.signedUrl
}

/**
 * Delete video from storage
 * @param storagePath - The storage path
 * @returns Promise resolving when deleted
 */
export async function deleteVideo(storagePath: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from('videos')
    .remove([storagePath])
  
  if (error) throw error
}
