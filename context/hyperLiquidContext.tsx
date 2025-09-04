'use client'

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { useHyperliquidUserRoleData, UserRole } from '@/hooks/data/useHyperliquidUserRoleData'
import { useUser } from './UserContext'
import { useWebDataContext } from './webDataContext'

//Move constants to top

interface HyperLiquidContextProps {
    userRole: UserRole | undefined
    isFetchingUserRole: boolean
    isAccountFunded: boolean
    marketOrderSlippage: number
    setMarketOrderSlippage: (slippage: number) => void
}

const HyperLiquidContext = createContext({} as HyperLiquidContextProps)

export const useHyperLiquidContext = () => {
    const context = useContext(HyperLiquidContext)
    if (!context) {
        throw new Error('context must be used within a HyperliquidProvider')
    }
    return context
}

const HyperliquidProvider = ({ children }: { children: ReactNode }) => {
    const { userPublicWalletAddresses } = useUser()
    const { webData2 } = useWebDataContext()

    const userAddress = userPublicWalletAddresses['ethereum']
    const { data: userRole, isFetching: isFetchingUserRole } = useHyperliquidUserRoleData(userAddress)

    const [isAccountFunded, setIsAccountFunded] = useState(false)
    const [marketOrderSlippage, setMarketOrderSlippage] = useState(5)

    // Handle localStorage on client-side only
    useEffect(() => {
        const savedSlippage = localStorage.getItem('marketOrderSlippage')
        if (savedSlippage) {
            setMarketOrderSlippage(Number(savedSlippage))
        }
    }, [])

    useEffect(() => {
        const isWithdrawablePositive = Number(webData2?.clearinghouseState?.withdrawable) > 0

        if (isWithdrawablePositive) {
            setIsAccountFunded(true)
            return
        }

        setIsAccountFunded(userRole ? userRole.toLowerCase() !== 'missing' : false)
    }, [userRole, webData2?.clearinghouseState?.withdrawable])

    return (
        <HyperLiquidContext.Provider
            value={{
                userRole,
                isFetchingUserRole,
                isAccountFunded,
                marketOrderSlippage,
                setMarketOrderSlippage,
            }}
        >
            {children}
        </HyperLiquidContext.Provider>
    )
}

export default HyperliquidProvider
