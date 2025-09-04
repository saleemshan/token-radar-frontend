import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState, useRef } from 'react'
import Modal, { ModalMethods } from '@/components/modal/Modal'
import { toast } from 'react-toastify'

import { usePrivy } from '@privy-io/react-auth'
import { useLogin } from '@privy-io/react-auth'
import Spinner from '../Spinner'
import Button from '../ui/Button'
import { useHyperLiquidContext } from '@/context/hyperLiquidContext'
import DecimalInput from '../input/DecimalInput'
import XButton from '../ui/XButton'
import useHaptic from '@/hooks/useHaptic'

const AdjustSlippageModal = forwardRef((_, ref) => {
    const modalRef = useRef<ModalMethods>(null)
    const { triggerHaptic } = useHaptic()

    const { ready, authenticated } = usePrivy()
    const { login: handleSignIn } = useLogin()
    const { isAccountFunded, marketOrderSlippage, setMarketOrderSlippage } = useHyperLiquidContext()

    const [isLoading, setIsLoading] = useState(false)

    const [slippage, setSlippage] = useState<number>(marketOrderSlippage)

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    // Update initial values when marketOrderSlippage changes
    useEffect(() => {
        setSlippage(marketOrderSlippage)
    }, [marketOrderSlippage])

    // Input change handler
    const handleSlippageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value

        if (/^[0-9]*\.?[0-9]*$/.test(value)) {
            const numValue = Number(value)
            setSlippage(numValue)
        }
    }

    // Api call to update slippage
    const handleSlippageUpdate = async () => {
        triggerHaptic(50)
        if (!isAccountFunded) {
            toast.error('Deposit a minimum of $5 into Hyperliquid to use this feature.')
            return
        }
        try {
            setIsLoading(true)
            const numValue = Number(slippage)
            // Store in localStorage
            localStorage.setItem('marketOrderSlippage', numValue.toString())

            // Update the context value
            setMarketOrderSlippage(numValue)

            handleToggleModal()
            toast.success('Slippage updated successfully.')
        } catch (error) {
            toast.error('Failed to update slippage.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal ref={modalRef}>
            <div className="relative w-full max-w-lg flex flex-col bg-black border border-border rounded-lg overflow-hidden">
                <div className="p-3 flex items-center justify-between border-b border-border  bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">Adjust Max Slippage</div>
                    <div>
                        <XButton onClick={handleToggleModal} />
                    </div>
                </div>

                <div className="w-full flex flex-col gap-3 pt-3 px-3">
                    <p className="text-xs text-neutral-text">
                        Max slippage only affects market orders placed from the order form. Closing positions will use max slippage of 8% and market
                        TP/SL orders will use max slippage of 10%.
                    </p>

                    <div className="flex items-start text-start border border-border rounded-lg px-2 py-3  w-full">
                        <div className="w-full relative">
                            <DecimalInput
                                onChange={handleSlippageChange}
                                value={slippage.toString()}
                                placeholder="Max Slippage"
                                className="flex-1 bg-transparent text-left [&::placeholder]:text-left w-full"
                            />
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-2xs font-semibold">%</div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 text-xs p-3">
                    <Button onClick={handleToggleModal} variant="ghost">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (!ready || !authenticated) {
                                handleSignIn()
                            } else {
                                handleSlippageUpdate()
                            }
                        }}
                        variant="primary"
                        disabled={slippage === 0}
                    >
                        <span>Confirm</span>
                        {isLoading && <Spinner variant="primary" className="" />}
                    </Button>
                </div>
            </div>
        </Modal>
    )
})

AdjustSlippageModal.displayName = 'AdjustSlippageModal'
export default AdjustSlippageModal
