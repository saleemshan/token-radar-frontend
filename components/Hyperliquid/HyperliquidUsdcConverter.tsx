import React, { useState, useMemo, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { GoArrowDown } from 'react-icons/go'
import Button from '../ui/Button'
import { toast } from 'react-toastify'
import axios from 'axios'
import Spinner from '../Spinner'
import DecimalInput from '../input/DecimalInput'
import { useWebDataContext } from '@/context/webDataContext'
import { formatCryptoPrice } from '@/utils/price'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'

import { useUser } from '@/context/UserContext'
import { RelayToken } from '@/types/bridge'
import { getReadableNumber } from '@/utils/price'
import useArbitrumWalletHoldingsData from '@/hooks/data/useArbitrumWalletHoldingsData'
import { useRelayQuote } from '@/hooks/data/useRelayQuote'
import useDebounce from '@/hooks/useDebounce'
import useUserTokenBalanceData from '@/hooks/data/useUserTokenBalance'
import {
    CRUSH_ETHEREUM_ADDRESS,
    CRUSH_SOLANA_ADDRESS,
    USDC_ETHEREUM_ADDRESS,
    USDC_SOLANA_ADDRESS,
    USDC_ARBITRUM_ADDRESS,
    SOL_NATIVE_ADDRESS,
    // ETH_NATIVE_ADDRESS,
    CHAIN_ID_ETHEREUM,
    CHAIN_ID_ARBITRUM,
    CHAIN_ID_SOLANA,
} from '@/data/default/chains'
import { usePrivy } from '@privy-io/react-auth'
import { useQueryClient } from '@tanstack/react-query'
import useHaptic from '@/hooks/useHaptic'
interface HyperliquidUsdcConverterProps {
    onSuccess?: () => void
    onError?: (error: string) => void
    initialShowTopUpAddress?: boolean
}

// Minimum amount constants
const MINIMUM_SWAP_AMOUNT_USD = 6
const MINIMUM_USDC_TO_PERP_AMOUNT_USD = 5

// Simplified mock data to match just what we need
const mockTokens = [
    {
        groupID: 'SOL',
        chainId: CHAIN_ID_SOLANA,
        address: SOL_NATIVE_ADDRESS,
        symbol: 'SOL',
        name: 'SOL',
        decimals: 9,
        vmType: 'svm',
        metadata: {
            logoURI: '/images/brand/solana.png',
            verified: true,
            isNative: true,
        },
    },
    // {
    //     groupID: 'ETH',
    //     chainId: CHAIN_ID_ETHEREUM,
    //     address: ETH_NATIVE_ADDRESS,
    //     symbol: 'ETH',
    //     name: 'ETH',
    //     decimals: 18,
    //     vmType: 'evm',
    //     metadata: {
    //         logoURI: '/images/brand/ethereum.png',
    //         verified: true,
    //         isNative: true,
    //     },
    // },
    {
        groupID: 'ARB',
        chainId: CHAIN_ID_ARBITRUM,
        address: USDC_ARBITRUM_ADDRESS,
        symbol: 'USDC',
        name: 'USDC (ARB)',
        decimals: 6,
        vmType: 'evm',
        metadata: {
            logoURI: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694',
            verified: true,
            isNative: false,
        },
    },
    {
        groupID: 'SOL',
        chainId: CHAIN_ID_SOLANA,
        address: USDC_SOLANA_ADDRESS,
        symbol: 'USDC',
        name: 'USDC (SOL)',
        decimals: 6,
        vmType: 'svm',
        metadata: {
            logoURI: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694',
            verified: true,
            isNative: false,
        },
    },
    {
        groupID: 'ETH',
        chainId: CHAIN_ID_ETHEREUM,
        address: USDC_ETHEREUM_ADDRESS,
        symbol: 'USDC',
        name: 'USDC (ETH)',
        decimals: 6,
        vmType: 'evm',
        metadata: {
            logoURI: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png?1696506694',
            verified: true,
            isNative: false,
        },
    },
]

// After mockTokens and mockChains are defined, add this mapping

// Define the interface for selectedPair with all expected properties
interface TokenPair extends Partial<RelayToken> {
    fromImage?: string
    rate?: number
    id?: string
    isNative?: boolean
}

const HyperliquidUsdcConverter: React.FC<HyperliquidUsdcConverterProps> = ({ onError, onSuccess }) => {
    const { webData2 } = useWebDataContext()
    const { userPublicWalletAddresses } = useUser()
    const queryClient = useQueryClient()
    const { user } = usePrivy()
    const { triggerHaptic } = useHaptic()

    const { data: userSolBalanceData, isLoading: isLoadingSol, refetch: refetchSolBalance } = useUserTokenBalanceData('solana', CRUSH_SOLANA_ADDRESS)
    const {
        data: userEthBalanceData,
        isLoading: isLoadingEth,
        refetch: refetchEthBalance,
    } = useUserTokenBalanceData('ethereum', CRUSH_ETHEREUM_ADDRESS, 10000)

    const {
        data: userEthUsdcBalanceData,
        isLoading: isLoadingEthUsdc,
        refetch: refetchEthUsdcBalance,
    } = useUserTokenBalanceData('ethereum', USDC_ETHEREUM_ADDRESS, 10000)
    const {
        data: userSolUsdcBalanceData,
        isLoading: isLoadingSolUsdc,
        refetch: refetchSolUsdcBalance,
    } = useUserTokenBalanceData('solana', USDC_SOLANA_ADDRESS, 10000)

    const {
        data: walletHoldings,
        isLoading: isLoadingWalletHoldings,
        refetch: refetchArbitrumHoldings,
    } = useArbitrumWalletHoldingsData(userPublicWalletAddresses['ethereum'])

    const [selectedToken, setSelectedToken] = useState<TokenPair>(mockTokens[0])
    const [amount, setAmount] = useState<string>('')
    const [isPending, setIsPending] = useState<boolean>(false)
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)

    // Reset amount when token changes
    useEffect(() => {
        setAmount('')
    }, [selectedToken])

    // Use debounced amount for calculations and API calls
    const debouncedAmount = useDebounce(amount, 500)

    // Calculate amount in smallest unit for the selected token
    const amountInSmallestUnit = useMemo(() => {
        if (!debouncedAmount || isNaN(parseFloat(debouncedAmount))) return '0'
        return (parseFloat(debouncedAmount) * Math.pow(10, selectedToken?.decimals ?? 0)).toFixed(0)
    }, [debouncedAmount, selectedToken])

    // Only fetch quote for native tokens (SOL, ETH)
    const shouldFetchQuote =
        selectedToken.isNative || selectedToken.metadata?.isNative === true || selectedToken.symbol === 'SOL' || selectedToken.symbol === 'ETH'

    const {
        data: quoteData,
        isLoading: isFetchingQuote,
        error: quoteError,
    } = useRelayQuote(
        {
            amount: amountInSmallestUnit,
            originChainId: selectedToken.chainId ?? 0,
            destinationChainId: CHAIN_ID_ARBITRUM,
            originCurrency: selectedToken.address || '',
            destinationCurrency: USDC_ARBITRUM_ADDRESS,
            tradeType: 'EXACT_INPUT',
        },
        shouldFetchQuote && debouncedAmount !== '' && parseFloat(debouncedAmount) > 0
    )

    const usdcHolding = walletHoldings?.find(holding => holding.token.symbol === 'USDC')

    // Generate token pair dynamically
    const selectedPair = selectedToken

    const availableBalance = Number(webData2?.clearinghouseState?.marginSummary?.accountValue)

    // Check if current token balance is loading
    const isTokenBalanceLoading = useMemo(() => {
        if (selectedToken.symbol === 'USDC') {
            switch (selectedToken.chainId) {
                case CHAIN_ID_ARBITRUM:
                    return isLoadingWalletHoldings
                case CHAIN_ID_ETHEREUM:
                    return isLoadingEthUsdc
                case CHAIN_ID_SOLANA:
                    return isLoadingSolUsdc
                default:
                    return false
            }
        } else {
            switch (selectedToken.chainId) {
                case CHAIN_ID_SOLANA:
                    return isLoadingSol
                case CHAIN_ID_ETHEREUM:
                    return isLoadingEth
                default:
                    return false
            }
        }
    }, [selectedToken, isLoadingWalletHoldings, isLoadingEthUsdc, isLoadingSolUsdc, isLoadingSol, isLoadingEth])

    // Replace the tokenBalance logic with the same logic from HyperliquidUsdcDeposit
    const tokenBalance = React.useMemo(() => {
        const getChainBalance = () => {
            if (selectedToken.symbol === 'USDC') {
                switch (selectedToken.chainId) {
                    case CHAIN_ID_ARBITRUM: // ARB
                        return Number(usdcHolding?.balance ?? 0)
                    case CHAIN_ID_ETHEREUM: // ETH
                        return userEthUsdcBalanceData ?? 0
                    case CHAIN_ID_SOLANA: // SOL
                        return userSolUsdcBalanceData ?? 0
                    default:
                        return 0
                }
            } else {
                switch (selectedToken.chainId) {
                    case CHAIN_ID_SOLANA: // SOL
                        return userSolBalanceData ?? 0
                    case CHAIN_ID_ETHEREUM: // ETH
                        return userEthBalanceData ?? 0
                    default:
                        return 0
                }
            }
        }

        return getChainBalance()
    }, [selectedToken, usdcHolding, userSolBalanceData, userEthBalanceData, userEthUsdcBalanceData, userSolUsdcBalanceData])

    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value)
        }
    }, [])

    // Function to refresh relevant balances based on selected token
    const refreshBalances = React.useCallback(() => {
        // Always refresh Arbitrum USDC holdings since that's the destination
        refetchArbitrumHoldings()

        queryClient.refetchQueries({
            queryKey: ['userTokenHoldings', user?.id, 'solana'],
        })

        // Refresh source token balance
        if (selectedToken.symbol === 'USDC') {
            switch (selectedToken.chainId) {
                case CHAIN_ID_ETHEREUM:
                    refetchEthUsdcBalance()
                    break
                case CHAIN_ID_SOLANA:
                    refetchSolUsdcBalance()
                    break
            }
        } else {
            // For native tokens
            switch (selectedToken.chainId) {
                case CHAIN_ID_SOLANA:
                    refetchSolBalance()
                    break
                case CHAIN_ID_ETHEREUM:
                    refetchEthBalance()
                    break
            }
        }
    }, [
        refetchArbitrumHoldings,
        queryClient,
        user?.id,
        selectedToken.symbol,
        selectedToken.chainId,
        refetchEthUsdcBalance,
        refetchSolUsdcBalance,
        refetchSolBalance,
        refetchEthBalance,
    ])

    const handleConfirm = async () => {
        triggerHaptic(50)
        if (!amount || parseFloat(amount) <= 0) {
            const errorMsg = 'Please enter a valid amount.'
            toast.error(errorMsg)
            onError?.(errorMsg)
            return
        }

        const amountValue = parseFloat(amount)

        // Check for quote errors on native tokens
        if (shouldFetchQuote && !!quoteError) {
            const errorMsg = 'Failed to get price quote. Please try again.'
            toast.error(errorMsg)
            onError?.(errorMsg)
            return
        }

        // Check if quote is still loading for native tokens
        if (shouldFetchQuote && isFetchingQuote) {
            const errorMsg = 'Getting price quote, please wait...'
            toast.error(errorMsg)
            onError?.(errorMsg)
            return
        }

        setIsPending(true)
        try {
            // Handle direct deposit for ARB-USDC
            if (selectedPair.chainId === CHAIN_ID_ARBITRUM && selectedPair.symbol === 'USDC') {
                const response = await axios.post('/api/hyperliquid/deposit_usdc', {
                    amount: amountValue,
                })

                if (response.data) {
                    const successMsg = 'USDC deposit successful.'
                    toast.success(successMsg)

                    // Refresh balances after successful deposit
                    setTimeout(() => {
                        refreshBalances()
                    }, 3000)

                    onSuccess?.()
                }
            }
            // Handle cross-chain deposit for native tokens (SOL, ETH)
            else if (selectedPair.metadata?.isNative || selectedPair.symbol === 'SOL' || selectedPair.symbol === 'ETH') {
                // Ensure we have a valid quote
                // if (!quoteData && shouldFetchQuote) {
                //     const errorMsg = 'Failed to get price quote. Please try again.'
                //     toast.error(errorMsg)
                //     onError?.(errorMsg)
                //     return
                // }

                const response = await axios.post('/api/hyperliquid/cross-chain-deposit', {
                    amount: amountInSmallestUnit,
                    originChainId: selectedToken.chainId,
                    originCurrency: selectedToken.address || '',
                    quoteId: quoteData?.details?.operation,
                })

                if (response.data) {
                    const successMsg = `${selectedToken.symbol} to USDC deposit successful.`
                    toast.success(successMsg)

                    // Refresh balances after successful deposit
                    setTimeout(() => {
                        refreshBalances()
                    }, 3000) // Small delay to allow backend to process

                    onSuccess?.()
                }
            }
            // Handle cross-chain deposit for other tokens (fallback to previous implementation)
            else {
                const amountInSmallestUnit = (Number(amount) * Math.pow(10, selectedToken?.decimals || 18)).toFixed(0)

                const response = await axios.post('/api/hyperliquid/cross-chain-deposit', {
                    amount: amountInSmallestUnit,
                    originChainId: selectedToken.chainId,
                    originCurrency: selectedToken.address || '',
                })

                if (response.data) {
                    const successMsg = `USDC deposit successful.`
                    toast.success(successMsg)

                    // Refresh balances after successful deposit
                    setTimeout(() => {
                        refreshBalances()
                    }, 3000) // Small delay to allow backend to process

                    onSuccess?.()
                }
            }
        } catch (error: unknown) {
            // Extract the specific error message from the API response
            let errorMessage = 'Transaction failed'

            if (error && typeof error === 'object' && 'response' in error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const axiosError = error as any
                if (axiosError.response?.data?.error?.details) {
                    // Get the detailed error message
                    errorMessage = axiosError.response.data.error.details

                    // First try to extract the revert error message
                    const revertMatch = errorMessage?.match(/revert=\{[^}]*"args":\s*\[\s*"([^"]+)"\s*\]/)
                    if (revertMatch && revertMatch[1]) {
                        errorMessage = revertMatch[1]
                    } else {
                        // If no revert error, try the reason field
                        const reasonMatch = errorMessage.match(/reason=\"([^\"]+)\"/)
                        if (reasonMatch && reasonMatch[1]) {
                            errorMessage = reasonMatch[1]
                        }
                    }
                } else if (axiosError.response?.data?.error?.error) {
                    errorMessage = axiosError.response.data.error.error
                } else if (axiosError.response?.data?.error) {
                    errorMessage =
                        typeof axiosError.response.data.error === 'string'
                            ? axiosError.response.data.error
                            : JSON.stringify(axiosError.response.data.error)
                }
            }

            refreshBalances()

            toast.error(errorMessage)
            onError?.(errorMessage)
        } finally {
            setIsPending(false)
        }
    }

    // Calculate the amount to receive based on the selected pair rate or quote data
    const calculateReceiveAmount = useMemo((): string => {
        if (!debouncedAmount || isNaN(parseFloat(debouncedAmount))) return '0.00'

        // Use quote data if available for native tokens (SOL, ETH)
        if (quoteData && shouldFetchQuote) {
            // Extract destination currency amount from quote data
            try {
                const destDecimals = 6 // USDC has 6 decimals
                const destAmount = quoteData.details?.currencyOut?.amount

                if (destAmount) {
                    const receivedAmount = Number(destAmount) / Math.pow(10, destDecimals)
                    return receivedAmount.toFixed(2)
                }
            } catch (error) {
                console.error('Error parsing quote data:', error)
            }
        }

        // Fallback to static rate for USDC transfers
        const receivedAmount = parseFloat(debouncedAmount) * (selectedPair.rate || 1)
        return receivedAmount.toFixed(2)
    }, [debouncedAmount, quoteData, shouldFetchQuote, selectedPair.rate])

    return (
        <div className="flex w-full flex-col gap-3">
            <div className="flex items-center gap-3  relative">
                <div
                    className="w-full flex flex-row justify-between gap-2 p-2 bg-table-odd hover:bg-neutral-900 rounded-lg text-neutral-text overflow-hidden border border-border cursor-pointer"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    <div className="flex items-center gap-2">
                        <Image src={(selectedPair.fromImage || selectedPair.metadata?.logoURI || '') as string} alt="" width={20} height={20} />
                        <p>{selectedPair.name}</p>
                    </div>
                    <div className="flex items-center">
                        <MdOutlineKeyboardArrowDown className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>

                {dropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-table-odd border border-border rounded-lg shadow-lg z-10">
                        {mockTokens.map(token => {
                            return (
                                <button
                                    key={token.address}
                                    onClick={() => {
                                        setSelectedToken(token)
                                        setDropdownOpen(false)
                                    }}
                                    className={`w-full px-3 py-2 text-left hover:bg-neutral-800 text-neutral-text flex items-center gap-2 ${
                                        selectedToken?.address === token.address ? 'bg-neutral-900' : ''
                                    }`}
                                >
                                    <Image src={token.metadata?.logoURI || ''} alt="" width={20} height={20} />
                                    {token.name}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="text-xs text-neutral-text-dark ">
                Convert any token in your wallet to USDC through Hyperliquid to unlock real-time news trading.
                {selectedPair.chainId === CHAIN_ID_ARBITRUM && selectedPair.symbol === 'USDC'
                    ? `A minimum deposit of ${MINIMUM_USDC_TO_PERP_AMOUNT_USD} USDC is required.`
                    : `A minimum deposit of ${MINIMUM_SWAP_AMOUNT_USD} USD is required.`}
            </div>

            <div className="w-full p-2 bg-table-odd rounded-lg text-neutral-text overflow-hidden border border-border flex flex-col">
                <div className="flex items-center justify-between">
                    <div className="text-xs">Converting</div>
                    <div className="flex items-center justify-end  min-h-6 max-h-6">
                        <div
                            className="flex items-center justify-end gap-1 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                                setAmount(tokenBalance.toString())
                            }}
                        >
                            <div>Balance:</div>
                            <div className="text-neutral-text">
                                {isTokenBalanceLoading ? <Spinner size={10} /> : getReadableNumber(tokenBalance, 3)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex items-center justify-between">
                    <div className="text-sm break-all flex flex-col justify-between gap-2 flex-1 ">
                        <DecimalInput
                            inputMode="text"
                            placeholder="0.00"
                            maxDecimals={4}
                            value={amount}
                            onChange={handleAmountChange}
                            className="bg-transparent border-none w-full text-base font-semibold min-h-8 max-h-8"
                        />
                    </div>
                    <div className="text-sm break-all ml-2 flex flex-col gap-1 ">
                        <div className="flex items-center justify-end gap-1 ">
                            <Image src={selectedToken.metadata?.logoURI || ''} alt="" width={20} height={20} />
                            <span className="text-neutral-text text-base font-semibold">{selectedToken.symbol}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center ">
                <div className="w-8 h-8 p-1 flex flex-row justify-center items-center bg-table-odd rounded-lg text-neutral-text border border-border ">
                    <GoArrowDown className="text-lg" />
                </div>
            </div>
            <div className="w-full p-2 bg-table-odd rounded-lg text-neutral-text overflow-hidden border border-border flex flex-col">
                <div className="flex items-center justify-between">
                    <div className="text-xs">Gaining</div>
                    <div className=" text-xs flex items-center justify-end gap-1">
                        <div>Balance: </div>
                        <span className="text-neutral-text">{formatCryptoPrice(availableBalance, 2)}</span>
                    </div>
                </div>
                <div className="w-full flex items-center justify-between">
                    <div className="text-sm break-all flex flex-col gap-2 flex-1">
                        <DecimalInput
                            inputMode="text"
                            placeholder="0.00"
                            value={calculateReceiveAmount}
                            maxDecimals={2}
                            readOnly
                            className="bg-transparent border-none w-full text-base font-semibold min-h-8 max-h-8 read-only:cursor-default"
                        />
                    </div>
                    <div className="text-sm break-all ml-2 flex flex-col gap-1">
                        <div className="flex items-center justify-end gap-1">
                            <Image src={'/images/brand/usdc-perps.svg'} alt="" width={24} height={24} className="" />
                            <span className="text-neutral-text text-base font-semibold">USDC (Perps)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className="flex items-center justify-between min-h-6 max-h-6">
                <div>
                    {shouldFetchQuote && isFetchingQuote && (
                        <div className="flex items-center gap-1 text-xs text-neutral-text-dark">
                            <div className="pt-[3px]">Getting best price...</div>
                        </div>
                    )}
                    {shouldFetchQuote && !!quoteError && (
                        <span className="text-xs text-negative opacity-90">Failed to get quote. Please try again.</span>
                    )}
                </div>
            </div> */}

            <Button
                onClick={handleConfirm}
                variant="primary"
                className="text-sm"
                height="min-h-10 max-h-10"
                disabled={
                    isPending ||
                    (shouldFetchQuote && (isFetchingQuote || !!quoteError)) ||
                    parseFloat(calculateReceiveAmount) <
                        (selectedPair.chainId === CHAIN_ID_ARBITRUM && selectedPair.symbol === 'USDC'
                            ? MINIMUM_USDC_TO_PERP_AMOUNT_USD
                            : MINIMUM_SWAP_AMOUNT_USD)
                }
            >
                <span>
                    {isPending
                        ? 'Processing'
                        : shouldFetchQuote && isFetchingQuote
                        ? 'Getting Quote'
                        : shouldFetchQuote && !!quoteError
                        ? 'Quote Failed, Try Again'
                        : parseFloat(calculateReceiveAmount) <
                          (selectedPair.chainId === CHAIN_ID_ARBITRUM && selectedPair.symbol === 'USDC'
                              ? MINIMUM_USDC_TO_PERP_AMOUNT_USD
                              : MINIMUM_SWAP_AMOUNT_USD)
                        ? `Min ${
                              selectedPair.chainId === CHAIN_ID_ARBITRUM && selectedPair.symbol === 'USDC'
                                  ? `$${MINIMUM_USDC_TO_PERP_AMOUNT_USD}`
                                  : `$${MINIMUM_SWAP_AMOUNT_USD}`
                          }`
                        : 'Confirm'}
                </span>
                {(isPending || isFetchingQuote) && <Spinner variant="primary" className="" />}
            </Button>
        </div>
    )
}

export default HyperliquidUsdcConverter
