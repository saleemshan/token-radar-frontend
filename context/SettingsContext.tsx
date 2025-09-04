'use client'

import SettingsModal, { SettingsTab } from '@/components/modal/SettingsModal'
import { useUserNotificationPreferencesData } from '@/hooks/data/useUserNotificationPreferencesData'
import { usePushNotificationSubscription } from '@/hooks/usePushNotificationSubscription'
import axiosLib from '@/lib/axios'
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { useUser } from './UserContext'

interface SettingsContextProps {
    hideSmallAssets: boolean
    setHideSmallAssets: (hideSmallAssets: boolean) => void

    now: number
    timezone: string
    selectedTimezoneOption: TimezoneOption
    setTimezoneOption: (option: TimezoneOption) => void

    enableBubbleAnimation: boolean
    setEnableBubbleAnimation: (enableBubbleAnimation: boolean) => void

    handleToggleSettingsModal: (activeTab?: SettingsTab) => void
    handleOpenSettingsModal: () => void
    handleCloseSettingsModal: () => void
}

const SettingsContext = createContext({} as SettingsContextProps)

export const useSettingsContext = () => {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error('context must be used within a SettingsProvider')
    }
    return context
}

const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const settingsModalRef = useRef<{
        toggleModal: (activeTab?: SettingsTab) => void
        openModal: () => void
        closeModal: () => void
    }>(null)

    const { subscription, isSubscribed } = usePushNotificationSubscription()
    const { data, isLoading } = useUserNotificationPreferencesData()
    const { fingerprint } = useUser()

    const latestNotificationData = useRef({ isLoading, fingerprint, data, isSubscribed, subscription })

    const [now, setNow] = useState(Date.now())

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        latestNotificationData.current = { isLoading, fingerprint, data, isSubscribed, subscription }
    }, [isLoading, fingerprint, data, isSubscribed, subscription])

    useEffect(() => {
        async function handleUpdateNotificationPreferences() {
            const { isLoading, fingerprint, data, isSubscribed, subscription } = latestNotificationData.current
            const lastRun = parseInt(localStorage.getItem('notificationUpdateTimestamp') || '0')
            const timer = 24 * 60 * 60 * 1000 // 1 day
            const now = Date.now()

            if (now - lastRun < timer) return

            // console.log('notification preferences:', { isLoading, fingerprint, data, isSubscribed, subscription })

            if (!isLoading && fingerprint && data && isSubscribed && subscription) {
                try {
                    console.log('Updating notification preferences')
                    await axiosLib.post('/api/notifications', {
                        subscription,
                        preferences: data.preferences,
                        deleteSubscription: undefined,
                        fingerprint,
                    })
                    localStorage.setItem('notificationUpdateTimestamp', now.toString())
                } catch (error) {
                    console.log('Error updating notification preferences:', error)
                }
            }
        }

        const interval = setInterval(() => {
            // console.log('notification preferences: interval')
            handleUpdateNotificationPreferences()
        }, 10 * 60 * 1000) // check every 10 minute

        handleUpdateNotificationPreferences()

        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleToggleSettingsModal = (activeTab?: SettingsTab) => {
        settingsModalRef.current?.toggleModal(activeTab)
    }
    const handleOpenSettingsModal = () => {
        settingsModalRef.current?.openModal()
    }
    const handleCloseSettingsModal = () => {
        settingsModalRef.current?.closeModal()
    }

    const [hideSmallAssets, setHideSmallAssets] = useState(false)

    useEffect(() => {
        //get from local storage
        const parsedHideSmallAssets = localStorage.getItem('settingsHideSmallAssets')

        if (parsedHideSmallAssets) {
            setHideSmallAssets(JSON.parse(parsedHideSmallAssets))
        }
    }, [])

    const [enableBubbleAnimation, setEnableBubbleAnimation] = useState(false)

    useEffect(() => {
        const enableBubbleAnimation = localStorage.getItem('settingsEnableBubbleAnimation') ?? 'true'

        if (enableBubbleAnimation) {
            setEnableBubbleAnimation(JSON.parse(enableBubbleAnimation))
        }
    }, [])

    const [selectedTimezoneOption, setSelectedTimezoneOption] = useState<TimezoneOption>('auto')

    const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone)

    // Load from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('user-timezone')
        if (stored) {
            setSelectedTimezoneOption(stored as TimezoneOption)
            if (stored !== 'auto') setTimezone(stored)
        }
    }, [])

    // Update timezone on change
    const setTimezoneOption = (option: TimezoneOption) => {
        setSelectedTimezoneOption(option)
        localStorage.setItem('user-timezone', option)
        if (option === 'auto') {
            setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
        } else {
            setTimezone(option)
        }
    }

    return (
        <SettingsContext.Provider
            value={{
                now,
                hideSmallAssets,
                setHideSmallAssets,
                timezone,
                selectedTimezoneOption,
                setTimezoneOption,
                enableBubbleAnimation,
                setEnableBubbleAnimation,
                handleToggleSettingsModal,
                handleOpenSettingsModal,
                handleCloseSettingsModal,
            }}
        >
            {children}
            <SettingsModal ref={settingsModalRef} />
        </SettingsContext.Provider>
    )
}

export default SettingsProvider
