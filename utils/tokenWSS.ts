const CONFIG = {
    WS_URL: 'wss://stream.dev.xexlab.com/definedws',
    WS_PROTOCOLS: ['graphql-transport-ws'],
    TOKEN_URL: 'https://defined.ops.xexlab.com/defined/token',
    MAX_RECONNECT_ATTEMPTS: 3,
    RECONNECT_INTERVAL: 3000,
} as const

// Token management class
export class TokenManager {
    static async getToken(): Promise<string> {
        try {
            const response = await fetch(CONFIG.TOKEN_URL)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            return `Bearer ${data.token}`
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log(`Failed to get token: ${error.message}`)

            throw error
        }
    }
}

// WebSocket message generator
export class MessageFactory {
    static createConnectionInit(authToken: string) {
        return {
            type: 'connection_init',
            payload: {
                Authorization: authToken,
            },
        }
    }

    static subs_createUnconfirmedEvents() {
        return {
            id: '6651d217-5850-4fe5-b45e-fd4218da4414',
            type: 'subscribe',
            payload: {
                variables: {
                    id: 'EvNdx6zc2C6TRjjeQqNpP1uhyNUZJms7pv5GmMC713GQ:1399811149',
                    quoteToken: 'token1',
                },
                extensions: {},
                operationName: 'CreateUnconfirmedEvents',
                query: 'subscription CreateUnconfirmedEvents($id: String, $quoteToken: QuoteToken) {\n  onUnconfirmedEventsCreated(id: $id, quoteToken: $quoteToken) {\n    address\n    id\n    networkId\n    events {\n      address\n      eventType\n      id\n      blockHash\n      blockNumber\n      logIndex\n      supplementalIndex\n      transactionIndex\n      transactionHash\n      maker\n      quoteToken\n      timestamp\n      eventType\n      eventDisplayType\n      data {\n        ... on UnconfirmedLiquidityChangeEventData {\n          amount0\n          amount1\n          amount0Shifted\n          amount1Shifted\n          type\n          __typename\n        }\n        ... on UnconfirmedSwapEventData {\n          amountNonLiquidityToken\n          priceUsd\n          priceUsdTotal\n          priceBaseToken\n          priceBaseTokenTotal\n          type\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}',
            },
        }
    }

    static subs_createOnDetailedStatsUpdated(pairId: string) {
        return {
            id: 'e84d30ed-3f19-4c0c-b344-619902cb3dd8',
            type: 'subscribe',
            payload: {
                variables: {
                    pairId: pairId,
                    tokenOfInterest: 'token1',
                    statsType: 'FILTERED',
                },
                extensions: {},
                operationName: 'OnDetailedStatsUpdated',
                query: 'subscription OnDetailedStatsUpdated($pairId: String, $tokenOfInterest: TokenOfInterest, $statsType: TokenPairStatisticsType) {\n  onDetailedStatsUpdated(\n    pairId: $pairId\n    tokenOfInterest: $tokenOfInterest\n    statsType: $statsType\n  ) {\n    pairId\n    tokenOfInterest\n    statsType\n    stats_min5 {\n      ...WindowedDetailedStatsFields\n      __typename\n    }\n    stats_hour1 {\n      ...WindowedDetailedStatsFields\n      __typename\n    }\n    stats_hour4 {\n      ...WindowedDetailedStatsFields\n      __typename\n    }\n    stats_hour12 {\n      ...WindowedDetailedStatsFields\n      __typename\n    }\n    stats_day1 {\n      ...WindowedDetailedStatsFields\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment WindowedDetailedStatsFields on WindowedDetailedStats {\n  windowSize\n  timestamp\n  endTimestamp\n  buckets {\n    start\n    end\n    __typename\n  }\n  transactions {\n    ...DetailedStatsNumberMetricsFields\n    __typename\n  }\n  volume {\n    ...DetailedStatsStringMetricsFields\n    __typename\n  }\n  buys {\n    ...DetailedStatsNumberMetricsFields\n    __typename\n  }\n  sells {\n    ...DetailedStatsNumberMetricsFields\n    __typename\n  }\n  buyers {\n    ...DetailedStatsNumberMetricsFields\n    __typename\n  }\n  sellers {\n    ...DetailedStatsNumberMetricsFields\n    __typename\n  }\n  traders {\n    ...DetailedStatsNumberMetricsFields\n    __typename\n  }\n  buyVolume {\n    ...DetailedStatsStringMetricsFields\n    __typename\n  }\n  sellVolume {\n    ...DetailedStatsStringMetricsFields\n    __typename\n  }\n  __typename\n}\n\nfragment DetailedStatsNumberMetricsFields on DetailedStatsNumberMetrics {\n  change\n  currentValue\n  previousValue\n  buckets\n  __typename\n}\n\nfragment DetailedStatsStringMetricsFields on DetailedStatsStringMetrics {\n  change\n  currentValue\n  previousValue\n  buckets\n  __typename\n}',
            },
        }
    }

    static subs_createOnPairMetadataUpdated(pairId: string, quoteToken: string) {
        return {
            id: 'e84d30ed-3f19-4c0c-b344-619902cb3dd8',
            type: 'subscribe',
            payload: {
                variables: {
                    id: pairId,
                    quoteToken: quoteToken ?? 'token1',
                    statsType: 'FILTERED',
                },
                extensions: {},
                operationName: 'OnUpdatePairMetadata',
                query: 'subscription OnUpdatePairMetadata($id: String, $quoteToken: QuoteToken, $statsType: TokenPairStatisticsType) {\n  onPairMetadataUpdated(id: $id, quoteToken: $quoteToken, statsType: $statsType) {\n    exchangeId\n    id\n    liquidity\n    liquidityToken\n    nonLiquidityToken\n    pairAddress\n    price\n    priceChange5m\n    priceChange24\n    priceChange12\n    priceChange4\n    priceChange1\n    quoteToken\n    statsType\n    token0 {\n      networkId\n      decimals\n      name\n      pooled\n      price\n      symbol\n      address\n      labels {\n        type\n        subType\n        createdAt\n        __typename\n      }\n      __typename\n    }\n    token1 {\n      networkId\n      decimals\n      name\n      pooled\n      price\n      symbol\n      address\n      labels {\n        type\n        subType\n        createdAt\n        __typename\n      }\n      __typename\n    }\n    volume24\n    volume12\n    volume4\n    volume1\n    __typename\n  }\n}',
            },
        }
    }
}

// WebSocket management class
export class WebSocketManager {
    private ws: WebSocket | null = null
    private reconnectAttempts: number = 0
    private isIntentionalClose: boolean = false
    private authToken: string | null = null
    private isConnected: boolean = false
    private pairId: string | null = null
    private pair: string | null = null
    private chain: string | null = null

    constructor(pair: string, chain: string) {
        let chainId: number
        this.pair = pair
        this.chain = chain

        switch (chain) {
            case 'solana':
                chainId = 1399811149
                break
            case 'ethereum':
                chainId = 1
                break
            case 'base':
                chainId = 8453
                break
            case 'bsc':
                chainId = 56
                break

            default:
                chainId = 1
                break
        }

        this.pairId = `${pair}:${chainId}`
    }

    async connect(): Promise<void> {
        try {
            // console.log('Getting authentication token...');

            this.authToken = await TokenManager.getToken()

            if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('Initiating WebSocket connection...')

            const protocols = [...CONFIG.WS_PROTOCOLS]
            this.ws = new WebSocket(CONFIG.WS_URL, protocols)
            this.setupEventHandlers()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.log(`Connection error: ${error.message}`)
        }
    }

    private setupEventHandlers(): void {
        if (this.ws) {
            this.ws.onopen = this.handleOpen.bind(this)
            this.ws.onmessage = this.handleMessage.bind(this)
            this.ws.onerror = this.handleError.bind(this)
            this.ws.onclose = this.handleClose.bind(this)
        }
    }

    private handleOpen(): void {
        if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('WebSocket connection established')

        this.reconnectAttempts = 0
        this.isConnected = true

        const initMessage = MessageFactory.createConnectionInit(this.authToken!)
        this.sendMessage(initMessage)
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const message = JSON.parse(event.data)

            if (message.type === 'connection_ack') {
                if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('Connection acknowledgment received')
                this.subscribeDetailedStats()
            }

            if (message.type === 'next') {
                if (message.payload.data?.onDetailedStatsUpdated) {
                    // Handle detailed stats data
                    const output = {
                        '5m': extractTokenAnalytics(message.payload.data.onDetailedStatsUpdated.stats_min5),
                        '1h': extractTokenAnalytics(message.payload.data.onDetailedStatsUpdated.stats_hour1 || {}),
                        '4h': extractTokenAnalytics(message.payload.data.onDetailedStatsUpdated.stats_hour4 || {}),
                        '12h': extractTokenAnalytics(message.payload.data.onDetailedStatsUpdated.stats_hour12 || {}),
                        '24h': extractTokenAnalytics(message.payload.data.onDetailedStatsUpdated.stats_day1 || {}),
                    }

                    const customEvent = new CustomEvent('newTokenAnalyticsEvent', {
                        detail: { analytics: output, pair: this.pair, chain: this.chain },
                    })
                    document.dispatchEvent(customEvent)
                }

                if (message.payload.data?.onPairMetadataUpdated) {
                    // Handle pair metadata updates
                    const metadata = message.payload.data.onPairMetadataUpdated
                    const customEvent = new CustomEvent('pairMetadataUpdate', {
                        detail: metadata,
                    })
                    document.dispatchEvent(customEvent)
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.log(`Message parsing error: ${e.message}`)
        }
    }

    private handleError(error: Event): void {
        console.log(`WebSocket error: ${error}`)
    }

    private handleClose(event: CloseEvent): void {
        console.log(`WebSocket connection closed: ${event.reason}`)

        if (!this.isIntentionalClose) {
            this.attemptReconnect()
        }
    }

    private sendMessage(message: object): void {
        try {
            if (this.ws) {
                this.ws.send(JSON.stringify(message))
                // console.log(`Message sent: ${JSON.stringify(message)}`);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.log(`Failed to send message: ${error.message}`)
        }
    }

    disconnect(): void {
        if (this.ws) {
            this.isIntentionalClose = true
            this.ws.close()
            this.ws = null
        }
    }

    private attemptReconnect(): void {
        if (this.reconnectAttempts < CONFIG.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++

            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${CONFIG.MAX_RECONNECT_ATTEMPTS})...`)

            setTimeout(() => this.connect(), CONFIG.RECONNECT_INTERVAL)
        } else {
            console.log('Maximum reconnection attempts reached. Please reconnect manually.')
        }
    }

    subscribeDetailedStats(): void {
        if (this.isConnected && this.ws && this.pairId) {
            const subscribeMessage = MessageFactory.subs_createOnDetailedStatsUpdated(this.pairId)
            this.sendMessage(subscribeMessage)
            if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('Subscribed to DetailedStats updates')
        } else {
            if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('Cannot subscribe: WebSocket is not connected')
        }
    }
}

// Add this function outside the WebSocketManager class to make it reusable

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractTokenAnalytics(stats: any) {
    if (!stats || Object.keys(stats).length === 0) {
        return {
            priceChange: null,
            buyTransactions: null,
            sellTransactions: null,
            totalTransactions: null,
            buyVolume: null,
            sellVolume: null,
            totalVolume: null,
            buyers: null,
            sellers: null,
            traders: null,
            totalParticipants: null,
        }
    }

    const buyersCount = stats.buyers?.currentValue ?? 0
    const sellersCount = stats.sellers?.currentValue ?? 0

    return {
        priceChange: stats.priceChange?.currentValue ?? null,
        buyTransactions: stats.buys?.currentValue ?? null,
        sellTransactions: stats.sells?.currentValue ?? null,
        totalTransactions: stats.transactions?.currentValue ?? null,
        buyVolume: stats.buyVolume?.currentValue ? +stats.buyVolume?.currentValue : null,
        sellVolume: stats.sellVolume?.currentValue ? +stats.sellVolume?.currentValue : null,
        totalVolume: stats.volume?.currentValue ? +stats.volume?.currentValue : null,
        buyers: buyersCount,
        sellers: sellersCount,
        traders: stats.traders?.currentValue ?? null,
        totalParticipants: buyersCount + sellersCount,
    }
}
