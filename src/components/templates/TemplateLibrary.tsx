/**
 * @fileoverview Template Library component with preset manifest templates
 * @module components/templates/TemplateLibrary
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Copy, 
  Download, 
  Eye, 
  Star,
  StarOff,
  FileJson,
  Sparkles,
  GraduationCap,
  Calculator,
  Microscope,
  Code,
  BookOpen,
  Presentation,
  Clock
} from 'lucide-react'
import type { Manifest } from '@/lib/validation/manifest'
import { cn } from '@/lib/utils'
import { useManifestTemplates, type ManifestTemplate } from '@/hooks/use-manifest-templates'

interface Template {
  id: string
  name: string
  description: string
  category: 'educational' | 'tutorial' | 'explanation' | 'demo' | 'custom'
  icon: React.ReactNode
  tags: string[]
  manifest: Manifest
  estimatedDuration: number
  complexity: 'beginner' | 'intermediate' | 'advanced'
  isFavorite?: boolean
}

interface TemplateLibraryProps {
  onSelectTemplate: (manifest: Manifest) => void
  onClose?: () => void
}

// Preset templates
const presetTemplates: Template[] = [
  {
    id: 'math-explanation',
    name: 'Math Concept Explanation',
    description: 'Perfect for explaining mathematical concepts with formulas and step-by-step solutions',
    category: 'educational',
    icon: <Calculator className="h-5 w-5" />,
    tags: ['math', 'education', 'formulas'],
    estimatedDuration: 120,
    complexity: 'intermediate',
    manifest: {
      video_id: 'math_explanation',
      templates: [
        {
          id: 'title',
          type: 'Text',
          content: 'Mathematical Concept',
          style: { color: '#1F2937', fontSize: 48 }
        },
        {
          id: 'formula',
          type: 'MathTex',
          content: 'a^2 + b^2 = c^2',
          style: { color: '#3B82F6' }
        },
        {
          id: 'explanation_text',
          type: 'Text',
          content: 'Let\'s break this down step by step...',
          style: { color: '#6B7280', fontSize: 24 }
        }
      ],
      shots: [
        {
          voiceover: 'Today we\'ll explore an important mathematical concept.',
          actions: [
            { type: 'FadeIn', template_id: 'title', duration: 1.0 }
          ]
        },
        {
          voiceover: 'This formula represents the relationship between the sides of a right triangle.',
          actions: [
            { type: 'FadeOut', template_id: 'title', duration: 0.5 },
            { type: 'Write', template_id: 'formula', duration: 2.0 }
          ]
        },
        {
          voiceover: 'Let\'s understand what each component means.',
          actions: [
            { type: 'FadeIn', template_id: 'explanation_text', duration: 1.0 }
          ]
        }
      ]
    }
  },
  {
    id: 'science-demo',
    name: 'Science Demonstration',
    description: 'Ideal for demonstrating scientific concepts with visual animations',
    category: 'demo',
    icon: <Microscope className="h-5 w-5" />,
    tags: ['science', 'demo', 'visual'],
    estimatedDuration: 180,
    complexity: 'intermediate',
    manifest: {
      video_id: 'science_demo',
      templates: [
        {
          id: 'title',
          type: 'Text',
          content: 'Scientific Principle',
          style: { color: '#059669', fontSize: 48 }
        },
        {
          id: 'diagram',
          type: 'circle',
          style: { color: '#10B981' }
        },
        {
          id: 'label1',
          type: 'Text',
          content: 'Component A',
          style: { color: '#6B7280', fontSize: 20 }
        }
      ],
      shots: [
        {
          voiceover: 'Let\'s explore this fascinating scientific principle.',
          actions: [
            { type: 'FadeIn', template_id: 'title', duration: 1.5 }
          ]
        },
        {
          voiceover: 'Here we can see the main components of our system.',
          actions: [
            { type: 'Transform', template_id: 'title', target_template_id: 'diagram', duration: 1.0 },
            { type: 'FadeIn', template_id: 'label1', duration: 0.5 }
          ]
        }
      ]
    }
  },
  {
    id: 'code-tutorial',
    name: 'Code Tutorial',
    description: 'Step-by-step programming tutorial with code snippets',
    category: 'tutorial',
    icon: <Code className="h-5 w-5" />,
    tags: ['programming', 'tutorial', 'code'],
    estimatedDuration: 240,
    complexity: 'advanced',
    manifest: {
      video_id: 'code_tutorial',
      templates: [
        {
          id: 'title',
          type: 'Text',
          content: 'Programming Tutorial',
          style: { color: '#7C3AED', fontSize: 48 }
        },
        {
          id: 'code_block',
          type: 'Text',
          content: 'function example() {\n  return "Hello World";\n}',
          style: { color: '#1F2937', fontSize: 20 }
        },
        {
          id: 'highlight',
          type: 'rectangle',
          style: { color: '#FCD34D', opacity: 0.3 }
        }
      ],
      shots: [
        {
          voiceover: 'Welcome to this programming tutorial.',
          actions: [
            { type: 'FadeIn', template_id: 'title', duration: 1.0 }
          ]
        },
        {
          voiceover: 'Let\'s start by looking at a simple function.',
          actions: [
            { type: 'FadeOut', template_id: 'title', duration: 0.5 },
            { type: 'Write', template_id: 'code_block', duration: 2.0 }
          ]
        },
        {
          voiceover: 'Notice how the function returns a string value.',
          actions: [
            { type: 'FadeIn', template_id: 'highlight', duration: 0.5 },
            { type: 'Indicate', template_id: 'code_block', duration: 1.0 }
          ]
        }
      ]
    }
  },
  {
    id: 'simple-explanation',
    name: 'Simple Explanation',
    description: 'Basic template for straightforward explanations',
    category: 'explanation',
    icon: <BookOpen className="h-5 w-5" />,
    tags: ['simple', 'basic', 'explanation'],
    estimatedDuration: 60,
    complexity: 'beginner',
    manifest: {
      video_id: 'simple_explanation',
      templates: [
        {
          id: 'main_text',
          type: 'Text',
          content: 'Your Topic Here',
          style: { color: '#1F2937', fontSize: 36 }
        },
        {
          id: 'bullet1',
          type: 'Text',
          content: '• First point',
          style: { color: '#6B7280', fontSize: 24 }
        },
        {
          id: 'bullet2',
          type: 'Text',
          content: '• Second point',
          style: { color: '#6B7280', fontSize: 24 }
        }
      ],
      shots: [
        {
          voiceover: 'Let me explain this concept simply.',
          actions: [
            { type: 'FadeIn', template_id: 'main_text', duration: 1.0 }
          ]
        },
        {
          voiceover: 'First, we need to understand this point.',
          actions: [
            { type: 'FadeIn', template_id: 'bullet1', duration: 0.5 }
          ]
        },
        {
          voiceover: 'Second, consider this aspect.',
          actions: [
            { type: 'FadeIn', template_id: 'bullet2', duration: 0.5 }
          ]
        }
      ]
    }
  }
]

export function TemplateLibrary({ onSelectTemplate, onClose }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  
  // Fetch manifest templates from Supabase
  const { templates: manifestTemplates, isLoading, error } = useManifestTemplates()
  const [allTemplates, setAllTemplates] = useState<Template[]>(presetTemplates)
  
  // Convert ManifestTemplates to Template format and combine with presets
  useEffect(() => {
    if (manifestTemplates.length > 0) {
      const convertedTemplates: Template[] = manifestTemplates.map(mt => ({
        id: mt.video_id,
        name: mt.title,
        description: mt.description || `${mt.subject} - ${mt.content_kind}`,
        category: mt.subject === 'math' ? 'educational' : 
                 mt.subject === 'geometry' ? 'educational' : 'explanation' as const,
        icon: mt.subject === 'math' ? <Calculator className="h-5 w-5" /> :
              mt.subject === 'geometry' ? <Microscope className="h-5 w-5" /> :
              <BookOpen className="h-5 w-5" />,
        tags: [mt.subject, mt.content_kind, mt.grade_level || ''].filter(Boolean),
        manifest: mt.manifest as Manifest,
        estimatedDuration: 90, // Default duration
        complexity: 'intermediate' as const,
        isFavorite: false
      }))
      
      // Combine with preset templates
      setAllTemplates([...convertedTemplates, ...presetTemplates])
    }
  }, [manifestTemplates])
  
  // Filter templates
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity
    
    return matchesSearch && matchesCategory && matchesComplexity
  })
  
  // Toggle favorite
  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId)
    } else {
      newFavorites.add(templateId)
    }
    setFavorites(newFavorites)
  }
  
  // Use template
  const handleUseTemplate = (template: Template) => {
    onSelectTemplate(template.manifest)
    onClose?.()
  }
  
  // Export template
  const handleExportTemplate = (template: Template) => {
    const blob = new Blob([JSON.stringify(template.manifest, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `template-${template.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const categoryIcons = {
    educational: <GraduationCap className="h-4 w-4" />,
    tutorial: <Presentation className="h-4 w-4" />,
    explanation: <BookOpen className="h-4 w-4" />,
    demo: <Sparkles className="h-4 w-4" />,
    custom: <FileJson className="h-4 w-4" />
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading manifest templates...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load templates: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">All Categories</option>
          <option value="educational">Educational</option>
          <option value="tutorial">Tutorial</option>
          <option value="explanation">Explanation</option>
          <option value="demo">Demo</option>
        </select>
        
        <select
          value={selectedComplexity}
          onChange={(e) => setSelectedComplexity(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      
      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <Card 
            key={template.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {categoryIcons[template.category]}
                        <span className="ml-1">{template.category}</span>
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          template.complexity === 'beginner' && "text-green-600 border-green-600",
                          template.complexity === 'intermediate' && "text-yellow-600 border-yellow-600",
                          template.complexity === 'advanced' && "text-red-600 border-red-600"
                        )}
                      >
                        {template.complexity}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(template.id)
                  }}
                >
                  {favorites.has(template.id) ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <CardDescription className="mb-3">
                {template.description}
              </CardDescription>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>~{Math.floor(template.estimatedDuration / 60)} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileJson className="h-3 w-3" />
                  <span>{template.manifest.shots.length} shots</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleUseTemplate(template)}
                >
                  <Copy className="mr-2 h-3 w-3" />
                  Use Template
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportTemplate(template)}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No templates found matching your criteria</p>
          </CardContent>
        </Card>
      )}
      
      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[80vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{previewTemplate.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewTemplate(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(previewTemplate.manifest, null, 2)}
              </pre>
              
              <div className="flex items-center gap-2 mt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleUseTemplate(previewTemplate)
                    setPreviewTemplate(null)
                  }}
                >
                  Use This Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportTemplate(previewTemplate)}
                >
                  Export JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
