// 'use client'

// import MobileReturnButton from '@/components/MobileReturnButton'
// import ConfirmationModal from '@/components/modal/ConfirmationModal'
// import Spinner from '@/components/Spinner'
// import StrategyLogs from '@/components/StrategyLogs'
// import TextLoading from '@/components/TextLoading'
// import ToggleButton from '@/components/ToggleButton'
// import { useMutateDeleteATS, useMutateToggleATS, useSingleAtsData } from '@/hooks/data/useAtsData'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import React, { useEffect, useRef, useState } from 'react'
// import { FaPencil, FaTrash } from 'react-icons/fa6'
// import { toast } from 'react-toastify'

// const ATSIndividualPage = ({
//     params,
// }: {
//     params: {
//         id: string
//     }
// }) => {
//     const router = useRouter()
//     const confirmationModalRef = useRef<{ toggleModal: () => void }>(null)
//     // const data = strategies.find((strategy) => strategy.id === params.id);
//     // const data = undefined;

//     const [status, setStatus] = useState(false)
//     const [isToggling, setIsToggling] = useState(false)
//     // const [status, setStatus] = useState(data?.enabled ?? false);

//     const { mutate: toggleAts, isSuccess: toggleAtsSuccess, isError: toggleAtsError } = useMutateToggleATS()

//     const { data: atsData, isLoading: atsDataIsLoading } = useSingleAtsData(params.id)

//     useEffect(() => {
//         if (atsData) {
//             console.log({ atsData })
//             setStatus(atsData.isRunning)
//         }
//     }, [atsData])

//     const { mutate: deleteAts, isSuccess: deleteAtsIsSuccess } = useMutateDeleteATS()

//     const handleDeleteStrategy = (id: string) => {
//         deleteAts({ strategyId: id })
//     }

//     const handleToggleStatus = async (newState: boolean) => {
//         if (isToggling === true) return
//         setIsToggling(true)
//         setStatus(newState)

//         toggleAts({ strategyId: params.id, newState: status })
//     }

//     useEffect(() => {
//         if (deleteAtsIsSuccess) {
//             toast.success('Automated trading strategy successfully deleted.', {
//                 autoClose: 10000,
//             })
//             router.push(`/ats`)

//             if (confirmationModalRef) confirmationModalRef.current?.toggleModal()
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [deleteAtsIsSuccess])

//     useEffect(() => {
//         if (toggleAtsSuccess === true) {
//             toast.success(`Automated trading strategy successfully ${status ? 'started' : 'stopped'}.`, {
//                 autoClose: 10000,
//             })
//             setIsToggling(false)
//         }

//         if (toggleAtsError === true) {
//             toast.error('Something went wrong, try again.')
//             setIsToggling(false)
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [toggleAtsSuccess, toggleAtsError])

//     return (
//         <div className=" w-full flex-1 max-h-full p-3 flex flex-col">
//             <div className=" max-w-3xl mx-auto flex flex-col md:py-8 gap-3 max-h-full w-full overflow-hidden flex-1">
//                 <MobileReturnButton label="Back" />
//                 <div className="flex flex-row md:flex-row md:items-center gap-6 justify-between w-full">
//                     <div className="text-white text-base md:textlg font-semibold leading-6  w-full">
//                         {atsData ? atsData.strategyName : <TextLoading className="w-2/3" />}
//                     </div>
//                     <div className="min-w-fit flex items-center gap-3">
//                         <div className="flex items-center gap-1">
//                             {atsDataIsLoading ? (
//                                 <>
//                                     <TextLoading className="w-24" />
//                                 </>
//                             ) : (
//                                 <div className="flex items-center gap-2 border-r border-border pr-2">
//                                     <div className=" text-neutral-text-dark text-xs">Off</div>

//                                     <ToggleButton isOn={status} onToggle={handleToggleStatus} disabled={isToggling} isLoading={isToggling} />

//                                     <div className=" text-neutral-text-dark text-xs">On</div>
//                                 </div>
//                             )}
//                         </div>

//                         <Link
//                             href={`/ats/${params.id}/edit`}
//                             className={`border border-border flex bg-table-odd rounded-lg w-8 h-8 min-w-8 min-h-8 items-center justify-center hover:bg-neutral-900  apply-transition hover:text-neutral-text text-neutral-text-dark `}
//                         >
//                             {atsDataIsLoading ? (
//                                 <>
//                                     <Spinner className={`text-neutral-600`} size={12} />
//                                 </>
//                             ) : (
//                                 <>
//                                     <FaPencil className="text-sm" />
//                                 </>
//                             )}
//                         </Link>
//                         <button
//                             type="button"
//                             onClick={() => {
//                                 confirmationModalRef.current?.toggleModal()
//                             }}
//                             className={`border border-border flex bg-table-odd rounded-lg w-8 h-8 min-w-8 min-h-8 items-center justify-center hover:bg-neutral-900  apply-transition hover:text-neutral-text text-neutral-text-dark `}
//                         >
//                             {atsDataIsLoading ? (
//                                 <>
//                                     <Spinner className={`text-neutral-600`} size={12} />
//                                 </>
//                             ) : (
//                                 <>
//                                     <FaTrash className="text-sm" />
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </div>
//                 <div className="text-xs md:text-sm">
//                     {atsData ? (
//                         atsData.description
//                     ) : (
//                         <div className="flex flex-col">
//                             <TextLoading className="w-1/2" />
//                             <TextLoading className="w-1/2" />
//                         </div>
//                     )}
//                 </div>

//                 <div className="max-h-full overflow-hidden border border-border rounded-lg h-full flex-1 mt-10">
//                     <div className="border-b border-border p-3 font-semibold">Logs</div>
//                     <StrategyLogs isLoading={atsDataIsLoading} atsData={atsData} />
//                 </div>
//             </div>

//             {atsData && (
//                 <ConfirmationModal
//                     header="Delete Strategy"
//                     content={` Are you sure you want to delete "${atsData.name}" strategy?`}
//                     type="danger"
//                     ref={confirmationModalRef}
//                     action={() => {
//                         handleDeleteStrategy(params.id)
//                     }}
//                 ></ConfirmationModal>
//             )}
//         </div>
//     )
// }

// export default ATSIndividualPage
