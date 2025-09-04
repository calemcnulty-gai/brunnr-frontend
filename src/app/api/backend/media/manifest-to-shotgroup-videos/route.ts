import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  updateProjectWithManifest,
  downloadAndSaveImage,
  uploadImages
} from '@/lib/supabase/queries'

export const maxDuration = 300 // 5 minutes timeout for Vercel

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, userId } = body // Expect these to be passed from client
    
    // Make request to backend with extended timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout
    
    const response = await fetch('http://localhost:8000/media/manifest-to-shotgroup-videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body.manifest || body),
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${errorText}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // If we have project and user IDs, save the data to Supabase
    if (projectId && userId) {
      try {
        console.log(`Saving shotgroups for project ${projectId}, user ${userId}`)
        console.log(`Shotgroups to save: ${data.shotgroups?.length || 0}`)
        
        // Save template images if they exist
        const templateImages = []
        if (data.template_images && Array.isArray(data.template_images)) {
          for (const img of data.template_images) {
            if (img.download_url) {
              const imagePath = await downloadAndSaveImage(
                img.download_url,
                userId,
                projectId,
                `template_${img.id}.png`
              )
              templateImages.push({
                ...img,
                storagePath: imagePath
              })
            }
          }
        }
        
        // Update project with shotgroup data
        const result = await updateProjectWithManifest(
          projectId,
          data.manifest || body.manifest,
          {
            shotgroupResponse: {
              response: data,
              timestamp: new Date().toISOString(),
              requestId: data.metadata?.request_id
            }
          },
          templateImages.length > 0 ? templateImages : undefined,
          data.shotgroups || []
        )
        
        console.log('Successfully saved shotgroups to Supabase:', result.id)
        
        // Add the saved flag to response
        data.savedToSupabase = true
      } catch (saveError) {
        console.error('Failed to save to Supabase:', saveError)
        // Return error in response so frontend knows
        data.saveError = saveError instanceof Error ? saveError.message : 'Unknown error'
        data.savedToSupabase = false
      }
    } else {
      console.warn('Missing projectId or userId, skipping Supabase save')
      data.savedToSupabase = false
    }
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Proxy error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - video generation took too long' },
          { status: 504 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
