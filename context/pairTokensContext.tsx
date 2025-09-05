'use client'

import React, { createContext, useContext, useEffect, useState, Suspense, useRef, useMemo, useCallback } from 'react'
import {
    PairData,
    SpotAsset,
    spotAssetCtxs,
    SpotToken,
    AssetCtx,
    ActiveAssetData,
    SpotTokenUniverseData,
    SpotAssetCtx,
    Meta,
} from '@/types/hyperliquid'

import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { useWebSocket } from './websocketContext'
import { useUser } from './UserContext'
import { useWebDataContext } from './webDataContext'
import { usePrivy } from '@privy-io/react-auth'
import { useHyperliquidPerpetualsMetaCtxs } from '@/hooks/data/useHyperliquidPerpetualsMetaCtxs'
import { findMarketDataByName } from '@/utils/tokenSymbol'
import { webSocketCache, apiCache, staticDataCache, CACHE_KEYS } from '@/utils/cache'

interface PairTokensProps {
    tokenPairs: string[]
    pair: string
    setPair: React.Dispatch<React.SetStateAction<string>>
    tokenPairData: PairData[]
    assetId: number
    activePrepAssetCtx?: AssetCtx | null
    setActivePrepAssetCtx?: React.Dispatch<React.SetStateAction<AssetCtx>>
    spotTokensData: SpotAsset[]
    activeSpotAssetCtx: spotAssetCtxs | null
    setActiveSpotAssetCtx: React.Dispatch<React.SetStateAction<spotAssetCtxs | null>>
    setTokenId: React.Dispatch<React.SetStateAction<string | null>>
    setIsSpotToken: React.Dispatch<React.SetStateAction<boolean>>
    isSpotToken: boolean | null
    spotTokenId: string | null
    setSpotTokenId: React.Dispatch<React.SetStateAction<string | null>>
    tokenId: string | null
    loadingActiveAsset: boolean
    activeAssetData: ActiveAssetData | null
    ethTokenPrice: undefined | number
    solTokenPrice: undefined | number
    btcTokenPrice: undefined | number
}

export const PairTokensContext = createContext({} as PairTokensProps)

export const usePairTokensContext = () => {
    const context = useContext(PairTokensContext)
    if (!context) {
        throw new Error('usePairTokensContext must be used within a PairTokensProvider')
    }
    return context
}

const fetchSpotMetaData = async () => {
    try {
        // Check cache first
        const cachedData = staticDataCache.get(CACHE_KEYS.SPOT_META)
        if (cachedData) {
            return cachedData
        }

        const response = await fetch('/api/hyperliquid/spot-meta')
        const data = await response.json()

        // Cache the fresh data
        staticDataCache.set(CACHE_KEYS.SPOT_META, data)

        return data
    } catch (error) {
        console.error('Failed to fetch spot meta:', error)
        return null
    }
}

function processSpotData(
    data: {
        tokens?: SpotToken[]
        universe?: SpotTokenUniverseData[]
    },
    spotAssetCtxs: SpotAssetCtx[]
) {
    const universe = data?.universe
    return universe?.map(item => {
        const tokenIndex = item.tokens[0]
        return {
            ...item,
            ...data.tokens?.[tokenIndex],
            ...spotAssetCtxs.find(ctx => ctx.coin === item.name),
        }
    })
}

const PairTokensProviderInner = ({ children }: { children: React.ReactNode }) => {
    const searchParams = useSearchParams()

    const [spotTokenId, setSpotTokenId] = useState<string | null>(() => searchParams.get('coin')?.toUpperCase() ?? null)

    const { userPublicWalletAddresses, isEthWalletAddressFetched, isEthWalletAddressFetching } = useUser()
    const { webData2, marketData } = useWebDataContext()
    const { subscribe, sendMessage, unsubscribe } = useWebSocket()
    const { ready, authenticated } = usePrivy()
    const { data: perpetualsMetaCtxs } = useHyperliquidPerpetualsMetaCtxs()

    const userPublicWalletAddress = userPublicWalletAddresses['ethereum']

    const { tokenId: paramsTokenId } = useParams<{ tokenId: string }>()
    const [tokenId, setTokenId] = useState<string | null>(paramsTokenId || null)
    const [assetId, setAssetId] = useState<number>(Number(searchParams.get('assetId')) || 0)

    const [isSpotToken, setIsSpotToken] = useState(() => {
        return paramsTokenId ? /^0x[0-9a-f]{32}$/i.test(paramsTokenId) : false
    })

    const [tokenPairData, setTokenPairData] = useState<PairData[]>([])
    const [tokenPairs, setTokenPairs] = useState<string[]>([])
    const [pair, setPair] = useState('')
    const [activePrepAssetCtx, setActivePrepAssetCtx] = useState<AssetCtx | null>(null)
    const [activeAssetData, setActiveAssetData] = useState<ActiveAssetData | null>(null)
    const [spotTokensData, setSpotTokensData] = useState<SpotAsset[]>([])
    const [activeSpotAssetCtx, setActiveSpotAssetCtx] = useState<spotAssetCtxs | null>(null)
    const [loadingActiveAsset, setLoadingActiveAsset] = useState(false)

    const [spotMetaCache, setSpotMetaCache] = useState(() => {
        // Load cached spot meta data immediately
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cached = staticDataCache.get<any>(CACHE_KEYS.SPOT_META)
        return cached ? cached.data || cached : null
    })

    // Add these refs at the top of PairTokensProviderInner component
    const currentActiveAssetSubscriptionRef = useRef<string | null>(null)
    const activeAssetCleanupRef = useRef<(() => void) | null>(null)

    // Add a new ref at the top near the other refs
    const currentAssetCtxSubscriptionRef = useRef<string | null>(null)
    const assetCtxCleanupRef = useRef<{
        cleanupAssetCtx: (() => void) | null
        cleanupSpotAssetCtx: (() => void) | null
    }>({ cleanupAssetCtx: null, cleanupSpotAssetCtx: null })

    const [btcTokenPrice, setBtcTokenPrice] = useState<undefined | number>(undefined)
    const [ethTokenPrice, setEthTokenPrice] = useState<undefined | number>(undefined)
    const [solTokenPrice, setSolTokenPrice] = useState<undefined | number>(undefined)

    useEffect(() => {
        //find name sol and eth lowercase
        const btcTokenData = tokenPairData?.find(token => token?.pairs?.toLowerCase() === 'btc-usd')
        const solTokenData = tokenPairData?.find(token => token?.pairs?.toLowerCase() === 'sol-usd')
        const ethTokenData = tokenPairData?.find(token => token?.pairs?.toLowerCase() === 'eth-usd')

        if (btcTokenData) {
            setBtcTokenPrice(Number(btcTokenData?.assetCtx?.markPx))
        }
        if (solTokenData) {
            setSolTokenPrice(Number(solTokenData?.assetCtx?.markPx))
        }
        if (ethTokenData) {
            setEthTokenPrice(Number(ethTokenData?.assetCtx?.markPx))
        }
    }, [tokenPairData])

    //Watch for tokenId changes
    useEffect(() => {
        if (paramsTokenId) {
            setTokenId(paramsTokenId)
            setIsSpotToken(/^0x[0-9a-f]{32}$/i.test(paramsTokenId))
        }
    }, [paramsTokenId])

    // Fetch fresh spot meta data in background
    useEffect(() => {
        const getSpotMetaData = async () => {
            const data = await fetchSpotMetaData()
            setSpotMetaCache(data?.data ?? null)
        }
        getSpotMetaData()
    }, [])

    // Memoize this function to prevent recreation on each render
    const metaAndAssetCtxs = useCallback((meta?: Meta, assetCtxs?: AssetCtx[]) => {
        if (!meta || !assetCtxs) {
            return []
        }

        return meta.universe.map((universe, assetId) => ({
            assetId,
            pairs: `${universe.name}-USD`,
            universe,
            assetCtx: assetCtxs?.[assetId] ?? null,
        }))
    }, [])

    // Process and memoize token data
    const processedMetaAndAssetCtxsData = useMemo(() => {
        return metaAndAssetCtxs(webData2?.meta, webData2?.assetCtxs)
    }, [metaAndAssetCtxs, webData2?.meta, webData2?.assetCtxs])

    const processedTokenPairData = useMemo(() => {
        // Safely handle perpetualsMetaCtxs which might be undefined
        const tokenPairApoUniverseData = perpetualsMetaCtxs?.[0]?.universe
        const tokenPairsDetails = perpetualsMetaCtxs?.[1]

        // Only map if we have data
        return tokenPairApoUniverseData
            ? tokenPairApoUniverseData.map((universe, index) => {
                  return {
                      pairs: `${universe.name}-USD`,
                      assetId: index,
                      universe,
                      assetCtx: tokenPairsDetails?.[index] || null,
                  }
              })
            : []
    }, [perpetualsMetaCtxs])

    // Use webData2 from context instead of subscribing via WebSocket
    useEffect(() => {
        if (spotMetaCache && webData2) {
            setSpotTokensData(processSpotData(spotMetaCache, webData2.spotAssetCtxs) as SpotAsset[])
        }

        setTokenPairData(processedMetaAndAssetCtxsData?.length ? processedMetaAndAssetCtxsData : (processedTokenPairData as PairData[]))
    }, [spotMetaCache, webData2, processedMetaAndAssetCtxsData, processedTokenPairData])

    // Set assetId to the id of the market data item
    useEffect(() => {
        if (marketData && tokenId) {
            setAssetId(Number(findMarketDataByName(marketData, tokenId)?.id))
        }
    }, [marketData, tokenId])

    // Load cached active asset data immediately
    useEffect(() => {
        if (!isSpotToken && tokenId && userPublicWalletAddress) {
            const cached = webSocketCache.get<ActiveAssetData>(CACHE_KEYS.USER_ACTIVE_ASSET(userPublicWalletAddress, tokenId))
            if (cached) {
                setActiveAssetData(cached)
            }
        }
    }, [isSpotToken, tokenId, userPublicWalletAddress])

    // Subscribe to activeAssetData
    useEffect(() => {
        if (isSpotToken || !tokenId) {
            return
        }

        // If wallet is still being fetched, don't proceed
        if (!ready || isEthWalletAddressFetching) {
            return
        }

        const dummyAddress = '0x0000000000000000000000000000000000000000'
        const addressToUse = !authenticated
            ? dummyAddress
            : !isEthWalletAddressFetched && !userPublicWalletAddress
            ? dummyAddress
            : userPublicWalletAddress || dummyAddress

        // Skip if we've already subscribed with this exact address and coin combination
        if (currentActiveAssetSubscriptionRef.current === tokenId) {
            return
        }

        // Clean up previous subscription
        if (activeAssetCleanupRef.current) {
            unsubscribe('activeAssetData', {
                user: addressToUse,
                coin: tokenId,
            })
            activeAssetCleanupRef.current = null
        }

        // Update subscription tracking
        currentActiveAssetSubscriptionRef.current = tokenId

        // Handler for activeAssetData messages
        const handleActiveAssetData = (data: ActiveAssetData) => {
            if (data) {
                setActiveAssetData(data)

                // Cache the active asset data
                webSocketCache.set(CACHE_KEYS.USER_ACTIVE_ASSET(addressToUse, tokenId), data)
            }
        }

        // Subscribe with current address
        subscribe('activeAssetData', handleActiveAssetData, {
            user: addressToUse,
            coin: tokenId,
        })

        return () => {
            unsubscribe('activeAssetData', {
                user: addressToUse,
                coin: tokenId,
            })
            currentActiveAssetSubscriptionRef.current = null
        }
    }, [
        isSpotToken,
        tokenId,
        userPublicWalletAddress,
        subscribe,
        unsubscribe,
        ready,
        authenticated,
        isEthWalletAddressFetched,
        isEthWalletAddressFetching,
    ])

    // Fetch spot token info
    useEffect(() => {
        const fetchSpotTokenInfo = async () => {
            try {
                // Check cache first
                const cacheKey = `${CACHE_KEYS.TOKEN_INFO}:${tokenId}`
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const cachedData = apiCache.get<any>(cacheKey)

                if (cachedData && 'name' in cachedData) {
                    setPair(cachedData.name)
                    setTokenPairs([cachedData.name, 'USDC'])
                    return
                }

                const response = await axios.post('/api/hyperliquid/token-info', {
                    tokenId: tokenId,
                })
                if (response.data.data) {
                    const tokenInfo = response.data.data
                    setPair(tokenInfo.name)
                    setTokenPairs([tokenInfo.name, 'USDC'])

                    // Cache the token info
                    apiCache.set(cacheKey, tokenInfo)
                }
            } catch (error) {
                console.error('Error fetching spot token info:', error)
            }
        }

        if (isSpotToken && spotTokenId) {
            fetchSpotTokenInfo()
        }
    }, [isSpotToken, spotTokenId, tokenId])

    // Subscribe to activeAssetCtx and activeSpotAssetCtx using centralized WebSocket
    useEffect(() => {
        if (!tokenId && !spotTokenId) {
            setLoadingActiveAsset(false)
            return
        }

        // If wallet is still being fetched, don't proceed
        if (!ready || isEthWalletAddressFetching) {
            return
        }

        // setLoadingActiveAsset(true)

        const dummyAddress = '0x0000000000000000000000000000000000000000'
        const addressToUse = !authenticated
            ? dummyAddress
            : !isEthWalletAddressFetched && !userPublicWalletAddress
            ? dummyAddress
            : userPublicWalletAddress || dummyAddress
        const coin = isSpotToken ? spotTokenId : tokenId

        // Create a unique key for this subscription
        const subscriptionKey = `${addressToUse}-${coin}`

        // Skip if already subscribed to this exact combination
        if (currentAssetCtxSubscriptionRef.current === subscriptionKey) {
            return
        }

        // Clean up previous subscription if it exists
        if (assetCtxCleanupRef.current.cleanupAssetCtx) {
            unsubscribe('activeAssetCtx', {
                user: addressToUse,
                coin: coin,
            })
        }

        // Update subscription tracking
        currentAssetCtxSubscriptionRef.current = subscriptionKey

        // Create subscription parameters
        const subscriptionParams = {
            user: addressToUse,
            coin: coin,
        }

        // Handler for activeAssetCtx messages
        const handleActiveAssetCtx = (data: { ctx: AssetCtx; coin: string }) => {
            setLoadingActiveAsset(false)
            if (data) {
                setActivePrepAssetCtx({
                    ...data.ctx,
                    coin: data.coin,
                })
            }
        }

        // Handler for activeSpotAssetCtx messages
        const handleActiveSpotAssetCtx = (data: { ctx: SpotAssetCtx }) => {
            setLoadingActiveAsset(false)
            if (data) {
                setActiveSpotAssetCtx(data.ctx)
            }
        }

        // Send the subscription message directly
        subscribe('activeAssetCtx', handleActiveAssetCtx, subscriptionParams)

        // Subscribe to both possible response channels
        subscribe('activeSpotAssetCtx', handleActiveSpotAssetCtx)

        return () => {
            setLoadingActiveAsset(false)

            unsubscribe('activeAssetCtx', subscriptionParams)

            currentAssetCtxSubscriptionRef.current = null
            assetCtxCleanupRef.current = {
                cleanupAssetCtx: null,
                cleanupSpotAssetCtx: null,
            }
        }
    }, [
        userPublicWalletAddress,
        tokenId,
        isSpotToken,
        spotTokenId,
        subscribe,
        sendMessage,
        unsubscribe,
        ready,
        authenticated,
        isEthWalletAddressFetched,
        isEthWalletAddressFetching,
    ])

    useEffect(() => {
        if (!isSpotToken && tokenId) {
            setPair(tokenId)
            setTokenPairs([tokenId, 'USD'])
        }
    }, [isSpotToken, tokenId])

    // Create memoized value for context to prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({
            spotTokensData,
            tokenPairs,
            pair,
            setPair,
            tokenPairData,
            assetId,
            activePrepAssetCtx,
            activeSpotAssetCtx,
            activeAssetData,
            setActiveSpotAssetCtx,
            isSpotToken,
            setIsSpotToken,
            setTokenId,
            spotTokenId,
            setSpotTokenId,
            tokenId,
            loadingActiveAsset,
            btcTokenPrice,
            solTokenPrice,
            ethTokenPrice,
        }),
        [
            spotTokensData,
            tokenPairs,
            pair,
            tokenPairData,
            assetId,
            activePrepAssetCtx,
            activeSpotAssetCtx,
            activeAssetData,
            isSpotToken,
            spotTokenId,
            setSpotTokenId,
            tokenId,
            loadingActiveAsset,
            btcTokenPrice,
            solTokenPrice,
            ethTokenPrice,
        ]
    )

    return <PairTokensContext.Provider value={contextValue}>{children}</PairTokensContext.Provider>
}

// Create the main provider that includes Suspense
const PairTokensProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <Suspense>
            <PairTokensProviderInner>{children}</PairTokensProviderInner>
        </Suspense>
    )
}

export default PairTokensProvider
