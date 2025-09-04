import { useMutateUserTokenBalanceData } from '@/hooks/data/useUserTokenBalance'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FaChevronDown, FaCircleInfo } from 'react-icons/fa6'
import Spinner from '../Spinner'
import { getReadableNumber } from '@/utils/price'
import { useTrade } from '@/context/TradeContext'
import { usePrivy, User } from '@privy-io/react-auth'
import DecimalInput from '../input/DecimalInput'
import Image from 'next/image'
import { getChainImage } from '@/utils/image'
import {
    CRUSH_ETHEREUM_ADDRESS,
    CRUSH_SOLANA_ADDRESS,
    getChainAddress,
    WALLET_SOLANA_ADDRESS,
    mainCurrencyChainAddresses,
    USDC_ETHEREUM_ADDRESS,
    USDC_SOLANA_ADDRESS,
    ETH_NATIVE_ADDRESS,
} from '@/data/default/chains'
import { SOLANA_CONSTANTS } from '@/data/default/chainConstants'
import Input from '../Input'
import Button from '../ui/Button'
import ImageFallback from '../ImageFallback'
import { useWebDataContext } from '@/context/webDataContext'
import { GoArrowDown } from 'react-icons/go'
import { toast } from 'react-toastify'
import { validateCryptoAddress } from '@/utils/wallet'
import axios from 'axios'
import Tooltip from '../Tooltip'
import ConfirmationModal from '../modal/ConfirmationModal'
import { getCapitalizeFirstLetter } from '@/utils/crypto'
import useHaptic from '@/hooks/useHaptic'

type TargetToken = {
    token: {
        address: string
        symbol: string
        name: string
        logo: string
    }
    chain: ChainId
}

const WithdrawTokenForm = ({
    handleCancelWithdraw,
    userTokenHoldings,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toggleShowWithdrawForm,
    handleCloseModal,
}: {
    handleCancelWithdraw: () => void
    userTokenHoldings: UserTokenHoldings
    toggleShowWithdrawForm: () => void
    handleCloseModal: () => void
}) => {
    const { user } = usePrivy()
    const { webData2 } = useWebDataContext()
    const { triggerHaptic } = useHaptic()

    const confirmationModalRef = useRef<{ toggleModal: () => void }>(null)
    const [errorMessage, setErrorMessage] = useState('')
    const [isHyperliquid, setIsHyperliquid] = useState(false)
    const [hyperliquidUsdcBalance, setHyperliquidUsdcBalance] = useState('')
    const [targetToken, setTargetToken] = useState<TargetToken | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(false)

    const memoizedUserTokenHoldings = useMemo(() => {
        const filteredAddress = [
            CRUSH_SOLANA_ADDRESS,
            WALLET_SOLANA_ADDRESS,
            CRUSH_ETHEREUM_ADDRESS,
            USDC_ETHEREUM_ADDRESS,
            USDC_SOLANA_ADDRESS,
            ETH_NATIVE_ADDRESS,
            'usdc-perp', // hyperliquid usdc perps
            // CRUSH_BSC_ADDRESS,
            // CRUSH_BASE_ADDRESS,
            // USDC_ARBITRUM_ADDRESS,
        ]
        // return userTokenHoldings
        return userTokenHoldings.filter(tokenHolding => {
            return filteredAddress.includes(tokenHolding.token.address)
        })
    }, [userTokenHoldings])

    // const [successMessage, setSuccessMessage] = useState('');
    const [targetWalletAddress, setTargetWalletAddress] = useState('')
    const [amount, setAmount] = useState<string>('')
    const [receiveAmount, setReceiveAmount] = useState<string>('')
    const { handleExecuteWithdraw, isTradeProcessing } = useTrade()

    const {
        mutate: mutateUserTokenBalance,
        isPending: isUserTokenBalancePending,
        // isError: isUserTokenBalanceError,
        // isSuccess: isUserTokenBalanceSuccess,
        data: userTokenBalanceData,
    } = useMutateUserTokenBalanceData()

    const handleSubmitWithdrawForm = () => {
        setErrorMessage('')
        if (!user) return
        if (!selectedToken) return toast.error('Please select token')
        if (!targetWalletAddress) {
            return toast.error('Address cannot be empty')
        }

        const parsedAmount = parseFloat(amount)

        if (isHyperliquid) {
            // console.log({ isHyperliquid, selectedToken, parsedAmount, targetWalletAddress })

            if (!hyperliquidUsdcBalance) return toast.error('No USDC balance')
            const parsedBalance = Number(hyperliquidUsdcBalance)
            if (parsedAmount > parsedBalance) {
                return toast.error('Insufficient balance')
            }
            handleWithdrawHyperliquid(selectedToken, parsedAmount, targetWalletAddress)
        } else {
            // console.log({ isHyperliquid, selectedToken, parsedAmount, targetWalletAddress, user })
            if (isUserTokenBalancePending || !userTokenBalanceData) return
            if (parsedAmount > userTokenBalanceData) {
                return toast.error('Insufficient balance')
            }
            handleWithdrawNonHyperliquid(selectedToken, parsedAmount, targetWalletAddress, user)
        }
    }

    const handleWithdrawHyperliquid = async (selectedToken: UserTokenHolding, parsedAmount: number, targetWalletAddress: string) => {
        const HYPERLIQUID_WITHDRAW_CODE_VALUE = 'usdc'
        setIsLoading(true)
        try {
            const response = await axios.post('/api/hyperliquid/withdraw', {
                code: HYPERLIQUID_WITHDRAW_CODE_VALUE,
                amount: parsedAmount,
                address: targetWalletAddress,
                tag: null,
                vaultAddress: null,
            })

            if (response.data) {
                const successMsg = 'USDC withdrawal successful.'
                toast.success(successMsg)
                // Close modal after successful withdrawal
                setTimeout(() => {
                    handleCloseModal()
                }, 1000)
            }
        } catch (error: unknown) {
            // Extract the specific error message from the API response
            let errorMessage = 'Failed to withdraw USDC.'

            if (error && typeof error === 'object' && 'response' in error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const axiosError = error as any
                if (axiosError.response?.data?.error?.details) {
                    // Get the detailed error message
                    errorMessage = axiosError.response.data.error.details

                    // Extract the human-readable part if it's the ERC20 error
                    const match = errorMessage.match(/reason=\"([^\"]+)\"/)
                    if (match && match[1]) {
                        errorMessage = match[1]
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

            toast.error(errorMessage)
            console.log(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const handleWithdrawNonHyperliquid = async (selectedToken: UserTokenHolding, parsedAmount: number, targetWalletAddress: string, user: User) => {
        triggerHaptic(50)

        const chainAddress = getChainAddress(selectedToken.chain)
        if (!chainAddress) {
            return toast.error('Invalid chain')
        }

        let tokenAddress = selectedToken.token.address

        if (tokenAddress === WALLET_SOLANA_ADDRESS) {
            tokenAddress = CRUSH_SOLANA_ADDRESS
        }

        if (tokenAddress === '0x0000000000000000000000000000000000000000') {
            tokenAddress = CRUSH_ETHEREUM_ADDRESS
        }

        handleExecuteWithdraw(
            {
                chain: selectedToken.chain,
                chainAddress: chainAddress,
                fromAsset: tokenAddress,
                toWallet: targetWalletAddress,
                amount: parsedAmount,
                symbol: selectedToken.token.symbol,
                name: selectedToken.token.name,
            },
            user.id,
            () => {
                mutateUserTokenBalance({
                    chain: selectedToken.chain,
                    tokenAddress: tokenAddress,
                })
            },
            () => {
                handleCloseModal()
            }
        )
    }

    const [selectedToken, setSelectedToken] = useState<UserTokenHolding | undefined>(undefined)
    const [showTokenOption, setShowTokenOption] = useState(false)

    const handleSetSelectedToken = (selectedToken: UserTokenHolding) => {
        setSelectedToken(selectedToken)
        setShowTokenOption(!showTokenOption)
        setTargetWalletAddress('')
        setAmount('')
        setReceiveAmount('')
    }

    const handleResetForm = () => {
        setTargetWalletAddress('')
        setAmount('')
        setReceiveAmount('')
        setIsLoading(false)
        setIsHyperliquid(false)
        setSelectedToken(undefined)
    }

    useEffect(() => {
        if (selectedToken) {
            setIsHyperliquid(selectedToken.isHyperliquid ?? false)
            if (selectedToken.isHyperliquid) {
                setTargetToken({
                    token: {
                        address: 'usdc-perp',
                        symbol: 'USDC',
                        name: 'USDC (Perps)',
                        logo: '/images/brand/usdc.png',
                    },
                    chain: 'arbitrum',
                })
            } else {
                setTargetToken({
                    token: {
                        address: selectedToken.token.address,
                        symbol: selectedToken.token.symbol,
                        name: selectedToken.token.name,
                        logo: selectedToken.token.logo,
                    },
                    chain: selectedToken.chain,
                })
            }

            let tokenAddress = selectedToken.token.address
            if (tokenAddress === WALLET_SOLANA_ADDRESS) {
                tokenAddress = CRUSH_SOLANA_ADDRESS
            }

            if (tokenAddress === '0x0000000000000000000000000000000000000000') {
                tokenAddress = CRUSH_ETHEREUM_ADDRESS
            }

            if (!selectedToken.isHyperliquid) {
                //non hyperliquid token

                mutateUserTokenBalance({
                    chain: selectedToken.chain,
                    tokenAddress: tokenAddress,
                })
            }
        } else {
            setTargetToken(undefined)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedToken])

    useEffect(() => {
        setReceiveAmount(amount)
    }, [amount])

    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value)
        }
    }, [])

    useEffect(() => {
        if (webData2?.clearinghouseState?.withdrawable) {
            setHyperliquidUsdcBalance(webData2?.clearinghouseState?.withdrawable)
        }
    }, [webData2])

    return (
        <div className="flex flex-col gap-3">
            <div className="flex w-full gap-3">
                <div className=" flex flex-col gap-1 w-full">
                    {/* <div className="text-sm text-neutral-text ">Token</div> */}

                    <div className="relative">
                        <button
                            className={`relative overflow-hidden w-full h-10 flex items-center bg-table-odd hover:bg-neutral-900 border border-border rounded-lg px-2 ${
                                selectedToken ? '' : 'text-neutral-300'
                            }`}
                            onClick={() => {
                                setShowTokenOption(!showTokenOption)
                            }}
                        >
                            {selectedToken ? (
                                <div className="flex items-center gap-3 w-full">
                                    <div className=" min-w-6 min-h-6 max-w-6 max-h-6 rounded-full border border-border relative flex items-center justify-center ">
                                        <ImageFallback
                                            src={`${selectedToken.token.logo}`}
                                            alt={`${selectedToken.token.name} logo`}
                                            width={200}
                                            height={200}
                                            className=" w-full h-full object-cover object-center rounded-full overflow-hidden"
                                        />
                                        <div className="absolute w-[12px] h-[12px] min-w-[12px] min-h-[12px] flex items-center justify-center  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
                                            <Image
                                                src={getChainImage(selectedToken.chain)}
                                                alt={`${selectedToken.chain} logo`}
                                                width={200}
                                                height={200}
                                                className="rounded-full w-full h-full object-contain object-center"
                                            />
                                        </div>
                                    </div>
                                    <div>{selectedToken && <span className="">{selectedToken.token?.name}</span>}</div>

                                    <FaChevronDown className={`text-neutral-text text-2xs ml-auto ${showTokenOption ? 'rotate-180' : ''}`} />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 w-full">
                                    <div>Select Token</div>
                                    <FaChevronDown className={`text-neutral-text text-2xs ml-auto ${showTokenOption ? 'rotate-180' : ''}`} />
                                </div>
                            )}
                        </button>
                        {showTokenOption && (
                            <div className="flex flex-col absolute bg-neutral-900 w-full top-11 border border-border rounded-lg z-50 max-h-[20vh] overflow-y-auto">
                                {memoizedUserTokenHoldings.map((data, index) => {
                                    if (data.balance > 0) {
                                        return (
                                            <button
                                                key={`${data?.token?.address}-${index}`}
                                                onClick={() => {
                                                    handleSetSelectedToken(data)
                                                }}
                                                className="p-2 hover:bg-table-odd apply-transition"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-black min-w-6 min-h-6 max-w-6 max-h-6 rounded-full border border-border relative flex items-center justify-center ">
                                                        <ImageFallback
                                                            src={`${data.token.logo}`}
                                                            alt={`${data.token.name} logo`}
                                                            width={200}
                                                            height={200}
                                                            className=" w-full h-full object-cover object-center rounded-full overflow-hidden"
                                                        />

                                                        <div className="absolute w-[12px] h-[12px] min-w-[12px] min-h-[12px] flex items-center justify-center  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
                                                            <Image
                                                                src={getChainImage(data.chain)}
                                                                alt={`${data.chain} logo`}
                                                                width={20}
                                                                height={20}
                                                                className="rounded-full w-full h-full object-contain object-center"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="">{data.token?.name}</div>
                                                </div>
                                            </button>
                                        )
                                    }
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full p-2 bg-table-odd rounded-lg text-neutral-text overflow-hidden border border-border flex flex-col">
                <div className="flex items-center justify-between">
                    <div className="text-xs">Withdraw</div>
                    <div className=" text-xs flex items-center justify-end gap-1 max-h-6 min-h-6">
                        <div>Balance: </div>
                        {/* hyperliquidUsdcBalance */}
                        <button
                            type="button"
                            onClick={() => {
                                if (isHyperliquid) {
                                    setAmount(hyperliquidUsdcBalance.toString())
                                } else {
                                    if (userTokenBalanceData && selectedToken) {
                                        // For SOL, subtract reserve amount for transaction fees and rent
                                        const maxWithdrawable =
                                            selectedToken.token.address === WALLET_SOLANA_ADDRESS
                                                ? Math.max(0, userTokenBalanceData - SOLANA_CONSTANTS.RESERVE_SOL)
                                                : userTokenBalanceData
                                        setAmount(maxWithdrawable.toString())
                                    }
                                }
                            }}
                            className="flex items-center justify-end gap-1 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            {selectedToken && (
                                <>
                                    {!isHyperliquid && (
                                        <>
                                            {isUserTokenBalancePending ? (
                                                <Spinner className="" />
                                            ) : (
                                                <div>{getReadableNumber(userTokenBalanceData, 4)}</div>
                                            )}{' '}
                                        </>
                                    )}
                                    {isHyperliquid && <div>{getReadableNumber(Number(hyperliquidUsdcBalance), 4)}</div>}
                                    {selectedToken && (
                                        <>
                                            {mainCurrencyChainAddresses.includes(selectedToken.token.address)
                                                ? selectedToken.token.symbol?.toUpperCase()
                                                : selectedToken.token.symbol}
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                </div>
                <div className="w-full flex items-center justify-between">
                    <div className="text-sm break-all flex flex-col gap-2 flex-1">
                        <DecimalInput
                            inputMode="text"
                            placeholder="0.00"
                            value={amount}
                            maxDecimals={4}
                            onChange={handleAmountChange}
                            className="bg-transparent border-none w-full text-base font-semibold min-h-8 max-h-8"
                        />
                    </div>
                    <div className="text-sm break-all ml-2 flex flex-col gap-1">
                        {selectedToken && (
                            <div className="flex items-center gap-2 w-full">
                                <div className=" min-w-6 min-h-6 max-w-6 max-h-6 rounded-full border border-border relative flex items-center justify-center ">
                                    <ImageFallback
                                        src={`${selectedToken.token.logo}`}
                                        alt={`${selectedToken.token.name} logo`}
                                        width={200}
                                        height={200}
                                        className=" w-full h-full object-cover object-center rounded-full overflow-hidden"
                                    />

                                    <div className="absolute w-[12px] h-[12px] min-w-[12px] min-h-[12px] flex items-center justify-center  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
                                        <Image
                                            src={getChainImage(selectedToken.chain)}
                                            alt={`${selectedToken.chain} logo`}
                                            width={200}
                                            height={200}
                                            className="rounded-full w-full h-full object-contain object-center"
                                        />
                                    </div>
                                </div>
                                <div className="text-neutral-text text-base font-semibold">
                                    {selectedToken && (
                                        <>
                                            {mainCurrencyChainAddresses.includes(selectedToken.token.address)
                                                ? selectedToken.token.symbol?.toUpperCase()
                                                : selectedToken.token.symbol}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-center ">
                <div className="w-8 h-8 p-1 flex flex-row justify-center items-center bg-table-odd rounded-lg text-neutral-text border border-border ">
                    <GoArrowDown className="text-lg" />
                </div>
            </div>
            <div className=" flex flex-col gap-1">
                <div className="flex gap-1 items-center">
                    <div className="text-sm text-neutral-text ">To Address</div>
                    <Tooltip text="Please ensure that the destination address is valid and correct when withdrawing funds.">
                        <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                    </Tooltip>
                </div>
                <Input
                    placeholder="Address"
                    onChange={e => {
                        setTargetWalletAddress(e.target.value)
                    }}
                    value={targetWalletAddress}
                ></Input>
            </div>
            <div className="w-full p-2 bg-table-odd rounded-lg text-neutral-text overflow-hidden border border-border flex flex-col">
                <div className="flex items-center justify-between">
                    <div className="text-xs">Gaining</div>
                </div>
                <div className="w-full flex items-center justify-between">
                    <div className="text-sm break-all flex flex-col gap-2 flex-1">
                        <DecimalInput
                            inputMode="text"
                            placeholder="0.00"
                            value={receiveAmount}
                            maxDecimals={4}
                            readOnly
                            className="bg-transparent border-none w-full text-base font-semibold min-h-8 max-h-8 read-only:cursor-default"
                        />
                    </div>
                    <div className="text-sm break-all ml-2 flex flex-col gap-1">
                        {targetToken && (
                            <div className="flex items-center gap-2 w-full">
                                <div className=" min-w-6 min-h-6 max-w-6 max-h-6 rounded-full border border-border relative flex items-center justify-center ">
                                    <ImageFallback
                                        src={`${targetToken.token.logo}`}
                                        alt={`${targetToken.token.name} logo`}
                                        width={200}
                                        height={200}
                                        className=" w-full h-full object-cover object-center rounded-full overflow-hidden"
                                    />

                                    <div className="absolute w-[12px] h-[12px] min-w-[12px] min-h-[12px] flex items-center justify-center  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
                                        <Image
                                            src={getChainImage(targetToken.chain)}
                                            alt={`${targetToken.chain} logo`}
                                            width={200}
                                            height={200}
                                            className="rounded-full w-full h-full object-contain object-center"
                                        />
                                    </div>
                                </div>
                                <div className="text-neutral-text text-base font-semibold">
                                    {targetToken && (
                                        <>
                                            {mainCurrencyChainAddresses.includes(targetToken.token.address)
                                                ? targetToken.token.symbol?.toUpperCase()
                                                : targetToken.token.symbol}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isHyperliquid && (
                <div className="text-xs border-border border rounded-lg p-2 ">
                    USDC will be sent over the Arbitrum network to the provided address. A $1 fee will be deducted from the USDC withdrawn.
                    <strong>Withdrawals should arrive within 5 minutes.</strong> If you have USDC in your Spot Balances, transfer to Perps to make it
                    available to withdraw.
                </div>
            )}

            {errorMessage && <div className="text-negative text-xs mb-3">{errorMessage}</div>}

            <div className="flex flex-col w-full gap-3">
                <div className="flex items-center justify-end gap-2 text-xs">
                    <Button onClick={handleCancelWithdraw} variant="ghost">
                        Cancel
                    </Button>

                    <Button
                        onClick={() => {
                            if (!selectedToken || !targetToken) return
                            if (!validateCryptoAddress(targetWalletAddress, selectedToken.chain)) {
                                return toast.error('Invalid wallet address format')
                            }

                            confirmationModalRef.current?.toggleModal()
                        }}
                        variant="primary"
                        disabled={isTradeProcessing || !targetWalletAddress || !amount || isLoading}
                    >
                        <span>Withdraw</span>
                        {isTradeProcessing || (isLoading && <Spinner variant="primary" className="" />)}
                    </Button>
                </div>
            </div>

            <ConfirmationModal
                type="primary"
                ref={confirmationModalRef}
                action={() => {
                    handleSubmitWithdrawForm()
                }}
                content={`Are you sure you want to withdraw ${getReadableNumber(
                    Number(amount),
                    selectedToken?.token.symbol?.toUpperCase() === 'USDC' ? 2 : 4
                )} ${selectedToken?.token.symbol} to ${targetWalletAddress} on ${getCapitalizeFirstLetter(
                    targetToken?.chain ?? ''
                )}? Please note that this action is irreversible.`}
                submitText="Withdraw"
                header="Confirm Withdraw"
                onModalClose={() => {
                    handleResetForm()
                }}
            ></ConfirmationModal>
        </div>
    )
}

export default WithdrawTokenForm
