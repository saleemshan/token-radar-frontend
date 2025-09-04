import React, { forwardRef, useCallback, useImperativeHandle } from 'react'

import { IoIosClose } from 'react-icons/io'
import Spinner from '../Spinner'
import { ModalMethods } from '../modal/Modal'
import Modal from '../modal/Modal'

interface EstablishConnectionModalProps {
    onEstablishConnection: () => void
    isLoading?: boolean
}

const EstablishConnectionModal = forwardRef<ModalMethods, EstablishConnectionModalProps>(({ onEstablishConnection, isLoading }, ref) => {
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
        toggleModal: handleToggleModal,
        openModal: handleOpenModal,
        closeModal: handleCloseModal,
    }))

    return (
        <Modal ref={modalRef}>
            <div className="relative bg-black border border-border rounded-lg w-[90%] max-w-lg p-6">
                <button
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-neutral-text-dark hover:text-neutral-text hover:bg-neutral-800 rounded-lg apply-transition"
                    onClick={handleToggleModal}
                >
                    <IoIosClose className="w-8 h-8 text-white" />
                </button>

                <div className="border-b border-border pb-4 text-lg font-semibold text-neutral-text">Establish Connection</div>

                <div className="border-b border-border py-6 text-sm text-neutral-text space-y-4">
                    <p className="text-neutral-text-dark">
                        This signature is gas-free to send. It opens a decentralized channel for gas-free and instantaneous trading.
                    </p>
                </div>

                <button
                    className="mt-4 w-full base-button bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:hover:bg-primary/10"
                    onClick={onEstablishConnection}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <Spinner />
                            <span>Establishing...</span>
                        </div>
                    ) : (
                        'Establish Connection'
                    )}
                </button>
            </div>
        </Modal>
    )
})

EstablishConnectionModal.displayName = 'EstablishConnectionModal'

export default EstablishConnectionModal
