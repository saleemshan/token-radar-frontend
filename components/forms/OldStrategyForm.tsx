// import CreateAgentModal from '@/components/modal/CreateAgentModal'
// import { FaPlus, FaTrash } from 'react-icons/fa6'
// import React, { useEffect, useRef, useState } from 'react'
// import StatementText from '../StatementText'
// import { toast } from 'react-toastify'
// import Spinner from '../Spinner'
// import { useMutateCreateATS, useMutateUpdateATS } from '@/hooks/data/useAtsData'
// import ToggleButton from '../ToggleButton'
// import Input from '../Input'
// import Button from '../ui/Button'

// const StrategyForm = ({
//     strategy,
//     isEdit = false,
//     onFormDataUpdate = () => {},
//     handleCloseModal = () => {},
// }: {
//     strategy?: Strategy
//     isEdit?: boolean
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     onFormDataUpdate?: (data: any) => void
//     handleCloseModal?: () => void
// }) => {
//     // const router = useRouter()

//     const [isPublic] = useState(strategy?.isPublic ?? false)
//     const [isRunning, setIsRunning] = useState(strategy?.isRunning ?? true)
//     const [strategyName, setStrategyName] = useState(strategy?.strategyName ?? '')
//     const [description, setDescription] = useState(strategy?.description ?? '')
//     const [statements, setStatements] = useState<Statement[]>(strategy?.statements ? [...strategy?.statements] : [])
//     const [isProcessing, setIsProcessing] = useState(false)

//     const addTriggerModal = useRef<{
//         toggleModal: (targetIndex?: number) => void
//     }>(null)

//     useEffect(() => {
//         if (isEdit) return
//         onFormDataUpdate({
//             strategyName,
//             description,
//             statements,
//         })
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [strategyName, description, statements])

//     const { mutate: createAts, data: createAtsData, isSuccess: createAtsIsSuccess, isError: createAtsIsError } = useMutateCreateATS()

//     const { mutate: updateAts, data: updateAtsData, isSuccess: updateAtsIsSuccess, isError: updateAtsIsError } = useMutateUpdateATS()

//     const [targetIndex, setTargetIndex] = useState<number | undefined>()

//     const handleToggleModal = () => {
//         if (addTriggerModal) addTriggerModal.current?.toggleModal()
//     }

//     const handleAddStatement = (statement: Statement) => {
//         if (statement.type === 'trade') {
//             return setStatements([...statements, statement])
//         }

//         if (targetIndex !== undefined) {
//             return setStatements(prev => {
//                 const newStatements = [...prev]
//                 newStatements.splice(targetIndex + 1, 0, statement)
//                 return newStatements
//             })
//         } else {
//             return setStatements([...statements, statement])
//         }
//     }

//     const checkIfStatementGotTrade = (statements: Statement[]) => {
//         const tradeFound = statements.some(statement => statement.type === 'trade')
//         if (tradeFound) {
//             return true
//         }
//         return false
//     }

//     const handleSubmitForm = async () => {
//         if (isProcessing) return

//         //check if name, description, statements exist
//         if (!strategyName || !description || !statements.length) {
//             toast.error('Please fill in all the fields.')
//             return
//         }

//         setIsProcessing(true)
//         if (isEdit) {
//             updateAts({
//                 strategy: {
//                     strategyName,
//                     statements,
//                     strategyId: strategy?.strategyId,
//                     isPublic,
//                     isRunning,
//                     description,
//                 } as Strategy,
//             })
//         } else {
//             createAts({
//                 strategy: {
//                     strategyName,
//                     statements,
//                     isPublic,
//                     isRunning,
//                     description,
//                 } as Strategy,
//             })
//         }
//     }

//     useEffect(() => {
//         if (createAtsIsSuccess) {
//             setIsProcessing(false)
//             if (createAtsData && createAtsData.message && createAtsData.message.code === 0) {
//                 toast.success('Automated trading strategy successfully created.', {
//                     autoClose: 10000,
//                 })
//                 // console.log({ createAtsData })

//                 // const strategyId = createAtsData.message.data.strategyId
//                 // router.push(`/ats/${strategyId}`)
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

//             if (handleCloseModal) handleCloseModal()

//             // if (updateAtsData) {
//             //     const strategyId = updateAtsData.strategyId
//             //     router.push(`/ats/${strategyId}`)
//             // }
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

//     // const handleToggleIsPublic = async (newState: boolean) => {
//     //     setIsPublic(newState)
//     // }

//     useEffect(() => {
//         const localStoragePresetAts = localStorage.getItem('presetAts')

//         if (localStoragePresetAts) {
//             const localStoragePreset = JSON.parse(localStoragePresetAts) as PresetStrategy

//             setStrategyName(`${localStoragePreset.name} copy`)
//             setDescription(localStoragePreset.description)

//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             const statements =
//                 localStoragePreset &&
//                 localStoragePreset.extraInput &&
//                 localStoragePreset.extraInput.map(item => {
//                     return item.statement
//                 })

//             if (statements && statements.length > 0) {
//                 const mergedStatements = localStoragePreset.statements.map(statement => {
//                     const replacement = statements.find(localStatement => localStatement.type === statement.type)
//                     // Replace if found in localStorage, otherwise keep the existing
//                     return replacement ? replacement : statement
//                 })

//                 setStatements(mergedStatements)
//             }

//             localStorage.removeItem('presetAts')
//         }

//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [])

//     return (
//         <div className="flex flex-col gap-3">
//             <div className="flex flex-col w-full md:flex-row gap-3">
//                 <div className="flex flex-col gap-1 w-full">
//                     <div>Strategy Name</div>
//                     <Input onChange={e => setStrategyName(e.target.value)} value={strategyName} />
//                 </div>
//                 <div className="flex items-center gap-3">
//                     <div className="flex flex-col  gap-1 w-full">
//                         <div>Active</div>
//                         <div className="flex items-center gap-1">
//                             <span className="text-neutral-text-dark">Off</span>
//                             <ToggleButton
//                                 isOn={isRunning}
//                                 onToggle={() => {
//                                     setIsRunning(!isRunning)
//                                 }}
//                                 disabled={isProcessing}
//                                 isLoading={isProcessing}
//                             />
//                             <span className="text-neutral-text-dark">On</span>
//                         </div>
//                     </div>
//                     {/* <div className="flex flex-col gap-1  w-full">
//                         <div className="flex items-center gap-1">
//                             <div>Public</div>
//                             <Tooltip text="Display your strategy on the explore page and allow other to copy the strategy.">
//                                 <FaCircleInfo className="text-2xs text-neutral-text-dark" />
//                             </Tooltip>
//                         </div>

//                         <div className="flex items-center gap-1">
//                             <span className="text-neutral-text-dark">Off</span>
//                             <ToggleButton isOn={isPublic} onToggle={handleToggleIsPublic} />
//                             <span className="text-neutral-text-dark">On</span>
//                         </div>
//                     </div> */}
//                 </div>
//             </div>

//             <div className="flex flex-col gap-1 w-full">
//                 <div>Description</div>
//                 <textarea onChange={e => setDescription(e.target.value)} value={description} className="w-full h-full ats-input"></textarea>
//             </div>

//             <div className="flex flex-col w-full gap-1">
//                 <div>Statements</div>
//                 <div className="flex flex-col gap-3 relative overflow-hidden">
//                     <div className="w-[1px] h-full absolute inset-y-0 translate-x-1/2 right-1/2 bg-border"></div>
//                     {statements.length > 0 &&
//                         statements.map((statement, index) => {
//                             return (
//                                 <div className=" w-full flex flex-col gap-3" key={index}>
//                                     <div className="flex flex-col gap-1 border border-border rounded-lg w-full  uppercase relative bg-black">
//                                         <div className="flex items-center gap-3 h-12">
//                                             <div className="text-xs  bg-[#101010] border-r border-border w-20 text-center h-full flex items-center justify-center">
//                                                 {statement.type === 'alphaGroupCalls' && 'SOURCE'}
//                                                 {statement.type === 'exchangeListing' && 'SOURCE'}
//                                                 {statement.type === 'newsTrading' && 'SOURCE'}
//                                                 {statement.type === 'kolMentions' && 'SOURCE'}
//                                                 {statement.type === 'marketCap' && 'FILTER'}
//                                                 {statement.type === 'tokenChain' && 'FILTER'}
//                                                 {statement.type === 'sentiment' && 'FILTER'}
//                                                 {statement.type === 'keywords' && 'FILTER'}
//                                                 {statement.type === 'trade' && 'ACTION'}
//                                             </div>

//                                             <div className="flex items-center gap-2">
//                                                 <StatementText statement={statement}></StatementText>
//                                             </div>
//                                         </div>
//                                         <button
//                                             type="button"
//                                             onClick={() => {
//                                                 if (statement.condition === 'if') {
//                                                     return setStatements([])
//                                                 }
//                                                 return setStatements(statements.filter((_, i) => i !== index))
//                                             }}
//                                             className="absolute  right-4 top-1/2 -translate-y-1/2 text-neutral-text-dark hover:text-neutral-text"
//                                         >
//                                             <FaTrash className="text-2xs" />
//                                         </button>
//                                     </div>
//                                     {statements.length > 1 && statement.type !== 'trade' && (
//                                         <button
//                                             onClick={() => {
//                                                 setTargetIndex(index)
//                                                 handleToggleModal()
//                                             }}
//                                             type="button"
//                                             className={` size-6 rounded-md border border-border  items-center justify-center mx-auto  relative flex bg-black`}
//                                         >
//                                             <FaPlus className="text-2xs" />
//                                         </button>
//                                     )}
//                                 </div>
//                             )
//                         })}
//                 </div>
//             </div>

//             {!checkIfStatementGotTrade(statements) && (
//                 <Button
//                     className="text-xs"
//                     onClick={() => {
//                         setTargetIndex(undefined)
//                         handleToggleModal()
//                     }}
//                 >
//                     {`Add Statement`}
//                     {/* {`Add ${statements.length < 1 ? 'IF' : 'AND'} Statement`} */}
//                 </Button>
//             )}

//             <div className="flex w-full flex-row items-center justify-end gap-3">
//                 <Button
//                     onClick={() => {
//                         handleCloseModal()
//                     }}
//                     variant="ghost"
//                     className="text-xs"
//                 >
//                     Cancel
//                 </Button>
//                 <Button
//                     variant="primary"
//                     className="text-xs"
//                     onClick={handleSubmitForm}
//                     disabled={isProcessing || !(statements.length > 1 && checkIfStatementGotTrade(statements))}
//                 >
//                     <div>{`${isEdit ? 'Update' : 'Create'}`}</div>
//                     {isProcessing && <Spinner className="w-4 h-4" />}
//                 </Button>
//             </div>

//             <CreateAgentModal
//                 header={`${statements.length > 0 ? 'Add Action' : 'Add Trigger'}`}
//                 statements={statements}
//                 handleAddStatement={handleAddStatement}
//                 ref={addTriggerModal}
//             ></CreateAgentModal>
//         </div>
//     )
// }

// export default StrategyForm
