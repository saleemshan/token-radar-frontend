import React, { forwardRef, useCallback, useImperativeHandle } from 'react'
import Modal, { ModalMethods } from '@/components/modal/Modal'
import XButton from '../ui/XButton'

const PositionModeModal = forwardRef((_, ref) => {
    const modalRef = React.createRef<ModalMethods>()

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [modalRef])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    return (
        <Modal ref={modalRef}>
            <div className="relative w-full max-w-lg flex flex-col bg-black border border-border overflow-hidden rounded-lg">
                <div className="p-3 flex items-center justify-between border-b border-border  bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">BTC-USD Position Mode</div>
                    <div>
                        <XButton onClick={handleToggleModal} />
                    </div>
                </div>

                <div className="border-b border-border  text-xs text-neutral-text p-3">
                    <p className="text-neutral-text ">
                        Your position on this coin is either short or long. Orders specify a size and direction only; there is no distinction between
                        open and close when placing an order.
                    </p>
                </div>
            </div>
        </Modal>
    )
})

PositionModeModal.displayName = 'PositionModeModal'
export default PositionModeModal
