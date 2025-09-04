export type PushSubscription = {
    endpoint: string
    expirationTime: number | null
    keys: {
        p256dh: string
        auth: string
    }
}

export type NotificationAction = {
    action: string
    title: string
    icon?: string
}

export type NotificationOptions = {
    body?: string
    icon?: string
    badge?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any
    actions?: NotificationAction[]
    vibrate?: number[]
    tag?: string
    renotify?: boolean
    requireInteraction?: boolean
    silent?: boolean
    url?: string
}

export type UserNotificationPreferences = {
    privyId: string
    isSubscribed: boolean
    preferences: NotificationPreferences
}

export type NotificationPreferences = {
    [key: string]: boolean
}

export type UserNotificationPreferencesParams = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscription: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deleteSubscription: any
    preferences: NotificationPreferences
}
