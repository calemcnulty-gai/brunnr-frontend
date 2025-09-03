import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300 // 5 minutes timeout for Vercel

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Make request to backend with extended timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout
    
    const response = await fetch('http://localhost:8000/media/manifest-to-shotgroup-videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
