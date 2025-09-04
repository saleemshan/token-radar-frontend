'use client'
import React, { useEffect, useState } from 'react'
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa'
import { PiSpeakerSimpleSlashFill } from 'react-icons/pi'
import axiosLib from '@/lib/axios'

import Spinner from '../Spinner'
import { useUserNotificationPreferencesData } from '@/hooks/data/useUserNotificationPreferencesData'
import { useSettingsContext } from '@/context/SettingsContext'
import { NotificationPreferences } from '@/types/pushnotifications'
import { usePushNotificationSubscription } from '@/hooks/usePushNotificationSubscription'
import { useUser } from '@/context/UserContext'

type Props = {
    onSilentChange?: (value: boolean) => void
}

const NewsSoundButton = ({ onSilentChange }: Props) => {
    const { data, isLoading } = useUserNotificationPreferencesData()
    const { handleToggleSettingsModal } = useSettingsContext()
    const { subscription, isSubscribed } = usePushNotificationSubscription()
    const { fingerprint } = useUser()

    const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | undefined>(undefined)
    const [silent, setSilent] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleToggleSound = async () => {
        if (isLoading || isSubmitting) return

        if (!subscription) {
            handleToggleSettingsModal()
            return
        }

        setIsSubmitting(true)

        let newSilent = false
        if (silent) {
            newSilent = false
        } else {
            newSilent = true
        }

        try {
            await axiosLib.post('/api/notifications', {
                fingerprint,
                subscription,
                preferences: { ...notificationPreferences, silent: newSilent },
                deleteSubscription: undefined,
            })
            setIsSubmitting(false)
            setSilent(!silent)
        } catch (error) {
            console.log(error)
            setIsSubmitting(false)
        }

        onSilentChange?.(!silent)
    }

    useEffect(() => {
        const handleUpdateData = async () => {
            if (data && data.preferences) {
                setNotificationPreferences(data.preferences)
                setSilent(data.preferences.silent)
            }
        }

        handleUpdateData()
    }, [data])

    return (
        <button
            disabled={isSubmitting || isLoading}
            type="button"
            onClick={handleToggleSound}
            className={`flex bg-table-odd border border-border rounded-lg px-1 gap-2 w-8 min-w-8 h-8 min-h-8  items-center justify-center hover:bg-neutral-900 apply-transition text-neutral-text `}
            title={!isSubscribed ? 'Enable push notifications' : silent ? 'Disable SFX' : 'Enable SFX'}
        >
            {isSubmitting || isLoading ? (
                <Spinner className="mb-[2px]" />
            ) : (
                <>
                    {!subscription ? (
                        <PiSpeakerSimpleSlashFill className="lg:text-sm" />
                    ) : (
                        <>{silent ? <FaVolumeMute className="lg:text-sm" /> : <FaVolumeUp className="lg:text-sm" />}</>
                    )}
                </>
            )}
        </button>
    )
}

export default NewsSoundButton
