import { NextResponse, type NextRequest } from 'next/server'

export function apiProtectionMiddleware(request: NextRequest) {
    // Get the request origin and referer
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const host = request.headers.get('host')

    // Check if the request is for an API route
    if (request.nextUrl.pathname.startsWith('/api/')) {
        // Development environment check
        if (host?.includes('localhost') || host?.includes('127.0.0.1')) {
            // In development, only allow requests from localhost
            if (origin) {
                const originUrl = new URL(origin)
                if (!originUrl.hostname.includes('localhost') && !originUrl.hostname.includes('127.0.0.1')) {
                    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
                        status: 403,
                        statusText: 'Forbidden',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                }
            }
            return NextResponse.next()
        }

        // Allow internal server-side fetches
        if (!origin && !referer) {
            return NextResponse.next()
        }

        // Production external/browser requests
        if (!origin && !referer) {
            // Block direct access in production
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
                status: 403,
                statusText: 'Forbidden',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        }

        // Check if the origin matches our hostname
        const isValidOrigin = origin ? new URL(origin).hostname === request.nextUrl.hostname : false
        const isValidReferer = referer ? new URL(referer).hostname === request.nextUrl.hostname : false

        if (!isValidOrigin && !isValidReferer) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
                status: 403,
                statusText: 'Forbidden',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        }
    }

    return NextResponse.next()
}
