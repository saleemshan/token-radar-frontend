'use client'

import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react'
import Modal, { ModalMethods } from './Modal'
import HyperliquidUsdcConverter from '../Hyperliquid/HyperliquidUsdcConverter'
import HyperliquidUsdcDeposit from '../Hyperliquid/HyperliquidUsdcDeposit'
import XButton from '../ui/XButton'

type Tab = 'Swap' | 'Deposit'

export type HyperliquidExchangeModalMethods = {
    toggleModal: () => void
    show?: boolean
}

interface HyperliquidExchangeModalProps {
    initialShowTopUpAddress?: boolean
}

const HyperliquidExchangeModal = forwardRef<HyperliquidExchangeModalMethods, HyperliquidExchangeModalProps>(({ initialShowTopUpAddress }, ref) => {
    const modalRef = useRef<ModalMethods>(null)
    const [activeTab, setActiveTab] = useState<Tab>('Swap')
    const [showTabs] = useState<Tab[]>(['Swap', 'Deposit'])

    useEffect(() => {
        if (initialShowTopUpAddress) {
            setActiveTab('Swap')
        }
    }, [initialShowTopUpAddress])

    const handleToggleModal = () => {
        modalRef.current?.toggleModal()
    }

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
        show: modalRef.current?.show,
    }))

    const handleCloseModal = () => {
        modalRef.current?.closeModal()
    }

    return (
        <Modal ref={modalRef} className="z-[5000]">
            <div className="max-w-md relative w-full bg-black border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="p-3 flex items-center justify-between border-b border-border  bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">Exchange</div>
                    <div>
                        <XButton
                            onClick={() => {
                                handleToggleModal()
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col items-start justify-center">
                    <div className="flex items-center gap-2 border-b border-border p-2 w-full">
                        <div className="flex overflow-x-auto relative z-40 gap-2 items-center bg-black no-scrollbar font-semibold">
                            {showTabs.map(tab => {
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setActiveTab(tab)
                                        }}
                                        className={`flex text-nowrap items-center justify-center text-xs py-1 hover:bg-neutral-800 duration-200 transition-all px-2 rounded-md ${
                                            activeTab === tab ? 'bg-neutral-900 text-neutral-text' : 'bg-black text-neutral-text-dark/70'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex flex-col h-full w-full bg-black relative p-3 border-border">
                        {activeTab === 'Swap' && <HyperliquidUsdcConverter onSuccess={handleCloseModal} />}
                        {activeTab === 'Deposit' && <HyperliquidUsdcDeposit />}
                    </div>
                </div>
            </div>
        </Modal>
    )
})

HyperliquidExchangeModal.displayName = 'HyperliquidExchangeModal'

export default HyperliquidExchangeModal
