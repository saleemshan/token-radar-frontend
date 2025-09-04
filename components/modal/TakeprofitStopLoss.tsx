import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState, useEffect } from 'react'
import Spinner from '../Spinner'
import { useWebDataContext } from '@/context/webDataContext'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { toast } from 'react-toastify'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { useHyperLiquidContext } from '@/context/hyperLiquidContext'
import { findCoinFromMarketDataByCoinId, findMarketDataByName } from '@/utils/tokenSymbol'
import Modal, { ModalMethods } from './Modal'
import { useTrade, HyperliquidOrdersParams } from '@/context/TradeContext'
import Button from '../ui/Button'

import { formatCryptoPrice, getDecimalPlaces, parseHyperliquidPrice, parseHyperliquidSize } from '@/utils/price'
import { getMarketOrderPriceWithSlippage } from '@/utils/price'
import DecimalInput from '../input/DecimalInput'
import axios from 'axios'
import { OpenOrder } from '@/types/hyperliquid'
import XButton from '../ui/XButton'
import useHaptic from '@/hooks/useHaptic'

interface TakeprofitStopLossProps {
    onClose: () => void
    onConfirm?: () => void
    position: {
        coin: string
        size: number
        entryPx: string
    } | null
}

const TakeprofitStopLoss = forwardRef((props: TakeprofitStopLossProps, ref) => {
    const modalRef = useRef<ModalMethods>(null)
    const { marketData, webData2 } = useWebDataContext()
    const { tokenPairData } = usePairTokensContext()
    const { handleExecuteHyperliquidTrade, isTradeProcessing: isContextProcessing } = useTrade()
    const { marketOrderSlippage } = useHyperLiquidContext()
    const { triggerHaptic } = useHaptic()

    // TP/SL state
    const [tpPrice, setTpPrice] = useState<string>('')
    const [tpGain, setTpGain] = useState<string>('')
    const [tpUnit, setTpUnit] = useState<'%' | '$'>('%')
    const [tpDropdownOpen, setTpDropdownOpen] = useState(false)

    const [slPrice, setSlPrice] = useState<string>('')
    const [slLoss, setSlLoss] = useState<string>('')
    const [slUnit, setSlUnit] = useState<'%' | '$'>('%')
    const [slDropdownOpen, setSlDropdownOpen] = useState(false)

    // Track which field was last edited
    const [lastEdited, setLastEdited] = useState<{
        field: 'tpPrice' | 'tpGain' | 'slPrice' | 'slLoss' | null
    }>({ field: null })

    const [configureAmount, setConfigureAmount] = useState(false)

    const [isLoading, setIsLoading] = useState(false)

    // Current position details
    const [positionDetails, setPositionDetails] = useState({
        coin: '',
        position: '',
        side: '',
        entryPrice: '',
        markPrice: '',
    })

    const openOrders = webData2?.openOrders || []
    const tpOrder = openOrders.find(o => o.coin === props.position?.coin && o.orderType === 'Take Profit Market')
    const slOrder = openOrders.find(o => o.coin === props.position?.coin && o.orderType === 'Stop Market')
    const [isCancellingTP, setIsCancellingTP] = useState(false)
    const [isCancellingSL, setIsCancellingSL] = useState(false)

    const formatNumber = (value: number): string => {
        return value.toFixed(4)
    }

    const handleToggleModal = useCallback(() => {
        if (props.position) {
            // Get token data for the position
            const tokenData = tokenPairData?.find(token => token.universe.name === props.position?.coin)

            // Set position details
            setPositionDetails({
                coin: props.position.coin,
                position: `${Math.abs(props.position.size)} ${props.position.coin}`,
                side: props.position.size > 0 ? 'Long' : 'Short',
                entryPrice: parseFloat(props.position.entryPx).toFixed(4),
                markPrice: tokenData?.assetCtx.markPx ? parseFloat(tokenData.assetCtx.markPx).toFixed(4) : '0.0000',
            })

            // Reset form values
            setTpPrice('')
            setTpGain('')
            setSlPrice('')
            setSlLoss('')
            setConfigureAmount(false)
            setLastEdited({ field: null })
        }
        modalRef.current?.toggleModal()
    }, [props.position, tokenPairData])

    // Add useEffect to update position details when props.position changes
    useEffect(() => {
        if (props.position) {
            const tokenData = tokenPairData?.find(token => token.universe.name === props.position?.coin)

            setPositionDetails({
                coin: props.position.coin,
                position: `${Math.abs(props.position.size)} ${props.position.coin}`,
                side: props.position.size > 0 ? 'Long' : 'Short',
                entryPrice: parseFloat(props.position.entryPx).toFixed(4),
                markPrice: tokenData?.assetCtx.markPx ? parseFloat(tokenData.assetCtx.markPx).toFixed(4) : '0.0000',
            })
        }
    }, [props.position, tokenPairData])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    // Calculate TP/SL prices based on gain/loss percentages or dollar values
    useEffect(() => {
        if (!props.position || !positionDetails.markPrice) return

        const entryPrice = parseFloat(props.position.entryPx)
        const positionSize = Math.abs(props.position.size)
        const isLongPosition = props.position.size > 0

        // Skip recalculations if user is currently editing the fields
        if (lastEdited.field === 'tpPrice' || lastEdited.field === 'slPrice') {
            return
        }

        // Calculate TP price when gain changes
        if (lastEdited.field === 'tpGain' && tpGain !== '') {
            const gainValue = parseFloat(tpGain)
            if (tpUnit === '%') {
                // Calculate price based on percentage gain
                const gainMultiplier = 1 + ((isLongPosition ? 1 : -1) * gainValue) / 100
                const calculatedPrice = entryPrice * gainMultiplier
                setTpPrice(formatNumber(calculatedPrice))
            } else if (tpUnit === '$') {
                // Calculate price based on dollar gain
                const dollarPerUnit = gainValue / positionSize
                // For long positions, TP is above entry; for shorts, TP is below entry
                const calculatedPrice = isLongPosition ? entryPrice + dollarPerUnit : entryPrice - dollarPerUnit
                setTpPrice(formatNumber(calculatedPrice))
            }
        }

        // Calculate SL price when loss changes
        if (lastEdited.field === 'slLoss' && slLoss !== '') {
            const lossValue = parseFloat(slLoss)
            if (slUnit === '%') {
                // Calculate price based on percentage loss
                const lossMultiplier = 1 - ((isLongPosition ? 1 : -1) * lossValue) / 100
                const calculatedPrice = entryPrice * lossMultiplier
                setSlPrice(formatNumber(calculatedPrice))
            } else if (slUnit === '$') {
                // Calculate price based on dollar loss
                const dollarPerUnit = lossValue / positionSize
                // For long positions, SL is below entry; for shorts, SL is above entry
                const calculatedPrice = isLongPosition ? entryPrice - dollarPerUnit : entryPrice + dollarPerUnit
                setSlPrice(formatNumber(calculatedPrice))
            }
        }
    }, [tpGain, tpUnit, slLoss, slUnit, props.position, positionDetails.markPrice, lastEdited])

    // Calculate gain/loss when TP/SL prices change
    useEffect(() => {
        if (!props.position) return

        const entryPrice = parseFloat(props.position.entryPx)
        const positionSize = Math.abs(props.position.size)
        const isLongPosition = props.position.size > 0

        // Skip recalculations if user is currently editing the fields
        if (lastEdited.field === 'tpGain' || lastEdited.field === 'slLoss') {
            return
        }

        // Calculate gain when TP price changes
        if (lastEdited.field === 'tpPrice' && tpPrice !== '') {
            const priceValue = parseFloat(tpPrice)
            // For longs: gain is price increase, for shorts: gain is price decrease
            const priceDiff = isLongPosition ? priceValue - entryPrice : entryPrice - priceValue

            if (tpUnit === '%') {
                // Calculate percentage gain
                const percentGain = (priceDiff / entryPrice) * 100
                setTpGain(formatNumber(percentGain))
            } else if (tpUnit === '$') {
                // Calculate dollar gain
                const dollarGain = priceDiff * positionSize
                setTpGain(formatNumber(dollarGain))
            }
        }

        // Calculate loss when SL price changes
        if (lastEdited.field === 'slPrice' && slPrice !== '') {
            const priceValue = parseFloat(slPrice)
            // For longs: loss is price decrease, for shorts: loss is price increase
            const priceDiff = isLongPosition ? entryPrice - priceValue : priceValue - entryPrice

            if (slUnit === '%') {
                // Calculate percentage loss
                const percentLoss = (priceDiff / entryPrice) * 100
                setSlLoss(formatNumber(percentLoss))
            } else if (slUnit === '$') {
                // Calculate dollar loss
                const dollarLoss = priceDiff * positionSize
                setSlLoss(formatNumber(dollarLoss))
            }
        }
    }, [tpPrice, slPrice, tpUnit, slUnit, props.position, lastEdited])

    // Reset calculations when unit changes
    useEffect(() => {
        if (lastEdited.field === 'tpGain' && tpGain !== '') {
            // Recalculate TP price with new unit
            setLastEdited({ field: 'tpGain' })
        }
    }, [lastEdited.field, tpGain, tpUnit])

    useEffect(() => {
        if (lastEdited.field === 'slLoss' && slLoss !== '') {
            // Recalculate SL price with new unit
            setLastEdited({ field: 'slLoss' })
        }
    }, [lastEdited.field, slLoss, slUnit])

    const handleSetTPSL = async () => {
        triggerHaptic(50)
        if (!props.position || (!tpPrice && !slPrice)) return

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

            const orders: HyperliquidOrdersParams[] = []
            const isLongPosition = props.position.size > 0
            const side = isLongPosition ? 'sell' : 'buy' // For TP/SL we're closing the position
            const positionSize = Math.abs(props.position.size)
            const orderSize = configureAmount ? positionSize * 0.5 : positionSize // If configureAmount is true, use 50% of position size as an example

            // Add Take Profit order if set
            if (tpPrice) {
                orders.push({
                    coin: tokenData.assetId as number,
                    type: 'trigger',
                    side: side,
                    amount: parseHyperliquidSize(orderSize, tokenData?.universe.szDecimals ?? 5),
                    price: getMarketOrderPriceWithSlippage(tokenData?.assetCtx.markPx || '0', side, marketOrderSlippage),

                    params: {
                        reduceOnly: true,
                        isMarket: true,
                        triggerPrice: parseHyperliquidPrice(parseFloat(tpPrice)),
                        tpsl: 'tp',
                    },
                })
            }

            // Add Stop Loss order if set
            if (slPrice) {
                orders.push({
                    coin: tokenData.assetId as number,
                    type: 'trigger',
                    side: side,
                    amount: parseHyperliquidSize(orderSize, tokenData?.universe.szDecimals ?? 5),
                    price: getMarketOrderPriceWithSlippage(tokenData?.assetCtx.markPx || '0', side, marketOrderSlippage),
                    params: {
                        reduceOnly: true,
                        isMarket: true,
                        triggerPrice: parseHyperliquidPrice(parseFloat(slPrice)),
                        tpsl: 'sl',
                    },
                })
            }

            // Use the context function to place the orders
            const response = await handleExecuteHyperliquidTrade(
                {
                    orders: orders,
                    params: {
                        grouping: tpPrice || slPrice ? 'positionTpsl' : 'na',
                    },
                },
                symbol,
                side, // Use the calculated side based on position
                () => {
                    props.onConfirm?.()
                    modalRef.current?.closeModal()
                }
            )

            if (response) {
                // Success is handled by the context function
            }
        } catch (error) {
            console.error('Error setting TP/SL orders:', error)
            toast.error('Error setting TP/SL orders.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelOrder = async (order: OpenOrder, type: 'tp' | 'sl') => {
        if (!order) return
        const marketDataItem = findMarketDataByName(marketData, order.coin)
        type === 'tp' ? setIsCancellingTP(true) : setIsCancellingSL(true)
        const toastId = toast.loading('Cancelling order...')
        try {
            // Replace with your actual cancel logic
            await axios.post('/api/hyperliquid/cancel-order', {
                orderId: order.oid,
                coin: marketDataItem?.symbol,
            })
            toast.success('Order cancelled.')
        } catch (e) {
            toast.error('Failed to cancel order.')
        } finally {
            toast.dismiss(toastId)
            type === 'tp' ? setIsCancellingTP(false) : setIsCancellingSL(false)
        }
    }

    const entryPx = parseFloat(props.position?.entryPx ?? '0')
    const size = Number(props.position?.size ?? 0)
    const isLong = size > 0

    const getExpectedPnl = (triggerPxStr: string) => {
        const triggerPx = parseFloat(triggerPxStr ?? '0')
        if (!entryPx || !triggerPx || !size) return 0
        return isLong ? (triggerPx - entryPx) * Math.abs(size) : (entryPx - triggerPx) * Math.abs(size)
    }

    const handleClose = () => {
        modalRef.current?.closeModal()
    }

    return (
        <Modal ref={modalRef}>
            <div className="relative w-full max-w-lg bg-black border border-border rounded-lg overflow-hidden">
                <div className="p-3 flex items-center justify-between border-b border-border  bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">TP/SL for Position</div>
                    <div>
                        <XButton onClick={handleClose} />
                    </div>
                </div>

                <div className="p-3">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                            {[
                                {
                                    label: 'Coin',
                                    value: positionDetails.coin,
                                    className: 'text-white',
                                },
                                {
                                    label: 'Side',
                                    value: positionDetails.side,
                                    className: `${positionDetails.side === 'Long' ? 'text-positive' : 'text-negative'}`,
                                },
                                {
                                    label: 'Position Size',
                                    value: positionDetails.position,
                                    className: 'text-white',
                                },
                                {
                                    label: 'Entry Price',
                                    value: formatCryptoPrice(positionDetails.entryPrice),
                                    className: 'text-white',
                                },
                                {
                                    label: 'Mark Price',
                                    value: formatCryptoPrice(positionDetails.markPrice),
                                    className: 'text-white',
                                },
                            ].map(({ label, value, className }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <span className="flex-1 bg-transparent  text-sm text-neutral-text focus:outline-none">{label}</span>
                                    <span className={className}>{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Take Profit Section */}
                        {tpOrder ? (
                            <div className="flex items-start justify-between">
                                <span className="flex-1 bg-transparent text-sm text-neutral-text focus:outline-none">Take Profit</span>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="flex items-center justify-end gap-2">
                                        {tpOrder.triggerCondition}
                                        <Button
                                            variant="ghost"
                                            className="h-6 min-h-6 text-2xs font-normal rounded-md w-16"
                                            padding="px-1"
                                            disabled={isCancellingTP}
                                            onClick={() => handleCancelOrder(tpOrder, 'tp')}
                                        >
                                            {isCancellingTP ? (
                                                <Spinner size={6} borderWidth={1} className="flex items-center justify-center" />
                                            ) : (
                                                'Cancel'
                                            )}
                                        </Button>
                                    </span>
                                    <span className="text-neutral-text-dark text-xs">
                                        Expected Profit: {formatCryptoPrice(getExpectedPnl(tpOrder?.triggerPx), 2)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-12 gap-3">
                                <div className="col-span-8 flex items-center border border-border/50 rounded-lg bg-table-odd">
                                    <DecimalInput
                                        type="text"
                                        allowNegative
                                        placeholder="TP Price"
                                        maxDecimals={getDecimalPlaces(Number(positionDetails.markPrice))}
                                        value={tpPrice}
                                        onChange={e => {
                                            setTpPrice(e.target.value)
                                            if (e.target.value === '') {
                                                setTpGain('')
                                            } else {
                                                setLastEdited({ field: 'tpPrice' })
                                            }
                                        }}
                                        className="flex-1 bg-transparent p-2 text-neutral-text focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-4 relative flex items-center border border-border/50 rounded-lg bg-table-odd px-2">
                                    <DecimalInput
                                        placeholder="Gain"
                                        maxDecimals={2}
                                        allowNegative
                                        value={tpGain}
                                        onChange={e => {
                                            setTpGain(e.target.value)
                                            if (e.target.value === '') {
                                                setTpPrice('')
                                            } else {
                                                setLastEdited({ field: 'tpGain' })
                                            }
                                        }}
                                        className="flex-1 absolute bg-transparent p-2 text-neutral-text focus:outline-none"
                                    />
                                    <div className="absolute right-0">
                                        <button
                                            onClick={() => setTpDropdownOpen(!tpDropdownOpen)}
                                            className="px-3 py-2 text-white flex items-center gap-1"
                                        >
                                            {tpUnit}
                                            <MdOutlineKeyboardArrowDown
                                                className={`transform transition-transform ${tpDropdownOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {tpDropdownOpen && (
                                            <div className="absolute right-0 mt-1 w-24 bg-black border border-border rounded-lg shadow-lg z-10">
                                                <button
                                                    onClick={() => {
                                                        setTpUnit('%')
                                                        setTpDropdownOpen(false)
                                                    }}
                                                    className="w-full px-3 py-2 text-left hover:bg-neutral-800 text-neutral-text"
                                                >
                                                    %
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setTpUnit('$')
                                                        setTpDropdownOpen(false)
                                                    }}
                                                    className="w-full px-3 py-2 text-left hover:bg-neutral-800 text-neutral-text"
                                                >
                                                    $
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stop Loss Section */}
                        {slOrder ? (
                            <div className="flex items-start justify-between">
                                <span className="flex-1 bg-transparent text-sm text-neutral-text focus:outline-none">Stop Loss</span>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="flex items-center justify-end gap-2">
                                        {slOrder.triggerCondition}
                                        <Button
                                            variant="ghost"
                                            className="h-6 min-h-6 text-2xs font-normal rounded-md w-16"
                                            padding="px-1"
                                            disabled={isCancellingSL}
                                            onClick={() => handleCancelOrder(slOrder, 'sl')}
                                        >
                                            {isCancellingSL ? (
                                                <Spinner size={6} borderWidth={1} className="flex items-center justify-center" />
                                            ) : (
                                                'Cancel'
                                            )}
                                        </Button>
                                    </span>
                                    <span className="text-neutral-text-dark text-xs">
                                        Expected Loss: {formatCryptoPrice(getExpectedPnl(slOrder?.triggerPx), 2)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-12 gap-3">
                                <div className="col-span-8 flex items-center border border-border/50 rounded-lg bg-table-odd">
                                    <DecimalInput
                                        maxDecimals={getDecimalPlaces(Number(positionDetails.markPrice))}
                                        allowNegative
                                        placeholder="SL Price"
                                        value={slPrice}
                                        onChange={e => {
                                            setSlPrice(e.target.value)
                                            if (e.target.value === '') {
                                                setSlLoss('')
                                            } else {
                                                setLastEdited({ field: 'slPrice' })
                                            }
                                        }}
                                        className="flex-1 bg-transparent p-2 text-neutral-text focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-4 relative flex items-center border border-border/50 rounded-lg bg-table-odd px-2">
                                    <DecimalInput
                                        maxDecimals={2}
                                        allowNegative
                                        placeholder="Loss"
                                        value={slLoss}
                                        onChange={e => {
                                            setSlLoss(e.target.value)
                                            if (e.target.value === '') {
                                                setSlPrice('')
                                            } else {
                                                setLastEdited({ field: 'slLoss' })
                                            }
                                        }}
                                        className="flex-1 absolute bg-transparent p-2 text-neutral-text focus:outline-none"
                                    />
                                    <div className="absolute right-0">
                                        <button
                                            onClick={() => setSlDropdownOpen(!slDropdownOpen)}
                                            className="px-3 py-2 text-white flex items-center gap-1"
                                        >
                                            {slUnit}
                                            <MdOutlineKeyboardArrowDown
                                                className={`transform transition-transform ${slDropdownOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {slDropdownOpen && (
                                            <div className="absolute right-0 mt-1 w-24 bg-black border border-border rounded-lg shadow-lg z-10">
                                                <button
                                                    onClick={() => {
                                                        setSlUnit('%')
                                                        setSlDropdownOpen(false)
                                                    }}
                                                    className="w-full px-3 py-2 text-left hover:bg-neutral-800 text-neutral-text"
                                                >
                                                    %
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSlUnit('$')
                                                        setSlDropdownOpen(false)
                                                    }}
                                                    className="w-full px-3 py-2 text-left hover:bg-neutral-800 text-neutral-text"
                                                >
                                                    $
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Configuration Options */}
                        {/* <div className="flex justify-start items-center gap-2">
                <input
                  className="form-checkbox"
                  type="checkbox"
                  name="checkbox"
                  checked={configureAmount}
                  onChange={(e) => setConfigureAmount(e.target.checked)}
                />
                <span className="text-neutral-text text-sm">
                  Configure Amount
                </span>
              </div>
              <div className="flex justify-start items-center gap-2">
                <input
                  className="form-checkbox"
                  type="checkbox"
                  name="checkbox"
                  checked={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.checked)}
                />
                <span className="text-neutral-text text-sm">Limit Price</span>
              </div> */}

                        {/* Explanatory Text */}
                        <p className="text-xs text-neutral-text-dark ">
                            By default take-profit and stop-loss orders apply to the entire position. Take-profit and stop-loss automatically cancel
                            after closing the position. A market order is triggered when the stop loss or take profit price is reached.
                        </p>
                        <p className="text-xs text-neutral-text-dark ">
                            If the order size is configured above, the TP/SL order will be for that size no matter how the position changes in the
                            future.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col w-full px-3 pb-3 gap-3">
                    <div className="flex items-center justify-end gap-3 text-xs">
                        <Button onClick={handleClose} variant="ghost">
                            Cancel
                        </Button>
                        <Button onClick={handleSetTPSL} disabled={(!tpPrice && !slPrice) || isLoading || isContextProcessing} variant="primary">
                            <span>Confirm</span>
                            {isLoading && <Spinner variant="primary" className="" />}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
})

TakeprofitStopLoss.displayName = 'TakeprofitStopLoss'
export default TakeprofitStopLoss
