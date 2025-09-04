import React, { useState } from 'react'
import Trades from './OrderBookTrades'
import OrderBook from './OrderBook'

const OrderBookAndTrades = () => {
    const [activeTab, setActiveTab] = useState(0)

    const tabs = [{ title: 'Order Book' }, { title: 'Trades' }]
    return (
        <div className="text-white w-full  h-full bg-black overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-border h-16 min-h-16 p-2">
                <div className="border border-border  w-full h-full rounded-lg p-1">
                    <div className="w-full grid grid-cols-2 gap-1 rounded-lg h-full">
                        {tabs.map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                className={`h-full text-xs w-full rounded-md font-semibold  ${
                                    activeTab === idx ? ' text-neutral-text  bg-neutral-900' : ' text-neutral-text-dark  '
                                }`}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {activeTab === 0 ? <OrderBook /> : <Trades />}
        </div>
    )
}

export default OrderBookAndTrades
