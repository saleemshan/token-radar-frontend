import { formatCryptoPrice } from '@/utils/price'
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import HyperliquidSocketClient from './hyperliquid-streaming'
import { UserFill, WebData2 } from '@/types/hyperliquid'
import { CRUSH_RESOLUSION } from './streaming'
import { getDecimalPlacesAndScaleForHyperliquid } from './helpers'
import { Bar, IChartingLibraryWidget } from '@/public/static/charting_library/charting_library'
import { getMomentumBarText } from '@/utils/nrs'
import { NewsItem } from '@/types/newstrading'
import { isWithinTimeWindow, NRS_CONFIG } from '@/utils/nrs'

export default class HyperliquidDataFeed {
    private socket: HyperliquidSocketClient
    private lastBarsCache: Map<string, TradingView.Bar>
    private userAddress: string | null = null
    private showNewsMarks: boolean
    private showFillMarks: boolean
    private tokenPrecisionMap: Map<string, { pricescale: number; minmov: number }>
    private chart: IChartingLibraryWidget | null = null
    private tpslLines: Map<string, any> = new Map()
    private avgBuyLine: any = null

    constructor(userAddress: string, showNewsMarks = false, showFillMarks = false) {
        this.socket = new HyperliquidSocketClient(userAddress)
        this.lastBarsCache = new Map()
        this.userAddress = userAddress
        this.showNewsMarks = showNewsMarks
        this.showFillMarks = showFillMarks
        this.tokenPrecisionMap = new Map()
    }

    // Helper function to determine price scale from token price
    private async getPriceScaleForToken(symbolName: string): Promise<{ pricescale: number; minmov: number }> {
        // Check if we already have cached precision for this token
        if (this.tokenPrecisionMap.has(symbolName)) {
            return this.tokenPrecisionMap.get(symbolName)!
        }

        try {
            // Get recent price data to determine appropriate decimal places
            const response = await axios.post(`/api/hyperliquid/candle-snapshot`, {
                coin: symbolName,
                interval: '1m',
                startTime: Date.now() - 60 * 60 * 1000, // Last hour
                endTime: Date.now(),
            })

            const data = response?.data?.data

            if (!data || data.length === 0) {
                // Default precision if no data
                return { pricescale: 100, minmov: 1 }
            }

            // Get a sample price to determine precision
            const samplePrice = parseFloat(data[0].c.toString())
            const { scale } = getDecimalPlacesAndScaleForHyperliquid(samplePrice, 8)

            // Cache the result
            const result = { pricescale: scale, minmov: 1 }
            this.tokenPrecisionMap.set(symbolName, result)

            return result
        } catch (error) {
            console.error('Error determining price scale:', error)
            // Default to 2 decimal places if there's an error
            return { pricescale: 100, minmov: 1 }
        }
    }

    onReady(callback: TradingView.OnReadyCallback) {
        const configurationData: TradingView.DatafeedConfiguration = {
            supported_resolutions: ['1', '5', '15', '60', '240', '1D'] as TradingView.ResolutionString[],
            exchanges: [{ value: 'Crush', name: 'Crush', desc: 'Crush' }],
            symbols_types: [{ name: 'crypto', value: 'crypto' }],
            supports_marks: true,
            supports_timescale_marks: true,
        }
        setTimeout(() => callback(configurationData), 0)
    }

    async resolveSymbol(symbolName: string, onSymbolResolvedCallback: TradingView.ResolveCallback) {
        try {
            // Get price scale information for this token
            const { pricescale, minmov } = await this.getPriceScaleForToken(symbolName)

            const symbolInfo: Partial<TradingView.LibrarySymbolInfo> = {
                ticker: symbolName,
                name: symbolName,
                description: '',
                type: 'crypto',
                session: '24x7',
                timezone: 'Etc/UTC',
                exchange: 'Crush',
                minmov: minmov,
                pricescale: pricescale,
                has_intraday: true,
                has_daily: true,
                has_weekly_and_monthly: false,
                visible_plots_set: 'ohlcv',
                supported_resolutions: ['1', '5', '15', '60', '240', '1D'] as TradingView.ResolutionString[],
                volume_precision: 2,
                data_status: 'streaming',
            }

            onSymbolResolvedCallback(symbolInfo as TradingView.LibrarySymbolInfo)
        } catch (error) {
            console.error('Error resolving symbol:', error)
            // Fallback if there's an error
            const symbolInfo: Partial<TradingView.LibrarySymbolInfo> = {
                ticker: symbolName,
                name: symbolName,
                description: '',
                type: 'crypto',
                session: '24x7',
                timezone: 'Etc/UTC',
                exchange: 'Crush',
                minmov: 1,
                pricescale: 100, // Default 2 decimal places
                has_intraday: true,
                has_daily: true,
                has_weekly_and_monthly: false,
                visible_plots_set: 'ohlcv',
                supported_resolutions: ['1', '5', '15', '60', '240', '1D'] as TradingView.ResolutionString[],
                volume_precision: 2,
                data_status: 'streaming',
            }

            onSymbolResolvedCallback(symbolInfo as TradingView.LibrarySymbolInfo)
        }
    }

    async getBars(
        symbolInfo: TradingView.LibrarySymbolInfo,
        resolution: TradingView.ResolutionString,
        periodParams: TradingView.PeriodParams,
        onHistoryCallback: TradingView.HistoryCallback,
        onErrorCallback: TradingView.DatafeedErrorCallback
    ) {
        const { from, to } = periodParams
        try {
            let interval
            if (!isNaN(Number(resolution))) {
                interval = Number(resolution) >= 60 ? `${Number(resolution) / 60}h` : `${resolution}m`
            } else {
                interval = resolution
            }

            const response = await axios.post(`/api/hyperliquid/candle-snapshot`, {
                coin: symbolInfo.name,
                interval: interval.toLowerCase(),
                startTime: from * 1000,
                endTime: to * 1000,
            })

            const data = response?.data?.data

            if (!data || data.length === 0) {
                onHistoryCallback([], { noData: true })
                return
            }

            const bars: Bar[] = data.map((bar: any) => ({
                time: bar.t,
                low: parseFloat(bar.l.toString()),
                high: parseFloat(bar.h.toString()),
                open: parseFloat(bar.o.toString()),
                close: parseFloat(bar.c.toString()),
                volume: parseFloat(bar.v.toString()),
            }))

            onHistoryCallback(bars, { noData: false })
        } catch (error) {
            onErrorCallback(error as string)
        }
    }

    subscribeBars(
        symbolInfo: TradingView.LibrarySymbolInfo,
        resolution: TradingView.ResolutionString,
        onRealtimeCallback: TradingView.SubscribeBarsCallback,
        subscriberUID: string,
        onResetCacheNeededCallback: () => void
    ) {
        const subscriptionMessage = {
            type: 'candle',
            coin: symbolInfo.name,
            interval: CRUSH_RESOLUSION[resolution as keyof typeof CRUSH_RESOLUSION],
        }

        this.socket.subscribeOnStream(
            symbolInfo,
            resolution,
            onRealtimeCallback,
            subscriberUID,
            onResetCacheNeededCallback,
            this.lastBarsCache.get(symbolInfo.name),
            subscriptionMessage
        )
    }

    unsubscribeBars(subscriberUID: string) {
        this.socket.unsubscribeFromStream(subscriberUID)
    }

    setUserAddress(address: string) {
        this.userAddress = address
        this.socket.setUserAddress(address)
    }

    async getMarks(symbolInfo: TradingView.LibrarySymbolInfo, from: number, to: number, onDataCallback: (marks: TradingView.Mark[]) => void) {
        try {
            let marks: TradingView.Mark[] = []

            // Get user fill marks if user address is available and showFillMarks is true
            if (this.userAddress && this.showFillMarks) {
                const fillsResponse = await axios.post('/api/hyperliquid/user-fills', {
                    user: this.userAddress,
                    startTime: from * 1000,
                    endTime: to * 1000,
                    aggregateByTime: true,
                })

                const fills: UserFill[] = fillsResponse.data.data

                // Filter fills for the current symbol
                const relevantFills = fills.filter(fill => fill.coin.toLowerCase() === symbolInfo.name.toLowerCase())

                const fillMarks: TradingView.Mark[] = relevantFills.map((fill: UserFill) => ({
                    id: `fill_${fill.time}`,
                    time: Math.floor(fill.time / 1000),
                    color: fill.side === 'B' ? 'green' : 'red',
                    text: `${fill.dir} at ${formatCryptoPrice(fill.px)}`,
                    label: fill.side === 'B' ? 'B' : 'S',
                    labelFontColor: '#FFFFFF',
                    backgroundColor: '#1e222d',
                    minSize: 20,
                }))

                marks = [...fillMarks]
            }

            // Only fetch news marks if showNewsMarks is true
            if (this.showNewsMarks) {
                try {
                    const params = {
                        token: symbolInfo.name.toUpperCase(),
                    }

                    const newsResponse = await axios.get(`/api/news-trading/feed`, {
                        params,
                    })

                    if (newsResponse.data?.data?.news?.length > 0) {
                        // Get news marks with NRS indicators
                        const newsItems = newsResponse.data.data.news

                        // Process each news item to calculate NRS
                        const newsMarksPromises = newsItems.map(async (news: NewsItem) => {
                            // Get NRS data for each news item
                            const nrsMomentumData = news.latestIndicator?.[0]

                            // Get the right icon/label based on NRS data
                            const label = 'N'
                            const color = '#1E88E5'
                            const size = 20

                            // If NRS data exists, customize the mark
                            if (nrsMomentumData) {
                                // Fire icon for buy signal

                                // Create tooltip text with momentum bar visualization
                                const tooltipMomentumBar = this.getMomentumBarText(nrsMomentumData.momentum.vwpd)

                                // Split signal into display part (before parentheses or dash) and tooltip explanation
                                const displaySignal = nrsMomentumData.nrs.description

                                // Check if within valid time windows
                                const newsTime = new Date(news.publishTime).getTime()
                                const isNrsValid = isWithinTimeWindow(newsTime, NRS_CONFIG.NRS_MAX_TIME_MS)
                                const isMomentumValid = isWithinTimeWindow(newsTime, NRS_CONFIG.MOMENTUM_MAX_TIME_MS)

                                // Only show NRS and momentum for positive sentiment with medium/high impact
                                const hasPositiveSentiment =
                                    news.sentimentDirection === 'Bullish' &&
                                    (news.sentimentMomentum === 'Medium' || news.sentimentMomentum === 'High')

                                // Only show momentum if NRS is high conviction (buy) or sustained move (watch)
                                const isNrsActionRelevant = nrsMomentumData.nrs.action === 'buy' || nrsMomentumData.nrs.action === 'watch'

                                // Build tooltip text array based on validity and sentiment
                                const tooltipText = [news.headline]
                                if (isNrsValid && hasPositiveSentiment) {
                                    tooltipText.push(
                                        ' NRS: ' +
                                            (nrsMomentumData.nrs.action === 'buy' ? ' 🔥 ' : '') +
                                            nrsMomentumData.nrs.emoji +
                                            ' ' +
                                            displaySignal
                                    )
                                }
                                if (isMomentumValid && hasPositiveSentiment && isNrsActionRelevant) {
                                    tooltipText.push(' Momentum: ' + tooltipMomentumBar)
                                }

                                return {
                                    id: `news_${news.id}`,
                                    time: this.alignTimestampToCandle(new Date(news?.publishTime).getTime()),
                                    color: color,
                                    text: tooltipText,
                                    label: label,
                                    labelFontColor: '#FFFFFF',
                                    imageUrl: `/api/hyperliquid/coin-image?coin=${symbolInfo.name}`,
                                    minSize: size,
                                }
                            } else {
                                // Default news mark without NRS data
                                return {
                                    id: `news_${news.id}`,
                                    time: this.alignTimestampToCandle(new Date(news?.publishTime).getTime()),
                                    color: '#1E88E5',
                                    text: news.headline,
                                    label: 'N',
                                    imageUrl: `/api/hyperliquid/coin-image?coin=${symbolInfo.name}`,
                                    labelFontColor: '#FFFFFF',
                                    minSize: 20,
                                }
                            }
                        })

                        const newsMarks = await Promise.all(newsMarksPromises)
                        marks = [...marks, ...newsMarks]
                    }
                } catch (newsError) {
                    console.error('Error fetching news for chart marks:', newsError)
                }
            }

            if (this.showFillMarks) {
                this.socket.setUserFillsCallback(fills => {
                    onDataCallback(
                        fills
                            ?.filter(fill => fill.coin.toLowerCase() === symbolInfo.name.toLowerCase())
                            .map(fill => ({
                                id: `fill_${fill.time}`,
                                time: this.alignTimestampToCandle(fill.time),
                                color: fill.side === 'B' ? 'green' : 'red',
                                text: `${fill.dir} at ${formatCryptoPrice(fill.px)}`,
                                label: fill.side === 'B' ? 'B' : 'S',
                                labelFontColor: '#FFFFFF',
                                backgroundColor: '#1e222d',
                                minSize: 20,
                            }))
                    )
                })
            }

            onDataCallback(marks)
        } catch (error) {
            console.error('Error fetching chart marks:', error)
            onDataCallback([])
        }
    }

    // Get momentum bar text for tooltip - use the utility function
    private getMomentumBarText(vwpdDecay: number): string {
        return getMomentumBarText(vwpdDecay)
    }

    // Calculate average buying price from user fills
    private async calculateAverageBuyingPrice(symbolName: string): Promise<number | null> {
        if (!this.userAddress) return null

        try {
            // Fetch all user fills for this symbol (without time restriction for better avg calculation)
            const fillsResponse = await axios.post('/api/hyperliquid/user-fills', {
                user: this.userAddress,
                startTime: 0, // Get all fills ever for better average
                endTime: Date.now(),
                aggregateByTime: false,
            })

            const fills: UserFill[] = fillsResponse.data.data

            // Filter for buy fills of the current symbol
            const buyFills = fills.filter(fill => fill.coin.toLowerCase() === symbolName.toLowerCase() && fill.side === 'B')

            console.log(buyFills, 'buy fills')
            if (buyFills.length === 0) return null

            // Calculate weighted average price
            let totalValue = 0
            let totalSize = 0

            buyFills.forEach(fill => {
                const price = parseFloat(fill.px)
                const size = parseFloat(fill.sz)
                totalValue += price * size
                totalSize += size
            })

            return totalSize > 0 ? totalValue / totalSize : null
        } catch (error) {
            console.error('Error calculating average buying price:', error)
            return null
        }
    }

    // Helper method to ensure timestamp aligns with the correct candle boundary
    private alignTimestampToCandle(timestamp: number): number {
        // For one-minute candles, we need to make sure the timestamp lands on the
        // correct minute boundary

        // Convert timestamp to seconds if it's in milliseconds
        const timestampInSeconds = timestamp > 9999999999 ? Math.floor(timestamp / 1000) : timestamp

        // To fix the issue of marks appearing one minute after publish time,
        // we adjust by forcing alignment to the minute boundary
        const date = new Date(timestampInSeconds * 1000)

        // Create a timestamp for the start of the minute this event occurred in
        // This ensures the mark appears on the candle where the event actually happened
        const minuteStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()).getTime() / 1000

        return Math.floor(minuteStart)
    }

    // Method to set chart reference
    public setChartWidget(chart: IChartingLibraryWidget) {
        this.chart = chart
        // Initialize the TP/SL lines once the chart is ready
        chart.onChartReady(() => {
            this.updateTPSLLines()
        })
    }

    // Method to update TP/SL lines and average buying line
    public updateTPSLLines(forceClear: boolean = false) {
        if (!this.chart || !this.chart.activeChart) return

        try {
            // Get current symbol
            const symbol = this.chart.activeChart().symbol()

            // Force clear all lines if requested (first render)
            if (forceClear) {
                try {
                    // Get all shapes from the chart
                    const allShapes = this.chart.activeChart().getAllShapes()

                    // Filter TP/SL and average buying horizontal lines
                    const tpslLines = allShapes?.filter((line: any) => {
                        return (
                            line.name === 'horizontal_line' &&
                            line.text &&
                            (line.text.includes('TP') || line.text.includes('SL') || line.text.includes('Avg Buy'))
                        )
                    })

                    // Remove all TP/SL and average buying lines
                    tpslLines.forEach(line => {
                        try {
                            this.chart?.activeChart()?.removeEntity(line.id)
                        } catch (e) {
                            console.error('Error removing line:', e)
                        }
                    })

                    // Clear our tracking map and average buying line reference
                    this.tpslLines.clear()
                    this.avgBuyLine = null
                } catch (e) {
                    console.error('Error clearing TP/SL lines:', e)
                }
            }

            // Access window.webData2 (which is updated by your websocket)
            const webData: WebData2 = (window as any).webData2
            if (!webData) return

            // Filter orders for current symbol and TP/SL types
            const tpslOrders =
                webData.openOrders?.filter(
                    (order: any) => order.coin === symbol && (order.orderType === 'Take Profit Market' || order.orderType === 'Stop Market')
                ) || []

            // Generate current order IDs from current orders
            const currentOrderIds = tpslOrders.map(order => order.oid)

            // Get existing line IDs from our tracking map
            const existingLineIds = Array.from(this.tpslLines.keys())

            // Clear and redraw all lines if we have a mismatch in counts
            // This ensures we don't have stale lines when orders change
            if (currentOrderIds.length !== existingLineIds.length) {
                // Remove all existing lines from chart
                existingLineIds.forEach(lineId => {
                    try {
                        const line = this.tpslLines.get(lineId)
                        if (line && this.chart) {
                            this.chart.activeChart().removeEntity(line)
                            this.tpslLines.delete(lineId)
                        }
                    } catch (error) {
                        console.error(`Error removing line ${lineId}:`, error)
                    }
                })

                // Clear the tracking map
                this.tpslLines.clear()
            } else {
                // If counts match, just remove lines that no longer have correspondin  g orders
                existingLineIds.forEach(lineId => {
                    if (!currentOrderIds.includes(lineId as unknown as number)) {
                        try {
                            // Line exists but order doesn't - remove it
                            const line = this.tpslLines.get(lineId)
                            if (line && this.chart) {
                                this.chart.activeChart().removeEntity(line)
                                this.tpslLines.delete(lineId)
                            }
                        } catch (error) {
                            console.error(`Error removing line ${lineId}:`, error)
                        }
                    }
                })
            }

            // Create lines for each order that doesn't already have a line
            tpslOrders.forEach((order: any) => {
                const isTP = order.orderType === 'Take Profit Market'
                const price = parseFloat(order.triggerPx)
                const lineColor = isTP ? '#22ab94' : '#ff6b81' // Green for TP, light red for SL
                const lineText = isTP ? 'TP' : 'SL'

                // Create a unique ID for this line
                const lineId = order.oid

                // Skip if line already exists for this order
                if (this.tpslLines.has(lineId)) {
                    return
                }

                try {
                    // Get current visible range
                    const visibleRange = this.chart?.activeChart()?.getVisibleRange()
                    if (!visibleRange) return

                    // Create the line using the correct API
                    const line = this.chart?.activeChart()?.createShape(
                        { price, time: visibleRange.from },
                        {
                            ownerStudyId: order.oid,
                            shape: 'horizontal_line',
                            disableSelection: true, // Prevent selection
                            disableSave: true, // Prevent saving
                            lock: true, // Lock position
                            showInObjectsTree: false, // Hide from objects tree
                            zOrder: 'top',
                            overrides: {
                                linecolor: lineColor,
                                linestyle: 2, // 0-solid, 1-dotted, 2-dashed
                                linewidth: 1,
                                showPrice: true,
                                text: `${lineText} ${formatCryptoPrice(price)}`,
                                textcolor: lineColor,
                                fontsize: 12,
                                showLabel: true,
                                horzLabelsAlign: 'right',
                                vertLabelsAlign: 'middle',
                            },
                        }
                    )

                    if (line) {
                        // Store the reference in the map with the unique ID
                        this.tpslLines.set(lineId, line)
                    }
                } catch (error) {
                    console.error(`Error creating line for ${lineId}:`, error)
                }
            })

            // Handle average buying price line
            this.updateAverageBuyingLine(symbol, forceClear)
        } catch (error) {
            console.error('Error updating TP/SL lines:', error)
        }
    }

    // Method to update average buying price line
    private async updateAverageBuyingLine(symbol: string, forceClear: boolean = false) {
        if (!this.chart || !this.chart.activeChart) return

        try {
            // Force clear the average buying line if requested
            if (forceClear && this.avgBuyLine) {
                try {
                    this.chart.activeChart().removeEntity(this.avgBuyLine)
                } catch (e) {
                    console.error('Error removing average buying line:', e)
                }
                this.avgBuyLine = null
            }

            // Calculate average buying price for current symbol
            const avgPrice = await this.calculateAverageBuyingPrice(symbol)

            // Remove existing line if no average price or if we need to update
            if (this.avgBuyLine) {
                try {
                    this.chart.activeChart().removeEntity(this.avgBuyLine)
                } catch (e) {
                    console.error('Error removing existing average buying line:', e)
                }
                this.avgBuyLine = null
            }

            // Create new line if we have an average price
            if (avgPrice && avgPrice > 0) {
                try {
                    // Get current visible range
                    const visibleRange = this.chart.activeChart().getVisibleRange()
                    if (!visibleRange) return

                    // Create the average buying price line
                    const line = this.chart.activeChart().createShape(
                        { price: avgPrice, time: visibleRange.from },
                        {
                            shape: 'horizontal_line',
                            disableSelection: true,
                            disableSave: true,
                            lock: true,
                            showInObjectsTree: false,
                            zOrder: 'top',
                            overrides: {
                                linecolor: '#FFB800', // Gold/orange color for average buy line
                                linestyle: 1, // Dotted line style
                                linewidth: 2,
                                showPrice: true,
                                text: `Avg Buy ${formatCryptoPrice(avgPrice)}`,
                                textcolor: '#FFB800',
                                fontsize: 12,
                                showLabel: true,
                                horzLabelsAlign: 'left',
                                vertLabelsAlign: 'middle',
                            },
                        }
                    )

                    if (line) {
                        this.avgBuyLine = line
                    }
                } catch (error) {
                    console.error('Error creating average buying line:', error)
                }
            }
        } catch (error) {
            console.error('Error updating average buying line:', error)
        }
    }
}
