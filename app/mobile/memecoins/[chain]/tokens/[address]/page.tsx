'use client'
import FavouriteTokenButton from '@/components/FavouriteTokenButton'
import TradeForm from '@/components/forms/TradeForm'
import TokenName from '@/components/TokenName'
import TokenPriceChart from '@/components/graph/TokenPriceChart'
import TokenTabsPanel from '@/components/panel/TokenTabsPanel'
import { useUser } from '@/context/UserContext'
import { chains } from '@/data/default/chains'
import useTokenData from '@/hooks/data/useTokenData'
import useTokenHoldersOvertimeData from '@/hooks/data/useTokenHoldersOvertimeData'
import usePreventZoomOnMobile from '@/hooks/usePreventMobileZoom'
import { countDecimalPlaces, getReadableNumber } from '@/utils/price'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { FaChevronLeft, FaXmark } from 'react-icons/fa6'
import useUserTokenHoldingsData from '@/hooks/data/useUserTokenHoldingsData'
import useTokenSocialData from '@/hooks/data/useTokenSocialData'
import QueryTokenData from '@/components/QueryTokenData'

import { useRouter } from 'next/navigation'

const TradePage = ({
    params,
}: {
    params: {
        address: string
        chain: string
    }
}) => {
    usePreventZoomOnMobile()
    const { authenticated, ready } = usePrivy()
    const { login: handleSignIn } = useLogin()
    const { userPublicWalletAddresses } = useUser()
    const router = useRouter()
    const { setChain } = useUser()

    const { data: tokenData, isLoading } = useTokenData(params.chain, params.address)
    const [latestTokenMcap, setLatestTokenMcap] = useState(0)
    const [latestTokenPrice, setLatestTokenPrice] = useState(0)
    const [chainLoaded, setChainLoaded] = useState(false)
    const [showDrawer, setShowDrawer] = useState<{
        show: boolean
        target: 'buy' | 'sell'
    }>({
        show: false,
        target: 'buy',
    })

    // useEffect(() => {
    //     if (params.chain && params.address && !isMobile) {
    //         redirect(`/memecoins/${params.chain}/tokens/${params.address}`)
    //     }
    // }, [isMobile, params.chain, params.address])

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

    const handleReturnClick = () => {
        if (window.history.length > 1) {
            router.back()
        } else {
            router.replace('/')
        }
    }

    const handleOpenSearch = () => {
        router.push(`/mobile/search`)
    }

    useEffect(() => {
        if (chainLoaded) return
        setChainLoaded(true)

        if (params.chain) {
            const newChain = chains.find(chain => chain.id === params.chain)
            if (newChain) setChain(newChain)
        }
    }, [params.chain, setChain, chainLoaded, setChainLoaded])

    useEffect(() => {
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

    if (chainLoaded)
        return (
            <>
                <div className="  max-h-full overflow-y-auto w-full flex-1 flex-col gap-3 no-scrollbar  relative  md:mb-0 pb-20 md:pb-0">
                    {/* {tokenData?.image?.banner && (
            <div className="px-3 pt-3">
              <div className="w-full h-24 min-h-24 relative overflow-hidden border rounded-lg border-border ">
                <Image
                  src={tokenData.image.banner}
                  alt={tokenData.name}
                  fill
                  className="object-cover w-full h-full select-none"
                />
              </div>
            </div>
          )} */}

                    <div className="flex flex-col p-3 gap-3 sticky top-0 z-[50] bg-black w-full border-b border-border ">
                        {/* <MobileTopNavbar /> */}
                        <div className=" flex gap-3  items-center">
                            <button
                                type="button"
                                onClick={() => {
                                    handleReturnClick()
                                }}
                                className={`flex md:hidden bg-table-odd border border-border rounded-lg px-2 gap-2 w-7 min-w-7 h-7  min-h-7 items-center justify-center hover:bg-neutral-900  apply-transition hover:text-neutral-text text-neutral-text `}
                            >
                                <FaChevronLeft className="block " />
                            </button>

                            <div
                                onClick={() => {
                                    handleOpenSearch()
                                }}
                                className=" flex-1 w-full"
                            >
                                <TokenName token={tokenData} size="small" showSocials={true} />
                            </div>

                            <FavouriteTokenButton tokenData={tokenData} />
                        </div>
                    </div>

                    {tokenData && (
                        <div className="p-3 border-b border-border">
                            <QueryTokenData tokenData={tokenData} />
                        </div>
                    )}

                    <div className="flex min-h-fit  items-center gap-3 border-b border-border p-3 justify-around relative bg-black">
                        {isLoading && (
                            <>
                                <div className="w-full animate-pulse bg-border h-4 rounded-full"></div>
                                <div className="w-full animate-pulse bg-border h-4 rounded-full"></div>
                                <div className="w-full animate-pulse bg-border h-4 rounded-full"></div>
                            </>
                        )}
                        {!isLoading && tokenData && (
                            <>
                                <div className="flex flex-col justify-center text-xs w-full items-center">
                                    {latestTokenPrice
                                        ? getReadableNumber(latestTokenPrice, countDecimalPlaces(latestTokenPrice, 2, 4), '$')
                                        : getReadableNumber(tokenData?.market_data?.current_price?.usd ?? 0, 2, '$')}

                                    <div className="text-center text-neutral-text-dark text-2xs -mt-[2px] ">Price</div>
                                </div>
                                <div className="flex flex-col justify-center text-xs w-full items-center">
                                    {latestTokenMcap
                                        ? getReadableNumber(latestTokenMcap, 2, '$')
                                        : getReadableNumber(tokenData?.market_data?.market_cap?.usd ?? 0, 2, '$')}

                                    <div className="text-center text-neutral-text-dark text-2xs -mt-[2px] ">MCAP</div>
                                </div>
                                <div className="flex flex-col justify-center text-xs w-full items-center">
                                    <div
                                        className={`text-center ${
                                            tokenData &&
                                            tokenData.market_data &&
                                            tokenData.market_data.price_change &&
                                            tokenData.market_data.price_change.hasOwnProperty('24h') &&
                                            tokenData?.market_data?.price_change['24h']?.percentage > 0
                                                ? 'text-positive'
                                                : 'text-negative'
                                        }`}
                                    >
                                        {tokenData &&
                                            tokenData.market_data &&
                                            tokenData.market_data.price_change &&
                                            tokenData.market_data.price_change.hasOwnProperty('24h') &&
                                            (tokenData?.market_data?.price_change['24h']?.percentage * 100).toFixed(2)}
                                        %
                                    </div>
                                    <div className="text-center text-neutral-text-dark text-2xs -mt-[2px] ">24H CHG</div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className=" min-h-[45vh] max-h-[45vh]  border-b border-border flex flex-col w-full relative items-center justify-center">
                        <TokenPriceChart
                            chain={params.chain}
                            tokenAddress={params.address}
                            walletAddress={userPublicWalletAddresses[params.chain as keyof UserPublicWalletAddresses]}
                            isMobile={true}
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

                    <TokenTabsPanel chain={params.chain} tokenData={tokenData} tokenAddress={params.address} isMobile={true} />

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
                </div>
            </>
        )
}

export default TradePage
