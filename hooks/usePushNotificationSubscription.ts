// usePushNotificationSubscription.ts
import { getCurrentPushSubscription } from '@/utils/pushNotifications'
import { useEffect, useState } from 'react'

export const usePushNotificationSubscription = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [subscription, setSubscription] = useState<any>(null)
    const [isSubscribed, setIsSubscribed] = useState(false)

    useEffect(() => {
        const handleGetSubscription = async () => {
            const registration = await navigator.serviceWorker.ready
            const sub = await getCurrentPushSubscription(registration)

            if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('notif subs :', { registration, sub })
            setSubscription(sub)
            setIsSubscribed(!!sub)
        }

        handleGetSubscription()

        const handleCustomEvent = (event: CustomEvent<{ status: boolean }>) => {
            if (process.env.NODE_ENV === 'development') console.log('Push notification subscription status:', event.detail.status)

            handleGetSubscription()
        }

        document.addEventListener('pushNotificationIsSubscribed', handleCustomEvent as EventListener)

        return () => {
            document.removeEventListener('pushNotificationIsSubscribed', handleCustomEvent as EventListener)
        }
    }, [])

    return { subscription, isSubscribed }
}
