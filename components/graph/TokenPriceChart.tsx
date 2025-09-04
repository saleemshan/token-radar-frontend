'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import Script from 'next/script'

import { ChartingLibraryWidgetOptions } from '@/public/static/charting_library/charting_library'
import { ResolutionString } from '@/public/static/charting_library/datafeed-api'

export const TVChartContainer = dynamic(() => import('@/components/graph/TVChartContainer').then(mod => mod.TVChartContainer), { ssr: false })

export default function TokenPriceChart({
    tokenAddress,
    chain,
    isMobile = false,
    walletAddress,
    containerHeight,
}: {
    tokenAddress: string
    chain: string
    isMobile?: boolean
    walletAddress: string
    containerHeight?: string
}) {
    const [isScriptReady, setIsScriptReady] = useState(false)

    const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
        symbol: 'Binance:LTC/BTC',
        library_path: '/static/charting_library/',
        locale: 'en',
        // charts_storage_url: 'https://saveload.tradingview.com',
        // charts_storage_api_version: '1.1',
        interval: '60' as ResolutionString, //default 1 hour
        client_id: 'tradingview.com',
        user_id: 'public_user_id',
        fullscreen: false,
        autosize: true,
    }
    return (
        <>
            <Script
                src="/static/datafeeds/udf/dist/bundle.js"
                strategy="lazyOnload"
                onReady={() => {
                    setIsScriptReady(true)
                }}
            />
            {isScriptReady && (
                <TVChartContainer
                    chartProps={defaultWidgetProps}
                    tokenAddress={tokenAddress}
                    chain={chain}
                    walletAddress={walletAddress}
                    isMobile={isMobile}
                    containerHeight={containerHeight}
                />
            )}
        </>
    )
}
