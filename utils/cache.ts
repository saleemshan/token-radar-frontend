/**
 * Cache utility for localStorage with TTL (Time To Live) support
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CacheItem<T = any> {
    data: T
    timestamp: number
    ttl: number // Time to live in milliseconds
}

interface CacheConfig {
    ttl?: number // Default TTL in milliseconds
    prefix?: string // Cache key prefix
}

class CacheManager {
    private prefix: string
    private defaultTTL: number

    constructor(config: CacheConfig = {}) {
        this.prefix = config.prefix || 'token-radar-cache'
        this.defaultTTL = config.ttl || 5 * 60 * 1000 // 5 minutes default
    }

    private getKey(key: string): string {
        return `${this.prefix}:${key}`
    }

    private isExpired(item: CacheItem): boolean {
        return Date.now() > item.timestamp + item.ttl
    }

    /**
     * Set cache item with optional TTL
     */
    set<T>(key: string, data: T, ttl?: number): void {
        try {
            const cacheItem: CacheItem<T> = {
                data,
                timestamp: Date.now(),
                ttl: ttl || this.defaultTTL,
            }
            localStorage.setItem(this.getKey(key), JSON.stringify(cacheItem))
        } catch (error) {
            console.warn('Failed to set cache item:', error)
        }
    }

    /**
     * Get cache item if not expired
     */
    get<T>(key: string): T | null {
        try {
            const cached = localStorage.getItem(this.getKey(key))
            if (!cached) return null

            const cacheItem: CacheItem<T> = JSON.parse(cached)

            if (this.isExpired(cacheItem)) {
                this.delete(key)
                return null
            }

            return cacheItem.data
        } catch (error) {
            console.warn('Failed to get cache item:', error)
            return null
        }
    }

    /**
     * Check if cache item exists and is not expired
     */
    has(key: string): boolean {
        return this.get(key) !== null
    }

    /**
     * Delete cache item
     */
    delete(key: string): void {
        try {
            localStorage.removeItem(this.getKey(key))
        } catch (error) {
            console.warn('Failed to delete cache item:', error)
        }
    }

    /**
     * Clear all cache items with this prefix
     */
    clear(): void {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix))
            keys.forEach(key => localStorage.removeItem(key))
        } catch (error) {
            console.warn('Failed to clear cache:', error)
        }
    }

    /**
     * Get cache item age in milliseconds
     */
    getAge(key: string): number | null {
        try {
            const cached = localStorage.getItem(this.getKey(key))
            if (!cached) return null

            const cacheItem: CacheItem = JSON.parse(cached)
            return Date.now() - cacheItem.timestamp
        } catch (error) {
            return null
        }
    }

    /**
     * Cleanup expired items
     */
    cleanup(): void {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix))
            keys.forEach(key => {
                const cached = localStorage.getItem(key)
                if (cached) {
                    const cacheItem: CacheItem = JSON.parse(cached)
                    if (this.isExpired(cacheItem)) {
                        localStorage.removeItem(key)
                    }
                }
            })
        } catch (error) {
            console.warn('Failed to cleanup cache:', error)
        }
    }
}

// Cache instances for different data types
export const webSocketCache = new CacheManager({
    prefix: 'ws-cache',
    ttl: 2 * 60 * 1000, // 2 minutes for real-time data
})

export const apiCache = new CacheManager({
    prefix: 'api-cache',
    ttl: 5 * 60 * 1000, // 5 minutes for API data
})

export const staticDataCache = new CacheManager({
    prefix: 'static-cache',
    ttl: 30 * 60 * 1000, // 30 minutes for static data like metadata
})

// Cache keys constants
export const CACHE_KEYS = {
    // WebSocket data
    WEB_DATA_2: 'webData2',
    MARKET_DATA: 'marketData',
    ACTIVE_ASSET_DATA: 'activeAssetData',
    ORDER_HISTORY: 'orderHistory',
    TRADE_HISTORY: 'tradeHistory',
    FUNDING_HISTORY: 'fundingHistory',
    ORDER_BOOK: 'orderBook',
    TRADES: 'trades',

    // API data
    SPOT_META: 'spotMeta',
    PERPETUALS_META: 'perpetualsMeta',
    TOKEN_INFO: 'tokenInfo',

    // User-specific data (include user address in key)
    USER_WEB_DATA: (address: string) => `webData2:${address}`,
    USER_ORDER_HISTORY: (address: string) => `orderHistory:${address}`,
    USER_TRADE_HISTORY: (address: string) => `tradeHistory:${address}`,
    USER_FUNDING_HISTORY: (address: string) => `fundingHistory:${address}`,
    USER_ACTIVE_ASSET: (address: string, coin: string) => `activeAsset:${address}:${coin}`,

    // Latest cached data keys (for immediate loading)
    LATEST_WEB_DATA: 'latest_webData2',
    LATEST_ORDER_HISTORY: 'latest_orderHistory',
    LATEST_TRADE_HISTORY: 'latest_tradeHistory',
    LATEST_FUNDING_HISTORY: 'latest_fundingHistory',

    // Fallback cache keys (for when no user-specific data is available)
    FALLBACK_WEB_DATA: 'fallback_webData2',
    FALLBACK_ORDER_HISTORY: 'fallback_orderHistory',
    FALLBACK_TRADE_HISTORY: 'fallback_tradeHistory',
    FALLBACK_FUNDING_HISTORY: 'fallback_fundingHistory',
} as const

// Utility functions
export const cacheUtils = {
    /**
     * Set data with automatic cache selection based on data type
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData: (key: string, data: any, type: 'websocket' | 'api' | 'static' = 'api') => {
        const cache = type === 'websocket' ? webSocketCache : type === 'static' ? staticDataCache : apiCache
        cache.set(key, data)
    },

    /**
     * Get data with automatic cache selection
     */
    getData: (key: string, type: 'websocket' | 'api' | 'static' = 'api') => {
        const cache = type === 'websocket' ? webSocketCache : type === 'static' ? staticDataCache : apiCache
        return cache.get(key)
    },

    /**
     * Clear all caches
     */
    clearAll: () => {
        webSocketCache.clear()
        apiCache.clear()
        staticDataCache.clear()
    },

    /**
     * Cleanup expired items from all caches
     */
    cleanupAll: () => {
        webSocketCache.cleanup()
        apiCache.cleanup()
        staticDataCache.cleanup()
    },

    /**
     * Get cache stats for debugging
     */
    getStats: () => {
        const allKeys = Object.keys(localStorage)
        return {
            websocket: allKeys.filter(key => key.startsWith('ws-cache')).length,
            api: allKeys.filter(key => key.startsWith('api-cache')).length,
            static: allKeys.filter(key => key.startsWith('static-cache')).length,
            total: allKeys.filter(key => key.includes('cache')).length,
        }
    },

    /**
     * Smart cache retrieval with fallback strategy
     * Priority: User-specific > Latest > Fallback > null
     */
    getWithFallback: <T>(userKey: string | null, latestKey: string, fallbackKey: string, cache: CacheManager = webSocketCache): T | null => {
        // Try user-specific data first if user is available
        if (userKey) {
            const userData = cache.get<T>(userKey)
            if (userData) return userData
        }

        // Try latest cached data
        const latestData = cache.get<T>(latestKey)
        if (latestData) return latestData

        // Try fallback data
        const fallbackData = cache.get<T>(fallbackKey)
        if (fallbackData) return fallbackData

        return null
    },

    /**
     * Smart cache storage - stores in multiple tiers for maximum availability
     */
    setWithTiers: <T>(data: T, userKey: string | null, latestKey: string, fallbackKey: string, cache: CacheManager = webSocketCache) => {
        // Always store as latest
        cache.set(latestKey, data)

        // Store user-specific if user is available
        if (userKey) {
            cache.set(userKey, data)
        } else {
            // If no user, store as fallback for anonymous users
            cache.set(fallbackKey, data)
        }
    },

    /**
     * Get user data with smart fallback for authenticated/unauthenticated states
     */
    getUserDataWithFallback: <T>(
        userAddress: string | null | undefined,
        dataType: 'webData' | 'orderHistory' | 'tradeHistory' | 'fundingHistory'
    ): T | null => {
        const keyMap = {
            webData: {
                user: (addr: string) => CACHE_KEYS.USER_WEB_DATA(addr),
                latest: CACHE_KEYS.LATEST_WEB_DATA,
                fallback: CACHE_KEYS.FALLBACK_WEB_DATA,
            },
            orderHistory: {
                user: (addr: string) => CACHE_KEYS.USER_ORDER_HISTORY(addr),
                latest: CACHE_KEYS.LATEST_ORDER_HISTORY,
                fallback: CACHE_KEYS.FALLBACK_ORDER_HISTORY,
            },
            tradeHistory: {
                user: (addr: string) => CACHE_KEYS.USER_TRADE_HISTORY(addr),
                latest: CACHE_KEYS.LATEST_TRADE_HISTORY,
                fallback: CACHE_KEYS.FALLBACK_TRADE_HISTORY,
            },
            fundingHistory: {
                user: (addr: string) => CACHE_KEYS.USER_FUNDING_HISTORY(addr),
                latest: CACHE_KEYS.LATEST_FUNDING_HISTORY,
                fallback: CACHE_KEYS.FALLBACK_FUNDING_HISTORY,
            },
        }

        const keys = keyMap[dataType]
        const userKey = userAddress ? keys.user(userAddress) : null

        return cacheUtils.getWithFallback<T>(userKey, keys.latest, keys.fallback)
    },

    /**
     * Store user data with smart tier management
     */
    setUserDataWithTiers: <T>(
        data: T,
        userAddress: string | null | undefined,
        dataType: 'webData' | 'orderHistory' | 'tradeHistory' | 'fundingHistory'
    ) => {
        const keyMap = {
            webData: {
                user: (addr: string) => CACHE_KEYS.USER_WEB_DATA(addr),
                latest: CACHE_KEYS.LATEST_WEB_DATA,
                fallback: CACHE_KEYS.FALLBACK_WEB_DATA,
            },
            orderHistory: {
                user: (addr: string) => CACHE_KEYS.USER_ORDER_HISTORY(addr),
                latest: CACHE_KEYS.LATEST_ORDER_HISTORY,
                fallback: CACHE_KEYS.FALLBACK_ORDER_HISTORY,
            },
            tradeHistory: {
                user: (addr: string) => CACHE_KEYS.USER_TRADE_HISTORY(addr),
                latest: CACHE_KEYS.LATEST_TRADE_HISTORY,
                fallback: CACHE_KEYS.FALLBACK_TRADE_HISTORY,
            },
            fundingHistory: {
                user: (addr: string) => CACHE_KEYS.USER_FUNDING_HISTORY(addr),
                latest: CACHE_KEYS.LATEST_FUNDING_HISTORY,
                fallback: CACHE_KEYS.FALLBACK_FUNDING_HISTORY,
            },
        }

        const keys = keyMap[dataType]
        const userKey = userAddress ? keys.user(userAddress) : null

        cacheUtils.setWithTiers(data, userKey, keys.latest, keys.fallback)
    },
}

// Auto cleanup on app start
if (typeof window !== 'undefined') {
    // Cleanup expired items on page load
    setTimeout(() => {
        cacheUtils.cleanupAll()
    }, 1000)
}

export default CacheManager
