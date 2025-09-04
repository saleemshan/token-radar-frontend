'use client'
import { countDecimalPlaces, getReadableNumber } from '@/utils/price'
import React, { useState } from 'react'
import { FaShare } from 'react-icons/fa6'
import PercentageChange from './PercentageChange'
import SharePositionModal from '@/components/modal/SharePositionModal'
import ImageFallback from './ImageFallback'
import { getTokenImage } from '@/utils/image'

const TokenKeyDetails = ({
    tokenData,
    latestTokenPrice,
    latestTokenMcap,
    selectedHolding,
}: {
    tokenData: Token | undefined
    latestTokenPrice?: number | undefined
    latestTokenMcap?: number | undefined
    selectedHolding?: UserTokenHolding | undefined
}) => {
    const [showSharePositionModal, setShowSharePositionModal] = useState(false)
    return (
        <>
            <div className="flex px-2 gap-3 border-b border-border mb-[1px] items-center relative min-h-16 h-16 max-w-full overflow-hidden">
                <div className="flex justify-start gap-3 py-1 flex-1 max-w-full overflow-x-auto no-scrollbar">
                    <div className="hidden md:flex flex-col justify-center items-start p-2">
                        <div className="flex items-center gap-2">
                            {tokenData ? (
                                <ImageFallback
                                    src={getTokenImage(tokenData)}
                                    alt={`${tokenData?.name} logo`}
                                    width={100}
                                    height={100}
                                    className=" min-w-7 min-h-7  max-w-7 max-h-7  object-cover object-center rounded-full"
                                />
                            ) : (
                                <div className=" min-w-7 min-h-7  max-w-7 max-h-7  object-cover object-center rounded-full animate-pulse bg- bg-border"></div>
                            )}
                            {tokenData ? (
                                <div className=" text-base font-semibold  text-neutral-text">{tokenData.symbol}</div>
                            ) : (
                                <div className="w-20 h-4 bg-border animate-pulse rounded"></div>
                            )}
                        </div>
                    </div>

                    {tokenData ? (
                        <>
                            <div className="flex flex-col justify-center items-start p-2">
                                <div className=" text-neutral-text-dark text-xs whitespace-nowrap ">Price</div>
                                <div className="flex gap-1 items-center relative">
                                    <div className=" text-sm  text-neutral-text">
                                        {latestTokenPrice
                                            ? getReadableNumber(latestTokenPrice, countDecimalPlaces(latestTokenPrice), '$')
                                            : getReadableNumber(
                                                  tokenData?.market_data?.current_price?.usd ?? 0,
                                                  countDecimalPlaces(tokenData?.market_data?.current_price?.usd ?? 0),
                                                  '$'
                                              )}
                                    </div>

                                    <div className="absolute left-full hidden">
                                        {tokenData &&
                                            tokenData.market_data &&
                                            tokenData.market_data.price_change &&
                                            tokenData.market_data.price_change.hasOwnProperty('24h') && (
                                                <PercentageChange
                                                    size="small"
                                                    padding="px-1"
                                                    width="w-fit"
                                                    percentage={tokenData?.market_data?.price_change?.['24h']?.percentage ?? 0}
                                                ></PercentageChange>
                                            )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center items-start p-2">
                                <div className=" text-neutral-text-dark text-xs whitespace-nowrap">Market Cap</div>
                                <div className=" text-sm  text-neutral-text">
                                    {latestTokenMcap
                                        ? getReadableNumber(latestTokenMcap, undefined, '$')
                                        : getReadableNumber(tokenData?.market_data?.market_cap?.usd, undefined, '$')}
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-start p-2">
                                <div className=" text-neutral-text-dark text-xs whitespace-nowrap ">24H Change</div>
                                {tokenData &&
                                    tokenData.market_data &&
                                    tokenData.market_data.price_change &&
                                    tokenData.market_data.price_change.hasOwnProperty('24h') && (
                                        <PercentageChange
                                            size="normal"
                                            padding="px-0"
                                            width="w-fit"
                                            percentage={tokenData?.market_data?.price_change['24h']?.percentage ?? 0}
                                        ></PercentageChange>
                                    )}
                            </div>
                            <div className="hidden xl:flex  flex-col justify-center items-start p-2">
                                <div className=" text-neutral-text-dark text-xs whitespace-nowrap ">24H Volume</div>
                                <div className=" text-sm  text-neutral-text">
                                    {tokenData &&
                                        tokenData.market_data &&
                                        tokenData.market_data.volume &&
                                        tokenData.market_data.volume.hasOwnProperty('24h') &&
                                        getReadableNumber(tokenData?.market_data?.volume['24h'], undefined, '$')}
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-start p-2">
                                <div className=" text-neutral-text-dark text-xs whitespace-nowrap ">Liquidity</div>
                                <div className=" text-sm  text-neutral-text">
                                    {tokenData && getReadableNumber(tokenData?.market_data.liquidity, undefined, '$')}
                                </div>
                            </div>
                            <div className="hidden xl:flex  flex-col justify-center items-start p-2">
                                <div className=" text-neutral-text-dark text-xs whitespace-nowrap ">FDV</div>
                                <div className=" text-sm  text-neutral-text">
                                    {tokenData && getReadableNumber(tokenData?.market_data.fdv, undefined, '$')}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col justify-center items-start p-2">
                                <div className=" text-neutral-text-dark text-xs whitespace-nowrap ">Price</div>
                                <div className="w-16 animate-pulse bg-border h-3 rounded-full mt-1"></div>
                            </div>

                            <div className="flex flex-col justify-center items-start p-2">
                                <div className=" text-neutral-text-dark text-xs whitespace-nowrap">Market Cap</div>
                                <div className="w-16 animate-pulse bg-border h-3 rounded-full mt-1"></div>
                            </div>
                            <div className="flex flex-col justify-center items-start p-2">
                                <div className=" text-neutral-text-dark text-xs whitespace-nowrap ">24H Change</div>
                                <div className="w-16 animate-pulse bg-border h-3 rounded-full mt-1"></div>
                            </div>
                            <div className="hidden xl:flex  flex-col justify-center items-start p-2">
                                <div className=" text-neutral-text-dark text-xs whitespace-nowrap ">24H Volume</div>
                                <div className="w-16 animate-pulse bg-border h-3 rounded-full mt-1"></div>
                            </div>
                            <div className="flex flex-col justify-center items-start p-2">
                                <div className=" text-neutral-text-dark text-xs whitespace-nowrap ">Liquidity</div>
                                <div className="w-16 animate-pulse bg-border h-3 rounded-full mt-1"></div>
                            </div>
                            <div className="hidden xl:flex  flex-col justify-center items-start p-2">
                                <div className=" text-neutral-text-dark text-xs whitespace-nowrap ">FDV</div>
                                <div className="w-16 animate-pulse bg-border h-3 rounded-full mt-1"></div>
                            </div>
                        </>
                    )}
                </div>

                {selectedHolding && (
                    <div className="min-h-full flex flex-col justify-center place-items-center">
                        <button
                            type="button"
                            onClick={() => {
                                setShowSharePositionModal(true)
                            }}
                            className="border border-border rounded-lg px-3 py-2 flex flex-col items-center gap-1 hover:bg-neutral-900  apply-transition"
                        >
                            <FaShare />
                            <div className="text-xs">Share</div>
                        </button>
                    </div>
                )}
            </div>
            {showSharePositionModal && <SharePositionModal holding={selectedHolding} handleCloseModal={() => setShowSharePositionModal(false)} />}
        </>
    )
}

export default TokenKeyDetails
