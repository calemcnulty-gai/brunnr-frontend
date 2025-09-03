/**
 * @fileoverview Manifest validation schemas using Zod
 * @module lib/validation/manifest
 */

import { z } from 'zod'

// Template style schema
export const templateStyleSchema = z.object({
  color: z.string().optional(),
  fontSize: z.number().optional(),
  fontWeight: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
}).optional()

// Template types enum
export const templateTypeEnum = z.enum([
  'Text',
  'MathTex',
  'MathTex_term',
  'circle',
  'circle_set',
  'rectangle',
  'arrow',
  'line',
  'image',
  'video_clip'
])

// Template schema
export const templateSchema = z.object({
  id: z.string().min(1, 'Template ID is required'),
  type: templateTypeEnum,
  content: z.union([
    z.string(),
    z.array(z.union([z.string(), z.number()])),
    z.record(z.any())
  ]).optional(),
  style: templateStyleSchema,
  position: z.object({
    x: z.number(),
    y: z.number()
  }).optional(),
  size: z.object({
    width: z.number(),
    height: z.number()
  }).optional()
})

// Action types enum
export const actionTypeEnum = z.enum([
  'FadeIn',
  'FadeOut',
  'Write',
  'Unwrite',
  'Transform',
  'Morph',
  'Move',
  'Scale',
  'Rotate',
  'Highlight',
  'Indicate',
  'Circumscribe',
  'ShowPassingFlash',
  'Wiggle',
  'Wait'
])

// Action schema
export const actionSchema = z.object({
  type: actionTypeEnum,
  template_id: z.string().optional(),
  target_template_id: z.string().optional(),
  duration: z.number().positive().optional(),
  delay: z.number().min(0).optional(),
  params: z.record(z.any()).optional()
})

// Shot schema
export const shotSchema = z.object({
  voiceover: z.string().default(''),
  actions: z.array(actionSchema).default([]),
  duration: z.number().positive().optional(),
  allow_bleed_over: z.boolean().optional().default(false)
})

// Main manifest schema
export const manifestSchema = z.object({
  video_id: z.string().min(1, 'Video ID is required'),
  templates: z.array(templateSchema).default([]),
  shots: z.array(shotSchema).min(1, 'At least one shot is required')
})

// Type exports
export type Template = z.infer<typeof templateSchema>
export type Action = z.infer<typeof actionSchema>
export type TemplateType = z.infer<typeof templateTypeEnum>
export type ActionType = z.infer<typeof actionTypeEnum>

export type Shot = {
  voiceover: string
  actions: Action[]
  duration?: number
  allow_bleed_over?: boolean
}

export type Manifest = {
  video_id: string
  templates: Template[]
  shots: Shot[]
}

// Validation helper functions
export function validateManifest(data: unknown): { 
  success: boolean
  data?: Manifest
  errors?: z.ZodError
} {
  try {
    const validated = manifestSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

export function validatePartialManifest(data: unknown): {
  success: boolean
  data?: Partial<Manifest>
  errors?: z.ZodError  
} {
  try {
    const validated = manifestSchema.partial().parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

// Template validation helpers
export function getTemplateErrors(templates: Template[]): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  
  templates.forEach((template, index) => {
    // Check for duplicate IDs
    if (ids.has(template.id)) {
      errors.push(`Duplicate template ID "${template.id}" at index ${index}`)
    }
    ids.add(template.id)
    
    // Check content requirements based on type
    if (template.type === 'MathTex' || template.type === 'MathTex_term' || template.type === 'Text') {
      if (!template.content || typeof template.content !== 'string') {
        errors.push(`Template "${template.id}" of type ${template.type} requires string content`)
      }
    }
    
    if (template.type === 'circle_set' && !Array.isArray(template.content)) {
      errors.push(`Template "${template.id}" of type circle_set requires array content`)
    }
  })
  
  return errors
}

// Shot validation helpers
export function getShotErrors(shots: Shot[], templates: Template[]): string[] {
  const errors: string[] = []
  const templateIds = new Set(templates.map(t => t.id))
  
  shots.forEach((shot, shotIndex) => {
    shot.actions.forEach((action, actionIndex) => {
      // Check template_id references
      if (action.template_id && !templateIds.has(action.template_id)) {
        errors.push(
          `Shot ${shotIndex}, Action ${actionIndex}: Template "${action.template_id}" not found`
        )
      }
      
      // Check target_template_id for transform/morph actions
      if (action.target_template_id && !templateIds.has(action.target_template_id)) {
        errors.push(
          `Shot ${shotIndex}, Action ${actionIndex}: Target template "${action.target_template_id}" not found`
        )
      }
      
      // Validate action-specific requirements
      if ((action.type === 'Transform' || action.type === 'Morph') && !action.target_template_id) {
        errors.push(
          `Shot ${shotIndex}, Action ${actionIndex}: ${action.type} action requires target_template_id`
        )
      }
    })
    
    // Check for empty shots without duration
    if (!shot.voiceover && shot.actions.length === 0 && !shot.duration) {
      errors.push(`Shot ${shotIndex}: Silent shot without actions requires explicit duration`)
    }
  })
  
  return errors
}

// Get all validation issues
export function getManifestValidationIssues(manifest: Partial<Manifest>): {
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Basic structure validation
  if (!manifest.video_id) {
    errors.push('Video ID is required')
  }
  
  if (!manifest.shots || manifest.shots.length === 0) {
    errors.push('At least one shot is required')
  }
  
  // Template validation
  if (manifest.templates) {
    const templateErrors = getTemplateErrors(manifest.templates)
    errors.push(...templateErrors)
  }
  
  // Shot validation
  if (manifest.shots && manifest.templates) {
    const shotErrors = getShotErrors(manifest.shots, manifest.templates)
    errors.push(...shotErrors)
  }
  
  // Warnings for best practices
  if (manifest.shots) {
    const totalDuration = manifest.shots.reduce((sum, shot) => {
      return sum + (shot.duration || 0)
    }, 0)
    
    if (totalDuration > 300) {
      warnings.push('Total video duration exceeds 5 minutes, consider breaking into smaller segments')
    }
    
    manifest.shots.forEach((shot, index) => {
      if (shot.voiceover && shot.voiceover.length > 500) {
        warnings.push(`Shot ${index}: Very long voiceover text (${shot.voiceover.length} chars), consider splitting`)
      }
      
      if (shot.actions.length > 10) {
        warnings.push(`Shot ${index}: Many actions (${shot.actions.length}), may be complex to render`)
      }
    })
  }
  
  return { errors, warnings }
}
