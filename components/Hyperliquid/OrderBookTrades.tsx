import React from 'react'

import { CiShare1 } from 'react-icons/ci'
import { useOrderBookTradesContext } from '@/context/OrderBookTradesContext'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { formatCryptoPrice } from '@/utils/price'

const OrderBookTrades = () => {
    const { tradesData } = useOrderBookTradesContext()
    const { tokenPairs } = usePairTokensContext()

    return (
        <div className=" text-neutral-text p-3 pt-0 max-h-full overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex justify-between text-neutral-text-dark text-xs sticky top-0 bg-black pt-3">
                <div className="w-1/3 text-left">Price</div>
                <div className="w-1/3 text-center">Size ({tokenPairs[0]})</div>
                <div className="w-1/3 text-right">Time</div>
            </div>

            <div className="mt-1 space-y-1">
                {tradesData.map((row, index) => {
                    return (
                        <div key={index} className="flex justify-between items-center rounded-md hover:bg-table-odd text-sm">
                            <div className={`w-1/3 text-left ${row.side === 'A' ? 'text-negative' : 'text-positive'}`}>
                                {' '}
                                {formatCryptoPrice(row.px)}
                            </div>
                            <div className="w-1/3 text-center ">{row.sz}</div>
                            <div className="w-1/3 text-right  flex items-center gap-1 justify-end">
                                {row.time}{' '}
                                <a href={`https://app.hyperliquid.xyz/explorer/tx/${row.hash}`} target="_blank">
                                    <CiShare1 className="" />
                                </a>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default OrderBookTrades
;``
