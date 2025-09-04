'use client'

import OrderBookTradesProvider from '@/context/OrderBookTradesContext'
import OrderHistoryProvider from '@/context/orderHistoryContext'
import { redirect } from 'next/navigation'

export default function TradeLayout({ children }: { children: React.ReactNode }) {
    if (process.env.NEXT_PUBLIC_ENABLE_PERPS !== 'true') {
        redirect('/')
    }
    return (
        <OrderBookTradesProvider>
            <OrderHistoryProvider>{children}</OrderHistoryProvider>
        </OrderBookTradesProvider>
    )
}
