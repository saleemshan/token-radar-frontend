'use client'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import Modal, { ModalMethods } from './Modal'
import Button from '../ui/Button'
import Input from '../Input'
import useUserReferralCode, { useMutateReferralCode } from '@/hooks/data/useUserReferralCode'
import { toast } from 'react-toastify'
import Spinner from '../Spinner'
import axios from 'axios'
import XButton from '../ui/XButton'
import useHaptic from '@/hooks/useHaptic'

const CustomizeReferralCodeModal = forwardRef((_, ref) => {
    const modalRef = React.createRef<ModalMethods>()
    const { triggerHaptic } = useHaptic()

    const { data: userReferralCode } = useUserReferralCode()

    const {
        mutate: updateReferralCode,
        error: errorReferralCode,
        isSuccess: isUpdateReferralCodeSuccess,
        isError: isUpdateReferralCodeError,
        isPending: isUpdateReferralCodePending,
    } = useMutateReferralCode()

    const [code, setCode] = useState('')

    useEffect(() => {
        if (userReferralCode && userReferralCode.referCode) {
            setCode(userReferralCode.referCode)
        }
    }, [userReferralCode])

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [modalRef])

    useEffect(() => {
        if (isUpdateReferralCodeSuccess) {
            toast.success('Referral code updated successfully.')
            handleToggleModal()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isUpdateReferralCodeSuccess])

    useEffect(() => {
        if (isUpdateReferralCodeError) {
            if (axios.isAxiosError(errorReferralCode)) {
                toast.error(errorReferralCode.response?.data?.error || 'Something went wrong, try again.')
            } else {
                toast.error('Something went wrong, try again.')
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isUpdateReferralCodeError])

    const handleSubmitForm = async () => {
        triggerHaptic(50)
        if (code === userReferralCode?.referCode) {
            toast.error('Referral code cannot be the same as the old one.')
            return
        }

        updateReferralCode({ newReferCode: code })
        // handleToggleModal()
    }

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    return (
        <Modal ref={modalRef}>
            <form
                onSubmit={e => {
                    e.preventDefault()
                    handleSubmitForm()
                }}
                className="max-w-xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full "
            >
                <div className="p-3 flex border-b border-border items-center bg-black">
                    <div className=" text-base   font-semibold leading-6 text-white flex-1 ">Edit Referral Code</div>
                    <div>
                        <XButton
                            onClick={() => {
                                modalRef.current?.closeModal()
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col p-3 pb-0 max-h-[50vh] overflow-y-auto gap-4">
                    <div className="w-full flex flex-col gap-1">
                        <div className="text-sm text-neutral-text font-semibold">Code</div>
                        <Input
                            value={code}
                            onChange={e => {
                                const alphanumeric = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                                setCode(alphanumeric)
                            }}
                            type="text"
                        ></Input>
                    </div>
                </div>

                <div className="flex flex-col w-full p-3 gap-3">
                    <div className="flex items-center justify-end gap-3 text-xs">
                        <Button onClick={handleToggleModal} variant="ghost" disabled={isUpdateReferralCodePending}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitForm} variant="primary" disabled={isUpdateReferralCodePending}>
                            <span>Save</span>
                            {isUpdateReferralCodePending && <Spinner variant="primary" className="" />}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    )
})

CustomizeReferralCodeModal.displayName = 'CustomizeReferralCodeModal'

export default CustomizeReferralCodeModal
