import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState, useRef } from 'react'
import Modal, { ModalMethods } from '@/components/modal/Modal'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { usePrivy } from '@privy-io/react-auth'
import { useLogin } from '@privy-io/react-auth'
import Spinner from '../Spinner'
import Button from '../ui/Button'
import { useHyperLiquidContext } from '@/context/hyperLiquidContext'
import XButton from '../ui/XButton'
import useHaptic from '@/hooks/useHaptic'

const UpdateUpdateLeverageModal = forwardRef((_, ref) => {
    const modalRef = useRef<ModalMethods>(null)

    const { triggerHaptic } = useHaptic()
    const { ready, authenticated } = usePrivy()
    const { login: handleSignIn } = useLogin()
    const { isAccountFunded } = useHyperLiquidContext()

    const [isLoading, setIsLoading] = useState(false)

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    const { assetId, tokenPairData, tokenPairs, activeAssetData } = usePairTokensContext()
    const [sliderValue, setSliderValue] = useState<number>(1)

    const marginType = activeAssetData?.leverage.type ?? ''

    const maxLeverage = Number(tokenPairData[assetId]?.universe.maxLeverage)
    const currentLeverage = Number(activeAssetData?.leverage?.value)

    //Slider change handler
    const handleSliderChange = (newValue: number) => {
        if (newValue >= 1 && newValue <= maxLeverage) {
            setSliderValue(newValue)
        }
    }

    //Set slider value to current leverage
    useEffect(() => {
        if (currentLeverage && !modalRef.current?.show) {
            setSliderValue(Math.max(currentLeverage, 1))
        }
    }, [currentLeverage, modalRef.current?.show])

    //Input change handler
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value) || 1
        if (value >= 1 && value <= maxLeverage) {
            setSliderValue(value)
        }
    }

    //Api call to update leverage
    const handleLeverageUpdate = async () => {
        triggerHaptic(50)
        if (!isAccountFunded) {
            toast.error('Deposit a minimum of $5 into Hyperliquid to use this feature.')
            return
        }

        try {
            setIsLoading(true)
            const leverage = sliderValue
            const res = await axios.post('/api/hyperliquid/update-leverage', {
                leverage,
                asset: assetId,
                marginMode: marginType,
            })

            if (res?.data.success === true) {
                modalRef.current?.closeModal()
                toast.success('Leverage updated successfully.')
            } else {
                toast.error('Failed to update leverage.')
            }
        } catch (error) {
            toast.error('Failed to update leverage.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal ref={modalRef}>
            <div className="relative w-full max-w-lg flex flex-col bg-black border border-border rounded-lg overflow-hidden">
                <div className="p-3 flex items-center justify-between border-b border-border  bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">Adjust Leverage</div>
                    <div>
                        <XButton onClick={handleToggleModal} />
                    </div>
                </div>

                <div className="w-full flex flex-col gap-2 pt-3">
                    <p className="text-xs text-neutral-text px-3">
                        Control the leverage used when opening positions for {`${tokenPairs[0]}`}. The maximum leverage is {maxLeverage}x.
                    </p>

                    <div className="flex items-center gap-4 px-3">
                        <input
                            type="range"
                            className="w-full accent-primary"
                            min="1"
                            max={maxLeverage}
                            value={sliderValue}
                            onChange={e => handleSliderChange(Number(e.target.value))}
                        />
                        <input
                            type="number"
                            className="w-14 h-7 border border-border bg-table-odd text-neutral-text rounded text-center focus:outline-none focus:border-primary transition-colors"
                            min="1"
                            value={Number(sliderValue)}
                            onChange={handleInputChange}
                        />
                    </div>
                    <span className="text-xs text-negative  block px-3">Note that setting a higher leverage increases the risk of liquidation.</span>
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
                                handleLeverageUpdate()
                            }
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

UpdateUpdateLeverageModal.displayName = 'UpdateUpdateLeverageModal'
export default UpdateUpdateLeverageModal
