'use client'
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react'

import Modal, { ModalMethods } from './Modal'

import { useSingleAtsData } from '@/hooks/data/useAtsData'
import StrategyLogs from '../StrategyLogs'
import Spinner from '../Spinner'
import XButton from '../ui/XButton'

type StrategyLogsModalProps = {
    isPerps?: boolean
}

const StrategyLogsModal = forwardRef(({ isPerps = true }: StrategyLogsModalProps, ref) => {
    const modalRef = React.createRef<ModalMethods>()
    const [id, setId] = useState('')
    const [title, setTitle] = useState('')
    const { data: atsData, isLoading: atsDataIsLoading } = useSingleAtsData(id, isPerps)

    const handleToggleModal = useCallback(
        (id: string, title: string) => {
            setId(id)
            setTitle(title)
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
                    <div className=" text-base   font-semibold leading-6 text-white flex-1 ">{`${title} Logs`}</div>
                    <div>
                        <XButton
                            onClick={() => {
                                modalRef.current?.closeModal()
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col max-h-[60vh] min-h-[60vh] overflow-y-auto gap-4">
                    {atsDataIsLoading ? (
                        <div className="w-full flex-1 flex items-center justify-center">
                            <Spinner size={20} borderWidth={3} />
                        </div>
                    ) : (
                        <StrategyLogs isLoading={atsDataIsLoading} atsData={atsData} />
                    )}
                </div>
            </div>
        </Modal>
    )
})

StrategyLogsModal.displayName = 'StrategyLogsModal'

export default StrategyLogsModal
