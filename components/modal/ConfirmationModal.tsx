import React, { forwardRef, useCallback, useImperativeHandle } from 'react'
import Modal, { ModalMethods } from './Modal'
import Button from '../ui/Button'
import useHaptic from '@/hooks/useHaptic'

const ConfirmationModal = forwardRef(
    (
        props: {
            header: string
            type: 'danger' | 'normal' | 'primary'
            content: string
            action: () => void
            submitText?: string
            onModalClose?: () => void
        },
        ref
    ) => {
        const { triggerHaptic } = useHaptic()
        const modalRef = React.createRef<ModalMethods>()

        const handleToggleModal = useCallback(() => {
            modalRef.current?.toggleModal()
        }, [modalRef])

        const handleCloseModal = useCallback(() => {
            modalRef.current?.closeModal()
        }, [modalRef])

        useImperativeHandle(ref, () => ({
            show: modalRef.current?.show,
            toggleModal: handleToggleModal,
            closeModal: handleCloseModal,
        }))

        return (
            <Modal ref={modalRef}>
                <div className="max-w-xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full ">
                    <div className="p-3 flex border-b border-border items-center bg-black">
                        <div className=" text-base font-semibold leading-6 text-white flex-1 ">{props.header}</div>
                    </div>
                    <div className="flex flex-col w-full p-3 gap-3">
                        <div className=" w-full break-words ">{props.content}</div>
                        <div className="flex items-center justify-end gap-3">
                            <Button
                                onClick={() => {
                                    if (props.onModalClose) {
                                        props.onModalClose()
                                    }
                                    handleToggleModal()
                                }}
                                variant="ghost"
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    triggerHaptic(50)
                                    props.action()
                                    handleToggleModal()
                                }}
                                variant={props.type}
                                className="text-xs"
                            >
                                <span>{props.submitText ?? 'Delete'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
)

ConfirmationModal.displayName = 'ConfirmationModal'

export default ConfirmationModal
