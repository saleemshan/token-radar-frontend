'use client'

import React from 'react'
import PairTokensProvider from './pairTokensContext'
import WebDataProvider from './webDataContext'
import HyperliquidProvider from './hyperLiquidContext'
import TradeHistoryProvider from './tradeHistoryContext'
import { TradeProvider } from '@/context/TradeContext'
import { UserProvider } from '@/context/UserContext'
import PrivyAuthProvider from '@/context/PrivyProvider'
import { MaintenanceProvider } from '@/context/MaintenanceContext'
import ReactQueryClientProvider from '@/context/ReactQueryClientProvider'
import { InfoBannerProvider } from '@/context/InfoBannerContext'
import { WebSocketProvider } from '@/context/websocketContext'
import SettingsProvider from '@/context/SettingsContext'
import { PendingTransactionsProvider } from '@/context/PendingTransactionsContext'
import { RefetchProvider } from './RefetchContext'
import OrderBookTradesProvider from '@/context/OrderBookTradesContext'
import OrderHistoryProvider from '@/context/orderHistoryContext'
import { KeyboardShortcutProvider } from './KeyboardShortcutContext'
import ReferralGateProvider from './ReferralGateContext'
import { useCachePreloader } from '@/hooks/useCache'
import { WalletProvider } from './WalletContext'

// Cache initialization component
const CacheInitializer = ({ children }: { children: React.ReactNode }) => {
    useCachePreloader()
    return <>{children}</>
}

const ContextProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <CacheInitializer>
            <PrivyAuthProvider>
                <ReactQueryClientProvider>
                    <MaintenanceProvider>
                        <InfoBannerProvider>
                            <ReferralGateProvider>
                                <UserProvider>
                                    <WebSocketProvider>
                                        <WebDataProvider>
                                            <HyperliquidProvider>
                                                <PairTokensProvider>
                                                    <TradeHistoryProvider>
                                                        <PendingTransactionsProvider>
                                                            <OrderBookTradesProvider>
                                                                <OrderHistoryProvider>
                                                                    <KeyboardShortcutProvider>
                                                                        <SettingsProvider>
                                                                            <RefetchProvider>
                                                                                <WalletProvider>
                                                                                    <TradeProvider>{children}</TradeProvider>
                                                                                </WalletProvider>
                                                                            </RefetchProvider>
                                                                        </SettingsProvider>
                                                                    </KeyboardShortcutProvider>
                                                                </OrderHistoryProvider>
                                                            </OrderBookTradesProvider>
                                                        </PendingTransactionsProvider>
                                                    </TradeHistoryProvider>
                                                </PairTokensProvider>
                                            </HyperliquidProvider>
                                        </WebDataProvider>
                                    </WebSocketProvider>
                                </UserProvider>
                            </ReferralGateProvider>
                        </InfoBannerProvider>
                    </MaintenanceProvider>
                </ReactQueryClientProvider>
            </PrivyAuthProvider>
        </CacheInitializer>
    )
}

export default ContextProviders
