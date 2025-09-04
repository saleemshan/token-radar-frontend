'use client'

import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import Modal, { ModalMethods } from './Modal'
import Button from '../ui/Button'
import { useReferralValidation } from '@/hooks/data/useReferralValidation'
import { useReferralGate } from '@/context/ReferralGateContext'
import { FaSignOutAlt } from 'react-icons/fa'
import { useUser } from '@/context/UserContext'

interface ReferralCodeRequiredModalProps {
    onValidCode: (code: string) => void
    isRegistering: boolean
}

export type ReferralCodeRequiredModalMethods = {
    show?: boolean
    toggleModal: () => void
    closeModal: () => void
    openModal: () => void
}

const ReferralCodeRequiredModal = forwardRef<ReferralCodeRequiredModalMethods, ReferralCodeRequiredModalProps>(
    ({ onValidCode, isRegistering }, ref) => {
        const { referralCode, setReferralCode } = useReferralGate()
        const [error, setError] = useState('')
        const { handleLogout } = useUser()
        const { mutate: validateCode, isPending } = useReferralValidation()
        const modalRef = React.createRef<ModalMethods>()

        const handleToggleModal = useCallback(() => {
            modalRef.current?.toggleModal()
        }, [modalRef])

        const handleOpenModal = useCallback(() => {
            modalRef.current?.openModal()
        }, [modalRef])

        const handleCloseModal = useCallback(() => {
            modalRef.current?.closeModal()
        }, [modalRef])

        useImperativeHandle(ref, () => ({
            show: modalRef.current?.show,
            toggleModal: handleToggleModal,
            closeModal: handleCloseModal,
            openModal: handleOpenModal,
        }))

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault()
            setError('')

            if (!referralCode.trim()) {
                setError('Please enter a referral code')
                return
            }

            validateCode(referralCode.trim(), {
                onSuccess: data => {
                    if (data.valid) {
                        onValidCode(referralCode.trim())
                    } else {
                        setError('Invalid referral code. Please check and try again.')
                    }
                },
                onError: () => {
                    setError('Invalid referral code. Please check and try again.')
                },
            })
        }

        return (
            <Modal ref={modalRef} padding="p-0 md:p-3" disableOutsideClick={true}>
                <div className="md:max-w-lg bg-black md:border border-border md:rounded-lg overflow-hidden flex flex-col w-full h-full md:max-h-[80vh] md:h-fit">
                    <div className="p-3 flex border-b border-border items-center bg-black">
                        <div className="text-base font-semibold leading-6 text-white flex-1">Referral Code Required</div>
                        <button
                            type="button"
                            title="Logout"
                            onClick={() => {
                                handleCloseModal()
                                handleLogout()
                            }}
                            className="flex bg-table-odd border border-border hover:bg-neutral-900 rounded-lg w-8 md:w-9 h-8 md:h-9 items-center justify-center text-neutral-text apply-transition text-sm md:text-base"
                        >
                            <FaSignOutAlt className="" />
                        </button>
                    </div>

                    <div className="flex flex-col w-full p-3 gap-3">
                        <div className="text-neutral-text text-sm">
                            To join Crush, you need a referral code from an existing user. Enter your referral code below to continue.
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <div>
                                {/* <label htmlFor="referralCode" className="block text-sm font-medium text-neutral-text mb-2">
                                    Code
                                </label> */}
                                <input
                                    type="text"
                                    id="referralCode"
                                    value={referralCode || ''}
                                    onChange={e => setReferralCode(e.target.value)}
                                    className="w-full px-3 py-2 bg-table-odd focus:bg-neutral-900 border border-border rounded-lg text-neutral-text placeholder-neutral-text-dark focus:outline-none apply-transition outline-none"
                                    placeholder="Enter your referral code"
                                    disabled={isPending || isRegistering}
                                />
                                {error && <p className="text-negative text-sm mt-1">{error}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-2">
                                <Button type="submit" variant="primary" className="text-xs" disabled={isPending || isRegistering}>
                                    {isPending ? 'Validating...' : isRegistering ? 'Registering...' : 'Confirm'}
                                </Button>
                            </div>
                        </form>

                        {/* <div className="mt-2 pt-3 border-t border-border">
                            <p className="text-xs text-neutral-text-dark text-center">
                                Don&apos;t have a referral code? Ask an existing Crush user to share their referral link with you.
                            </p>
                        </div> */}
                    </div>
                </div>
            </Modal>
        )
    }
)

ReferralCodeRequiredModal.displayName = 'ReferralCodeRequiredModal'

export default ReferralCodeRequiredModal
