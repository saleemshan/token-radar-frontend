'use client'

import NewsTradingProvider from '@/context/NewsTradingContext'
import { redirect } from 'next/navigation'

export default function NewsTradingLayout({ children }: { children: React.ReactNode }) {
    if (process.env.NEXT_PUBLIC_ENABLE_NEWS_TRADING !== 'true') {
        redirect('/')
    }

    return <NewsTradingProvider>{children}</NewsTradingProvider>
}
