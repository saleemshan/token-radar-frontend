/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useCallback } from 'react'

import { ChartingLibraryFeatureset, ChartingLibraryWidgetOptions, IBasicDataFeed, ResolutionString, widget } from '@/public/static/charting_library'
import HyperliquidDataFeed from '@/services/trading-view/hyperliquid-datafeed'
import { useUser } from '@/context/UserContext'
import { useSettingsContext } from '@/context/SettingsContext'
import { useWebDataContext } from '@/context/webDataContext'

// Simple debounce function
const debounce = (fn: (...args: any[]) => void, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>
    return (...args: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), ms)
    }
}

// Function to filter out TP/SL lines from saved chart data
const filterTPSLLinesFromSavedData = (savedData: any) => {
    if (!savedData || !savedData.charts) return savedData

    try {
        const filtered = { ...savedData }

        filtered.charts = filtered.charts.map((chart: any) => {
            const newChart = { ...chart }

            // Filter shapes that match our TP/SL lines
            if (newChart.panes) {
                newChart.panes = newChart.panes.map((pane: any) => {
                    const newPane = { ...pane }

                    if (newPane.sources) {
                        newPane.sources = newPane.sources.filter((source: any) => {
                            // Filter out TP/SL and average buying horizontal lines
                            if (
                                source.type === 'LineToolHorzLine' &&
                                (source.state?.text?.includes('TP') || source.state?.text?.includes('SL') || source.state?.text?.includes('Avg Buy'))
                            ) {
                                return false
                            }
                            return true
                        })
                    }

                    return newPane
                })
            }

            return newChart
        })

        return filtered
    } catch (e) {
        console.error('Error filtering TP/SL lines from saved data:', e)
        return savedData
    }
}

interface HyperliquidTVChartContainerProps {
    chartProps: Partial<ChartingLibraryWidgetOptions>
    isMobile?: boolean
    containerHeight?: string
    showNewsMarks?: boolean
    showFillMarks?: boolean
    token: string
}

const HyperliquidTVChartContainer: React.FC<HyperliquidTVChartContainerProps> = ({
    chartProps,
    isMobile,
    containerHeight,
    showNewsMarks,
    showFillMarks = true,
    token,
}) => {
    const { timezone } = useSettingsContext()
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const datafeedRef = useRef<HyperliquidDataFeed | null>(null)
    const chartInstanceRef = useRef<any>(null)
    const prevOrdersRef = useRef<string>('')
    const isFirstRenderRef = useRef<boolean>(true)

    const { userPublicWalletAddresses } = useUser()
    const userAddress = userPublicWalletAddresses['ethereum']
    const { webData2 } = useWebDataContext()

    // Create a debounced update function
    const debouncedUpdateTPSLLines = useCallback(
        debounce(() => {
            if (datafeedRef.current && chartInstanceRef.current) {
                datafeedRef.current.updateTPSLLines(isFirstRenderRef.current)
                if (isFirstRenderRef.current) {
                    isFirstRenderRef.current = false
                }
            }
        }, 250),
        []
    )

    const getSavedData = useCallback(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('hyperliquidTradingViewLastState') as string)

            // Filter out TP/SL lines
            const filteredSaved = filterTPSLLinesFromSavedData(saved)

            if (filteredSaved?.charts) {
                filteredSaved.charts.forEach((chart: any) => {
                    if (chart?.timezone) {
                        chart.timezone = timezone
                    }
                })
            }
            return filteredSaved
        } catch (e) {
            console.log('Error parsing saved data')
            return undefined
        }
    }, [timezone])

    // Create a reusable function for initializing the chart
    const initializeChart = useCallback(() => {
        if (!chartContainerRef.current) return

        // Cleanup the existing chart if needed
        if (chartInstanceRef.current) {
            chartInstanceRef.current.remove()
        }

        const disabledFeatures: ChartingLibraryFeatureset[] = []

        if (isMobile) {
            disabledFeatures.push('left_toolbar')
        }

        const datafeed = new HyperliquidDataFeed(userAddress, showNewsMarks, showFillMarks)
        datafeedRef.current = datafeed

        // Set first render flag to true at each mount
        isFirstRenderRef.current = true

        const widgetOptions: ChartingLibraryWidgetOptions = {
            symbol: token || 'BTCUSD',
            theme: 'dark',
            datafeed: datafeed as unknown as IBasicDataFeed,
            interval: chartProps.interval as ResolutionString,
            container: chartContainerRef.current!,
            library_path: chartProps.library_path || '/static/charting_library/',
            locale: chartProps.locale || 'en',
            fullscreen: chartProps.fullscreen || false,
            autosize: chartProps.autosize || true,
            disabled_features: [
                'symbol_search_hot_key',
                'header_quick_search',
                'header_symbol_search',
                'compare_symbol_search_spread_operators',
                'studies_symbol_search_spread_operators',
                'allow_arbitrary_symbol_search_input',
                'header_compare',
                'popup_hints',
                'header_symbol_search',
                'header_quick_search',
                'header_fullscreen_button',
                'header_saveload',
                'header_settings',
                'header_undo_redo',
                'header_screenshot',
                'border_around_the_chart',
                'control_bar',
                'display_legend_on_all_charts',
                'display_market_status',
                'property_pages',
                'show_chart_property_page',
                'snapshot_trading_drawings',
                'source_selection_markers',
                'study_symbol_ticker_description',
                'auto_enable_symbol_labels',
                'symbol_info',
                //'timeframes_toolbar', // Disables the timeframe buttons
                'timezone_menu', // Disables the timezone dropdown
                'legend_context_menu', // Disables right-click context menus for legends
                'go_to_date', // Disables "go to date" option
                'context_menus', // Disables context menus
                'control_bar',
                // 'header_indicators',
                // 'header_resolutions',
                // 'header_chart_type',
                'use_localstorage_for_settings',
                ...disabledFeatures,
            ],
            enabled_features: [
                'countdown',
                'countdown',
                'save_chart_properties_to_local_storage',
                'header_resolutions',
                // 'use_localstorage_for_settings',
                // 'timeframes_toolbar',
            ],
            charts_storage_url: chartProps.charts_storage_url,
            charts_storage_api_version: chartProps.charts_storage_api_version,
            client_id: chartProps.client_id,
            user_id: chartProps.user_id,
            saved_data: getSavedData(),
            loading_screen: {
                backgroundColor: '#000000',
                foregroundColor: '#2F2F2F',
            },
            time_frames: [
                {
                    text: '1m',
                    resolution: '1' as ResolutionString,
                    description: '1 Minute',
                },
                {
                    text: '5m',
                    resolution: '5' as ResolutionString,
                    description: '5 Minutes',
                },
                {
                    text: '15m',
                    resolution: '15' as ResolutionString,
                    description: '15 Minutes',
                },
                {
                    text: '1h',
                    resolution: '60' as ResolutionString,
                    description: '1 Hour',
                },
                {
                    text: '4h',
                    resolution: '240' as ResolutionString,
                    description: '4 Hours',
                },
                {
                    text: '1D',
                    resolution: '1D' as ResolutionString,
                    description: '1 Day',
                },
            ],
            toolbar_bg: '#000000',
            overrides: {
                // Set the default chart type to 'Line' with markers
                'mainSeriesProperties.style': 1,
                'mainSeriesProperties.lineStyle.color': '#2862FF', // Line color
                'mainSeriesProperties.lineStyle.linewidth': 2, // Line width
                'mainSeriesProperties.priceLineVisible': true,
                'paneProperties.legendProperties.showStudyTitles': true,
                'paneProperties.legendProperties.showStudyValues': false,
                'paneProperties.legendProperties.showSeriesTitle': false, //ticker and interval
                'paneProperties.legendProperties.showSeriesOHLC': false,
                'paneProperties.background': '#000000',
                'paneProperties.backgroundType': 'solid',
                'paneProperties.separatorColor': '#2F2F2F',
                'paneProperties.vertGridProperties.color': '#141414',
                'paneProperties.horzGridProperties.color': '#141414',
                'paneProperties.legendProperties.showVolume': true,
                'mainSeriesProperties.statusViewStyle.showExchange': false,
                'paneProperties.crossHairProperties.color': '#2F2F2F',
                'scalesProperties.lineColor': '#2F2F2F',
                'scalesProperties.textColor': '#dddddd',
                'mainSeriesProperties.candleStyle.upColor': '#80FF6C',
                'mainSeriesProperties.barStyle.upColor': '#80FF6C',
                'mainSeriesProperties.candleStyle.downColor': '#FF1850',
                'mainSeriesProperties.barStyle.downColor': '#FF1850',
                'mainSeriesProperties.candleStyle.borderUpColor': '#80FF6C',
                'mainSeriesProperties.candleStyle.borderDownColor': '#FF1850',
                'mainSeriesProperties.candleStyle.wickUpColor': '#80FF6C',
                'mainSeriesProperties.candleStyle.wickDownColor': '#FF1850',
                'mainSeriesProperties.areaStyle.color1': '#80FF6C',
                'mainSeriesProperties.areaStyle.color2': '#FF1850',
                'mainSeriesProperties.areaStyle.linecolor': '#80FF6C',
                'mainSeriesProperties.areaStyle.linewidth': 2,
                'mainSeriesProperties.hollowCandleStyle.upColor': '#80FF6C',
                'mainSeriesProperties.hollowCandleStyle.downColor': '#FF1850',
                'mainSeriesProperties.hollowCandleStyle.borderUpColor': '#80FF6C',
                'mainSeriesProperties.hollowCandleStyle.borderDownColor': '#FF1850',
                'mainSeriesProperties.hollowCandleStyle.wickUpColor': '#80FF6C',
                'mainSeriesProperties.hollowCandleStyle.wickDownColor': '#FF1850',
                'mainSeriesProperties.baselineStyle.topLineColor': '#80FF6C',
                'mainSeriesProperties.baselineStyle.bottomLineColor': '#FF1850',
                'mainSeriesProperties.baselineStyle.topFillColor1': '#80FF6C',
                'mainSeriesProperties.baselineStyle.bottomFillColor1': '#FF1850',
                'mainSeriesProperties.showCountdown': true,
                'timeScale.rightOffset': 5,
                'timeScale.barSpacing': 6,
                'timeScale.minBarSpacing': 4,
                'countdown.minutes.color': '#dddddd',
                'countdown.seconds.color': '#dddddd',
                'countdown.day.color': '#dddddd',
                'countdown.hour.color': '#dddddd',
                'countdown.minute.color': '#dddddd',
                'countdown.second.color': '#dddddd',
            },
            studies_overrides: {
                'volume.volumePanePlacement': 'NEW_PANE',
                'volume.color.0': '#26A69A', // Color for bullish volume
                'volume.color.1': '#EF5350', // Color for bearish volume
            },
            custom_css_url: '/css/tradingview.css',
        }

        const tvWidget = new widget(widgetOptions)
        chartInstanceRef.current = tvWidget

        tvWidget.onChartReady(() => {
            // Set the chart instance to the datafeed
            datafeed.setChartWidget(tvWidget)

            //clean up
            const studies = tvWidget.chart().getAllStudies()

            const targetStudies = studies.filter(study => study.name === 'Holders Over Time' || study.name === 'Social Mentions')

            if (targetStudies && targetStudies.length > 0) {
                targetStudies.forEach(study => {
                    tvWidget.chart().removeEntity(study.id)
                })
            }

            tvWidget.subscribe('onAutoSaveNeeded', () => {
                try {
                    tvWidget.save(event => {
                        // eslint-disable-next-line prefer-const
                        let chartEvent: any = event

                        chartEvent.charts.forEach((chart: any) => {
                            // Iterate through each pane in the current chart
                            chart.panes.forEach((pane: any) => {
                                // Filter out sources where type is 'Study'
                                pane.sources = pane.sources.filter((source: any) => {
                                    if (
                                        (source.type === 'Study' && source.metaInfo?.description === 'Holders Over Time') ||
                                        (source.type === 'Study' && source.metaInfo?.description === 'Social Mentions')
                                    ) {
                                        return false
                                    }

                                    // Filter out TP/SL and average buying horizontal lines
                                    if (
                                        source.type === 'LineToolHorzLine' &&
                                        (source.state?.text?.includes('TP') ||
                                            source.state?.text?.includes('SL') ||
                                            source.state?.text?.includes('Avg Buy'))
                                    ) {
                                        return false
                                    }

                                    return true
                                })
                            })
                        })

                        localStorage.setItem('hyperliquidTradingViewLastState', JSON.stringify(chartEvent))
                    })
                } catch (e) {
                    console.log('Error saving chart state')
                }
            })
        })

        return tvWidget
    }, [
        chartProps.autosize,
        chartProps.charts_storage_api_version,
        chartProps.charts_storage_url,
        chartProps.client_id,
        chartProps.fullscreen,
        chartProps.interval,
        chartProps.library_path,
        chartProps.locale,
        chartProps.user_id,
        getSavedData,
        isMobile,
        showNewsMarks,
        showFillMarks,
        token,
        userAddress,
    ])

    // Update TPSL lines when orders change
    useEffect(() => {
        if (!webData2?.openOrders) return // Make webData2 available globally for datafeed
        ;(window as any).webData2 = webData2

        // Only update if orders have actually changed
        const ordersJson = JSON.stringify(webData2.openOrders)
        if (ordersJson !== prevOrdersRef.current) {
            prevOrdersRef.current = ordersJson
            debouncedUpdateTPSLLines()
        }
    }, [webData2?.openOrders, debouncedUpdateTPSLLines])

    // Update lines when chart symbol changes
    useEffect(() => {
        if (datafeedRef.current && chartInstanceRef.current) {
            debouncedUpdateTPSLLines()
        }
    }, [token, debouncedUpdateTPSLLines])

    useEffect(() => {
        // Initialize the chart
        const tvWidget = initializeChart()

        return () => {
            if (tvWidget) {
                tvWidget.remove()
            }
        }
    }, [initializeChart])

    useEffect(() => {
        // Define the event handler
        const handleCustomEvent = () => {
            initializeChart()
        }

        // Add the event listener
        document.addEventListener('reInitializeChartEvent', handleCustomEvent as EventListener)

        // Return a cleanup function to remove the event listener
        return () => {
            document.removeEventListener('reInitializeChartEvent', handleCustomEvent as EventListener)
        }
    }, [initializeChart])

    return (
        <div className="w-full relative h-full min-h-full flex-1">
            <div
                ref={chartContainerRef}
                className={` w-full relative ${containerHeight ? containerHeight : 'min-h-[45vh] h-[45vh] md:min-h-[65vh] md:h-[65vh]'}`}
            />
        </div>
    )
}

export default HyperliquidTVChartContainer
