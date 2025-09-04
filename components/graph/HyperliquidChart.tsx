'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import { ChartingLibraryWidgetOptions, ResolutionString } from '@/public/static/charting_library/charting_library'
import ToggleButton from '@/components/ToggleButton'

// Dynamically import the SimpleTVChartContainer to ensure it is only loaded on the client side
const SimpleTVChartContainer = dynamic(() => import('@/components/graph/HyperliquidTVChartContainer').then(mod => mod.default), { ssr: false })

interface HyperliquidChartProps {
    token: string
    interval?: ResolutionString
    containerHeight?: string
    showNewsMarks?: boolean
}

const HyperliquidChart: React.FC<HyperliquidChartProps> = ({ token, interval, containerHeight, showNewsMarks = false }) => {
    const [isScriptReady, setIsScriptReady] = useState(false)
    const [showFillMarks, setShowFillMarks] = useState(true)
    const [scriptError, setScriptError] = useState(false)
    const [key, setKey] = useState(0)

    // Reset states when token changes
    useEffect(() => {
        setKey(prev => prev + 1)
    }, [token])

    const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
        symbol: 'Binance:LTC/BTC',
        library_path: '/static/charting_library/',
        locale: 'en',
        interval: interval || ('60' as ResolutionString),
        client_id: 'tradingview.com',
        user_id: 'public_user_id',
        fullscreen: false,
        autosize: true,
    }

    const handleScriptReady = () => {
        // Small delay to ensure script is fully loaded
        setTimeout(() => {
            setIsScriptReady(true)
            setScriptError(false)
        }, 100)
    }

    const handleScriptError = () => {
        console.error('Failed to load TradingView datafeed script')
        setScriptError(true)
        setIsScriptReady(false)
    }

    return (
        <div className="relative w-full h-full">
            <div className="absolute z-40 top-2 right-2 flex items-center justify-end gap-2 mb-2">
                <span className="text-xs">Trade History</span>
                <ToggleButton
                    isOn={showFillMarks}
                    onToggle={setShowFillMarks}
                    mainContainerClassName="!w-10 !min-w-10 !h-5"
                    toggleSwitchClassName="!w-3 !h-3"
                />
            </div>
            <Script
                key={key}
                src="/static/datafeeds/udf/dist/bundle.js"
                strategy="afterInteractive"
                onReady={handleScriptReady}
                onError={handleScriptError}
            />

            {isScriptReady && !scriptError && (
                <SimpleTVChartContainer
                    key={`chart-${key}`}
                    showNewsMarks={showNewsMarks}
                    showFillMarks={showFillMarks}
                    chartProps={defaultWidgetProps}
                    token={token}
                    isMobile={false}
                    containerHeight={containerHeight}
                />
            )}
        </div>
    )
}

export default React.memo(HyperliquidChart)
