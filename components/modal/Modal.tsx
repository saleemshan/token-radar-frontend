'use client'

import Portal from '@/portal/ModalPortal'
import { BridgeSelectTarget, BridgeSelectType } from '@/types/bridge'
import React, { forwardRef, useImperativeHandle, useState } from 'react'

interface ModalProps {
    // Define the props interface here
    children: React.ReactNode
    className?: string
    padding?: string
    id?: string
    disableOutsideClick?: boolean
}
export type ModalMethods = {
    toggleModal: () => void
    show?: boolean
    closeModal: () => void
    openModal: () => void
}

export type BridgeModalMethods = {
    toggleModal: (selectTarget: BridgeSelectTarget, selectType?: BridgeSelectType) => void
    show?: boolean
}

const Modal = forwardRef<ModalMethods, ModalProps>(({ className, children, padding = 'p-3', id, disableOutsideClick = false }, ref) => {
    const [show, setShow] = useState(false)

    const handleToggleModal = () => {
        setShow(prevShow => !prevShow)
    }
    const closeModal = () => {
        setShow(false)
    }
    const openModal = () => {
        setShow(true)
    }

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
        show,
        closeModal,
        openModal,
    }))

    return (
        <Portal targetId="modal-portal">
            {show && (
                <div
                    id={id}
                    onClick={e => {
                        if (!disableOutsideClick && e.target === e.currentTarget) closeModal()
                    }}
                    className={`${className} fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center  z-[5000] ${
                        padding ? padding : ''
                    }`}
                >
                    {children}
                </div>
            )}
        </Portal>
    )
})

Modal.displayName = 'Modal'
export default Modal
