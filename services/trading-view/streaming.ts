/* eslint-disable @typescript-eslint/no-explicit-any */
// import { parseFullSymbol } from './helpers';

import { MessageFactory, TokenManager } from '@/utils/tokenWSS'

// import { convertResolutionToMinutes } from './helpers';

export const CRUSH_RESOLUSION = {
    1: '1m',
    5: '5m',
    15: '15m',
    60: '1h',
    240: '4h',
    '1D': '1d',
}

export default class SocketClient {
    socket!: WebSocket
    channelToSubscription: Map<string, any> = new Map()
    intervalMap: Map<string, NodeJS.Timeout>
    checkConnectionInterval!: NodeJS.Timeout
    showPrice: boolean = false
    supply: number = 0
    pairAddress: string = ''
    tokenAddress: string = ''
    resolution?: TradingView.ResolutionString
    messageQueue: string[] = []
    authToken: string | null = null
    chain: ChainId = 'solana'
    quoteToken: string = 'token1'
    private reconnectAttempts: number = 0
    private isIntentionalClose: boolean = false
    private readonly MAX_RECONNECT_ATTEMPTS = 3
    private readonly RECONNECT_INTERVAL = 3000
    private connectionAcknowledged: boolean = false

    constructor() {
        if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('[SocketClient] init')
        this.intervalMap = new Map()
    }

    private async _createSocket(): Promise<WebSocket> {
        try {
            // Get auth token
            this.authToken = await TokenManager.getToken()

            this.socket = new WebSocket('wss://stream.dev.xexlab.com/definedws', ['graphql-transport-ws'])

            return new Promise((resolve, reject) => {
                this.socket.addEventListener('open', () => {
                    if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('[socket] Connected')

                    // Reset reconnect attempts on successful connection
                    this.reconnectAttempts = 0
                    this.isIntentionalClose = false

                    // Send connection init with auth token
                    const initMessage = MessageFactory.createConnectionInit(this.authToken!)
                    this.socket.send(JSON.stringify(initMessage))
                })

                this.socket.addEventListener('message', ({ data }) => {
                    const message = JSON.parse(data)

                    if (message.type === 'connection_ack') {
                        if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('Connection acknowledged')
                        this.connectionAcknowledged = true
                        // Resubscribe to existing channels if any
                        this.resubscribeToChannels()

                        this._startConnectionCheck()
                        resolve(this.socket)
                        return
                    }

                    if (message.type === 'next' && message.payload.data.onPairMetadataUpdated) {
                        this.dispatchStreamingStatusEvent('online')
                        const metadata = message.payload.data.onPairMetadataUpdated
                        // Find the correct token price based on tokenAddress
                        let newTokenPrice
                        if (this.tokenAddress.toLowerCase() === metadata.token0.address.toLowerCase()) {
                            newTokenPrice = metadata.token0.price
                        } else if (this.tokenAddress.toLowerCase() === metadata.token1.address.toLowerCase()) {
                            newTokenPrice = metadata.token1.price
                        }

                        if (!newTokenPrice || !this.pairAddress) return

                        const channelString = `${this.pairAddress.toLowerCase()}-${this.resolution}-${this.showPrice ? 'price' : 'mcap'}`

                        const subscriptionItem = this.channelToSubscription.get(channelString)
                        if (subscriptionItem === undefined) return

                        const lastDailyBar = subscriptionItem.lastDailyBar
                        let bar: any

                        if (this.showPrice) {
                            bar = {
                                ...lastDailyBar,
                                close: newTokenPrice,
                            }
                        } else {
                            bar = {
                                ...lastDailyBar,
                                close: this.supply * newTokenPrice,
                            }
                        }

                        subscriptionItem.lastDailyBar = { ...bar }

                        const customEvent = new CustomEvent<TradingViewDataFeedEvent>('newTradingViewPriceEvent', {
                            detail: {
                                price: Number(newTokenPrice),
                                mcap: this.supply * Number(newTokenPrice),
                                tokenAddress: this.tokenAddress,
                                chain: this.chain,
                            },
                        })

                        document.dispatchEvent(customEvent)

                        subscriptionItem.handlers.forEach((handler: { callback: (arg0: any) => any }) => handler.callback(bar))
                    }
                })

                this.socket.addEventListener('close', () => {
                    if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('[socket] Disconnected')

                    if (!this.isIntentionalClose) {
                        this.attemptReconnect()
                    }
                    this.dispatchStreamingStatusEvent('offline')
                })

                this.socket.addEventListener('error', (error: any) => {
                    if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('[socket] Error:', error)
                    this.dispatchStreamingStatusEvent('error')
                    reject(error)
                })
            })
        } catch (error) {
            console.error('Failed to create socket:', error)
            throw error
        }
    }

    _startConnectionCheck() {
        this.checkConnectionInterval = setInterval(() => {
            if (this.socket.readyState === WebSocket.OPEN) {
                this.dispatchStreamingStatusEvent('online')
                if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('[socket] Connection is alive')
            } else {
                this.dispatchStreamingStatusEvent('offline')
                if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('[socket] Connection is not open')
            }
        }, 10000) // Check every 10 seconds
    }

    private async dispatchStreamingStatusEvent(status: TradingViewStreamingStatusEvent['status']) {
        const statusEvent = new CustomEvent<TradingViewStreamingStatusEvent>('newTradingViewStreamingStatusEvent', {
            detail: {
                status: status,
            },
        })

        // Dispatch the event on the desired target, like document or a specific DOM element
        document.dispatchEvent(statusEvent)
    }

    private async attemptReconnect() {
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++

            setTimeout(async () => {
                try {
                    await this._createSocket()
                } catch (error) {
                    console.error('Reconnection attempt failed:', error)
                }
            }, this.RECONNECT_INTERVAL)
        }
    }

    private resubscribeToChannels() {
        // Only proceed if we have a valid pair address
        if (!this.pairAddress) return

        let chainId: number
        switch (this.chain) {
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
                chainId = 1399811149
                break
        }

        const pairId = `${this.pairAddress}:${chainId}`

        // Check if this subscription already exists
        const channelString = `${this.pairAddress.toLowerCase()}-${this.resolution}-${this.showPrice ? 'price' : 'mcap'}`

        const existingSubscription = this.channelToSubscription.get(channelString)

        // Only subscribe if the channel doesn't exist and socket is open
        if (!existingSubscription && this.socket && this.socket.readyState === WebSocket.OPEN) {
            const subscribeMessage = MessageFactory.subs_createOnPairMetadataUpdated(pairId, this.quoteToken)
            this.socket.send(JSON.stringify(subscribeMessage))
        }
    }

    public async subscribeOnStream(
        symbolInfo: TradingView.LibrarySymbolInfo,
        resolution: TradingView.ResolutionString,
        onRealtimeCallback: TradingView.SubscribeBarsCallback,
        subscriberUID: string,
        onResetCacheNeededCallback: () => void,
        lastDailyBar: TradingView.Bar | undefined,
        pairAddress: string,
        tokenAddress: string,
        chainWebsocket: number,
        showPrice: boolean,
        supply: number,
        chain: ChainId,
        quoteToken: string
    ) {
        this.showPrice = showPrice
        this.supply = supply

        this.tokenAddress = tokenAddress
        this.resolution = resolution
        this.chain = chain
        this.quoteToken = quoteToken

        if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
            try {
                await this._createSocket()
            } catch (error) {
                console.error('Failed to connect to WebSocket:', error)
                return
            }
        }

        const channelString = `${pairAddress.toLowerCase()}-${resolution}-${this.showPrice ? 'price' : 'mcap'}`

        const handler = {
            id: subscriberUID,
            callback: onRealtimeCallback,
        }

        let subscriptionItem = this.channelToSubscription.get(channelString)
        if (subscriptionItem) {
            subscriptionItem.handlers.push(handler)
            return
        }

        subscriptionItem = {
            subscriberUID,
            resolution,
            lastDailyBar,
            handlers: [handler],
        }
        this.channelToSubscription.set(channelString, subscriptionItem)

        let chainId: number
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
                chainId = 1399811149
                break
        }

        // Subscribe to pair metadata updates
        const pairId = `${pairAddress}:${chainId}`

        if (pairAddress !== this.pairAddress) {
            // Wait for connection to be acknowledged
            const maxAttempts = 10
            let attempts = 0

            while (!this.connectionAcknowledged && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 300)) // Wait 100ms between checks
                attempts++
            }

            if (this.connectionAcknowledged) {
                const subscribeMessage = MessageFactory.subs_createOnPairMetadataUpdated(pairId, quoteToken)
                this.socket.send(JSON.stringify(subscribeMessage))
            } else {
                console.error('Failed to subscribe: Connection not acknowledged')
            }
        }

        this.pairAddress = pairAddress

        // Keep connection alive with ping messages
        const intervalID = setInterval(() => {
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'ping' }))
            }
        }, 10000)

        this.intervalMap.set(subscriberUID, intervalID)

        // Reset intentional close flag when subscribing
        this.isIntentionalClose = false
    }

    public unsubscribeFromStream(subscriberUID: string) {
        for (const channelString of Array.from(this.channelToSubscription.keys())) {
            const subscriptionItem = this.channelToSubscription.get(channelString)
            const handlerIndex = subscriptionItem.handlers.findIndex((handler: { id: string }) => handler.id === subscriberUID)

            if (handlerIndex !== -1) {
                // Remove from handlers
                subscriptionItem.handlers.splice(handlerIndex, 1)

                const intervalID = this.intervalMap.get(subscriberUID)
                if (intervalID) {
                    clearInterval(intervalID)
                    this.intervalMap.delete(subscriberUID)
                }

                if (subscriptionItem.handlers.length === 0) {
                    // Unsubscribe from the channel if it is the last handler
                    if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
                        console.log('[unsubscribeBars]: Unsubscribe from streaming. Channel:', channelString)

                    clearInterval(this.checkConnectionInterval)

                    // this.emit('UNSUBSCRIBE', [channelString], 2);
                    this.channelToSubscription.delete(channelString)
                    break
                }
            }
        }

        if (this.socket && Array.from(this.channelToSubscription.keys()).length === 0) {
            if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('closing socket')
            if (this.checkConnectionInterval) {
                clearInterval(this.checkConnectionInterval)
            }
            this.isIntentionalClose = true
            this.socket.close()
        }
    }

    emit(methodOrPayload: string | object, params?: any, id?: number) {
        if (this.socket.readyState !== WebSocket.OPEN) {
            console.log('[socket] Socket is not open, cannot send message')

            return
        }

        let payload: string

        if (typeof methodOrPayload === 'string') {
            // Existing functionality with method, params, and id
            payload = JSON.stringify({
                method: methodOrPayload,
                params,
                id,
            })
        } else {
            // Custom payload
            payload = JSON.stringify(methodOrPayload)
        }

        this.socket.send(payload)
    }
}
