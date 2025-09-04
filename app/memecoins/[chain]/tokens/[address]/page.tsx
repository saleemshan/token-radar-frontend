'use client'
import TokenPriceChart from '@/components/graph/TokenPriceChart'
import TokenTabsPanel from '@/components/panel/TokenTabsPanel'
import TradePanel from '@/components/panel/TradePanel'
import Image from 'next/image'
import SecurityPanel from '@/components/panel/SecurityPanel'
import FavouriteTokenButton from '@/components/FavouriteTokenButton'
import TokenName from '@/components/TokenName'
import useTokenData from '@/hooks/data/useTokenData'
import { useUser } from '@/context/UserContext'
import { chains } from '@/data/default/chains'
import { useEffect, useRef, useState } from 'react'
import TokenAnalyticsPanel from '@/components/panel/TokenAnalyticsPanel'
import useTokenSecurityData from '@/hooks/data/useTokenSecurityData'
import useTokenHoldersOvertimeData from '@/hooks/data/useTokenHoldersOvertimeData'
import useUserTokenHoldingsData from '@/hooks/data/useUserTokenHoldingsData'
import SidePanel from '@/components/panel/SidePanel'
import SocialPanel from '@/components/panel/SocialPanel'
import useTokenSocialData from '@/hooks/data/useTokenSocialData'

import useIsMobile from '@/hooks/useIsMobile'
import { getTokenUrl } from '@/utils/url'
import { useRouter } from 'next/navigation'
import TokenKeyDetails from '@/components/TokenKeyDetails'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { MdDragIndicator } from 'react-icons/md'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import TradeForm from '@/components/forms/TradeForm'
import { FaChevronLeft, FaXmark } from 'react-icons/fa6'
import QueryTokenData from '@/components/QueryTokenData'
// import MemecoinStrategiesPanel from '@/components/panel/MemecoinStrategiesPanel'

const TokenPage = ({
    params,
}: {
    params: {
        address: string
        chain: string
    }
}) => {
    const router = useRouter()
    const isMobile = useIsMobile()
    const { login: handleSignIn } = useLogin()
    const { authenticated, ready } = usePrivy()
    const { setChain, userPublicWalletAddresses } = useUser()
    const middleContainer = useRef<HTMLDivElement | null>(null)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: tokenData } = useTokenData(params.chain, params.address)

    const { data: tokenSecurityData, isLoading: isTokenSecurityLoading } = useTokenSecurityData(params.chain, params.address)
    const [chainLoaded, setChainLoaded] = useState(false)
    const [latestTokenPrice, setLatestTokenPrice] = useState(0)
    const [latestTokenMcap, setLatestTokenMcap] = useState(0)
    const [showDrawer, setShowDrawer] = useState<{
        show: boolean
        target: 'buy' | 'sell'
    }>({
        show: false,
        target: 'buy',
    })

    useEffect(() => {
        if (tokenData) {
            setLatestTokenPrice(tokenData.market_data.current_price?.usd ?? 0)
            setLatestTokenMcap(tokenData.market_data.market_cap?.usd ?? 0)
        }
    }, [tokenData])

    useEffect(() => {
        setLatestTokenPrice(0)
        setLatestTokenMcap(0)
    }, [params.chain, params.address])

    //preload social data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: tokenSocialData, isLoading: isTokenSocialDataLoading } = useTokenSocialData(tokenData?.symbol ?? '')

    //preload holders overtime
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data } = useTokenHoldersOvertimeData(params.chain, params.address)

    //preload my positions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: userSolanaTokenHoldings } = useUserTokenHoldingsData('solana', userPublicWalletAddresses['solana'])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: userEthereumTokenHoldings } = useUserTokenHoldingsData('ethereum', userPublicWalletAddresses['ethereum'])

    const [selectedHolding, setSelectedHolding] = useState<UserTokenHolding | undefined>(undefined)

    const handleReturnClick = () => {
        if (window.history.length > 1) {
            router.back()
        } else {
            router.replace('/')
        }
    }

    useEffect(() => {
        if (userSolanaTokenHoldings && userEthereumTokenHoldings) {
            const tempHoldings = [...userSolanaTokenHoldings, ...userEthereumTokenHoldings]

            const holding = tempHoldings.find(holding => holding?.token?.address === params.address)
            if (holding) {
                setSelectedHolding(holding)
            }
        }
    }, [userSolanaTokenHoldings, userEthereumTokenHoldings, params.address])

    useEffect(() => {
        if (chainLoaded) return
        setChainLoaded(true)

        if (params.chain) {
            const newChain = chains.find(chain => chain.id === params.chain)
            if (newChain) setChain(newChain)
        }
    }, [params.chain, setChain, chainLoaded, setChainLoaded])

    useEffect(() => {
        const handleScroll = (event: WheelEvent) => {
            if (event.currentTarget !== event.target) return
            if (middleContainer.current) {
                const newScrollY = Math.min(
                    Math.max(middleContainer.current.scrollTop + event.deltaY, 0),
                    middleContainer.current.scrollHeight - middleContainer.current.clientHeight
                )

                middleContainer.current.scrollTop = newScrollY
            }
        }

        const mainWrapper = document.getElementById('main-wrapper')

        if (mainWrapper && middleContainer.current) {
            mainWrapper.addEventListener('wheel', handleScroll)
        }

        return () => {
            if (mainWrapper) mainWrapper.removeEventListener('wheel', handleScroll)
        }
    }, [chainLoaded])

    useEffect(() => {
        //check isMobile, if mobile redirect user to mobile version, get [chain] and [address] from url
        if (isMobile) {
            router.push(getTokenUrl(params.chain, params.address))
        }

        // Define the event handler
        const handleCustomEvent = (event: CustomEvent<TradingViewDataFeedEvent>) => {
            if (event.detail.chain === params.chain && event.detail.tokenAddress === params.address) {
                setLatestTokenPrice(Number(event.detail.price))
                setLatestTokenMcap(Number(event.detail.mcap))
            }
        }

        // Add the event listener
        document.addEventListener('newTradingViewPriceEvent', handleCustomEvent as EventListener)

        // Return a cleanup function to remove the event listener
        return () => {
            document.removeEventListener('newTradingViewPriceEvent', handleCustomEvent as EventListener)
        }
    }, [])

    if (chainLoaded)
        return (
            <>
                <div className="flex-1 min-h-full max-w-full overflow-hidden pb-20 md:pb-0">
                    <PanelGroup autoSaveId="tokenPage" direction="horizontal" className="min-w-full min-h-full max-w-full overflow-hidden">
                        <Panel
                            id="parentLeft"
                            className="relative z-10 hidden lg:flex h-full overflow-hidden  w-full"
                            style={{
                                minWidth: '320px',
                                // maxWidth: '300px',
                            }}
                            defaultSize={20}
                        >
                            <SidePanel />
                        </Panel>
                        <PanelResizeHandle className="hidden lg:block relative z-[50] hover:z-[999999] hover:w-[10px] hover:bg-neutral-900 transition-all duration-200 group">
                            <MdDragIndicator className="absolute  translate-x-1/2 right-1/2 bottom-1/2 translate-y-1/2 group-hover:text-neutral-text text-neutral-text-dark" />
                        </PanelResizeHandle>
                        <Panel
                            id="parentRight"
                            className="flex flex-col gap-3 overflow-hidden flex-1 max-h-full w-full relative"
                            minSize={40}
                            defaultSize={80}
                        >
                            <div
                                ref={middleContainer}
                                className="max-h-full overflow-y-auto w-full flex-1 flex-col gap-3 no-scrollbar  relative  md:mb-0 bg-black"
                            >
                                {tokenData && isMobile && (
                                    <div className="flex flex-col border-b p-3 gap-3 border-border">
                                        <div className="flex items-center gap-2 justify-between w-full">
                                            {isMobile && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleReturnClick()
                                                    }}
                                                    className={`flex md:hidden bg-table-odd border border-border rounded-lg px-2 gap-2 w-7 min-w-7 h-7  min-h-7 items-center justify-center hover:bg-neutral-900  apply-transition hover:text-neutral-text text-neutral-text `}
                                                >
                                                    <FaChevronLeft className="block " />
                                                </button>
                                            )}
                                            <FavouriteTokenButton tokenData={tokenData} className={isMobile ? 'order-2' : 'order-1'} />
                                            <TokenName token={tokenData} size="normal" className={isMobile ? 'order-1' : 'order-2'} />
                                        </div>

                                        <div className="">
                                            <QueryTokenData tokenData={tokenData} />
                                        </div>
                                    </div>
                                )}

                                <TokenKeyDetails
                                    tokenData={tokenData}
                                    latestTokenPrice={latestTokenPrice}
                                    latestTokenMcap={latestTokenMcap}
                                    selectedHolding={selectedHolding}
                                />

                                <div className="md:min-h-[65vh] md:h-[65vh] min-h-[45vh] max-h-[45vh]  border-b border-border flex flex-col w-full relative items-center justify-center">
                                    <TokenPriceChart
                                        chain={params.chain}
                                        tokenAddress={params.address}
                                        walletAddress={userPublicWalletAddresses[params.chain as keyof UserPublicWalletAddresses]}
                                        isMobile={isMobile}
                                    />
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

                                <TokenTabsPanel chain={params.chain} tokenData={tokenData} tokenAddress={params.address} isMobile={isMobile} />
                            </div>
                        </Panel>
                    </PanelGroup>
                </div>

                <div className="hidden md:flex flex-col gap-3 overflow-hidden w-auto min-w-fit pointer-events-none border-l border-border">
                    <div className=" min-w-[20rem] max-w-[20rem] lg:min-w-[22rem] lg:max-w-[22rem] overflow-y-auto h-full flex flex-col  pointer-events-auto no-scrollbar">
                        <TradePanel tokenData={tokenData} latestTokenPrice={latestTokenPrice} />
                        <TokenAnalyticsPanel tokenData={tokenData} address={params.address} chain={params.chain} />
                        <SecurityPanel data={tokenSecurityData} isLoading={isTokenSecurityLoading} />
                        <SocialPanel tokenData={tokenData} />
                        {/* <MemecoinStrategiesPanel /> */}
                    </div>
                </div>

                {isMobile && (
                    <>
                        <div className=" inset-x-0 h-20 min-h-20 pb-6 fixed md:relative bottom-0 flex gap-3 p-3 border-t border-border bg-table-even z-[50]">
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
                                <div className="flex flex-col  w-full border-t border-border bg-black pointer-events-auto fixed inset-x-0 z-[100]  bottom-0 h-fit justify-end pb-6">
                                    <div className="flex flex-col relative w-full max-h-[90vh] overflow-y-auto">
                                        <div className="flex items-center justify-between  bg-black p-3">
                                            {/* <div className=" text-base font-semibold leading-6 text-white flex-1 ">Trade</div> */}

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowDrawer({ show: false, target: 'buy' })
                                                }}
                                                className=" ml-auto flex bg-neutral-900 rounded-lg w-8 h-8 items-center justify-center text-neutral-text-dark hover:text-neutral-text apply-transition hover:bg-neutral-800"
                                            >
                                                <FaXmark />
                                            </button>
                                        </div>
                                        {ready && authenticated && tokenData && (
                                            <div className="w-full min-h-fit overflow-y-auto flex-1 flex flex-col ">
                                                <TradeForm
                                                    tokenData={tokenData as Token}
                                                    initialActiveTab={showDrawer.target}
                                                    latestTokenPrice={latestTokenPrice}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* {showShareModal && (
          <ShareTokenModal
            tokenData={tokenData}
            tokenSecurityData={tokenSecurityData}
            latestTokenMcap={latestTokenMcap}
            latestTokenPrice={latestTokenPrice}
            handleCloseModal={() => setShowShareModal(false)}
          />
        )} */}
            </>
        )
}

export default TokenPage
