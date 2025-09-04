'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { useMutateCreateATS, useMutateUpdateATS } from '@/hooks/data/useAtsData'
import { usePairTokensContext } from '@/context/pairTokensContext'
import Input from '../Input'
import { MultiSelectOption } from '@/types/newstrading'
import { customTheme } from '@/data/default/theme'
import {
    TRADE_TYPE,
    TRIGGER_EXCHANGE_LISTING,
    FILTER_SENTIMENT_DIRECTIONS,
    FILTER_SENTIMENT_MOMENTUMS,
    FILTER_OPERATOR,
    TARGET_CUSTOM_TOKEN_CHAINS,
    SPOT_TARGET_DEFAULT_TOKEN_OPTIONS,
    PERPS_TARGET_DEFAULT_TOKEN_OPTIONS,
} from '@/data/default/ats'
import DecimalInput from '../input/DecimalInput'
import Button from '../ui/Button'
import Spinner from '../Spinner'
import { FaCircleInfo, FaWallet, FaXmark } from 'react-icons/fa6'
import { FaChevronDown } from 'react-icons/fa'
import Tooltip from '../Tooltip'
import ToggleButton from '../ToggleButton'
import ConfirmationModal from '../modal/ConfirmationModal'
import { SPOT_TOKENS } from '@/data/default/atsSpotTokens'
import { getExchaneListingLabel } from '@/utils/string'
import useHaptic from '@/hooks/useHaptic'
import { useWallet } from '@/context/WalletContext'

const StrategyForm = ({
    isPerps = false,
    isEdit = false,
    strategy,
    handleCloseModal,
}: {
    isPerps?: boolean
    isEdit?: boolean
    strategy?: Strategy
    handleCloseModal?: () => void
}) => {
    const { tokenPairData } = usePairTokensContext()
    const { triggerHaptic } = useHaptic()
    const { solBalance, hyperliquidPerpsUSDCBalance, mainnetEthBalance, baseEthBalance, hyperliquidSpotUSDCBalance } = useWallet()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mutate: createAts, data: createAtsData, isSuccess: createAtsIsSuccess, isError: createAtsIsError } = useMutateCreateATS()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mutate: updateAts, data: updateAtsData, isSuccess: updateAtsIsSuccess, isError: updateAtsIsError } = useMutateUpdateATS()
    const confirmationModalRef = useRef<{ toggleModal: () => void; show: boolean }>(null)

    const defaultOptions = useMemo(() => {
        if (isPerps) {
            return PERPS_TARGET_DEFAULT_TOKEN_OPTIONS
        } else {
            return SPOT_TARGET_DEFAULT_TOKEN_OPTIONS
        }
    }, [isPerps])

    const [tokensSet, setTokensSet] = useState(false)
    const [availableTokens, setAvailableTokens] = useState<MultiSelectOption[]>(defaultOptions)
    const [userTokenBalance, setUserTokenBalance] = useState<string>('-')

    useEffect(() => {
        if (!tokensSet && isPerps && tokenPairData?.length > 0) {
            const tokens = tokenPairData.map(data => ({
                label: data.universe.name,
                value: data.universe.name,
            })) as MultiSelectOption[]

            setAvailableTokens(prev => [...prev, ...tokens])
            setTokensSet(true)
        }
    }, [tokenPairData, isPerps, tokensSet])

    const [showAccordion, setShowAccordion] = useState({
        target: false,
        triggers: false,
        filters: false,
        action: false,
    })

    const [strategyName, setStrategyName] = useState('')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [errorMessages, setErrorMessages] = useState<string[]>([])

    const [targetToken, setTargetToken] = useState('')
    const [targetCustomAddress, setTargetCustomAddress] = useState('')
    const [targetChain, setTargetChain] = useState(TARGET_CUSTOM_TOKEN_CHAINS[0])

    const [isCustomToken, setIsCustomToken] = useState(false)
    const [isAnyToken, setIsAnyToken] = useState(false)
    const [isRunning, setIsRunning] = useState(true)
    const [isProcessing, setIsProcessing] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isFormValid, setIsFormValid] = useState(false)

    const [isTriggerExchangeListingEnable, setIsTriggerExchangeListingEnable] = useState(false)
    const [isTriggerKOLMentionsEnable, setIsTriggerKOLMentionsEnable] = useState(false)
    const [isTriggerKeywordsEnable, setIsTriggerKeywordsEnable] = useState(false)

    const [newKeyword, setNewKeyword] = useState('')
    const [triggerKeywords, setTriggerKeywords] = useState<string[]>([])
    const [triggerExchangeListing, setTriggerExchangeListing] = useState<string>('')
    const [triggerKOLMentions, setTriggerKOLMentions] = useState<string>('')

    const [filterSentimentDirection, setFilterSentimentDirection] = useState('any')
    const [filterSentimentMomentum, setFilterSentimentMomentum] = useState('any')
    const [filterMarketCap, setFilterMarketCap] = useState('')
    const [filterMarketCapOperator, setFilterMarketCapOperator] = useState(FILTER_OPERATOR[0])

    const [tradeType, setTradeType] = useState('')
    const [tradeAmount, setTradeAmount] = useState('')
    const [tradeLeverage, setTradeLeverage] = useState<number>(1)

    const handleLeverageSliderChange = (newValue: number) => {
        if (newValue >= 0) {
            setTradeLeverage(newValue)
        }
    }
    const handleLeverageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value.replace('x', '')) || 0
        if (value >= 0) {
            setTradeLeverage(value)
        }
    }

    const addKeyword = () => {
        const trimmedKeyword = newKeyword.trim()
        if (trimmedKeyword && trimmedKeyword.length > 0) {
            setTriggerKeywords(prev => [...prev, trimmedKeyword])
            setNewKeyword('')
        }
    }

    const removeKeyword = (keyword: string) => {
        setTriggerKeywords(prev => prev.filter(k => k !== keyword))
    }

    const handleSubmitForm = async () => {
        if (!handleValidateForm()) return
        if (isProcessing) return

        let strategyObj = {}

        if (isEdit) {
            strategyObj = { ...strategy }
        }

        strategyObj = {
            ...strategyObj,
            strategyName: strategyName,
            isPublic: false,
            isRunning: isRunning,
            description: '',
            statements: [getIfStatement(), ...getAndStatements()],
        }

        setIsProcessing(true)

        if (isEdit) {
            updateAts({
                strategy: {
                    ...strategyObj,
                } as Strategy,
                isPerps: isPerps,
            })
        } else {
            createAts({
                strategy: {
                    ...strategyObj,
                } as Strategy,
                isPerps: isPerps,
            })
        }
    }

    const getIfStatement = () => {
        let ifType = 'token'

        if (targetToken.toLowerCase() === 'any token') {
            ifType = 'anyToken'
        }
        if (targetToken.toLowerCase() === 'custom token') {
            ifType = 'customToken'
        }

        return {
            condition: 'if',
            type: ifType,
            group: 'token',
            value: ifType === 'customToken' ? targetCustomAddress : targetToken,
            operator: '=',
            chain: ifType === 'customToken' ? targetChain : undefined,
        }
    }

    const getAndStatements = () => {
        const andStatements = []

        if (isTriggerExchangeListingEnable) {
            andStatements.push({
                condition: 'and',
                type: 'exchangeListing',
                group: 'trigger',
                value: triggerExchangeListing,
                operator: '=',
            })
        }

        if (isTriggerKOLMentionsEnable) {
            andStatements.push({
                condition: 'and',
                type: 'kolMentions',
                group: 'trigger',
                value: triggerKOLMentions,
                operator: '=',
            })
        }

        if (isTriggerKeywordsEnable) {
            andStatements.push({
                condition: 'and',
                type: 'keywords',
                group: 'trigger',
                value: triggerKeywords,
                operator: '=',
            })
        }

        if (filterSentimentDirection) {
            andStatements.push({
                condition: 'and',
                type: 'sentimentDirection',
                group: 'filter',
                value: filterSentimentDirection,
                operator: '=',
            })
        }

        if (filterSentimentMomentum) {
            andStatements.push({
                condition: 'and',
                type: 'sentimentMomentum',
                group: 'filter',
                value: filterSentimentMomentum,
                operator: '=',
            })
        }

        if (filterMarketCap && filterMarketCapOperator) {
            andStatements.push({
                condition: 'and',
                type: 'marketCap',
                group: 'filter',
                value: filterMarketCap,
                operator: filterMarketCapOperator,
            })
        }

        if (tradeLeverage) {
            andStatements.push({
                condition: 'and',
                type: 'leverage',
                group: 'action',
                value: tradeLeverage.toString(),
                operator: '=',
            })
        }

        if (tradeType) {
            andStatements.push({
                condition: 'and',
                type: 'trade',
                group: 'action',
                value: tradeType,
                amount: tradeAmount,
                operator: '=',
            })
        }

        return andStatements
    }

    const handleValidateForm = () => {
        const errorMessages: string[] = []

        if (isPerps) {
            if (!hyperliquidPerpsUSDCBalance) {
                errorMessages.push('Fail to fetch balance')
            }
        } else {
            if (!solBalance) {
                errorMessages.push('Fail to fetch balance')
            }
        }

        if (!strategyName) {
            errorMessages.push('Strategy name is required')
        }

        if (!targetToken) {
            errorMessages.push('Token is required')
        }

        if (targetToken.toLowerCase() === 'custom token' && !targetCustomAddress) {
            errorMessages.push('Token address is required')
        }

        if (targetToken.toLowerCase() === 'custom token' && !targetChain) {
            errorMessages.push('Target chain is required')
        }

        if (isTriggerExchangeListingEnable && !triggerExchangeListing) {
            errorMessages.push('[Trigger] Exchange listing is required')
        }

        if (isTriggerKOLMentionsEnable && !triggerKOLMentions) {
            errorMessages.push('[Trigger] KOL mentions is required')
        }

        // if (isTriggerKeywordsEnable && !triggerKeywords.length) {
        //     errorMessages.push('[Trigger] Keywords are required')
        // }

        if (!filterSentimentMomentum) {
            errorMessages.push('[Filter] Impact is required')
        }

        if (!filterSentimentDirection) {
            errorMessages.push('[Filter] Sentiment is required')
        }

        // if (!filterMarketCap) {
        //     errorMessages.push('[Filter] Market cap is required')
        // }

        // if (targetToken.toLowerCase() === 'any token' && !filterMarketCapOperator) {
        //     errorMessages.push('[Filter] Market cap operator is required')
        // }

        if (!tradeType) {
            errorMessages.push('[Action] Trade type is required')
        }

        if (!tradeAmount) {
            errorMessages.push('[Action] Collateral amount is required')
        }

        // Check if trade amount is greater than $10
        if (tradeAmount && tradeAmount.length > 0 && parseFloat(tradeAmount) < 10) {
            errorMessages.push('[Action] Collateral amount must be greater than $10.')
        }

        if (tradeAmount) {
            if (isPerps) {
                if (hyperliquidPerpsUSDCBalance && parseFloat(tradeAmount) > hyperliquidPerpsUSDCBalance?.balance) {
                    errorMessages.push('[Action] Insufficient USDC balance')
                }
            } else {
                if (targetChain.toLowerCase() === 'solana' && solBalance && parseFloat(tradeAmount) > solBalance?.usd_value) {
                    errorMessages.push('[Action] Insufficient SOL balance')
                }
                if (targetChain.toLowerCase() === 'ethereum' && solBalance && parseFloat(tradeAmount) > solBalance?.usd_value) {
                    errorMessages.push('[Action] Insufficient ETH balance')
                }
                if (targetChain.toLowerCase() === 'base' && solBalance && parseFloat(tradeAmount) > solBalance?.usd_value) {
                    errorMessages.push('[Action] Insufficient Base ETH balance')
                }
            }
        }

        if (isPerps && !tradeLeverage) {
            errorMessages.push('[Action] Leverage is required')
        }

        setErrorMessages(errorMessages)

        if (errorMessages.length > 0) {
            toast.error('Please fill in all the required fields, refer to error messages below.')
            setIsFormValid(false)
            return false
        } else {
            setIsFormValid(true)
            return true
        }
    }

    const getStatementValue = (
        key: IfType | TriggerType | FilterType | ActionType,
        strategy: Strategy,
        search: 'value' | 'amount' | 'chain' | 'operator' = 'value'
    ) => {
        if (strategy) {
            return strategy?.statements.find(statement => statement.type === key)?.[search]
        }
    }
    const getStatement = (key: IfType | TriggerType | FilterType | ActionType, strategy: Strategy) => {
        if (strategy) {
            return strategy?.statements.find(statement => statement.group === key)
        }
    }

    //set user token balance
    useEffect(() => {
        let currentTokenBalance = '-'
        if (isPerps) {
            if (hyperliquidPerpsUSDCBalance) {
                currentTokenBalance = `${hyperliquidPerpsUSDCBalance.balance.toFixed(2)} USDC`
            }
        } else {
            if (targetChain === 'solana') {
                if (solBalance) {
                    currentTokenBalance = `${solBalance.balance?.toFixed(2)} SOL (${solBalance.usd_value?.toFixed(2)} USD)`
                }
            }
            if (targetChain === 'ethereum') {
                if (mainnetEthBalance) {
                    currentTokenBalance = `${mainnetEthBalance.balance?.toFixed(2)} ETH (${mainnetEthBalance.usd_value?.toFixed(2)} USD)`
                }
            }
            if (targetChain === 'base') {
                if (baseEthBalance) {
                    currentTokenBalance = `${baseEthBalance.balance?.toFixed(2)} ETH (${baseEthBalance.usd_value?.toFixed(2)} USD)`
                }
            }
            if (targetChain === 'hyperliquid') {
                if (hyperliquidSpotUSDCBalance) {
                    currentTokenBalance = `${hyperliquidSpotUSDCBalance.balance.toFixed(2)} USDC`
                }
            }
        }

        setUserTokenBalance(currentTokenBalance)
    }, [isPerps, targetChain, hyperliquidPerpsUSDCBalance, solBalance, mainnetEthBalance, baseEthBalance, hyperliquidSpotUSDCBalance])

    // Populate form with strategy data
    useEffect(() => {
        if (strategy) {
            if (process.env.NODE_ENV === 'development') console.log({ strategy })

            setStrategyName(strategy?.strategyName)
            if (strategy.isRunning !== undefined) {
                setIsRunning(strategy.isRunning)
            }

            const token = getStatement('token', strategy)
            if (token) {
                if (token.type === 'customToken') {
                    if (token.value) setTargetCustomAddress(token.value)
                    if (token.chain) setTargetChain(token.chain)
                    setTargetToken('Custom Token')
                } else {
                    setTargetToken(token.value)
                }
            }

            const exchangeListing = getStatementValue('exchangeListing', strategy)
            if (exchangeListing) {
                setIsTriggerExchangeListingEnable(true)
                setTriggerExchangeListing(exchangeListing)
            }
            const kolMentions = getStatementValue('kolMentions', strategy)
            if (kolMentions) {
                setIsTriggerKOLMentionsEnable(true)
                setTriggerKOLMentions(kolMentions)
            }
            const keywords = getStatementValue('keywords', strategy)
            if (keywords) {
                setTriggerKeywords(Array.isArray(keywords) ? [...keywords] : [])
                if (keywords.length > 0) setIsTriggerKeywordsEnable(true)
            }
            if (exchangeListing || kolMentions || keywords) setShowAccordion(prev => ({ ...prev, triggers: true }))

            const sentimentDirection = getStatementValue('sentimentDirection', strategy)
            if (sentimentDirection) {
                setFilterSentimentDirection(sentimentDirection)
            }
            const sentimentMomentum = getStatementValue('sentimentMomentum', strategy)
            if (sentimentMomentum) {
                setFilterSentimentMomentum(sentimentMomentum)
            }
            const marketCap = getStatementValue('marketCap', strategy)
            if (marketCap) {
                setFilterMarketCap(marketCap)
                setFilterMarketCapOperator
            }

            const marketCapOperator = getStatementValue('marketCap', strategy, 'operator')
            if (marketCapOperator) {
                setFilterMarketCapOperator(marketCapOperator as Operator)
            }

            if (sentimentDirection || sentimentMomentum || marketCap) setShowAccordion(prev => ({ ...prev, filters: true }))

            const trade = getStatementValue('trade', strategy) //string
            const amount = getStatementValue('trade', strategy, 'amount')
            const leverage = getStatementValue('leverage', strategy)

            if (trade) setTradeType(trade)
            if (amount) setTradeAmount(amount)
            if (leverage) setTradeLeverage(+leverage)
        }
    }, [strategy])

    //Check if token is custom token or any token
    useEffect(() => {
        if (targetToken && (targetToken.toLowerCase() === 'custom token' || !isPerps)) {
            setIsCustomToken(true)
        } else {
            setIsCustomToken(false)
        }

        if (targetToken && targetToken.toLowerCase() === 'any token') {
            setIsAnyToken(true)
        } else {
            setIsAnyToken(false)
        }

        if (!isPerps) {
            // get data from atsSpotToken,ts and set the token address and chain
            const token = SPOT_TOKENS[targetToken as keyof typeof SPOT_TOKENS]
            if (token) {
                setTargetCustomAddress(token.address)
                setTargetChain(token.chain)
            }
        }
    }, [targetToken, isPerps])

    //Successfully create strategy
    useEffect(() => {
        if (createAtsIsSuccess) {
            setIsProcessing(false)
            if (createAtsData && createAtsData.message && createAtsData.message.code === 0) {
                toast.success('Automated trading strategy successfully created.', {
                    autoClose: 10000,
                })

                //close modal and refresh user strategy list
                if (handleCloseModal) handleCloseModal()
            } else {
                let errorMessage = ''

                if (createAtsData && createAtsData.message && createAtsData.message.args && createAtsData.message.args.length > 0) {
                    errorMessage = createAtsData.message.args[0]
                } else {
                    errorMessage = 'Something went wrong, try again.'
                }

                toast.error(errorMessage, {
                    autoClose: 10000,
                })
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createAtsIsSuccess, createAtsData])

    //Successfully update strategy
    useEffect(() => {
        if (updateAtsIsSuccess) {
            toast.success('Automated trading strategy successfully updated.', {
                autoClose: 10000,
            })
            setIsProcessing(false)
            if (updateAtsData) {
                if (handleCloseModal) handleCloseModal()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateAtsIsSuccess, updateAtsData])

    //Error creating strategy
    useEffect(() => {
        if (createAtsIsError) {
            toast.error('Something went wrong, try again.')
            setIsProcessing(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createAtsIsError, updateAtsIsError])

    //Clear all input if initial load is not edit
    useEffect(() => {
        if (!isEdit) {
            setStrategyName('')
            setTargetToken('')
            setTriggerKeywords([])
            setNewKeyword('')
            setFilterSentimentDirection('any')
            setFilterSentimentMomentum('any')
            setTargetChain('solana')
            setTradeType('')
            setTradeAmount('')
            setIsProcessing(false)
            setTradeLeverage(1)
            setIsRunning(true)
        }
    }, [isEdit])

    return (
        <>
            <div className="flex flex-col w-full  gap-3 flex-1 overflow-y-auto p-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <div className="flex flex-col gap-1 w-full">
                        <div>Strategy Name</div>
                        <Input onChange={e => setStrategyName(e.target.value)} value={strategyName} />
                    </div>

                    <div className="flex flex-col  gap-1">
                        <div>Active</div>
                        <div className="flex items-center gap-1">
                            <span className="text-neutral-text-dark">Off</span>
                            <ToggleButton
                                isOn={isRunning}
                                size="small"
                                onToggle={() => {
                                    setIsRunning(!isRunning)
                                }}
                                disabled={isProcessing}
                                isLoading={isProcessing}
                            />
                            <span className="text-neutral-text-dark">On</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1 ">
                    <div className="flex gap-1 items-center">
                        <div className="">Token</div>
                        <Tooltip text="Select the token this strategy will trade. You can create separate strategies for each token.">
                            <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                        </Tooltip>
                    </div>
                    <Select
                        name="tokens"
                        options={availableTokens}
                        theme={customTheme}
                        maxMenuHeight={200}
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                backgroundColor: state.isFocused ? '#171717' : '#101010',
                                borderColor: state.isFocused ? '#262626' : '#191919',
                            }),

                            option: (baseStyles, state) => ({
                                ...baseStyles,
                                backgroundColor: state.isSelected ? '#262626' : state.isFocused ? '#191919' : 'transparent',
                                color: state.isSelected ? '#ffffff' : '#dddddd',
                            }),

                            dropdownIndicator: baseStyles => ({
                                ...baseStyles,
                                color: '#888888',
                                '&:hover': {
                                    color: '#dddddd',
                                },
                            }),
                        }}
                        value={{ label: targetToken, value: targetToken }}
                        onChange={e => {
                            setTargetCustomAddress('')
                            const option = e as MultiSelectOption
                            setTargetToken(option.value)
                        }}
                    />
                </div>

                {isCustomToken && targetToken.toLowerCase() !== 'any token' && !isPerps && (
                    <div className="flex gap-3">
                        <div className="flex flex-col gap-1 flex-1">
                            <div className="flex gap-1 items-center">
                                <div className="">Token Address</div>
                                {/* <Tooltip text="Token Address">
                                    <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                </Tooltip> */}
                            </div>
                            <Input
                                value={targetCustomAddress}
                                onChange={e => setTargetCustomAddress(e.target.value)}
                                placeholder="ie. (7GCihg...)"
                                readOnly={targetToken.toLowerCase() !== 'custom token'}
                            />
                        </div>
                        <div className="flex flex-col gap-1 ">
                            <div className="flex gap-1 items-center">
                                <div className="">Chain</div>
                                {/* <Tooltip text="Chain">
                                    <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                </Tooltip> */}
                            </div>
                            <select
                                value={targetChain}
                                onChange={e => setTargetChain(e.target.value)}
                                className="relative overflow-hidden rounded-lg border focus:border-border border-border h-10 min-h-10 px-2 text-neutral-text bg-table-odd  text-sm focus:bg-neutral-900 focus:outline-none"
                            >
                                {TARGET_CUSTOM_TOKEN_CHAINS.map(data => (
                                    <option key={data} value={data} disabled={targetToken.toLowerCase() !== 'custom token'}>
                                        {data}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Triggers  */}
                <div className="flex flex-col  border border-border rounded-lg ">
                    <button
                        type="button"
                        onClick={() => {
                            setShowAccordion(prev => ({ ...prev, triggers: !prev.triggers }))
                        }}
                        className={`flex items-center justify-between p-2 hover:bg-table-odd h-10 ${showAccordion.triggers ? 'bg-table-odd' : ''}`}
                    >
                        <div className="text-sm font-semibold">Triggers</div>

                        <FaChevronDown
                            className={`text-sm text-[#888] hover:text-neutral-text transition-all duration-200 ${
                                showAccordion.triggers ? 'rotate-180' : ''
                            }`}
                        />
                    </button>
                    {showAccordion.triggers && (
                        <div className="flex flex-col w-full gap-3 p-2 border-t border-border">
                            <div className="flex flex-col gap-1 ">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1 items-center">
                                        <div className="">Exchange Listing</div>
                                        <Tooltip text="Exchange Listing">
                                            <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                        </Tooltip>
                                    </div>
                                    <ToggleButton
                                        size="small"
                                        isOn={isTriggerExchangeListingEnable}
                                        onToggle={() => {
                                            setIsTriggerExchangeListingEnable(!isTriggerExchangeListingEnable)

                                            if (isTriggerKOLMentionsEnable) {
                                                setIsTriggerKOLMentionsEnable(false)
                                            }
                                            if (isTriggerKeywordsEnable) {
                                                setIsTriggerKeywordsEnable(false)
                                            }
                                        }}
                                    />
                                </div>

                                {isTriggerExchangeListingEnable && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {TRIGGER_EXCHANGE_LISTING.map(data => {
                                            return (
                                                <Button
                                                    onClick={() => {
                                                        setTriggerExchangeListing(data)
                                                    }}
                                                    key={data}
                                                    type="button"
                                                    variant={data.toLowerCase() === triggerExchangeListing.toLowerCase() ? 'active' : 'inactive'}
                                                    height="min-h-10 h-10"
                                                    className="w-full text-xs"
                                                >
                                                    {getExchaneListingLabel(data)}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-1 ">
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-1 items-center">
                                        <div className="">KOL Mentions</div>
                                        <Tooltip text="Strategy will match CA or ticker mentioned by KOL.">
                                            <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                        </Tooltip>
                                    </div>
                                    <ToggleButton
                                        size="small"
                                        isOn={isTriggerKOLMentionsEnable}
                                        onToggle={() => {
                                            setIsTriggerKOLMentionsEnable(!isTriggerKOLMentionsEnable)

                                            if (isTriggerExchangeListingEnable) {
                                                setIsTriggerExchangeListingEnable(false)
                                            }
                                            if (isTriggerKeywordsEnable) {
                                                setIsTriggerKeywordsEnable(false)
                                            }
                                        }}
                                    />
                                </div>

                                {isTriggerKOLMentionsEnable && (
                                    <Input inputSymbol="@" onChange={e => setTriggerKOLMentions(e.target.value)} value={triggerKOLMentions} />
                                )}
                            </div>
                            <div className="flex flex-col gap-1 ">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1 items-center">
                                        <div className="">Keywords</div>
                                        <Tooltip text="Add keywords for the strategy trigger, which activates only when ALL keywords are mentioned in the news headline. For example, ETF, Fed, Crypto.">
                                            <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                        </Tooltip>
                                    </div>
                                    <ToggleButton
                                        size="small"
                                        isOn={isTriggerKeywordsEnable}
                                        onToggle={() => {
                                            setIsTriggerKeywordsEnable(!isTriggerKeywordsEnable)

                                            if (isTriggerExchangeListingEnable) {
                                                setIsTriggerExchangeListingEnable(false)
                                            }
                                            if (isTriggerKOLMentionsEnable) {
                                                setIsTriggerKOLMentionsEnable(false)
                                            }
                                        }}
                                    />
                                </div>
                                {isTriggerKeywordsEnable && (
                                    <div className="w-full flex flex-col gap-2">
                                        <form
                                            onSubmit={e => {
                                                e.preventDefault()
                                                addKeyword()
                                            }}
                                            className="flex items-center gap-2"
                                        >
                                            <Input
                                                value={newKeyword}
                                                onChange={e => setNewKeyword(e.target.value)}
                                                placeholder="ie. (Crypto)"
                                            ></Input>

                                            <Button type="submit" className="text-xs" height="min-h-10 h-10">
                                                Add
                                            </Button>
                                        </form>
                                        {triggerKeywords.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {triggerKeywords.map((keyword, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between border-border rounded-md border gap-1 bg-table-odd  hover:bg-neutral-900 divide-x divide-border"
                                                    >
                                                        <div className="flex items-center h-6 px-2 text-xs">{keyword}</div>
                                                        <button
                                                            onClick={() => removeKeyword(keyword)}
                                                            className="text-neutral-text-dark hover:text-red-500 text-2xs flex items-center justify-center size-6"
                                                        >
                                                            <FaXmark />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters  */}
                <div className="flex flex-col  border border-border rounded-lg">
                    <button
                        type="button"
                        onClick={() => {
                            setShowAccordion(prev => ({ ...prev, filters: !prev.filters }))
                        }}
                        className={`flex items-center justify-between p-2 hover:bg-table-odd h-10 ${showAccordion.filters ? 'bg-table-odd' : ''}`}
                    >
                        <div className="text-sm font-semibold">Filters</div>

                        <FaChevronDown
                            className={`text-sm text-[#888] hover:text-neutral-text transition-all duration-200 ${
                                showAccordion.filters ? 'rotate-180' : ''
                            }`}
                        />
                    </button>
                    {showAccordion.filters && (
                        <div className="flex flex-col w-full gap-3 p-2 border-t border-border">
                            <div className="flex flex-col gap-1 ">
                                <div className="flex gap-1 items-center">
                                    <div className="">Impact</div>
                                    <Tooltip text="Filter news events by their expected market impact. High impact = bigger market moves.">
                                        <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                    </Tooltip>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 ">
                                    {FILTER_SENTIMENT_MOMENTUMS.map(data => {
                                        return (
                                            <Button
                                                onClick={() => {
                                                    setFilterSentimentMomentum(data)
                                                }}
                                                key={data}
                                                type="button"
                                                variant={data.toLowerCase() === filterSentimentMomentum.toLowerCase() ? 'active' : 'inactive'}
                                                height="min-h-10 h-10"
                                                className="w-full text-xs"
                                            >
                                                {data}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 ">
                                <div className="flex gap-1 items-center">
                                    <div className="">Sentiment</div>
                                    <Tooltip text="Choose the news sentiment that triggers this strategy: bullish, neutral, or bearish.">
                                        <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                    </Tooltip>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ">
                                    {FILTER_SENTIMENT_DIRECTIONS.map(data => {
                                        return (
                                            <Button
                                                onClick={() => {
                                                    setFilterSentimentDirection(data)
                                                }}
                                                key={data}
                                                type="button"
                                                variant={data.toLowerCase() === filterSentimentDirection.toLowerCase() ? 'active' : 'inactive'}
                                                height="min-h-10 h-10"
                                                className="w-full text-xs"
                                            >
                                                {data}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>

                            {isAnyToken && (
                                <div className="flex flex-col gap-1 ">
                                    <div className="flex gap-1 items-center">
                                        <div className="">Market Cap</div>
                                        <Tooltip text="Market Cap">
                                            <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                        </Tooltip>
                                    </div>
                                    <div className="flex items-center gap-3 w-full">
                                        <select
                                            value={filterMarketCapOperator}
                                            onChange={e => setFilterMarketCapOperator(e.target.value as Operator)}
                                            className="relative overflow-hidden rounded-lg border  focus:border-border border-border h-10 min-h-10 px-2 text-neutral-text bg-table-odd  text-base focus:bg-neutral-900 focus:outline-none"
                                        >
                                            {FILTER_OPERATOR.map(data => (
                                                <option key={data} value={data}>
                                                    {data}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="relative overflow-hidden rounded-lg border  focus:border-border border-border w-full">
                                            <div className="absolute inset-y-0 flex justify-center items-center px-3 border-r border-border bg-table-odd w-10 min-w-10">
                                                $
                                            </div>
                                            <DecimalInput
                                                onChange={e => {
                                                    setFilterMarketCap(e.target.value)
                                                }}
                                                value={filterMarketCap}
                                                className="w-full h-full  pl-12 rounded-lg p-2 focus:outline-none text-neutral-text bg-table-odd  text-base focus:bg-neutral-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action */}
                <div className="flex flex-col p-2 border border-border rounded-lg gap-3">
                    <div className="text-sm font-semibold">Action</div>

                    <div className="flex flex-col gap-1 ">
                        <div className="flex gap-1 items-center">
                            <div className="">Trade</div>
                            <Tooltip text="Choose whether to execute a BUY or SELL when the conditions match.">
                                <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                            </Tooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {TRADE_TYPE.map(data => {
                                return (
                                    <Button
                                        onClick={() => {
                                            setTradeType(data)
                                        }}
                                        key={data}
                                        type="button"
                                        variant={tradeType === data ? 'active' : 'inactive'}
                                        height="h-10 min-h-10"
                                        className="text-xs"
                                    >
                                        {data}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                    {isPerps && (
                        <div className="w-full flex flex-col gap-1">
                            <div className="flex gap-1 items-center">
                                <div className="">Leverage</div>
                                <Tooltip text="Set your desired leverage. Higher leverage increases potential gains and losses. Default leverage is set to the maximum leverage on tokens when your pre-set leverage is too large and not possible.">
                                    <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                </Tooltip>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    className="w-full accent-white"
                                    max={20}
                                    min={1}
                                    value={tradeLeverage}
                                    onChange={e => handleLeverageSliderChange(Number(e.target.value))}
                                />
                                <input
                                    type="number"
                                    className="w-14 h-7 border border-border bg-table-odd text-neutral-text rounded-md text-center focus:outline-none focus:bg-neutral-900 transition-colors"
                                    value={tradeLeverage}
                                    onChange={handleLeverageInputChange}
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-1 ">
                        <div className="flex gap-1 items-center">
                            <div className="">{isPerps ? 'Collateral Amount' : 'Amount'}</div>
                            <Tooltip text="Minimum $10. This is the amount used per trade when the strategy is triggered.">
                                <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                            </Tooltip>
                        </div>
                        <div className="relative overflow-hidden rounded-lg border  focus:border-border border-border">
                            <div className="absolute inset-y-0 flex justify-center items-center px-3 border-r border-border bg-table-odd w-10 min-w-10">
                                $
                            </div>
                            <DecimalInput
                                onChange={e => {
                                    setTradeAmount(e.target.value)
                                }}
                                value={tradeAmount}
                                className="w-full h-full  pl-12 rounded-lg p-2 focus:outline-none text-neutral-text bg-table-odd  text-base focus:bg-neutral-900"
                            />
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center gap-1 ml-auto">
                                <FaWallet className="text-2xs" />
                                <div className="text-xs">{userTokenBalance}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {errorMessages.length > 0 && (
                    <div className="flex flex-col gap-1 ">
                        {errorMessages.map((errorMessage, index) => {
                            return (
                                <div key={index} className="text-xs text-negative">
                                    - {errorMessage}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <div className="flex w-full flex-row items-center justify-end gap-3 p-3 border-t border-border">
                <Button
                    onClick={() => {
                        if (handleCloseModal) handleCloseModal()
                    }}
                    variant="ghost"
                    className="text-xs"
                >
                    Cancel
                </Button>
                <Button
                    className="text-xs"
                    variant="primary"
                    onClick={() => {
                        if (!handleValidateForm()) return

                        triggerHaptic(50)

                        //if no triggers are set, show confirmation modal
                        if (!isTriggerExchangeListingEnable && !isTriggerKOLMentionsEnable && !isTriggerKeywordsEnable) {
                            confirmationModalRef.current?.toggleModal()
                        } else {
                            handleSubmitForm()
                        }
                    }}
                    disabled={isProcessing}
                >
                    <div>{`${isEdit ? 'Update' : 'Create'}`}</div>
                    {isProcessing && <Spinner variant="primary" className="w-4 h-4" />}
                </Button>
            </div>

            <ConfirmationModal
                header="Create Strategy"
                content={`No triggers are set for this strategy. Are you sure you want to ${isEdit ? 'update' : 'create'} this strategy?`}
                type="primary"
                submitText={isEdit ? 'Update' : 'Create'}
                ref={confirmationModalRef}
                action={() => {
                    handleSubmitForm()
                    // confirmationModalRef.current?.toggleModal()
                }}
            ></ConfirmationModal>
        </>
    )
}

export default StrategyForm
