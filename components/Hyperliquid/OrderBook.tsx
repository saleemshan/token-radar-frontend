import { Order, useOrderBookTradesContext } from '@/context/OrderBookTradesContext'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { OrderStep } from '@/utils/hyperliquid'

import { calculateBarWidth, calculateTotal } from '@/utils/orderBookUtils'
import { formatCryptoPrice } from '@/utils/price'
import { SizeEquivalentsProps } from '@/utils/usdEquivalents'
import React, { useEffect } from 'react'

// Get USD value if token is USD
export const getUsdEquivalentOnly = ({ size, currentMarkPrice, token }: SizeEquivalentsProps) => {
    if (token?.toUpperCase() === 'USD') {
        // const priceUsd = Math.trunc(size * currentMarkPrice)

        return Math.trunc(size * currentMarkPrice)
    } else {
        return size
    }
}

// Calculate spread percentage
const calculateSpreadPercentage = (asks: Order[], bids: Order[]) => {
    if (asks.length === 0 || bids.length === 0) return 0
    const highestBid = bids[0].px
    const lowestAsk = asks[asks.length - 1].px
    const spread = lowestAsk - highestBid
    const spreadPercentage = parseFloat(((spread / lowestAsk) * 100).toFixed(2))
    return spreadPercentage
}

const renderOrderBookTable = (orders: { px: number; sz: number; n: number }[], type: 'asks' | 'bids', pair: string, reverseTotal: boolean) => {
    const ordersWithTotal = calculateTotal(orders, pair, reverseTotal)

    const maxOrderTotal = Math.max(...ordersWithTotal.map(order => order.total))

    return (
        <div className="flex flex-col gap-1">
            {ordersWithTotal.map((order, index) => (
                <div key={index} className="flex justify-between text-sm relative px-3">
                    <div
                        className={`absolute left-0 h-full opacity-15 ${type === 'asks' ? 'bg-negative' : 'bg-positive'}`}
                        style={{
                            width: `${calculateBarWidth(order.total, maxOrderTotal)}%`,
                        }}
                    />
                    <div className={`z-10 w-1/3 ${type === 'asks' ? 'text-negative' : 'text-positive'}`}>{formatCryptoPrice(order.px)}</div>
                    <div className="text-neutral-300 z-10 w-1/3 text-center">
                        {pair?.toUpperCase() === 'USD'
                            ? Math.trunc(
                                  getUsdEquivalentOnly({
                                      size: order.sz,
                                      currentMarkPrice: order.px,
                                      token: pair,
                                  })
                              )
                            : getUsdEquivalentOnly({
                                  size: order.sz,
                                  currentMarkPrice: order.px,
                                  token: pair,
                              }).toFixed(2)}
                    </div>
                    <div className="text-neutral-300 z-10 w-1/3 text-right">
                        {pair?.toUpperCase() === 'USD' ? Math.trunc(order.total) : order.total}
                    </div>
                </div>
            ))}
        </div>
    )
}

// Add this function to handle step grouping
const groupOrdersByStep = (orders: Order[], step: OrderStep): Order[] => {
    const groupedOrders = orders.reduce((acc: { [key: number]: Order }, order) => {
        const roundedPrice = Math.round(order.px / step) * step

        if (!acc[roundedPrice]) {
            acc[roundedPrice] = { ...order, px: roundedPrice }
        } else {
            acc[roundedPrice].sz += order.sz
            acc[roundedPrice].n += order.n
        }

        return acc
    }, {})

    return Object.values(groupedOrders)
}

const OrderBookSkeleton = () => {
    return (
        <div className="flex flex-col gap-2 px-3">
            {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="flex justify-between text-sm relative animate-pulse gap-2">
                    <div className="h-[1rem] w-1/3 bg-border rounded"></div>
                    <div className="h-[1rem] w-1/3 bg-border rounded"></div>
                    <div className="h-[1rem] w-1/3 bg-border rounded"></div>
                </div>
            ))}
        </div>
    )
}

// Add this function to calculate dynamic step sizes
const calculateDynamicSteps = (asks: Order[], bids: Order[]): number[] => {
    if (asks.length === 0 && bids.length === 0) return [0.01, 0.02, 0.05, 0.1, 0.5, 1]

    // Get the average price from the order book
    const avgPrice = asks[0]?.px || bids[0]?.px || 0

    // Calculate dynamic steps based on price magnitude
    if (avgPrice < 0.001) {
        return [0.000001, 0.000002, 0.000005, 0.00001, 0.0001, 0.001]
    } else if (avgPrice < 0.01) {
        return [0.00001, 0.00002, 0.00005, 0.0001, 0.001, 0.01]
    } else if (avgPrice < 0.1) {
        return [0.0001, 0.0002, 0.0005, 0.001, 0.01, 0.1]
    } else if (avgPrice < 1) {
        return [0.0001, 0.0002, 0.0005, 0.001, 0.01, 0.1]
    } else if (avgPrice < 10) {
        return [0.001, 0.002, 0.005, 0.01, 0.1, 1]
    } else if (avgPrice < 100) {
        return [0.01, 0.02, 0.05, 0.1, 1, 10]
    } else if (avgPrice < 1000) {
        return [0.1, 0.2, 0.5, 1, 10, 100]
    } else if (avgPrice < 10000) {
        return [1, 2, 5, 10, 100, 1000]
    } else {
        return [10, 20, 50, 100, 1000, 10000]
    }
}

const OrderBook = () => {
    const { bookData, loadingBookData } = useOrderBookTradesContext()
    const { tokenPairs, pair, setPair } = usePairTokensContext()
    const [spreadPercentage, setSpreadPercentage] = React.useState<number>(0)
    const [currentStep, setCurrentStep] = React.useState<OrderStep>(OrderStep.STEP_0_01)
    // Handle pair selection

    const getBookData = React.useCallback(() => {
        const limit = 10
        const groupedAsks = groupOrdersByStep(bookData.asks, currentStep)
        const groupedBids = groupOrdersByStep(bookData.bids, currentStep)

        const asks = groupedAsks.slice(0, limit).sort((a, b) => b.px - a.px)
        const bids = groupedBids.slice(0, limit).sort((a, b) => b.px - a.px)

        return { asks, bids }
    }, [bookData, currentStep])

    // Add step selector UI
    const renderStepSelector = () => {
        const { asks, bids } = getBookData()
        const dynamicSteps = calculateDynamicSteps(asks, bids)

        return (
            <select
                value={currentStep}
                onChange={e => setCurrentStep(Number(e.target.value) as OrderStep)}
                className="w-fit h-6 text-xs rounded-md px-1 focus:outline-none text-neutral-text bg-table-odd border focus:border-border border-border  focus:bg-neutral-900 cursor-pointer"
            >
                {dynamicSteps.map(step => (
                    <option className="bg-neutral-900" key={step} value={step}>
                        {step}
                    </option>
                ))}
            </select>
        )
    }

    // Custom select component
    const renderPairSelector = () => (
        <select
            value={pair}
            onChange={e => setPair(e.target.value)}
            className="w-fit h-6 text-xs rounded-md px-1 focus:outline-none text-neutral-text bg-table-odd border focus:border-border border-border  focus:bg-neutral-900 cursor-pointer"
        >
            {Array.isArray(tokenPairs) &&
                tokenPairs.map(tokenPair => (
                    <option key={tokenPair} value={tokenPair} className="bg-neutral-900">
                        {tokenPair}
                    </option>
                ))}
        </select>
    )

    // Update spread percentage when book data changes
    useEffect(() => {
        if (!loadingBookData) {
            const { asks, bids } = getBookData()
            if (asks.length > 0 && bids.length > 0) {
                setSpreadPercentage(calculateSpreadPercentage(asks, bids))
            }
        }
    }, [bookData, getBookData, loadingBookData])

    return (
        <div>
            {/* Add step selector above the existing price display */}
            <div className="flex justify-between items-center p-3 ">
                {renderStepSelector()}
                {renderPairSelector()}
            </div>

            {/* Column Headers */}
            <div className="flex justify-between mb-2 text-neutral-text-dark text-xs px-3">
                <div className="w-1/3">Price</div>
                <div className="w-1/3 text-center">Size ({pair})</div>
                <div className="w-1/3 text-right">Total ({pair})</div>
            </div>

            {/* Sell Orders (Red) */}

            {loadingBookData ? (
                <>
                    <OrderBookSkeleton />
                    <div className="flex justify-around py-1 bg-table-odd my-1 animate-pulse">
                        <div className="h-[1rem] w-1/3 bg-border rounded"></div>
                        <div className="h-[1rem] w-1/3 bg-border rounded"></div>
                        <div className="h-[1rem] w-1/3 bg-border rounded"></div>
                    </div>
                    <OrderBookSkeleton />
                </>
            ) : !loadingBookData && bookData.asks.length === 0 && bookData.bids.length === 0 ? (
                <div className="flex justify-center items-center h-full">No data Available for</div>
            ) : (
                <>
                    {renderOrderBookTable(getBookData().asks, 'asks', pair, true)}
                    {getBookData().asks.length !== 0 && getBookData().bids.length !== 0 && (
                        <div className="flex justify-between px-3 py-1 text-neutral-text bg-table-odd my-1">
                            <div>Spread</div>
                            <div>{spreadPercentage}</div>
                            <div>{spreadPercentage}%</div>
                        </div>
                    )}
                    {renderOrderBookTable(getBookData().bids, 'bids', pair, false)}
                </>
            )}
        </div>
    )
}

export default OrderBook
