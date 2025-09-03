/**
 * @fileoverview Visual Manifest Builder with drag-and-drop functionality
 * @module components/forms/VisualManifestBuilder
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  ChevronDown, 
  ChevronRight,
  Copy,
  Layers,
  Type,
  Circle,
  Square,
  ArrowRight,
  Video,
  Image as ImageIcon,
  Mic,
  Clock,
  Zap,
  Film,
  Loader2
} from 'lucide-react'
import type { 
  Manifest, 
  Template, 
  Shot, 
  Action,
  TemplateType,
  ActionType
} from '@/lib/validation/manifest'
import type { Shotgroup, ShotgroupResponse } from '@/types/shotgroup'
import { cn } from '@/lib/utils'

interface VisualManifestBuilderProps {
  manifest?: Manifest
  onChange: (manifest: Manifest) => void
  readOnly?: boolean
}

// Template type icons
const templateIcons: Record<string, React.ReactNode> = {
  Text: <Type className="h-4 w-4" />,
  MathTex: <span className="text-sm font-mono">Σ</span>,
  MathTex_term: <span className="text-sm font-mono">x²</span>,
  circle: <Circle className="h-4 w-4" />,
  circle_set: <Circle className="h-4 w-4" />,
  rectangle: <Square className="h-4 w-4" />,
  arrow: <ArrowRight className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  video_clip: <Video className="h-4 w-4" />
}

// Action type icons
const actionIcons: Record<string, React.ReactNode> = {
  FadeIn: <Zap className="h-4 w-4" />,
  FadeOut: <Zap className="h-4 w-4" />,
  Write: <Type className="h-4 w-4" />,
  Transform: <Layers className="h-4 w-4" />,
  Wait: <Clock className="h-4 w-4" />
}

export function VisualManifestBuilder({
  manifest = {
    video_id: 'new_video',
    templates: [],
    shots: []
  },
  onChange,
  readOnly = false
}: VisualManifestBuilderProps) {
  const [expandedShots, setExpandedShots] = useState<Set<number>>(new Set([0]))
  const [expandedShotgroups, setExpandedShotgroups] = useState<Set<number>>(new Set([0]))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [shotgroups, setShotgroups] = useState<Shotgroup[]>([])
  const [isLoadingShotgroups, setIsLoadingShotgroups] = useState(false)
  const [shotgroupError, setShotgroupError] = useState<string | null>(null)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // Fetch shotgroups whenever manifest changes
  useEffect(() => {
    const fetchShotgroups = async () => {
      if (!manifest || manifest.shots.length === 0) {
        setShotgroups([])
        return
      }
      
      setIsLoadingShotgroups(true)
      setShotgroupError(null)
      
      try {
        const response = await fetch('/api/backend/media/manifest-to-shotgroup-videos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(manifest)
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch shotgroups: ${response.statusText}`)
        }
        
        const data: ShotgroupResponse = await response.json()
        
        if (data.status === 'error' && data.error) {
          throw new Error(data.error)
        }
        
        setShotgroups(data.shotgroups)
        setProcessingTime(data.total_processing_time || null)
      } catch (error) {
        console.error('Error fetching shotgroups:', error)
        setShotgroupError(error instanceof Error ? error.message : 'Failed to fetch shotgroups')
        setShotgroups([])
        setProcessingTime(null)
      } finally {
        setIsLoadingShotgroups(false)
      }
    }
    
    fetchShotgroups()
  }, [manifest])
  
  // Handle video ID change
  const handleVideoIdChange = (videoId: string) => {
    onChange({ ...manifest, video_id: videoId })
  }
  
  // Template management
  const addTemplate = () => {
    const newTemplate: Template = {
      id: `template_${Date.now()}`,
      type: 'Text',
      content: 'New Template',
      style: { color: '#000000' }
    }
    onChange({
      ...manifest,
      templates: [...manifest.templates, newTemplate]
    })
  }
  
  const updateTemplate = (index: number, template: Template) => {
    const newTemplates = [...manifest.templates]
    newTemplates[index] = template
    onChange({ ...manifest, templates: newTemplates })
  }
  
  const deleteTemplate = (index: number) => {
    const template = manifest.templates[index]
    if (!template) return
    const templateId = template.id
    const newTemplates = manifest.templates.filter((_, i) => i !== index)
    
    // Remove references from actions
    const newShots = manifest.shots.map(shot => ({
      ...shot,
      actions: shot.actions.filter(action => 
        action.template_id !== templateId && action.target_template_id !== templateId
      )
    }))
    
    onChange({ ...manifest, templates: newTemplates, shots: newShots })
  }
  
  // Shot management
  const addShot = () => {
    const newShot: Shot = {
      voiceover: '',
      actions: []
    }
    onChange({
      ...manifest,
      shots: [...manifest.shots, newShot]
    })
    setExpandedShots(new Set([...Array.from(expandedShots), manifest.shots.length]))
  }
  
  const updateShot = (index: number, shot: Shot) => {
    const newShots = [...manifest.shots]
    newShots[index] = shot
    onChange({ ...manifest, shots: newShots })
  }
  
  const deleteShot = (index: number) => {
    const newShots = manifest.shots.filter((_, i) => i !== index)
    onChange({ ...manifest, shots: newShots })
  }
  
  const duplicateShot = (index: number) => {
    const shotToDuplicate = manifest.shots[index]
    if (!shotToDuplicate) return
    const newShot: Shot = { 
      voiceover: shotToDuplicate.voiceover,
      actions: [...shotToDuplicate.actions],
      allow_bleed_over: shotToDuplicate.allow_bleed_over,
      duration: shotToDuplicate.duration,
      description: shotToDuplicate.description,
      contained: shotToDuplicate.contained
    }
    const newShots = [...manifest.shots]
    newShots.splice(index + 1, 0, newShot)
    onChange({ ...manifest, shots: newShots })
  }
  
  // Action management
  const addAction = (shotIndex: number) => {
    const newAction: Action = {
      type: 'FadeIn',
      template_id: manifest.templates[0]?.id || '',
      duration: 1.0
    }
    const shot = manifest.shots[shotIndex]
    if (!shot) return
    updateShot(shotIndex, {
      voiceover: shot.voiceover,
      actions: [...shot.actions, newAction],
      allow_bleed_over: shot.allow_bleed_over,
      duration: shot.duration,
      description: shot.description,
      contained: shot.contained
    })
  }
  
  const updateAction = (shotIndex: number, actionIndex: number, action: Action) => {
    const shot = manifest.shots[shotIndex]
    if (!shot) return
    const newActions = [...shot.actions]
    newActions[actionIndex] = action
    updateShot(shotIndex, { 
      voiceover: shot.voiceover,
      actions: newActions,
      allow_bleed_over: shot.allow_bleed_over,
      duration: shot.duration,
      description: shot.description,
      contained: shot.contained
    })
  }
  
  const deleteAction = (shotIndex: number, actionIndex: number) => {
    const shot = manifest.shots[shotIndex]
    if (!shot) return
    const newActions = shot.actions.filter((_, i) => i !== actionIndex)
    updateShot(shotIndex, { 
      voiceover: shot.voiceover,
      actions: newActions,
      allow_bleed_over: shot.allow_bleed_over,
      duration: shot.duration,
      description: shot.description,
      contained: shot.contained
    })
  }
  
  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = manifest.shots.findIndex((_, i) => `shot-${i}` === active.id)
      const newIndex = manifest.shots.findIndex((_, i) => `shot-${i}` === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newShots = arrayMove(manifest.shots, oldIndex, newIndex)
        onChange({ ...manifest, shots: newShots })
      }
    }
    
    setActiveId(null)
  }
  
  const toggleShot = (index: number) => {
    const newExpanded = new Set(expandedShots)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedShots(newExpanded)
  }
  
  return (
    <div className="space-y-6">
      {/* Video ID */}
      <div className="space-y-2">
        <Label htmlFor="video-id">Video ID</Label>
        <Input
          id="video-id"
          value={manifest.video_id}
          onChange={(e) => handleVideoIdChange(e.target.value)}
          disabled={readOnly}
          placeholder="Enter video identifier"
        />
      </div>
      
      {/* Templates Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Templates</CardTitle>
            <Button
              size="sm"
              onClick={addTemplate}
              disabled={readOnly}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {manifest.templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No templates defined. Add a template to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {manifest.templates.map((template, index) => (
                <TemplateItem
                  key={template.id}
                  template={template}
                  index={index}
                  selected={selectedTemplate === template.id}
                  onSelect={() => setSelectedTemplate(template.id)}
                  onUpdate={(t) => updateTemplate(index, t)}
                  onDelete={() => deleteTemplate(index)}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Shots Section - Grouped by Shotgroups */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                          <Film className="h-5 w-5" />
            <CardTitle className="text-lg">Shot Groups</CardTitle>
            <Badge variant="secondary">{shotgroups.length}</Badge>
            {isLoadingShotgroups && <Loader2 className="h-4 w-4 animate-spin" />}
            {processingTime && (
              <Badge variant="outline" className="text-xs">
                Generated in {processingTime.toFixed(1)}s
              </Badge>
            )}
            </div>
            <Button
              size="sm"
              onClick={addShot}
              disabled={readOnly}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Shot
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {shotgroupError ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading shot groups: {shotgroupError}</p>
              <p className="text-sm text-gray-500 mt-2">Make sure the API is running on localhost:8000</p>
            </div>
          ) : isLoadingShotgroups ? (
            <div className="text-center py-8 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              Loading shot groups...
            </div>
          ) : manifest.shots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No shots defined. Add a shot to begin creating your video.
            </div>
          ) : shotgroups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Processing shot groups...
            </div>
          ) : (
            <div className="space-y-4">
              {shotgroups.map((shotgroup, sgIndex) => (
                <Card key={`shotgroup-${sgIndex}`} className="border-l-4 border-l-blue-500">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => {
                      const newExpanded = new Set(expandedShotgroups)
                      if (newExpanded.has(sgIndex)) {
                        newExpanded.delete(sgIndex)
                      } else {
                        newExpanded.add(sgIndex)
                      }
                      setExpandedShotgroups(newExpanded)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {expandedShotgroups.has(sgIndex) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                        <span className="font-medium">Shot Group {sgIndex + 1}</span>
                        <Badge variant="outline">{shotgroup.shot_count} shots</Badge>
                        <Badge variant="secondary">{shotgroup.duration_seconds.toFixed(1)}s</Badge>
                        {shotgroup.has_audio && <Mic className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="text-sm text-gray-500 max-w-md truncate">
                        {shotgroup.voiceover_preview}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedShotgroups.has(sgIndex) && (
                    <CardContent>
                      <div className="space-y-4">
                        {/* Video Player */}
                        {shotgroup.download_url && (
                          <div className="bg-gray-900 rounded-lg overflow-hidden">
                            <video
                              controls
                              className="w-full"
                              src={shotgroup.download_url.replace('http://localhost:8000', '/api/backend')}
                            >
                              Your browser does not support the video tag.
                            </video>
                            <div className="p-2 bg-gray-800 text-xs text-gray-400 flex justify-between">
                              <span>Duration: {shotgroup.duration_seconds}s</span>
                              <a 
                                href={shotgroup.download_url.replace('http://localhost:8000', '/api/backend')}
                                download
                                className="text-blue-400 hover:text-blue-300"
                              >
                                Download MP4
                              </a>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-sm text-gray-600 mb-2">
                          Shots: {shotgroup.shot_indices.map(i => i + 1).join(', ')}
                        </div>
                        
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={shotgroup.shot_indices.map(i => `shot-${i}`)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2">
                              {shotgroup.shot_indices.map((shotIndex) => {
                                const shot = manifest.shots[shotIndex]
                                if (!shot) return null
                                
                                return (
                                  <ShotItem
                                    key={`shot-${shotIndex}`}
                                    id={`shot-${shotIndex}`}
                                    shot={shot}
                                    index={shotIndex}
                                    expanded={expandedShots.has(shotIndex)}
                                    templates={manifest.templates}
                                    onToggle={() => toggleShot(shotIndex)}
                                    onUpdate={(s) => updateShot(shotIndex, s)}
                                    onDelete={() => deleteShot(shotIndex)}
                                    onDuplicate={() => duplicateShot(shotIndex)}
                                    onAddAction={() => addAction(shotIndex)}
                                    onUpdateAction={(actionIndex, action) => 
                                      updateAction(shotIndex, actionIndex, action)
                                    }
                                    onDeleteAction={(actionIndex) => 
                                      deleteAction(shotIndex, actionIndex)
                                    }
                                    readOnly={readOnly}
                                  />
                                )
                              })}
                            </div>
                          </SortableContext>
                          
                          <DragOverlay>
                            {activeId ? (
                              <div className="bg-white border rounded-lg p-4 shadow-lg opacity-90">
                                <div className="flex items-center gap-2">
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">
                                    {(() => {
                                      const parts = activeId.split('-')
                                      if (parts[1]) {
                                        return `Shot ${parseInt(parts[1]) + 1}`
                                      }
                                      return 'Shot'
                                    })()}
                                  </span>
                                </div>
                              </div>
                            ) : null}
                          </DragOverlay>
                        </DndContext>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Template Item Component
interface TemplateItemProps {
  template: Template
  index: number
  selected: boolean
  onSelect: () => void
  onUpdate: (template: Template) => void
  onDelete: () => void
  readOnly?: boolean
}

function TemplateItem({
  template,
  index,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  readOnly
}: TemplateItemProps) {
  const [editing, setEditing] = useState(false)
  
  return (
    <div
      className={cn(
        "border rounded-lg p-3 cursor-pointer transition-colors",
        selected ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:bg-gray-50"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gray-100 rounded">
            {templateIcons[template.type] || <Layers className="h-4 w-4" />}
          </div>
          <div>
            <div className="font-medium text-sm">{template.id}</div>
            <div className="text-xs text-gray-500">{template.type}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {template.content && (
            <Badge variant="outline" className="text-xs">
              {typeof template.content === 'string' 
                ? template.content.substring(0, 20) 
                : 'Complex'}
            </Badge>
          )}
          
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Shot Item Component
interface ShotItemProps {
  id: string
  shot: Shot
  index: number
  expanded: boolean
  templates: Template[]
  onToggle: () => void
  onUpdate: (shot: Shot) => void
  onDelete: () => void
  onDuplicate: () => void
  onAddAction: () => void
  onUpdateAction: (actionIndex: number, action: Action) => void
  onDeleteAction: (actionIndex: number) => void
  readOnly?: boolean
}

function ShotItem({
  id,
  shot,
  index,
  expanded,
  templates,
  onToggle,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddAction,
  onUpdateAction,
  onDeleteAction,
  readOnly
}: ShotItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg bg-white"
    >
      <div className="p-3">
        <div className="flex items-center gap-2">
          {!readOnly && (
            <div {...attributes} {...listeners} className="cursor-move">
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Shot {index + 1}</span>
              {shot.voiceover && (
                <Badge variant="outline" className="text-xs">
                  <Mic className="mr-1 h-3 w-3" />
                  {shot.voiceover.split(' ').length} words
                </Badge>
              )}
              {shot.actions.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Zap className="mr-1 h-3 w-3" />
                  {shot.actions.length} actions
                </Badge>
              )}
              {shot.duration && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  {shot.duration}s
                </Badge>
              )}
            </div>
          </div>
          
          {!readOnly && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDuplicate}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        {expanded && (
          <div className="mt-4 space-y-4 pl-8">
            {/* Voiceover */}
            <div className="space-y-2">
              <Label>Voiceover</Label>
              <Textarea
                value={shot.voiceover || ''}
                onChange={(e) => onUpdate({ ...shot, voiceover: e.target.value })}
                disabled={readOnly}
                placeholder="Enter voiceover text..."
                className="min-h-[80px]"
              />
            </div>
            
            {/* Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (seconds)</Label>
                <Input
                  type="number"
                  value={shot.duration || ''}
                  onChange={(e) => onUpdate({ 
                    ...shot, 
                    duration: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  disabled={readOnly}
                  placeholder="Auto"
                  step="0.1"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Allow Bleed Over</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={shot.allow_bleed_over}
                    onChange={(e) => onUpdate({ 
                      ...shot, 
                      allow_bleed_over: e.target.checked 
                    })}
                    disabled={readOnly}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">
                    Allow voiceover to continue into next shot
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Actions</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAddAction}
                  disabled={readOnly || templates.length === 0}
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Add Action
                </Button>
              </div>
              
              {shot.actions.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">
                  No actions defined
                </div>
              ) : (
                <div className="space-y-2">
                  {shot.actions.map((action, actionIndex) => (
                    <ActionItem
                      key={actionIndex}
                      action={action}
                      templates={templates}
                      onUpdate={(a) => onUpdateAction(actionIndex, a)}
                      onDelete={() => onDeleteAction(actionIndex)}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Action Item Component
interface ActionItemProps {
  action: Action
  templates: Template[]
  onUpdate: (action: Action) => void
  onDelete: () => void
  readOnly?: boolean
}

function ActionItem({
  action,
  templates,
  onUpdate,
  onDelete,
  readOnly
}: ActionItemProps) {
  return (
    <div className="border rounded p-2 bg-gray-50">
      <div className="grid grid-cols-3 gap-2">
        <select
          value={action.type}
          onChange={(e) => onUpdate({ ...action, type: e.target.value as ActionType })}
          disabled={readOnly}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="FadeIn">Fade In</option>
          <option value="FadeOut">Fade Out</option>
          <option value="Write">Write</option>
          <option value="Unwrite">Unwrite</option>
          <option value="Transform">Transform</option>
          <option value="Morph">Morph</option>
          <option value="Move">Move</option>
          <option value="Scale">Scale</option>
          <option value="Rotate">Rotate</option>
          <option value="Highlight">Highlight</option>
          <option value="Wait">Wait</option>
        </select>
        
        {action.type !== 'Wait' && (
          <select
            value={action.template_id || ''}
            onChange={(e) => onUpdate({ ...action, template_id: e.target.value })}
            disabled={readOnly}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="">Select template</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.id}</option>
            ))}
          </select>
        )}
        
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={action.duration || ''}
            onChange={(e) => onUpdate({ 
              ...action, 
              duration: e.target.value ? parseFloat(e.target.value) : undefined 
            })}
            disabled={readOnly}
            placeholder="Duration"
            step="0.1"
            min="0"
            className="text-sm"
          />
          
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
