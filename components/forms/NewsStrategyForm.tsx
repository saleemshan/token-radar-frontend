// 'use client'
// import React, { useEffect, useState } from 'react'
// import Select from 'react-select'
// import { toast } from 'react-toastify'
// import { useMutateCreateATS, useMutateUpdateATS } from '@/hooks/data/useAtsData'
// import { usePairTokensContext } from '@/context/pairTokensContext'
// import Input from '../Input'
// import { MultiSelectOption } from '@/types/newstrading'
// import { customTheme } from '@/data/default/theme'
// import { sentimentDirections, sentimentMomentums, trade } from '@/data/default/ats'
// import DecimalInput from '../input/DecimalInput'
// import Button from '../ui/Button'
// import Spinner from '../Spinner'
// import { FaCircleInfo, FaXmark } from 'react-icons/fa6'
// import Tooltip from '../Tooltip'
// import ToggleButton from '../ToggleButton'

// const NewsStrategyForm = ({
//     isEdit = false,
//     strategy,
//     handleCloseModal,
// }: {
//     isEdit?: boolean
//     strategy?: Strategy
//     handleCloseModal?: () => void
// }) => {
//     const { tokenPairData } = usePairTokensContext()

//     const { mutate: createAts, data: createAtsData, isSuccess: createAtsIsSuccess, isError: createAtsIsError } = useMutateCreateATS()
//     const { mutate: updateAts, data: updateAtsData, isSuccess: updateAtsIsSuccess, isError: updateAtsIsError } = useMutateUpdateATS()

//     const [name, setName] = useState('')
//     const [token, setToken] = useState('')
//     const [keywords, setKeywords] = useState<string[]>([])
//     const [newKeyword, setNewKeyword] = useState('')
//     const [selectedSentimentDirection, setSelectedSentimentDirection] = useState('')
//     const [selectedSentimentMomentum, setSelectedSentimentMomentum] = useState('')
//     const [selectedTrade, setSelectedTrade] = useState('')
//     const [tradeAmount, setTradeAmount] = useState('')
//     const [isProcessing, setIsProcessing] = useState(false)
//     const [availableTokens, setAvailableTokens] = useState<MultiSelectOption[]>([])
//     const [sliderValue, setSliderValue] = useState<number>(1)
//     const [isRunning, setIsRunning] = useState(true)

//     //Slider change handler
//     const handleSliderChange = (newValue: number) => {
//         if (newValue >= 1) {
//             setSliderValue(newValue)
//         }
//     }

//     const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const value = Number(event.target.value.replace('x', '')) || 1
//         if (value >= 1) {
//             setSliderValue(value)
//         }
//     }

//     useEffect(() => {
//         if (strategy) {
//             console.log({ strategy })

//             setName(strategy?.strategyName)

//             const token = getStatementValue('newsTrading', strategy)
//             const keywordsString = getStatementValue('keywords', strategy) //array string
//             const keywords = keywordsString?.split(',') //array string
//             const sentimentDirection = getStatementValue('sentimentDirection', strategy) //string
//             const sentimentMomentum = getStatementValue('sentimentMomentum', strategy) //string
//             const trade = getStatementValue('trade', strategy) //string
//             const amount = getStatementValue('trade', strategy, 'amount')
//             const leverage = getStatementValue('leverage', strategy)

//             if (token) setToken(token)
//             if (keywords) setKeywords(keywords)
//             if (sentimentDirection) setSelectedSentimentDirection(sentimentDirection)
//             if (sentimentMomentum) setSelectedSentimentMomentum(sentimentMomentum)
//             if (trade) setSelectedTrade(trade)
//             if (amount) setTradeAmount(amount)
//             if (leverage) setSliderValue(+leverage)

//             if (strategy.isRunning !== undefined) {
//                 setIsRunning(strategy.isRunning)
//             }
//         }
//     }, [strategy])

//     const getStatementValue = (key: IfType | AndType, strategy: Strategy, search: 'value' | 'amount' = 'value') => {
//         if (strategy) {
//             return strategy?.statements.find(statement => statement.type === key)?.[search]
//         }
//     }

//     const addKeyword = () => {
//         const trimmedKeyword = newKeyword.trim()
//         if (trimmedKeyword && trimmedKeyword.length > 0) {
//             setKeywords(prev => [...prev, trimmedKeyword])
//             setNewKeyword('')
//         }
//     }

//     const removeKeyword = (keyword: string) => {
//         setKeywords(prev => prev.filter(k => k !== keyword))
//     }

//     const handleSubmitForm = async () => {
//         if (isProcessing) return

//         //check if name, description, statements exist
//         if (!name || !token || !selectedSentimentDirection || !selectedSentimentMomentum || !selectedTrade || !tradeAmount) {
//             toast.error('Please fill in all the fields.')
//             return
//         }

//         // Check if trade amount is greater than $10
//         if (tradeAmount && tradeAmount.length > 0 && parseFloat(tradeAmount) < 10) {
//             toast.error('Collateral amount must be greater than $10.')
//             return
//         }

//         let strategyObj = {}

//         if (isEdit) {
//             strategyObj = { ...strategy }
//         }

//         strategyObj = {
//             ...strategyObj,

//             strategyName: name,
//             statements: [
//                 {
//                     condition: 'if',
//                     type: 'newsTrading',
//                     value: token,
//                     operator: '=',
//                 },
//                 {
//                     condition: 'and',
//                     type: 'keywords',
//                     value: keywords.join(','),
//                     operator: '=',
//                 },
//                 {
//                     condition: 'and',
//                     type: 'sentimentDirection',
//                     value: selectedSentimentDirection,
//                     operator: '=',
//                 },
//                 {
//                     condition: 'and',
//                     type: 'sentimentMomentum',
//                     value: selectedSentimentMomentum,
//                     operator: '=',
//                 },
//                 {
//                     condition: 'and',
//                     type: 'leverage',
//                     value: sliderValue.toString(),
//                     operator: '=',
//                 },
//                 {
//                     condition: 'and',
//                     type: 'trade',
//                     value: selectedTrade,
//                     amount: tradeAmount,
//                     operator: '=',
//                 },
//             ],
//             isPublic: false,
//             isRunning: isRunning,
//             description: '',
//         }

//         setIsProcessing(true)

//         console.log({ strategyObj })

//         if (isEdit) {
//             updateAts({
//                 strategy: {
//                     ...strategyObj,
//                 } as Strategy,
//                 isNewsTrading: true,
//             })
//         } else {
//             createAts({
//                 strategy: {
//                     ...strategyObj,
//                 } as Strategy,
//                 isNewsTrading: true,
//             })
//         }
//     }

//     useEffect(() => {
//         if (tokenPairData && tokenPairData.length > 0) {
//             const availableTokens: MultiSelectOption[] = tokenPairData.map(data => {
//                 return {
//                     label: data.universe.name,
//                     value: data.universe.name,
//                 } as MultiSelectOption
//             })

//             setAvailableTokens(availableTokens)
//         }
//     }, [tokenPairData])

//     useEffect(() => {
//         if (createAtsIsSuccess) {
//             setIsProcessing(false)
//             if (createAtsData && createAtsData.message && createAtsData.message.code === 0) {
//                 toast.success('Automated trading strategy successfully created.', {
//                     autoClose: 10000,
//                 })

//                 //close modal and refresh user strategy list
//                 if (handleCloseModal) handleCloseModal()
//             } else {
//                 let errorMessage = ''

//                 if (createAtsData && createAtsData.message && createAtsData.message.args && createAtsData.message.args.length > 0) {
//                     errorMessage = createAtsData.message.args[0]
//                 } else {
//                     errorMessage = 'Something went wrong, try again.'
//                 }

//                 toast.error(errorMessage, {
//                     autoClose: 10000,
//                 })
//             }
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [createAtsIsSuccess, createAtsData])

//     useEffect(() => {
//         if (updateAtsIsSuccess) {
//             toast.success('Automated trading strategy successfully updated.', {
//                 autoClose: 10000,
//             })
//             setIsProcessing(false)
//             if (updateAtsData) {
//                 if (handleCloseModal) handleCloseModal()
//             }
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [updateAtsIsSuccess, updateAtsData])

//     useEffect(() => {
//         if (createAtsIsError) {
//             toast.error('Something went wrong, try again.')
//             setIsProcessing(false)
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [createAtsIsError, updateAtsIsError])

//     useEffect(() => {
//         if (!isEdit) {
//             //clear all input
//             setName('')
//             setToken('')
//             setKeywords([])
//             setNewKeyword('')
//             setSelectedSentimentDirection('')
//             setSelectedSentimentMomentum('')
//             setSelectedTrade('')
//             setTradeAmount('')
//             setIsProcessing(false)
//             // setAvailableTokens([])
//             setSliderValue(1)
//             setIsRunning(true)
//         }
//     }, [isEdit])

//     return (
//         <div className="flex flex-col w-full  gap-3 min-h-fit">
//             <div className="flex flex-col sm:flex-row gap-3 w-full">
//                 <div className="flex flex-col gap-1 w-full">
//                     <div>Strategy Name</div>
//                     <Input onChange={e => setName(e.target.value)} value={name} />
//                 </div>

//                 <div className="flex flex-col  gap-1">
//                     <div>Active</div>
//                     <div className="flex items-center gap-1">
//                         <span className="text-neutral-text-dark">Off</span>
//                         <ToggleButton
//                             isOn={isRunning}
//                             onToggle={() => {
//                                 setIsRunning(!isRunning)
//                             }}
//                             disabled={isProcessing}
//                             isLoading={isProcessing}
//                         />
//                         <span className="text-neutral-text-dark">On</span>
//                     </div>
//                 </div>
//                 {/* <div className="flex flex-col gap-1 ">
//                     <div className="flex items-center gap-1">
//                         <div>Public</div>
//                         <Tooltip text="Display your strategy on the explore page and allow other to copy the strategy.">
//                             <FaCircleInfo className="text-2xs text-neutral-text-dark" />
//                         </Tooltip>
//                     </div>
//                     <ToggleButton isOn={isPublic} onToggle={handleToggleIsPublic} />
//                 </div> */}
//             </div>

//             <div className="flex flex-col gap-1 ">
//                 <div className="flex gap-1 items-center">
//                     <div className="">Token</div>
//                     <Tooltip text="Select the token this strategy will trade. You can create separate strategies for each token.">
//                         <FaCircleInfo className="text-2xs text-neutral-text-dark" />
//                     </Tooltip>
//                 </div>
//                 <Select
//                     name="tokens"
//                     options={availableTokens}
//                     theme={customTheme}
//                     maxMenuHeight={200}
//                     styles={{
//                         control: (baseStyles, state) => ({
//                             ...baseStyles,
//                             backgroundColor: state.isFocused ? '#171717' : '#101010',
//                             borderColor: state.isFocused ? '#262626' : '#191919',
//                         }),

//                         option: (baseStyles, state) => ({
//                             ...baseStyles,
//                             backgroundColor: state.isSelected ? '#262626' : state.isFocused ? '#191919' : 'transparent',
//                             color: state.isSelected ? '#ffffff' : '#dddddd',
//                         }),

//                         dropdownIndicator: baseStyles => ({
//                             ...baseStyles,
//                             color: '#888888',
//                             '&:hover': {
//                                 color: '#dddddd',
//                             },
//                         }),
//                     }}
//                     value={{ label: token, value: token }}
//                     onChange={e => {
//                         const option = e as MultiSelectOption
//                         setToken(option.value)
//                     }}
//                 />
//             </div>
//             <div className="w-full flex flex-col gap-1">
//                 <div className="flex gap-1 items-center">
//                     <div className="">Leverage</div>
//                     <Tooltip text="Set your desired leverage. Higher leverage increases potential gains and losses.">
//                         <FaCircleInfo className="text-2xs text-neutral-text-dark" />
//                     </Tooltip>
//                 </div>

//                 <div className="flex items-center gap-3">
//                     <input
//                         type="range"
//                         className="w-full accent-primary"
//                         max={20}
//                         min={1}
//                         value={sliderValue}
//                         onChange={e => handleSliderChange(Number(e.target.value))}
//                     />
//                     <input
//                         type="number"
//                         className="w-14 h-7 border border-border bg-table-odd text-neutral-text rounded-md text-center focus:outline-none focus:border-primary transition-colors"
//                         min="1"
//                         value={sliderValue}
//                         onChange={handleInputChange}
//                     />
//                 </div>
//             </div>
//             <div className="flex flex-col gap-1 ">
//                 <div className="flex gap-1 items-center">
//                     <div className="">Keywords</div>
//                     <Tooltip text="Add keywords to help filter news headlines trigger your strategy. For example: ETF, Fed, hack. You can add multiple keywords.">
//                         <FaCircleInfo className="text-2xs text-neutral-text-dark" />
//                     </Tooltip>
//                 </div>
//                 <form
//                     onSubmit={e => {
//                         e.preventDefault()
//                         addKeyword()
//                     }}
//                     className="flex items-center gap-2"
//                 >
//                     <Input value={newKeyword} onChange={e => setNewKeyword(e.target.value)} placeholder="Crypto"></Input>

//                     <Button type="submit" className="text-xs">
//                         Add
//                     </Button>
//                 </form>
//                 <div className="mt-2 flex flex-wrap gap-2">
//                     {keywords.map((keyword, index) => (
//                         <div
//                             key={index}
//                             className="flex items-center justify-between border-border rounded-md border gap-1 bg-table-odd  hover:bg-neutral-900 divide-x divide-border"
//                         >
//                             <div className="flex items-center h-6 px-2 text-xs">{keyword}</div>
//                             <button
//                                 onClick={() => removeKeyword(keyword)}
//                                 className="text-neutral-text-dark hover:text-red-500 text-2xs flex items-center justify-center size-6"
//                             >
//                                 <FaXmark />
//                             </button>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//             <div className="flex flex-col gap-1 ">
//                 <div className="flex gap-1 items-center">
//                     <div className="">Impact</div>
//                     <Tooltip text="Filter news events by their expected market impact. High impact = bigger market moves.">
//                         <FaCircleInfo className="text-2xs text-neutral-text-dark" />
//                     </Tooltip>
//                 </div>
//                 <div className="flex gap-3">
//                     <button
//                         onClick={() => {
//                             setSelectedSentimentMomentum('Any')
//                         }}
//                         type="button"
//                         className={`ats-button w-full ${selectedSentimentMomentum === 'Any' ? 'ats-button-active' : 'ats-button-inactive'}`}
//                     >
//                         Any
//                     </button>
//                     {sentimentMomentums.map(data => {
//                         return (
//                             <button
//                                 onClick={() => {
//                                     setSelectedSentimentMomentum(data)
//                                 }}
//                                 key={data}
//                                 type="button"
//                                 className={`ats-button w-full ${selectedSentimentMomentum === data ? 'ats-button-active' : 'ats-button-inactive'}`}
//                             >
//                                 {data}
//                             </button>
//                         )
//                     })}
//                 </div>
//             </div>
//             <div className="flex flex-col gap-1 ">
//                 <div className="flex gap-1 items-center">
//                     <div className="">Sentiment</div>
//                     <Tooltip text="Choose the news sentiment that triggers this strategy: bullish, neutral, or bearish.">
//                         <FaCircleInfo className="text-2xs text-neutral-text-dark" />
//                     </Tooltip>
//                 </div>
//                 <div className="flex gap-3">
//                     <button
//                         onClick={() => {
//                             setSelectedSentimentDirection('Any')
//                         }}
//                         type="button"
//                         className={`ats-button w-full ${selectedSentimentDirection === 'Any' ? 'ats-button-active' : 'ats-button-inactive'}`}
//                     >
//                         Any
//                     </button>
//                     {sentimentDirections.map(data => {
//                         return (
//                             <button
//                                 onClick={() => {
//                                     setSelectedSentimentDirection(data)
//                                 }}
//                                 key={data}
//                                 type="button"
//                                 className={`ats-button w-full ${selectedSentimentDirection === data ? 'ats-button-active' : 'ats-button-inactive'}`}
//                             >
//                                 {data}
//                             </button>
//                         )
//                     })}
//                 </div>
//             </div>
//             <div className="flex flex-col gap-1 ">
//                 <div className="flex gap-1 items-center">
//                     <div className="">Trade</div>
//                     <Tooltip text="Choose whether to execute a BUY or SELL when the conditions match.">
//                         <FaCircleInfo className="text-2xs text-neutral-text-dark" />
//                     </Tooltip>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                     {trade.map(data => {
//                         return (
//                             <button
//                                 onClick={() => {
//                                     setSelectedTrade(data)
//                                 }}
//                                 key={data}
//                                 type="button"
//                                 className={`ats-button ${selectedTrade === data ? 'ats-button-active' : 'ats-button-inactive'}`}
//                             >
//                                 {data}
//                             </button>
//                         )
//                     })}
//                 </div>
//             </div>
//             <div className="flex flex-col gap-1 ">
//                 <div className="flex gap-1 items-center">
//                     <div className="">Collateral Amount</div>
//                     <Tooltip text="Minimum $10. This is the amount used per trade when the strategy is triggered.">
//                         <FaCircleInfo className="text-2xs text-neutral-text-dark" />
//                     </Tooltip>
//                 </div>
//                 <div className="relative overflow-hidden rounded-lg border  focus:border-border border-border">
//                     <div className="absolute inset-y-0 flex justify-center items-center px-3 border-r border-border bg-table-odd w-10 min-w-10">
//                         $
//                     </div>
//                     <DecimalInput
//                         onChange={e => {
//                             setTradeAmount(e.target.value)
//                         }}
//                         value={tradeAmount}
//                         className="w-full h-full  pl-12 rounded-lg p-2 focus:outline-none text-neutral-text bg-table-odd  text-base focus:bg-neutral-900"
//                     />
//                 </div>
//             </div>

//             <div className="flex w-full flex-row items-center justify-end gap-3">
//                 <Button
//                     onClick={() => {
//                         if (handleCloseModal) handleCloseModal()
//                     }}
//                     variant="ghost"
//                     className="text-xs"
//                 >
//                     Cancel
//                 </Button>
//                 <Button className="text-xs" variant="primary" onClick={handleSubmitForm} disabled={isProcessing}>
//                     <div>{`${isEdit ? 'Update' : 'Create'}`}</div>
//                     {isProcessing && <Spinner variant="primary" className="w-4 h-4" />}
//                 </Button>
//             </div>
//         </div>
//     )
// }

// export default NewsStrategyForm
