import { useEffect } from 'react'
import { cacheUtils } from '@/utils/cache'
import { preloadCriticalData } from '@/utils/cacheWarmer'

/**
 * Hook to manage cache lifecycle and provide cache utilities
 */
export const useCache = () => {
    // Initialize cache cleanup on mount
    useEffect(() => {
        // Cleanup expired items when the app starts
        // cacheUtils.cleanupAll()

        // Set up periodic cleanup every 5 minutes
        const cleanupInterval = setInterval(() => {
            cacheUtils.cleanupAll()
        }, 5 * 60 * 1000)

        return () => {
            clearInterval(cleanupInterval)
        }
    }, [])

    return {
        clearAll: cacheUtils.clearAll,
        cleanupAll: cacheUtils.cleanupAll,
        getStats: cacheUtils.getStats,
        setData: cacheUtils.setData,
        getData: cacheUtils.getData,
    }
}

/**
 * Hook to preload critical data from cache
 */
export const useCachePreloader = () => {
    useEffect(() => {
        // Preload critical data for faster initial load
        preloadCriticalData()

        // Cleanup expired items
        const timer = setTimeout(() => {
            cacheUtils.cleanupAll()
        }, 1000)

        return () => clearTimeout(timer)
    }, [])
}

export default useCache
