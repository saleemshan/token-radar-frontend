import { UserFill } from '@/types/hyperliquid'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface UserFillsFilters {
    user?: string
    startTime?: string
    endTime?: string
    aggregateByTime?: boolean
}

const getData = async (filter: UserFillsFilters): Promise<UserFill[]> => {
    const payload = {
        user: filter.user,
        startTime: filter.startTime ? parseInt(filter.startTime) * 1000 : undefined,
        endTime: filter.endTime ? parseInt(filter.endTime) * 1000 : new Date().getTime(),
        aggregateByTime: filter.aggregateByTime || true,
    }

    const res = await axios.post('/api/hyperliquid/user-fills', payload)

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
        throw new Error('No data found')
    }

    return res.data.data
}

const useHyperliquidUserFillsData = (filter: UserFillsFilters, setting?: { refetchInterval: number; refetchOnWindowFocus: boolean }) => {
    return useQuery({
        queryKey: ['hyperliquidUserFills', filter],
        queryFn: async () => await getData(filter),
        enabled: Boolean(filter.user),
        refetchInterval: setting?.refetchInterval ?? 10000,
        // retry: false,
        refetchOnWindowFocus: setting?.refetchOnWindowFocus ?? false,
    })
}

export default useHyperliquidUserFillsData
