'use client'

import { useState, useEffect } from 'react'

import {
    isPushNotificationSupported,
    requestNotificationPermission,
    getNotificationPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    getCurrentPushSubscription,
} from '@/utils/pushNotifications'
import ToggleButton from '../ToggleButton'
import Spinner from '../Spinner'
import Button from '../ui/Button'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

interface PushNotificationToggleProps {
    setSubscription: React.Dispatch<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        React.SetStateAction<any>
    >
    setDeleteSubscription: React.Dispatch<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        React.SetStateAction<any>
    >
}

export default function PushNotificationToggle({ setSubscription, setDeleteSubscription }: PushNotificationToggleProps) {
    const [isSupported, setIsSupported] = useState(false)
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

    useEffect(() => {
        const checkSupport = async () => {
            const supported = isPushNotificationSupported()
            setIsSupported(supported)

            if (supported) {
                setPermission(getNotificationPermission())

                try {
                    const registration = await navigator.serviceWorker.ready

                    setSwRegistration(registration)

                    const subscription = await getCurrentPushSubscription(registration)

                    setSubscription(subscription)

                    setIsSubscribed(!!subscription)
                } catch (error) {
                    console.error('Error checking push subscription:', error)
                }
            }

            setIsLoading(false)
        }

        checkSupport()
    }, [])

    const handlePermissionRequest = async () => {
        try {
            const result = await requestNotificationPermission()
            setPermission(result)

            if (result === 'granted') {
                await handleSubscriptionToggle(true)
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error)
            // alert('Failed to request notification permission');
        }
    }

    const handleSubscriptionToggle = async (subscribe: boolean) => {
        if (!swRegistration) return

        setIsLoading(true)

        try {
            if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY') {
                throw new Error('VAPID public key is not configured. Please set the NEXT_PUBLIC_VAPID_PUBLIC_KEY environment variable.')
            }

            const subscription = await subscribeToPushNotifications(swRegistration, VAPID_PUBLIC_KEY)

            if (subscribe) {
                setDeleteSubscription(undefined)
                if (subscription) {
                    setSubscription(subscription)
                }
                setIsSubscribed(true)
            } else {
                if (subscription) {
                    setDeleteSubscription(subscription)
                    await unsubscribeFromPushNotifications(swRegistration)
                    setSubscription(null)
                    setIsSubscribed(false)
                }
            }
        } catch (error) {
            console.error('Error toggling push subscription:', error)
            alert('error')
            alert(JSON.stringify(error))
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const statusEvent = new CustomEvent<{ status: boolean }>('pushNotificationIsSubscribed', {
            detail: {
                status: isSubscribed,
            },
        })
        document.dispatchEvent(statusEvent)
    }, [isSubscribed])

    if (!isSupported) {
        return (
            <div className="flex items-center space-x-2 opacity-50 border">
                <span className="text-sm">Push notifications not supported</span>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2">
                <Spinner />
            </div>
        )
    }

    if (permission !== 'granted') {
        return (
            <Button onClick={handlePermissionRequest} variant="neutral" className="text-2xs">
                Enable Notifications
            </Button>
        )
    }

    return (
        <div className="flex items-center space-x-2">
            <ToggleButton
                isOn={isSubscribed}
                onToggle={() => {
                    handleSubscriptionToggle(!isSubscribed)
                }}
                disabled={isLoading}
                isLoading={isLoading}
            />
        </div>
    )
}
