// /* eslint-disable @typescript-eslint/no-unused-vars */
// 'use client'

// import MobileReturnButton from '@/components/MobileReturnButton'
// import StrategyModal from '@/components/modal/StrategyModal'
// import Spinner from '@/components/Spinner'
// import Tag from '@/components/Tag'
// import { presetAts } from '@/data/default/ats'

// import withAuth from '@/hoc/withAuth'
// import { useAtsExploreData } from '@/hooks/data/useAtsData'
// import React, { useEffect, useRef, useState } from 'react'
// // import { getReadableNumber } from '@/utils/price';
// // import { FaHeart } from 'react-icons/fa6';

// const ATSExplorePage = () => {
//     // const [setInitialStrategies] = useState<Strategy[]>([]);
//     const [filteredStrategies, setFilteredStrategies] = useState<Strategy[]>([])
//     const [presetStrategies] = useState([...presetAts])

//     const [searchInput, setSearchInput] = useState('')
//     const [selectedStrategy, setSelectedStrategy] = useState<undefined | PresetStrategy>(undefined)

//     const [page, setPage] = useState(1)
//     const [limit] = useState(12)
//     // Existing useEffect to load strategies, add this line within that block
//     const [totalPages, setTotalPages] = useState(1)

//     const handleNextPage = () => {
//         if (page < totalPages) setPage(page + 1)
//     }

//     const handlePreviousPage = () => {
//         if (page > 1) setPage(page - 1)
//     }

//     const { data, isLoading: isAtsExploreLoading } = useAtsExploreData(page, limit)

//     const addTriggerModal = useRef<{
//         toggleModal: (targetIndex?: number) => void
//     }>(null)

//     const handleToggleModal = () => {
//         if (addTriggerModal) addTriggerModal.current?.toggleModal()
//     }

//     useEffect(() => {
//         if (data) {
//             console.log({ data })
//             setTotalPages(data.pagination.totalPages ?? 1)
//             // setInitialStrategies(data.strategies);
//             setFilteredStrategies(data.strategies)
//         }
//     }, [data])

//     // useEffect(() => {
//     //   const filtered = presetAts.filter((strategy) =>
//     //     strategy.name.toLowerCase().includes(searchInput.toLowerCase()),
//     //   );
//     //   setFilteredStrategies(filtered);
//     // }, [searchInput]);

//     return (
//         <div className=" w-full flex-1 overflow-y-auto p-3">
//             <div className=" max-w-7xl mx-auto flex flex-col md:py-8 gap-3">
//                 <MobileReturnButton label="Explore Strategies" />
//                 <div className="hidden md:block text-white text-xl md:text-2xl font-bold leading-6">Explore Strategies</div>
//                 {/* <div className="flex gap-3">
//           <div className="relative w-full">
//             <input
//               onChange={(e) => setSearchInput(e.target.value)}
//               value={searchInput}
//               type="text"
//               className="w-full h-full rounded-lg px-3 py-2 focus:outline-none text-neutral-text bg-table-odd border  focus:border-border border-border text-base focus:bg-neutral-900"
//               placeholder="Search "
//             />
//           </div>
//         </div> */}

//                 <div className="flex flex-col w-full gap-2 mt-4">
//                     <div>Preset Strategy</div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                         {presetStrategies &&
//                             presetStrategies.length > 0 &&
//                             presetStrategies.map((agent, index) => {
//                                 return (
//                                     <button
//                                         disabled={!agent.enabled}
//                                         type="button"
//                                         onClick={() => {
//                                             setSelectedStrategy(agent)
//                                             handleToggleModal()
//                                         }}
//                                         key={index}
//                                         className="border overflow-hidden border-border rounded-lg flex flex-col gap-1 relative p-3 min-h-[100px] md:min-h-[160px] bg-table-odd hover:bg-neutral-900 apply-transition"
//                                     >
//                                         <div className="flex items-center gap-1">
//                                             <div className="text-sm text-left">{agent.name}</div>
//                                             {agent.isPopular && <Tag>POPULAR🔥</Tag>}
//                                         </div>
//                                         <div className="text-xs text-neutral-text-dark max-h-12 overflow-ellipsis text-left whitespace-normal">
//                                             {agent.description}
//                                         </div>

//                                         <div className="flex items-center mt-auto gap-3 justify-end w-full">
//                                             {/* <div className="flex items-center gap-1">
//                         <FaHeart className="text-neutral-text-dark text-xs" />
//                         <div className="text-xs">
//                           {getReadableNumber(
//                             agent.likes ?? 0,
//                             agent.likes ?? 0 > 1000 ? 1 : 0,
//                           )}
//                         </div>
//                       </div> */}
//                                             <div className="text-neutral-text-dark text-xs leading-none">by Crush</div>
//                                         </div>
//                                         {!agent.enabled && (
//                                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                                                 <span className=" rotate-[-8deg] font-black text-7xl text-white/5 uppercase">Coming Soon</span>
//                                             </div>
//                                         )}
//                                     </button>
//                                 )
//                             })}
//                     </div>
//                 </div>
//                 {/* <div className="flex flex-col w-full gap-2 mt-4">
//           <div>Community</div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//             {isAtsExploreLoading && (
//               <div className="col-span-full flex items-center justify-center">
//                 <Spinner />
//               </div>
//             )}
//             {!isAtsExploreLoading &&
//               filteredStrategies &&
//               filteredStrategies.length > 0 &&
//               filteredStrategies.map((agent, index) => {
//                 return (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setSelectedStrategy(agent);
//                       handleToggleModal();
//                     }}
//                     key={index}
//                     className="border border-border rounded-lg flex flex-col gap-1 relative p-3 min-h-[100px] md:min-h-[160px] bg-table-odd hover:bg-neutral-900 apply-transition"
//                   >
//                     <div className="text-base">{agent.name}</div>
//                     <div className="text-xs text-neutral-text-dark max-h-12 overflow-ellipsis text-left whitespace-normal">
//                       {agent.description}
//                     </div>

//                     <div className="flex items-center mt-auto gap-3 justify-end w-full">

//                       <div className="text-neutral-text-dark text-xs leading-none">
//                         by {agent.privyId.slice(-6)}
//                       </div>
//                     </div>
//                   </button>
//                 );
//               })}
//           </div>
//           <div className="flex justify-center mt-4  items-center text-xs">
//             <button
//               onClick={handlePreviousPage}
//               className="px-4 py-2 bg-table-odd hover:bg-neutral-900 border border-border rounded disabled:opacity-50"
//               disabled={page === 1}
//             >
//               Prev
//             </button>
//             <span className="mx-4 text-neutral-text-dark">
//               Page {page} of {totalPages}
//             </span>
//             <button
//               onClick={handleNextPage}
//               className="px-4 py-2 bg-table-odd hover:bg-neutral-900 border border-border rounded disabled:opacity-50"
//               disabled={page === totalPages}
//             >
//               Next
//             </button>
//           </div>
//         </div> */}
//             </div>

//             <StrategyModal strategy={selectedStrategy} ref={addTriggerModal}></StrategyModal>
//         </div>
//     )
// }

// export default withAuth(ATSExplorePage)
