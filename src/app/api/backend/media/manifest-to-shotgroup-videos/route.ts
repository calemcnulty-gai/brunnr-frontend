import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 300 // 5 minutes timeout for Vercel

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, userId } = body // Expect these to be passed from client
    
    // Make request to backend with extended timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/manifest-to-shotgroup-videos`, {
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
        
        // Create server-side Supabase client with proper auth context
        const supabase = await createClient()
        
        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          throw new Error('User not authenticated')
        }
        
        // Verify user owns this project
        if (user.id !== userId) {
          throw new Error('User ID mismatch - unauthorized')
        }
        
        // Save template images if they exist
        const templateImages = []
        if (data.template_images && Array.isArray(data.template_images)) {
          for (const img of data.template_images) {
            if (img.download_url) {
              try {
                // Download the image
                const imageResponse = await fetch(img.download_url)
                if (!imageResponse.ok) {
                  console.error(`Failed to download image: ${img.download_url}`)
                  continue
                }
                
                const imageBlob = await imageResponse.blob()
                const fileName = `${userId}/${projectId}/template_${img.id}.png`
                
                // Upload to Supabase storage using server client
                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from('images')
                  .upload(fileName, imageBlob, {
                    upsert: true,
                    cacheControl: '3600'
                  })
                
                if (uploadError) {
                  console.error('Failed to upload image:', uploadError)
                  continue
                }
                
                templateImages.push({
                  ...img,
                  storagePath: uploadData.path
                })
              } catch (imgError) {
                console.error('Error processing image:', imgError)
              }
            }
          }
        }
        
        // Update project with shotgroup data using server client
        const updates = {
          manifest: data.manifest || body.manifest,
          api_responses: {
            shotgroupResponse: {
              response: data,
              timestamp: new Date().toISOString(),
              requestId: data.metadata?.request_id
            }
          },
          template_images: templateImages.length > 0 ? templateImages : null,
          shotgroups: data.shotgroups || [],
          updated_at: new Date().toISOString()
        }
        
        const { data: updateData, error: updateError } = await supabase
          .from('projects')
          .update(updates)
          .eq('id', projectId)
          .select()
          .single()
        
        if (updateError) {
          throw updateError
        }
        
        console.log('Successfully saved shotgroups to Supabase:', updateData.id)
        
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
