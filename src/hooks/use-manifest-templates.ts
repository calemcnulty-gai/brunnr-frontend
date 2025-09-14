/**
 * @fileoverview Hook for fetching manifest templates from Supabase
 * @module hooks/use-manifest-templates
 */

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase-generated'

export type ManifestTemplate = Database['public']['Tables']['manifest_templates']['Row']

interface UseManifestTemplatesOptions {
  subject?: string
  grade_level?: string
  content_kind?: string
}

export function useManifestTemplates(options: UseManifestTemplatesOptions = {}) {
  const [templates, setTemplates] = useState<ManifestTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Memoize Supabase client to prevent constant recreation
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    fetchTemplates()
  }, [options.subject, options.grade_level, options.content_kind])

  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Use memoized supabase client
      
      // Query the manifest_templates table directly
      let query = supabase
        .from('manifest_templates')
        .select('*')
        .eq('is_active', true)
        .order('subject', { ascending: true })
        .order('grade_level', { ascending: true })
        .order('content_kind', { ascending: true })
        .order('created_at', { ascending: false })

      if (options.subject) {
        query = query.eq('subject', options.subject)
      }
      if (options.grade_level) {
        query = query.eq('grade_level', options.grade_level)
      }
      if (options.content_kind) {
        query = query.eq('content_kind', options.content_kind)
      }

      const { data, error: queryError } = await query

      if (queryError) {
        throw queryError
      }

      setTemplates(data || [])
    } catch (err) {
      console.error('Error fetching manifest templates:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
    } finally {
      setIsLoading(false)
    }
  }

  const getTemplateByVideoId = (videoId: string) => {
    return templates.find(t => t.video_id === videoId)
  }

  const getTemplatesBySubject = (subject: string) => {
    return templates.filter(t => t.subject === subject)
  }

  const refetch = () => {
    fetchTemplates()
  }

  return {
    templates,
    isLoading,
    error,
    getTemplateByVideoId,
    getTemplatesBySubject,
    refetch
  }
}
