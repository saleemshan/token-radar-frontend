'use client'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import { ChartingLibraryWidgetOptions, ResolutionString } from '@/public/static/charting_library/charting_library'

// Dynamically import the SimpleTVChartContainer to ensure it is only loaded on the client side
const SimpleTVChartContainer = dynamic(() => import('@/components/graph/MinimalHyperliquidTVChartContainer').then(mod => mod.default), {
    ssr: false,
})

interface HyperliquidChartProps {
    token: string
    interval?: ResolutionString
    containerHeight?: string
    className?: string
}

const MinimalHyperliquidChart: React.FC<HyperliquidChartProps> = ({ token, interval, containerHeight, className }) => {
    const [isScriptReady, setIsScriptReady] = useState(false)

    const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
        symbol: 'Binance:LTC/BTC',
        library_path: '/static/charting_library/',
        locale: 'en',
        // charts_storage_url: 'https://saveload.tradingview.com',
        // charts_storage_api_version: '1.1',
        interval: interval || ('1' as ResolutionString), //default 1 hour
        client_id: 'tradingview.com',
        user_id: 'public_user_id',
        fullscreen: false,
        autosize: true,
    }

    return (
        <div className={`relative w-full h-full ${className}`}>
            <Script
                src="/static/datafeeds/udf/dist/bundle.js"
                strategy="lazyOnload"
                onReady={() => {
                    setIsScriptReady(true)
                }}
            />
            {isScriptReady && (
                <SimpleTVChartContainer chartProps={defaultWidgetProps} token={token} isMobile={false} containerHeight={containerHeight} />
            )}
        </div>
    )
}

// Wrap the component with React.memo to memoize it
export default React.memo(MinimalHyperliquidChart)
