import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { LuArrowLeftRight } from 'react-icons/lu'
import Modal, { ModalMethods } from './Modal'

import axios from 'axios'

import Spinner from '../Spinner'
import { useWebDataContext } from '@/context/webDataContext'
import { toast } from 'react-toastify'
import Button from '../ui/Button'

import { getReadableNumber } from '@/utils/price'
import DecimalInput from '../input/DecimalInput'
import XButton from '../ui/XButton'

interface TransferFundsModalProps {
    onClose: () => void
    initialFromAccount: 'spot' | 'perp' // Only need initial direction
}

export function createBigNumber(value: number | string = 0): number {
    return typeof value === 'string' ? parseFloat(value) : value
}

export function isGreaterThan(a: number, b: number): boolean {
    return a > b
}

const TransferFundsModal = forwardRef((props: TransferFundsModalProps, ref) => {
    const modalRef = useRef<ModalMethods>(null)
    const { webData2 } = useWebDataContext()
    const [amount, setAmount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [fromAccount, setFromAccount] = useState<'spot' | 'perp'>(props.initialFromAccount)

    const [toAccount, setToAccount] = useState<'spot' | 'perp'>(props.initialFromAccount === 'spot' ? 'perp' : 'spot')

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    const availableBalance =
        fromAccount === 'perp'
            ? webData2?.clearinghouseState?.withdrawable || '0'
            : webData2?.spotState?.balances?.find(b => b.coin === 'USDC')?.total || '0'

    const isInputAmountGreaterThanBalance =
        isGreaterThan(createBigNumber(amount || 0), createBigNumber(availableBalance)) || parseFloat(String(amount)) === 0

    const handleMaxClick = () => {
        setAmount(parseFloat(availableBalance.toString()))
    }

    const handleSwitchAccounts = () => {
        setFromAccount(prev => (prev === 'spot' ? 'perp' : 'spot'))
        setToAccount(prev => (prev === 'spot' ? 'perp' : 'spot'))
    }

    const handleConfirm = async () => {
        if (!amount) return

        setIsLoading(true)
        const toastId = toast.loading('Processing transfer...')

        try {
            const response = await axios.post('/api/hyperliquid/transfer', {
                code: 'USDC',
                amount: amount,
                fromAccount: fromAccount === 'spot' ? 'spot' : 'swap',
                toAccount: toAccount === 'spot' ? 'spot' : 'swap',
            })

            if (response.data.success) {
                toast.success('Transfer successful.')
                setAmount(0)
                modalRef.current?.toggleModal()
            } else {
                toast.error(response.data.message || 'Transfer failed.')
            }
        } catch (error) {
            console.error('Transfer error:', error)
            toast.error('Failed to process transfer.')
        } finally {
            setIsLoading(false)
            toast.dismiss(toastId)
        }
    }

    useEffect(() => {
        if (props.initialFromAccount) {
            setFromAccount(props.initialFromAccount)
            setToAccount(props.initialFromAccount === 'spot' ? 'perp' : 'spot')
        }
    }, [props.initialFromAccount])

    return (
        <Modal ref={modalRef}>
            <div className="relative w-full max-w-lg  bg-black border border-border rounded-lg overflow-hidden">
                <div className="p-3 flex items-center justify-between border-b border-border  bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">Transfer USDC</div>
                    <div>
                        <XButton onClick={handleToggleModal} />
                    </div>
                </div>

                <div className="flex flex-col gap-3 p-3">
                    <p className="text-sm text-neutral-text">Transfer USDC between your Perps and Spot balances.</p>
                    <div className="flex items-center justify-between relative">
                        <div className="flex flex-col gap-0 w-[45%]">
                            <label className="text-neutral-text-dark text-sm">From</label>
                            <div className="flex items-center gap-2">
                                <HandleSelectItems
                                    selectItem={fromAccount}
                                    setSelectItem={value => setFromAccount(value as 'spot' | 'perp')}
                                    selectDataItems={['spot', 'perp']}
                                    className="bg-transparent rounded-lg text-sm flex-1 font-semibold"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSwitchAccounts}
                            className="absolute border border-border rounded-lg p-2 left-1/2 -translate-x-1/2 bottom-1/2 translate-y-1/2 flex items-center justify-center  bg-table-odd hover:bg-neutral-900 text-neutral-text-dark hover:text-neutral-text apply-transition cursor-pointer"
                        >
                            <LuArrowLeftRight className="w-3 h-3" />
                        </button>

                        <div className="flex flex-col gap-0 w-[45%] items-end">
                            <label className="text-neutral-text-dark text-sm">To</label>

                            <HandleSelectItems
                                selectItem={toAccount}
                                setSelectItem={value => setToAccount(value)}
                                selectDataItems={['spot', 'perp']}
                                className="bg-transparent rounded-lg text-sm flex-1 font-semibold"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center border border-border/50 rounded-lg bg-table-odd relative">
                            <DecimalInput
                                maxDecimals={2}
                                placeholder="Amount"
                                value={amount ? amount.toString() : ''}
                                onChange={e => setAmount(parseFloat(e.target.value))}
                                className="flex-1 bg-transparent p-2 text-neutral-text focus:outline-none"
                            />
                            <button
                                onClick={handleMaxClick}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-neutral-800 border border-border hover:opacity-80 px-2 py-[2px] rounded-md text-2xs font-semibold"
                            >
                                Max
                            </button>
                        </div>

                        <div className="flex justify-between text-xs text-neutral-text">
                            <span>Available to transfer</span>
                            <span>{getReadableNumber(Number(availableBalance), 2)} USDC</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 text-xs">
                        <Button onClick={props.onClose} variant="ghost">
                            Cancel
                        </Button>
                        <Button disabled={isInputAmountGreaterThanBalance || String(amount).trim() === ''} onClick={handleConfirm} variant="primary">
                            <span>Confirm</span>
                            {isLoading && <Spinner variant="primary" className="" />}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
})

TransferFundsModal.displayName = 'TransferFundsModal'
export default TransferFundsModal

interface HandleSelectItemsProps {
    selectItem: 'spot' | 'perp'
    setSelectItem: (value: 'spot' | 'perp') => void
    selectDataItems?: string[]
    className?: string
}

const HandleSelectItems: React.FC<HandleSelectItemsProps> = ({ selectItem, setSelectItem, className = '' }) => {
    const handleItemClick = () => {
        const newValue = selectItem === 'spot' ? 'perp' : 'spot'
        setSelectItem(newValue)
    }

    return (
        <div className="relative">
            <div className={`flex items-center justify-between cursor-pointer ${className}`} onClick={handleItemClick}>
                <span className="text-neutral-text">{selectItem === 'spot' ? 'Spot' : 'Perps'}</span>
            </div>
        </div>
    )
}
