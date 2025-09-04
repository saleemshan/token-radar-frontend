import { useQuery } from '@tanstack/react-query'
import { BridgeQuoteResponse } from '@/types/bridge'

interface RelayQuoteParams {
    originChainId: number
    destinationChainId: number
    originCurrency: string
    destinationCurrency: string
    amount: string
    tradeType?: string
}

const fetchRelayQuote = async (params: RelayQuoteParams): Promise<BridgeQuoteResponse | null> => {
    const { amount, originChainId, destinationChainId, originCurrency, destinationCurrency, tradeType } = params

    const response = await fetch('/api/relay/quote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            originChainId: originChainId,
            destinationChainId: destinationChainId,
            originCurrency: originCurrency,
            destinationCurrency: destinationCurrency,
            amount: amount,
            tradeType: tradeType || 'EXPECTED_OUTPUT',
        }),
    })

    if (!response.ok) {
        throw new Error('Failed to get price estimate')
    }

    const data = await response.json()
    return data.quote
}

export const useRelayQuote = (params: RelayQuoteParams, enabled = true) => {
    const { amount, originChainId, destinationChainId, originCurrency, destinationCurrency, tradeType } = params

    return useQuery({
        queryKey: ['relayQuote', amount, originChainId, destinationChainId, originCurrency, destinationCurrency, tradeType],
        queryFn: () => fetchRelayQuote(params),
        enabled: enabled && Boolean(amount && originChainId && destinationChainId && originCurrency && destinationCurrency),
        refetchOnWindowFocus: false,
        staleTime: 30000, // 30 seconds
        gcTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
