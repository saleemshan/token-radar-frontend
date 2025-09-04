import { NewsItem } from '@/types/newstrading'
import { BASE_URL } from '@/utils/string'
import { redirect } from 'next/navigation'

type Props = {
    params: { slug: string }
}

export const dynamic = 'force-dynamic'

const DEFAULT_METADATA = {
    title: 'Crush AI - Trade News',
    description: 'Latest trading news and insights from Crush AI',
    openGraph: {
        title: 'Crush AI - Trade News',
        description: 'Stay updated with the latest trading news',
        // images: ['https://res.cloudinary.com/crush-xyz/image/upload/v1749704184/crush-trade-news-meta-image.jpg'],
        creators: ['@CrushProtocol'],
    },
}

async function getSEOData(slug: string): Promise<NewsItem> {
    const res = await fetch(`${BASE_URL}/api/news-trading/feed/search?query=${slug}`, {
        cache: 'no-store',
    })

    if (!res.ok) throw new Error(`Failed to fetch news data: ${res.status}`)

    const data = await res.json()

    if (!data?.data?.news?.length) {
        throw new Error('No news data found')
    }

    return data.data.news[0]
}

export async function generateMetadata({ params }: Props) {
    try {
        const data = await getSEOData(params.slug)
        return {
            ...DEFAULT_METADATA,
            description: data.headline,
            openGraph: {
                ...DEFAULT_METADATA.openGraph,
                description: data.headline,
            },
        }
    } catch (error) {
        console.error('Failed to generate metadata:', error)
        return DEFAULT_METADATA
    }
}

export default async function NewsPage({ params }: Props) {
    redirect(`/?query=${params.slug}`)
}
