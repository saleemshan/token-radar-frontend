import axiosLib from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

interface TokenInfo {
    address: string
    symbol: string
    name: string
    decimals: number
    logo: string | null
}

interface HoldingInfo {
    token: TokenInfo
    balance: number
    balance_usd: number | null
    last_transfer_timestamp: string | null
    chain: string
}

const getArbitrumWalletHoldings = async (address: string | undefined, tokens?: string): Promise<HoldingInfo[]> => {
    if (!address) {
        throw new Error('Wallet address is required')
    }

    const response = await axiosLib.get<{
        code: number
        message: string
        data: HoldingInfo[]
    }>(`/api/arbitrum/wallet-holdings?address=${address}${tokens ? `&tokens=${tokens}` : ''}`)

    return response.data.data
}

const useArbitrumWalletHoldingsData = (address: string | undefined, tokens?: string) => {
    return useQuery({
        queryKey: ['arbitrumWalletHoldings', address, tokens],
        queryFn: () => getArbitrumWalletHoldings(address, tokens),
        enabled: Boolean(address),
        refetchInterval: 10000,
    })
}

export default useArbitrumWalletHoldingsData
