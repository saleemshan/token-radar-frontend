import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import Modal, { ModalMethods } from '@/components/modal/Modal'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { toast } from 'react-toastify'
import { useWebDataContext } from '@/context/webDataContext'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { useHyperLiquidContext } from '@/context/hyperLiquidContext'
import { findCoinFromMarketDataByCoinId } from '@/utils/tokenSymbol'
import Spinner from '../Spinner'
import Button from '../ui/Button'
import { useTrade, HyperliquidOrdersParams } from '@/context/TradeContext'

import { getDecimalPlaces, parseHyperliquidSize } from '@/utils/price'
import { getMarketOrderPriceWithSlippage } from '@/utils/price'
import DecimalInput from '../input/DecimalInput'
import XButton from '../ui/XButton'
import useHaptic from '@/hooks/useHaptic'

interface MarketCloseModalProps {
    onClose: () => void
    position: {
        coin: string
        size: number
        entryPx: string
    } | null
}

const MarketCloseModal = forwardRef((props: MarketCloseModalProps, ref) => {
    const modalRef = useRef<ModalMethods>(null)
    const { marketData } = useWebDataContext()
    const { tokenPairData } = usePairTokensContext()
    const { handleExecuteHyperliquidTrade, isTradeProcessing } = useTrade()
    const { marketOrderSlippage } = useHyperLiquidContext()
    const { triggerHaptic } = useHaptic()

    const [size, setSize] = useState(0)
    const [selectedCurrency, setSelectedCurrency] = useState('SOL')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [selectedPreset, setSelectedPreset] = useState<undefined | number>(undefined)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggleModal = useCallback(() => {
        if (props.position) {
            setSelectedCurrency(props.position.coin)
            // Set initial size to full position size and select 100% preset by default
            const positionSize = Math.abs(props.position.size)
            setSize(positionSize)
            setSelectedPreset(1) // 100% by default
        } else {
            // Reset states when closing
            setSize(0)
            setSelectedPreset(undefined)
        }
        modalRef.current?.toggleModal()
    }, [props.position])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    const presetOptions = [0.25, 0.5, 0.75, 1]

    const isInputAmountGreaterThanBalance = props.position?.size !== undefined && Math.abs(size) > Math.abs(props.position.size || 0)

    const handleMaxClick = () => {
        if (props.position) {
            setSize(props.position.size)
            setSelectedPreset(1) // 100%
        }
    }

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

    const handleSelectPreset = (value: number) => {
        triggerHaptic(20)
        setSelectedPreset(value)
        if (props.position) {
            // Calculate size based on percentage
            const positionSize = props.position.size
            setSize(positionSize * value)
        }
    }

    const handleClosePosition = async () => {
        triggerHaptic(50)
        if (!props.position || !size) return

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
            const isLongPosition = size > 0
            const side = isLongPosition ? 'sell' : 'buy'

            const order: HyperliquidOrdersParams = {
                coin: tokenData.assetId as number,
                type: 'market',
                side,
                amount: parseHyperliquidSize(Math.abs(size), tokenData?.universe.szDecimals ?? 5),
                price: getMarketOrderPriceWithSlippage(tokenData?.assetCtx.markPx || '0', side, marketOrderSlippage),
                params: {
                    reduceOnly: true,
                },
            }

            await handleExecuteHyperliquidTrade(
                {
                    orders: [order],
                    params: {},
                },
                symbol,
                side,
                () => {
                    modalRef.current?.closeModal()
                },
                undefined,
                'Position Closed Successfully!'
            )
        } catch (error) {
            console.error('Error closing position:', error)
            toast.error('Error closing position.')
        } finally {
            setIsLoading(false)
        }
    }

    // Handle manual closing of the modal
    const handleClose = () => {
        modalRef.current?.closeModal()
    }

    return (
        <Modal ref={modalRef}>
            <div className="relative w-full max-w-lg bg-black border border-border rounded-lg">
                <div className="p-3 flex items-center justify-between border-b border-border  bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">Market Close</div>
                    <div>
                        <XButton onClick={handleClose} />
                    </div>
                </div>

                <div className="p-3">
                    <p className="text-sm text-neutral-text-wh">This will attempt to immediately close the position.</p>
                    <div className="flex flex-col gap-2 py-3">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="flex-1 bg-transparent text-sm text-neutral-text focus:outline-none">Size</span>
                                <span onClick={handleMaxClick} className="text-positive hover:text-positive/80 cursor-pointer">
                                    {Math.abs(props.position?.size || 0)} {props.position?.coin}
                                </span>
                            </div>
                            <div className="flex items-start justify-between">
                                <span className="flex-1 bg-transparent text-sm text-neutral-text focus:outline-none">Price</span>
                                <span className="text-white hover:text-neutral-text">Market</span>
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
                                                {props.position?.coin || 'SOL'}
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
                            onClick={handleClosePosition}
                            disabled={isInputAmountGreaterThanBalance || isLoading || isTradeProcessing}
                            variant="primary"
                        >
                            <span>Market Close</span>
                            {(isLoading || isTradeProcessing) && <Spinner variant="primary" className="" />}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
})

MarketCloseModal.displayName = 'MarketCloseModal'
export default MarketCloseModal
