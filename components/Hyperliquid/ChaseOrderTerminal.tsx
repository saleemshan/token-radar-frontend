import React, { useEffect } from 'react'

import { usePairTokensContext } from '@/context/pairTokensContext'
import Tooltip from '../Tooltip'
import { FaCircleInfo } from 'react-icons/fa6'
import DecimalInput from '../input/DecimalInput'
import { getDecimalPlaces } from '@/utils/price'

interface TPSLSettings {
    enabled: boolean
    takeProfitPrice: string
    stopLossPrice: string
    gain: string
    loss: string
}

interface ChaseOrderTerminalProps {
    tpslSettings: TPSLSettings
    setTpslSettings: (settings: TPSLSettings) => void
    reduceOnly: boolean
    setReduceOnly: (value: boolean) => void
    currentPrice: number
    isBuy: boolean
    leverage: number
    existingPosition?: {
        side: 'long' | 'short'
        size: number
    } | null
}

const ChaseOrderTerminal: React.FC<ChaseOrderTerminalProps> = ({
    tpslSettings,
    setTpslSettings,
    reduceOnly,
    setReduceOnly,
    currentPrice,
    isBuy,
    leverage = 1, // Default to 1x if not provided
    existingPosition = null,
}) => {
    const { isSpotToken } = usePairTokensContext()

    // Determine the final position direction after order execution
    const getFinalPositionDirection = (): 'long' | 'short' => {
        // If reduce only is enabled, we're closing position, so use existing position direction
        if (reduceOnly && existingPosition) {
            return existingPosition.side
        }

        // For new positions or increasing positions, use order direction
        return isBuy ? 'long' : 'short'
    }

    const isLongPosition = getFinalPositionDirection() === 'long'

    // Calculate TP/SL prices based on ROE percentage
    const calculateTPSLPriceFromROE = (roePercentage: string, isTP: boolean) => {
        if (!roePercentage || !currentPrice) return ''
        const roeNum = parseFloat(roePercentage)
        if (isNaN(roeNum)) return ''

        // Convert ROE percentage to price change factor
        const priceChangeFactor = roeNum / (leverage * 100)

        let newPrice
        if (isLongPosition) {
            // Long position
            if (isTP) {
                // Take profit: price goes up for profit
                newPrice = currentPrice * (1 + priceChangeFactor)
            } else {
                // Stop loss: price goes down for loss
                newPrice = currentPrice * (1 - priceChangeFactor)
            }
        } else {
            // Short position
            if (isTP) {
                // Take profit: price goes down for profit
                newPrice = currentPrice * (1 - priceChangeFactor)
            } else {
                // Stop loss: price goes up for loss
                newPrice = currentPrice * (1 + priceChangeFactor)
            }
        }

        return newPrice.toString()
    }

    // Calculate ROE percentage based on price
    const calculateROEFromPrice = (price: string, isTP: boolean) => {
        if (!price || !currentPrice) return ''
        const priceNum = parseFloat(price)
        if (isNaN(priceNum)) return ''

        // Calculate price change factor
        const priceChangeFactor = (priceNum - currentPrice) / currentPrice

        let roe
        if (isLongPosition) {
            // Long position
            if (isTP) {
                // Take profit: positive price change should give positive ROE
                roe = priceChangeFactor * leverage * 100
            } else {
                // Stop loss: negative price change should give positive ROE (loss magnitude)
                roe = -priceChangeFactor * leverage * 100
            }
        } else {
            // Short position
            if (isTP) {
                // Take profit: negative price change should give positive ROE
                roe = -priceChangeFactor * leverage * 100
            } else {
                // Stop loss: positive price change should give positive ROE (loss magnitude)
                roe = priceChangeFactor * leverage * 100
            }
        }

        return Math.abs(roe).toString()
    }

    const handleRadioClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const clickedValue = e.currentTarget.checked

        // If enabling TP/SL, disable reduceOnly
        setReduceOnly(false)
        setTpslSettings({
            ...tpslSettings,
            enabled: clickedValue,
        })
    }

    // Handle reduce only checkbox
    const handleReduceOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked
        // If enabling reduceOnly, disable TP/SL
        setTpslSettings({
            ...tpslSettings,
            enabled: false,
        })
        setReduceOnly(newValue)
    }

    // Recalculate TP/SL prices when position direction changes
    useEffect(() => {
        if (tpslSettings.enabled && (tpslSettings.gain || tpslSettings.loss)) {
            const newSettings = { ...tpslSettings }

            // Recalculate TP price if gain percentage exists
            if (tpslSettings.gain) {
                newSettings.takeProfitPrice = calculateTPSLPriceFromROE(tpslSettings.gain, true)
            }

            // Recalculate SL price if loss percentage exists
            if (tpslSettings.loss) {
                newSettings.stopLossPrice = calculateTPSLPriceFromROE(tpslSettings.loss, false)
            }

            setTpslSettings(newSettings)
        }
    }, [isLongPosition, currentPrice]) // Re-run when position direction or current price changes

    const updateTPSLSettings = (field: keyof TPSLSettings, value: string) => {
        const newSettings = { ...tpslSettings }

        // Handle empty/cleared inputs
        if (value === '') {
            // Handle each string field appropriately
            if (field === 'takeProfitPrice' || field === 'stopLossPrice' || field === 'gain' || field === 'loss') {
                newSettings[field] = ''
            }

            // Clear related field as well
            if (field === 'gain') {
                newSettings.takeProfitPrice = ''
            } else if (field === 'loss') {
                newSettings.stopLossPrice = ''
            } else if (field === 'takeProfitPrice') {
                newSettings.gain = ''
            } else if (field === 'stopLossPrice') {
                newSettings.loss = ''
            }

            setTpslSettings(newSettings)
            return
        }

        // Prevent non-numeric inputs except for decimal point
        if (field !== 'enabled' && !/^-?\d*\.?\d*$/.test(value)) {
            return
        }

        switch (field) {
            case 'gain':
                newSettings.gain = value
                newSettings.takeProfitPrice = calculateTPSLPriceFromROE(value, true)
                break
            case 'loss':
                newSettings.loss = value
                newSettings.stopLossPrice = calculateTPSLPriceFromROE(value, false)
                break
            case 'takeProfitPrice':
                newSettings.takeProfitPrice = value
                newSettings.gain = calculateROEFromPrice(value, true)
                break
            case 'stopLossPrice':
                newSettings.stopLossPrice = value
                newSettings.loss = calculateROEFromPrice(value, false)
                break
            case 'enabled':
                newSettings.enabled = value === 'true'
                break
            default:
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _exhaustiveCheck: never = field
                return
        }

        setTpslSettings(newSettings)
    }

    // console.log(getDecimalPlaces(currentPrice ?? 0), 'currentPrice')
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-start items-center gap-1 bg-transparent">
                <input className="form-checkbox" type="checkbox" name="checkbox" checked={reduceOnly} onChange={handleReduceOnlyChange} />

                <div className=" bg-black font-semibold text-left flex items-center gap-1">
                    <span className="text-neutral-text text-xs">Reduce Only</span>
                    <Tooltip text="This order will not open a new position no matter how large the order size is. It will compare to the existing position at the time of execution.">
                        <FaCircleInfo className="text-[9px] text-neutral-text-dark" />
                    </Tooltip>
                </div>
            </div>

            {!isSpotToken && (
                <div className="flex justify-start items-center gap-1">
                    <input
                        type="checkbox"
                        name="checkbox"
                        className="form-checkbox"
                        checked={tpslSettings.enabled}
                        onChange={e => handleRadioClick(e)}
                    />

                    <div className=" bg-black font-semibold text-left flex items-center gap-1">
                        <span className="text-neutral-text text-xs">Take Profit / Stop Loss</span>
                        <Tooltip text="Places simple market TP/SL orders. For  advanced features such as limit prices or partial TP/SL, set the TP/SL on an open position.">
                            <FaCircleInfo className="text-[9px] text-neutral-text-dark" />
                        </Tooltip>
                    </div>
                </div>
            )}

            {tpslSettings.enabled && (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <div className="w-1/2">
                            <DecimalInput
                                type="text"
                                placeholder="TP Price"
                                maxDecimals={getDecimalPlaces(currentPrice ?? 0)}
                                value={tpslSettings.takeProfitPrice ?? ''}
                                onChange={e => updateTPSLSettings('takeProfitPrice', e.target.value)}
                                className="w-full h-full p-2 bg-table-odd rounded border border-border focus:outline-none"
                            />
                        </div>
                        <div className="w-1/2 p-2 flex justify-between bg-table-odd rounded border border-border focus:outline-none">
                            <DecimalInput
                                maxDecimals={2}
                                type="text"
                                placeholder="Gain"
                                value={tpslSettings.gain ?? ''}
                                onChange={e => updateTPSLSettings('gain', e.target.value)}
                                className="w-full bg-table-odd"
                            />
                            <p>%</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="w-1/2">
                            <DecimalInput
                                maxDecimals={getDecimalPlaces(currentPrice ?? 0)}
                                placeholder="SL Price"
                                value={tpslSettings.stopLossPrice ?? ''}
                                onChange={e => updateTPSLSettings('stopLossPrice', e.target.value)}
                                className="w-full h-full p-2 bg-table-odd rounded border border-border focus:outline-none"
                                allowNegative={true}
                            />
                        </div>
                        <div className="w-1/2 p-2 flex justify-between bg-table-odd rounded border border-border focus:outline-none">
                            <DecimalInput
                                maxDecimals={2}
                                placeholder="Loss"
                                value={tpslSettings.loss ?? ''}
                                onChange={e => updateTPSLSettings('loss', e.target.value)}
                                className="w-full bg-table-odd"
                            />
                            <p>%</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChaseOrderTerminal
