/**
 * @fileoverview Hook for managing shotgroup generation and caching
 * @module hooks/use-shotgroups
 */

import { useState, useEffect, useRef } from 'react'
import type { Manifest } from '@/lib/validation/manifest'
import type { Shotgroup, TemplateImage } from '@/types/shotgroup'

interface UseShotgroupsOptions {
  manifest?: Manifest
  projectId?: string
  userId?: string
  existingShotgroups?: Shotgroup[]
  existingTemplateImages?: TemplateImage[]
  enabled?: boolean
}

interface UseShotgroupsResult {
  shotgroups: Shotgroup[]
  templateImages: TemplateImage[]
  isLoading: boolean
  error: string | null
  processingTime: number | null
  refetch: () => Promise<void>
}

/**
 * Custom hook for managing shotgroup generation
 * Handles caching, deduplication, and error handling
 */
export function useShotgroups({
  manifest,
  projectId,
  userId,
  existingShotgroups = [],
  existingTemplateImages = [],
  enabled = true
}: UseShotgroupsOptions): UseShotgroupsResult {
  const [shotgroups, setShotgroups] = useState<Shotgroup[]>(existingShotgroups)
  const [templateImages, setTemplateImages] = useState<TemplateImage[]>(existingTemplateImages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  
  // Track the last processed manifest to avoid duplicate API calls
  const lastProcessedManifest = useRef<string>('')
  const abortController = useRef<AbortController | null>(null)
  
  const fetchShotgroups = async () => {
    // Validation checks
    if (!enabled || !manifest || !manifest.shots || manifest.shots.length === 0) {
      console.log('Skipping shotgroup fetch: disabled or empty manifest')
      setShotgroups([])
      setTemplateImages([])
      return
    }
    
    const manifestHash = JSON.stringify(manifest)
    
    // Check if we already have data for this exact manifest
    if (existingShotgroups.length > 0 && manifestHash === lastProcessedManifest.current) {
      console.log('Using existing shotgroups - manifest unchanged')
      return
    }
    
    // Check if this manifest was already processed
    if (manifestHash === lastProcessedManifest.current && shotgroups.length > 0) {
      console.log('Skipping duplicate API call - manifest already processed')
      return
    }
    
    // Cancel any in-flight request
    if (abortController.current) {
      abortController.current.abort()
    }
    
    // Create new abort controller
    abortController.current = new AbortController()
    
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Fetching shotgroups from API...')
      console.log(`Project ID: ${projectId}, User ID: ${userId}`)
      
      const response = await fetch('/api/backend/media/manifest-to-shotgroup-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manifest,
          projectId,
          userId
        }),
        signal: abortController.current.signal
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Check if save to Supabase was successful
      if (data.savedToSupabase === false && data.saveError) {
        console.error('Failed to save to Supabase:', data.saveError)
        // Still use the data but warn about save failure
      }
      
      // Validate response
      if (data.status === 'error' && data.error) {
        throw new Error(data.error)
      }
      
      // Update state with new data
      setShotgroups(data.shotgroups || [])
      setTemplateImages(data.template_images || [])
      setProcessingTime(data.total_processing_time || null)
      
      // Mark this manifest as processed
      lastProcessedManifest.current = manifestHash
      
      console.log(`Successfully fetched ${data.shotgroups?.length || 0} shotgroups`)
      
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Shotgroup fetch cancelled')
        return
      }
      
      console.error('Error fetching shotgroups:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch shotgroups')
      setShotgroups([])
      setTemplateImages([])
      setProcessingTime(null)
    } finally {
      setIsLoading(false)
      abortController.current = null
    }
  }
  
  // Effect to fetch shotgroups when dependencies change
  useEffect(() => {
    // If we have existing shotgroups, use them initially
    if (existingShotgroups.length > 0) {
      setShotgroups(existingShotgroups)
      setTemplateImages(existingTemplateImages)
      // Mark the current manifest as already processed
      if (manifest) {
        lastProcessedManifest.current = JSON.stringify(manifest)
      }
      return
    }
    
    // Otherwise fetch new shotgroups
    fetchShotgroups()
    
    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [manifest, enabled]) // Only depend on manifest and enabled state
  
  return {
    shotgroups,
    templateImages,
    isLoading,
    error,
    processingTime,
    refetch: fetchShotgroups
  }
}
