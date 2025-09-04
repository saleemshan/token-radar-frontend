'use client'
import React, { Suspense, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MdDragIndicator } from 'react-icons/md'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import usePreventZoomOnMobile from '@/hooks/usePreventMobileZoom'
import useIsMobile from '@/hooks/useIsMobile'
import useScreenWidth from '@/hooks/useScreenWidth'
import { usePairTokensContext } from '@/context/pairTokensContext'
import NewsTradingProvider from '@/context/NewsTradingContext'

import NewsTradingAgreementModal from '@/components/modal/NewsTradingAgreementModal'

// import HyperliquidChart from '@/components/graph/HyperliquidChart'
// import TradeTokenTabsWrapper from '@/components/Hyperliquid/TradeTokenTabsWrapper'
// import TokenKeyDetails from '@/components/Hyperliquid/TokenKeyDetails'
// import HyperLiquidTradeForm from '@/components/Hyperliquid/HyperLiquidTradeForm'

// import NewsTradingIntro from '@/components/NewsTradingIntro'
import NewsTradingSidePanel from '@/components/panel/NewsTradingSidePanel'
// import HyperLiquidTransactionActions from '@/components/Hyperliquid/HyperLiquidTransactionActions'
// import NewsStrategiesPanel from '@/components/panel/NewsStrategiesPanel'

// const NewsTradingSidePanel = dynamic(() => import('@/components/panel/NewsTradingSidePanel'), {
//     ssr: false,
// })
const NewsTradingIntro = dynamic(() => import('@/components/NewsTradingIntro'), {
    ssr: false,
})
const TokenKeyDetails = dynamic(() => import('@/components/Hyperliquid/TokenKeyDetails'), { ssr: false })
const HyperliquidChart = dynamic(() => import('@/components/graph/HyperliquidChart'), { ssr: false })
const TradeTokenTabsWrapper = dynamic(() => import('@/components/Hyperliquid/TradeTokenTabsWrapper'), { ssr: false })
const HyperLiquidTradeForm = dynamic(() => import('@/components/Hyperliquid/HyperLiquidTradeForm'), { ssr: false })

const NewsTradingLayout = () => {
    usePreventZoomOnMobile()

    const { tokenId, isSpotToken, spotTokenId } = usePairTokensContext()
    const isMobile = useIsMobile()
    const screenWidth = useScreenWidth()

    const [isDragging, setIsDragging] = useState(false)
    const [showOnlyNewsFeedPanel, setShowOnlyNewsFeedPanel] = useState(false)

    useEffect(() => {
        if (isMobile || screenWidth < 1024) {
            setShowOnlyNewsFeedPanel(true)
        } else {
            setShowOnlyNewsFeedPanel(false)
        }
    }, [isMobile, screenWidth])

    return (
        <NewsTradingProvider>
            <NewsTradingIntro />
            <div className="flex-1 min-h-full max-h-full max-w-full overflow-hidden">
                <PanelGroup autoSaveId="newsTradingPage" direction="horizontal" className="min-w-full min-h-full max-w-full overflow-hidden">
                    <Panel
                        id="parentLeft"
                        className="relative z-10 flex h-full overflow-hidden  w-full"
                        style={{
                            minWidth: '320px',
                            // maxWidth: '300px',
                        }}
                        minSize={15}
                        defaultSize={20}
                    >
                        <NewsTradingSidePanel showOnlyNewsFeedPanel={showOnlyNewsFeedPanel} />
                    </Panel>
                    {!showOnlyNewsFeedPanel && (
                        <>
                            <PanelResizeHandle
                                onDragging={setIsDragging}
                                className="hidden lg:block relative z-[50] hover:z-[999999] hover:w-[10px] hover:bg-neutral-900 transition-all duration-200 group"
                            >
                                <MdDragIndicator className="absolute  translate-x-1/2 right-1/2    bottom-1/2 translate-y-1/2 group-hover:text-neutral-text text-neutral-text-dark" />
                            </PanelResizeHandle>
                            <Panel
                                id="parentRight"
                                className="hidden lg:flex flex-col gap-3 overflow-hidden flex-1 pointer-events-none w-full relative"
                                minSize={50}
                                defaultSize={80}
                            >
                                {/* {isDragging && <div className="absolute inset-0 bg-black/50 z-[9999999999] "></div>} */}
                                <PanelGroup
                                    autoSaveId="newsTradingPageChart"
                                    direction="vertical"
                                    className="w-full  min-h-full max-h-full flex flex-col overflow-hidden  pointer-events-auto  border-border  border-r bg-black divide-y divide-border"
                                >
                                    <Panel
                                        id="top"
                                        order={1}
                                        className="relative z-10 flex flex-col max-h-full overflow-hidden"
                                        minSize={30}
                                        defaultSize={30}
                                    >
                                        {!isMobile && (
                                            <>
                                                {isDragging && <div className="absolute inset-0 z-[9999999999] "></div>}
                                                <TokenKeyDetails showSelectTokenPairs={true} isNewsTradingPage={true} />
                                                <HyperliquidChart
                                                    token={(isSpotToken ? spotTokenId : tokenId) ?? 'BTC'}
                                                    containerHeight="h-full"
                                                    showNewsMarks={true}
                                                />
                                            </>
                                        )}
                                    </Panel>

                                    <PanelResizeHandle className="relative hover:h-[10px] z-[50] hover:z-[999999] hover:bg-neutral-900 transition-all duration-200 group">
                                        <MdDragIndicator className="absolute  rotate-90 translate-x-1/2 right-1/2 -translate-y-1/2 top-1/2 group-hover:text-neutral-text text-neutral-text-dark" />
                                    </PanelResizeHandle>

                                    <Panel id="bottom" order={2} className="relative z-10" minSize={20} defaultSize={20}>
                                        <Suspense>
                                            <div className="h-full flex-1 overflow-hidden max-h-full relative flex flex-col">
                                                <TradeTokenTabsWrapper
                                                    showTabs={[
                                                        'Balances',
                                                        'Positions',
                                                        'Open Orders',
                                                        'Trade History',
                                                        'Order History',
                                                        'Funding History',
                                                    ]}
                                                    showNavigation={true}
                                                    initialActiveTab="Balances"
                                                    hideSpotBalance={false}
                                                />
                                            </div>
                                        </Suspense>
                                    </Panel>
                                </PanelGroup>
                            </Panel>
                        </>
                    )}
                </PanelGroup>
            </div>

            {!showOnlyNewsFeedPanel && (
                <div className="hidden lg:flex flex-col overflow-hidden w-auto  min-w-fit">
                    <div className="min-w-[20rem] max-w-[20rem] lg:min-w-[22rem] lg:max-w-[22rem] overflow-y-auto h-full flex flex-col pointer-events-auto no-scrollbar divide-y divide-border border-b border-border relative">
                        <HyperLiquidTradeForm />
                        {/* <NewsStrategiesPanel /> */}
                    </div>
                    {/* {ready && authenticated && <HyperLiquidTransactionActions />} */}
                </div>
            )}

            <NewsTradingAgreementModal />
        </NewsTradingProvider>
    )
}

export default NewsTradingLayout
