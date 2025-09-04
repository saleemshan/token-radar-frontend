import React, { useRef, useState } from 'react'

import { useLogin, usePrivy } from '@privy-io/react-auth'
import useControlledScroll from '@/hooks/useControlledScroll'
import TableRowLoading from '../TableRowLoading'
import { useWebDataContext } from '@/context/webDataContext'
import { FaPencil } from 'react-icons/fa6'

import LimitCloseModal from '../modal/LimitCloseModal'
import MarketCloseModal from '../modal/MarketCloseModal'
import TakeprofitStopLoss from '../modal/TakeprofitStopLoss'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { useSettingsContext } from '@/context/SettingsContext'
import Button from '../ui/Button'
import { formatCryptoPrice, getReadableNumber } from '@/utils/price'
import { TokenImage } from './SelectTokenPairTable'
import clsx from 'clsx'
import { useRouter, usePathname } from 'next/navigation'
import useIsMobile from '@/hooks/useIsMobile'
import { findMarketDataByName } from '@/utils/tokenSymbol'
import { RiShareBoxFill } from 'react-icons/ri'
import ShareNewsTradingPositionModal from '../modal/ShareNewsTradingPositionModal'
import Spinner from '../Spinner'
import EmptyData from '../global/EmptyData'
import Tooltip from '../Tooltip'

const PositionsTable = () => {
    const { ready, authenticated } = usePrivy()
    const { login: handleSignIn } = useLogin()
    const { hideSmallAssets } = useSettingsContext()
    const { loadingWebData2, webData2, marketData } = useWebDataContext()
    const { tokenPairData, setTokenId, setIsSpotToken } = usePairTokensContext()
    const router = useRouter()
    const pathname = usePathname()
    const isMobile = useIsMobile()

    const tableContainerRef = useRef<HTMLDivElement>(null)
    useControlledScroll({ ref: tableContainerRef })

    const PositionsData = webData2?.clearinghouseState?.assetPositions
    const limitModalRef = useRef<{ toggleModal: () => void }>(null)
    const marketCloseModalRef = useRef<{ toggleModal: () => void }>(null)
    const takeprofitStopLossModalRef = useRef<{ toggleModal: () => void }>(null)

    const [showSharePositionModal, setShowSharePositionModal] = useState(false)
    const [selectedSharePosition, setSelectedSharePosition] = useState<UserTokenHolding | undefined>(undefined)
    const [selectedPosition, setSelectedPosition] = useState<{
        coin: string
        size: number
        entryPx: string
    } | null>(null)

    const formattedPositions = PositionsData?.map(position => {
        const matchingOrders = webData2?.openOrders?.filter(order => order.coin === position.position.coin) || []

        // Separate market and limit orders
        const marketOrders = matchingOrders.filter(order => order.orderType.includes('Market'))
        const limitOrders = matchingOrders.filter(order => order.orderType.includes('Limit'))

        // Find TP/SL orders
        const tpOrder = matchingOrders.find(order => order.orderType === 'Take Profit Market')
        const slOrder = matchingOrders.find(order => order.orderType === 'Stop Market')

        const pnlValue = Number(position.position.unrealizedPnl)

        return {
            ...position.position,
            coin: position.position.coin,
            size: position.position.szi,
            positionDirection: position.position.szi > 0 ? 'Long' : 'Short',
            leverage: position?.position?.leverage?.value,
            positionSide: position.position.side,
            positionValue: `$${formatCryptoPrice(
                Number(position.position.positionValue),
                2,
                Number(position.position.positionValue) > 1000 ? 0 : 2
            )}`,
            entryPrice: `$${formatCryptoPrice(Number(position.position.entryPx)) || 'N/A'}`,
            markPrice: `$${
                formatCryptoPrice(Number(tokenPairData?.find(token => token.universe.name === position.position.coin)?.assetCtx.markPx)) || 'N/A'
            }`,
            roe: `${(Number(position.position.returnOnEquity) * 100).toFixed(1)}%`,
            pnl: `$${formatCryptoPrice(Number(pnlValue), 2, Number(pnlValue) > 1000 ? 0 : 2)}`,
            pnlDirection: pnlValue > 0 ? 'positive' : pnlValue < 0 ? 'negative' : 'neutral',
            liqPrice: `$${formatCryptoPrice(Number(position.position.liquidationPx)) || 'N/A'}`,
            margin: `$${formatCryptoPrice(Number(position.position.marginUsed)) || 'N/A'}`,
            funding: `$${formatCryptoPrice(Number(position.position.cumFunding.sinceOpen)) || 'N/A'}`,
            fundingAllTime: `$${formatCryptoPrice(Number(position.position.cumFunding.allTime)) || 'N/A'}`,
            hasMarketOrders: marketOrders.length > 0,
            hasLimitOrders: limitOrders.length > 0,
            tpSl:
                tpOrder || slOrder
                    ? `${tpOrder ? formatCryptoPrice(Number(tpOrder.triggerPx)) : '--'} / ${
                          slOrder ? formatCryptoPrice(Number(slOrder.triggerPx)) : '--'
                      }`
                    : '-- / --',
        }
    })

    const navigateToTokenChart = (coin: string) => {
        const assetId = findMarketDataByName(marketData, coin)?.id

        if (pathname === '/') {
            setTokenId(coin)
            setIsSpotToken(false)
            return
        }
        const basePath = isMobile ? '/mobile/perps/' : '/perps/'
        router.push(`${basePath}${coin}?assetId=${assetId}`)
    }

    return (
        <div className="flex flex-col h-full max-h-full relative flex-1 overflow-hidden">
            {ready && authenticated ? (
                <>
                    {!isMobile && (
                        <div ref={tableContainerRef} className="overflow-x-auto mobile-no-scrollbar overflow-y-auto h-full">
                            <table className="table-auto w-full">
                                <thead className="w-full sticky -top-[3px] md:top-0 uppercase bg-black text-sm z-20">
                                    <tr className="w-full text-neutral-text-dark relative">
                                        <th className="py-3 text-xs px-4 text-nowrap text-left">Market & Side</th>
                                        <th className="py-3 text-xs px-4 text-nowrap text-center">Size</th>
                                        <th className="py-3 text-xs px-4 text-nowrap text-center">Entry Price</th>
                                        <th className="py-3 text-xs px-4 text-nowrap text-center">Mark Price</th>
                                        <th className="py-3 text-xs px-4 text-nowrap text-center">PNL(ROE%)</th>
                                        <th className="py-3 text-xs px-4 text-nowrap text-center">Liq.Price</th>
                                        <th className="py-3 text-xs px-4 text-nowrap text-center">Funding</th>
                                        <th className="py-3 text-xs px-4 text-nowrap text-center">TP/SL</th>
                                        <th className="py-3 text-xs px-4 text-nowrap text-center">Close</th>
                                    </tr>
                                </thead>

                                {loadingWebData2 ? (
                                    <TableRowLoading totalTableData={9} totalRow={15} className="px-2 items-center" />
                                ) : (
                                    <tbody className="w-full text-xs">
                                        {formattedPositions && formattedPositions.length > 0 ? (
                                            formattedPositions.map((position, index) => {
                                                if (hideSmallAssets) {
                                                    const positionValue = Number(position.positionValue.split('$')[1])

                                                    if (positionValue < 2) return null
                                                }
                                                return (
                                                    <tr key={index} className="bg-table-even border-b border-border/80 apply-transition relative">
                                                        <td className="py-3 px-4 text-left">
                                                            <div className="flex items-center gap-2">
                                                                <TokenImage
                                                                    imageUrl={`/api/hyperliquid/coin-image?coin=${position.coin.toUpperCase()}`}
                                                                    symbol={position.coin}
                                                                    width={20}
                                                                    height={20}
                                                                    className="max-w-5 max-h-5"
                                                                />
                                                                <div className="flex flex-col gap-1">
                                                                    <div
                                                                        className="text-xs cursor-pointer hover:underline hover:text-positive"
                                                                        onClick={() => navigateToTokenChart(position.coin)}
                                                                    >
                                                                        {position.coin}
                                                                    </div>
                                                                    <div
                                                                        className={clsx('text-xs', {
                                                                            'text-positive': position.positionDirection === 'Long',
                                                                            'text-negative': position.positionDirection === 'Short',
                                                                        })}
                                                                    >
                                                                        {position.positionDirection} {position.leverage}X{' '}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                {formatCryptoPrice(Math.abs(Number(position.size)))}
                                                                <span className="text-neutral-text-dark">{position.positionValue}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">{position.entryPrice}</td>
                                                        <td className="py-3 px-4 text-center">{position.markPrice}</td>
                                                        <td className="py-3 px-4 text-center gap-2">
                                                            <span
                                                                className={`flex flex-col items-center gap-1 ${
                                                                    position.pnlDirection === 'positive'
                                                                        ? 'text-positive'
                                                                        : position.pnlDirection === 'negative'
                                                                        ? 'text-negative'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-1">
                                                                    <div>
                                                                        {position?.pnlDirection === 'positive' ? '+' : ''}
                                                                        {position?.pnl}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        className=" p-[2px] text-neutral-text"
                                                                        onClick={e => {
                                                                            e.stopPropagation()
                                                                            console.log({ position })
                                                                            setShowSharePositionModal(true)
                                                                            setSelectedSharePosition(position)
                                                                        }}
                                                                    >
                                                                        <RiShareBoxFill />
                                                                    </button>
                                                                </div>

                                                                <span className="text-neutral-text-dark">{position?.roe}</span>
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">{position.liqPrice}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <Tooltip
                                                                text={`All Time: $${getReadableNumber(
                                                                    Number(position?.cumFunding?.allTime) || 0,
                                                                    2
                                                                )} \nSince Change: $${getReadableNumber(
                                                                    Number(position?.cumFunding?.sinceChange) || 0,
                                                                    2
                                                                )}`}
                                                            >
                                                                <span className="cursor-help">
                                                                    ${Number(position?.cumFunding?.sinceOpen || 0).toFixed(2)}
                                                                </span>
                                                            </Tooltip>
                                                        </td>
                                                        <td className="py-3 px-4 text-center cursor-pointer">
                                                            <div
                                                                onClick={e => {
                                                                    e.stopPropagation()
                                                                    setSelectedPosition({
                                                                        coin: position.coin,
                                                                        size: Number(position.size),
                                                                        entryPx: position.entryPx,
                                                                    })
                                                                    takeprofitStopLossModalRef.current?.toggleModal()
                                                                }}
                                                                className="flex items-center justify-center gap-2"
                                                            >
                                                                {position.tpSl}
                                                                <FaPencil className="text-white inline text-2xs" />
                                                            </div>
                                                        </td>

                                                        <td className="py-3 px-4 text-center">
                                                            <div className="flex justify-center gap-2">
                                                                <Button
                                                                    variant="neutral"
                                                                    className="text-2xs"
                                                                    height="h-6"
                                                                    padding="px-2"
                                                                    onClick={e => {
                                                                        e.stopPropagation()
                                                                        setSelectedPosition({
                                                                            coin: position.coin,
                                                                            size: Number(position.size),
                                                                            entryPx: position.entryPx,
                                                                        })
                                                                        marketCloseModalRef.current?.toggleModal()
                                                                    }}
                                                                >
                                                                    Market
                                                                </Button>
                                                                <Button
                                                                    variant="neutral"
                                                                    className="text-2xs"
                                                                    height="h-6"
                                                                    padding="px-2"
                                                                    onClick={e => {
                                                                        e.stopPropagation()
                                                                        setSelectedPosition({
                                                                            coin: position.coin,
                                                                            size: Number(position.size),
                                                                            entryPx: position.entryPx,
                                                                        })
                                                                        limitModalRef.current?.toggleModal()
                                                                    }}
                                                                >
                                                                    Limit
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={11} className="text-center py-3">
                                                    <EmptyData text="No Open Positions" />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    )}

                    {isMobile && (
                        <div className="w-full flex-1 overflow-y-auto h-full mobile-no-scrollbar flex flex-col">
                            {loadingWebData2 ? (
                                <div className="flex items-center justify-center w-full p-3">
                                    <Spinner className=" text-xs" />
                                </div>
                            ) : (
                                <div className="w-full flex flex-col flex-1">
                                    {formattedPositions && formattedPositions.length > 0 ? (
                                        formattedPositions.map((position, index) => {
                                            if (hideSmallAssets) {
                                                const positionValue = Number(position.positionValue.split('$')[1])

                                                if (positionValue < 2) return null
                                            }
                                            return (
                                                <div key={index} className=" bg-table-even border-b border-border apply-transition relative py-2">
                                                    <div className="flex items-center justify-between px-3">
                                                        <div className="flex flex-row items-center gap-1">
                                                            <div
                                                                className=" text-left text-sm font-bold"
                                                                onClick={() => navigateToTokenChart(position.coin)}
                                                            >
                                                                {position.coin}
                                                            </div>
                                                            <div
                                                                className={clsx('text-[8px]', {
                                                                    'text-positive bg-positive/20 px-1  rounded h-4 leading-4':
                                                                        position.positionDirection === 'Long',
                                                                    'text-negative bg-negative/20 px-1  rounded h-4 leading-4':
                                                                        position.positionDirection === 'Short',
                                                                })}
                                                            >
                                                                {position.positionDirection} {position.leverage}X{' '}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end">
                                                            <span className="text-2xs text-neutral-text-dark">PNL (ROE %)</span>
                                                            <span
                                                                className={`flex flex-col items-center gap-1 font-bold text-sm ${
                                                                    position.pnlDirection === 'positive'
                                                                        ? 'text-positive'
                                                                        : position.pnlDirection === 'negative'
                                                                        ? 'text-negative'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-1">
                                                                    <div>
                                                                        {position?.pnlDirection === 'positive' ? '+' : ''}
                                                                        {position?.pnl} ({position?.roe})
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        className="text-xs"
                                                                        onClick={e => {
                                                                            e.stopPropagation()
                                                                            console.log({ position })
                                                                            setShowSharePositionModal(true)
                                                                            setSelectedSharePosition(position)
                                                                        }}
                                                                    >
                                                                        <RiShareBoxFill />
                                                                    </button>
                                                                </div>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-4 pt-1">
                                                        <div className="py-1 px-3 flex flex-col">
                                                            <span className="text-2xs text-neutral-text-dark">Position Size</span>
                                                            <div className="flex flex-col text-xs">
                                                                {formatCryptoPrice(Math.abs(Number(position.size)))}
                                                                <span className="text-neutral-text-dark text-2xs">{position.positionValue}</span>
                                                            </div>
                                                        </div>
                                                        <div className="py-1 px-3 flex flex-col">
                                                            <span className="text-2xs text-neutral-text-dark">Entry Price</span>
                                                            <div className="text-xs">{position.entryPrice}</div>
                                                        </div>
                                                        <div className="py-1 px-3 flex flex-col">
                                                            <span className="text-2xs text-neutral-text-dark">Mark Price</span>
                                                            <div className="text-xs">{position.markPrice}</div>
                                                        </div>
                                                        <div className="py-1 px-3 flex flex-col items-end">
                                                            <span className="text-2xs text-neutral-text-dark">Liq Price</span>
                                                            <div className="text-xs">{position.liqPrice}</div>
                                                        </div>

                                                        <div className="py-1 px-3 flex flex-col col-span-4 gap-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-2xs text-neutral-text-dark">Funding</span>
                                                                <Tooltip
                                                                    text={`All Time: $${getReadableNumber(
                                                                        Number(position?.cumFunding?.allTime) || 0,
                                                                        2
                                                                    )} \nSince Change: $${getReadableNumber(
                                                                        Number(position?.cumFunding?.sinceChange) || 0,
                                                                        2
                                                                    )}`}
                                                                >
                                                                    <span className="text-xs cursor-help">
                                                                        ${getReadableNumber(Number(position?.cumFunding?.sinceOpen) || 0, 2)}
                                                                    </span>
                                                                </Tooltip>
                                                            </div>
                                                        </div>

                                                        <div className="py-1 px-3 flex col-span-4 gap-2">
                                                            <Button
                                                                variant="neutral"
                                                                className="text-2xs w-1/2"
                                                                height="min-h-7"
                                                                padding="px-2"
                                                                onClick={e => {
                                                                    e.stopPropagation()
                                                                    setSelectedPosition({
                                                                        coin: position.coin,
                                                                        size: Number(position.size),
                                                                        entryPx: position.entryPx,
                                                                    })
                                                                    takeprofitStopLossModalRef.current?.toggleModal()
                                                                }}
                                                            >
                                                                SET TP/SL
                                                            </Button>

                                                            <Button
                                                                variant="neutral"
                                                                className="text-2xs w-1/2"
                                                                height="min-h-7"
                                                                padding="px-2"
                                                                onClick={e => {
                                                                    e.stopPropagation()
                                                                    setSelectedPosition({
                                                                        coin: position.coin,
                                                                        size: Number(position.size),
                                                                        entryPx: position.entryPx,
                                                                    })
                                                                    limitModalRef.current?.toggleModal()
                                                                }}
                                                            >
                                                                Limit Close
                                                            </Button>

                                                            <Button
                                                                variant="neutral"
                                                                className="text-2xs w-1/2"
                                                                height="min-h-7"
                                                                padding="px-2"
                                                                onClick={e => {
                                                                    e.stopPropagation()
                                                                    setSelectedPosition({
                                                                        coin: position.coin,
                                                                        size: Number(position.size),
                                                                        entryPx: position.entryPx,
                                                                    })
                                                                    marketCloseModalRef.current?.toggleModal()
                                                                }}
                                                            >
                                                                Market Close
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <EmptyData text="No Open Positions" />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="flex h-full gap-1 justify-center items-center text-center bg-black/50 absolute inset-0 backdrop-blur-sm z-50">
                    <button type="button" onClick={handleSignIn} className=" underline ">
                        Sign in
                    </button>
                    <span>{`to see your position`}</span>
                </div>
            )}

            <LimitCloseModal ref={limitModalRef} position={selectedPosition} onClose={() => limitModalRef.current?.toggleModal()} />
            <MarketCloseModal ref={marketCloseModalRef} position={selectedPosition} onClose={() => marketCloseModalRef.current?.toggleModal()} />
            <TakeprofitStopLoss
                ref={takeprofitStopLossModalRef}
                position={selectedPosition}
                onClose={() => takeprofitStopLossModalRef.current?.toggleModal()}
            />

            {showSharePositionModal && (
                <ShareNewsTradingPositionModal position={selectedSharePosition} handleCloseModal={() => setShowSharePositionModal(false)} />
            )}
        </div>
    )
}

export default PositionsTable
