/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Link from 'next/link'
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { useUser } from './UserContext'
import { Id, toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'
import { chains } from '@/data/default/chains'
import { sendGAEvent } from '@next/third-parties/google'
import { CRUSH_SOLANA_ADDRESS, relayExplorerUrl } from '@/data/default/chains'
import { NativeTokenAddress } from '@/data/default/chainConstants'
import TradeBubbleAnimation from '@/components/global/TradeBubbleAnimation'
import { usePendingTransactions } from './PendingTransactionsContext'
import axiosLib from '@/lib/axios'
import { useSettingsContext } from './SettingsContext'

interface TradeContextProps {
    handleExecuteTrade: (body: ExecuteTrade, userId: string) => void
    handleExecuteWithdraw: (body: UserWithdraw, userId: string, mutateTokenBalance?: () => void, onSuccess?: () => void) => void
    handleExecuteCrossChainTrade: (body: CrossChainTradeParams, userId: string) => Promise<any>
    handleExecuteHyperliquidTrade: (
        orders: HyperliquidPlaceOrdersParams,
        symbol: string,
        orderType: 'buy' | 'sell',
        resetForm?: () => void,
        bubbleOriginId?: string | undefined,
        toastMessage?: string
    ) => Promise<any>
    isTradeProcessing: boolean
}

export interface HyperliquidOrdersParams {
    coin: number
    type: 'limit' | 'trigger' | 'market'
    side: 'buy' | 'sell'
    amount: string
    price: string
    params?: {
        reduceOnly?: boolean
        timeInForce?: 'Alo' | 'Ioc' | 'Gtc'
        clientOrderId?: string
        isMarket?: boolean
        triggerPrice?: string
        tpsl?: 'tp' | 'sl'
        vaultAddress?: string
    }
}

// Add hyperliquid order interface
export interface HyperliquidPlaceOrdersParams {
    orders: HyperliquidOrdersParams[]
    params?: {
        grouping?: 'na' | 'normalTpsl' | 'positionTpsl'
        vaultAddress?: string
        builder?: {
            address: string
            fee: number
        }
    }
}

const TradeContext = createContext<TradeContextProps | undefined>(undefined)

interface CrossChainTradeParams {
    amount: string
    originCurrency: string
    originChainId: string
    destinationChainId: string
    destinationCurrency: string
    destinationCurrencySymbol: string
}

export const TradeProvider = ({ children }: { children: ReactNode }) => {
    const { chain } = useUser()
    const queryClient = useQueryClient()
    const { clearPendingTransactions } = usePendingTransactions()
    const { enableBubbleAnimation } = useSettingsContext()

    const [toastId, setToastId] = useState<Id | null>(null)
    const [isTradeProcessing, setIsTradeProcessing] = useState(false)
    const [isTradeSuccess, setIsTradeSuccess] = useState(false)
    const [showBubbleAnimation, setShowBubbleAnimation] = useState(false)

    const [bubbleOriginId, setBubbleOriginId] = useState<string | undefined>(undefined)
    const [tradeParams, setTradeParams] = useState<ExecuteTrade | undefined>(undefined)

    const [transactionType, setTransactionType] = useState<'trade' | 'withdraw' | undefined>('trade')
    const isTradeProcessingRef = useRef(isTradeProcessing)
    const tradeParamsRef = useRef(tradeParams)

    const toastIdRef = useRef(toastId)
    const transactionTypeRef = useRef(transactionType)

    const handleExecuteTrade = async (body: ExecuteTrade, userId: string) => {
        if (body.amount <= 0) {
            toast.error(`Amount cannot be zero.`)
            return
        }

        if (isTradeProcessingRef.current) {
            handleDisplayWarningMessage()
            return
        }

        setBubbleOriginId('trade-button')
        setShowBubbleAnimation(false)
        setIsTradeSuccess(false)
        setIsTradeProcessing(true)

        const id = toast.info(`Processing your ${body.action} ${body.symbol} transaction.`, { autoClose: false, onClose: () => setToastId(null) })
        setToastId(id)

        setTradeParams(body)
        const startTime = Date.now()
        try {
            setTransactionType('trade')

            const res = await axiosLib.post(`/api/${chain.api}/trade`, body, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            toast.success(
                () => {
                    return (
                        <Link
                            href={`${chain.explorer.tx}/${res.data?.txid ?? res.data?.transactionId}`}
                            target="_blank"
                            className="flex items-center gap-1  text-positive"
                        >
                            <span>
                                {`Your ${tradeParamsRef.current?.action} ${tradeParamsRef.current?.symbol} order has
                    been successfully submitted. `}
                                <span className="underline">[View Transaction]</span>
                            </span>
                        </Link>
                    )
                },
                { autoClose: 10000 }
            )

            setTransactionType(undefined)
            setIsTradeProcessing(false)
            setIsTradeSuccess(true)
            setShowBubbleAnimation(true)

            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current)
                setToastId(null)
            }

            setTimeout(() => {
                console.log('Refetching user data')
                queryClient.refetchQueries({
                    queryKey: ['tokenMyPositionsData', body.tokenAddress, userId],
                })

                queryClient.refetchQueries({
                    queryKey: ['userWalletBalances', userId, body.chain],
                })

                queryClient
                    .refetchQueries({
                        queryKey: ['userTokenHoldings', userId, body.chain],
                    })
                    .finally(() => {
                        clearPendingTransactions()
                    })
                // queryClient.refetchQueries({
                //   queryKey: ['userTokenHoldings', userId, body.chain],
                // });
                queryClient.refetchQueries({
                    queryKey: ['userWalletActivities', userId, body.chain],
                })
                queryClient.refetchQueries({
                    queryKey: ['userReferralLevel', userId],
                })

                // Add refetch for userTokenHolding and only clear pending transactions after it's done
                queryClient
                    .refetchQueries({
                        queryKey: ['userTokenHolding', userId, body.chain],
                    })
                    .finally(() => {
                        clearPendingTransactions()
                    })

                queryClient.refetchQueries({
                    queryKey: ['userTokenBalance', body.tokenAddress, userId],
                })

                queryClient.refetchQueries({
                    queryKey: ['userTokenBalance', body.chainAddress, userId],
                })
            }, 10000) //wait 10 secs before refetch

            const endTime = Date.now()
            const executionTimeInSeconds = (endTime - startTime) / 1000

            sendGAEvent('event', 'trade_success', {
                data: { ...body },
                executiont_time: executionTimeInSeconds,
                executed_at: new Date(endTime).toISOString(),
            })
        } catch (error: any) {
            toast.error(error.response?.data?.error?.error ?? 'Something went wrong, try again.')
            clearPendingTransactions()
            setTransactionType(undefined)
            setIsTradeProcessing(false)
            setIsTradeSuccess(false)
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current)
                setToastId(null)
            }

            setBubbleOriginId(undefined)

            const endTime = Date.now()
            const executionTimeInSeconds = (endTime - startTime) / 1000

            sendGAEvent('event', error.response.data.googleEvent ?? 'trade_error_s_unknown', {
                data: error?.response?.data,
                execution_time: executionTimeInSeconds,
                executed_at: new Date(endTime).toISOString(),
            })
        }
    }

    const handleExecuteWithdraw = async (params: UserWithdraw, userId: string, mutateTokenBalance?: () => void, onSuccess?: () => void) => {
        if (isTradeProcessingRef.current) {
            handleDisplayWarningMessage()
            return
        }

        const id = toast.info(`Processing your withdrawal.`, {
            autoClose: false,
            onClose: () => setToastId(null),
        })
        setToastId(id)

        setIsTradeProcessing(true)
        setIsTradeSuccess(false)

        const startTime = Date.now()
        try {
            setTransactionType('withdraw')

            const res = await axiosLib.post(`/api/${params.chain}/user/balances/withdraw`, params, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const targetChain = chains.find(chain => chain.id === params.chain)
            toast.success(
                () => {
                    return (
                        <Link
                            href={`${targetChain?.explorer?.tx}/${res.data?.txid ?? res.data?.transactionId}`}
                            target="_blank"
                            className="flex items-center gap-1  text-positive"
                        >
                            <span>
                                {`Your withdrawal has been successfully submitted.`}
                                <span className="underline">[View Transaction]</span>
                            </span>
                        </Link>
                    )
                },
                { autoClose: 10000 }
            )
            onSuccess?.()

            setTransactionType(undefined)
            setIsTradeProcessing(false)
            setIsTradeSuccess(true)

            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current)
                setToastId(null)
            }
            setTimeout(() => {
                if (mutateTokenBalance) mutateTokenBalance()

                queryClient.refetchQueries({
                    queryKey: ['userTokenBalance', params.fromAsset, userId],
                })
                queryClient.refetchQueries({
                    queryKey: ['userWalletBalances', userId, params.chain],
                })
                queryClient.refetchQueries({
                    queryKey: ['userTokenHoldings', userId, params.chain],
                })

                // queryClient.refetchQueries({
                //   queryKey: ['userTokenHoldings', userId, params.chain, 'false'],
                // });
                queryClient.refetchQueries({
                    queryKey: ['userWalletActivities', userId, params.chain],
                })
                clearPendingTransactions()
            }, 6000)

            const endTime = Date.now()
            const executionTimeInSeconds = (endTime - startTime) / 1000

            sendGAEvent('event', 'withdraw_success', {
                data: { ...params },
                execution_time: executionTimeInSeconds,
                executed_at: new Date(endTime).toISOString(),
            })
        } catch (error: any) {
            toast.error(error.response?.data?.error?.error ?? 'Something went wrong, try again.')

            setTransactionType(undefined)
            setIsTradeProcessing(false)
            setIsTradeSuccess(false)

            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current)
                setToastId(null)
            }

            const endTime = Date.now()
            const executionTimeInSeconds = (endTime - startTime) / 1000

            sendGAEvent('event', 'withdraw_error', {
                response_data: error?.response?.data,
                execution_time: executionTimeInSeconds,
                executed_at: new Date(endTime).toISOString(),
            })
        }
    }

    const handleExecuteCrossChainTrade = async (body: CrossChainTradeParams, userId: string) => {
        const { amount, originCurrency, originChainId, destinationChainId, destinationCurrency, destinationCurrencySymbol } = body

        if (!originCurrency) {
            toast.error('Token not found.')
            return
        }

        if (Number(amount) <= 0) {
            toast.error('Amount cannot be zero.')
            return
        }

        if (isTradeProcessingRef.current) {
            handleDisplayWarningMessage()
            return
        }

        setIsTradeProcessing(true)
        setIsTradeSuccess(false)

        const id = toast.info(`Processing your buy ${destinationCurrencySymbol} transaction.`, {
            autoClose: false,
            onClose: () => setToastId(null),
        })
        setToastId(id)
        setTradeParams({
            action: 'buy',
            symbol: destinationCurrencySymbol,
            tokenAddress: destinationCurrency,
            chainAddress: originChainId,
            chain: originChainId,
            amount: Number(amount),
            slippageLimit: 0.01,
            priorityFee: 0.001,
            price: 0,
        })

        const startTime = Date.now()
        try {
            const res = await axiosLib.post('/api/relay/execute', {
                originChainId,
                destinationChainId,
                originCurrency: originCurrency === NativeTokenAddress.SOLANA ? CRUSH_SOLANA_ADDRESS : originCurrency,
                destinationCurrency,
                amount: amount,
                tradeType: 'EXACT_INPUT',
            })

            if (res?.data?.success) {
                // const originChain = chains.find((chain) => chain.id === originChainId);
                const txHash = res?.data?.txHash ?? res?.data?.txid
                toast.success(
                    () => {
                        return (
                            <Link href={`${relayExplorerUrl}/${txHash}`} target="_blank" className="flex items-center gap-1 text-positive">
                                <span>
                                    {`Your buy ${destinationCurrencySymbol} order has
                      been successfully submitted.`}
                                    <span className="underline">[View Transaction]</span>
                                </span>
                            </Link>
                        )
                    },
                    { autoClose: 10000 }
                )
            }

            setIsTradeProcessing(false)
            setIsTradeSuccess(true)

            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current)
                setToastId(null)
            }

            setTimeout(() => {
                // Refetch for origin chain
                queryClient.refetchQueries({
                    queryKey: ['userTokenBalance', originCurrency, userId],
                })
                queryClient.refetchQueries({
                    queryKey: ['userWalletBalances', userId, originChainId],
                })
                queryClient.refetchQueries({
                    queryKey: ['userTokenHoldings', userId, originChainId],
                })
                // queryClient.refetchQueries({
                //   queryKey: ['userTokenHoldings', userId, originChainId, 'false'],
                // });
                queryClient.refetchQueries({
                    queryKey: ['userWalletActivities', userId, originChainId],
                })

                // Refetch for destination chain
                queryClient.refetchQueries({
                    queryKey: ['userTokenBalance', destinationCurrency, userId],
                })
                queryClient.refetchQueries({
                    queryKey: ['userWalletBalances', userId, destinationChainId],
                })
                queryClient
                    .refetchQueries({
                        queryKey: ['userTokenHoldings', userId, destinationChainId],
                    })
                    .finally(() => {
                        clearPendingTransactions()
                    })
                // queryClient.refetchQueries({
                //   queryKey: ['userTokenHoldings', userId, destinationChainId, 'false'],
                // });
                queryClient.refetchQueries({
                    queryKey: ['userWalletActivities', userId, destinationChainId],
                })
                queryClient.refetchQueries({
                    queryKey: ['tokenMyPositionsData', destinationCurrency, userId],
                })

                // Add refetch for userTokenHolding and only clear pending transactions after it's done
                queryClient
                    .refetchQueries({
                        queryKey: ['userTokenHolding', userId, destinationChainId],
                    })
                    .then(() => {
                        clearPendingTransactions()
                    })
            }, 6000)

            const endTime = Date.now()
            const executionTimeInSeconds = (endTime - startTime) / 1000

            sendGAEvent('event', 'cross_chain_trade_success', {
                amount,
                symbol: destinationCurrencySymbol,
                originChainId,
                destinationChainId,
                execution_time: executionTimeInSeconds,
                executed_at: new Date(endTime).toISOString(),
            })

            return res
        } catch (error: any) {
            clearPendingTransactions()
            let errorMessage = 'Something went wrong, try again.'

            // Check for missing revert data error
            if (error?.response?.data?.error?.includes('missing revert data')) {
                errorMessage = 'Insufficient wallet balance.'
            } else if (error?.response?.status === 500) {
                // Handle 500 server errors
                errorMessage = 'Server error occurred. Please try again later or contact support if the issue persists.'
            } else {
                // Keep existing error message handling
                errorMessage = error?.response?.data?.error?.message ?? error?.response?.data?.error ?? errorMessage
            }

            toast.error(errorMessage)

            setIsTradeProcessing(false)
            setIsTradeSuccess(false)

            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current)
                setToastId(null)
            }

            const endTime = Date.now()
            const executionTimeInSeconds = (endTime - startTime) / 1000

            sendGAEvent('event', 'cross_chain_trade_error', {
                response_data: error?.response?.data,
                execution_time: executionTimeInSeconds,
                executed_at: new Date(endTime).toISOString(),
            })

            return null
        }
    }

    const handleExecuteHyperliquidTrade = async (
        order: HyperliquidPlaceOrdersParams,
        symbol: string,
        orderType: 'buy' | 'sell',
        resetForm?: () => void,
        bubbleOriginId: string | undefined = undefined,
        toastMessage: string = 'Order placed successfully.'
    ) => {
        if (order.orders.length === 0) {
            toast.error('No orders to execute.')
            return null
        }

        if (isTradeProcessingRef.current) {
            handleDisplayWarningMessage()
            return null
        }

        if (bubbleOriginId) {
            setBubbleOriginId(bubbleOriginId)
        } else {
            setBubbleOriginId(undefined)
        }

        setShowBubbleAnimation(false)
        setIsTradeProcessing(true)
        setIsTradeSuccess(false)

        // Create info toast
        const toastId = toast.info(`Processing your ${orderType} ${symbol} order...`, { autoClose: false, onClose: () => setToastId(null) })
        setToastId(toastId)

        const startTime = Date.now()
        try {
            const res = await axiosLib.post('/api/hyperliquid/place-orders', {
                orders: order.orders,
                params: order.params ?? {},
            })

            if (res?.data?.success) {
                toast.dismiss(toastId)
                toast.success(toastMessage)

                // Reset form if provided
                if (resetForm) {
                    resetForm()
                }

                const endTime = Date.now()
                const executionTimeInSeconds = (endTime - startTime) / 1000

                setIsTradeProcessing(false)
                setIsTradeSuccess(true)

                setTimeout(() => {
                    if (bubbleOriginId) setShowBubbleAnimation(true)
                }, 10)

                sendGAEvent('event', 'hyperliquid_trade_success', {
                    symbol,
                    orderType,
                    orderCount: order.orders.length,
                    execution_time: executionTimeInSeconds,
                    executed_at: new Date(endTime).toISOString(),
                })

                return res
            } else {
                toast.dismiss(toastId)
                let errorMessage = 'Failed to place orders'

                try {
                    // Check for errors array in response
                    if (res?.data?.errors && Array.isArray(res.data.errors) && res.data.errors.length > 0) {
                        // Extract the first error message and clean it up
                        const firstError = res.data.errors[0]
                        // Remove "Order X: " prefix and " asset=X" suffix if present
                        errorMessage = firstError.replace(/^Order \d+:\s*/, '').replace(/\s+asset=\d+$/, '')
                    }
                    // Fallback to result.response.data.statuses if errors array not available
                    else if (res?.data?.result?.response?.data?.statuses?.[0]?.error) {
                        const statusError = res.data.result.response.data.statuses[0].error
                        // Clean the error message from statuses as well
                        errorMessage = statusError.replace(/\s+asset=\d+$/, '')
                    }
                    // Legacy error message parsing (keep for backward compatibility)
                    else if (res.data.message) {
                        const messageStr = res.data.message.split('hyperliquid ')[1]
                        const jsonStr = messageStr.split(' [trace-id]')[0]
                        const parsedError = JSON.parse(jsonStr)
                        const legacyError = parsedError.response.data.statuses[0].error
                        errorMessage = legacyError.replace(/\s+asset=\d+$/, '')
                    }
                } catch (e) {
                    // If parsing fails, use the default error message
                    console.warn('Failed to parse error message:', e)
                }

                toast.error(errorMessage)

                setIsTradeProcessing(false)
                setIsTradeSuccess(false)

                const endTime = Date.now()
                const executionTimeInSeconds = (endTime - startTime) / 1000

                sendGAEvent('event', 'hyperliquid_trade_error', {
                    symbol,
                    orderType,
                    error: errorMessage,
                    execution_time: executionTimeInSeconds,
                    executed_at: new Date(endTime).toISOString(),
                })

                return null
            }
        } catch (error: any) {
            toast.dismiss(toastId)
            let errorMessage = 'Failed to place orders'

            // Extract the detailed error message from the response
            try {
                // Check for errors array in error response
                if (error.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
                    // Extract the first error message and clean it up
                    const firstError = error.response.data.errors[0]
                    // Remove "Order X: " prefix and " asset=X" suffix if present
                    errorMessage = firstError.replace(/^Order \d+:\s*/, '').replace(/\s+asset=\d+$/, '')
                }
                // Check for result.response.data.statuses format
                else if (error.response?.data?.result?.response?.data?.statuses?.[0]?.error) {
                    const statusError = error.response.data.result.response.data.statuses[0].error
                    // Clean the error message from statuses as well
                    errorMessage = statusError.replace(/\s+asset=\d+$/, '')
                }
                // Legacy error handling - hyperliquid error details
                else if (error.response?.data?.error?.details) {
                    // Parse the hyperliquid error details
                    const hlError = error.response.data.error.details
                    const match = hlError.match(/\{.*\}/) // Extract JSON string
                    if (match) {
                        const parsedError = JSON.parse(match[0])
                        const legacyError = parsedError.response.data.statuses[0].error
                        errorMessage = legacyError.replace(/\s+asset=\d+$/, '')
                    }
                }
                // Fallback to basic error message
                else if (error.response?.data?.error?.error) {
                    errorMessage = error.response.data.error.error
                }
            } catch (e) {
                // Fallback to the error message from response if parsing fails
                console.warn('Failed to parse error message:', e)
                if (error.response?.data?.error?.error) {
                    errorMessage = error.response.data.error.error
                }
            }

            toast.error(errorMessage)
            setIsTradeProcessing(false)
            setIsTradeSuccess(false)

            const endTime = Date.now()
            const executionTimeInSeconds = (endTime - startTime) / 1000

            sendGAEvent('event', 'hyperliquid_trade_error', {
                symbol,
                orderType,
                error: errorMessage,
                execution_time: executionTimeInSeconds,
                executed_at: new Date(endTime).toISOString(),
            })

            return null
        }
    }

    const handleDisplayWarningMessage = () => {
        if (transactionTypeRef.current === 'trade') {
            toast.error(
                `You have an ongoing ${tradeParamsRef.current?.action} ${tradeParamsRef.current?.symbol} order, wait until it finishes before submitting again.`
            )
        }

        if (transactionTypeRef.current === 'withdraw') {
            toast.error(`You have an ongoing withdrawal order, wait until it finishes before submitting again.`)
        }

        if (!toastIdRef.current) {
            let message = ''

            if (transactionTypeRef.current === 'withdraw') {
                message = `Processing your withdraw transaction.`
            } else if (transactionTypeRef.current === 'trade') {
                message = `Processing your ${tradeParamsRef.current?.action} ${tradeParamsRef.current?.symbol} transaction.`
            }
            const id = toast.info(message, {
                autoClose: false,
            })
            setToastId(id)
        }
    }

    useEffect(() => {
        toastIdRef.current = toastId
    }, [toastId])
    useEffect(() => {
        isTradeProcessingRef.current = isTradeProcessing
    }, [isTradeProcessing])
    useEffect(() => {
        tradeParamsRef.current = tradeParams
    }, [tradeParams])
    useEffect(() => {
        transactionTypeRef.current = transactionType
    }, [transactionType])

    return (
        <TradeContext.Provider
            value={{
                handleExecuteTrade,
                handleExecuteWithdraw,
                handleExecuteCrossChainTrade,
                handleExecuteHyperliquidTrade,
                isTradeProcessing,
            }}
        >
            {children}

            {enableBubbleAnimation && bubbleOriginId && showBubbleAnimation && isTradeSuccess && (
                <TradeBubbleAnimation
                    targetId={'wallet-button'}
                    originId={bubbleOriginId}
                    handleCloseBubbleAnimation={() => {
                        setShowBubbleAnimation(false)
                    }}
                />
            )}
        </TradeContext.Provider>
    )
}

export const useTrade = () => {
    const context = useContext(TradeContext)
    if (!context) {
        throw new Error('useTrade must be used within a TradeProvider')
    }
    return context
}
