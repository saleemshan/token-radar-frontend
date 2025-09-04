import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface NewsIndicator {
    symbol: string
    nrs: {
        signal: string
        action: string
        rvol: number
        pctMove: number
        priceVolRatio: number
        vwpdClose: number
        vwpdHigh: number
        vwpdDecay: number
        highCloseRatio: number
    }
    momentum: {
        rvol: number
        pvRatio: number
        vwpd: number
        vwpdClose: number
        netVol: number
        exhaustionScore: number | null
        barElapsed: number
    }
}

export interface NewsIndicatorsResponse {
    indicators: NewsIndicator[]
}

const getNewsIndicators = async (newsId: string): Promise<NewsIndicatorsResponse> => {
    if (!newsId) {
        throw new Error('News ID is required')
    }

    const res = await axios.get(`/api/news-trading/feed/${newsId}/indicators`)

    if (!res.data.data || !res.data.data.indicators) {
        throw new Error('No indicators data found')
    }

    return res.data.data
}

export const useNewsIndicatorsData = (newsId: string | undefined, { enabled = true }: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['newsIndicators', newsId],
        queryFn: () => getNewsIndicators(newsId!),
        enabled: enabled && !!newsId,
    })
}
