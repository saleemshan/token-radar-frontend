import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import Modal, { ModalMethods } from '@/components/modal/Modal'

import Spinner from '../Spinner'
import { useWebDataContext } from '@/context/webDataContext'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { toast } from 'react-toastify'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { findCoinFromMarketDataByCoinId } from '@/utils/tokenSymbol'
import Button from '../ui/Button'
import { useTrade, HyperliquidOrdersParams } from '@/context/TradeContext'

import { getDecimalPlaces, parseHyperliquidSize, parseHyperliquidPrice } from '@/utils/price'
import DecimalInput from '../input/DecimalInput'
import XButton from '../ui/XButton'
import useHaptic from '@/hooks/useHaptic'

interface LimitCloseModalProps {
    onClose: () => void
    onConfirm?: () => void
    position: {
        coin: string
        size: number
        entryPx: string
    } | null
}

const LimitCloseModal = forwardRef((props: LimitCloseModalProps, ref) => {
    const modalRef = useRef<ModalMethods>(null)
    const { marketData } = useWebDataContext()
    const { tokenPairData } = usePairTokensContext()
    const { handleExecuteHyperliquidTrade, isTradeProcessing } = useTrade()
    const { triggerHaptic } = useHaptic()

    const [price, setPrice] = useState(0)
    const [size, setSize] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedCurrency, setSelectedCurrency] = useState('USDC')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [selectedPreset, setSelectedPreset] = useState<undefined | number>(undefined)

    const handleToggleModal = useCallback(() => {
        if (props.position) {
            setSelectedCurrency(props.position.coin)
            // Set initial size to full position size
            const positionSize = Math.abs(props.position.size)
            setSize(positionSize)
            // Set initial price to entry price
            setPrice(parseFloat(props.position.entryPx))
            setSelectedPreset(1) // 100% by default
        }
        modalRef.current?.toggleModal()
    }, [props.position])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    const presetOptions = [0.25, 0.5, 0.75, 1]

    const isInputInvalid = !price || !size || price <= 0 || size <= 0 || isNaN(price) || isNaN(size)

    const isInputAmountGreaterThanBalance = props.position?.size !== undefined && Math.abs(size) > Math.abs(props.position.size || 0)

    const handleMaxClick = () => {
        // Get mid price from token data
        if (props.position) {
            const tokenData = tokenPairData?.find(token => token.universe.name === props.position?.coin)
            if (tokenData?.assetCtx.markPx) {
                setPrice(parseFloat(tokenData.assetCtx.markPx))
            }
            setSize(Math.abs(props.position.size))
            setSelectedPreset(1) // 100%
        }
    }

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

    const handleSelectPreset = (value: number) => {
        triggerHaptic(20)
        setSelectedPreset(value)
        if (props.position) {
            // Calculate size based on percentage
            const positionSize = Math.abs(props.position.size)
            setSize(positionSize * value)
        }
    }

    const handleLimitClose = async () => {
        triggerHaptic(50)
        if (!props.position || !size || !price) return

        setIsLoading(true)

        try {
            const tokenData = tokenPairData?.find(token => token.universe.name === props.position?.coin)

            if (!tokenData) {
                toast.error('Token not found.')
                setIsLoading(false)
                return
            }

            const symbol = findCoinFromMarketDataByCoinId(marketData, tokenData?.assetId?.toString())?.symbol

            if (!symbol) {
                toast.error('Symbol not found.')
                setIsLoading(false)
                return
            }

            // Determine if this is a long or short position that needs to be closed
            const isLongPosition = props.position.size > 0
            const side = isLongPosition ? 'sell' : 'buy'

            const order: HyperliquidOrdersParams = {
                coin: tokenData.assetId as number,
                type: 'limit',
                side,
                amount: parseHyperliquidSize(Math.abs(size), tokenData?.universe.szDecimals ?? 5),
                price: parseHyperliquidPrice(price),
                params: {
                    reduceOnly: true,
                },
            }

            const response = await handleExecuteHyperliquidTrade(
                {
                    orders: [order],
                },
                symbol,
                side,
                () => {
                    props.onConfirm?.()
                    modalRef.current?.closeModal()
                }
            )

            if (response) {
                // Processing handled by context
            }
        } catch (error) {
            console.error('Error placing limit order:', error)
            toast.error('Error placing limit order.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        modalRef.current?.closeModal()
    }

    return (
        <Modal ref={modalRef}>
            <div className="relative w-full max-w-lg bg-black border border-border rounded-lg overflow-hidden">
                <div className="p-3 flex items-center justify-between border-b border-border  bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">Limit Close</div>
                    <div>
                        <XButton onClick={handleClose} />
                    </div>
                </div>

                <div className="p-3">
                    <p className="text-sm text-neutral-text">This will send an order to close your position at the limit price.</p>
                    <div className="flex flex-col gap-2 py-3">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="flex-1 bg-transparent text-sm text-neutral-text focus:outline-none">Size</span>
                                <span onClick={handleMaxClick} className="text-positive hover:text-positive/80 cursor-pointer">
                                    {Math.abs(props.position?.size || 0)} {props.position?.coin}
                                </span>
                            </div>
                            <div className="flex items-center border border-border/50 rounded-lg bg-table-odd relative">
                                <input
                                    type="number"
                                    placeholder="Price (USD)"
                                    value={price || ''}
                                    onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                                    className="flex-1 bg-transparent p-2 text-neutral-text focus:outline-none"
                                />
                                <button
                                    onClick={handleMaxClick}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-neutral-800 border border-border hover:opacity-80 px-2 py-[2px] rounded-md text-2xs font-semibold"
                                >
                                    Mid
                                </button>
                            </div>
                            <div className="flex items-center border border-border/50 rounded-lg bg-table-odd">
                                <DecimalInput
                                    maxDecimals={getDecimalPlaces(Number(Math.abs(size)))}
                                    placeholder="Size"
                                    value={Math.abs(size).toString()}
                                    onChange={e => setSize(parseFloat(e.target.value))}
                                    className="flex-1 bg-transparent p-2 text-neutral-text focus:outline-none"
                                />
                                <div className="relative">
                                    <button onClick={toggleDropdown} className="px-3 py-2 text-white flex items-center gap-1">
                                        {props.position?.coin || selectedCurrency}
                                        <MdOutlineKeyboardArrowDown
                                            className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-1 w-24 bg-black border border-border rounded-lg shadow-lg z-10">
                                            <button
                                                onClick={() => {
                                                    setSelectedCurrency(props.position?.coin || 'SOL')
                                                    setIsDropdownOpen(false)
                                                }}
                                                className="w-full px-3 py-2 text-left hover:bg-neutral-800 text-neutral-text"
                                            >
                                                {props.position?.coin || 'USDC'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {presetOptions.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectPreset(option)}
                                    type="button"
                                    className={`col-span-1 flex items-center justify-center px-3 h-9 rounded-lg font-semibold text-xs hover:bg-neutral-800 duration-200 transition-all ${
                                        selectedPreset === option ? 'bg-neutral-900 text-neutral-text' : 'bg-[#0f0f0f] text-neutral-text-dark'
                                    }`}
                                >
                                    {`${option * 100}%`}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 text-xs">
                        <Button onClick={handleClose} variant="ghost">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleLimitClose}
                            disabled={isInputInvalid || isInputAmountGreaterThanBalance || isLoading || isTradeProcessing}
                            variant="primary"
                        >
                            <span>Limit Close</span>
                            {(isLoading || isTradeProcessing) && <Spinner variant="primary" className="" />}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
})

LimitCloseModal.displayName = 'LimitCloseModal'
export default LimitCloseModal
