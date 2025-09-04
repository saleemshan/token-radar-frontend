'use client'

// React and hooks
import React, { useMemo, useState } from 'react'
import usePreventZoomOnMobile from '@/hooks/usePreventMobileZoom'

// Next.js
import Image from 'next/image'
// import { useRouter } from 'next/navigation'

// Third-party libraries
import { useLogin, usePrivy } from '@privy-io/react-auth'

// Components
import HyperliquidChart from '@/components/graph/HyperliquidChart'
// import PercentageChange from '@/components/PercentageChange'
import TradeTokenTabsWrapper from '@/components/Hyperliquid/TradeTokenTabsWrapper'
import HyperLiquidTradeForm from '@/components/Hyperliquid/HyperLiquidTradeForm'

// Context
import { usePairTokensContext } from '@/context/pairTokensContext'
import { FaXmark } from 'react-icons/fa6'
import TokenKeyDetails from '@/components/Hyperliquid/TokenKeyDetails'

// Utils

// type PriceData = {
//     markPx: string
//     prevDayPx: string
// }

// function calculate24HourChange(data: PriceData) {
//     const { markPx, prevDayPx } = data

//     const current = parseFloat(markPx)
//     const prev = parseFloat(prevDayPx)

//     // Handle cases where prev is 0 or invalid
//     if (!prev || prev === 0) return 0

//     const change = ((current - prev) / prev) * 100
//     // Handle Infinity or NaN cases

//     return isFinite(change) ? change : 0
// }

const TradePage = () => {
    usePreventZoomOnMobile()
    const { authenticated, ready } = usePrivy()
    const { login: handleSignIn } = useLogin()
    // const router = useRouter()

    const { isSpotToken, tokenId, spotTokenId } = usePairTokensContext()

    const tokenName = useMemo(() => {
        if (isSpotToken) {
            return spotTokenId
        }
        return tokenId
    }, [isSpotToken, tokenId, spotTokenId])

    const [showDrawer, setShowDrawer] = useState<{
        show: boolean
        target: 'buy' | 'sell'
    }>({
        show: false,
        target: 'buy',
    })

    //preload holders overtime
    // eslint-disable-next-line @typescript-eslint/no-unused-vars

    // const handleReturnClick = () => {
    //     if (window.history.length > 1) {
    //         router.back()
    //     } else {
    //         router.replace('/')
    //     }
    // }

    if (tokenId)
        return (
            <>
                <div className="  max-h-full overflow-y-auto w-full flex-1 flex-col gap-3 no-scrollbar rounded-lg  relative  md:mb-0 pb-16 md:pb-0">
                    <div className=" border-b border-border max-w-full min-w-full">
                        <TokenKeyDetails showSelectTokenPairs={true} />
                    </div>

                    <div className=" min-h-[60vh] h-[60vh] md:min-h-[75vh] md:h-[75vh] border-b border-border flex flex-col w-full relative items-center justify-center">
                        <HyperliquidChart token={tokenName ?? ''} containerHeight="h-full" />
                        <div className="absolute pointer-events-none z-[10]">
                            <Image
                                src={`${process.env.basePath}/images/brand/logo-wordmark.png`}
                                style={{ opacity: 0.1 }}
                                alt="Crush Logo"
                                width={200}
                                height={50}
                            />
                        </div>
                    </div>

                    <TradeTokenTabsWrapper isMobile={true} />

                    <>
                        <div className=" inset-x-0 h-20 min-h-20 pb-6 fixed md:relative  bottom-0 flex gap-3 p-3 border-t border-border bg-table-even z-[50]">
                            <button
                                type="button"
                                onClick={() => {
                                    if (ready && authenticated) {
                                        setShowDrawer({ show: true, target: 'buy' })
                                    } else {
                                        handleSignIn()
                                    }
                                }}
                                className={`w-1/2 flex items-center justify-center  h-full rounded-lg font-semibold text-sm hover:bg-neutral-800 duration-200 transition-all bg-neutral-900 text-positive`}
                            >
                                Buy
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (ready && authenticated) {
                                        setShowDrawer({ show: true, target: 'sell' })
                                    } else {
                                        handleSignIn()
                                    }
                                }}
                                className={`w-1/2 flex items-center justify-center  h-full rounded-lg font-semibold text-sm hover:bg-neutral-800 duration-200 transition-all bg-neutral-900 text-negative`}
                            >
                                Sell
                            </button>
                        </div>

                        {showDrawer.show && (
                            <>
                                <div
                                    className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[99]"
                                    onClick={() => {
                                        setShowDrawer({ show: false, target: 'buy' })
                                    }}
                                ></div>
                                <div className="flex flex-col  w-full border-t border-border  overflow-hidden  bg-black pointer-events-auto fixed inset-x-0 z-[100] max-h-[90vh] bottom-0 h-fit justify-end">
                                    <div className="border-border border-b p-2 flex items-center justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDrawer({ show: false, target: 'buy' })
                                            }}
                                            className="  flex bg-table-odd hover:bg-neutral-900 border border-border rounded-lg w-8 h-8 items-center justify-center text-neutral-text-dark hover:text-neutral-text apply-transition "
                                        >
                                            <FaXmark />
                                        </button>
                                    </div>
                                    <div className="w-full max-h-full overflow-y-auto flex-1 ">
                                        {ready && authenticated && <HyperLiquidTradeForm initialActiveTab={showDrawer.target} />}
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                </div>
            </>
        )
}

export default TradePage
