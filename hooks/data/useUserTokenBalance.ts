import axiosLib from '@/lib/axios'
import { usePrivy } from '@privy-io/react-auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const getUserTokenBalance = async (chain: string, tokenAddress: string): Promise<number> => {
    const res = await axiosLib.get(`/api/${chain}/trade/token-balance/${tokenAddress}`)

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
        throw new Error('No data found')
    }

    return res.data.data.balance
}
// const getUserTokenBalance = async (chain: string, tokenAddress: string, walletAddress: string): Promise<number> => {
//     const res = await axiosLib.get(`/api/${chain}/trade/token-balance`, {
//         params: {
//             tokenAddress: tokenAddress,
//             walletAddress: walletAddress,
//         },
//     })

//     if (!res.data.data || Object.keys(res.data.data).length === 0) {
//         throw new Error('No data found')
//     }

//     return res.data.data.balance
// }

const useUserTokenBalanceData = (chain: string, tokenAddress: string, refetchInterval?: number) => {
    const { ready, authenticated, user } = usePrivy()
    return useQuery({
        queryKey: [`userTokenBalance`, tokenAddress, user?.id, chain],
        queryFn: async () => await getUserTokenBalance(chain, tokenAddress),
        enabled: Boolean(ready && authenticated && user && tokenAddress && chain),
        refetchInterval: refetchInterval,
        // retry: true,
        // refetchInterval: 5000,
    })
}

export const useMutateUserTokenBalanceData = () => {
    const queryClient = useQueryClient()
    const { user } = usePrivy()
    return useMutation({
        mutationFn: ({ chain, tokenAddress }: { chain: string; tokenAddress: string }) => getUserTokenBalance(chain, tokenAddress),
        onSuccess: (data, { tokenAddress, chain }) => {
            queryClient.refetchQueries({
                queryKey: ['userTokenBalance', tokenAddress, , user?.id, chain],
            }),
                queryClient.refetchQueries({
                    queryKey: ['userWalletBalances', user?.id, chain],
                })
            queryClient.refetchQueries({
                queryKey: ['userTokenHoldings', user?.id, chain],
            })
        },
    })
}

export default useUserTokenBalanceData
