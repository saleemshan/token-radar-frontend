//
import React, { createContext, useContext, useEffect, useState } from 'react'
import { OrderHistory } from '@/types/hyperliquid'
import { useWebSocket } from './websocketContext'
import { useUser } from './UserContext'
import { cacheUtils } from '@/utils/cache'

interface OrderHistoryProps {
    orderHistoryData: OrderHistory[]
    loadingOrderHistory: boolean
}

const OrderHistoryContext = createContext({} as OrderHistoryProps)

export const useOrderHistoryContext = () => {
    const context = useContext(OrderHistoryContext)
    if (!context) {
        throw new Error('context must be used within a OrderHistoryProvider')
    }
    return context
}

const OrderHistoryProvider = ({ children }: { children: React.ReactNode }) => {
    const { subscribe, unsubscribe } = useWebSocket()
    const { userPublicWalletAddresses } = useUser()

    const userPublicWalletAddress = userPublicWalletAddresses['ethereum']

    const [orderHistoryData, setOrderHistoryData] = useState<OrderHistory[]>(() => {
        // Use smart fallback to get best available cached data
        const cachedData = cacheUtils.getUserDataWithFallback<OrderHistory[]>(null, 'orderHistory')
        return cachedData || []
    })

    const [loadingOrderHistory, setLoadingOrderHistory] = useState<boolean>(() => {
        const cachedData = cacheUtils.getUserDataWithFallback<OrderHistory[]>(null, 'orderHistory')
        return !cachedData
    })

    // Load cached data for specific user when wallet address becomes available
    useEffect(() => {
        const cachedData = cacheUtils.getUserDataWithFallback<OrderHistory[]>(userPublicWalletAddress, 'orderHistory')
        if (cachedData) {
            setOrderHistoryData(cachedData)
            setLoadingOrderHistory(false)
        }
    }, [userPublicWalletAddress])

    useEffect(() => {
        const fetchUserAddress = async () => {
            try {
                if (!userPublicWalletAddress) {
                    setLoadingOrderHistory(false)
                    setOrderHistoryData([])
                    return
                }

                // Use the centralized WebSocket subscription
                subscribe(
                    'userHistoricalOrders',
                    data => {
                        if (data) {
                            // Append new orders instead of replacing
                            setOrderHistoryData(prevData => {
                                const newOrders = data.orderHistory ?? []
                                // Merge with existing data, avoiding duplicates
                                const existingOrderIds = new Set(prevData.map(order => order.order.oid))
                                const uniqueNewOrders = newOrders.filter((order: OrderHistory) => !existingOrderIds.has(order.order.oid))
                                const updatedData = [...prevData, ...uniqueNewOrders]

                                // Use smart tier caching
                                cacheUtils.setUserDataWithTiers(updatedData, userPublicWalletAddress, 'orderHistory')

                                return updatedData
                            })
                            setLoadingOrderHistory(false)
                        }
                    },
                    { user: userPublicWalletAddress }
                )
            } catch (error) {
                setLoadingOrderHistory(false)
                setOrderHistoryData([])
            }
        }

        fetchUserAddress()

        return () => {
            unsubscribe('userHistoricalOrders', {
                user: userPublicWalletAddress,
            })
        }
    }, [subscribe, unsubscribe, userPublicWalletAddress])

    return (
        <OrderHistoryContext.Provider
            value={{
                orderHistoryData,
                loadingOrderHistory,
            }}
        >
            {children}
        </OrderHistoryContext.Provider>
    )
}

export default OrderHistoryProvider
