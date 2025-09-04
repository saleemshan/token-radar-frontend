import { useNewsTradingContext } from '@/context/NewsTradingContext'
import { useWebDataContext } from '@/context/webDataContext'
import { PairData } from '@/types/hyperliquid'
import { formatCryptoPrice, getMarketOrderPriceWithSlippage, getNumberWithCommas, parseHyperliquidSize } from '@/utils/price'
import React, { useEffect, useRef, useState } from 'react'
import ConfirmationModal from './modal/ConfirmationModal'
import { ModalMethods } from './modal/Modal'
import { useHyperLiquidContext } from '@/context/hyperLiquidContext'
import { usePairTokensContext } from '@/context/pairTokensContext'
import axios from 'axios'
import { HyperliquidOrdersParams, useTrade } from '@/context/TradeContext'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import Tooltip from './Tooltip'
import { useKeyboardShortcutContext } from '@/context/KeyboardShortcutContext'
import useHaptic from '@/hooks/useHaptic'

const PerpsOrderButton = ({
    token,
    newsId,
    showTicker = false,
    isFocused = false,
}: {
    token: PairData | undefined
    newsId: string
    showTicker?: boolean
    isFocused?: boolean
}) => {
    const { refs } = useKeyboardShortcutContext()
    const { leverage, newsTradingPreset } = useNewsTradingContext()
    const { loadingWebData2, webData2 } = useWebDataContext()
    const { isAccountFunded, marketOrderSlippage } = useHyperLiquidContext()
    const { tokenPairData } = usePairTokensContext()
    const { login: handleSignIn } = useLogin()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isTradeProcessing, handleExecuteHyperliquidTrade } = useTrade()
    const confirmationModalRef = useRef<ModalMethods>(null)
    const queryClient = useQueryClient()
    const { user, ready, authenticated } = usePrivy()
    const { triggerHaptic } = useHaptic()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedToken, setSelectedToken] = useState<undefined | PairData>(undefined)
    const [availableUSDC, setAvailableUSDC] = useState<number>(0)

    const [buttonId, setButtonId] = useState<string>()
    const [tradePreset, setTradePreset] = useState<number>()
    const [tradeAmount, setTradeAmount] = useState<number>()
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>()

    const getButtonColor = (key: string) => {
        switch (key) {
            case 'longBig':
            case 'longSmall':
                return 'text-positive bg-positive/20 hover:bg-positive/30'
            case 'shortBig':
            case 'shortSmall':
                return 'text-negative bg-negative/20 hover:bg-negative/30'
            default:
                return ''
        }
    }

    const getPairDataToken = (ticker: string) => {
        return tokenPairData.find(token => {
            let perpsTicker = ''

            if (token && token.pairs) {
                perpsTicker = token.pairs.split('-')[0]
            }

            return perpsTicker.toLowerCase() === ticker.toLowerCase()
        })
    }

    const handlePlaceOrder = async (type: 'buy' | 'sell', userPreset: number, buttonId?: string) => {
        if (!authenticated) return handleSignIn()
        setIsSubmitting(true)

        try {
            if (!isAccountFunded) {
                throw new Error('Deposit a minimum of $5 into Hyperliquid to use this feature.')
            }

            if (!selectedToken) {
                throw new Error('No selected token')
            }

            const userLeverage =
                String(leverage) === 'max'
                    ? selectedToken.universe.maxLeverage
                    : leverage > selectedToken.universe.maxLeverage
                    ? selectedToken.universe.maxLeverage
                    : leverage

            const token = getPairDataToken(selectedToken.pairs?.split('-')[0] ?? '')

            if (!token) {
                throw new Error('Token not found')
            }

            const currentMarketPrice = token?.assetCtx?.markPx

            const tokenAmount = (userPreset * userLeverage) / Number(currentMarketPrice)

            // console.log('Submitting leverage')

            //set leverage
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            await axios.post('/api/hyperliquid/update-leverage', {
                leverage: userLeverage,
                asset: selectedToken.assetId,
                marginMode: 'isolated', //isolated / cross
            })

            // console.log('Submitted leverage')

            //Create order
            const baseOrder: HyperliquidOrdersParams = {
                coin: selectedToken.assetId as number,
                type: 'market',
                side: type, //buy or sell
                amount: parseHyperliquidSize(tokenAmount, selectedToken.universe.szDecimals ?? 5),
                price: getMarketOrderPriceWithSlippage(selectedToken.assetCtx.markPx, type, marketOrderSlippage),
                params: {
                    reduceOnly: false,
                },
            }

            const orders: HyperliquidOrdersParams[] = []
            orders.push(baseOrder)

            // console.log('Submitting trade')

            await handleExecuteHyperliquidTrade(
                {
                    orders: orders,
                    params: {
                        grouping: 'na',
                    },
                },
                selectedToken?.universe?.name ?? '',
                type,
                undefined,
                buttonId
            )

            // console.log('Submitted trade')

            queryClient.refetchQueries({
                queryKey: ['userReferralLevel', user?.id],
            })

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            const errorMessage = error.message
            console.log(error)
            console.log(errorMessage)
            toast.error(errorMessage ?? 'Something went wrong, try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (token) {
            setSelectedToken(token)
        }
    }, [token])

    useEffect(() => {
        if (!loadingWebData2 && webData2) {
            setAvailableUSDC(
                Number(webData2?.clearinghouseState?.marginSummary?.accountValue ?? 0) -
                    Number(webData2?.clearinghouseState?.marginSummary?.totalMarginUsed ?? 0)
            )
        }
    }, [loadingWebData2, webData2])

    if (selectedToken)
        return (
            <div className="flex flex-col min-h-fit">
                {showTicker && (
                    <div className="flex  items-center  border-y border-border text-xs">
                        <div className="pl-2 pr-2 py-1 w-fit text-center text-2xs h-full flex flex-col items-center ">Tickers</div>
                        <div className="flex flex-wrap gap-2 pr-2 pl-2 py-1 w-full border-l border-border overflow-x-auto no-scrollbar">
                            <div
                                className={`apply-transition border rounded-full hover:bg-neutral-900 border-neutral-800 text-neutral-text bg-neutral-900`}
                            >
                                <div className="text-2xs leading-none  rounded-full  py-[3px] px-[6px] ">
                                    <div className="flex items-center  h-full divide-x divide-neutral-800">
                                        <span className="px-1">{`${selectedToken.universe.name}`}</span>
                                        <span className="px-1">${formatCryptoPrice(selectedToken?.assetCtx?.markPx)}</span>

                                        <Tooltip text={`Max leverage for ${selectedToken.universe.name} is ${selectedToken.universe.maxLeverage}X`}>
                                            <span className=" text-2xs leading-none text-inherit px-1">{`${selectedToken.universe.maxLeverage}X`}</span>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex gap-2 w-full p-2 overflow-x-auto no-scrollbar min-h-fit ">
                    {ready && (
                        <>
                            {!isSubmitting ? (
                                Object.keys(newsTradingPreset).map(key => {
                                    const id = `${key}-${selectedToken.universe.name}-${newsId}`

                                    const selectedLeverage =
                                        String(leverage) === 'max'
                                            ? selectedToken.universe.maxLeverage
                                            : leverage > selectedToken.universe.maxLeverage
                                            ? selectedToken.universe.maxLeverage
                                            : leverage

                                    const amount = selectedLeverage * newsTradingPreset[key as 'longBig' | 'longSmall' | 'shortBig' | 'shortSmall']
                                    if (amount > 0)
                                        return (
                                            <button
                                                id={id}
                                                ref={isFocused ? refs[key as 'longBig' | 'longSmall' | 'shortBig' | 'shortSmall'] : null}
                                                onClick={e => {
                                                    if (!authenticated) return handleSignIn()

                                                    triggerHaptic(50)

                                                    // return alert(`clicked ${selectedToken.universe.name} ${key} ${selectedToken.universe.name}`)
                                                    e.stopPropagation()
                                                    setButtonId(undefined)
                                                    setTradePreset(undefined)
                                                    setTradeType(undefined)
                                                    setTradeAmount(undefined)

                                                    if (
                                                        newsTradingPreset[key as 'longBig' | 'longSmall' | 'shortBig' | 'shortSmall'] > availableUSDC
                                                    ) {
                                                        setButtonId(id)
                                                        setTradePreset(newsTradingPreset[key as 'longBig' | 'longSmall' | 'shortBig' | 'shortSmall'])
                                                        setTradeAmount(amount)
                                                        setTradeType(key === 'longBig' || key === 'longSmall' ? 'buy' : 'sell')
                                                        confirmationModalRef.current?.toggleModal()
                                                        return
                                                    }

                                                    handlePlaceOrder(
                                                        key === 'longBig' || key === 'longSmall' ? 'buy' : 'sell',
                                                        newsTradingPreset[key as 'longBig' | 'longSmall' | 'shortBig' | 'shortSmall'],
                                                        `${id}`
                                                    )
                                                }}
                                                type="button"
                                                className={`p-2 w-full rounded-md text-xs relative focus:outline-none ${getButtonColor(key)}`}
                                                key={key}
                                            >
                                                {`$${getNumberWithCommas(amount)}`}
                                            </button>
                                        )
                                })
                            ) : (
                                <div className="col-span-4 apply-transition p-2 w-full rounded-md text-xs relative text-center overflow-hidden border border-border">
                                    Submitting Order
                                    <div className="absolute inset-0 z-0">
                                        <div className="absolute inset-0 translate-x-[-100%] animate-wave bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <ConfirmationModal
                        header={`Confirm Trade ${selectedToken?.universe.name}`}
                        content={`Your trade requires $${getNumberWithCommas(
                            tradePreset ?? ''
                        )}, which exceeds your current available USDC balance of $${getNumberWithCommas(
                            availableUSDC
                        )}. Are you sure you want to continue? Instead of the preset amount, the trade will proceed with your entire available USDC balance.`}
                        type="primary"
                        ref={confirmationModalRef}
                        action={() => {
                            if (tradeType && tradeAmount && buttonId) {
                                handlePlaceOrder(tradeType, tradeAmount, buttonId)
                                console.log(confirmationModalRef.current?.closeModal)
                            }
                            // confirmationModalRef.current?.closeModal()
                        }}
                        submitText="Confirm"
                    ></ConfirmationModal>
                </div>
            </div>
        )
}

export default PerpsOrderButton
