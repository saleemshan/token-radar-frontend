'use client'
import React, { useState } from 'react'
import HoldersTab from '@/components/tabs/HoldersTab'
import MarketIntelligenceTab from '@/components/tabs/MarketIntelligenceTab'
import MyPositionsTab from '@/components/tabs/MyPositionsTab'
import InfoTab from '../tabs/InfoTab'
import MyTradesTab from '../tabs/MyTradesTab'

import InsidersSnipersTab from '@/components/tabs/InsidersSnipersTab'
import clsx from 'clsx'

type Tab = 'Holders' | 'Market Intelligence' | 'Traders' | 'My Positions' | 'Info' | 'My Trades'

const TokenTabsPanel = ({
    tokenAddress,
    chain,
    isMobile = false,
    tokenData,
}: {
    tokenAddress: string
    chain: string
    isMobile?: boolean
    tokenData: Token | undefined
}) => {
    const [activeTab, setActiveTab] = useState<Tab>(isMobile ? 'Info' : 'Holders')

    const tabs: Tab[] = [
        'Holders',
        'Market Intelligence',
        'Traders',
        'My Positions',
        'My Trades',
        // 'Limit Orders',
    ]

    return (
        <div className="flex flex-col relative border-t xl:border-t border-border bg-black">
            <div className="p-2 border-b border-border flex gap-2 overflow-x-auto relative z-40 bg-black no-scrollbar">
                {isMobile && (
                    <button
                        onClick={() => {
                            setActiveTab('Info')
                        }}
                        className={` flex text-nowrap items-center justify-center text-xs py-1 hover:bg-neutral-800 duration-200 transition-all  px-2 rounded-md font-semibold ${
                            activeTab === 'Info' ? 'bg-neutral-900 text-neutral-text' : 'bg-black text-neutral-text-dark/70'
                        }`}
                    >
                        Info
                    </button>
                )}
                {tabs.map(tab => {
                    return (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab)
                            }}
                            className={clsx(
                                ' flex text-nowrap items-center justify-center text-xs py-1 hover:bg-neutral-800 duration-200 transition-all  px-2 rounded-md font-semibold',
                                activeTab === tab ? 'bg-neutral-900 text-neutral-text' : 'bg-black text-neutral-text-dark/70'
                            )}
                        >
                            {tab}
                        </button>
                    )
                })}
            </div>
            {activeTab === 'Holders' && <HoldersTab tokenAddress={tokenAddress} tokenData={tokenData} />}
            {activeTab === 'Market Intelligence' && <MarketIntelligenceTab tokenAddress={tokenAddress} />}
            {activeTab === 'Traders' && <InsidersSnipersTab tokenAddress={tokenAddress} />}
            {activeTab === 'My Positions' && <MyPositionsTab />}
            {activeTab === 'My Trades' && <MyTradesTab tokenAddress={tokenAddress} tokenData={tokenData} chain={chain} />}
            {activeTab === 'Info' && <InfoTab tokenAddress={tokenAddress} tokenData={tokenData} chain={chain} />}
            {/* {activeTab === 'Limit Orders' && <OrdersTab />} */}
        </div>
    )
}

export default TokenTabsPanel
