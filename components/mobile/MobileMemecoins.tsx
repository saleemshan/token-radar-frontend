import TrendingPanel from '../panel/TrendingPanel'
import useIsMobile from '@/hooks/useIsMobile'

import React, { useState } from 'react'

import NewPairPanel from '../panel/NewPairPanel'
import Link from 'next/link'
import FavouritesPanel from '../panel/FavouritesPanel'
import AlphaFeedPanel from '../panel/AlphaFeedPanel'

const MobileMemecoins = () => {
    const isMobile = useIsMobile()

    const [activeTab, setActiveTab] = useState<string>('Trending')

    const tabs = ['Trending', 'New Pairs', 'Alpha Feed', 'Watchlist']

    if (isMobile)
        return (
            <div className="max-h-full overflow-hidden w-full flex-1  md:hidden  flex flex-col">
                {/* <div className="flex flex-col p-3">
                    {ready && authenticated && (
                        <div className="flex flex-col mb-3  mt-10 gap-2">
                            <div className="text-[12px]">Total Balance (USD)</div>
                            <div className="flex items-end text-white text-2xl">
                                {isBalanceLoading || !totalUserBalances ? (
                                    <TextLoading />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1 items-end">
                                            <div className="font-medium leading-none">
                                                {totalUserBalances.balanceUSD > 0 ? getReadableNumber(totalUserBalances.balanceUSD, 2, '$') : '-'}
                                            </div>
                               
                                        </div>

                                        {!isBalanceLoading &&
                                            totalUserBalances &&
                                            holdingsPercentageChange !== undefined &&
                                            holdingsPercentageChange !== 0 &&
                                            !Number.isNaN(holdingsPercentageChange) && (
                                                <Tooltip text="Today PNL">
                                                    <PercentageChange size="small" percentage={holdingsPercentageChange}></PercentageChange>
                                                </Tooltip>
                                            )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div> */}
                <div className="flex flex-col gap-3 p-3 pb-0">
                    <div className="relative w-full h-9 min-h-9 ">
                        <Link
                            href={`/mobile/search`}
                            className="absolute inset-0 w-full h-full flex items-center rounded-lg px-3 focus:outline-none text-neutral-text-dark bg-table-odd border  focus:border-border border-border text-sm "
                        >
                            Search Token
                        </Link>
                    </div>
                </div>

                <div className="p-3 border-b border-border flex gap-3 overflow-x-auto relative z-40 bg-black no-scrollbar">
                    {tabs.map(tab => {
                        return (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab)
                                }}
                                className={` flex text-nowrap items-center justify-center text-xs py-2 hover:bg-neutral-900 duration-200 transition-all  px-2 rounded-md font-semibold ${
                                    activeTab === tab ? 'bg-neutral-900 text-neutral-text' : 'bg-black text-neutral-text-dark/70'
                                }`}
                            >
                                {tab}
                            </button>
                        )
                    })}
                </div>

                <div className="h-full overflow-hidden">
                    {activeTab === 'Trending' && (
                        <TrendingPanel
                            showHeader={true}
                            rounded={false}
                            border={false}
                            showSocials={false}
                            showTokenAddress={false}
                            columns={['token', 'mcapPriceChange24h', 'quickBuy']}
                            size="extra-small"
                            percentageSize="small"
                            percentageStyle={true}
                            isMobile={true}
                            showQuickBuy={true}
                        />
                    )}

                    {activeTab === 'New Pairs' && (
                        <NewPairPanel
                            showHeader={true}
                            rounded={false}
                            border={false}
                            showSocials={false}
                            showTokenAddress={false}
                            size="extra-small"
                            columns={['token', 'mcapPriceChange24h', 'quickBuy']}
                            percentageSize="small"
                            percentageStyle={true}
                            showQuickBuy={true}
                            isMobile={true}
                        />
                    )}

                    {activeTab === 'Watchlist' && <FavouritesPanel showBorder={false} />}
                    {activeTab === 'Alpha Feed' && <AlphaFeedPanel showBorder={false} />}
                </div>
            </div>
        )
}

export default MobileMemecoins
