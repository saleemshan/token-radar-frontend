import { useQuery } from '@tanstack/react-query'
import axiosLib from '@/lib/axios'

const getUnstakingQueue = async (): Promise<UnstakingQueueData> => {
    const res = await axiosLib.get('/api/unstaking-queue')

    if (res.data.code !== 0) {
        throw new Error(res.data.message || 'Failed to fetch unstaking queue')
    }

    if (!res.data.data) {
        throw new Error('No data found')
    }

    return res.data.data
}

const useUnstakingQueueData = () => {
    return useQuery({
        queryKey: ['unstakingQueue'],
        queryFn: getUnstakingQueue,
        refetchOnMount: false,
        refetchOnWindowFocus: true,
        refetchInterval: 30000, // Refresh every 30 seconds
        staleTime: 30000, // Consider data stale after 30 seconds
    })
}

export default useUnstakingQueueData
