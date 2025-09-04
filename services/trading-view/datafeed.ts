/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { getDecimalPlacesAndScale } from './helpers'
import SocketClient, { CRUSH_RESOLUSION } from './streaming'
import { DEVELOPER_ICON } from '@/utils/label'

const configurationData: TradingView.DatafeedConfiguration = {
    // Represents the resolutions for bars supported by your datafeed
    supported_resolutions: ['1', '5', '15', '60', '240', '1D'] as TradingView.ResolutionString[],

    // The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
    exchanges: [{ value: 'Crush', name: 'Crush', desc: 'Crush' }],
    // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
    symbols_types: [{ name: 'crypto', value: 'crypto' }],
    // marks
    supports_marks: true,
}

export interface DataFeedOptions {
    SymbolInfo?: TradingView.LibrarySymbolInfo
    DatafeedConfiguration?: TradingView.DatafeedConfiguration
    getBars?: TradingView.IDatafeedChartApi['getBars']
}

export default class DataFeed implements TradingView.IExternalDatafeed, TradingView.IDatafeedChartApi {
    private options: DataFeedOptions
    private tokenAddress: string
    private tokenPrice: number = 0
    private tokenSymbol: string
    private tokenMarketCap: number = 0
    private supply: number = 0
    private chain: ChainId
    private websocketId: number
    private lastBarsCache: Map<string, TradingView.Bar>
    private socket!: SocketClient
    private priceBars: TradingView.Bar[] = []
    private marketCapBars: TradingView.Bar[] = []
    private showPrice: boolean = true
    private pairCa: string | undefined
    private walletAddress: string
    private quoteToken: string = 'token1'

    constructor(
        options: DataFeedOptions,
        tokenAddress: string,
        tokenSymbol: string,
        chain: ChainId,
        websocketId: number,
        showPrice: boolean,
        walletAddress: string
    ) {
        this.options = options
        this.chain = chain
        this.tokenSymbol = tokenSymbol
        this.websocketId = websocketId
        this.tokenAddress = tokenAddress
        this.walletAddress = walletAddress
        this.lastBarsCache = new Map()
        if (!options) {
            this.options.DatafeedConfiguration = configurationData
        }
        this.showPrice = showPrice
    }
    public async onReady(callback: TradingView.OnReadyCallback) {
        if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('[onReady]: Method call')
        setTimeout(() => callback(configurationData))
        this.socket = new SocketClient()
    }

    public async searchSymbols() {
        if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('[searchSymbols]: Method call')
    }

    public async resolveSymbol(symbolName: string, onSymbolResolvedCallback: TradingView.ResolveCallback) {
        try {
            const res = await axios.get(`/api/${this.chain}/tokens/${this.tokenAddress}`)
            this.pairCa = res.data.data.pair_address

            this.tokenPrice = res.data.data.market_data.current_price?.usd
            this.tokenMarketCap = res.data.data.market_data?.market_cap?.usd

            this.supply = this.tokenMarketCap / this.tokenPrice
            this.quoteToken = res.data.data.quote_token

            // console.log('supply',this.tokenMarketCap/this.);
        } catch (error) {
            this.pairCa = ''
        }

        const price = this.tokenPrice ?? undefined
        const { scale } = getDecimalPlacesAndScale(price)
        const symbolInfo: Partial<TradingView.LibrarySymbolInfo> = {
            ticker: symbolName,
            name: symbolName,
            description: '',
            type: 'crypto',
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: 'Crush',
            minmov: 1, // here
            pricescale: this.showPrice ? scale : 1, //here
            has_intraday: true,
            has_daily: true,
            has_weekly_and_monthly: false,
            visible_plots_set: 'ohlcv',
            supported_resolutions: configurationData.supported_resolutions!,
            volume_precision: 2,
            data_status: 'streaming',
        }
        if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('[resolveSymbol]: Symbol resolved', symbolName)
        onSymbolResolvedCallback(symbolInfo as TradingView.LibrarySymbolInfo)
    }

    public async getBars(
        symbolInfo: TradingView.LibrarySymbolInfo,
        resolution: TradingView.ResolutionString,
        periodParams: TradingView.PeriodParams,
        onHistoryCallback: TradingView.HistoryCallback,
        onErrorCallback: TradingView.DatafeedErrorCallback
    ) {
        const { from, to, firstDataRequest } = periodParams

        if (!this.pairCa) {
            return
        }

        const urlParameters = {
            pairAddress: this.pairCa,
            interval: CRUSH_RESOLUSION[resolution as keyof typeof CRUSH_RESOLUSION],
            startTime: from,
            endTime: to,
            limit: 500,
            quoteToken: this.quoteToken,
            type: 'social_mentions', //holders_over_time
            token_name: this.tokenSymbol,
        }

        console.log('kline params', urlParameters)

        try {
            const response = await axios.get(`/api/${this.chain}/tokens/${this.tokenAddress}/datafeed`, {
                params: urlParameters,
            })

            const data = response.data.data

            console.log('kline data', data)

            if (!data || data.length <= 0) {
                // "noData" should be set if there is no data in the requested period
                onHistoryCallback([], { noData: true })
                return
            }

            const sampleBar = data[0]
            const result = getDecimalPlacesAndScale(sampleBar.close)

            let bars: {
                time: number
                low: any
                high: any
                open: any
                close: any
                volume: any
            }[] = []
            data.forEach((bar: KlineData) => {
                bars = [
                    ...bars,
                    {
                        time: bar.timestamp * 1000,
                        open: parseFloat(bar.open.toFixed(result.decimalPlaces)),
                        high: parseFloat(bar.high.toFixed(result.decimalPlaces)),
                        low: parseFloat(bar.low.toFixed(result.decimalPlaces)),
                        close: parseFloat(bar.close.toFixed(result.decimalPlaces)),
                        volume: parseFloat(bar.volume.toFixed(result.decimalPlaces)),
                    },
                ]
                // if (bar.timestamp >= from && bar.timestamp < to) {

                // }
            })

            if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log(`[getBars]: returned ${bars.length} bar(s)`)
            this.priceBars = bars
            this.marketCapBars = this.priceBars.map(bar => {
                return {
                    time: bar.time,
                    low: this.supply * bar.low,
                    high: this.supply * bar.high,
                    open: this.supply * bar.open,
                    close: this.supply * bar.close,
                    volume: bar.volume,
                }
            })

            //cache check for mcap or price
            if (firstDataRequest) {
                if (this.showPrice) {
                    this.lastBarsCache.set(this.tokenAddress, {
                        ...bars[bars.length - 1],
                    })
                } else {
                    this.lastBarsCache.set(this.tokenAddress, {
                        ...this.marketCapBars[this.marketCapBars.length - 1],
                    })
                }
            }

            if (this.showPrice) {
                onHistoryCallback(this.priceBars, { noData: false })
            } else {
                onHistoryCallback(this.marketCapBars, { noData: false })
            }
        } catch (error) {
            if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('[getBars]: Get error', error)
            onErrorCallback(error as string)
        }
    }

    public async subscribeBars(
        symbolInfo: TradingView.LibrarySymbolInfo,
        resolution: TradingView.ResolutionString,
        onRealtimeCallback: TradingView.SubscribeBarsCallback,
        subscriberUID: string,
        onResetCacheNeededCallback: () => void
    ) {
        if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID)
        // console.log('pair', this.pairCa);
        // console.log('address', this.tokenAddress);

        this.socket.subscribeOnStream(
            symbolInfo,
            resolution,
            onRealtimeCallback,
            subscriberUID,
            onResetCacheNeededCallback,
            this.lastBarsCache.get(this.tokenAddress),
            this.pairCa ?? '',
            this.tokenAddress,
            this.websocketId,
            this.showPrice,
            this.supply,
            this.chain,
            this.quoteToken
        )
    }

    public async unsubscribeBars(subscriberUID: string) {
        if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID)
        this.socket.unsubscribeFromStream(subscriberUID)
    }

    public async getMarks(symbolInfo: TradingView.LibrarySymbolInfo, from: number, to: number, onDataCallback: (marks: TradingView.Mark[]) => void) {
        if (!this.chain || !this.tokenAddress) {
            onDataCallback([])
            return
        }

        try {
            const marks: TradingView.Mark[] = []

            // Only fetch user positions if wallet address is present
            if (this.walletAddress) {
                const userPositionsRes = await axios.get(
                    `/api/${this.chain}/tokens/${this.tokenAddress}/my-positions?public_wallet_address=${this.walletAddress}`
                )

                if (userPositionsRes?.data?.data && Object.keys(userPositionsRes?.data?.data).length > 0) {
                    const fills: TokenMyPositions = userPositionsRes?.data?.data

                    const userMarks: TradingView.Mark[] = fills?.transactions
                        .filter(fill => fill.type === 'buy' || fill.type === 'sell')
                        .map(fill => ({
                            id: Math.floor(new Date(fill.executed_at).getTime() / 1000),
                            time: Math.floor(new Date(fill.executed_at).getTime() / 1000),
                            color: fill.type === 'buy' ? 'green' : 'red',
                            text: `${fill.type.toUpperCase()} at $${fill.price_usd}`,
                            label: fill.type === 'buy' ? 'B' : 'S',
                            labelFontColor: '#FFFFFF',
                            backgroundColor: '#1e222d',
                            minSize: 20,
                            imageUrl: fill.type === 'buy' ? '/images/labels/buy.svg' : '/images/labels/sell.svg',
                            showLabelWhenImageLoaded: false,
                            borderWidth: 1,
                            hoveredBorderWidth: 2,
                        }))

                    marks.push(...userMarks)
                }
            }

            // Fetch dev info
            const devInfoRes = await axios.get(`/api/${this.chain}/tokens/${this.tokenAddress}/insiders/dev-info`)

            // Process dev transactions
            if (devInfoRes.data.data && devInfoRes.data.data.transactions) {
                const devInfo: TokenDevInfo = devInfoRes.data.data

                const devMarks: TradingView.Mark[] = devInfo.transactions
                    .filter(transaction => transaction.type === 'buy' || transaction.type === 'sell')
                    .map(transaction => ({
                        id: Math.floor(new Date(transaction.executed_at).getTime() / 1000),
                        time: Math.floor(new Date(transaction.executed_at).getTime() / 1000),
                        color: transaction.type === 'buy' ? 'green' : 'red',
                        text: `DEV ${transaction.type.toUpperCase()} at $${transaction.price_usd}`,
                        label: transaction.type === 'buy' ? 'DB' : 'DS',
                        labelFontColor: '#FFFFFF',
                        backgroundColor: '#1e222d',
                        minSize: 20,
                        imageUrl: DEVELOPER_ICON,
                        showLabelWhenImageLoaded: false,
                        borderWidth: 1,
                        hoveredBorderWidth: 2,
                    }))

                marks.push(...devMarks)
            }

            // Fetch alpha feed data
            try {
                const alphaFeedRes = await axios.get(`/api/${this.chain}/alpha-feed?filter=${this.tokenAddress}`)

                if (alphaFeedRes.data.data && Array.isArray(alphaFeedRes.data.data)) {
                    const alphaFeedData = alphaFeedRes.data.data

                    console.log('alphaFeedData', alphaFeedData)

                    // Create marks from alpha feed data - filter to only include exact address matches
                    const alphaMarks: TradingView.Mark[] = alphaFeedData
                        .filter((item: SingleAlphaFeed) => item.address === this.tokenAddress)
                        .map((item: SingleAlphaFeed) => {
                            // Determine color based on sentiment
                            let color = '#FFCC00' // Default yellow for neutral
                            if (item.sentiment === 'positive') color = '#00FF00'
                            if (item.sentiment === 'negative') color = '#FF0000'

                            return {
                                id: item.id,
                                time: Math.floor(new Date(item.alphaFeedAt).getTime() / 1000),
                                color: color,
                                text: item.content,
                                label: 'A',
                                labelFontColor: '#FFFFFF',
                                backgroundColor: '#1e222d',
                                minSize: 20,
                                imageUrl: item.image?.icon || '/images/labels/alpha.svg',
                                showLabelWhenImageLoaded: false,
                                borderWidth: 1,
                                hoveredBorderWidth: 2,
                            }
                        })

                    marks.push(...alphaMarks)
                }
            } catch (error) {
                console.error('Error fetching alpha feed data:', error)
            }

            onDataCallback(marks)
        } catch (error) {
            console.error('Error fetching marks data:', error)
            onDataCallback([])
        }
    }
}
