'use client'

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useSearchParams } from 'next/navigation'

interface ReferralGateContextType {
    referralCode: string
    setReferralCode: (code: string) => void
    showReferralModal: boolean
    setShowReferralModal: (show: boolean) => void
    isNewUser: boolean
    setIsNewUser: (isNew: boolean) => void
}

const ReferralGateContext = createContext<ReferralGateContextType | undefined>(undefined)

export const useReferralGate = () => {
    const context = useContext(ReferralGateContext)
    if (!context) {
        throw new Error('useReferralGate must be used within a ReferralGateProvider')
    }
    return context
}

export const ReferralGateProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [referralCode, setReferralCode] = useState('')
    const [showReferralModal, setShowReferralModal] = useState(false)
    const [isNewUser, setIsNewUser] = useState(false)
    const { ready, authenticated, user } = usePrivy()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (ready && authenticated && user) {
            // Check if user has a referral code from URL params
            const urlReferralCode = searchParams.get('ref')

            if (urlReferralCode) {
                setReferralCode(urlReferralCode)
            }
        }
    }, [ready, authenticated, user, isNewUser, searchParams, referralCode])

    return (
        <ReferralGateContext.Provider
            value={{
                referralCode,
                setReferralCode,
                showReferralModal,
                setShowReferralModal,
                isNewUser,
                setIsNewUser,
            }}
        >
            {children}
        </ReferralGateContext.Provider>
    )
}

// Create the main provider that includes Suspense
const ReferralGateProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <Suspense>
            <ReferralGateProviderInner>{children}</ReferralGateProviderInner>
        </Suspense>
    )
}

export default ReferralGateProvider
