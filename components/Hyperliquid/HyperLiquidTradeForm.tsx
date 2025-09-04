// React and Next.js
import React, { useEffect, useMemo, useRef, useState } from 'react'

// Third-party libraries
import { toast } from 'react-toastify'
import { FaCircleInfo, FaWallet } from 'react-icons/fa6'

// Contexts
import { usePairTokensContext } from '@/context/pairTokensContext'
import { useWebDataContext } from '@/context/webDataContext'
import { useTrade, HyperliquidOrdersParams } from '@/context/TradeContext'
import { useUser } from '@/context/UserContext'
import { useHyperLiquidContext } from '@/context/hyperLiquidContext'
import AdjustSlippageModal from '../modal/AdjustSlippageModal'

// Components
import Spinner from '../Spinner'
import DecimalInput from '../input/DecimalInput'
import ChaseOrderTerminal from './ChaseOrderTerminal'

// Modal components
import SetMarginModeModal from '../modal/SetMarginModeModal'
import PositionModeModal from '../modal/PositionModeModal'
import UpdateLeverageModal from '../modal/UpdateLeverageModal'

// Utils
import { findCoinFromMarketDataByCoinId } from '@/utils/tokenSymbol'
import {
    countDecimalPlaces,
    formatCryptoPrice,
    getDecimalPlaces,
    getMarketOrderPriceWithSlippageAndTickSize,
    getReadableNumber,
    parseHyperliquidPrice,
    parseHyperliquidSize,
} from '@/utils/price'

// Hooks
import { useUserFeesData } from '@/hooks/data/useUserFeesData'
import Tooltip from '../Tooltip'
import { SlippageDisplay } from './SlippageDisplay'
import useHaptic from '@/hooks/useHaptic'

// Interfaces
interface EstimateTokenReceived {
    amount: number
    usd: number
}

// Constants
const presetOptions = [0.25, 0.5, 0.75, 1]

const HyperLiquidTradeForm = ({ initialActiveTab = 'buy' }: { initialActiveTab?: 'buy' | 'sell' }) => {
    // Context hooks
    const { isSpotToken, pair, activeSpotAssetCtx, activePrepAssetCtx, activeAssetData, assetId, spotTokenId, spotTokensData, tokenPairData } =
        usePairTokensContext()

    const { webData2, marketData, loadingWebData2 } = useWebDataContext()

    // Add trade context
    const { handleExecuteHyperliquidTrade, isTradeProcessing: isContextProcessing } = useTrade()

    // Add user context to get wallet address
    const { userPublicWalletAddresses } = useUser()

    // Add Hyperliquid context for slippage
    const { marketOrderSlippage } = useHyperLiquidContext()

    // Add user fees data hook
    const { data: userFeesData } = useUserFeesData(userPublicWalletAddresses?.ethereum)

    const { triggerHaptic } = useHaptic()

    // Refs
    const marginModeModalRef = useRef<{ toggleModal: () => void }>(null)
    const leverageModalRef = useRef<{ toggleModal: () => void }>(null)
    const positionModeModalRef = useRef<{ toggleModal: () => void }>(null)
    const slippageModalRef = useRef<{ toggleModal: () => void }>(null)

    // Order type states
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>(initialActiveTab)
    const [orderType, setOrderType] = useState<'Cross' | '5x' | 'One-Way'>('Cross')
    const [marketType, setMarketType] = useState<'Market' | 'Limit'>('Market')
    const [limitType, setLimitType] = useState<'Gtc' | 'Ioc' | 'Alo'>('Gtc')
    const [reduceOnly, setReduceOnly] = useState<boolean>(false)

    // Order input states
    const [price, setPrice] = useState<number>(isSpotToken ? Number(activeSpotAssetCtx?.midPx) : Number(activePrepAssetCtx?.midPx))
    const [amountInput, setAmountInput] = useState(0)
    const [collateralInput, setCollateralInput] = useState(0)
    const [selectedPreset, setSelectedPreset] = useState<undefined | number>(undefined)
    const [isAmountMode, setIsAmountMode] = useState(true) // true = amount mode, false = collateral mode

    // UI states
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [estimateTokenReceived, setEstimateTokenReceived] = useState<EstimateTokenReceived | null>(null)

    // TP/SL states
    const [tpslSettings, setTpslSettings] = useState({
        enabled: false,
        takeProfitPrice: '',
        stopLossPrice: '',
        gain: '',
        loss: '',
    })

    // Derived values
    const isBuy = activeTab === 'buy'
    const currentMarketPrice = isSpotToken ? activeSpotAssetCtx?.markPx : activePrepAssetCtx?.markPx
    const leverageValue = activeAssetData?.leverage.value ?? 10

    // Get current position for reduce-only validation
    const currentPosition = useMemo(() => {
        if (isSpotToken) return null

        const position = webData2?.clearinghouseState?.assetPositions?.find(pos => pos.position.coin === activePrepAssetCtx?.coin)
        if (!position?.position) return null

        const size = Number(position.position.szi || 0)
        if (size === 0) return null

        return {
            side: (size > 0 ? 'long' : 'short') as 'long' | 'short',
            size: Math.abs(size),
        }
    }, [webData2?.clearinghouseState?.assetPositions, activePrepAssetCtx?.coin, isSpotToken])

    // Validate reduce-only order direction
    const isReduceOnlyValid = useMemo(() => {
        if (!reduceOnly || !currentPosition) return true

        // For reduce-only orders, the order side must be opposite to the position side
        if (currentPosition.side === 'long' && activeTab === 'buy') return false
        if (currentPosition.side === 'short' && activeTab === 'sell') return false

        return true
    }, [reduceOnly, currentPosition, activeTab])

    // Calculate available balance
    const availableBalance = useMemo(() => {
        // For spot tokens
        if (isSpotToken) {
            if (activeTab === 'buy') {
                // When buying spot, show USDC balance
                const usdcBalance = webData2?.spotState?.balances.find(balance => balance.coin === 'USDC')?.total ?? '0'
                return Number(usdcBalance)
            } else {
                // When selling spot, show the selected token's balance
                const tokenData = spotTokensData?.find(token => token.coin === activeSpotAssetCtx?.coin)
                const tokenBalance = webData2?.spotState?.balances.find(balance => balance.coin === tokenData?.name)?.total ?? '0'
                return Number(tokenBalance)
            }
        }
        // For perpetual futures
        else {
            // Get order type and leverage
            const positionData = webData2?.clearinghouseState?.assetPositions?.find(pos => pos.position.coin === activePrepAssetCtx?.coin)

            const currentLeverageType = positionData?.position?.leverage?.type || orderType === 'Cross' ? 'cross' : 'isolated'

            // Calculate available margin based on leverage type
            if (currentLeverageType === 'cross') {
                // Cross margin: accountValue - totalMarginUsed
                const accountValue = Number(webData2?.clearinghouseState?.marginSummary?.accountValue ?? 0)
                const marginUsed = Number(webData2?.clearinghouseState?.marginSummary?.totalMarginUsed ?? 0)
                const availableMargin = Math.max(0, accountValue - marginUsed)

                // Return available buying power with leverage applied
                return availableMargin
            } else {
                // Isolated margin: just use withdrawable as the base
                const withdrawable = Number(webData2?.clearinghouseState?.withdrawable ?? 0)
                return withdrawable
            }
        }
    }, [
        activeSpotAssetCtx?.coin,
        activePrepAssetCtx?.coin,
        activeTab,
        isSpotToken,
        orderType,
        spotTokensData,
        webData2?.clearinghouseState,
        webData2?.spotState?.balances,
    ])

    // Calculate maximum allowed amount for reduce-only
    const maxReduceOnlyAmount = useMemo(() => {
        if (!reduceOnly || !currentPosition || !isReduceOnlyValid) return null

        // For reduce-only, max amount is the position size in USD
        return currentPosition.size * Number(currentMarketPrice || 0)
    }, [reduceOnly, currentPosition, isReduceOnlyValid, currentMarketPrice])

    // Sync amount and collateral inputs
    useEffect(() => {
        if (isSpotToken) {
            // For spot tokens, amount = collateral
            if (isAmountMode) {
                setCollateralInput(amountInput)
            } else {
                setAmountInput(collateralInput)
            }
        } else {
            // For perpetuals, apply leverage
            if (isAmountMode) {
                setCollateralInput(amountInput / leverageValue)
            } else {
                setAmountInput(collateralInput * leverageValue)
            }
        }
    }, [amountInput, collateralInput, isAmountMode, isSpotToken, leverageValue])

    // Calculate order amount
    const amount = useMemo(() => {
        const decimals = tokenPairData[assetId]?.universe.szDecimals ?? 5
        // If it's a spot token and selling, return the input size directly
        if (isSpotToken && activeTab === 'sell') {
            return amountInput
        }

        if (pair.toUpperCase() === 'USD') {
            return amountInput
        } else {
            return Number(parseHyperliquidSize(amountInput / Number(currentMarketPrice), decimals))
        }
    }, [amountInput, currentMarketPrice, pair, isSpotToken, activeTab, tokenPairData, assetId])

    // Calculate liquidation price
    const liquidationPrice = useMemo(() => {
        if (isSpotToken || amountInput <= 0) return 'N/A' // Spot trading doesn't have liquidation or no input

        // Find current position if it exists
        const currentPosition = webData2?.clearinghouseState?.assetPositions?.find(pos => pos.position.coin === activePrepAssetCtx?.coin)

        // Determine if we're dealing with a new position or modifying existing one
        const isNewPosition = !currentPosition?.position

        // Entry price: use current market price for new positions
        const entryPrice = Number(currentMarketPrice || 0)
        if (entryPrice <= 0) return 'N/A'

        // Calculate position size from user input - this is the size in tokens (BTC, ETH, etc.)
        const positionSizeInTokens = amount
        if (positionSizeInTokens <= 0) return 'N/A'

        // Side is 1 for long/buy, -1 for short/sell
        const side = activeTab === 'buy' ? 1 : -1

        // Get leverage value from the active asset data
        const leverageValue = activeAssetData?.leverage.value ?? 10

        // Determine margin type
        const leverageType = orderType === 'Cross' ? 'cross' : activeAssetData?.leverage.type || 'isolated'

        // Get the asset's maxLeverage from the token data
        const assetMaxLeverage = Number(tokenPairData[assetId]?.universe.maxLeverage) || 50

        // Calculate maintenance leverage
        // According to docs: maintenance margin is half of initial margin at max leverage
        const maintenanceLeverage = assetMaxLeverage * 2
        const l = 1 / maintenanceLeverage

        // Position notional value = position size in tokens * entry price
        const positionNotionalValue = positionSizeInTokens * entryPrice

        // Calculate maintenance margin required for this position
        const maintenanceMarginRequired = positionNotionalValue * l

        // Calculate margin available based on margin type
        let marginAvailable

        if (leverageType === 'cross') {
            // For cross margin positions:
            // margin_available (cross) = account_value - maintenance_margin_required

            // Get current account value
            const accountValue = Number(webData2?.clearinghouseState?.marginSummary?.accountValue || 0)

            // Calculate current margin used for existing positions (excluding the new position)
            const existingMaintenanceMargin = isNewPosition ? 0 : Number(webData2?.clearinghouseState?.crossMaintenanceMarginUsed || 0)

            // Margin available = account value - existing maintenance margin - new position maintenance margin
            marginAvailable = accountValue - existingMaintenanceMargin - maintenanceMarginRequired
        } else {
            // For isolated margin positions:
            // margin_available (isolated) = isolated_margin - maintenance_margin_required

            // Calculate isolated margin based on position size and leverage
            const isolatedMargin = positionNotionalValue / leverageValue

            // Margin available = isolated margin - maintenance margin
            marginAvailable = isolatedMargin - maintenanceMarginRequired
        }

        // Calculate liquidation price using the exact formula from documentation:
        // liq_price = price - side * margin_available / position_size / (1 - l * side)
        const liquidationPrice = entryPrice - (side * marginAvailable) / positionSizeInTokens / (1 - l * side)

        return liquidationPrice > 0 ? `$${formatCryptoPrice(liquidationPrice)}` : 'N/A'
    }, [
        isSpotToken,
        amountInput,
        webData2?.clearinghouseState,
        activePrepAssetCtx?.coin,
        currentMarketPrice,
        activeTab,
        amount,
        orderType,
        activeAssetData?.leverage,
        tokenPairData,
        assetId,
    ])

    // Event handlers
    const handleSelectPreset = (preset: number) => {
        triggerHaptic(20)
        setSelectedPreset(preset)

        // For reduce-only orders, use the position size limit
        if (reduceOnly && maxReduceOnlyAmount) {
            if (preset === 1) {
                setAmountInput(maxReduceOnlyAmount)
                setIsAmountMode(true)
            } else {
                setAmountInput(maxReduceOnlyAmount * preset)
                setIsAmountMode(true)
            }
            return
        }

        // Normal preset logic
        if (availableBalance) {
            if (!isSpotToken) {
                if (preset === 1) {
                    // Update collateral directly
                    setCollateralInput(availableBalance)
                    setIsAmountMode(false)
                } else {
                    // Apply preset percentage to collateral
                    setCollateralInput(availableBalance * preset)
                    setIsAmountMode(false)
                }
            } else {
                if (preset === 1) {
                    setAmountInput(availableBalance)
                    setCollateralInput(availableBalance)
                } else {
                    setAmountInput(availableBalance * preset)
                    setCollateralInput(availableBalance * preset)
                }
            }
        }
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setPrice(Number(value))
    }

    const handleSetMidPrice = () => {
        setPrice(Number(currentMarketPrice))
    }

    const handleAmountChange = (value: number) => {
        setAmountInput(value)
        setIsAmountMode(true)
    }

    const handleCollateralChange = (value: number) => {
        setCollateralInput(value)
        setIsAmountMode(false)
    }

    // Modal handlers
    const toggleModal = (modalType: string) => {
        if (modalType.toLocaleLowerCase() === 'cross' || modalType.toLocaleLowerCase() === 'isolated') {
            marginModeModalRef.current?.toggleModal()
        } else if (modalType.endsWith('x')) {
            leverageModalRef.current?.toggleModal()
        } else if (modalType === 'One-Way') {
            positionModeModalRef.current?.toggleModal()
        } else if (modalType === 'slippage') {
            slippageModalRef.current?.toggleModal()
        }
        setOrderType(modalType as typeof orderType)
    }

    // Order submission handler
    const handlePlaceOrder = async () => {
        triggerHaptic(50)
        setIsSubmitting(true)

        // Add info toast when starting the order
        const marketDataItem = findCoinFromMarketDataByCoinId(marketData, isSpotToken ? spotTokenId?.toString() : assetId?.toString())

        // console.log({
        //     marketData,
        //     isSpotToken,
        //     spotTokenId,
        //     assetId,
        //     marketDataItem,
        // })

        if (!marketDataItem?.symbol) {
            toast.error('Market data not found')
            setIsSubmitting(false)
            return
        }

        // Get szDecimals for enhanced tick size compliance
        const szDecimals = tokenPairData[assetId]?.universe.szDecimals ?? 5

        // Create base order
        const baseOrder: HyperliquidOrdersParams = {
            coin: assetId,
            type: marketType === 'Market' ? 'market' : 'limit',
            side: isBuy ? 'buy' : 'sell',
            amount: amount.toString(),
            price:
                marketType === 'Limit'
                    ? parseHyperliquidPrice(price)
                    : getMarketOrderPriceWithSlippageAndTickSize(
                          currentMarketPrice || '0',
                          isBuy ? 'buy' : 'sell',
                          marketOrderSlippage,
                          szDecimals,
                          isSpotToken ?? false
                      ),
            params: {
                reduceOnly: reduceOnly,
            },
        }

        // If TPSL is enabled, create TP and SL orders
        const orders: HyperliquidOrdersParams[] = []
        orders.push(baseOrder)

        if (tpslSettings.enabled && !isSpotToken) {
            // Add Take Profit order
            if (tpslSettings.takeProfitPrice) {
                orders.push({
                    coin: assetId,
                    type: 'trigger',
                    side: isBuy ? 'sell' : 'buy', // Opposite of base order
                    amount: amount.toString(),
                    price: getMarketOrderPriceWithSlippageAndTickSize(
                        Number(tpslSettings.takeProfitPrice),
                        isBuy ? 'sell' : 'buy',
                        marketOrderSlippage,
                        szDecimals,
                        isSpotToken ?? false
                    ),
                    params: {
                        reduceOnly: true,
                        timeInForce: limitType,
                        isMarket: true,
                        triggerPrice: parseHyperliquidPrice(Number(tpslSettings.takeProfitPrice)),
                        tpsl: 'tp',
                    },
                })
            }

            // Add Stop Loss order
            if (tpslSettings.stopLossPrice) {
                orders.push({
                    coin: assetId,
                    type: 'trigger',
                    side: isBuy ? 'sell' : 'buy', // Opposite of base order
                    amount: amount.toString(),
                    price: getMarketOrderPriceWithSlippageAndTickSize(
                        Number(tpslSettings.stopLossPrice),
                        isBuy ? 'sell' : 'buy',
                        marketOrderSlippage,
                        szDecimals,
                        isSpotToken ?? false
                    ),
                    params: {
                        reduceOnly: true,
                        timeInForce: limitType,
                        triggerPrice: parseHyperliquidPrice(Number(tpslSettings.stopLossPrice)),
                        isMarket: true,
                        tpsl: 'sl',
                    },
                })
            }
        }

        const resetForm = () => {
            setAmountInput(0)
            setCollateralInput(0)
            setTpslSettings({
                enabled: false,
                takeProfitPrice: '',
                stopLossPrice: '',
                gain: '',
                loss: '',
            })
        }

        try {
            // Use the context function instead of direct API call
            await handleExecuteHyperliquidTrade(
                {
                    orders: orders,
                    params: {
                        grouping: tpslSettings.takeProfitPrice || tpslSettings.stopLossPrice ? 'normalTpsl' : 'na',
                    },
                },
                marketDataItem.base,
                isBuy ? 'buy' : 'sell',
                resetForm,
                'perps-trade-button'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    // Calculate estimated token received
    useEffect(() => {
        if (!amountInput || !currentMarketPrice) {
            setEstimateTokenReceived(null)
            return
        }

        if (isSpotToken) {
            if (isBuy) {
                // When buying, divide USDC amount by price to get token amount
                const tokenAmount = amountInput / Number(currentMarketPrice)
                setEstimateTokenReceived({
                    amount: tokenAmount,
                    usd: amountInput,
                })
            } else {
                // When selling, multiply token amount by price to get USDC
                const usdAmount = amountInput * Number(currentMarketPrice)
                setEstimateTokenReceived({
                    amount: usdAmount,
                    usd: usdAmount,
                })
            }
        } else {
            // For perpetuals, calculate based on leverage and direction
            const estimatedAmount = amount
            const estimatedUsd = amount * Number(currentMarketPrice)
            setEstimateTokenReceived({
                amount: estimatedAmount,
                usd: estimatedUsd,
            })
        }
    }, [amountInput, currentMarketPrice, isSpotToken, isBuy, amount])

    return (
        <div className="flex flex-col  bg-black text-neutral-text w-full min-h-fit">
            <SetMarginModeModal ref={marginModeModalRef} />
            <UpdateLeverageModal ref={leverageModalRef} />
            <PositionModeModal ref={positionModeModalRef} />
            <AdjustSlippageModal ref={slippageModalRef} />

            {/* Order Type Tabs */}

            {!isSpotToken && (
                <div className="flex w-full p-2 h-16 min-h-16 border-b border-border">
                    <div className="flex w-full border rounded-lg border-border overflow-hidden p-1 gap-1">
                        {[
                            activeAssetData?.leverage.type ? activeAssetData?.leverage.type : 'Cross',
                            activeAssetData?.leverage.value ? activeAssetData?.leverage.value + 'x' : '50x',
                            'One-Way',
                        ].map(type => (
                            <button
                                key={type}
                                className={`flex-1 text-xs font-semibold capitalize rounded-md bg-table-odd hover:bg-neutral-900 text-neutral-text   apply-transition py-2`}
                                onClick={() => toggleModal(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-2 p-3  h-16 min-h-16 border-b border-border">
                <button
                    type="button"
                    onClick={() => setActiveTab('buy')}
                    className={`w-1/2 flex items-center justify-center px-3 h-10 rounded-lg font-semibold text-xs duration-200 transition-all  ${
                        activeTab === 'buy'
                            ? 'text-positive bg-positive/20'
                            : 'bg-[#0f0f0f] text-neutral-text-dark hover:bg-positive/20 hover:text-positive/50'
                    }`}
                >
                    Buy
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('sell')}
                    className={`w-1/2 flex items-center justify-center px-3 h-10 rounded-lg font-semibold text-xs duration-200 transition-all ${
                        activeTab === 'sell'
                            ? 'text-negative bg-negative/20'
                            : 'bg-[#0f0f0f] text-neutral-text-dark hover:bg-negative/20 hover:text-negative/50'
                    }`}
                >
                    Sell
                </button>
            </div>

            {/* Market/Limit/Scale Tabs */}
            <div className="flex w-full border-b border-border relative gap-3 px-3">
                {['Market', 'Limit'].map(type => (
                    <button
                        key={type}
                        className={` text-center  font-semibold h-full  py-3 rounded-lg cursor-pointer relative flex flex-col text-xs ${
                            marketType === type ? ' text-neutral-text' : 'text-neutral-text-dark'
                        }  apply-transition`}
                        onClick={() => setMarketType(type as typeof marketType)}
                    >
                        <span> {type}</span>
                        {marketType === type && <span className="inset-0 border-b border-neutral-text absolute bottom-0"></span>}
                    </button>
                ))}
            </div>

            {/* Trading Info */}
            <div className="flex flex-col gap-3 p-3 text-sm">
                {!isSpotToken && (
                    <>
                        <div className="flex w-full bg-neutral-900  rounded-lg">
                            <div className="p-3 px-4 text-neural-text font-semibold text-xs min-w-24">Collateral</div>
                            <div className="relative overflow-hidden w-full h-10 flex items-center bg-[#0f0f0f] rounded-lg">
                                <DecimalInput
                                    onChange={e => {
                                        handleCollateralChange(+e.target.value)
                                    }}
                                    value={collateralInput ? collateralInput.toString() : ''}
                                    maxDecimals={2}
                                    className="w-full h-full text-right  bg-transparent font-semibold focus:outline-none  text-sm text-neutral-text px-3"
                                />
                                <div className=" text-neutral-text z-10  font-semibold pr-3 pointer-events-none ">
                                    {isSpotToken
                                        ? activeTab === 'buy'
                                            ? 'USDC'
                                            : findCoinFromMarketDataByCoinId(marketData, activeSpotAssetCtx?.coin ?? '')?.symbol
                                        : 'USD'}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex w-full bg-neutral-900  rounded-lg">
                    <div className="p-3 px-4 text-neural-text font-semibold text-xs min-w-24">Amount</div>
                    <div className="relative overflow-hidden w-full h-10 flex items-center bg-[#0f0f0f] rounded-lg">
                        <DecimalInput
                            onChange={e => {
                                handleAmountChange(+e.target.value)
                            }}
                            value={amountInput ? amountInput.toString() : ''}
                            maxDecimals={2}
                            className="w-full h-full text-right  bg-transparent font-semibold focus:outline-none  text-sm text-neutral-text px-3"
                        />
                        <div className=" text-neutral-text z-10  font-semibold pr-3 pointer-events-none ">
                            {isSpotToken
                                ? activeTab === 'buy'
                                    ? 'USDC'
                                    : findCoinFromMarketDataByCoinId(marketData, activeSpotAssetCtx?.coin ?? '')?.symbol
                                : 'USD'}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 items-center justify-between text-xs text-neutral-text">
                    <span>Available</span>
                    <button onClick={() => handleSelectPreset(1)} type="button" className="flex gap-2 items-center ">
                        <FaWallet />
                        <div className="flex items-center gap-1">
                            {loadingWebData2 ? <Spinner className="" /> : <div>{getReadableNumber(availableBalance, 2)}</div>}{' '}
                            {isSpotToken
                                ? activeTab === 'buy'
                                    ? 'USDC'
                                    : findCoinFromMarketDataByCoinId(marketData, activeSpotAssetCtx?.coin ?? '')?.symbol
                                : 'USD'}
                        </div>
                    </button>
                </div>
                {marketType === 'Limit' && (
                    <div className="flex items-center border border-border rounded-lg px-2 py-3 w-full">
                        <p className="text-neutral-text-dark">Price(USD)</p>
                        <div className="w-full relative">
                            <DecimalInput
                                value={price ? price.toString() : ''}
                                onChange={handlePriceChange}
                                maxDecimals={getDecimalPlaces(Number(currentMarketPrice))}
                                className="flex-1 bg-transparent text-right [&::placeholder]:text-left"
                            />
                            <button
                                onClick={handleSetMidPrice}
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-table-odd border border-border hover:opacity-80 px-2 py-[2px] rounded-md text-2xs font-semibold"
                            >
                                Mid
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                    {presetOptions.map((option, index) => {
                        return (
                            <button
                                key={index}
                                onClick={() => handleSelectPreset(option)}
                                type="button"
                                className={`col-span-1 flex items-center justify-center px-3 h-9 rounded-lg font-semibold text-xs hover:bg-neutral-800 duration-200 transition-all ${
                                    selectedPreset && selectedPreset === option
                                        ? 'bg-neutral-900 text-neutral-text'
                                        : 'bg-[#0f0f0f] text-neutral-text-dark'
                                }`}
                            >
                                {`${option * 100}%`}
                            </button>
                        )
                    })}
                </div>

                {/* Reduce Only & Order Type */}
                {marketType === 'Limit' && (
                    <div className="flex justify-end">
                        <select
                            value={limitType}
                            onChange={e => setLimitType(e.target.value as typeof limitType)}
                            className="bg-table-odd text-sm px-2 h-7 rounded-lg cursor-pointer focus:outline-none focus:bg-neutral-900 text-neutral-text hover:bg-neutral-900 apply-transition"
                        >
                            <option value="GTC" className="bg-neutral-900">
                                GTC
                            </option>
                            <option value="IOC" className="bg-neutral-900">
                                IOC
                            </option>
                            <option value="ALO" className="bg-neutral-900">
                                ALO
                            </option>
                        </select>
                    </div>
                )}

                {/* Add ChaseOrderTerminal with props */}

                {!isSpotToken && (
                    <ChaseOrderTerminal
                        tpslSettings={tpslSettings}
                        setTpslSettings={setTpslSettings}
                        reduceOnly={reduceOnly}
                        setReduceOnly={setReduceOnly}
                        currentPrice={Number(currentMarketPrice)}
                        isBuy={activeTab === 'buy'}
                        leverage={activeAssetData?.leverage.value ?? 10}
                        existingPosition={currentPosition}
                    />
                )}

                <button
                    id="perps-trade-button"
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || isContextProcessing || amountInput === 0 || (reduceOnly && !isReduceOnlyValid)}
                    className={`w-full flex items-center justify-center gap-2 px-3 h-12 rounded-lg font-semibold text-sm duration-200 transition-all ${
                        activeTab === 'buy'
                            ? 'text-positive bg-positive/20 hover:bg-positive/30'
                            : 'text-negative bg-negative/20 hover:bg-negative/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <div className="flex items-center justify-center w-full">
                        <span>{isSubmitting || isContextProcessing ? 'Placing Order...' : activeTab === 'buy' ? 'Buy' : 'Sell'}</span>
                    </div>
                </button>
                <div className="flex justify-between items-center w-full text-xs text-neutral-text-dark">
                    <div>Est receive</div>
                    <div className="flex flex-row items-center gap-1">
                        {estimateTokenReceived ? (
                            <>
                                <span className="leading-none">
                                    {`~${getReadableNumber(estimateTokenReceived.amount, countDecimalPlaces(estimateTokenReceived.amount ?? 0))} ${
                                        activeTab === 'buy'
                                            ? findCoinFromMarketDataByCoinId(marketData, isSpotToken ? spotTokenId?.toString() : assetId?.toString())
                                                  ?.base
                                            : activePrepAssetCtx?.coin
                                    }`}
                                </span>
                                <span className="leading-none">{`($${getReadableNumber(estimateTokenReceived.usd, 2)})`}</span>
                            </>
                        ) : (
                            '-'
                        )}
                    </div>
                </div>

                <div className="h-px bg-neutral-900" />

                {/* Trade Info */}
                <div className="flex flex-col gap-2 text-xs text-neutral-text-dark">
                    {!isSpotToken && (
                        <>
                            <div className="flex justify-between">
                                <span className="">Liquidation Price</span>
                                <span>{liquidationPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Order Value</span>
                                <span>{amountInput ? `$${formatCryptoPrice(estimateTokenReceived?.usd, 2, 2)}` : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Margin Required</span>
                                <span>
                                    {amountInput
                                        ? `$${formatCryptoPrice(Number(amountInput / (activeAssetData?.leverage.value ?? 10)), 2, 2)}`
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between ">
                                <div className="flex items-center gap-1">
                                    <span className="">Slippage</span>
                                    <Tooltip text="Average execution price compared to mid price based on current order book">
                                        <FaCircleInfo className="text-[9px] text-neutral-text-dark" />
                                    </Tooltip>
                                </div>
                                <span className="text-positive underline cursor-pointer" onClick={() => slippageModalRef.current?.toggleModal()}>
                                    {marketType === 'Market' ? <SlippageDisplay /> : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1">
                                    Fees{' '}
                                    <Tooltip
                                        text={`Takers orders pay a ${
                                            userFeesData?.feeSchedule.cross ? Number(userFeesData?.feeSchedule.cross) * 100 : '0.0450'
                                        }% fee. Maker orders pay a ${
                                            userFeesData?.feeSchedule.add ? Number(userFeesData?.feeSchedule.add) * 100 : '0.0150'
                                        }% fee`}
                                    >
                                        <FaCircleInfo className="text-[9px] text-neutral-text-dark" />
                                    </Tooltip>
                                </span>

                                <span className="text-white">
                                    {userFeesData
                                        ? `${Number(userFeesData.userCrossRate) * 100}% / ${Number(userFeesData.userAddRate) * 100}%`
                                        : '0.0450% / 0.0150%'}
                                </span>
                            </div>
                        </>
                    )}
                    {isSpotToken && (
                        <>
                            <div className="flex justify-between">
                                <span>Order Value</span>
                                <span>{estimateTokenReceived?.usd ? `$${formatCryptoPrice(estimateTokenReceived.usd, 2, 2)}` : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center gap-1">
                                    Fees{' '}
                                    <Tooltip
                                        text={`Takers orders pay a ${
                                            userFeesData?.feeSchedule.spotCross ? Number(userFeesData?.feeSchedule.spotCross) * 100 : '0.0700'
                                        }% fee.Maker orders pay a ${
                                            userFeesData?.feeSchedule.spotAdd ? Number(userFeesData?.feeSchedule.spotAdd) * 100 : '0.0400'
                                        }% fee`}
                                    >
                                        <FaCircleInfo className="text-[9px] text-neutral-text-dark" />
                                    </Tooltip>
                                </span>

                                <span className="text-white">
                                    {userFeesData
                                        ? `${Number(userFeesData.userSpotCrossRate) * 100}%/${Number(userFeesData.userSpotAddRate) * 100}%`
                                        : '0.0700% / 0.0400%'}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HyperLiquidTradeForm
