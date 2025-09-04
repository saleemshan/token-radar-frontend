import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const urlParam = searchParams.get('url')

    // Handle missing url param
    if (!urlParam) {
        return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
    }

    let targetUrl: string
    try {
        targetUrl = decodeURIComponent(urlParam)
        new URL(targetUrl) // validate URL
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    try {
        const res = await fetch(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (PreviewBot)' },
        })

        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch target page' }, { status: res.status })
        }

        const html = await res.text()

        // --- Metadata extraction helpers ---
        const getMeta = (name: string, attr: 'property' | 'name' = 'property') => {
            const regex = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i')
            const match = html.match(regex)
            return match?.[1] || ''
        }

        const getTitle = () => {
            return getMeta('og:title') || html.match(/<title>([^<]*)<\/title>/i)?.[1] || ''
        }

        const getDescription = () => {
            return getMeta('og:description') || getMeta('description', 'name') || ''
        }

        const getImage = () => {
            return getMeta('og:image') || ''
        }

        const getSiteName = () => {
            return getMeta('og:site_name') || new URL(targetUrl).hostname
        }

        const getFavicon = () => {
            const match = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)
            let href = match?.[1] || '/favicon.ico'
            // Handle relative favicon URLs
            try {
                href = new URL(href, targetUrl).href
            } catch {
                href = ''
            }
            return href
        }

        const data = {
            title: getTitle(),
            description: getDescription(),
            image: getImage(),
            siteName: getSiteName(),
            favicon: getFavicon(),
        }

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch preview' }, { status: 500 })
    }
}
