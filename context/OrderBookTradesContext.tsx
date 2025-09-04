'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { BookDataProps, WsTrades } from '@/types/hyperliquid'
import { usePairTokensContext } from './pairTokensContext'
import { useWebSocket } from './websocketContext'
import { webSocketCache, CACHE_KEYS } from '@/utils/cache'

interface OrderBookTradesProps {
    bookData: BookDataProps
    tradesData: WsTrades[]
    loadingBookData: boolean
}

export interface Order {
    sz: number
    px: number
    n: number
}

const OrderBookTradesContext = createContext({} as OrderBookTradesProps)

export const useOrderBookTradesContext = () => {
    const context = useContext(OrderBookTradesContext)
    if (!context) {
        throw new Error('useOrderBookTrades must be used within a OrderBookTradesProvider')
    }
    return context
}

const OrderBookTradesProvider = ({ children }: { children: React.ReactNode }) => {
    const { tokenId, isSpotToken, spotTokenId } = usePairTokensContext()
    const { subscribe, unsubscribe } = useWebSocket()

    const coin = isSpotToken ? spotTokenId : tokenId

    const [bookData, setBookData] = useState<BookDataProps>(() => {
        // Try to load cached data immediately if coin is available
        if (coin) {
            const cachedBookData = webSocketCache.get<BookDataProps>(`${CACHE_KEYS.ORDER_BOOK}:${coin}`)
            return cachedBookData || { asks: [], bids: [] }
        }
        return { asks: [], bids: [] }
    })

    const [tradesData, setTradesData] = useState<WsTrades[]>(() => {
        // Try to load cached trades data immediately if coin is available
        if (coin) {
            const cachedTradesData = webSocketCache.get<WsTrades[]>(`${CACHE_KEYS.TRADES}:${coin}`)
            return cachedTradesData || []
        }
        return []
    })

    const [loadingBookData, setLoadingBookData] = useState<boolean>(() => {
        // If we have cached data, don't show loading
        if (coin) {
            const cachedBookData = webSocketCache.get<BookDataProps>(`${CACHE_KEYS.ORDER_BOOK}:${coin}`)
            return !cachedBookData
        }
        return true
    })

    // Load cached data when coin changes
    useEffect(() => {
        if (coin) {
            const cachedBookData = webSocketCache.get<BookDataProps>(`${CACHE_KEYS.ORDER_BOOK}:${coin}`)
            if (cachedBookData) {
                setBookData(cachedBookData)
                setLoadingBookData(false)
            }

            const cachedTradesData = webSocketCache.get<WsTrades[]>(`${CACHE_KEYS.TRADES}:${coin}`)
            if (cachedTradesData) {
                setTradesData(cachedTradesData)
            }
        }
    }, [coin])

    // Handle trades subscription
    useEffect(() => {
        if (!isSpotToken && !tokenId) return

        const coinToUse = isSpotToken ? spotTokenId : tokenId
        const subscriptionParams = { type: 'trades', coin: coinToUse }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleTradesData = (data: any) => {
            if (data) {
                // Format the time to HH:MM:SS
                const formattedTrades = data.map((trade: WsTrades) => {
                    const date = new Date(trade.time)
                    const hours = String(date.getHours()).padStart(2, '0')
                    const minutes = String(date.getMinutes()).padStart(2, '0')
                    const seconds = String(date.getSeconds()).padStart(2, '0')
                    const newTime = `${hours}:${minutes}:${seconds}`

                    return {
                        ...trade,
                        time: newTime,
                    }
                })

                setTradesData(prevTrades => {
                    const allTrades = [...formattedTrades, ...prevTrades]
                    // Sort by original timestamp to ensure correct order
                    allTrades.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                    // Keep only the latest 30 trades
                    const updatedTrades = allTrades.slice(0, 30)

                    // Cache the updated trades data
                    webSocketCache.set(`${CACHE_KEYS.TRADES}:${coinToUse}`, updatedTrades)

                    return updatedTrades
                })
            }
        }

        subscribe('trades', handleTradesData, subscriptionParams)

        return () => {
            // Send explicit unsubscribe message
            unsubscribe('trades', subscriptionParams)
        }
    }, [isSpotToken, spotTokenId, tokenId, subscribe, unsubscribe])

    // Handle order book subscription
    useEffect(() => {
        if (!isSpotToken && !tokenId) return

        const coinToUse = isSpotToken ? spotTokenId : tokenId
        const subscriptionParams = { type: 'l2Book', coin: coinToUse, nSigFigs: 5 }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleBookData = (data: any) => {
            setLoadingBookData(true)

            if (data?.levels) {
                const data_parsed: Array<Order[]> = data.levels.map((ordersArr: Order[]) =>
                    ordersArr.map((order: Order) => ({
                        px: Number(order.px),
                        sz: Number(order.sz),
                        n: Number(order.n),
                    }))
                )

                const bids: Order[] = data_parsed[0]
                const asks: Order[] = data_parsed[1]

                const bookDataObj = { asks, bids }
                setBookData(bookDataObj)
                setLoadingBookData(false)

                // Cache the order book data
                webSocketCache.set(`${CACHE_KEYS.ORDER_BOOK}:${coinToUse}`, bookDataObj)
            }
        }

        subscribe('l2Book', handleBookData, subscriptionParams)

        return () => {
            // Send explicit unsubscribe message
            unsubscribe('l2Book', subscriptionParams)
        }
    }, [isSpotToken, spotTokenId, tokenId, subscribe, unsubscribe])

    return (
        <OrderBookTradesContext.Provider
            value={{
                bookData,
                tradesData,
                loadingBookData,
            }}
        >
            {children}
        </OrderBookTradesContext.Provider>
    )
}

export default OrderBookTradesProvider
