'use client'
import React, { memo, useMemo, useState } from 'react'
import { usePairTokensContext } from '@/context/pairTokensContext'
import Image from 'next/image'
import PercentageChange from '@/components/PercentageChange'
import { getReadableNumber, calculate24HourChange, formatCryptoPrice } from '@/utils/price'
import TokenPairsInfoTable from './SelectTokenPairTable'
import { HiChevronDown } from 'react-icons/hi2'
import { findCoinFromMarketDataByCoinId } from '@/utils/tokenSymbol'
import { useWebDataContext } from '@/context/webDataContext'
import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'

const TokenKeyDetails = ({
    token,
    showSelectTokenPairs = false,
    isNewsTradingPage = false,
}: {
    token?: string
    showSelectTokenPairs?: boolean
    isNewsTradingPage?: boolean
}) => {
    const { activeSpotAssetCtx, activePrepAssetCtx, isSpotToken, loadingActiveAsset } = usePairTokensContext()
    const { marketData, loadingMarketData } = useWebDataContext()

    const [showTokenPairsInfoTable, setShowTokenPairsInfoTable] = useState(false)

    const activeSpotAsset = useMemo(() => {
        return findCoinFromMarketDataByCoinId(marketData, activeSpotAssetCtx?.coin ?? '')
    }, [marketData, activeSpotAssetCtx?.coin])

    return (
        <div
            className={`flex pl-0 md:pl-2 items-center  border-b border-border h-16 min-h-16 relative w-full ${
                token || showSelectTokenPairs ? 'grid-cols-4 xl:grid-cols-6' : 'grid-cols-3 xl:grid-cols-5'
            }`}
        >
            {loadingActiveAsset ? (
                <>
                    <div className="flex gap-2 items-center p-2">
                        <div className=" min-w-7 min-h-7  max-w-7 max-h-7  object-cover object-center rounded-full animate-pulse bg- bg-border"></div>
                        <div className="w-20 h-4 bg-border animate-pulse rounded"></div>
                    </div>
                    <div className="flex flex-col justify-center items-start p-2">
                        <div className="text-neutral-text-dark text-xs whitespace-nowrap">Price</div>
                        <div className="w-16 animate-pulse bg-border h-3 rounded-full mt-1"></div>
                    </div>
                    <div className="flex flex-col justify-center items-start p-2">
                        <div className="text-neutral-text-dark text-xs whitespace-nowrap">Market Cap</div>
                        <div className="w-20 animate-pulse bg-border h-3 rounded-full mt-1"></div>
                    </div>
                    <div className="hidden xl:flex flex-col justify-center items-start p-2">
                        <div className="text-neutral-text-dark text-xs whitespace-nowrap">24H Change</div>
                        <div className="w-16 animate-pulse bg-border h-3 rounded-full mt-1"></div>
                    </div>
                    <div className="flex flex-col justify-center items-start p-2">
                        <div className="text-neutral-text-dark text-xs whitespace-nowrap">24H Volume</div>
                        <div className="w-20 animate-pulse bg-border h-3 rounded-full mt-1"></div>
                    </div>
                    <div className="hidden xl:flex flex-col justify-center items-start p-2">
                        <div className="text-neutral-text-dark text-xs whitespace-nowrap w-full text-left">Open Interest</div>
                        <div className="w-20 animate-pulse bg-border h-3 rounded-full mt-1"></div>
                    </div>
                </>
            ) : (
                <>
                    {showSelectTokenPairs && (
                        <div className="flex items-center justify-center relative w-fit">
                            <button
                                data-token-pairs-toggle
                                onClick={e => {
                                    e.stopPropagation()
                                    setShowTokenPairsInfoTable(!showTokenPairsInfoTable)
                                }}
                                className="flex items-center gap-2 bg-background-light hover:bg-background-lighter rounded-lg px-3 py-2 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="leading-4 font-semibold text-white text-ellipsis text-nowrap overflow-hidden max-w-32 text-base">
                                        {loadingMarketData || loadingActiveAsset ? (
                                            <div className="w-20 h-4 bg-border animate-pulse rounded"></div>
                                        ) : !isSpotToken ? (
                                            <div className="flex items-center gap-2">
                                                <TokenImage
                                                    imageUrl={`https://app.hyperliquid.xyz/coins/${activePrepAssetCtx?.coin}.svg`}
                                                    symbol={activePrepAssetCtx?.coin ?? ''}
                                                />
                                                {activePrepAssetCtx?.coin}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <TokenImage
                                                    imageUrl={`https://app.hyperliquid.xyz/coins/${activeSpotAsset?.base}_USDC.svg`}
                                                    symbol={activeSpotAsset?.symbol ?? ''}
                                                />

                                                {activeSpotAsset?.symbol}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <HiChevronDown
                                    className={`text-neutral-text-dark w-4 h-4 transition-transform duration-200 ease-in-out ${
                                        showTokenPairsInfoTable ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                        </div>
                    )}

                    {showSelectTokenPairs && (
                        <TokenPairsInfoTable
                            tableIsOpen={showTokenPairsInfoTable}
                            handleClose={() => setShowTokenPairsInfoTable(false)}
                            isNewsTradingPage={isNewsTradingPage}
                        />
                    )}
                    {token && (
                        <div className="flex flex-col justify-center items-start p-2">
                            <div className="text-neutral-text-dark text-xs">Token</div>
                            <div className="flex gap-1 items-center relative">
                                <div className=" text-sm  text-neutral-text">{token ?? '-'}</div>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-row overflow-x-auto w-full pr-8 md:pr-3 max-w-full no-scrollbar ">
                        <div className="flex flex-col justify-center items-start p-2">
                            <div className="text-neutral-text-dark text-xs">Price</div>
                            <div className="flex gap-1 items-center relative">
                                <div className=" text-sm  text-neutral-text">
                                    $
                                    {isSpotToken
                                        ? formatCryptoPrice(Number(activeSpotAssetCtx?.markPx ?? 0))
                                        : formatCryptoPrice(Number(activePrepAssetCtx?.markPx ?? 0))}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-start p-2">
                            <div className=" text-neutral-text-dark text-xs whitespace-nowrap ">{isSpotToken ? 'Market Cap' : 'Oracle Price'}</div>
                            <div className=" text-sm text-neutral-text">
                                $
                                {isSpotToken
                                    ? getReadableNumber(
                                          Number(activeSpotAssetCtx?.circulatingSupply || 0) * Number(activeSpotAssetCtx?.markPx || 0),
                                          undefined
                                      )
                                    : formatCryptoPrice(Number(activePrepAssetCtx?.oraclePx || 0))}
                            </div>
                        </div>
                        <div className="hidden xl:flex justify-center items-start p-2">
                            <div className=" text-neutral-text-dark text-xs text-left whitespace-nowrap">
                                24H Change
                                <PercentageChange
                                    size="normal"
                                    padding="p-0"
                                    width="w-fit"
                                    center={false}
                                    percentage={
                                        isSpotToken
                                            ? (calculate24HourChange({
                                                  markPx: activeSpotAssetCtx?.markPx ?? '',
                                                  prevDayPx: activeSpotAssetCtx?.prevDayPx ?? '',
                                              }) ?? 0) / 100
                                            : (calculate24HourChange({
                                                  markPx: activePrepAssetCtx?.markPx ?? '',
                                                  prevDayPx: activePrepAssetCtx?.prevDayPx ?? '',
                                              }) ?? 0) / 100
                                    }
                                ></PercentageChange>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-start p-2">
                            <div className=" text-neutral-text-dark text-xs whitespace-nowrap ">24H Volume</div>
                            <div className=" text-sm  text-neutral-text">
                                {getReadableNumber(
                                    isSpotToken ? parseFloat(activeSpotAssetCtx?.dayNtlVlm ?? '0') : parseFloat(activePrepAssetCtx?.dayNtlVlm ?? '0'),
                                    undefined,
                                    '$'
                                )}
                            </div>
                        </div>

                        <div className="hidden xl:flex flex-col justify-center items-start p-2">
                            <div className=" text-neutral-text-dark text-xs whitespace-nowrap w-full text-left">
                                {isSpotToken ? 'FDV' : 'Open Interest'}
                            </div>
                            <div className=" text-sm  text-neutral-text">
                                {getReadableNumber(
                                    isSpotToken
                                        ? Number(activeSpotAssetCtx?.circulatingSupply || 0) * Number(activeSpotAssetCtx?.markPx || 0)
                                        : Number(activePrepAssetCtx?.openInterest || 0) * Number(activePrepAssetCtx?.markPx || 0),
                                    undefined,
                                    '$'
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

const TokenImage = memo(({ imageUrl, symbol }: { imageUrl: string; symbol: string }) => {
    const [imageError, setImageError] = useState(false)

    return (
        <Image
            priority
            src={imageError ? TOKEN_PLACEHOLDER_IMAGE : imageUrl}
            alt={symbol}
            width={16}
            height={16}
            suppressHydrationWarning
            unoptimized
            style={{
                backgroundColor: 'white',
            }}
            className="rounded-full min-w-7 min-h-7  max-w-7 max-h-7 overflow-hidden"
            onError={() => {
                setImageError(true)
            }}
        />
    )
})

TokenImage.displayName = 'TokenImage'

export default TokenKeyDetails
