/**
 * Cache warming utilities to preload critical data
 */

import { apiCache, staticDataCache, CACHE_KEYS } from './cache'

/**
 * Warm up critical caches with essential data
 */
export const warmCaches = async () => {
    try {
        // Warm market data cache
        if (!apiCache.has(CACHE_KEYS.MARKET_DATA)) {
            const marketDataResponse = await fetch('/api/hyperliquid/market-data')
            if (marketDataResponse.ok) {
                const marketData = await marketDataResponse.json()
                apiCache.set(CACHE_KEYS.MARKET_DATA, marketData.data)
            }
        }

        // Warm spot meta cache
        if (!staticDataCache.has(CACHE_KEYS.SPOT_META)) {
            const spotMetaResponse = await fetch('/api/hyperliquid/spot-meta')
            if (spotMetaResponse.ok) {
                const spotMeta = await spotMetaResponse.json()
                staticDataCache.set(CACHE_KEYS.SPOT_META, spotMeta)
            }
        }
    } catch (error) {
        console.warn('Cache warming failed:', error)
    }
}

/**
 * Preload critical data for faster initial load
 */
export const preloadCriticalData = () => {
    // Run cache warming in the background
    setTimeout(() => {
        warmCaches()
    }, 100)
}

export default { warmCaches, preloadCriticalData }
