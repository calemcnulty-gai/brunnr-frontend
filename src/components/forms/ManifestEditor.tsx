/**
 * @fileoverview Manifest Editor with JSON and Visual editing modes
 * @module components/forms/ManifestEditor
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Code2, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  FileJson,
  Layers,
  Download,
  Upload,
  Copy,
  RotateCcw,
  History
} from 'lucide-react'
import { 
  validateManifest, 
  getManifestValidationIssues,
  type Manifest 
} from '@/lib/validation/manifest'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { getProjectsWithManifests } from '@/lib/supabase/queries'
import { useManifestTemplates } from '@/hooks/use-manifest-templates'
import { useAuthStore } from '@/stores/auth-store'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    )
  }
)

// Dynamic import for Visual Builder
const VisualManifestBuilder = dynamic(
  () => import('./VisualManifestBuilder').then(mod => mod.VisualManifestBuilder),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg">
        <div className="text-gray-500">Loading visual builder...</div>
      </div>
    )
  }
)

interface ManifestEditorProps {
  initialManifest?: Manifest
  onChange?: (manifest: Manifest) => void
  onSave?: (manifest: Manifest) => Promise<void>
  readOnly?: boolean
  className?: string
  existingShotgroups?: any[] // Pass existing shotgroups to avoid refetching
  existingTemplateImages?: any[] // Pass existing template images
  currentProjectId?: string // The ID of the current project being edited
}

export function ManifestEditor({
  initialManifest,
  onChange,
  onSave,
  readOnly = false,
  className,
  existingShotgroups,
  existingTemplateImages,
  currentProjectId
}: ManifestEditorProps) {
  const [activeTab, setActiveTab] = useState<'json' | 'visual'>('visual')
  const [jsonContent, setJsonContent] = useState<string>(() => 
    initialManifest ? JSON.stringify(initialManifest, null, 2) : getDefaultManifest()
  )
  const [manifest, setManifest] = useState<Manifest | null>(initialManifest || null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(currentProjectId)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  
  // Fetch manifest templates
  const { templates: manifestTemplates, isLoading: isLoadingTemplates } = useManifestTemplates()
  
  // Keep saved manifests for backwards compatibility but don't show in dropdown
  const { data: savedManifests, isLoading: isLoadingManifests } = useQuery({
    queryKey: ['projects-with-manifests', user?.id],
    queryFn: () => user ? getProjectsWithManifests(user.id) : Promise.resolve([]),
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
  })
  
  // Debounced validation
  const debouncedJsonContent = useDebounce(jsonContent, 500)
  
  // Validate JSON content
  useEffect(() => {
    if (activeTab !== 'json') return
    
    try {
      const parsed = JSON.parse(debouncedJsonContent)
      const validation = validateManifest(parsed)
      
      if (validation.success && validation.data) {
        setManifest(validation.data)
        const issues = getManifestValidationIssues(validation.data)
        setValidationErrors(issues.errors)
        setValidationWarnings(issues.warnings)
        
        if (issues.errors.length === 0) {
          onChange?.(validation.data)
        }
      } else if (validation.errors) {
        const errors = validation.errors.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        )
        setValidationErrors(errors)
        setValidationWarnings([])
      }
    } catch (error) {
      setValidationErrors(['Invalid JSON syntax'])
      setValidationWarnings([])
    }
  }, [debouncedJsonContent, activeTab, onChange])
  
  // Handle visual builder changes
  const handleVisualChange = useCallback((newManifest: Manifest) => {
    setManifest(newManifest)
    setJsonContent(JSON.stringify(newManifest, null, 2))
    setHasChanges(true)
    
    const issues = getManifestValidationIssues(newManifest)
    setValidationErrors(issues.errors)
    setValidationWarnings(issues.warnings)
    
    if (issues.errors.length === 0) {
      onChange?.(newManifest)
    }
  }, [onChange])
  
  // Handle save
  const handleSave = async () => {
    if (!manifest || validationErrors.length > 0 || !onSave) return
    
    setIsSaving(true)
    try {
      await onSave(manifest)
      setHasChanges(false)
      // Invalidate the query to refetch saved manifests
      queryClient.invalidateQueries({ queryKey: ['projects-with-manifests', user?.id] })
    } catch (error) {
      console.error('Failed to save manifest:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  // Export manifest
  const handleExport = () => {
    if (!manifest) return
    
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `manifest-${manifest.video_id || 'untitled'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  // Import manifest
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      try {
        const text = await file.text()
        console.log('Importing manifest file:', file.name)
        
        const parsed = JSON.parse(text)
        console.log('Parsed manifest:', parsed)
        
        // Try validation but don't fail if it doesn't match our schema exactly
        // The API has the authoritative validation
        const validation = validateManifest(parsed)
        
        if (validation.success && validation.data) {
          console.log('Manifest validation passed')
          setManifest(validation.data)
          setJsonContent(JSON.stringify(validation.data, null, 2))
          handleVisualChange(validation.data)
        } else {
          console.warn('Manifest validation failed:', validation.errors)
          
          // Still allow importing if it's valid JSON
          // Let the API handle the actual validation
          const manifestLike = parsed as Manifest
          if (manifestLike.video_id && manifestLike.shots) {
            console.log('Using manifest despite validation errors - API will validate')
            setManifest(manifestLike)
            setJsonContent(JSON.stringify(manifestLike, null, 2))
            handleVisualChange(manifestLike)
            
            // Show warning that validation failed but we're proceeding
            setValidationWarnings([
              'Manifest structure differs from expected format.',
              'The API will perform final validation when generating video.'
            ])
          } else {
            alert('Invalid manifest file: missing required fields (video_id or shots)')
          }
        }
      } catch (error) {
        console.error('Failed to import manifest:', error)
        alert(`Failed to import manifest file: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    input.click()
  }
  
  // Copy to clipboard
  const handleCopy = async () => {
    if (!manifest) return
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(manifest, null, 2))
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }
  
  // Reset to initial
  const handleReset = () => {
    if (initialManifest) {
      setManifest(initialManifest)
      setJsonContent(JSON.stringify(initialManifest, null, 2))
      handleVisualChange(initialManifest)
    } else {
      const defaultJson = getDefaultManifest()
      setJsonContent(defaultJson)
      const parsed = JSON.parse(defaultJson)
      setManifest(parsed)
      handleVisualChange(parsed)
    }
    setHasChanges(false)
  }
  
  // Handle selecting a manifest template
  const handleSelectSavedManifest = async (templateId: string) => {
    const selected = manifestTemplates?.find(t => t.id === templateId)
    if (!selected?.manifest) {
      console.warn('No manifest template found for ID:', templateId)
      return
    }
    
    try {
      const validation = validateManifest(selected.manifest)
      
      if (validation.success && validation.data) {
        setManifest(validation.data)
        setJsonContent(JSON.stringify(validation.data, null, 2))
        handleVisualChange(validation.data)
      } else {
        // Still allow loading if it's valid JSON
        const manifestLike = selected.manifest as Manifest
        setManifest(manifestLike)
        setJsonContent(JSON.stringify(manifestLike, null, 2))
        handleVisualChange(manifestLike)
        
        setValidationWarnings([
          'Loaded manifest may have validation issues.',
          'The API will perform final validation when generating video.'
        ])
      }
      
      // Template loaded successfully
      
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to load manifest:', error)
      // Reset selection on error
      setSelectedProjectId(undefined)
    }
  }
  
  const isValid = validationErrors.length === 0 && manifest !== null
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-purple-600" />
              Manifest Editor
            </CardTitle>
            <CardDescription>
              Edit your video manifest using visual tools or raw JSON
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Unsaved Changes
              </Badge>
            )}
            
            {isValid ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Valid
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">
                <AlertCircle className="mr-1 h-3 w-3" />
                {validationErrors.length} Error{validationErrors.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'json' | 'visual')}>
            <TabsList>
              <TabsTrigger value="visual" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Visual Builder
              </TabsTrigger>
              <TabsTrigger value="json" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                JSON Editor
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            {/* Saved Manifests Dropdown */}
            <Select 
              value={selectedProjectId}
              onValueChange={handleSelectSavedManifest} 
              disabled={readOnly || isLoadingTemplates || !manifestTemplates?.length}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={
                  isLoadingTemplates ? "Loading templates..." : 
                  !manifestTemplates?.length ? "No manifest templates" : 
                  "Select manifest template"
                } />
              </SelectTrigger>
              <SelectContent>
                {manifestTemplates && manifestTemplates.length > 0 ? (
                  manifestTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id} textValue={template.title}>
                      <div className="flex flex-col gap-1 w-full">
                        <span className="font-medium">{template.title}</span>
                        <div className="text-xs text-muted-foreground">
                          {template.subject} • {template.content_kind} • {template.grade_level || 'All grades'}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No manifest templates found
                  </div>
                )}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              disabled={readOnly}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!manifest}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!manifest}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            
            {initialManifest && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges || readOnly}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
            
            {onSave && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!isValid || isSaving || !hasChanges || readOnly}
              >
                {isSaving ? 'Saving...' : 'Save Manifest'}
              </Button>
            )}
          </div>
        </div>
        
        {/* Validation Messages */}
        {(validationErrors.length > 0 || validationWarnings.length > 0) && (
          <div className="space-y-2">
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1 text-sm">
                    {validationErrors.slice(0, 5).map((error, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-red-600">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li className="text-red-600 font-medium">
                        ... and {validationErrors.length - 5} more errors
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {validationWarnings.length > 0 && validationErrors.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Warnings</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 space-y-1 text-sm">
                    {validationWarnings.map((warning, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-yellow-600">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {/* Editor Content */}
        <div className="min-h-[500px]">
          {activeTab === 'json' ? (
            <div className="border rounded-lg overflow-hidden">
              <MonacoEditor
                height="500px"
                language="json"
                theme="vs-light"
                value={jsonContent}
                onChange={(value) => {
                  setJsonContent(value || '')
                  setHasChanges(true)
                }}
                options={{
                  readOnly,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  formatOnType: true
                }}
              />
            </div>
          ) : (
            <VisualManifestBuilder
              manifest={manifest || undefined}
              onChange={handleVisualChange}
              readOnly={readOnly}
              existingShotgroups={existingShotgroups}
              existingTemplateImages={existingTemplateImages}
              projectId={currentProjectId}
              userId={user?.id}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Default manifest template
function getDefaultManifest(): string {
  return JSON.stringify({
    video_id: "new_video",
    templates: [
      {
        id: "title_text",
        type: "Text",
        content: "Welcome",
        style: {
          color: "#000000",
          fontSize: 48
        }
      }
    ],
    shots: [
      {
        voiceover: "Welcome to this educational video.",
        actions: [
          {
            type: "FadeIn",
            template_id: "title_text",
            duration: 1.0
          }
        ]
      }
    ]
  }, null, 2)
}
