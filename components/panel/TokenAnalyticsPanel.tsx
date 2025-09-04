import React, { useEffect, useMemo, useState } from 'react'
import PercentageChange from '../PercentageChange'
import useTokenLiquidityData from '@/hooks/data/useTokenLiquidityData'
import { getReadableNumber } from '@/utils/price'
import { getTimeComparison } from '@/utils/time'
import { extractTokenAnalytics, WebSocketManager } from '@/utils/tokenWSS'
import { formatNumberWithCommas } from '@/utils/string'
import { getTopHoldersColor } from '@/utils/textColor'
import useTokenDetailedStats from '@/hooks/data/useTokenDetailedStats'

const TokenAnalyticsPanel = ({ tokenData, address, chain }: { tokenData: Token | undefined; address: string; chain: string }) => {
    // const timeFrames = ['5m', '1h', '6h', '24h'];
    const timeFrames = ['1h', '4h', '12h', '24h']
    const [activeTimeFrame, setActiveTimeFrame] = useState(timeFrames[0])

    const { data: tokenLiquidityData } = useTokenLiquidityData(chain, address)

    const { data: tokenAnalyticsApiData } = useTokenDetailedStats(chain, tokenData?.pair_address, tokenData?.quote_token ?? 'token0')

    const getBarPercentage = (target: number, total: number) => {
        if (total === 0) {
            return 50
        }

        const percentage = (target / total) * 100

        return percentage
    }

    const [tokenAnalyticsWebSocketData, setTokenAnalyticsWebSocketData] = useState<TokenAnalyticsEvent | undefined>(undefined)

    const tokenAnalytics = useMemo(() => {
        const output = tokenAnalyticsApiData
            ? {
                  '5m': extractTokenAnalytics(tokenAnalyticsApiData?.stats_min5 || {}),
                  '1h': extractTokenAnalytics(tokenAnalyticsApiData?.stats_hour1 || {}),
                  '4h': extractTokenAnalytics(tokenAnalyticsApiData?.stats_hour4 || {}),
                  '12h': extractTokenAnalytics(tokenAnalyticsApiData?.stats_hour12 || {}),
                  '24h': extractTokenAnalytics(tokenAnalyticsApiData?.stats_day1 || {}),
              }
            : null

        return (tokenAnalyticsWebSocketData ?? output) as TokenAnalyticsEvent
    }, [tokenAnalyticsWebSocketData, tokenAnalyticsApiData])

    // useEffect(() => {
    //   console.log({ tokenData });
    // }, [tokenData]);

    useEffect(() => {
        if (!tokenData) return
        const wsManager = new WebSocketManager(tokenData.pair_address, chain)

        const connectWebSocket = async () => {
            await wsManager.connect()
            //when connected to websocket, subscribe to detailed stats
            wsManager.subscribeDetailedStats()
        }

        connectWebSocket()

        const handleCustomEvent = (event: CustomEvent<{ analytics: TokenAnalyticsEvent; pair: string; chain: string }>) => {
            if (event && event.detail) {
                if (event.detail.chain === chain && event.detail.pair === tokenData?.pair_address) {
                    setTokenAnalyticsWebSocketData(event.detail.analytics)
                }
            }
        }

        // Add the event listener
        document.addEventListener('newTokenAnalyticsEvent', handleCustomEvent as EventListener)

        return () => {
            wsManager.disconnect()
            document.removeEventListener('newTokenAnalyticsEvent', handleCustomEvent as EventListener)
        }
    }, [chain, tokenData])

    return (
        <div className="  border-b border-border bg-black  min-h-fit">
            <div className="flex flex-col p-3 w-full gap-2">
                <div className="flex">
                    <div className="min-w-20 flex flex-col">
                        <div className="text-neutral-text text-xs">Top 10 Holders</div>
                    </div>
                    <div
                        className={`flex-1 flex justify-end text-xs ${getTopHoldersColor(
                            tokenData && tokenData?.top_10_holder_rate ? tokenData?.top_10_holder_rate * 100 : undefined
                        )}`}
                    >
                        {tokenData?.top_10_holder_rate ? `${(tokenData?.top_10_holder_rate * 100).toFixed(2)}%` : '0.0%'}
                    </div>
                </div>
                <div className="flex">
                    <div className="min-w-20 flex flex-col">
                        <div className="text-neutral-text text-xs">Holders</div>
                    </div>
                    <div className={`flex-1 flex justify-end text-xs`}>{formatNumberWithCommas(tokenData?.holder_count ?? '-')}</div>
                </div>
                <div className="flex">
                    <div className="min-w-20 flex flex-col">
                        <div className="text-neutral-text text-xs">Token Age</div>
                    </div>
                    <div className={`flex-1 flex justify-end text-xs`}>{tokenData?.created_at ? getTimeComparison(tokenData?.created_at) : '-'}</div>
                </div>

                <div className="flex flex-col  w-full border rounded-lg border-border divide-y divide-border">
                    <div className="grid grid-cols-4 p-2 ">
                        {timeFrames.map(timeFrame => {
                            return (
                                <button
                                    key={timeFrame}
                                    onClick={() => {
                                        setActiveTimeFrame(timeFrame)
                                    }}
                                    type="button"
                                    className={`flex flex-col items-center justify-center border p-1 rounded-lg ${
                                        activeTimeFrame === timeFrame
                                            ? 'bg-neutral-900/80 text-neutral-text border-border'
                                            : 'bg-black border-transparent text-neutral-text-dark hover:bg-neutral-900'
                                    }`}
                                >
                                    <div className="text-[12px]">{timeFrame}</div>
                                    <div className="text-xs">
                                        {tokenData &&
                                            tokenData.market_data &&
                                            tokenData.market_data.price_change &&
                                            tokenData.market_data.price_change.hasOwnProperty(timeFrame) && (
                                                <PercentageChange
                                                    size="small"
                                                    padding=""
                                                    percentage={
                                                        tokenData?.market_data.price_change[
                                                            timeFrame as keyof typeof tokenData.market_data.price_change
                                                        ]
                                                            ? tokenData?.market_data.price_change[
                                                                  timeFrame as keyof typeof tokenData.market_data.price_change
                                                              ].percentage
                                                            : 0
                                                    }
                                                ></PercentageChange>
                                            )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex w-full px-2 py-1 ">
                        <div className="flex flex-col text-[12px] min-w-[90px] max-w-[90px] items-start">
                            <div className="min-w-20 flex flex-col">
                                <div className="text-neutral-text text-xs pt-1">Txns</div>
                            </div>
                            {tokenAnalytics ? (
                                <div className="flex-1 flex justify-end">
                                    {tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.totalTransactions}
                                </div>
                            ) : (
                                <div className="flex-1 flex justify-end"></div>
                            )}
                        </div>

                        <div className="flex flex-col w-full">
                            <div className="flex-1 flex justify-between items-center h-full">
                                {tokenAnalytics && (
                                    <div className="flex flex-col w-full">
                                        <div className="flex-1 flex ">
                                            <div
                                                className="flex flex-col "
                                                style={{
                                                    width: `${getBarPercentage(
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.buyTransactions,
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.totalTransactions
                                                    )}%`,
                                                }}
                                            >
                                                <span className="text-neutral-text-dark text-[12px] mb-1">Buy</span>
                                                <div className="h-1 w-full bg-positive/80 mb-1 rounded-l-full"></div>
                                            </div>
                                            <div
                                                className="flex flex-col items-end text-right "
                                                style={{
                                                    width: `${getBarPercentage(
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.sellTransactions,
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.totalTransactions
                                                    )}%`,
                                                }}
                                            >
                                                <span className="text-neutral-text-dark text-[12px] mb-1">Sell</span>

                                                <div className="h-1 w-full bg-negative/80 mb-1 rounded-r-full"></div>
                                            </div>
                                        </div>

                                        <div className="flex w-full items-center justify-between">
                                            <div className="text-[12px] text-neutral-text">
                                                {tokenAnalytics && tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.buyTransactions}
                                            </div>
                                            <div className="text-[12px] text-neutral-text">
                                                {tokenAnalytics && tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.sellTransactions}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full px-2 py-1 ">
                        <div className="flex flex-col text-[12px] min-w-[90px] max-w-[90px] items-start">
                            <div className="min-w-20 flex flex-col">
                                <div className="text-neutral-text text-xs pt-1">Volume</div>
                            </div>
                            {tokenAnalytics ? (
                                <div className="flex-1 flex justify-end">
                                    {getReadableNumber(tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.totalVolume, 2, '$')}
                                </div>
                            ) : (
                                <div className="flex-1 flex justify-end"></div>
                            )}
                        </div>

                        <div className="flex flex-col w-full">
                            <div className="flex-1 flex justify-between items-center h-full">
                                {tokenAnalytics && (
                                    <div className="flex flex-col w-full">
                                        <div className="flex-1 flex ">
                                            <div
                                                className="flex flex-col "
                                                style={{
                                                    width: `${getBarPercentage(
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.buyVolume,
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.totalVolume
                                                    )}%`,
                                                }}
                                            >
                                                <span className="text-neutral-text-dark text-[12px] mb-1">Buy</span>
                                                <div className="h-1 w-full bg-positive/80 mb-1 rounded-l-full"></div>
                                            </div>
                                            <div
                                                className="flex flex-col items-end text-right "
                                                style={{
                                                    width: `${getBarPercentage(
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.sellVolume,
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.totalVolume
                                                    )}%`,
                                                }}
                                            >
                                                <span className="text-neutral-text-dark text-[12px] mb-1">Sell</span>

                                                <div className="h-1 w-full bg-negative/80 mb-1 rounded-r-full"></div>
                                            </div>
                                        </div>

                                        <div className="flex w-full items-center justify-between">
                                            <div className="text-[12px] text-neutral-text">
                                                {tokenAnalytics &&
                                                    getReadableNumber(
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.buyVolume,
                                                        2,
                                                        '$'
                                                    )}
                                            </div>
                                            <div className="text-[12px] text-neutral-text">
                                                {tokenAnalytics &&
                                                    getReadableNumber(
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.sellVolume,
                                                        2,
                                                        '$'
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full px-2 py-1 ">
                        <div className="flex flex-col text-[12px] min-w-[90px] max-w-[90px] items-start">
                            <div className="min-w-20 flex flex-col">
                                <div className="text-neutral-text text-xs  pt-1">Makers</div>
                            </div>
                            {tokenAnalytics ? (
                                <div className="flex-1 flex justify-end">
                                    {tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.totalParticipants}
                                </div>
                            ) : (
                                <div className="flex-1 flex justify-end"></div>
                            )}
                        </div>

                        <div className="flex flex-col w-full">
                            <div className="flex-1 flex justify-between items-center h-full">
                                {tokenAnalytics && (
                                    <div className="flex flex-col w-full">
                                        <div className="flex-1 flex ">
                                            <div
                                                className="flex flex-col "
                                                style={{
                                                    width: `${getBarPercentage(
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.buyers,
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.totalParticipants
                                                    )}%`,
                                                }}
                                            >
                                                <span className="text-neutral-text-dark text-[12px] mb-1">Buyers</span>
                                                <div className="h-1 w-full bg-positive/80 mb-1 rounded-l-full"></div>
                                            </div>
                                            <div
                                                className="flex flex-col items-end text-right "
                                                style={{
                                                    width: `${getBarPercentage(
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.sellers,
                                                        tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.totalParticipants
                                                    )}%`,
                                                }}
                                            >
                                                <span className="text-neutral-text-dark text-[12px] mb-1">Sellers</span>

                                                <div className="h-1 w-full bg-negative/80 mb-1 rounded-r-full"></div>
                                            </div>
                                        </div>

                                        <div className="flex w-full items-center justify-between">
                                            <div className="text-[12px] text-neutral-text">
                                                {tokenAnalytics && tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.buyers}
                                            </div>
                                            <div className="text-[12px] text-neutral-text">
                                                {tokenAnalytics && tokenAnalytics[activeTimeFrame as keyof typeof tokenAnalytics]?.sellers}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="text-xs text-neutral-text-dark col-span-1 flex justify-start items-center">Pair</div>
                        {/* <div className="text-xs text-neutral-text-dark col-span-2 text-center flex items-center justify-center">
              Liq/Initial
            </div> */}
                        <div className="text-xs text-neutral-text-dark col-span-1 flex items-center justify-end">Value</div>
                        {/* Base Liquidity  */}
                        <div className="text-xs col-span-1 flex justify-start items-center">{tokenData?.symbol ?? '-'}</div>
                        {/* <div className="text-xs col-span-2 text-center flex items-center justify-center">
              {tokenLiquidityData?.base_reserve
                ? getReadableNumber(+tokenLiquidityData?.base_reserve, 2)
                : '-'}
              /
              {tokenLiquidityData?.initial_base_reserve
                ? getReadableNumber(
                    +tokenLiquidityData?.initial_base_reserve,
                    2,
                  )
                : '-'}
            </div> */}
                        <div className="text-xs col-span-1 flex items-center justify-end">
                            {tokenLiquidityData?.base_reserve_usd ? getReadableNumber(+tokenLiquidityData?.base_reserve_usd, 2, '$') : '-'}
                        </div>
                        {/* Quote Liquidity */}
                        <div className="text-xs col-span-1 flex justify-start items-center">{tokenLiquidityData?.quote_symbol ?? '-'}</div>
                        {/* <div className="text-xs col-span-2 text-center flex items-center justify-center">
              <span>
                {tokenLiquidityData?.quote_reserve
                  ? getReadableNumber(+tokenLiquidityData?.quote_reserve, 2)
                  : '-'}
                /
                {tokenLiquidityData?.initial_quote_reserve
                  ? getReadableNumber(
                      +tokenLiquidityData?.initial_quote_reserve,
                      2,
                    )
                  : '-'}
              </span>
              <PercentageChange
                percentage={tokenLiquidityData?.quote_percentage_change ?? 0}
                size="extrasmall"
                width="w-fit"
                padding="px-1"
              ></PercentageChange>
            </div> */}
                        <div className="text-xs col-span-1 flex items-center justify-end">
                            {tokenLiquidityData?.quote_reserve_usd ? getReadableNumber(+tokenLiquidityData?.quote_reserve_usd, 2, '$') : '-'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TokenAnalyticsPanel
