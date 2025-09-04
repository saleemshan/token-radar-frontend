/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

interface WebSocketMessage {
    method: 'subscribe' | 'unsubscribe'
    subscription: {
        type: string
        [key: string]: any
    }
}

interface WebSocketContextType {
    subscribe: (type: string, callback: (data: any) => void, additionalParams?: Record<string, any>) => void
    unsubscribe: (type: string, additionalParams?: Record<string, any>) => void
    sendMessage: (message: WebSocketMessage) => void
    isConnected: boolean
    cleanup: () => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export const useWebSocket = () => {
    const context = useContext(WebSocketContext)
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider')
    }
    return context
}

class WebSocketManager {
    private ws: WebSocket | null = null
    private subscribers = new Map<string, Set<(data: any) => void>>()
    private subscriptionParams = new Map<string, Record<string, any>>()
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectTimeout = 1000
    private messageQueue: WebSocketMessage[] = []
    private isConnected = false
    private reconnectTimer: NodeJS.Timeout | null = null
    private isTabVisible = true
    private lastHiddenTime: number | null = null
    private readonly RECONNECT_THRESHOLD_MS = 30000 // Only reconnect if hidden for 30+ seconds

    constructor(private url: string) {}

    connect() {
        if (this.isWebSocketOpen()) return

        try {
            this.ws = new WebSocket(this.url)

            this.ws.onopen = () => {
                this.isConnected = true
                this.reconnectAttempts = 0
                this.processMessageQueue()

                // Resubscribe to all active channels
                this.resubscribeAll()
            }

            this.ws.onclose = event => {
                console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`)
                this.isConnected = false

                // Different handling based on close code
                if (event.code === 1000) {
                    // Normal closure, no reconnect needed
                } else {
                    this.handleReconnect()
                }
            }

            this.ws.onerror = error => {
                console.error('WebSocket Error:', error)
                this.isConnected = false
                // Don't call handleReconnect here - the onclose handler will be called next
            }

            this.ws.onmessage = event => {
                try {
                    const message = JSON.parse(event.data)

                    const subscribers = this.subscribers.get(message.channel)
                    if (subscribers) {
                        subscribers.forEach(callback => callback(message.data))
                    }
                } catch (error) {
                    console.error('Error processing message:', error)
                }
            }
        } catch (error) {
            console.error('Error creating WebSocket:', error)
            this.isConnected = false
            this.handleReconnect()
        }
    }

    private handleReconnect() {
        // Clear any existing reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            toast.error('Unable to connect to server. Please refresh the page.')
            return
        }

        this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++
            this.connect()
        }, this.reconnectTimeout * Math.pow(1.5, this.reconnectAttempts))
    }

    private processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift()
            if (message) this.sendMessage(message)
        }
    }

    setTabVisibility(isVisible: boolean) {
        const wasInvisible = !this.isTabVisible
        this.isTabVisible = isVisible

        if (!isVisible) {
            // Tab has become hidden, record the time
            this.lastHiddenTime = Date.now()
            return
        }

        // Tab has become visible again
        if (wasInvisible) {
            // Check if socket is actually closed
            if (this.isWebSocketClosed()) {
                // Only reconnect if we've been away long enough or socket is actually closed
                const hiddenDuration = this.lastHiddenTime ? Date.now() - this.lastHiddenTime : 0

                if (hiddenDuration > this.RECONNECT_THRESHOLD_MS) {
                    console.log(`Tab was hidden for ${hiddenDuration}ms, reconnecting WebSocket`)
                    this.reconnectAttempts = 0
                    this.connect()
                } else {
                    // For quick tab switches, just check connection but don't force reconnect
                    console.log(`Quick tab switch (${hiddenDuration}ms), checking connection without forced reconnect`)
                    this.checkAndReconnectIfNeeded()
                }
            } else if (!this.isWebSocketOpen() && !this.isWebSocketConnecting()) {
                // Socket is in an unexpected state, reconnect
                console.log('WebSocket in unexpected state, reconnecting')
                this.reconnectAttempts = 0
                this.connect()
            }

            this.lastHiddenTime = null
        }
    }

    checkAndReconnectIfNeeded() {
        // Only check connection if we think we're connected but socket is closed
        if (this.isConnected && this.isWebSocketClosed()) {
            console.log('WebSocket reported connected but is closed, reconnecting')
            this.connect()
            return true
        }
        return false
    }

    private resubscribeAll() {
        Array.from(this.subscribers.keys()).forEach(channel => {
            const additionalParams = this.subscriptionParams.get(channel) || {}
            this.sendMessage({
                method: 'subscribe',
                subscription: {
                    type: channel,
                    ...additionalParams,
                },
            })
        })
    }

    subscribe(type: string, callback: (data: any) => void, additionalParams: Record<string, any> = {}) {
        const channel = type
        // Store subscription parameters for later resubscription
        this.subscriptionParams.set(channel, additionalParams)

        if (!this.subscribers.has(channel)) {
            this.subscribers.set(channel, new Set())
            this.sendMessage({
                method: 'subscribe',
                subscription: {
                    type,
                    ...additionalParams,
                },
            })
        }
        this.subscribers.get(channel)?.add(callback)
    }

    unsubscribe(type: string, additionalParams?: Record<string, any>, callback?: (data: any) => void) {
        const channel = type
        if (callback) {
            this.subscribers.get(channel)?.delete(callback)
            // Check if this was the last callback and clean up if needed
            if (this.subscribers.get(channel)?.size === 0) {
                this.subscribers.delete(channel)
                this.subscriptionParams.delete(channel)
                this.sendMessage({
                    method: 'unsubscribe',
                    subscription: {
                        type,
                        ...additionalParams,
                    },
                })
            }
        } else {
            this.subscribers.delete(channel)
            this.subscriptionParams.delete(channel)
            this.sendMessage({
                method: 'unsubscribe',
                subscription: {
                    type,
                    ...additionalParams,
                },
            })
        }
    }

    sendMessage(message: WebSocketMessage) {
        // Don't queue messages if tab is not visible to avoid spam on return
        if (!this.isTabVisible && message.method === 'subscribe') {
            return
        }

        // Check if disconnected or in closing/closed state
        if (this.isWebSocketClosed()) {
            console.log('WebSocket disconnected, attempting to reconnect...')
            if (this.isTabVisible) {
                this.messageQueue.push(message)
                this.connect()
            }
            return
        }

        // Handle connecting state
        if (this.isWebSocketConnecting()) {
            this.messageQueue.push(message)
            return
        }

        // Only send if we're properly connected
        if (this.isWebSocketOpen()) {
            this.ws!.send(JSON.stringify(message))
        }
    }

    getConnectionStatus() {
        return this.isConnected
    }

    disconnect() {
        console.log('Disconnecting WebSocket')
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        if (this.ws) {
            // Only attempt to close if it's not already closed
            if (!this.isWebSocketClosed()) {
                try {
                    console.log('Closing WebSocket')
                    this.ws.close()
                    this.messageQueue = []
                } catch (error) {
                    console.error('Error closing WebSocket:', error)
                }
            }
            this.ws = null
        }

        this.isConnected = false
    }

    hasSubscription(type: string) {
        return this.subscribers.has(type)
    }

    getActiveSubscriptions() {
        return Array.from(this.subscribers.keys())
    }

    cleanupBeforeNavigation() {
        this.subscribers.clear()
        this.subscriptionParams.clear()

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        if (this.ws) {
            if (!this.isWebSocketClosed()) {
                try {
                    this.ws.close()
                } catch (error) {
                    console.error('Error closing WebSocket during cleanup:', error)
                }
            }
            this.ws = null
        }

        this.isConnected = false
        this.reconnectAttempts = 0
        this.messageQueue = []
    }

    isWebSocketClosed(): boolean {
        return !this.ws || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING
    }

    isWebSocketOpen(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN
    }

    isWebSocketConnecting(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.CONNECTING
    }
}

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const wsManager = useRef<WebSocketManager>()
    const [isConnected, setIsConnected] = useState(false)
    const visibilityChangeTimerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        wsManager.current = new WebSocketManager(process.env.NEXT_PUBLIC_HYPERLIQUID_WS_URL!)
        wsManager.current.connect()

        // Add visibility change handling with debounce for quick tab switches
        const handleVisibilityChange = () => {
            const isVisible = document.visibilityState === 'visible'
            if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log(`Tab visibility changed: ${isVisible ? 'visible' : 'hidden'}`)

            // Clear any existing timer
            if (visibilityChangeTimerRef.current) {
                clearTimeout(visibilityChangeTimerRef.current)
                visibilityChangeTimerRef.current = null
            }

            // Only change visibility immediately when hiding
            if (!isVisible) {
                wsManager.current?.setTabVisibility(false)
                return
            }

            // For tab becoming visible, add a small delay to handle quick alt+tab
            visibilityChangeTimerRef.current = setTimeout(() => {
                wsManager.current?.setTabVisibility(true)

                // Update connection status in UI
                const currentStatus = wsManager.current?.getConnectionStatus() || false
                setIsConnected(currentStatus)

                visibilityChangeTimerRef.current = null
            }, 300) // Small delay to prevent UI flashing during quick tab switches
        }

        // Listen for visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Set initial visibility
        wsManager.current?.setTabVisibility(document.visibilityState === 'visible')

        // Set up a heartbeat to detect connection issues even when tab is visible
        const heartbeatInterval = setInterval(() => {
            if (document.visibilityState === 'visible' && wsManager.current) {
                const currentStatus = wsManager.current.getConnectionStatus() || false
                setIsConnected(currentStatus)

                // Check connection state and reconnect if needed without forcing
                wsManager.current.checkAndReconnectIfNeeded()
            }
        }, 3000) // Reduced frequency to check less often

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            if (visibilityChangeTimerRef.current) {
                clearTimeout(visibilityChangeTimerRef.current)
            }
            clearInterval(heartbeatInterval)
            wsManager.current?.disconnect()
        }
    }, [])

    const contextValue = {
        subscribe: (type: string, callback: (data: any) => void, additionalParams?: Record<string, any>) => {
            wsManager.current?.subscribe(type, callback, additionalParams)
        },
        unsubscribe: (type: string, additionalParams?: Record<string, any>) => wsManager.current?.unsubscribe(type, additionalParams),
        sendMessage: (message: WebSocketMessage) => wsManager.current?.sendMessage(message),
        isConnected: isConnected,
        cleanup: () => wsManager.current?.cleanupBeforeNavigation(),
    }

    return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>
}
