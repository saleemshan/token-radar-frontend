'use client'

import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import Modal, { ModalMethods } from './Modal'

import WithdrawTokenForm from '../forms/WithdrawTokenForm'
import XButton from '../ui/XButton'

export type WithdrawModalMethods = {
    toggleModal: () => void
    show?: boolean
}

interface WithdrawModalProps {
    onSuccess?: () => void
    onError?: (error: string) => void
    userTokenHoldings?: UserTokenHoldings
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const WithdrawModal = forwardRef<WithdrawModalMethods, WithdrawModalProps>(({ onSuccess, onError, userTokenHoldings }, ref) => {
    const modalRef = useRef<ModalMethods>(null)

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [modalRef])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
        show: modalRef.current?.show,
    }))

    const handleCloseModal = useCallback(() => {
        modalRef.current?.closeModal()
    }, [modalRef])

    return (
        <Modal ref={modalRef} className="z-[5000]">
            <div className="max-w-lg max-h-[80vh] relative w-full bg-black border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="p-3 flex items-center justify-between border-b border-border  bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">Withdraw</div>
                    <div>
                        <XButton onClick={handleToggleModal} />
                    </div>
                </div>

                <div className="flex flex-col w-full overflow-y-auto p-3">
                    <WithdrawTokenForm
                        userTokenHoldings={userTokenHoldings ?? []}
                        handleCancelWithdraw={handleToggleModal}
                        toggleShowWithdrawForm={handleToggleModal}
                        handleCloseModal={handleCloseModal}
                    />
                </div>
            </div>
        </Modal>
    )
})

WithdrawModal.displayName = 'WithdrawModal'

export default WithdrawModal
