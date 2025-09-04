/* eslint-disable @typescript-eslint/no-explicit-any */

import { UserFill } from '@/types/hyperliquid'

export default class HyperliquidSocketClient {
    private socket!: WebSocket
    private channelToSubscription: Map<string, any>
    private intervalMap: Map<string, NodeJS.Timeout>
    private userFillsCallback?: (fills: UserFill[]) => void

    private userAddress?: string
    private pingInterval?: NodeJS.Timeout
    private isPageVisible: boolean = true
    private reconnectTimeout?: NodeJS.Timeout
    private isDestroyed: boolean = false
    private reconnectAttempts: number = 0
    private subscriptionsQueue: Array<{ method: string; subscription: any }> = []
    private isConnecting: boolean = false

    constructor(userAddress: string) {
        this.channelToSubscription = new Map()
        this.intervalMap = new Map()
        this.userAddress = userAddress

        // Add visibility change listener
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', this.handleVisibilityChange)
            window.addEventListener('beforeunload', this.destroy)
        }
    }

    private handleVisibilityChange = () => {
        const previousState = this.isPageVisible
        this.isPageVisible = document.visibilityState === 'visible'

        if (!previousState && this.isPageVisible) {
            // Tab became active from inactive state
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                this.reconnect()
            } else {
                // If the socket is open, verify all subscriptions are active
                this.verifySubscriptions()
            }
        }
    }

    private verifySubscriptions() {
        // Resubscribe to all active subscriptions to ensure they're active
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            // First resubscribe to user fills if available
            if (this.userAddress) {
                this.subscribeToUserFills()
            }

            // Then resubscribe to all candle subscriptions
            for (const item of Array.from(this.channelToSubscription.values())) {
                for (const handler of item.handlers) {
                    if (handler.subscription) {
                        this.emit({
                            method: 'subscribe',
                            subscription: handler.subscription,
                        })
                    }
                }
            }
        }
    }

    public destroy = () => {
        this.isDestroyed = true

        // Clear all intervals and timeouts
        this.clearPingInterval()
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout)
            this.reconnectTimeout = undefined
        }

        // Close socket connection
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            try {
                // Unsubscribe from all feeds first
                for (const item of Array.from(this.channelToSubscription.values())) {
                    for (const handler of item.handlers) {
                        if (handler.subscription) {
                            this.emit({
                                method: 'unsubscribe',
                                subscription: handler.subscription,
                            })
                        }
                    }
                }

                // Then close the socket
                this.socket.close(1000, 'Normal closure')
            } catch (e) {
                console.error('Error closing socket:', e)
            }
        }

        // Remove event listeners
        if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this.handleVisibilityChange)
            window.removeEventListener('beforeunload', this.destroy)
        }

        // Clear subscriptions
        this.channelToSubscription.clear()
        this.intervalMap.clear()
        this.subscriptionsQueue = []
    }

    public setUserAddress(address: string) {
        this.userAddress = address
        // Reconnect WebSocket with new user address if already connected
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.subscribeToUserFills()
        }
    }

    private subscribeToUserFills() {
        if (!this.userAddress) return

        const subscription = {
            type: 'userFills',
            user: this.userAddress,
        }

        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            // Queue the subscription for when the socket connects
            this.queueSubscription('subscribe', subscription)
            return
        }

        this.emit({
            method: 'subscribe',
            subscription: subscription,
        })
    }

    // Queue a subscription to be sent when the socket connects
    private queueSubscription(method: string, subscription: any) {
        this.subscriptionsQueue.push({ method, subscription })
    }

    // Process the subscription queue
    private processSubscriptionQueue() {
        if (this.socket?.readyState !== WebSocket.OPEN) return

        while (this.subscriptionsQueue.length > 0) {
            const { method, subscription } = this.subscriptionsQueue.shift()!
            this.emit({
                method,
                subscription,
            })
        }
    }

    public subscribeOnStream(
        symbolInfo: TradingView.LibrarySymbolInfo,
        resolution: TradingView.ResolutionString,
        onRealtimeCallback: TradingView.SubscribeBarsCallback,
        subscriberUID: string,
        onResetCacheNeededCallback: () => void,
        lastBar: TradingView.Bar | undefined,
        subscriptionMessage: {
            type: string
            coin: string
            interval: string
        }
    ) {
        // Don't subscribe if component has been destroyed
        if (this.isDestroyed) return

        const channelString = `${symbolInfo.name}-${resolution}`

        // Store the subscription message for later unsubscribe
        const subscription = { ...subscriptionMessage }

        const handler = {
            id: subscriberUID,
            callback: onRealtimeCallback,
            subscription: subscription, // Store subscription details
        }

        let subscriptionItem = this.channelToSubscription.get(channelString)
        if (subscriptionItem) {
            subscriptionItem.handlers.push(handler)

            // If socket is already open, send the subscription immediately
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.emit({
                    method: 'subscribe',
                    subscription: subscription,
                })
            } else {
                // Queue the subscription for when the socket connects
                this.queueSubscription('subscribe', subscription)
            }

            return
        }

        subscriptionItem = {
            subscriberUID,
            resolution,
            lastBar,
            handlers: [handler],
            symbolInfo: symbolInfo, // Store symbolInfo in the subscription item
        }

        this.channelToSubscription.set(channelString, subscriptionItem)

        // Create WebSocket if it doesn't exist or is closed
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            // Reset reconnect attempts when creating a new connection
            this.reconnectAttempts = 0

            // Queue the subscription for when the socket connects
            this.queueSubscription('subscribe', subscription)

            // If we're already connecting, don't create another socket
            if (this.isConnecting) {
                return
            }

            this.isConnecting = true

            const ws = new WebSocket(process.env.NEXT_PUBLIC_HYPERLIQUID_WS_URL!)
            this.socket = ws

            ws.onopen = () => {
                this.isConnecting = false
                // Reset reconnect attempts on successful connection
                this.reconnectAttempts = 0

                this.dispatchStreamingStatusEvent('online')

                // Process any queued subscriptions
                this.processSubscriptionQueue()

                // Subscribe to user fills if address is available
                if (this.userAddress) {
                    this.subscribeToUserFills()
                }

                // Set up ping interval to keep connection alive (every 10 seconds)
                this.setupPingInterval()
            }

            ws.onmessage = event => {
                try {
                    const message = JSON.parse(event.data)
                    const data = message?.data

                    if (message?.channel === 'candle' && data) {
                        this.dispatchStreamingStatusEvent('online')

                        const bar = {
                            time: data.t,
                            open: Number(data.o),
                            high: Number(data.h),
                            low: Number(data.l),
                            close: Number(data.c),
                            volume: Number(data.v),
                        }

                        // Find the right subscription by checking the coin and interval
                        for (const [key, item] of Array.from(this.channelToSubscription.entries())) {
                            if (key.includes(item.symbolInfo.name)) {
                                item.lastBar = bar
                                item.handlers.forEach((handler: any) => handler.callback(bar))
                            }
                        }
                    }
                    // Handle user fills
                    else if (message?.channel === 'userFills' && data) {
                        if (this.userFillsCallback && data.fills) {
                            const fills = data.fills.map((fill: any) => ({
                                time: fill.time,
                                side: fill.side,
                                px: fill.px,
                                sz: fill.sz,
                                coin: fill.coin,
                                dir: fill.dir,
                                closedPnl: fill.closedPnl,
                                fee: fill.fee,
                                feeToken: fill.feeToken,
                                hash: fill.hash,
                                oid: fill.oid,
                            }))

                            // Call the callback with all fills
                            this.userFillsCallback(fills)
                        }
                    } else if (message.channel === 'error') {
                        console.error('WebSocket Error:', message.data)
                    }
                } catch (e) {
                    console.error('Error parsing WebSocket message:', e, event.data)
                }
            }

            ws.onerror = error => {
                this.isConnecting = false
                this.dispatchStreamingStatusEvent('offline')
                console.error('WebSocket Error:', error)
            }

            ws.onclose = event => {
                this.isConnecting = false
                this.dispatchStreamingStatusEvent('offline')

                // Clear ping interval when connection closes
                this.clearPingInterval()

                // Only attempt to reconnect if:
                // 1. Page is visible
                // 2. Component is not destroyed
                // 3. Close was not intentional (code 1000 is normal closure)
                if (!this.isDestroyed && this.isPageVisible && event.code !== 1000) {
                    // Use exponential backoff for reconnect attempts
                    const delay = Math.min(5000 * Math.pow(1.5, this.reconnectAttempts), 30000)

                    // Clear any existing reconnect timeout
                    if (this.reconnectTimeout) {
                        clearTimeout(this.reconnectTimeout)
                    }

                    this.reconnectTimeout = setTimeout(() => {
                        this.reconnectAttempts++
                        this.reconnect()
                    }, delay)
                }
            }
        } else {
            // Socket already exists, just subscribe to the new feed
            this.emit({
                method: 'subscribe',
                subscription: subscription,
            })
        }
    }

    public setUserFillsCallback(callback: (fills: UserFill[]) => void) {
        this.userFillsCallback = callback
    }

    public unsubscribeFromStream(subscriberUID: string) {
        for (const [channelString, subscriptionItem] of Array.from(this.channelToSubscription.entries())) {
            const handlerIndex = subscriptionItem.handlers.findIndex((handler: { id: string }) => handler.id === subscriberUID)

            if (handlerIndex !== -1) {
                // Get the subscription details before removing the handler
                const subscription = subscriptionItem.handlers[handlerIndex].subscription

                // Unsubscribe from the feed
                if (subscription) {
                    this.unsubscribeFromFeed(subscription)
                }

                subscriptionItem.handlers.splice(handlerIndex, 1)

                const intervalID = this.intervalMap.get(subscriberUID)
                if (intervalID) {
                    clearInterval(intervalID)
                    this.intervalMap.delete(subscriberUID)
                }

                if (subscriptionItem.handlers.length === 0) {
                    this.channelToSubscription.delete(channelString)
                    break
                }
            }
        }
    }

    private unsubscribeFromFeed(subscription: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.emit({
                method: 'unsubscribe',
                subscription: subscription,
            })
        }
    }

    private emit(payload: object) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            // Queue subscriptions for when the socket connects
            if (typeof (payload as any).method === 'string' && (payload as any).method === 'subscribe' && (payload as any).subscription) {
                this.queueSubscription('subscribe', (payload as any).subscription)
            }

            return
        }

        const message = JSON.stringify(payload)
        this.socket.send(message)
    }

    private setupPingInterval() {
        // Clear existing interval if any
        this.clearPingInterval()

        // Send a ping every 10 seconds to keep the connection alive
        this.pingInterval = setInterval(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.emit({ method: 'ping' })
            }
        }, 10000)
    }

    private clearPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval)
            this.pingInterval = undefined
        }
    }

    private async dispatchStreamingStatusEvent(status: TradingViewStreamingStatusEvent['status']) {
        if (typeof document === 'undefined') return

        const statusEvent = new CustomEvent<TradingViewStreamingStatusEvent>('newTradingViewStreamingStatusEvent', {
            detail: {
                status: status,
            },
        })

        // Dispatch the event on the desired target, like document or a specific DOM element
        document.dispatchEvent(statusEvent)
    }

    private reconnect() {
        // Don't reconnect if component has been destroyed or page is not visible
        if (this.isDestroyed || !this.isPageVisible) {
            return
        }

        if (this.isConnecting) {
            return
        }

        this.isConnecting = true

        if (this.socket) {
            // Close existing socket if it's still open
            if (this.socket.readyState === WebSocket.OPEN) {
                try {
                    this.socket.close(1000, 'Reconnecting')
                } catch (e) {
                    console.error('Error closing socket for reconnect:', e)
                }
            }

            // Create a new socket and resubscribe to all active feeds
            const ws = new WebSocket(process.env.NEXT_PUBLIC_HYPERLIQUID_WS_URL!)
            this.socket = ws

            ws.onopen = () => {
                this.isConnecting = false
                // Reset reconnect attempts on successful connection
                this.reconnectAttempts = 0

                // Process any queued subscriptions first
                this.processSubscriptionQueue()

                // Then resubscribe to all active subscriptions
                this.verifySubscriptions()

                // Setup ping interval
                this.setupPingInterval()

                // Dispatch online status
                this.dispatchStreamingStatusEvent('online')
            }

            // Set up the message, error, and close handlers again
            ws.onmessage = this.socket.onmessage
            ws.onerror = this.socket.onerror
            ws.onclose = this.socket.onclose
        }
    }
}
