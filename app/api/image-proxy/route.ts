// /app/api/image-proxy/route.ts

import { NextRequest, NextResponse } from 'next/server'

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'Invalid request, url is required' }, { status: 400 })
    }

    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`)
        }

        const contentType = response.headers.get('content-type') || 'image/svg+xml'
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=86400',
            },
        })
    } catch (error) {
        console.error('Image proxy error:', error)
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
    }
}
