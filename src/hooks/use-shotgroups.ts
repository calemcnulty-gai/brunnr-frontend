/**
 * @fileoverview Hook for managing shotgroup generation and caching
 * @module hooks/use-shotgroups
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  const shotgroupsRef = useRef<Shotgroup[]>([])
  
  // Memoize the manifest hash to prevent unnecessary recalculations
  const manifestHash = useMemo(() => 
    manifest ? JSON.stringify(manifest) : '', 
    [manifest]
  )

  const fetchShotgroups = useCallback(async () => {
    // Validation checks
    if (!enabled || !manifest || !manifest.shots || manifest.shots.length === 0) {
      // Only log once per state change to prevent spam
      if (lastProcessedManifest.current !== 'EMPTY') {
        console.log('Skipping shotgroup fetch: disabled or empty manifest')
        lastProcessedManifest.current = 'EMPTY'
      }
      setShotgroups([])
      setTemplateImages([])
      shotgroupsRef.current = []
      return
    }
    
    // Check if we already have data for this exact manifest
    if (existingShotgroups.length > 0 && manifestHash === lastProcessedManifest.current) {
      console.log('Using existing shotgroups - manifest unchanged')
      return
    }
    
    // Check if this manifest was already processed
    if (manifestHash === lastProcessedManifest.current && shotgroupsRef.current.length > 0) {
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
      const newShotgroups = data.shotgroups || []
      const newTemplateImages = data.template_images || []
      
      setShotgroups(newShotgroups)
      setTemplateImages(newTemplateImages)
      shotgroupsRef.current = newShotgroups
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
      shotgroupsRef.current = []
      setProcessingTime(null)
    } finally {
      setIsLoading(false)
      abortController.current = null
    }
  }, [enabled, manifest, manifestHash, existingShotgroups, existingTemplateImages, projectId, userId])
  
  // Effect to fetch shotgroups when dependencies change
  useEffect(() => {
    // Early return if disabled or no manifest
    if (!enabled || !manifest || !manifestHash) {
      console.log('Shotgroups disabled or no manifest')
      return
    }

    // If we have existing shotgroups and they match current manifest, use them
    if (existingShotgroups.length > 0 && manifestHash === lastProcessedManifest.current) {
      console.log('Using existing shotgroups for current manifest')
      setShotgroups(existingShotgroups)
      setTemplateImages(existingTemplateImages)
      shotgroupsRef.current = existingShotgroups
      return
    }
    
    // If this exact manifest was already processed, skip
    if (manifestHash === lastProcessedManifest.current) {
      console.log('Manifest already processed, skipping fetch')
      return
    }
    
    // Only fetch if we don't have shotgroups for this manifest
    console.log('Fetching shotgroups for new manifest')
    fetchShotgroups()
    
    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [manifestHash, enabled]) // Only depend on manifestHash and enabled
  
  return {
    shotgroups,
    templateImages,
    isLoading,
    error,
    processingTime,
    refetch: fetchShotgroups
  }
}
