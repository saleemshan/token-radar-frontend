'use client'
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react'

import Modal, { ModalMethods } from './Modal'
import StrategyForm from '../forms/StrategyForm'
import XButton from '../ui/XButton'

// import StrategyForm from '../forms/StrategyForm'

type StrategyLogsModalProps = {
    isPerps?: boolean
}

const NewStrategyModal = forwardRef(({ isPerps = true }: StrategyLogsModalProps, ref) => {
    const modalRef = React.createRef<ModalMethods>()
    const [isEdit, setIsEdit] = useState(false)
    const [strategy, setStrategy] = useState<Strategy>()

    const handleToggleModal = useCallback(
        (isEdit: boolean, item?: Strategy) => {
            setIsEdit(isEdit)
            if (item) {
                setStrategy(item)
            }
            modalRef.current?.toggleModal()
        },
        [modalRef]
    )

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    return (
        <Modal ref={modalRef}>
            <div className="max-w-xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full ">
                <div className="p-3 flex border-b border-border items-center bg-black">
                    <div className=" text-base   font-semibold leading-6 text-white flex-1 ">{`${isEdit ? 'Edit' : 'Create'} ${
                        isPerps ? 'Perps' : 'Spot'
                    } Strategy`}</div>
                    <div>
                        <XButton
                            onClick={() => {
                                modalRef.current?.closeModal()
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col  max-h-[80vh] overflow-hidden">
                    {isPerps ? (
                        <StrategyForm
                            isPerps={isPerps}
                            isEdit={isEdit}
                            strategy={isEdit ? strategy : undefined}
                            handleCloseModal={() => {
                                modalRef.current?.closeModal()
                            }}
                        />
                    ) : (
                        <StrategyForm
                            isPerps={isPerps}
                            isEdit={isEdit}
                            strategy={isEdit ? strategy : undefined}
                            handleCloseModal={() => {
                                modalRef.current?.closeModal()
                            }}
                        />
                    )}
                </div>
            </div>
        </Modal>
    )
})

NewStrategyModal.displayName = 'NewStrategyModal'

export default NewStrategyModal
