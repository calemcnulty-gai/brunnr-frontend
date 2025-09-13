import { NextRequest, NextResponse } from 'next/server'

// Allow functions to run for up to 5 minutes on Vercel
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout
    
    try {
      const response = await fetch('http://localhost:8000/content/lesson-to-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.BRUNNR_API_KEY || 'your-api-key',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error response:', errorText)
        return NextResponse.json(
          { error: `Backend error: ${response.status}`, details: errorText },
          { status: response.status }
        )
      }
      
      const data = await response.json()
      return NextResponse.json(data)
      
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout after 2 minutes')
        return NextResponse.json(
          { error: 'Request timeout', details: 'The request took longer than 2 minutes and was cancelled' },
          { status: 504 }
        )
      }
      
      throw fetchError
    }
    
  } catch (error) {
    console.error('Lesson to video proxy error:', error)
    
    // Check if it's a connection error
    if (error instanceof Error && 'cause' in error) {
      const cause = error.cause as any
      if (cause?.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { error: 'Backend server not available', details: 'Please ensure the backend is running on http://localhost:8000' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate video from lesson', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

