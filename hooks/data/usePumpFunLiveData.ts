import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface PumpFunLiveToken {
    mint: string
    symbol: string
    name: string
    description: string
    image_uri: string
    creator: string
    created_timestamp: number
    reply_count: number
    is_currently_live: boolean
    thumbnail: string
    num_participants: number
    complete: boolean
    website: string | null
    twitter: string | null
    telegram: string | null
    market_cap: number
    nsfw: boolean
    usd_market_cap: number
}

interface PumpFunLiveParams {
    offset?: number
    limit?: number
    sort?: string
    order?: 'ASC' | 'DESC'
    includeNsfw?: boolean
}

const getPumpFunLiveTokens = async (params: PumpFunLiveParams): Promise<PumpFunLiveToken[]> => {
    const res = await axios.get('/api/pumpfun/currently-live', {
        params: {
            offset: params.offset || 0,
            limit: params.limit || 48,
            sort: params.sort || 'currently_live',
            order: params.order || 'DESC',
            includeNsfw: params.includeNsfw || false,
        },
    })

    if (!res.data.data || res.data.data.length === 0) {
        throw new Error('No data found')
    }

    return res.data.data
}

const usePumpFunLiveData = (params: PumpFunLiveParams = {}) => {
    return useQuery({
        queryKey: ['pumpFunLiveData', params],
        queryFn: async () => await getPumpFunLiveTokens(params),
        refetchInterval: 5000, // Refresh every 5 seconds for live data
        retry: 2,
    })
}

export default usePumpFunLiveData
export type { PumpFunLiveToken, PumpFunLiveParams }
