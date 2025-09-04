import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { 
  updateProjectWithManifest,
  downloadAndSaveImage,
  uploadImages
} from '@/lib/supabase/queries'
import { cookies } from 'next/headers'

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
        await updateProjectWithManifest(
          projectId,
          data.manifest,
          {
            shotgroupResponse: {
              response: data,
              timestamp: new Date().toISOString(),
              requestId: data.metadata?.request_id
            }
          },
          templateImages.length > 0 ? templateImages : undefined,
          data.shotgroups
        )
      } catch (saveError) {
        console.error('Failed to save to Supabase:', saveError)
        // Don't fail the request if saving fails, just log it
      }
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
