import React, { useRef, useState } from 'react'

import { useLogin, usePrivy } from '@privy-io/react-auth'

import useControlledScroll from '@/hooks/useControlledScroll'
import { useWebDataContext } from '@/context/webDataContext'
import TableRowLoading from '../TableRowLoading'

import { toast } from 'react-toastify'
import { findMarketDataByName } from '@/utils/tokenSymbol'
import axios from 'axios'
import { useSettingsContext } from '@/context/SettingsContext'
import { getReadableUnixTimestamp } from '@/utils/time'
import Button from '../ui/Button'
import { formatCryptoPrice } from '@/utils/price'
import Spinner from '../Spinner'
import useIsMobile from '@/hooks/useIsMobile'
import EmptyData from '../global/EmptyData'
import { usePairTokensContext } from '@/context/pairTokensContext'
import useHaptic from '@/hooks/useHaptic'

const OpenOrderTable = () => {
    const [isLoading, setIsLoading] = useState(false)
    const { setTokenId } = usePairTokensContext()
    const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null)
    const { ready, authenticated } = usePrivy()
    const { login: handleSignIn } = useLogin()
    const { timezone } = useSettingsContext()
    const isMobile = useIsMobile()
    const { triggerHaptic } = useHaptic()

    const { webData2, loadingWebData2, marketData } = useWebDataContext()

    const openOrders = webData2?.openOrders

    const tableContainerRef = useRef<HTMLDivElement>(null)
    useControlledScroll({ ref: tableContainerRef })

    const handleCancelOrder = async (orderId: number, coin: string) => {
        triggerHaptic(50)
        setLoadingOrderId(orderId)
        setIsLoading(true)
        const toastId = toast.loading('Cancelling order...')
        try {
            const marketDataItem = findMarketDataByName(marketData, coin)
            const response = await axios.post(`/api/hyperliquid/cancel-order`, {
                orderId: orderId,
                coin: marketDataItem?.symbol,
            })

            // Show success toast notification
            if (response.data.success) {
                toast.success('Order cancelled successfully.')
            } else {
                toast.error('Failed to cancel order.')
            }
        } catch (error) {
            console.error('Error cancelling order:', error)
            toast.error('Failed to cancel order.')
        } finally {
            setIsLoading(false)
            setLoadingOrderId(null)
            toast.dismiss(toastId)
        }
    }

    return (
        <div className="flex flex-col h-full max-h-full relative flex-1 overflow-hidden">
            {ready && authenticated ? (
                <>
                    {/* positions  */}
                    {!isMobile && (
                        <div ref={tableContainerRef} className="overflow-x-auto mobile-no-scrollbar overflow-y-auto h-full">
                            <table className="table-auto w-full">
                                <thead className="w-full sticky -top-[3px] md:top-0 uppercase bg-black text-sm z-20">
                                    <tr className="w-full text-neutral-text-dark relative">
                                        <th className="py-3 text-xs px-4 text-nowrap text-left">Time</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Type</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Coin</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Direction</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Size</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Original Size</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Order Value</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Price</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Reduce Only</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Trigger Condition</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Cancel Order</th>
                                    </tr>
                                </thead>

                                {loadingWebData2 ? (
                                    <TableRowLoading totalTableData={11} totalRow={15} className="px-2 items-center" />
                                ) : (
                                    <tbody className="w-full text-xs">
                                        {openOrders && openOrders.length > 0 ? (
                                            openOrders.map((order, index) => (
                                                <tr key={index} className="bg-table-even border-b border-border/80 apply-transition relative">
                                                    <td className="py-3 px-4">{getReadableUnixTimestamp(order.timestamp, timezone)}</td>
                                                    {/* <td className="py-3 px-4">{new Date(order.timestamp).toLocaleString()}</td> */}
                                                    <td className="py-3 px-4 text-center">{order.orderType}</td>
                                                    <td
                                                        className={`py-3 px-4 text-center cursor-pointer `}
                                                        onClick={() => {
                                                            setTokenId(order.coin)
                                                        }}
                                                    >
                                                        {/* ${ order.side === 'B' ? 'text-positive' : 'text-negative'} */}
                                                        {order.coin}
                                                    </td>
                                                    <td className={`py-3 px-4 ${order.side === 'B' ? 'text-positive' : 'text-negative'} text-center`}>
                                                        {order.side === 'B' ? 'Buy' : 'Sell'}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {order.orderType.includes('Market') ? '--' : formatCryptoPrice(order.sz)}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {order.orderType.includes('Market') ? '--' : formatCryptoPrice(order.origSz)}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {order.orderType.includes('Market')
                                                            ? '--'
                                                            : `$${formatCryptoPrice(parseFloat(order.limitPx) * parseFloat(order.sz), 2, 2)}`}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {order.orderType.includes('Market') ? 'Market' : order.limitPx}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">{order.reduceOnly ? 'Yes' : 'No'}</td>
                                                    <td className="py-3 px-4 text-center">{order.triggerCondition}</td>
                                                    <td className="py-3 px-4 text-center flex items-center justify-center h-full">
                                                        <Button
                                                            variant="neutral"
                                                            className="text-2xs"
                                                            height="h-6"
                                                            padding="px-2"
                                                            type="button"
                                                            onClick={() => handleCancelOrder(order.oid, order.coin)}
                                                            disabled={isLoading && loadingOrderId === order.oid}
                                                        >
                                                            {isLoading && loadingOrderId === order.oid ? <Spinner className="w-3 h-3" /> : 'Cancel'}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={11} className="text-center py-3">
                                                    <EmptyData text="No Open Orders" />
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
                            {openOrders && openOrders.length > 0 ? (
                                openOrders.map((order, index) => (
                                    <div key={index} className=" bg-table-even border-b border-border apply-transition relative py-2">
                                        <div className="flex items-center px-3">
                                            <div className="flex flex-row items-center gap-1">
                                                <div
                                                    className=" text-left text-sm font-bold"
                                                    onClick={() => {
                                                        setTokenId(order.coin)
                                                    }}
                                                >
                                                    {order.coin}
                                                </div>
                                                <div
                                                    className={`px-1  rounded h-4 leading-4 flex flex-col text-[8px] ${
                                                        order.side === 'B' ? 'text-positive bg-positive/20' : 'text-negative bg-negative/20'
                                                    }`}
                                                >
                                                    {order.side === 'B' ? 'Buy' : 'Sell'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 pt-1">
                                            <div className="py-1 px-3 flex flex-col">
                                                <span className="text-2xs text-neutral-text-dark">Type</span>
                                                <div className="flex flex-col text-xs">{order.orderType}</div>
                                            </div>
                                            <div className="py-1 px-3 flex flex-col">
                                                <span className="text-2xs text-neutral-text-dark">Size</span>
                                                <div className="flex flex-col text-xs">
                                                    {' '}
                                                    {order.orderType.includes('Market') ? '--' : formatCryptoPrice(order.sz)}
                                                </div>
                                            </div>
                                            <div className="py-1 px-3 flex flex-col">
                                                <span className="text-2xs text-neutral-text-dark">Original Size</span>
                                                <div className="flex flex-col text-xs">
                                                    {order.orderType.includes('Market') ? '--' : formatCryptoPrice(order.origSz)}
                                                </div>
                                            </div>
                                            <div className="py-1 px-3 flex flex-col">
                                                <span className="text-2xs text-neutral-text-dark">Order Value</span>
                                                <div className="flex flex-col text-xs">
                                                    {order.orderType.includes('Market')
                                                        ? '--'
                                                        : `$${formatCryptoPrice(parseFloat(order.limitPx) * parseFloat(order.sz), 2, 2)}`}
                                                </div>
                                            </div>
                                            <div className="py-1 px-3 flex flex-col">
                                                <span className="text-2xs text-neutral-text-dark">Price</span>
                                                <div className="flex flex-col text-xs">
                                                    {order.orderType.includes('Market') ? 'Market' : order.limitPx}
                                                </div>
                                            </div>
                                            <div className="py-1 px-3 flex flex-col">
                                                <span className="text-2xs text-neutral-text-dark">Reduce Only</span>
                                                <div className="flex flex-col text-xs">{order.reduceOnly ? 'Yes' : 'No'}</div>
                                            </div>
                                            <div className="py-1 px-3 flex flex-col col-span-1">
                                                <span className="text-2xs text-neutral-text-dark">Trigger </span>
                                                <div className="flex flex-col text-xs">{order.triggerCondition}</div>
                                            </div>
                                            <div className="py-1 px-3 flex flex-col col-span-1">
                                                <span className="text-2xs text-neutral-text-dark">Time</span>
                                                <div className="flex flex-col text-xs">{getReadableUnixTimestamp(order.timestamp, timezone)}</div>
                                            </div>
                                            <div className="py-1 px-3 flex flex-col col-span-full">
                                                <Button
                                                    variant="neutral"
                                                    className="text-2xs w-full"
                                                    height="min-h-7"
                                                    padding="px-2"
                                                    type="button"
                                                    onClick={() => handleCancelOrder(order.oid, order.coin)}
                                                    disabled={isLoading && loadingOrderId === order.oid}
                                                >
                                                    {isLoading && loadingOrderId === order.oid ? <Spinner className="w-3 h-3" /> : 'Cancel'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyData text="No Open Orders" />
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
        </div>
    )
}

export default OpenOrderTable
