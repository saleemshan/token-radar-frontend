import axiosLib from '@/lib/axios'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'

export const getData = async (): Promise<{
    type: string
    accounts: string[]
    defaultAccounts: string[]
}> => {
    const res = await axiosLib.get(`/api/news-trading/tradfi/fast/accounts-list`, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
        throw new Error('No data found')
    }

    return res.data.data
}

export const useTradFiFastAccountsListData = () => {
    const { ready, authenticated, user } = usePrivy()
    return useQuery({
        queryKey: ['tradFiFastAccountsList'],
        queryFn: async () => await getData(),
        enabled: Boolean(ready && authenticated && user),
        // retry: false,
        // refetchOnWindowFocus: true,
    })
}
