import { PushSubscription } from '@/types/pushnotifications'

// Check if push notifications are supported
export const isPushNotificationSupported = () => {
    return 'serviceWorker' in navigator && 'PushManager' in window
}

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!isPushNotificationSupported()) {
        throw new Error('Push notifications are not supported in this browser')
    }

    return await Notification.requestPermission()
}

// Get the current notification permission status
export const getNotificationPermission = (): NotificationPermission => {
    if (!isPushNotificationSupported()) {
        return 'denied'
    }

    return Notification.permission
}

// Convert a PushSubscription to a format suitable for sending to a server
export const convertPushSubscriptionToJSON = (subscription: PushSubscriptionJSON): PushSubscription => {
    return {
        endpoint: subscription.endpoint ?? '',
        expirationTime: subscription.expirationTime ?? null,
        keys: {
            p256dh: subscription.keys?.p256dh || '',
            auth: subscription.keys?.auth || '',
        },
    }
}

// Subscribe to push notifications
export const subscribeToPushNotifications = async (
    serviceWorkerRegistration: ServiceWorkerRegistration,
    applicationServerKey: string
): Promise<PushSubscription | null> => {
    try {
        // Check if applicationServerKey is valid
        if (!applicationServerKey || applicationServerKey === 'YOUR_VAPID_PUBLIC_KEY') {
            console.error('Invalid VAPID public key. Please set a valid key.')
            return null
        }

        const convertedKey = urlBase64ToUint8Array(applicationServerKey)

        const subscription = await serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey as BufferSource,
        })

        return convertPushSubscriptionToJSON(subscription.toJSON())
    } catch (error) {
        console.error('Failed to subscribe to push notifications:', error)
        return null
    }
}

// Unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async (serviceWorkerRegistration: ServiceWorkerRegistration): Promise<boolean> => {
    try {
        const subscription = await serviceWorkerRegistration.pushManager.getSubscription()

        if (subscription) {
            await subscription.unsubscribe()
            return true
        }

        return false
    } catch (error) {
        console.error('Failed to unsubscribe from push notifications:', error)
        return false
    }
}

// Get the current push subscription
export const getCurrentPushSubscription = async (serviceWorkerRegistration: ServiceWorkerRegistration): Promise<PushSubscription | null> => {
    try {
        const subscription = await serviceWorkerRegistration.pushManager.getSubscription()

        if (subscription) {
            return convertPushSubscriptionToJSON(subscription.toJSON())
        }

        return null
    } catch (error) {
        console.error('Failed to get current push subscription:', error)
        return null
    }
}

// Helper function to convert a base64 string to Uint8Array
// This is needed for the applicationServerKey
export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    // Make sure the input is not empty or the placeholder value
    if (!base64String || base64String === 'YOUR_VAPID_PUBLIC_KEY') {
        throw new Error('Invalid VAPID public key')
    }

    // Remove any whitespace from the base64 string
    const trimmedBase64 = base64String.trim()

    // Add padding if necessary
    const padding = '='.repeat((4 - (trimmedBase64.length % 4)) % 4)
    const base64 = (trimmedBase64 + padding).replace(/-/g, '+').replace(/_/g, '/')

    try {
        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
        }

        return outputArray
    } catch (error) {
        console.error('Error converting base64 to Uint8Array:', error)
        throw new Error('Invalid base64 string for VAPID key')
    }
}
