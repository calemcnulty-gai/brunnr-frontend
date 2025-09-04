/**
 * @fileoverview Supabase database queries for projects
 * @module supabase/queries
 */

import { createClient } from './client'
import type { Project, NewProject, UpdateProject, WorkflowType, ProjectStatus, ProjectData } from '@/types/database'
import type { Database } from '@/types/supabase'

type ProjectRow = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

// Helper function to convert database row to Project type
function rowToProject(row: ProjectRow): Project {
  return {
    ...row,
    data: row.data as ProjectData,
    manifest: row.manifest || null,
    api_responses: row.api_responses || {},
    template_images: row.template_images || [],
    shotgroups: row.shotgroups || [],
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString()
  } as Project
}

// Helper to prepare project for insertion
function prepareProjectInsert(project: NewProject): any {
  return {
    ...project,
    data: project.data || {}
  }
}

// Helper to prepare project for update
function prepareProjectUpdate(updates: UpdateProject): any {
  if (updates.data !== undefined) {
    return {
      ...updates,
      data: updates.data
    }
  }
  return updates
}

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
  return ((data || []) as ProjectRow[]).map(rowToProject)
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
  
  return rowToProject(data as ProjectRow)
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
    .insert(prepareProjectInsert(project))
    .select()
    .single()
  
  if (error) throw error
  return rowToProject(data as ProjectRow)
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
    .update(prepareProjectUpdate(updates))
    .eq('id', projectId)
    .select()
    .single()
  
  if (error) throw error
  return rowToProject(data as ProjectRow)
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
  return ((data || []) as ProjectRow[]).map(rowToProject)
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

/**
 * Upload image to Supabase storage
 * @param userId - The user's ID
 * @param projectId - The project ID
 * @param imageBlob - The image file blob
 * @param imageName - The image file name
 * @returns Promise resolving to storage path
 */
export async function uploadImage(
  userId: string,
  projectId: string,
  imageBlob: Blob,
  imageName: string
): Promise<string> {
  const supabase = createClient()
  const fileName = `${userId}/${projectId}/${imageName}`
  
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, imageBlob, {
      upsert: true,
      cacheControl: '3600'
    })
  
  if (error) throw error
  return data.path
}

/**
 * Upload multiple images to Supabase storage
 * @param userId - The user's ID
 * @param projectId - The project ID
 * @param images - Array of image blobs with names
 * @returns Promise resolving to array of storage paths
 */
export async function uploadImages(
  userId: string,
  projectId: string,
  images: Array<{ blob: Blob; name: string }>
): Promise<string[]> {
  const uploadPromises = images.map(({ blob, name }) =>
    uploadImage(userId, projectId, blob, name)
  )
  return Promise.all(uploadPromises)
}

/**
 * Get image URL from storage
 * @param storagePath - The storage path
 * @returns Promise resolving to signed URL
 */
export async function getImageUrl(storagePath: string): Promise<string> {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from('images')
    .createSignedUrl(storagePath, 3600) // 1 hour expiry
  
  if (error) throw error
  return data.signedUrl
}

/**
 * Save manifest to storage
 * @param userId - The user's ID
 * @param projectId - The project ID
 * @param manifest - The manifest object
 * @returns Promise resolving to storage path
 */
export async function saveManifest(
  userId: string,
  projectId: string,
  manifest: any
): Promise<string> {
  const supabase = createClient()
  const fileName = `${userId}/${projectId}/manifest.json`
  const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
    type: 'application/json'
  })
  
  const { data, error } = await supabase.storage
    .from('manifests')
    .upload(fileName, manifestBlob, {
      contentType: 'application/json',
      upsert: true
    })
  
  if (error) throw error
  return data.path
}

/**
 * Get manifest from storage
 * @param storagePath - The storage path
 * @returns Promise resolving to manifest object
 */
export async function getManifest(storagePath: string): Promise<any> {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from('manifests')
    .download(storagePath)
  
  if (error) throw error
  
  const text = await data.text()
  return JSON.parse(text)
}

/**
 * Update project with manifest and API responses
 * @param projectId - The project ID
 * @param manifest - The manifest object
 * @param apiResponses - API response data
 * @param templateImages - Template images data
 * @param shotgroups - Shotgroups data
 * @returns Promise resolving to updated project
 */
export async function updateProjectWithManifest(
  projectId: string,
  manifest: any,
  apiResponses?: any,
  templateImages?: any[],
  shotgroups?: any[]
): Promise<Project> {
  const supabase = createClient()
  
  const updates: any = {
    manifest,
    updated_at: new Date().toISOString()
  }
  
  if (apiResponses) {
    updates.api_responses = apiResponses
  }
  
  if (templateImages) {
    updates.template_images = templateImages
  }
  
  if (shotgroups) {
    updates.shotgroups = shotgroups
  }
  
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()
  
  if (error) throw error
  return rowToProject(data as ProjectRow)
}

/**
 * Download and save image from URL
 * @param imageUrl - The image URL to download from
 * @param userId - The user's ID
 * @param projectId - The project ID
 * @param imageName - The name to save the image as
 * @returns Promise resolving to storage path
 */
export async function downloadAndSaveImage(
  imageUrl: string,
  userId: string,
  projectId: string,
  imageName: string
): Promise<string> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
    
    const blob = await response.blob()
    return uploadImage(userId, projectId, blob, imageName)
  } catch (error) {
    console.error('Failed to download and save image:', error)
    throw error
  }
}
