import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { PerpetualsMetaCtxsResponse } from '@/types/hyperliquid'

const getPerpetualsMetaCtxs = async (): Promise<PerpetualsMetaCtxsResponse['data']> => {
    const res = await axios.get('/api/hyperliquid/perpetuals-meta-ctxs')

    if (!res.data.data) {
        throw new Error('No perpetuals meta data found')
    }

    return res.data.data
}

export const useHyperliquidPerpetualsMetaCtxs = () => {
    return useQuery({
        queryKey: ['hyperliquid-perpetuals-meta-ctxs'],
        queryFn: () => getPerpetualsMetaCtxs(),
        refetchInterval: 60000, // Refresh every minute
    })
}
