import React from 'react'
import { useOrderHistoryContext } from '@/context/orderHistoryContext'
import TableRowLoading from '../TableRowLoading'
import { getReadableUnixTimestamp } from '@/utils/time'
import { useSettingsContext } from '@/context/SettingsContext'
import { formatCryptoPrice } from '@/utils/price'
import useIsMobile from '@/hooks/useIsMobile'
import Spinner from '../Spinner'
import EmptyData from '../global/EmptyData'
import { usePairTokensContext } from '@/context/pairTokensContext'

const columns = [
    { id: 'time', label: 'Time' },
    { id: 'coin', label: 'Coin' },
    { id: 'type', label: 'Type' },
    { id: 'direction', label: 'Direction' },
    { id: 'size', label: 'Size' },
    { id: 'originalSize', label: 'Original Size' },
    { id: 'orderValue', label: 'Order Value' },
    { id: 'price', label: 'Price' },
    { id: 'triggerCondition', label: 'Trigger Condition' },
    { id: 'tpsl', label: 'TP/SL' },
    { id: 'status', label: 'Status' },
    { id: 'Order ID', label: 'Order ID' },
]

const OrderHistoryComponentTable = () => {
    const { timezone } = useSettingsContext()
    const { setTokenId } = usePairTokensContext()
    const { orderHistoryData, loadingOrderHistory } = useOrderHistoryContext()
    const isMobile = useIsMobile()

    const getDirectionText = (order: { side: string; reduceOnly: boolean }) => {
        if (order.side === 'B' && !order.reduceOnly) return 'Long'
        if (order.side === 'A' && !order.reduceOnly) return 'Short'
        if (order.side === 'B' && order.reduceOnly) return 'Close Short'
        if (order.side === 'A' && order.reduceOnly) return 'Close Long'
        return 'Unknown'
    }

    const getDirectionColor = (order: { side: string; reduceOnly: boolean }) => {
        if (order.side === 'B' && !order.reduceOnly) return 'text-positive'
        if (order.side === 'A' && !order.reduceOnly) return 'text-negative'
        if (order.side === 'B' && order.reduceOnly) return 'text-positive'
        if (order.side === 'A' && order.reduceOnly) return 'text-negative'
        return 'text-neutral-text-dark'
    }

    const reversedOrders = orderHistoryData && orderHistoryData.length > 0 && orderHistoryData.slice().reverse()
    const latestOrders = reversedOrders && reversedOrders.length > 0 && reversedOrders.slice(0, 30)

    return (
        <div className="flex flex-col h-full max-h-full relative flex-1 overflow-hidden">
            {!isMobile && (
                <div className="overflow-x-auto mobile-no-scrollbar overflow-y-auto">
                    <table className="table-auto w-full h-full">
                        <thead className="w-full sticky -top-[3px] md:top-0 uppercase bg-black text-sm z-20">
                            <tr className="w-full text-neutral-text-dark relative">
                                {columns.map(column => (
                                    <th key={column.id} className="py-3 text-xs px-4 text-nowrap text-center">
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="w-full text-xs">
                            {loadingOrderHistory ? (
                                <TableRowLoading totalTableData={columns.length} totalRow={15} className="px-2 items-center" />
                            ) : latestOrders && latestOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-3">
                                        <EmptyData text="No Order History" />
                                    </td>
                                </tr>
                            ) : (
                                latestOrders &&
                                latestOrders.map((row, index) => (
                                    <tr key={index} className="bg-table-even border-b border-border/80 apply-transition relative">
                                        <td className="py-3 px-4">{getReadableUnixTimestamp(row.order.timestamp, timezone)}</td>
                                        <td
                                            className="py-3 px-4 text-center cursor-pointer"
                                            onClick={() => {
                                                setTokenId(row.order.coin)
                                            }}
                                        >
                                            {row.order.coin}
                                        </td>
                                        <td className="py-3 px-4 text-center">{row.order.orderType}</td>
                                        <td className={`py-3 px-4 text-center ${getDirectionColor(row.order)}`}>{getDirectionText(row.order)}</td>
                                        <td className="py-3 px-4 text-center">{row.order.sz}</td>
                                        <td className="py-3 px-4 text-center">{row.order.origSz}</td>
                                        <td className="py-3 px-4 text-center">${(Number(row.order.sz) * Number(row.order.limitPx)).toFixed(2)}</td>
                                        <td className="py-3 px-4 text-center">
                                            {row.order.orderType === 'Limit' ? `$${formatCryptoPrice(row.order.limitPx)}` : 'Market'}
                                        </td>
                                        <td className="py-3 px-4 text-center">{row.order.triggerCondition}</td>
                                        <td className="py-3 px-4 text-center">{'- -'}</td>
                                        <td className="py-3 px-4 text-center">{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</td>
                                        <td className="py-3 px-4 text-center">{row.order.oid}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isMobile && (
                <div className="w-full flex-1 overflow-y-auto h-full mobile-no-scrollbar flex flex-col">
                    {loadingOrderHistory ? (
                        <div className="flex items-center justify-center w-full p-3">
                            <Spinner className=" text-xs" />
                        </div>
                    ) : latestOrders && latestOrders.length === 0 ? (
                        <EmptyData text="No Order History" />
                    ) : (
                        latestOrders &&
                        latestOrders.map((row, index) => (
                            <div key={index} className=" bg-table-even border-b border-border apply-transition relative py-2">
                                <div className="flex items-center px-3 justify-between">
                                    <div className="flex flex-row items-center gap-1">
                                        <div
                                            className=" text-left text-sm font-bold"
                                            onClick={() => {
                                                setTokenId(row.order.coin)
                                            }}
                                        >
                                            {row.order.coin}
                                        </div>
                                        <div className={`px-1  rounded h-4 leading-4 flex flex-col text-[8px] ${getDirectionColor(row.order)}`}>
                                            {getDirectionText(row.order)}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xs text-neutral-text-dark">Order ID: {row.order.oid}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 pt-1">
                                    <div className="py-1 px-3 flex flex-col">
                                        <span className="text-2xs text-neutral-text-dark">Type</span>
                                        <div className="flex flex-col text-xs">{row.order.orderType}</div>
                                    </div>
                                    <div className="py-1 px-3 flex flex-col col-span-1">
                                        <span className="text-2xs text-neutral-text-dark">Size</span>
                                        <div className="flex flex-col text-xs">{row.order.sz}</div>
                                    </div>
                                    <div className="py-1 px-3 flex flex-col col-span-1">
                                        <span className="text-2xs text-neutral-text-dark">Original Size</span>
                                        <div className="flex flex-col text-xs">{row.order.origSz}</div>
                                    </div>
                                    <div className="py-1 px-3 flex flex-col col-span-1 items-end">
                                        <span className="text-2xs text-neutral-text-dark text-right">Order Value</span>
                                        <div className="flex flex-col text-xs text-right">
                                            ${(Number(row.order.sz) * Number(row.order.limitPx)).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="py-1 px-3 flex flex-col col-span-1">
                                        <span className="text-2xs text-neutral-text-dark">Price</span>
                                        <div className="flex flex-col text-xs">
                                            {row.order.orderType === 'Limit' ? `$${formatCryptoPrice(row.order.limitPx)}` : 'Market'}
                                        </div>
                                    </div>
                                    {/* <div className="py-1 px-3 flex flex-col col-span-1">
                                        <span className="text-2xs text-neutral-text-dark">TP/SL</span>
                                        <div className="flex flex-col text-xs">{'- -'}</div>
                                    </div> */}
                                    <div className="py-1 px-3 flex flex-col col-span-1">
                                        <span className="text-2xs text-neutral-text-dark">Status</span>
                                        <div className="flex flex-col text-xs">{row.status.charAt(0).toUpperCase() + row.status.slice(1)}</div>
                                    </div>

                                    <div className="py-1 px-3 flex flex-col col-span-1">
                                        <span className="text-2xs text-neutral-text-dark">Trigger </span>
                                        <div className="flex flex-col text-xs">{row.order.triggerCondition}</div>
                                    </div>
                                    <div className="py-1 px-3 flex flex-col col-span-1 items-end">
                                        <span className="text-2xs text-neutral-text-dark text-right">Time</span>
                                        <div className="flex flex-col text-xs text-right">
                                            {getReadableUnixTimestamp(row.order.timestamp, timezone)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default OrderHistoryComponentTable
