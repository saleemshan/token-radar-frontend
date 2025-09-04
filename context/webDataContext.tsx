import React, { createContext, useContext, useEffect, useState } from 'react'
import { MarketDataItem, WebData2 } from '@/types/hyperliquid'
import axios from 'axios'
import { useWebSocket } from './websocketContext'
import { useUser } from './UserContext'
import { usePrivy } from '@privy-io/react-auth'
import { apiCache, CACHE_KEYS, cacheUtils } from '@/utils/cache'

export type MarketData = Record<string, MarketDataItem>

interface WebDataProps {
    webData2: WebData2 | null
    loadingWebData2: boolean
    marketData: MarketData
    loadingMarketData: boolean
}

const WebDataContext = createContext({} as WebDataProps)

export const useWebDataContext = () => {
    const context = useContext(WebDataContext)
    if (!context) {
        throw new Error('context must be used within a WebDataProvider')
    }
    return context
}

const WebDataProvider = ({ children }: { children: React.ReactNode }) => {
    const { subscribe, unsubscribe } = useWebSocket()
    const { userPublicWalletAddresses, isEthWalletAddressFetched, isEthWalletAddressFetching } = useUser()
    const { ready, authenticated } = usePrivy()

    const userPublicWalletAddress = userPublicWalletAddresses['ethereum']

    const [webData2, setWebData2] = useState<WebData2 | null>(() => {
        // Use smart fallback to get best available cached data
        const cachedData = cacheUtils.getUserDataWithFallback<WebData2>(null, 'webData')
        return cachedData || null
    })

    const [loadingWebData2, setLoadingWebData2] = useState<boolean>(() => {
        const cachedData = cacheUtils.getUserDataWithFallback<WebData2>(null, 'webData')
        return !cachedData
    })

    const [marketData, setMarketData] = useState<MarketData>(() => {
        const cached = apiCache.get<MarketData>(CACHE_KEYS.MARKET_DATA)
        return cached || {}
    })

    const [loadingMarketData, setLoadingMarketData] = useState<boolean>(() => {
        const cached = apiCache.get<MarketData>(CACHE_KEYS.MARKET_DATA)
        return !cached
    })

    // Load cached data for specific user when wallet address becomes available
    useEffect(() => {
        // Use smart fallback with user address when available
        const cachedData = cacheUtils.getUserDataWithFallback<WebData2>(userPublicWalletAddress, 'webData')
        if (cachedData) {
            setWebData2(cachedData)
            setLoadingWebData2(false)
        }
    }, [userPublicWalletAddress])

    // Fetch fresh market data
    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const response = await axios.get('/api/hyperliquid/market-data')
                const data = response.data.data
                setMarketData(data)

                // Cache the fresh data
                apiCache.set(CACHE_KEYS.MARKET_DATA, data)
                setLoadingMarketData(false)
            } catch (error) {
                console.error('Error fetching market data:', error)
                setLoadingMarketData(false)
            }
        }

        fetchMarketData()
    }, [])

    // WebSocket connection for webData2
    useEffect(() => {
        // If wallet is still being fetched
        if (!ready || isEthWalletAddressFetching) {
            return
        }

        const addressToUse = !authenticated
            ? '0x0000000000000000000000000000000000000000'
            : !isEthWalletAddressFetched && !userPublicWalletAddress
            ? '0x0000000000000000000000000000000000000000'
            : userPublicWalletAddress

        // Store the current address for cleanup
        const currentAddress = addressToUse

        // Unsubscribe from previous subscription if exists
        unsubscribe('webData2', {
            user: currentAddress,
        })

        // Subscribe with the current address
        subscribe(
            'webData2',
            data => {
                setWebData2(data)
                setLoadingWebData2(false)

                // Use smart tier caching - stores user-specific data if available,
                // otherwise stores as fallback for anonymous users
                const isRealUser = currentAddress !== '0x0000000000000000000000000000000000000000'
                cacheUtils.setUserDataWithTiers(data, isRealUser ? currentAddress : null, 'webData')
            },
            {
                user: currentAddress,
            }
        )

        return () => {
            unsubscribe('webData2', {
                user: currentAddress,
            })
        }
    }, [subscribe, unsubscribe, userPublicWalletAddress, isEthWalletAddressFetched, isEthWalletAddressFetching, ready, authenticated])

    return (
        <WebDataContext.Provider
            value={{
                webData2,
                loadingWebData2,
                marketData,
                loadingMarketData,
            }}
        >
            {children}
        </WebDataContext.Provider>
    )
}

export default WebDataProvider
