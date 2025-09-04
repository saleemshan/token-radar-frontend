import { chains } from '@/data/default/chains'
import { RelayToken } from '@/types/bridge'
import { RelayChain } from '@/types/bridge'
import { BridgeQuoteResponse } from '@/types/bridge'
import { useEffect, useState, useRef } from 'react'

// Add this custom hook in the component or in a separate hooks file
export const useDebounceQuoteData = (
    amount: number | undefined,
    selectedToken: RelayToken | undefined,
    selectedChain: RelayChain | undefined,
    tokenData: Token | undefined,
    activeTab: 'buy' | 'sell',
    delay: number = 500
) => {
    const [quoteData, setQuoteData] = useState<BridgeQuoteResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Don't make API call if required data is missing
        if (!amount || !selectedToken || !selectedChain || !tokenData || activeTab === 'sell') {
            setQuoteData(null)
            return
        }

        // Check if source and destination tokens are the same
        const isSameToken =
            (tokenData.chain_id === 'solana' && selectedToken.symbol === 'SOL') ||
            (tokenData.chain_id === 'ethereum' && selectedToken.symbol === 'ETH') ||
            (tokenData.chain_id === 'base' && selectedToken.symbol === 'ETH')

        // Don't make API call if tokens are the same
        if (isSameToken) {
            setQuoteData(null)
            return
        }

        // Set up new timeout
        timeoutRef.current = setTimeout(async () => {
            setIsError(false)
            try {
                setIsLoading(true)
                setIsError(false)
                const amountInSmallestUnit = (Number(amount) * Math.pow(10, selectedToken?.decimals ?? 0)).toFixed(0)

                const response = await fetch('/api/relay/quote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        originChainId: selectedChain.name,
                        destinationChainId: tokenData.chain_id,
                        originCurrency: selectedToken.address,
                        destinationCurrency: chains.find(chain => chain.id === tokenData.chain_id)?.address,
                        amount: amountInSmallestUnit,
                        tradeType: 'EXACT_INPUT',
                    }),
                })

                if (!response.ok) {
                    throw new Error('Failed to get price estimate')
                }

                const data = await response.json()
                setQuoteData(data.quote)
            } catch (error) {
                console.error('Error getting bridge quote:', error)
                setIsError(true)
                setQuoteData(null)
            } finally {
                setIsLoading(false)
            }
        }, delay)

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [amount, selectedToken, selectedChain, tokenData, delay])

    return { quoteData, isLoading, isError }
}
