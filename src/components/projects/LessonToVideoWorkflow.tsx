'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Search, Video, BookOpen, ChevronDown } from 'lucide-react'
import { lessonToVideo } from '@/lib/api/endpoints'
import { useUpdateProject } from '@/hooks/use-projects'
import lessonsData from '@/lib/utils/lessons.json'
import type { Project } from '@/types/database'

interface Lesson {
  lesson_step_id: number
  content_id: string
  step_type: string
  topic_id: number
  course_id: number
  generation_id: number
  generated_html: string
  batch_id: number
  model: string
  scraped_screenshot_url?: string
  screenshot_url?: string
  validation_status: string
  enhanced_at?: string
  widgets_detected?: number
  validation_updated_at?: string
  enhanced?: boolean
}

interface LessonWithTitle extends Lesson {
  title: string
}

interface LessonToVideoWorkflowProps {
  projectId: string
}

export function LessonToVideoWorkflow({ projectId }: LessonToVideoWorkflowProps) {
  const router = useRouter()
  const updateProject = useUpdateProject()
  const [selectedLesson, setSelectedLesson] = useState<LessonWithTitle | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownSearchQuery, setDropdownSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('#lesson-dropdown') && !target.closest('.z-20')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isDropdownOpen])

  // Extract title from HTML content
  const extractTitleFromHtml = (html: string): string => {
    // Try to extract from <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) return titleMatch[1]?.trim() || ''
    
    // Try to extract from first <h1> or <h2>
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    if (h1Match) return h1Match[1]?.trim() || ''
    
    const h2Match = html.match(/<h2[^>]*>([^<]+)<\/h2>/i)
    if (h2Match) return h2Match[1]?.trim() || ''
    
    // Fallback to lesson type and ID
    return `Lesson ${html.substring(0, 50)}...`
  }

  // Process lessons to include titles
  const lessonsWithTitles: LessonWithTitle[] = useMemo(() => {
    const rawLessons = lessonsData.examples as Lesson[]
    return rawLessons.map(lesson => ({
      ...lesson,
      title: extractTitleFromHtml(lesson.generated_html)
    }))
  }, [])

  // Filter lessons based on dropdown search query - show all if no query
  const filteredLessons = useMemo(() => {
    // Always return all lessons if no search query
    if (!dropdownSearchQuery.trim()) {
      return lessonsWithTitles
    }
    
    const query = dropdownSearchQuery.toLowerCase()
    return lessonsWithTitles.filter(lesson => 
      lesson.title.toLowerCase().includes(query) ||
      lesson.content_id.toLowerCase().includes(query) ||
      lesson.step_type.toLowerCase().includes(query) ||
      lesson.lesson_step_id.toString().includes(query)
    )
  }, [dropdownSearchQuery, lessonsWithTitles])

  const handleLessonSelect = (lesson: LessonWithTitle) => {
    setSelectedLesson(lesson)
    setIsDropdownOpen(false)
    setDropdownSearchQuery('') // Reset search when selecting
    setVideoUrl(null)
    setError(null)
  }

  const handleGenerateVideo = async () => {
    if (!selectedLesson) {
      setError('Please select a lesson first')
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress('Preparing lesson for video generation...')

    try {
      // Update project status
      await updateProject.mutateAsync({
        projectId,
        updates: {
          status: 'generating',
          data: { 
            lesson_step_id: selectedLesson.lesson_step_id,
            lessonTitle: selectedLesson.title
          } as any
        }
      })

      setProgress('Generating video from lesson content...')
      
      // Format the lesson for the API
      const lessonPayload = {
        lesson_step_id: selectedLesson.lesson_step_id,
        content_id: selectedLesson.content_id,
        step_type: selectedLesson.step_type,
        topic_id: selectedLesson.topic_id,
        course_id: selectedLesson.course_id,
        generation_id: selectedLesson.generation_id,
        generated_html: selectedLesson.generated_html,
        batch_id: selectedLesson.batch_id,
        model: selectedLesson.model,
        scraped_screenshot_url: selectedLesson.scraped_screenshot_url,
        screenshot_url: selectedLesson.screenshot_url,
        validation_status: selectedLesson.validation_status,
        enhanced_at: selectedLesson.enhanced_at,
        widgets_detected: selectedLesson.widgets_detected,
        validation_updated_at: selectedLesson.validation_updated_at,
        enhanced: selectedLesson.enhanced
      }

      const response = await lessonToVideo({
        lessons: [lessonPayload]
      })

      // Check for video URL in the response structure
      let finalVideoUrl = ''
      
      // Handle the actual API response structure
      if (response.results && response.results.length > 0 && response.results[0]?.video_url) {
        finalVideoUrl = response.results[0].video_url
      } else if (response.video_url) {
        finalVideoUrl = response.video_url
      } else if (response.download_url) {
        finalVideoUrl = response.download_url
      }

      if (finalVideoUrl) {
        // If it's a localhost URL, proxy it through our backend route
        if (finalVideoUrl.includes('localhost:8000')) {
          finalVideoUrl = finalVideoUrl.replace('http://localhost:8000', '/api/backend')
        }
        
        setVideoUrl(finalVideoUrl)
        
        // Update project with video URL
        await updateProject.mutateAsync({
          projectId,
          updates: {
            status: 'completed',
            video_url: finalVideoUrl,
            api_responses: { lessonToVideo: response }
          }
        })
        
        setProgress('Video generated successfully!')
      } else {
        console.error('API Response:', response)
        throw new Error('No video URL found in API response')
      }
    } catch (err) {
      console.error('Error generating video:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate video')
      setProgress('')
      
      // Update project status to failed
      await updateProject.mutateAsync({
        projectId,
        updates: {
          status: 'failed',
          data: { error_message: err instanceof Error ? err.message : 'Unknown error' } as any
        }
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Lesson Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select a Lesson
          </CardTitle>
          <CardDescription>
            Choose from our library of validated educational lessons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Label htmlFor="lesson-dropdown">Available Lessons</Label>
            <div className="relative mt-1">
              <button
                id="lesson-dropdown"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
              >
                <span className={selectedLesson ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedLesson ? selectedLesson.title : 'Select a lesson...'}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Search Input (when dropdown is open) */}
              {isDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        value={dropdownSearchQuery}
                        onChange={(e) => setDropdownSearchQuery(e.target.value)}
                        placeholder="Search lessons..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  {/* Lesson List */}
                  <div className="max-h-60 overflow-auto">
                    {filteredLessons.map((lesson) => (
                      <button
                        key={lesson.lesson_step_id}
                        onClick={() => handleLessonSelect(lesson)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-sm text-gray-900">
                          {lesson.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {lesson.step_type} • Lesson {lesson.lesson_step_id} • Content ID: {lesson.content_id}
                        </div>
                      </button>
                    ))}
                    {filteredLessons.length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No lessons found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Lesson Info */}
          {selectedLesson && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Selected: {selectedLesson.title}</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p><span className="font-medium">Type:</span> {selectedLesson.step_type}</p>
                <p><span className="font-medium">Lesson ID:</span> {selectedLesson.lesson_step_id}</p>
                <p><span className="font-medium">Status:</span> <span className="capitalize">{selectedLesson.validation_status}</span></p>
                {selectedLesson.widgets_detected !== undefined && (
                  <p><span className="font-medium">Interactive Elements:</span> {selectedLesson.widgets_detected}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* HTML Preview with Video */}
      {selectedLesson && (
        <Card>
          <CardHeader>
            <CardTitle>Lesson Content {videoUrl ? 'with Video' : 'Preview'}</CardTitle>
            <CardDescription>
              {videoUrl 
                ? 'The generated video has been added to your lesson content'
                : 'Review the lesson content before generating the video'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Insert video at the top if it exists */}
            {videoUrl && (
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">
                  Mastery in a Minute
                </h2>
                <div className="max-w-2xl mx-auto rounded-lg overflow-hidden shadow-lg">
                  <video 
                    controls 
                    className="w-full"
                    src={videoUrl}
                    poster=""
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <p className="text-sm text-gray-600 text-center mt-3">
                  Watch this quick video summary before diving into the lesson
                </p>
              </div>
            )}
            
            {/* Original lesson HTML content with proper styling */}
            <div className="p-6 w-full">
              <div 
                className="lesson-html-content w-full"
                style={{ 
                  maxWidth: '100%', 
                  width: '100%',
                  overflow: 'hidden'
                }}
                dangerouslySetInnerHTML={{ __html: selectedLesson.generated_html }} 
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Video Button */}
      {selectedLesson && !videoUrl && (
        <Card>
          <CardContent className="pt-6">
            {progress && !error && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">{progress}</p>
              </div>
            )}
            <Button
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {progress || 'Generating Video...'}
                </>
              ) : (
                <>
                  <Video className="mr-2 h-5 w-5" />
                  Generate Video from Lesson
                </>
              )}
            </Button>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons after video generation */}
      {videoUrl && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                <Video className="h-5 w-5" />
                <span className="font-medium">Video successfully generated and added to lesson!</span>
              </div>
              <Button
                onClick={() => router.push(`/project/${projectId}/video`)}
                className="w-full"
                variant="outline"
              >
                View Full Video Page
              </Button>
              <Button
                onClick={() => {
                  setVideoUrl(null)
                  setSelectedLesson(null)
                  setDropdownSearchQuery('')
                  setProgress('')
                }}
                className="w-full"
              >
                Generate Video for Another Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
