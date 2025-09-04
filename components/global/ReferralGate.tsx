'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useReferralGate } from '@/context/ReferralGateContext'
import ReferralCodeRequiredModal, { ReferralCodeRequiredModalMethods } from '@/components/modal/ReferralCodeRequiredModal'
import axiosLib from '@/lib/axios'
import { toast } from 'react-toastify'

const ReferralGate: React.FC = () => {
    const { ready, authenticated, user } = usePrivy()
    const { setReferralCode, showReferralModal, setShowReferralModal, setIsNewUser } = useReferralGate()
    const modalRef = useRef<ReferralCodeRequiredModalMethods>(null)
    const [isRegistering, setIsRegistering] = useState(false)
    const [hasCheckedUser, setHasCheckedUser] = useState(false)
    const [referralCompleted, setReferralCompleted] = useState(false)
    const [isCheckingReferral, setIsCheckingReferral] = useState(false)

    // Reset state when a different user logs in (different email)
    useEffect(() => {
        if (ready && authenticated && user && user.email) {
            const currentUserEmail = typeof user.email === 'string' ? user.email : user.email.address
            const lastUserEmail = localStorage.getItem('lastUserEmail')

            if (currentUserEmail && currentUserEmail !== lastUserEmail) {
                setHasCheckedUser(false)
                setShowReferralModal(false)
                setIsNewUser(false)
                setIsCheckingReferral(false)

                localStorage.setItem('lastUserEmail', currentUserEmail)
            }
        }
    }, [ready, authenticated, user, setHasCheckedUser, setShowReferralModal, setIsNewUser])

    // Clean up localStorage when user logs out
    useEffect(() => {
        if (ready && !authenticated) {
            setReferralCode('')
            setReferralCompleted(false)
            setIsCheckingReferral(false)
            localStorage.removeItem('lastUserEmail')
        }
    }, [ready, authenticated, setReferralCode])

    // Control tutorial visibility based on referral status
    useEffect(() => {
        if (isCheckingReferral || showReferralModal) {
            // Prevent tutorial from starting when checking referral or modal is open
            localStorage.setItem('crush_intro_news_trading_page', 'true')
            // Dispatch event to notify other components
            window.dispatchEvent(new Event('referral-modal-open'))
        } else if (referralCompleted && !isCheckingReferral) {
            // Allow tutorial to start after referral is completed and not checking
            localStorage.removeItem('crush_intro_news_trading_page')
            // Dispatch event to notify other components
            window.dispatchEvent(new Event('referral-completed'))
        }
    }, [isCheckingReferral, showReferralModal, referralCompleted])

    // Check if user is new by checking if they exist in our referral system
    useEffect(() => {
        // Only check once per session and if user is authenticated
        if (ready && authenticated && user && !hasCheckedUser) {
            const checkUserInReferralSystem = async () => {
                setIsCheckingReferral(true)
                try {
                    await axiosLib.get('/api/user/referral')
                    setIsNewUser(false)
                } catch (error) {
                    setIsNewUser(true)
                    setShowReferralModal(true)
                } finally {
                    setHasCheckedUser(true)
                    setIsCheckingReferral(false)
                }
            }

            checkUserInReferralSystem()
        }
    }, [ready, authenticated, user, hasCheckedUser, setIsNewUser, setShowReferralModal])

    useEffect(() => {
        if (showReferralModal) {
            modalRef.current?.openModal()
        }
    }, [showReferralModal])

    const handleValidReferralCode = async (code: string) => {
        try {
            setIsRegistering(true)
            // Register user with referral code
            await axiosLib.post('/api/user/referral/register', {
                referrerCode: code,
            })

            setReferralCode(code)
            setShowReferralModal(false)
            setIsNewUser(false)
            setReferralCompleted(true)
            // Close the modal automatically after successful registration
            modalRef.current?.closeModal()
            toast.success('Referral code registered successfully')
        } catch (error) {
            // Show error toast for failed referral code registration
            toast.error('Failed to register with referral code. Please try again.')
        } finally {
            setIsRegistering(false)
        }
    }

    return <ReferralCodeRequiredModal ref={modalRef} onValidCode={handleValidReferralCode} isRegistering={isRegistering} />
}

export default ReferralGate
