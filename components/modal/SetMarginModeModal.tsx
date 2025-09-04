import React, { forwardRef, useCallback, useImperativeHandle, useState, useMemo, useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import { Id, toast } from 'react-toastify'
import axios from 'axios'

import { usePairTokensContext } from '@/context/pairTokensContext'
import { useHyperLiquidContext } from '@/context/hyperLiquidContext'

import Modal, { ModalMethods } from '@/components/modal/Modal'
import Button from '../ui/Button'
import Spinner from '../Spinner'

import XButton from '../ui/XButton'
import useHaptic from '@/hooks/useHaptic'

const SetMarginModeModal = forwardRef((_, ref) => {
    const modalRef = useRef<ModalMethods>(null)
    const { triggerHaptic } = useHaptic()

    const { activeAssetData, activePrepAssetCtx, assetId } = usePairTokensContext()
    const { isAccountFunded } = useHyperLiquidContext()

    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'Cross' | 'Isolated'>(activeAssetData?.leverage?.type === 'cross' ? 'Cross' : 'Isolated')
    const [toastId, setToastId] = useState<Id | null>(null)

    const handleUpdateMarginMode = async () => {
        triggerHaptic(50)

        if (!isAccountFunded) {
            toast.error('Deposit a minimum of $5 into Hyperliquid to use this feature.')
            return
        }

        try {
            setIsLoading(true)

            const res = await axios.post('/api/hyperliquid/update-leverage', {
                asset: assetId,
                marginMode: activeTab.toLowerCase(),
                leverage: activeAssetData?.leverage?.value,
            })

            if (res?.data?.success === true) {
                modalRef.current?.closeModal()
                toast.success('Margin mode updated successfully.')
            } else {
                toast.error('Failed to update margin mode.')
            }
        } catch (error) {
            console.log(error)
            // Dismiss the loading toast if there's an error
            if (toastId) toast.dismiss(toastId)
            toast.error('Failed to update margin mode.')
        } finally {
            setIsLoading(false)
            setToastId(null)
        }
    }

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [modalRef])

    useEffect(() => {
        if (activeAssetData && !isLoading) {
            setActiveTab(activeAssetData?.leverage.type === 'cross' ? 'Cross' : 'Isolated')
        }
    }, [activeAssetData, isLoading])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    const marginInfoText = useMemo(
        () => ({
            Cross: 'All cross positions share the same cross margin as collateral. In the event of liquidation, your cross margin balance and any remaining open positions under assets in this mode may be forfeited.',
            Isolated:
                'Manage your risk on individual positions by restricting the amount of margin allocated to each. If the margin ratio of an isolated position reaches 100%, the position will be liquidated. Margin can be added or removed to individual positions in this mode.',
        }),
        []
    )

    const TABS = ['Cross', 'Isolated'] as const

    return (
        <Modal ref={modalRef}>
            <div className="relative bg-black border border-border rounded-lg w-full overflow-hidden max-w-lg max-h-[50vh] flex flex-col">
                <div className="p-3 flex items-center justify-between border-b border-border  bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">{activePrepAssetCtx?.coin}-USD Margin Mode</div>
                    <div>
                        <XButton onClick={handleToggleModal} />
                    </div>
                </div>

                <div className=" text-sm text-neutral-text space-y-3 p-3 flex-1">
                    <div className="flex border border-border p-1 rounded-lg">
                        {TABS.map(tabName => (
                            <button
                                key={tabName}
                                className={clsx(
                                    'flex-1 py-2 font-medium text-center apply-transition rounded-md h-10 text-sm',
                                    activeTab === tabName ? 'text-neutral-text  bg-neutral-900' : 'text-neutral-text-dark hover:text-neutral-text'
                                )}
                                onClick={() => setActiveTab(tabName)}
                            >
                                {tabName}
                            </button>
                        ))}
                    </div>
                    <p className="text-neutral-text text-xs">{marginInfoText[activeTab]}</p>
                </div>

                <div className="flex items-center justify-end gap-3 text-xs p-3">
                    <Button onClick={handleToggleModal} variant="ghost">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            handleUpdateMarginMode()
                        }}
                        variant="primary"
                    >
                        <span>Confirm</span>
                        {isLoading && <Spinner variant="primary" className="" />}
                    </Button>
                </div>
            </div>
        </Modal>
    )
})

SetMarginModeModal.displayName = 'SetMarginModeModal'

export default SetMarginModeModal
