// lib/socket.ts
import { NewsItem } from '@/types/newstrading'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
let isManualDisconnect = false
let heartbeatInterval: NodeJS.Timeout | null = null

type Options = {
    getPrivyToken?: () => Promise<string | undefined>
    url?: string
    onStatusChange?: (status: string, color?: string) => void
    onReconnectStatus?: (message: string) => void
    onHeartbeat?: () => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onNews?: (data: NewsItem) => void
    onPreferencesLoaded?: () => void
    onSubscriptionSuccess?: (channel: string) => void
    onSubscriptionError?: (channel: string, error: string) => void
    onServerMessage?: (msg: string) => void
    clearUserData?: () => void
}

export function connectSocket(options: Options) {
    const {
        getPrivyToken,
        url,
        onStatusChange,
        onReconnectStatus,
        onHeartbeat,
        onNews,
        onPreferencesLoaded,
        onSubscriptionSuccess,
        onSubscriptionError,
        onServerMessage,
        clearUserData,
    } = options

    if (socket) socket.disconnect()

    onStatusChange?.('Connecting...', '')

    socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 5000,
    })

    socket.on('connect', async () => {
        onStatusChange?.('Connected')
        onReconnectStatus?.('')

        socket?.emit('subscribe', { channel: 'feed_news' })

        if (getPrivyToken) {
            try {
                const privyToken = await getPrivyToken()
                if (privyToken) {
                    socket?.emit('subscribe', {
                        channel: 'user_data',
                        authorization: `Bearer ${privyToken}`,
                        isSandbox: process.env.NEXT_PUBLIC_ENABLE_NEWS_SANDBOX ?? false,
                    })
                    onStatusChange?.('Authenticating...')
                } else {
                    onStatusChange?.('Not authenticated (no token provided)')
                }
            } catch (err) {
                onStatusChange?.('Not authenticated (failed to get token)')
            }
        } else {
            onStatusChange?.('Not authenticated (no token provider)')
        }

        startHeartbeat()
    })

    socket.on('disconnect', reason => {
        onStatusChange?.(`Disconnected (${reason})`)
        clearUserData?.()
        onStatusChange?.('Not authenticated (disconnected)')

        if (!isManualDisconnect) {
            onReconnectStatus?.('Attempting to reconnect...')
        } else {
            onReconnectStatus?.('')
        }
    })

    socket.on('connect_error', error => {
        console.error('Socket.IO Error:', error)
        onStatusChange?.(`Error: ${error.message}`, '#721c24')
        clearUserData?.()
        onStatusChange?.('Not authenticated (connection error)', '#721c24')
    })

    socket.on('reconnect_attempt', attempt => {
        onReconnectStatus?.(`Reconnect attempt ${attempt}...`)
    })

    socket.on('reconnect_failed', () => {
        onReconnectStatus?.('Reconnection failed. Please try again manually.')
    })

    socket.on('pong', () => {
        onHeartbeat?.()
    })

    socket.on('feed_news', data => {
        console.log('feed_news:', { data })
        if (data) onNews?.(data)
    })

    socket.on('news_alert', data => {
        console.log('news_alert:', { data })
        if (data) onNews?.(data)
        // Handle initial news display
    })

    socket.on('user_preferences_loaded', data => {
        if (data.success) {
            onStatusChange?.('Authenticated and preferences loaded', '#155724')
            onPreferencesLoaded?.()
        }
    })

    socket.on('subscription_success', data => {
        onSubscriptionSuccess?.(data.channel)
        if (data.channel === 'user_data') {
            onStatusChange?.('Authenticated successfully', '#155724')
        }
    })

    socket.on('subscription_error', data => {
        console.error(`Subscription error: ${data.error}`)
        if (data.channel === 'user_data') {
            onStatusChange?.(`Authentication failed: ${data.error}`, '#721c24')
        }
        onSubscriptionError?.(data.channel, data.error)
    })

    socket.on('connection', data => {
        onServerMessage?.(data.message)
    })
}

export function disconnectSocket() {
    isManualDisconnect = true
    if (socket) {
        socket.disconnect()
        socket = null
    }
    stopHeartbeat()
}

function startHeartbeat() {
    heartbeatInterval = setInterval(() => {
        if (socket?.connected) {
            socket.emit('ping')
        }
    }, 30000)
}

function stopHeartbeat() {
    if (heartbeatInterval) clearInterval(heartbeatInterval)
}
