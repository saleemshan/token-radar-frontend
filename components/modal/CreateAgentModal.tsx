// import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
// import Modal, { ModalMethods } from './Modal'
// import { alphaGroups, atsAndSources, atsIfSources, exchanges, operator, sentiment, tokenChains, trade } from '@/data/default/ats'
// import DecimalInput from '../input/DecimalInput'
// import { FaChevronDown, FaXmark } from 'react-icons/fa6'
// import Button from '../ui/Button'
// import { customTheme } from '@/data/default/theme'
// import { MultiSelectOption } from '@/types/newstrading'
// import { usePairTokensContext } from '@/context/pairTokensContext'
// import Select from 'react-select'
// import Input from '../Input'

// const CreateAgentModal = forwardRef(
//     (
//         props: {
//             header: string
//             statements: Statement[]
//             handleAddStatement: (statement: Statement) => void
//         },
//         ref
//     ) => {
//         const modalRef = React.createRef<ModalMethods>()

//         const { tokenPairData } = usePairTokensContext()

//         const [availableTokens, setAvailableTokens] = useState<MultiSelectOption[]>([])

//         useEffect(() => {
//             if (tokenPairData && tokenPairData.length > 0) {
//                 const availableTokens: MultiSelectOption[] = tokenPairData.map(data => {
//                     return {
//                         label: data.universe.name,
//                         value: data.universe.name,
//                     } as MultiSelectOption
//                 })

//                 setAvailableTokens(availableTokens)
//             }
//         }, [tokenPairData])

//         const [selectedType, setSelectedType] = useState<IfType | AndType | undefined>(undefined)

//         const [errorMessage, setErrorMessage] = useState<undefined | string>(undefined)

//         const [showDropdown, setShowDropdown] = useState(false)

//         const [selectedOperator, setSelectedOperator] = useState<Operator | undefined>(undefined)

//         const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined)
//         const [tradeAmount, setTradeAmount] = useState<string | undefined>(undefined)

//         const hasAvailableItems = (category: string): boolean => {
//             return atsAndSources.some(service => service.category === category && !props.statements.some(item => item.type === service.id))
//         }

//         const handleToggleModal = useCallback(() => {
//             setSelectedType(undefined)
//             setSelectedValue(undefined)
//             setSelectedOperator(undefined)
//             setTradeAmount(undefined)
//             modalRef.current?.toggleModal()
//         }, [modalRef])

//         useImperativeHandle(ref, () => ({
//             toggleModal: handleToggleModal,
//         }))

//         return (
//             <Modal ref={modalRef}>
//                 <div className="max-w-xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full ">
//                     <div className="p-3 flex border-b border-border items-center bg-black">
//                         <div className=" text-base font-semibold leading-6 text-white flex-1 ">{props.header}</div>

//                         <div>
//                             <button
//                                 type="button"
//                                 onClick={() => {
//                                     modalRef.current?.closeModal()
//                                 }}
//                                 className="flex  bg-table-odd border border-border hover:bg-neutral-900 rounded-lg w-8 h-8 items-center justify-center text-neutral-text apply-transition "
//                             >
//                                 <FaXmark />
//                             </button>
//                         </div>
//                     </div>
//                     <div className="flex flex-col w-full p-3 gap-3">
//                         <div className="flex flex-col gap-1 border-b border-border pb-3">
//                             {props.statements.length < 1 && (
//                                 <>
//                                     <div>Source</div>
//                                     <div className="grid grid-cols-3 gap-3">
//                                         {atsIfSources.map(service => {
//                                             if (!props.statements.some(item => item.type === service.id)) {
//                                                 return (
//                                                     <button
//                                                         onClick={() => {
//                                                             setSelectedType(service.id as IfType | AndType)
//                                                             setSelectedValue(undefined)

//                                                             console.log({ service })

//                                                             if (
//                                                                 service.id === 'kolMentions' ||
//                                                                 service.id === 'newsTrading' ||
//                                                                 service.id === 'keywords'
//                                                             ) {
//                                                                 setSelectedOperator('=')
//                                                             }
//                                                         }}
//                                                         key={service.id}
//                                                         type="button"
//                                                         className={`ats-button ${
//                                                             selectedType === service.id ? 'ats-button-active' : 'ats-button-inactive'
//                                                         }`}
//                                                     >
//                                                         {service.name}
//                                                     </button>
//                                                 )
//                                             }
//                                         })}
//                                     </div>
//                                 </>
//                             )}
//                             {props.statements.length > 0 && (
//                                 <>
//                                     {hasAvailableItems('action') && (
//                                         <>
//                                             <div>Action</div>
//                                             <div className="grid grid-cols-3 gap-3 mb-2">
//                                                 {atsAndSources.map(service => {
//                                                     if (service.category === 'action' && !props.statements.some(item => item.type === service.id)) {
//                                                         return (
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setSelectedType(service.id as IfType | AndType)
//                                                                     setSelectedValue(undefined)
//                                                                     setTradeAmount(undefined)

//                                                                     if (service.id === 'keywords') setSelectedOperator('=')
//                                                                 }}
//                                                                 key={service.id}
//                                                                 type="button"
//                                                                 className={`ats-button ${
//                                                                     selectedType === service.id ? 'ats-button-active' : 'ats-button-inactive'
//                                                                 }`}
//                                                             >
//                                                                 {service.name}
//                                                             </button>
//                                                         )
//                                                     }
//                                                 })}
//                                             </div>
//                                         </>
//                                     )}

//                                     {hasAvailableItems('filter') && (
//                                         <>
//                                             <div>Filter</div>
//                                             <div className="grid grid-cols-3 gap-3">
//                                                 {atsAndSources.map(service => {
//                                                     if (service.category === 'filter' && !props.statements.some(item => item.type === service.id)) {
//                                                         return (
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setSelectedType(service.id as IfType | AndType)
//                                                                     setSelectedValue(undefined)
//                                                                     setTradeAmount(undefined)
//                                                                     if (service.id === 'keywords') setSelectedOperator('=')
//                                                                 }}
//                                                                 key={service.id}
//                                                                 type="button"
//                                                                 className={`ats-button ${
//                                                                     selectedType === service.id ? 'ats-button-active' : 'ats-button-inactive'
//                                                                 }`}
//                                                             >
//                                                                 {service.name}
//                                                             </button>
//                                                         )
//                                                     }
//                                                 })}
//                                             </div>
//                                         </>
//                                     )}
//                                 </>
//                             )}
//                         </div>

//                         {selectedType === 'exchangeListing' && (
//                             <div className="flex flex-col gap-1">
//                                 <div>Exchange</div>
//                                 <div className="grid grid-cols-3 gap-3">
//                                     {exchanges.map(data => {
//                                         return (
//                                             <button
//                                                 onClick={() => {
//                                                     setSelectedValue(data)
//                                                     setSelectedOperator('=')
//                                                 }}
//                                                 key={data}
//                                                 type="button"
//                                                 className={`ats-button ${selectedValue === data ? 'ats-button-active' : 'ats-button-inactive'}`}
//                                             >
//                                                 {data}
//                                             </button>
//                                         )
//                                     })}
//                                 </div>
//                             </div>
//                         )}

//                         {selectedType === 'alphaGroupCalls' && (
//                             <div className="flex flex-col gap-1">
//                                 <div>Alpha Group</div>
//                                 <div className="relative">
//                                     <button
//                                         className={`relative overflow-hidden w-full h-10 flex items-center bg-table-odd hover:bg-neutral-900 border border-border rounded-lg px-2 ${
//                                             selectedValue ? '' : 'text-neutral-300'
//                                         }`}
//                                         onClick={() => {
//                                             setShowDropdown(!showDropdown)
//                                         }}
//                                     >
//                                         {selectedValue ? (
//                                             <div className="flex items-center gap-3 w-full">
//                                                 <div>{selectedValue}</div>
//                                                 <FaChevronDown className={`text-neutral-300 text-2xs ml-auto ${showDropdown ? 'rotate-180' : ''}`} />
//                                             </div>
//                                         ) : (
//                                             <div className="flex items-center gap-3 w-full">
//                                                 <div>Select Alpha Group</div>
//                                                 <FaChevronDown className={`text-neutral-300 text-2xs ml-auto ${showDropdown ? 'rotate-180' : ''}`} />
//                                             </div>
//                                         )}
//                                     </button>
//                                     {showDropdown && (
//                                         <div className="flex flex-col absolute bg-neutral-900 w-full top-11 border border-border rounded-lg z-10 max-h-[40vh] overflow-y-auto">
//                                             {alphaGroups.map(data => {
//                                                 return (
//                                                     <button
//                                                         key={data.id}
//                                                         className="py-2 px-3 hover:bg-table-odd apply-transition"
//                                                         onClick={() => {
//                                                             setSelectedValue(data.id)
//                                                             setSelectedOperator('=')
//                                                             setShowDropdown(false)
//                                                         }}
//                                                     >
//                                                         {data.name}
//                                                     </button>
//                                                 )
//                                             })}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {selectedType === 'kolMentions' && (
//                             <div className="flex flex-col gap-1">
//                                 <div>KOL Mentions</div>
//                                 <div className="relative overflow-hidden rounded-lg border  focus:border-border border-border">
//                                     <div className="absolute inset-y-0 flex justify-center items-center px-3 border-r border-border bg-table-odd w-10 min-w-10">
//                                         @
//                                     </div>
//                                     <input
//                                         type="text"
//                                         className="w-full h-full  pl-12 rounded-lg p-2 focus:outline-none text-neutral-text bg-table-odd  text-base focus:bg-neutral-900"
//                                         placeholder="Twitter handle"
//                                         onChange={e => {
//                                             setSelectedValue(e.target.value)
//                                         }}
//                                     />
//                                 </div>
//                             </div>
//                         )}

//                         {selectedType === 'newsTrading' && (
//                             <div className="flex flex-col gap-1">
//                                 <div className="w-full flex flex-col gap-1 col-span-2">
//                                     <div className="">Tokens</div>
//                                     <Select
//                                         name="tokens"
//                                         options={availableTokens}
//                                         theme={customTheme}
//                                         value={{ label: selectedValue, value: selectedValue }}
//                                         onChange={e => {
//                                             const option = e as MultiSelectOption
//                                             setSelectedValue(option.value)
//                                         }}
//                                     />
//                                 </div>
//                             </div>
//                         )}

//                         {selectedType === 'trade' && (
//                             <>
//                                 <div className="flex flex-col gap-1">
//                                     <div>Trade</div>
//                                     <div className="grid grid-cols-2 gap-3">
//                                         {trade.map(data => {
//                                             return (
//                                                 <button
//                                                     onClick={() => {
//                                                         setSelectedValue(data)
//                                                         setSelectedOperator('=')
//                                                     }}
//                                                     key={data}
//                                                     type="button"
//                                                     className={`ats-button ${selectedValue === data ? 'ats-button-active' : 'ats-button-inactive'}`}
//                                                 >
//                                                     {data}
//                                                 </button>
//                                             )
//                                         })}
//                                     </div>
//                                 </div>
//                                 <div className="flex flex-col gap-1">
//                                     <div>Amount</div>

//                                     <div className="relative overflow-hidden rounded-lg border  focus:border-border border-border">
//                                         <div className="absolute inset-y-0 flex justify-center items-center px-3 border-r border-border bg-table-odd w-10 min-w-10">
//                                             $
//                                         </div>
//                                         <DecimalInput
//                                             onChange={e => {
//                                                 setTradeAmount(e.target.value)
//                                             }}
//                                             value={selectedValue}
//                                             className="w-full h-full  pl-12 rounded-lg p-2 focus:outline-none text-neutral-text bg-table-odd  text-base focus:bg-neutral-900"
//                                         />
//                                     </div>
//                                 </div>
//                             </>
//                         )}

//                         {selectedType === 'sentiment' && (
//                             <>
//                                 <div className="flex flex-col gap-1">
//                                     <div>Sentiment</div>
//                                     <div className="grid grid-cols-2 gap-3">
//                                         {sentiment.map(data => {
//                                             return (
//                                                 <button
//                                                     onClick={() => {
//                                                         setSelectedValue(data)
//                                                         setSelectedOperator('=')
//                                                     }}
//                                                     key={data}
//                                                     type="button"
//                                                     className={`ats-button ${selectedValue === data ? 'ats-button-active' : 'ats-button-inactive'}`}
//                                                 >
//                                                     {data}
//                                                 </button>
//                                             )
//                                         })}
//                                     </div>
//                                 </div>
//                             </>
//                         )}

//                         {selectedType === 'keywords' && (
//                             <>
//                                 <div className="flex flex-col gap-1">
//                                     <div>Keywords</div>

//                                     <Input
//                                         onChange={e => {
//                                             console.log(e.target.value)

//                                             setSelectedValue(e.target.value)
//                                         }}
//                                         value={selectedValue}
//                                         className="h-10"
//                                         placeholder="Add keywords"
//                                     />
//                                 </div>
//                             </>
//                         )}

//                         {selectedType === 'marketCap' && (
//                             <div className="flex flex-col gap-3">
//                                 <div>Market Cap</div>
//                                 <div className="grid grid-cols-3 gap-3 w-full ">
//                                     {operator.map(data => {
//                                         return (
//                                             <button
//                                                 onClick={() => {
//                                                     setSelectedOperator(data)
//                                                 }}
//                                                 key={data}
//                                                 type="button"
//                                                 className={`ats-button w-full ${
//                                                     selectedOperator === data ? 'ats-button-active' : 'ats-button-inactive'
//                                                 }`}
//                                             >
//                                                 {data}
//                                             </button>
//                                         )
//                                     })}
//                                 </div>

//                                 <div className="relative overflow-hidden rounded-lg border  focus:border-border border-border">
//                                     <div className="absolute inset-y-0 flex justify-center items-center px-3 border-r border-border bg-table-odd w-10 min-w-10">
//                                         $
//                                     </div>
//                                     <DecimalInput
//                                         onChange={e => {
//                                             setSelectedValue(e.target.value)
//                                         }}
//                                         placeholder="MCAP Amount"
//                                         value={selectedValue}
//                                         className="w-full h-full  pl-12 rounded-lg p-2 focus:outline-none text-neutral-text bg-table-odd  text-base focus:bg-neutral-900"
//                                     />
//                                 </div>
//                             </div>
//                         )}

//                         {selectedType === 'tokenChain' && (
//                             <div className="flex flex-col gap-1">
//                                 <div>Token Chain</div>
//                                 <div className="grid grid-cols-3 gap-3">
//                                     {tokenChains.map(data => {
//                                         return (
//                                             <button
//                                                 onClick={() => {
//                                                     setSelectedValue(data)
//                                                     setSelectedOperator('=')
//                                                 }}
//                                                 key={data}
//                                                 type="button"
//                                                 className={`ats-button ${selectedValue === data ? 'ats-button-active' : 'ats-button-inactive'}`}
//                                             >
//                                                 {data}
//                                             </button>
//                                         )
//                                     })}
//                                 </div>
//                             </div>
//                         )}

//                         {errorMessage && <div className="text-xs text-negative">Error message</div>}

//                         <div className="flex w-full flex-row items-center justify-end gap-3">
//                             <Button
//                                 onClick={() => {
//                                     handleToggleModal()
//                                 }}
//                                 variant="ghost"
//                                 className="text-xs"
//                             >
//                                 Cancel
//                             </Button>
//                             <Button
//                                 variant="primary"
//                                 disabled={!selectedType || !selectedValue || !selectedOperator}
//                                 onClick={() => {
//                                     setErrorMessage(undefined)
//                                     console.log({ selectedType, selectedValue, selectedOperator, tradeAmount })

//                                     if (!selectedType || !selectedValue || !selectedOperator) {
//                                         setErrorMessage('Please select a type, value and operator')
//                                         return
//                                     }

//                                     if (selectedType === 'trade' && !tradeAmount) return

//                                     props.handleAddStatement({
//                                         condition: props.statements.length < 1 ? 'if' : 'and',
//                                         type: selectedType,
//                                         value: selectedValue ?? '',
//                                         operator: selectedOperator,
//                                         amount: tradeAmount,
//                                     })
//                                     handleToggleModal()
//                                 }}
//                                 className="text-xs"
//                             >
//                                 Add
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </Modal>
//         )
//     }
// )

// CreateAgentModal.displayName = 'CreateAgentModal'

// export default CreateAgentModal
