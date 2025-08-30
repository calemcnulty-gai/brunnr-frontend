/**
 * @fileoverview API proxy route for Brunnr service
 * @module app/api/brunnr
 */

import { NextRequest, NextResponse } from 'next/server'

const BRUNNR_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://brunnr-service-production.up.railway.app'
const BRUNNR_API_KEY = process.env.BRUNNR_API_KEY || ''

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PUT')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PATCH')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Construct the full path
    const path = pathSegments.join('/')
    const url = new URL(`${BRUNNR_API_URL}/${path}`)
    
    // Copy query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })
    
    // Prepare headers
    const headers: HeadersInit = {
      'X-API-Key': BRUNNR_API_KEY,
      'Content-Type': 'application/json',
    }
    
    // Prepare options
    const options: RequestInit = {
      method,
      headers,
    }
    
    // Add body for non-GET requests
    if (method !== 'GET' && request.body) {
      const body = await request.text()
      options.body = body
    }
    
    // Make the request
    const response = await fetch(url.toString(), options)
    
    // Handle binary responses (like video files)
    const contentType = response.headers.get('content-type')
    if (contentType && (contentType.includes('video') || contentType.includes('octet-stream'))) {
      const blob = await response.blob()
      return new NextResponse(blob, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': contentType,
          'Content-Length': response.headers.get('content-length') || '',
        },
      })
    }
    
    // Handle text/JSON responses
    const responseText = await response.text()
    
    return new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal proxy error', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
