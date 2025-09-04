// import { getReadableNumber } from '@/utils/price';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FaCog } from 'react-icons/fa'
import { BsClockFill } from 'react-icons/bs'
import { FaGasPump, FaWallet } from 'react-icons/fa6'
import TradeSettingModal from '@/components/modal/TradeSettingModal'
import Spinner from '@/components/Spinner'
import useUserTokenBalanceData from '@/hooks/data/useUserTokenBalance'
import { useUser } from '@/context/UserContext'
import { useTradeSettingsData } from '@/hooks/data/useTradeSettingsData'
// import { useMutateExecuteTradeData } from '@/hooks/data/useExecuteTradeData';
import useTokenPriceData from '@/hooks/data/useTokenPriceData'
import { getReadableNumber } from '@/utils/price'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import { tradeSettings } from '@/data/default/tradeSettings'

import { useTrade } from '@/context/TradeContext'
import DecimalInput from '@/components/input/DecimalInput'

import LimitForm from './LimitForm'
import SelectAvailableBalanceCoin from '../SelectAvailableBalanceCoin'

import { useDebounceQuoteData } from '@/hooks/data/useDebounceQouteData'
import { RelayToken } from '@/types/bridge'
import { RelayChain } from '@/types/bridge'

import { RiLoaderLine } from 'react-icons/ri'
import useWalletBalances from '@/hooks/data/useWalletBalances'
import { usePendingTransactions } from '@/context/PendingTransactionsContext'

const TradeForm = ({
    tokenData,
    latestTokenPrice,
    initialActiveTab = 'buy',
}: {
    tokenData: Token | undefined
    latestTokenPrice?: number
    initialActiveTab?: 'buy' | 'sell'
}) => {
    const { authenticated, ready, user } = usePrivy()

    const { login: handleSignIn } = useLogin()
    const { addPendingTransaction } = usePendingTransactions()

    const { chain, userPublicWalletAddresses } = useUser()
    const { data: tradeSettingsData, isFetched: isTradeSettingsDataFetched } = useTradeSettingsData(chain.api)

    const { handleExecuteTrade, handleExecuteCrossChainTrade, isTradeProcessing } = useTrade()

    const { data: userTokenBalanceData, isLoading: isUserTokenBalanceLoading } = useUserTokenBalanceData(chain.api, tokenData?.address ?? '')
    const { data: userSolBalanceData, isLoading: isUserSolBalanceLoading } = useUserTokenBalanceData(chain.api, chain?.address ?? '')

    const { userBalances } = useWalletBalances(userPublicWalletAddresses)

    const [estimateTokenReceived, setEstimateTokenReceived] = useState<undefined | { amount: number; usd: number; impact?: number; fees?: number }>({
        amount: 0,
        usd: 0,
    })

    // const { data: targetTokenPrice, isLoading: targetTokenPriceIsLoading } =
    //   useTokenPriceData(chain.api, tokenData?.address ?? '');
    const { data: chainTokenPrice } = useTokenPriceData(chain.api, chain?.address ?? '')

    const presetOptions = [
        { buy: 0.01, sell: 0.25 },
        { buy: 0.1, sell: 0.5 },
        { buy: 0.5, sell: 0.75 },
        { buy: 1, sell: 1 },
    ]

    const tradeSettingModalRef = useRef<{ toggleModal: () => void }>(null)

    const formType: ('swap' | 'limit')[] = ['swap']
    const [activeType, setActiveType] = useState<'swap' | 'limit'>('swap')
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>(initialActiveTab)
    // const activeTabRef = useRef(activeTab);
    const [stringAmountInput, setStringAmountInput] = useState<undefined | string>(undefined)

    const [amountInput, setAmountInput] = useState<undefined | number>(undefined)

    useEffect(() => {
        if (stringAmountInput) setAmountInput(+stringAmountInput)
    }, [stringAmountInput])
    const [errorMessage, setErrorMessage] = useState('')

    const [selectedPreset, setSelectedPreset] = useState<undefined | TradePreset>(undefined)

    const [selectedBridgeChain, setSelectedBridgeChain] = useState<RelayChain | undefined>(undefined)

    const [selectedBridgeToken, setSelectedBridgeToken] = useState<RelayToken | undefined>(undefined)

    // Replace the direct API call with the hook
    const {
        quoteData,
        isLoading: isFetchingQoute,
        isError: isQuoteError,
    } = useDebounceQuoteData(amountInput, selectedBridgeToken, selectedBridgeChain, tokenData, activeTab)

    // Helper function to find token balance
    const tokenBalance = useMemo(() => {
        if (!selectedBridgeToken || !chain) return null

        const chainMapping: { [key: number]: string } = {
            792703809: 'solana',
            1: 'ethereum',
            8453: 'base',
        }

        const balance = userBalances.find(
            balance =>
                (balance.token.address.toLowerCase() === selectedBridgeToken.address.toLowerCase() ||
                    balance.token.symbol.toLowerCase() === selectedBridgeToken.symbol.toLowerCase()) &&
                balance.chain === chainMapping[selectedBridgeToken.chainId]
        )

        return balance?.balance ?? 0
    }, [selectedBridgeToken, chain, userBalances])

    const handleSetAll = () => {
        if (activeTab === 'buy' && tokenBalance) {
            setSelectedPreset(undefined)
            return setStringAmountInput(tokenBalance.toString())
        }

        if (activeTab === 'sell' && userTokenBalanceData) {
            return setStringAmountInput(userTokenBalanceData.toString())
        }
    }

    const handleChangeTab = (tab: 'buy' | 'sell') => {
        setActiveTab(tab)
        setErrorMessage('')
        setStringAmountInput('0')
    }

    const handleSelectPreset = (preset: TradePreset) => {
        setSelectedPreset(preset)

        if (activeTab === 'buy') {
            return setStringAmountInput(preset.buy.toString())
        }
        if (activeTab === 'sell' && userTokenBalanceData) {
            if (preset.sell === 1) {
                return setStringAmountInput(userTokenBalanceData.toString())
            }
            return setStringAmountInput((+userTokenBalanceData * preset.sell).toString())
        }
    }

    const handleOpenSettingModal = () => {
        if (ready && !authenticated) return handleSignIn()

        tradeSettingModalRef.current?.toggleModal()
    }

    const handleSubmitTradeForm = () => {
        setErrorMessage('')

        if (ready && !authenticated) return handleSignIn()
        if (!user) return setErrorMessage('No user found')
        if (!tokenData) return setErrorMessage('No token data found')
        if (amountInput === undefined) return setErrorMessage('Please input an amount')

        if (isUserTokenBalanceLoading || isUserSolBalanceLoading) {
            return setErrorMessage('Loading balance')
        }

        if (amountInput <= 0) return setErrorMessage('Amount must be greater than 0')

        const body = {
            chain: chain.api,
            chainAddress: chain.address,
            action: activeTab === 'buy' ? 'buy' : ('sell' as 'buy' | 'sell'),
            tokenAddress: tokenData.address,
            amount: amountInput,
            slippageLimit: tradeSettingsData?.slippage ?? tradeSettings[chain.id].defaultSlippage,
            priorityFee: tradeSettingsData?.priorityFee ?? tradeSettings[chain.api].defaultPriorityFee,
            symbol: tokenData.symbol,
            price: latestTokenPrice ?? tokenData?.market_data.current_price.usd,
        }

        if (activeTab === 'buy') {
            addPendingTransaction({
                token: {
                    address: tokenData.address,
                    symbol: tokenData.symbol,
                    logo: tokenData.image.icon,
                },
                chain: selectedBridgeChain?.name as ChainId,
                estimatedBalance: amountInput,
                estimatedValue: estimateTokenReceived?.usd ?? 0,
                estimatedProfitLoss: 0,
                estimatedProfitLossPercentage: 0,
                status: 'pending',
            })
        }

        handleExecuteTrade(body, user.id)
    }

    useEffect(() => {
        if (!amountInput || amountInput <= 0) {
            setEstimateTokenReceived(undefined)
            return
        }

        const targetTokenPrice = latestTokenPrice !== 0 ? latestTokenPrice : Number(tokenData?.market_data.current_price.usd)
        const notIsCrossChainTransaction =
            (tokenData?.chain_id === 'solana' && selectedBridgeToken?.symbol === 'SOL') ||
            (tokenData?.chain_id === 'ethereum' && selectedBridgeToken?.symbol === 'ETH') ||
            (tokenData?.chain_id === 'base' && selectedBridgeToken?.symbol === 'ETH')

        if (activeTab === 'buy') {
            if (!notIsCrossChainTransaction && selectedBridgeToken) {
                // Use the quote data from our debounced hook
                if (quoteData?.details) {
                    const { currencyOut } = quoteData.details
                    const usdValue = Number(currencyOut.amountUsd)

                    setEstimateTokenReceived({
                        amount: usdValue / (targetTokenPrice ?? 0),
                        usd: usdValue,
                    })
                }
            } else {
                // Same chain transaction logic...
                const usdValue = amountInput * (chainTokenPrice?.priceUSD ?? 0)
                const targetTokenAmount = usdValue / (targetTokenPrice ?? 0)
                setEstimateTokenReceived({
                    amount: targetTokenAmount,
                    usd: usdValue,
                })
            }
        } else {
            // Sell logic...
            const usdValue = amountInput * (targetTokenPrice ?? 0)
            const targetTokenAmount = usdValue / (chainTokenPrice?.priceUSD ?? 0)
            setEstimateTokenReceived({
                amount: targetTokenAmount,
                usd: usdValue,
            })
        }
    }, [amountInput, quoteData, activeTab, chainTokenPrice, latestTokenPrice, tokenData, selectedBridgeToken])

    // Modified handleTrade function
    const handleTrade = async () => {
        if (ready && !authenticated) return handleSignIn()
        if (!user) {
            console.log('no user')
            return
        }
        if (!tokenData) {
            console.log('no token data')
            return
        }

        if (amountInput === undefined) return setErrorMessage('Please input an amount')

        if (isUserTokenBalanceLoading || isUserSolBalanceLoading) {
            return setErrorMessage('Loading balance')
        }

        if (amountInput <= 0) return setErrorMessage('Amount must be greater than 0')

        if (!selectedBridgeToken && activeTab === 'buy') {
            console.log('no selected bridge token')
            return
        }

        // Check if bridging is needed
        const isSameToken =
            (tokenData.chain_id === 'solana' && selectedBridgeToken?.symbol === 'SOL') ||
            (tokenData.chain_id === 'ethereum' && selectedBridgeToken?.symbol === 'ETH') ||
            (tokenData.chain_id === 'base' && selectedBridgeToken?.symbol === 'ETH')

        if (isSameToken || activeTab === 'sell') {
            // If same token, directly execute trade
            return handleSubmitTradeForm()
        }

        if (isFetchingQoute) {
            return setErrorMessage('Fetching quote for this swap.')
        }

        if (isQuoteError) {
            return setErrorMessage('Unable to fetch quote for this swap')
        }

        setErrorMessage('')

        const smallestUnit = (Number(amountInput) * Math.pow(10, selectedBridgeToken?.decimals ?? 0)).toFixed(0)

        addPendingTransaction({
            token: {
                address: tokenData.address,
                symbol: tokenData.symbol,
                logo: tokenData.image.icon,
            },
            chain: tokenData?.chain_id as ChainId,
            estimatedBalance: estimateTokenReceived?.amount ?? 0,
            estimatedValue: quoteData?.details?.currencyOut.amountUsd ?? 0,
            estimatedProfitLoss: 0,
            estimatedProfitLossPercentage: 0,
            status: 'pending',
        })

        // Otherwise proceed with bridge logic
        await handleExecuteCrossChainTrade(
            {
                amount: smallestUnit,
                originCurrency: selectedBridgeToken?.address ?? '',
                originChainId: selectedBridgeChain?.name ?? '',
                destinationChainId: tokenData?.chain_id ?? '',
                destinationCurrency: tokenData?.address ?? '',
                destinationCurrencySymbol: tokenData?.symbol ?? '',
            },
            user.id
        )
    }

    return (
        <div className="flex flex-col  bg-black text-neutral-text w-full min-h-fit">
            <div className="flex items-center gap-3 px-3 text-sm font-semibold border-y border-border">
                {formType.map((type, index) => {
                    return (
                        <button
                            key={index}
                            className={` text-center  font-semibold h-full  py-3 rounded-lg cursor-pointer relative flex flex-col text-xs ${
                                activeType === type ? ' text-neutral-text' : 'text-neutral-text-dark'
                            }  apply-transition`}
                            type="button"
                            onClick={() => {
                                setActiveType(type)
                            }}
                        >
                            <span className="capitalize">{type}</span>
                            {activeType === type && <span className=" inset-0 border-b border-neutral-text absolute bottom-0"></span>}
                        </button>
                    )
                })}
            </div>

            {activeType === 'swap' ? (
                <div className="p-3 flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => handleChangeTab('buy')}
                            className={`w-1/2 flex items-center justify-center px-3 h-10 rounded-lg font-semibold text-xs  duration-200 transition-all ${
                                activeTab === 'buy'
                                    ? tokenData
                                        ? 'text-positive bg-positive/20'
                                        : 'bg-[#0f0f0f] text-neutral-text-dark'
                                    : 'bg-[#0f0f0f] text-neutral-text-dark hover:bg-positive/20 hover:text-positive/50'
                            }`}
                        >
                            Buy
                        </button>
                        <button
                            type="button"
                            onClick={() => handleChangeTab('sell')}
                            className={`w-1/2 flex items-center justify-center px-3 h-10 rounded-lg font-semibold text-xs  duration-200 transition-all ${
                                activeTab === 'sell'
                                    ? tokenData
                                        ? 'text-negative bg-negative/20'
                                        : 'bg-[#0f0f0f] text-neutral-text-dark'
                                    : 'bg-[#0f0f0f] text-neutral-text-dark hover:bg-negative/20 hover:text-negative/50'
                            }`}
                        >
                            Sell
                        </button>
                    </div>
                    <div className="flex w-full bg-neutral-900  rounded-lg">
                        <div className="p-3 px-4 text-neural-text font-semibold text-xs min-w-24">Amount</div>
                        <div className="relative overflow-hidden w-full h-10 flex items-center bg-[#0f0f0f] rounded-lg">
                            <DecimalInput
                                onChange={e => {
                                    setSelectedPreset(undefined)
                                    setStringAmountInput(e.target.value)
                                    // setAmountInput(+e.target.value);
                                }}
                                value={stringAmountInput}
                                className="w-full h-full text-right  bg-transparent font-semibold focus:outline-none  text-sm text-neutral-text px-3"
                                inputMode="text"
                            />
                            <div className=" text-neutral-text z-10  font-semibold pr-3 pointer-events-none ">
                                {activeTab === 'buy' ? selectedBridgeToken?.symbol : tokenData?.symbol ?? 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center justify-between text-xs text-neutral-text">
                        <span>Available</span>
                        {activeTab === 'buy' ? (
                            <SelectAvailableBalanceCoin
                                chain={selectedBridgeChain}
                                token={selectedBridgeToken}
                                setChain={setSelectedBridgeChain}
                                setToken={setSelectedBridgeToken}
                            />
                        ) : (
                            <button type="button" onClick={handleSetAll} className="flex gap-2 items-center ">
                                <FaWallet />
                                <div className="flex items-center gap-1">
                                    {isUserTokenBalanceLoading ? <Spinner className="" /> : <div>{getReadableNumber(userTokenBalanceData, 3)}</div>}{' '}
                                    {tokenData?.symbol || 'N/A'}
                                </div>
                            </button>
                        )}
                        {/* <div>{`${
            amountInput && amountInput > 0
              ? getReadableNumber(
                  amountInput * tokenData.market_data.current_price.usd,
                  '$',
                )
              : '-'
          }`}</div> */}
                    </div>
                    <div className={`grid ${activeTab === 'buy' ? 'grid-cols-5' : 'grid-cols-4'} gap-3`}>
                        {presetOptions.map((option, index) => {
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleSelectPreset(option)}
                                    type="button"
                                    className={`col-span-1 flex items-center justify-center px-3 h-9 rounded-lg font-semibold text-xs hover:bg-neutral-800 duration-200 transition-all ${
                                        selectedPreset && selectedPreset.buy === option.buy
                                            ? 'bg-neutral-900 text-neutral-text'
                                            : 'bg-[#0f0f0f] text-neutral-text-dark'
                                    }`}
                                >
                                    {`${activeTab === 'buy' ? `${option.buy}` : `${option.sell * 100}%`}`}
                                </button>
                            )
                        })}
                        {activeTab === 'buy' && (
                            <button
                                onClick={() => handleSetAll()}
                                type="button"
                                className={`col-span-1 flex items-center justify-center px-3 h-9 rounded-lg font-semibold text-xs hover:bg-neutral-800 duration-200 transition-all ${
                                    amountInput === tokenBalance ? 'bg-neutral-900 text-neutral-text' : 'bg-[#0f0f0f] text-neutral-text-dark'
                                }`}
                            >
                                Max
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex gap-3 justify-between  items-center">
                            {tokenData ? (
                                <button
                                    type="button"
                                    id="trade-button"
                                    disabled={isTradeProcessing}
                                    onClick={handleTrade}
                                    className={`flex items-center justify-center gap-2 px-3 h-12 rounded-lg font-semibold text-xs   duration-200 transition-all  flex-1 ${
                                        activeTab === 'buy'
                                            ? 'text-positive bg-positive/20 hover:bg-positive/30'
                                            : 'text-negative bg-negative/20 hover:bg-negative/30'
                                    }`}
                                >
                                    {activeTab === 'buy' ? (
                                        <div className="flex items-center justify-center w-full gap-2">
                                            <span>
                                                {isTradeProcessing
                                                    ? 'Processing...'
                                                    : `Buy ${tokenData?.symbol} for  ${amountInput ? getReadableNumber(amountInput, 3) : ''} ${
                                                          selectedBridgeToken?.symbol
                                                      }`}
                                            </span>
                                            {isTradeProcessing && <Spinner variant="positive" className="mb-[2px]" />}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center w-full gap-2">
                                            <span>
                                                {isTradeProcessing
                                                    ? 'Processing...'
                                                    : `Sell ${getReadableNumber(amountInput, 2)} ${tokenData?.symbol} for  ${chain.symbol}`}
                                            </span>
                                            {isTradeProcessing && <Spinner variant="negative" className="mb-[2px]" />}
                                        </div>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={`flex items-center justify-center gap-2 px-3 h-12 rounded-lg font-semibold text-xs   duration-200 transition-all  flex-1 bg-neutral-900`}
                                >
                                    {activeTab === 'buy' ? 'Buy' : 'Sell'}
                                </button>
                            )}
                        </div>

                        <div className="flex justify-between items-center w-full text-xs text-neutral-text-dark mt-1">
                            <div>Est receive</div>
                            <div className="flex flex-row items-center gap-1">
                                {estimateTokenReceived ? (
                                    <>
                                        <span className=" leading-none">
                                            {`~${getReadableNumber(estimateTokenReceived.amount, 2)} ${
                                                activeTab === 'buy' ? tokenData?.symbol : chain.symbol
                                            }`}
                                        </span>
                                        <span className=" leading-none">{`($${getReadableNumber(estimateTokenReceived.usd, 2)})`}</span>
                                    </>
                                ) : (
                                    '-'
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between items-center w-full text-xs text-neutral-text-dark mt-1">
                            <div>Est Arrival Time</div>
                            <div className="flex flex-row items-center gap-3">
                                {isFetchingQoute ? (
                                    <RiLoaderLine className="animate-spin" />
                                ) : quoteData?.details?.timeEstimate !== undefined ? (
                                    <>
                                        <span className="leading-none flex items-center gap-2">
                                            <BsClockFill
                                                className={Number(quoteData.details.timeEstimate) > 60 ? 'text-yellow-500' : 'text-positive'}
                                            />
                                            {`~${quoteData.details.timeEstimate}s`}
                                        </span>
                                        <span className="leading-none flex items-center gap-2">
                                            <FaGasPump />
                                            {`$${quoteData?.fees?.gas?.amountUsd}`}
                                        </span>
                                    </>
                                ) : (
                                    '-'
                                )}
                            </div>
                        </div>
                    </div>

                    {errorMessage && <div className="text-negative text-xs">{errorMessage}</div>}
                    {ready && authenticated && (
                        <div className="flex w-full border border-border rounded-lg py-2 px-2">
                            <div className="flex  justify-between items-center text-xs flex-wrap flex-1 ">
                                <div className="flex-1 flex flex-col justify-center gap-1 items-center whitespace-nowrap text-2xs">
                                    <span className=" leading-none text-neutral-text-dark">Slippage</span>
                                    {!isTradeSettingsDataFetched ? (
                                        <Spinner />
                                    ) : (
                                        <>
                                            {isTradeSettingsDataFetched &&
                                            tradeSettingsData &&
                                            tradeSettingsData.slippage !== undefined &&
                                            tradeSettingsData.slippage !== null ? (
                                                <span className=" text-neutral-text font-semibold leading-none text-xs">
                                                    {tradeSettingsData.slippage > 0 ? `${tradeSettingsData.slippage * 100}%` : 'Auto'}
                                                </span>
                                            ) : (
                                                <span className="text-neutral-text font-semibold leading-none text-xs">
                                                    {tradeSettings[chain.api].defaultSlippage > 0
                                                        ? `${tradeSettings[chain.api].defaultSlippage * 100}%`
                                                        : 'Auto'}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-center gap-1 items-center whitespace-nowrap text-2xs">
                                    <span className="leading-none text-neutral-text-dark">{chain.id === 'solana' ? 'Priority' : 'Gas'} Fee</span>
                                    {!isTradeSettingsDataFetched ? (
                                        <Spinner />
                                    ) : (
                                        <>
                                            {isTradeSettingsDataFetched &&
                                            tradeSettingsData &&
                                            tradeSettingsData.priorityFee !== undefined &&
                                            tradeSettingsData.priorityFee !== null ? (
                                                <span className="text-neutral-text font-semibold leading-none text-xs">
                                                    {tradeSettingsData.priorityFee > 0
                                                        ? `${tradeSettingsData.priorityFee} ${chain.priorityFeeUnit}`
                                                        : 'Auto'}
                                                </span>
                                            ) : (
                                                <span className="text-neutral-text font-semibold leading-none text-xs">
                                                    {tradeSettings[chain.api].defaultPriorityFee > 0
                                                        ? `${tradeSettings[chain.api].defaultPriorityFee} ${chain.priorityFeeUnit}`
                                                        : 'Auto'}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-center gap-1 items-center whitespace-nowrap text-2xs">
                                    <span className="leading-none text-neutral-text-dark">Anti MEV</span>
                                    {!isTradeSettingsDataFetched ? <Spinner /> : <span className="leading-none text-neutral-text text-xs">On</span>}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleOpenSettingModal}
                                className="min-w-6 min-h-6 rounded-lg bg-table-odd border-border border hover:bg-neutral-900   flex items-center justify-center text-neutral-text  apply-transition p-1"
                            >
                                <FaCog className="text-xs" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <LimitForm
                    chainTokenPrice={chainTokenPrice}
                    tokenData={tokenData}
                    latestTokenPrice={latestTokenPrice}
                    userTokenBalanceData={userTokenBalanceData}
                    userSolBalanceData={userSolBalanceData}
                    chain={chain}
                />
            )}
            <TradeSettingModal ref={tradeSettingModalRef} />
        </div>
    )
}

export default TradeForm
