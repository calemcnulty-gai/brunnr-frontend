import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const url = `http://localhost:8000/media/videos/${path}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      )
    }
    
    // Stream the video content
    const contentType = response.headers.get('content-type') || 'video/mp4'
    const contentLength = response.headers.get('content-length')
    
    const headers: HeadersInit = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    }
    
    if (contentLength) {
      headers['Content-Length'] = contentLength
    }
    
    // Stream the response body
    const body = response.body
    if (!body) {
      return NextResponse.json(
        { error: 'No content from backend' },
        { status: 500 }
      )
    }
    
    return new NextResponse(body, {
      status: 200,
      headers,
    })
    
  } catch (error) {
    console.error('Video proxy error:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}
