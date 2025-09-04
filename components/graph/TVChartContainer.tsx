'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react'
import {
    ChartingLibraryFeatureset,
    ChartingLibraryWidgetOptions,
    CustomIndicator,
    // DatafeedConfiguration,
    IPineStudyResult,
    LanguageCode,
    LibraryPineStudy,
    RawStudyMetaInfoId,
    ResolutionString,
    StudyLinePlotPreferences,
    StudyPlotType,
    widget,
} from '@/public/static/charting_library'
// import { useUser } from '@/context/UserContext';
import DataFeed from '@/services/trading-view/datafeed'
import axios from 'axios'
import useTokenHoldersOvertimeData from '@/hooks/data/useTokenHoldersOvertimeData'
import useTokenMyPositionsData from '@/hooks/data/useTokenMyPositionsData'
import useTokenSocialData from '@/hooks/data/useTokenSocialData'
import useTokenData from '@/hooks/data/useTokenData'
// import TradingViewStatusIndicator from '../TradingViewStatusIndicator'
import { useSettingsContext } from '@/context/SettingsContext'
// import usePageFocus from '@/hooks/usePageFocus';
// import { CRUSH_RESOLUSION } from '@/services/trading-view/streaming';

export const TVChartContainer = ({
    chartProps,
    tokenAddress,
    chain,
    isMobile,
    walletAddress,
    containerHeight,
}: {
    chartProps: Partial<ChartingLibraryWidgetOptions>
    tokenAddress: string
    chain: string
    isMobile: boolean
    walletAddress: string
    containerHeight?: string
}) => {
    const { timezone } = useSettingsContext()
    const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>
    const [activeTimeFrame, setActiveTimeFrame] = useState('day')
    const [showPrice, setShowPrice] = useState(true)
    const [showHolders, setShowHolders] = useState(false)
    const [showSocialMentions, setShowSocialMentions] = useState(false)
    const [showAvgBuyPrice, setShowAvgBuyPrice] = useState(false)

    const { data: tokenData } = useTokenData(chain, tokenAddress)

    // const pageFocus = usePageFocus();
    const { data: tokenSocialMentionsData, isFetched: isTokenSocialMentionsDataFetched } = useTokenSocialData(
        tokenData?.symbol ?? '',
        activeTimeFrame
    )

    const { data: tokenHoldersOvertimeData, isFetched: isTokenHoldersOvertimeDataFetched } = useTokenHoldersOvertimeData(chain, tokenAddress)

    const [gotHoldersOvertimeData, setGotHoldersOvertimeData] = useState<undefined | boolean>(undefined)
    const [gotSocialMentionsData, setGotSocialMentionsData] = useState<undefined | boolean>(undefined)

    useEffect(() => {
        if (isTokenSocialMentionsDataFetched && isTokenHoldersOvertimeDataFetched) {
            if (!tokenSocialMentionsData || (tokenSocialMentionsData && Object.keys(tokenSocialMentionsData).length === 0)) {
                console.log('No social mentions')
                setGotSocialMentionsData(false)
            } else {
                console.log('Has social mentions')
                setGotSocialMentionsData(true)
            }
            if (!tokenHoldersOvertimeData || (tokenHoldersOvertimeData && Object.keys(tokenHoldersOvertimeData).length === 0)) {
                console.log('No holders overtime')
                setGotHoldersOvertimeData(false)
            } else {
                console.log('Has holders overtime')
                setGotHoldersOvertimeData(true)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTokenSocialMentionsDataFetched, isTokenHoldersOvertimeDataFetched, tokenSocialMentionsData, tokenHoldersOvertimeData])

    useEffect(() => {
        console.log('reinit')
        if (isTokenSocialMentionsDataFetched && isTokenHoldersOvertimeDataFetched) {
            initializeChart()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gotHoldersOvertimeData, gotSocialMentionsData])

    const { data: tokenMyPositionsData, isFetched: isTokenMyPositionsDataFetched } = useTokenMyPositionsData(chain, tokenAddress, walletAddress)

    // useEffect(() => {
    //   console.log({ tokenSocialMentionsData, tokenHoldersOvertimeData });
    // }, [tokenSocialMentionsData, tokenHoldersOvertimeData]);

    const initializeChart = () => {
        const dataFeed = new DataFeed(
            {},
            tokenAddress,
            tokenData?.symbol ?? '',
            chain as ChainId,
            chain === 'solana' ? 100000 : 1, //1 = eth
            showPrice,
            walletAddress
        )

        const disabledFeatures: ChartingLibraryFeatureset[] = []

        if (isMobile) {
            disabledFeatures.push('left_toolbar')
        }

        const getSavedData = () => {
            try {
                const saved = JSON.parse(localStorage.getItem('tradingViewLastState') as string)

                if (saved?.charts) {
                    saved.charts.forEach((chart: any) => {
                        if (chart?.timezone) {
                            chart.timezone = timezone
                        }
                    })
                }
                return saved
            } catch (e) {
                console.log('Error parsing saved data')
                return undefined
            }
        }

        const widgetOptions: ChartingLibraryWidgetOptions = {
            symbol: tokenAddress,
            datafeed: dataFeed,
            theme: 'dark',
            interval: chartProps.interval as ResolutionString,
            container: chartContainerRef.current,
            library_path: chartProps.library_path,
            locale: chartProps.locale as LanguageCode,
            disabled_features: [
                'display_legend_on_all_charts',
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
                'hide_left_toolbar_by_default',
                'save_chart_properties_to_local_storage',
                'countdown',
                // 'use_localstorage_for_settings',
                // 'timeframes_toolbar',
            ],
            charts_storage_url: chartProps.charts_storage_url,
            charts_storage_api_version: chartProps.charts_storage_api_version,
            client_id: chartProps.client_id,
            user_id: chartProps.user_id,
            fullscreen: chartProps.fullscreen,
            autosize: chartProps.autosize,
            saved_data: getSavedData(),

            // timezone: (timezone as Timezone) ?? 'Etc/UTC',
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

            custom_indicators_getter: (): Promise<CustomIndicator[]> => {
                return Promise.resolve<CustomIndicator[]>([
                    {
                        name: 'Holders Over Time',
                        metainfo: {
                            _metainfoVersion: 51,
                            id: 'HoldersOverTime@tv-basicstudies-1' as RawStudyMetaInfoId,
                            description: 'Holders Over Time',
                            shortDescription: 'Holders Over Time',
                            is_price_study: false,
                            isCustomIndicator: true,
                            format: {
                                type: 'price',
                                precision: 1,
                            },
                            plots: [{ id: 'plot_0', type: StudyPlotType.Line }],
                            defaults: {
                                styles: {
                                    plot_0: {
                                        linestyle: 0,
                                        visible: true,
                                        linewidth: 2,
                                        plottype: 2 as StudyLinePlotPreferences['plottype'],
                                        trackPrice: true,
                                        color: '#2563eb',
                                    },
                                },
                                inputs: {},
                            },
                            styles: {
                                plot_0: {
                                    title: 'Number of Holders',
                                    histogramBase: 0,
                                },
                            },
                            inputs: [],
                        },
                        constructor: function (this: LibraryPineStudy<IPineStudyResult>) {
                            this.init = async function (context, inputCallback) {
                                this._context = context
                                this._input = inputCallback
                                this.dataFetched = false
                                this.holdersMap = tokenHoldersOvertimeData
                                // await this.fetchData(); // Ensure this completes
                            }

                            this.fetchData = async function () {
                                try {
                                    const response = await axios.get(`/api/${chain}/tokens/${tokenAddress}/holders/overtime`)
                                    this.dataFetched = true
                                    this.holdersMap = response.data
                                    this.main(this._context, this._input)
                                } catch (error) {
                                    this.dataFetched = true
                                    console.error('Error fetching holders data:', error)
                                }
                            }

                            this.updateChartIfDataAvailable = function () {
                                if (!this.dataFetched) {
                                    setTimeout(() => {
                                        this.main(this._context, this._input) // Re-trigger chart update
                                    }, 3000) // Re-check every 3 second
                                }
                            }

                            this.main = function (context, inputCallback) {
                                this._context = context
                                this._input = inputCallback

                                if (!this.holdersMap) {
                                    console.warn('Data is not yet available')
                                    // this.updateChartIfDataAvailable();
                                    return [NaN]
                                }
                                const time = this._context.symbol.time
                                const value = this.holdersMap[time] ?? NaN
                                return [value]
                            }
                        },
                    },

                    {
                        name: 'Average Buy Price',
                        metainfo: {
                            _metainfoVersion: 51,
                            id: 'AverageBuyPrice@tv-basicstudies-1' as RawStudyMetaInfoId,
                            description: 'Average Buy Price',
                            shortDescription: 'Average Buy Price',
                            is_price_study: true,
                            isCustomIndicator: true,
                            format: {
                                type: 'price',
                                precision: 6,
                            },
                            plots: [{ id: 'plot_1', type: StudyPlotType.Line }],
                            defaults: {
                                styles: {
                                    plot_0: {
                                        linestyle: 0,
                                        visible: true,
                                        linewidth: 2,
                                        plottype: 2 as StudyLinePlotPreferences['plottype'],
                                        trackPrice: false,
                                        color: '#2862FF',
                                    },
                                },
                                inputs: {},
                            },
                            styles: {
                                plot_0: {
                                    title: 'Average Buy Price',
                                    histogramBase: 0,
                                },
                            },
                            inputs: [],
                        },
                        constructor: function (this: LibraryPineStudy<IPineStudyResult>) {
                            this.init = async function (context, inputCallback) {
                                this._context = context
                                this._input = inputCallback
                                this.avgBuyPrice = tokenMyPositionsData?.analytics?.bought_average_price ?? null
                            }

                            this.main = function (context, inputCallback) {
                                this._context = context
                                this._input = inputCallback

                                return [this.avgBuyPrice || NaN]
                            }
                        },
                    },
                    {
                        name: 'Social Mentions',
                        metainfo: {
                            _metainfoVersion: 51,
                            id: 'SocialMentions@tv-basicstudies-1' as RawStudyMetaInfoId,
                            description: 'Social Mentions',
                            shortDescription: 'Social Mentions',
                            is_price_study: false,
                            isCustomIndicator: true,
                            format: {
                                type: 'price',
                                precision: 1,
                            },
                            plots: [{ id: 'plot_0', type: StudyPlotType.Line }],
                            defaults: {
                                styles: {
                                    plot_0: {
                                        linestyle: 0,
                                        visible: true,
                                        linewidth: 2,
                                        plottype: 2 as StudyLinePlotPreferences['plottype'],
                                        trackPrice: false,
                                        color: '#2563eb',
                                    },
                                },
                                inputs: {},
                            },
                            styles: {
                                plot_0: {
                                    title: 'Number of Social Mentions',
                                    histogramBase: 0,
                                },
                            },
                            inputs: [],
                        },
                        constructor: function (this: LibraryPineStudy<IPineStudyResult>) {
                            this.init = async function (context, inputCallback) {
                                this._context = context
                                this._input = inputCallback

                                if (!tokenSocialMentionsData || !tokenSocialMentionsData.timeSeries) {
                                    console.warn('Token social mentions data is not available')
                                    this.socialMentionsMap = {}
                                    return
                                }

                                const timeSeriesObject: { [key: number]: number } = tokenSocialMentionsData.timeSeries.reduce(
                                    (acc: { [key: number]: number }, item) => {
                                        acc[item.ts] = item.mentions
                                        return acc
                                    },
                                    {}
                                )

                                this.socialMentionsMap = { ...timeSeriesObject }

                                // Determine the valid timeframe
                                this.validTimeRange = {
                                    start: Math.min(...Object.keys(this.socialMentionsMap).map(Number)),
                                    end: Math.max(...Object.keys(this.socialMentionsMap).map(Number)),
                                }

                                this.lastValidValue = undefined // Initialize last valid value
                            }

                            this.main = function (context, inputCallback) {
                                this._context = context
                                this._input = inputCallback

                                if (!this.socialMentionsMap) {
                                    console.warn('Data is not yet available')
                                    return [NaN]
                                }

                                const time = this._context.symbol.time

                                // Check if the current time is within the valid range
                                if (time < this.validTimeRange.start || time > this.validTimeRange.end) {
                                    return [NaN] // Outside valid range
                                }

                                let value = this.socialMentionsMap[time] ?? NaN

                                if (isNaN(value)) {
                                    // If value is NaN, use last valid value for interpolation
                                    value = this.lastValidValue !== undefined ? this.lastValidValue : NaN
                                } else {
                                    this.lastValidValue = value // Update last valid value
                                }

                                return [value]
                            }
                        },
                    },
                ])
            },
            custom_css_url: '/css/tradingview.css',
        }

        const tvWidget = new widget(widgetOptions)

        tvWidget.onChartReady(() => {
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
                                pane.sources = pane.sources.filter(
                                    (source: any) =>
                                        !(
                                            (source.type === 'Study' && source.metaInfo?.description === 'Holders Over Time') ||
                                            (source.type === 'Study' && source.metaInfo?.description === 'Social Mentions')
                                        )
                                )
                            })
                        })

                        localStorage.setItem('tradingViewLastState', JSON.stringify(chartEvent))
                    })
                } catch (e) {
                    console.log('Error saving chart state')
                }
            })

            tvWidget
                .chart()
                .onIntervalChanged()
                .subscribe(null, function (interval) {
                    if (interval === '1D') {
                        setActiveTimeFrame('day')
                    } else {
                        setActiveTimeFrame('hour')
                    }
                })

            const createButton = (title: string, onClick: () => void, className = ''): HTMLDivElement => {
                const button = document.createElement('div')
                button.innerHTML = title
                button.className = `apply-common-tooltip ${className}`
                button.title = title
                button.style.cssText = `background: #000;
        cursor: pointer;
        transition: background 0.3s ease;`
                button.onmouseover = () => {
                    button.style.color = '#dddddd'
                }
                button.onmouseout = () => {
                    button.style.color = '#656565'
                }

                button.addEventListener('click', () => {
                    onClick()
                })
                return button
            }

            const enableHoldersButton = window.location.href.includes('solana')

            if (showHolders && enableHoldersButton) {
                tvWidget.chart().createStudy('Holders Over Time', false, false)
            }

            if (showSocialMentions && gotSocialMentionsData) {
                tvWidget.chart().createStudy('Social Mentions', false, false)
            }

            tvWidget.headerReady().then(() => {
                const priceMarketCapContainer = document.createElement('div')
                priceMarketCapContainer.style.cssText = 'display: flex; align-items: center; gap:8px;'

                let toggleButtonLabel = ''

                if (isMobile) {
                    toggleButtonLabel = showPrice ? 'MCap' : 'Price'
                } else {
                    toggleButtonLabel = showPrice ? 'Swap to MCap' : 'Swap to Price'
                }

                const priceButton = createButton(toggleButtonLabel, () => {
                    if (!showPrice) {
                        setShowPrice(true)
                    } else {
                        setShowPrice(false)
                    }
                })
                // const marketCapButton = createButton('MCap', () => {
                //   if (showPrice) setShowPrice(false);
                // });

                priceMarketCapContainer.append(priceButton)
                // priceMarketCapContainer.append(marketCapButton);

                const priceMarketCapButton = tvWidget.createButton()
                priceMarketCapButton.append(priceMarketCapContainer)

                if (enableHoldersButton && gotHoldersOvertimeData) {
                    const holdersButton = tvWidget.createButton()
                    holdersButton.setAttribute('title', 'Click to show holders overtime')
                    holdersButton.classList.add('apply-common-tooltip')
                    holdersButton.addEventListener('click', () => {
                        if (!gotHoldersOvertimeData) return
                        setShowHolders(!showHolders)
                        const studies = tvWidget.chart().getAllStudies()

                        const targetStudies = studies.filter(study => study.name === 'Holders Over Time')

                        if (targetStudies && targetStudies.length > 0) {
                            targetStudies.forEach(study => {
                                tvWidget.chart().removeEntity(study.id)
                            })
                        } else {
                            tvWidget.chart().createStudy('Holders Over Time', false, false)
                        }
                    })
                    holdersButton.innerHTML = 'Holders'
                }

                if (gotSocialMentionsData) {
                    const socialMentionsButton = tvWidget.createButton()
                    socialMentionsButton.setAttribute('title', 'Click to show social mentions')

                    //init

                    socialMentionsButton.classList.add('apply-common-tooltip')
                    socialMentionsButton.addEventListener('click', () => {
                        if (!gotSocialMentionsData) return
                        const studies = tvWidget.chart().getAllStudies()

                        const targetStudies = studies.filter(study => study.name === 'Social Mentions')

                        if (targetStudies && targetStudies.length > 0) {
                            targetStudies.forEach(study => {
                                tvWidget.chart().removeEntity(study.id)
                            })
                            setShowSocialMentions(false)
                        } else {
                            tvWidget.chart().createStudy('Social Mentions', false, false)
                            setShowSocialMentions(true)
                        }
                    })

                    socialMentionsButton.innerHTML = 'Social Mentions'
                }

                const avgBuyPriceButton = tvWidget.createButton()
                avgBuyPriceButton.setAttribute('title', 'Click to show average buy price')
                avgBuyPriceButton.classList.add('apply-common-tooltip')
                avgBuyPriceButton.addEventListener('click', () => {
                    setShowAvgBuyPrice(!showAvgBuyPrice)
                    const studies = tvWidget.chart().getAllStudies()

                    const targetStudies = studies.filter(study => study.name === 'Average Buy Price')

                    if (targetStudies && targetStudies.length > 0) {
                        targetStudies.forEach(study => {
                            tvWidget.chart().removeEntity(study.id)
                        })
                    } else {
                        tvWidget.chart().createStudy('Average Buy Price', false, false)
                    }
                })
                avgBuyPriceButton.innerHTML = 'Average Buy Price'
            })
        })

        return () => {
            tvWidget.remove()
        }
    }

    useEffect(() => {
        initializeChart()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showPrice, walletAddress, timezone])

    useEffect(() => {
        if ((isTokenMyPositionsDataFetched && tokenMyPositionsData?.transactions?.length) ?? 0 > 0) {
            initializeChart()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTokenMyPositionsDataFetched, tokenMyPositionsData])

    useEffect(() => {
        // Define the event handler
        const handleCustomEvent = () => {
            console.log('Reinit chart')
            initializeChart()
        }

        // Add the event listener
        document.addEventListener('reInitializeChartEvent', handleCustomEvent as EventListener)

        // Return a cleanup function to remove the event listener
        return () => {
            document.removeEventListener('reInitializeChartEvent', handleCustomEvent as EventListener)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="w-full relative h-full min-h-full flex-1">
            <div
                ref={chartContainerRef}
                id="tv-chart-container"
                className={`w-full relative ${containerHeight ? containerHeight : 'min-h-[45vh] h-[45vh] md:min-h-[65vh] md:h-[65vh]'}`}
            ></div>
            {/* <TradingViewStatusIndicator className="flex md:hidden absolute top-2 right-2 z-[49]" /> */}
        </div>
    )
}
