import React, { useEffect, useState } from 'react'
import PushNotificationToggle from '../notifications/PushNotificationToggle'
import { NotificationPreferences } from '@/types/pushnotifications'
import { getUppercaseFirstLetter } from '@/utils/string'
import { useUserNotificationPreferencesData } from '@/hooks/data/useUserNotificationPreferencesData'
import TextLoading from '../TextLoading'
import Spinner from '../Spinner'
import Button from '../ui/Button'
import axiosLib from '@/lib/axios'
import { useUser } from '@/context/UserContext'
import { toast } from 'react-toastify'
import { usePrivy } from '@privy-io/react-auth'
import useHaptic from '@/hooks/useHaptic'

interface NotificationPreferencesProps {
    handleToggleModal: () => void
}

const NotificationPreferencesForm = ({ handleToggleModal }: NotificationPreferencesProps) => {
    const { ready, authenticated } = usePrivy()
    const enabledPreferences = ['ats', 'news'] //'alert','ats','news','silent','system','trade'
    const { data, isLoading } = useUserNotificationPreferencesData()
    const { fingerprint } = useUser()
    const { triggerHaptic } = useHaptic()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [subscription, setSubscription] = useState<any>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [deleteSubscription, setDeleteSubscription] = useState<any>(null)
    const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | undefined>(undefined)

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmitForm = async () => {
        triggerHaptic(50)
        if (isLoading) return

        if (!fingerprint) return toast.error('Something went wrong, please try again [No fingerprint]')

        setIsSubmitting(true)

        try {
            await axiosLib.post('/api/notifications', {
                subscription,
                preferences: notificationPreferences,
                deleteSubscription,
                fingerprint,
            })
            setIsSubmitting(false)
            toast.success('Notification preferences successfully updated.')
        } catch (error) {
            console.log(error)
            toast.error('Something went wrong, please try again.')
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (data && data.preferences) {
            setNotificationPreferences(data.preferences)
        }
    }, [data, isLoading])

    if (ready && authenticated)
        return (
            <div className="flex flex-col w-full gap-3 flex-1">
                <div className="flex items-center justify-between h-8">
                    <div className="flex items-center gap-1 ">
                        <div className="text-sm text-neutral-text ">Enable Notifications</div>
                    </div>
                    <PushNotificationToggle setSubscription={setSubscription} setDeleteSubscription={setDeleteSubscription} />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <div className="text-sm text-neutral-text ">Notification Preferences</div>
                    <div className="grid grid-cols-2 gap-3">
                        {isLoading ? (
                            <>
                                {Array.from({ length: 5 }).map((_, index) => {
                                    return <TextLoading key={index} />
                                })}
                            </>
                        ) : (
                            <>
                                {notificationPreferences &&
                                    Object.entries(notificationPreferences).map(([key, value]) => {
                                        if (enabledPreferences.includes(key))
                                            return (
                                                <div key={key} className="gap-1 flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={value ?? false}
                                                        disabled={subscription?.endpoint ? false : true}
                                                        onChange={event => {
                                                            setNotificationPreferences({
                                                                ...notificationPreferences,
                                                                [key]: event.target.checked,
                                                            })
                                                        }}
                                                        className="w-4 h-4 border-neutral-800 rounded-md"
                                                    />
                                                    <label htmlFor="">{getUppercaseFirstLetter(key)}</label>
                                                </div>
                                            )
                                    })}
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-col w-full gap-3">
                    <div className="flex items-center justify-end gap-3 text-xs">
                        <Button onClick={handleToggleModal} variant="ghost">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitForm} variant="primary">
                            <span>Save</span>
                            {isSubmitting && <Spinner variant="primary" className="mb-[2px]" />}
                        </Button>
                    </div>
                </div>
            </div>
        )
}

export default NotificationPreferencesForm
