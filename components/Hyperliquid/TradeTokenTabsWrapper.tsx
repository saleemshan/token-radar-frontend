'use client'
import React, { useEffect, useState } from 'react'
import OpenOrderTable from './OpenOrderTable'
import OrderHistoryTable from './OrderHistoryTable'
import TradeHistoryTable from './TradeHistoryTable'
import BalancesTable from './BalancesTable'
import PositionsTable from './PositionsTable'
import HideSmallAssetsButton from '../HideSmallAssetsButton'
import FundingHistoryTable from './FundingHistoryTable'
import { useWebDataContext } from '@/context/webDataContext'

type Tab = 'Balances' | 'Positions' | 'Open Orders' | 'Order History' | 'Trade History' | 'Funding History'

const TradeTokenTabsWrapper = ({
    showNavigation = true,
    hideSpotBalance = false,
    showTabs = ['Balances', 'Positions', 'Open Orders', 'Order History', 'Trade History', 'Funding History'],
    initialActiveTab = 'Balances',
}: {
    isMobile?: boolean
    hideSpotBalance?: boolean
    showNavigation?: boolean
    showTabs?: Tab[]
    initialActiveTab?: Tab
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('Balances')
    const { webData2 } = useWebDataContext()

    useEffect(() => {
        setActiveTab(initialActiveTab)
    }, [initialActiveTab])

    // Get the count of open positions
    const openPositionsCount = webData2?.clearinghouseState?.assetPositions?.length || 0

    // Get the count of open orders
    const openOrdersCount = webData2?.openOrders?.length || 0

    return (
        <div className="flex flex-col h-full max-h-full lg:max-h-[60vh] bg-black relative border-t xl:border-t-0 border-border flex-1">
            {showNavigation && (
                <div className="flex items-center gap-3 border-b border-border p-2  w-full">
                    <div className="flex  overflow-x-auto relative z-40 gap-2 items-center bg-black no-scrollbar">
                        {showTabs.map(tab => {
                            // Add count to Positions tab if there are open positions
                            let displayText: string = tab
                            if (tab === 'Positions' && openPositionsCount > 0) {
                                displayText = `${tab} (${openPositionsCount})`
                            } else if (tab === 'Open Orders' && openOrdersCount > 0) {
                                displayText = `${tab} (${openOrdersCount})`
                            }

                            return (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab)
                                    }}
                                    className={` flex text-nowrap items-center justify-center text-xs py-1 hover:bg-neutral-800 duration-200 transition-all  px-2 rounded-md font-semibold ${
                                        activeTab === tab ? 'bg-neutral-900 text-neutral-text' : 'bg-black text-neutral-text-dark/70'
                                    }`}
                                >
                                    {displayText}
                                </button>
                            )
                        })}
                    </div>
                    <HideSmallAssetsButton className="ml-auto" />
                </div>
            )}
            {activeTab === 'Balances' && <BalancesTable hideSpotBalance={hideSpotBalance} />}
            {activeTab === 'Positions' && <PositionsTable />}
            {activeTab === 'Open Orders' && <OpenOrderTable />}
            {activeTab === 'Order History' && <OrderHistoryTable />}
            {activeTab === 'Trade History' && <TradeHistoryTable />}
            {activeTab === 'Funding History' && <FundingHistoryTable />}
        </div>
    )
}

export default TradeTokenTabsWrapper
