import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePairTokensContext } from './pairTokensContext'
import { TradeHistory, FundingData } from '@/types/hyperliquid'
import { useWebSocket } from './websocketContext'
import { useUser } from './UserContext'
import { cacheUtils } from '@/utils/cache'
interface TradeHistoryProps {
    tradeHistoryData: TradeHistory[]
    loadingTradeHistoryData: boolean
    currentCoinTradesData: TradeHistory[]
    fundingData: FundingData[]
    loadingFundingData: boolean
}

const TradeHistoryContext = createContext({} as TradeHistoryProps)

export const useTradeHistoryContext = () => {
    const context = useContext(TradeHistoryContext)
    if (!context) {
        throw new Error('context must be used within a TradeHistoryProvider')
    }
    return context
}

const TradeHistoryProvider = ({ children }: { children: React.ReactNode }) => {
    const { userPublicWalletAddresses } = useUser()
    const { subscribe, unsubscribe } = useWebSocket()

    // Memoize date calculations to prevent recalculation on every render
    // const dateRange = useMemo(() => {
    //     const endDate = new Date()
    //     const startDate = new Date()
    //     startDate.setMonth(startDate.getMonth() - 6)

    //     return {
    //         startTime: Math.floor(startDate.getTime() / 1000).toString(),
    //         endTime: Math.floor(endDate.getTime() / 1000).toString(),
    //     }
    // }, []) // Empty dependency array - calculate once on component mount

    // const { data: userFillsData, isLoading: isLoadingUserFillsData } = useHyperliquidUserFillsData({
    //     user: userPublicWalletAddresses['ethereum'],
    //     aggregateByTime: true,
    //     startTime: dateRange.startTime,
    //     endTime: dateRange.endTime,
    // })

    const userPublicWalletAddress = userPublicWalletAddresses['ethereum']

    const [tradeHistoryData, setTradeHistoryData] = useState<TradeHistory[]>(() => {
        // Use smart fallback to get best available cached data
        const cachedData = cacheUtils.getUserDataWithFallback<TradeHistory[]>(null, 'tradeHistory')
        return cachedData || []
    })

    const [loadingTradeHistoryData, setLoadingTradeHistoryData] = useState<boolean>(() => {
        const cachedData = cacheUtils.getUserDataWithFallback<TradeHistory[]>(null, 'tradeHistory')
        return !cachedData
    })

    // Funding data state
    const [fundingData, setFundingData] = useState<FundingData[]>(() => {
        const cachedData = cacheUtils.getUserDataWithFallback<FundingData[]>(null, 'fundingHistory')
        return cachedData || []
    })

    const [loadingFundingData, setLoadingFundingData] = useState<boolean>(() => {
        const cachedData = cacheUtils.getUserDataWithFallback<FundingData[]>(null, 'fundingHistory')
        return !cachedData
    })

    const { isSpotToken, spotTokenId, tokenId } = usePairTokensContext()

    // filter trade history data by current coin
    const currentCoinTradesData = useMemo(() => {
        // const tradesFromApi = userFillsData?.filter(fill => (isSpotToken ? fill.coin === spotTokenId : fill.coin === tokenId)) || []
        const tradesFromWebsocket = tradeHistoryData.filter(trade => (isSpotToken ? trade.coin === spotTokenId : trade.coin === tokenId))

        // Combine both sources
        const allTrades = [...tradesFromWebsocket]
        // Remove duplicates based on timestamp using a Map
        const uniqueTradesMap = new Map()

        allTrades.forEach(trade => {
            uniqueTradesMap.set(trade.tid, trade)
        })

        // Convert Map back to array and sort by time (latest first)
        return Array.from(uniqueTradesMap.values()).sort((a, b) => b.time - a.time)
    }, [tradeHistoryData, isSpotToken, spotTokenId, tokenId])

    // Load cached data for specific user when wallet address becomes available
    useEffect(() => {
        const cachedTradeData = cacheUtils.getUserDataWithFallback<TradeHistory[]>(userPublicWalletAddress, 'tradeHistory')
        if (cachedTradeData) {
            setTradeHistoryData(cachedTradeData)
            setLoadingTradeHistoryData(false)
        }

        const cachedFundingData = cacheUtils.getUserDataWithFallback<FundingData[]>(userPublicWalletAddress, 'fundingHistory')
        if (cachedFundingData) {
            setFundingData(cachedFundingData)
            setLoadingFundingData(false)
        }
    }, [userPublicWalletAddress])

    // Trade history WebSocket subscription
    useEffect(() => {
        if (!userPublicWalletAddress) {
            setLoadingTradeHistoryData(false)
            setTradeHistoryData([])
            return
        }

        // Only set loading to true if we don't have cached data
        const cached = cacheUtils.getUserDataWithFallback<TradeHistory[]>(userPublicWalletAddress, 'tradeHistory')
        if (!cached) {
            setLoadingTradeHistoryData(true)
        }

        subscribe(
            'userFills',
            data => {
                if (data) {
                    // Maintain history by appending new trades to existing websocket data
                    setTradeHistoryData(prev => {
                        const newTrades = data.fills
                        const updatedData = [...prev, ...newTrades]

                        // Use smart tier caching
                        cacheUtils.setUserDataWithTiers(updatedData, userPublicWalletAddress, 'tradeHistory')

                        return updatedData
                    })
                    setLoadingTradeHistoryData(false)
                }
            },
            {
                user: userPublicWalletAddress,
            }
        )

        return () => {
            unsubscribe('userFills', {
                user: userPublicWalletAddress,
            })
        }
    }, [userPublicWalletAddress, subscribe, unsubscribe])

    // Funding data WebSocket subscription
    useEffect(() => {
        if (!userPublicWalletAddress) {
            setLoadingFundingData(false)
            setFundingData([])
            return
        }

        // Only set loading to true if we don't have cached data
        const cachedFunding = cacheUtils.getUserDataWithFallback<FundingData[]>(userPublicWalletAddress, 'fundingHistory')
        if (!cachedFunding) {
            setLoadingFundingData(true)
        }

        subscribe(
            'userFundings',
            data => {
                if (data && data.fundings) {
                    setFundingData(data.fundings)
                    // Use smart tier caching
                    cacheUtils.setUserDataWithTiers(data.fundings, userPublicWalletAddress, 'fundingHistory')
                    setLoadingFundingData(false)
                }
            },
            {
                user: userPublicWalletAddress,
            }
        )

        return () => {
            unsubscribe('userFundings', {
                user: userPublicWalletAddress,
            })
        }
    }, [userPublicWalletAddress, subscribe, unsubscribe])

    return (
        <TradeHistoryContext.Provider
            value={{
                tradeHistoryData,
                loadingTradeHistoryData: loadingTradeHistoryData,
                currentCoinTradesData,
                fundingData,
                loadingFundingData,
            }}
        >
            {children}
        </TradeHistoryContext.Provider>
    )
}

export default TradeHistoryProvider
