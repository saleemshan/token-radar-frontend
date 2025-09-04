'use client'
import React, { useState } from 'react'
import { FaChevronDown, FaXmark } from 'react-icons/fa6'
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import useHaptic from '@/hooks/useHaptic'

import HyperLiquidTradeForm from '../Hyperliquid/HyperLiquidTradeForm'
import SelectTokenPairs from '../Hyperliquid/SelectTokenPairs'
import MinimalHyperliquidChart from './MinimalHyperliquidChart'
import HyperliquidChart from './HyperliquidChart'

const MobileNewsFeedChart = () => {
    const { authenticated, ready } = usePrivy()
    const { login: handleSignIn } = useLogin()
    const { tokenId } = usePairTokensContext()

    const { triggerHaptic } = useHaptic()

    const [showChart, setShowChart] = useState(true)
    const [showFullChart, setShowFullChart] = useState(false)
    const [showDrawer, setShowDrawer] = useState<{
        show: boolean
        target: 'buy' | 'sell'
    }>({
        show: false,
        target: 'buy',
    })

    if (tokenId)
        return (
            <>
                <div
                    className={`flex flex-col overflow-hidden border-t border-border bg-black lg:hidden ${
                        showChart ? 'relative min-h-[40vh] max-h-[40vh]' : 'relative'
                    }`}
                >
                    <div
                        onClick={() => {
                            if (!showChart) setShowChart(!showChart)
                        }}
                        className={`flex items-center justify-between cursor-pointer relative px-2 py-2 text-xs text-neutral-text
                    ${showChart ? '' : 'pb-6'}
                    `}
                    >
                        <div>{showChart ? <SelectTokenPairs /> : 'Show Chart'}</div>
                        <div className="flex items-center gap-2">
                            {showChart ? (
                                <>
                                    <button
                                        type="button"
                                        className="font-semibold pb-[2px] pt-[1px] text-xs w-16 h-7 rounded-lg flex items-center justify-center hover:bg-positive/40 duration-200 transition-all bg-positive/20 text-positive"
                                        onClick={e => {
                                            e.stopPropagation()
                                            triggerHaptic(20)
                                            if (ready && authenticated) {
                                                setShowDrawer({ show: true, target: 'buy' })
                                            } else {
                                                handleSignIn()
                                            }
                                        }}
                                    >
                                        Buy
                                    </button>

                                    <button
                                        type="button"
                                        className="font-semibold pb-[2px] pt-[1px] text-xs w-16 h-7 rounded-lg flex items-center justify-center hover:bg-negative/40 duration-200 transition-all bg-negative/20 text-negative"
                                        onClick={e => {
                                            e.stopPropagation()
                                            triggerHaptic(20)
                                            if (ready && authenticated) {
                                                setShowDrawer({ show: true, target: 'sell' })
                                            } else {
                                                handleSignIn()
                                            }
                                        }}
                                    >
                                        Sell
                                    </button>
                                    <button
                                        type="button"
                                        className="flex  bg-table-odd border border-border hover:bg-neutral-900 rounded-lg max-w-7 max-h-7 min-w-7 min-h-7 text-base items-center justify-center text-neutral-text apply-transition "
                                        onClick={e => {
                                            e.stopPropagation()
                                            setShowFullChart(!showFullChart)
                                        }}
                                    >
                                        {showFullChart ? <MdFullscreenExit /> : <MdFullscreen />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation()
                                            setShowChart(false)
                                            // setShowFullChart(false)
                                        }}
                                        className="flex  bg-table-odd border border-border hover:bg-neutral-900 rounded-lg max-w-7 max-h-7 min-w-7 min-h-7 text-sm items-center justify-center text-neutral-text apply-transition "
                                    >
                                        <FaXmark />
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={e => {
                                        e.stopPropagation()
                                        setShowChart(true)
                                        setShowFullChart(false)
                                    }}
                                    className="flex  bg-table-odd border border-border hover:bg-neutral-900 rounded-lg max-w-7 max-h-7 min-w-7 min-h-7 text-xs items-center justify-center text-neutral-text apply-transition "
                                >
                                    <FaChevronDown />
                                </button>
                            )}
                        </div>
                    </div>

                    {showChart && (
                        <div className="max-h-full flex-1 flex flex-col w-full border-t border-border ">
                            <MinimalHyperliquidChart token={tokenId} containerHeight="h-full" />
                        </div>
                    )}
                </div>

                {showFullChart && (
                    <div className="fixed inset-0 bg-black z-[998] flex flex-col w-full overflow-hidden">
                        <div className="flex items-center gap-2 p-2 border-b border-border">
                            <SelectTokenPairs />
                            <button
                                type="button"
                                className="font-semibold ml-auto pb-[2px] pt-[1px] text-xs w-16 h-7 rounded-lg flex items-center justify-center hover:bg-positive/40 duration-200 transition-all bg-positive/20 text-positive"
                                onClick={e => {
                                    e.stopPropagation()
                                    triggerHaptic(20)
                                    if (ready && authenticated) {
                                        setShowDrawer({ show: true, target: 'buy' })
                                    } else {
                                        handleSignIn()
                                    }
                                }}
                            >
                                Buy
                            </button>
                            <button
                                type="button"
                                className="font-semibold pb-[2px] pt-[1px] text-xs w-16 h-7 rounded-lg flex items-center justify-center hover:bg-negative/40 duration-200 transition-all bg-negative/20 text-negative"
                                onClick={e => {
                                    e.stopPropagation()
                                    triggerHaptic(20)
                                    if (ready && authenticated) {
                                        setShowDrawer({ show: true, target: 'sell' })
                                    } else {
                                        handleSignIn()
                                    }
                                }}
                            >
                                Sell
                            </button>
                            <button
                                type="button"
                                className="flex  bg-table-odd border border-border hover:bg-neutral-900 rounded-lg max-w-7 max-h-7 min-w-7 min-h-7 text-base items-center justify-center text-neutral-text apply-transition "
                                onClick={e => {
                                    e.stopPropagation()
                                    setShowFullChart(!showFullChart)
                                }}
                            >
                                {showFullChart ? <MdFullscreenExit /> : <MdFullscreen />}
                            </button>
                            <button
                                type="button"
                                onClick={e => {
                                    e.stopPropagation()
                                    // setShowChart(false)
                                    setShowFullChart(false)
                                }}
                                className="flex  bg-table-odd border border-border hover:bg-neutral-900 rounded-lg max-w-7 max-h-7 min-w-7 min-h-7 text-sm items-center justify-center text-neutral-text apply-transition "
                            >
                                <FaXmark />
                            </button>
                        </div>
                        <HyperliquidChart showNewsMarks={true} token={tokenId} containerHeight="h-full" />
                    </div>
                )}

                {showDrawer.show && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[999]"
                            onClick={() => {
                                setShowDrawer({ show: false, target: 'buy' })
                            }}
                        ></div>
                        <div className="flex flex-col gap-3 w-full border-t border-border   bg-black pointer-events-auto fixed inset-x-0 z-[999] bottom-0 h-fit justify-end pb-6">
                            <div className="flex flex-col relative w-full max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between px-2 pt-2">
                                    <div>{tokenId}</div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDrawer({ show: false, target: 'buy' })
                                        }}
                                        className=" ml-auto flex  bg-table-odd hover:bg-neutral-900 border border-border rounded-lg min-w-8 min-h-8 items-center justify-center text-neutral-text apply-transition "
                                    >
                                        <FaXmark />
                                    </button>
                                </div>
                                {ready && authenticated && <HyperLiquidTradeForm initialActiveTab={showDrawer.target} />}
                            </div>
                        </div>
                    </>
                )}
            </>
        )
}

export default MobileNewsFeedChart
