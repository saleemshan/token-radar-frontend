import { useWebDataContext } from '@/context/webDataContext'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { useMemo } from 'react'

interface OpenInterestData {
    btcOI: number
    ethOI: number
    solOI: number
    altcoinOI: number
}

const useOpenInterestData = (): { data: OpenInterestData | undefined; isLoading: boolean } => {
    const { loadingWebData2 } = useWebDataContext()
    const { tokenPairData } = usePairTokensContext()

    const data = useMemo(() => {
        // Check if we have the necessary data
        if (!tokenPairData || tokenPairData.length === 0) {
            return undefined
        }

        let btcOI = 0
        let ethOI = 0
        let solOI = 0
        let altcoinTotal = 0

        // Process each token pair to calculate OIs
        tokenPairData.forEach(pair => {
            if (!pair.assetCtx || !pair.assetCtx.openInterest) return

            const openInterestValue = parseFloat(pair.assetCtx.openInterest || '0')
            const markPrice = parseFloat(pair.assetCtx.markPx || '0')
            const oiUsd = openInterestValue * markPrice

            // Add OI to the appropriate category
            if (pair.universe.name === 'BTC') {
                btcOI = oiUsd
            } else if (pair.universe.name === 'ETH') {
                ethOI = oiUsd
            } else if (pair.universe.name === 'SOL') {
                solOI = oiUsd
            } else {
                // All other assets contribute to altcoin total
                altcoinTotal += oiUsd
            }
        })

        return {
            btcOI,
            ethOI,
            solOI,
            altcoinOI: altcoinTotal,
        }
    }, [tokenPairData])

    return { data, isLoading: loadingWebData2 }
}

export default useOpenInterestData
