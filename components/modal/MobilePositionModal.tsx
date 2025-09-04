'use client'
import React, { forwardRef, Suspense, useCallback, useImperativeHandle } from 'react'
import Modal, { ModalMethods } from './Modal'
import XButton from '../ui/XButton'
import TradeTokenTabsWrapper from '../Hyperliquid/TradeTokenTabsWrapper'

const MobilePositionModal = forwardRef((_, ref) => {
    const modalRef = React.createRef<ModalMethods>()

    const handleCloseModal = useCallback(() => {
        modalRef.current?.closeModal()
    }, [modalRef])
    const handleOpenModal = useCallback(() => {
        modalRef.current?.openModal()
    }, [modalRef])

    useImperativeHandle(ref, () => ({
        openModal: handleOpenModal,
        closeModal: handleCloseModal,
    }))

    return (
        <Modal ref={modalRef}>
            <div className=" bg-black flex lg:hidden flex-col w-full overflow-hidden absolute inset-0 ">
                <div className="flex items-center w-full justify-between p-3 text-sm">
                    <div className="text-base font-semibold">My Position</div>
                    <div>
                        <XButton onClick={handleCloseModal} />
                    </div>
                </div>
                <Suspense>
                    <div className="h-full flex-1 overflow-hidden max-h-full relative flex flex-col">
                        <TradeTokenTabsWrapper
                            showTabs={['Balances', 'Positions', 'Open Orders', 'Order History', 'Trade History', 'Funding History']}
                            showNavigation={true}
                            initialActiveTab="Balances"
                            hideSpotBalance={true}
                        />
                    </div>
                </Suspense>
            </div>
        </Modal>
    )
})

MobilePositionModal.displayName = 'MobilePositionModal'

export default MobilePositionModal
