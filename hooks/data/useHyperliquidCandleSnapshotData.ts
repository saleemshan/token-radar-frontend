import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Interval } from '../../types/hyperliquid'

interface CandleSnapshotResponse {
    t: number
    T: number
    s: string
    i: string
    o: string
    c: string
    h: string
    l: string
    v: string
    n: number
}

const getCandleSnapshot = async (coin: string, endTime: number, startTime: number, interval: Interval = '15m'): Promise<CandleSnapshotResponse[]> => {
    if (!coin || !endTime || !startTime) {
        throw new Error('Invalid parameters')
    }

    const res = await axios.post('/api/hyperliquid/candle-snapshot', {
        coin,
        endTime,
        interval,
        startTime,
    })

    if (!res.data) {
        throw new Error('Failed to get candle snapshot')
    }

    return res.data.data
}

export const useHyperliquidCandleSnapshotData = (
    coin?: string,
    endTime?: number,
    startTime?: number,
    interval: Interval = '15m',
    options: {
        refetchInterval?: number
        enabled?: boolean
    } = {
        refetchInterval: undefined,
        enabled: true,
    }
) => {
    return useQuery({
        queryKey: ['hyperliquid-candle-snapshot'],
        queryFn: async () => await getCandleSnapshot(coin as string, endTime as number, startTime as number, interval),
        enabled: Boolean(coin) && Boolean(endTime) && Boolean(startTime) && options.enabled,
        refetchInterval: options.refetchInterval,
    })
}

export default useHyperliquidCandleSnapshotData
